import { env, exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import type { Recipe } from "../src/types";

async function get<T>(path: string): Promise<T> {
  const response = await exports.default.fetch(`http://api.test${path}`);
  expect(response.status, path).toBe(200);
  return response.json<T>();
}

const count = async (query: string) => (await get<{ count: number }>(`/recipe/count?${query}`)).count;
const list = (query: string) => get<Recipe[]>(`/recipe?${query}`);

// Expected values come from SQL over the same migrated database, so the tests
// stay valid when the recipe data is refreshed.
async function sqlCount(sql: string, ...params: number[]) {
  const row = await env.DB.prepare(sql).bind(...params).first<{ n: number }>();
  return row?.n ?? 0;
}

describe("recipe filters", () => {
  it("filters by bake type, category and diet", async () => {
    for (const [table, column, param] of [
      ["recipe_bake_types", "bake_type_id", "bake_type_ids"],
      ["recipe_categories", "category_id", "category_ids"],
      ["recipe_diets", "diet_id", "diet_ids"],
    ]) {
      const expected = await sqlCount(
        `SELECT COUNT(DISTINCT recipe_id) AS n FROM ${table} WHERE ${column} = ?`,
        1,
      );
      expect(await count(`${param}=1`), param).toBe(expected);
      expect(expected).toBeLessThan(await count(""));
    }
  });

  it("matches any of several values, whether repeated or comma-separated", async () => {
    const expected = await sqlCount(
      "SELECT COUNT(DISTINCT recipe_id) AS n FROM recipe_diets WHERE diet_id IN (?, ?)",
      1,
      2,
    );
    expect(await count("diet_ids=1&diet_ids=2")).toBe(expected);
    expect(await count("diet_ids=1,2")).toBe(expected);

    const recipes = await list("diet_ids=1,2&limit=1000");
    expect(recipes).toHaveLength(expected);
    expect(new Set(recipes.map(({ id }) => id)).size).toBe(expected);
    expect(recipes.every(({ diets }) => diets?.some(({ id }) => id === 1 || id === 2))).toBe(true);
  });

  it("requires every filter type to match", async () => {
    const recipes = await list("bake_type_ids=3&category_ids=3&limit=1000");
    expect(recipes.length).toBeGreaterThan(0);
    for (const recipe of recipes) {
      expect(recipe.bake_types?.map(({ id }) => id)).toContain(3);
      expect(recipe.categories?.map(({ id }) => id)).toContain(3);
    }
  });

  it("ignores ids that aren't numbers", async () => {
    expect(await count("diet_ids=abc")).toBe(await count(""));
  });
});

describe("recipe listing", () => {
  it("pages with limit and skip without overlap", async () => {
    const first = await list("limit=25&skip=0");
    const second = await list("limit=25&skip=25");
    expect(first).toHaveLength(25);
    expect(second).toHaveLength(25);
    const firstIds = new Set(first.map(({ id }) => id));
    expect(second.some(({ id }) => firstIds.has(id))).toBe(false);
  });

  it("sorts newest first with sort=recent", async () => {
    const dates = (await list("sort=recent&limit=50")).map(({ published_at }) => published_at ?? "");
    expect(dates).toEqual(dates.toSorted().toReversed());
  });

  it("sorts by title by default and for unknown sort values", async () => {
    for (const query of ["limit=50", "limit=50&sort=drop%20table"]) {
      const titles = (await list(query)).map(({ title }) => title);
      expect(titles, query).toEqual(titles.toSorted());
    }
  });
});

describe("recipe by id", () => {
  it("returns the recipe with its publish date", async () => {
    const recipe = await get<Recipe>("/recipe/1");
    expect(recipe.id).toBe(1);
    expect(recipe.published_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("rejects ids that aren't numbers and unknown ids", async () => {
    expect((await exports.default.fetch("http://api.test/recipe/abc")).status).toBe(400);
    expect((await exports.default.fetch("http://api.test/recipe/999999")).status).toBe(404);
  });
});
