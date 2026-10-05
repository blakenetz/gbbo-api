import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { planSync, SYNC_TABLES } from "./sync";

// The tables the sync reads, reduced to the columns these tests need.
const SCHEMA = `
  CREATE TABLE bakers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, img TEXT NOT NULL, season INTEGER);
  CREATE TABLE diets (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
  CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
  CREATE TABLE bake_types (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
  CREATE TABLE recipes (id INTEGER PRIMARY KEY, title TEXT NOT NULL, link TEXT NOT NULL UNIQUE,
    baker_id INTEGER REFERENCES bakers(id), published_at TEXT);
  CREATE TABLE recipe_diets (id INTEGER PRIMARY KEY, recipe_id INTEGER NOT NULL REFERENCES recipes(id),
    diet_id INTEGER NOT NULL REFERENCES diets(id));
  CREATE TABLE recipe_categories (id INTEGER PRIMARY KEY, recipe_id INTEGER NOT NULL, category_id INTEGER NOT NULL);
  CREATE TABLE recipe_bake_types (id INTEGER PRIMARY KEY, recipe_id INTEGER NOT NULL, bake_type_id INTEGER NOT NULL);
`;

const SEED = `
  INSERT INTO bakers VALUES (1, 'Prue Leith', 'prue.jpg', NULL);
  INSERT INTO diets VALUES (1, 'Vegetarian');
  INSERT INTO recipes VALUES (1, 'Prue Leith’s School Cake', 'https://gbbo/school-cake', 1, '2025-09-23T22:58:18.000Z');
  INSERT INTO recipe_diets VALUES (1, 1, 1);
`;

let dir: string;
const dbPath = (name: string) => path.join(dir, name);

async function exec(file: string, sql: string) {
  const db = await open({ filename: dbPath(file), driver: sqlite3.Database });
  try {
    await db.exec(sql);
  } finally {
    await db.close();
  }
}

async function query<T>(file: string, sql: string): Promise<T[]> {
  const db = await open({ filename: dbPath(file), driver: sqlite3.Database });
  try {
    return await db.all<T[]>(sql);
  } finally {
    await db.close();
  }
}

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "gbbo-sync-"));
  for (const file of ["before.db", "after.db"]) await exec(file, SCHEMA + SEED);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("planSync", () => {
  it("plans nothing when the databases match", async () => {
    const plan = await planSync(dbPath("before.db"), dbPath("after.db"));
    expect(plan.statements).toEqual([]);
    expect(plan.newRecipes).toEqual([]);
  });

  it("brings the old database up to date with new and changed rows", async () => {
    await exec(
      "after.db",
      `INSERT INTO bakers VALUES (2, 'Paul Hollywood', 'paul.jpg', NULL);
       INSERT INTO recipes VALUES (2, 'Paul Hollywood’s Iced Gems', 'https://gbbo/iced-gems', 2, NULL);
       INSERT INTO recipe_diets VALUES (2, 2, 1);
       UPDATE recipes SET published_at = '2025-09-24T00:00:00.000Z' WHERE id = 1;`,
    );

    const plan = await planSync(dbPath("before.db"), dbPath("after.db"));
    await exec("before.db", `PRAGMA foreign_keys = ON; ${plan.statements.join("\n")}`);

    for (const table of SYNC_TABLES) {
      const sql = `SELECT * FROM ${table} ORDER BY id`;
      expect(await query("before.db", sql), table).toEqual(await query("after.db", sql));
    }
    expect(plan.added).toMatchObject({ bakers: 1, recipes: 1, recipe_diets: 1 });
    expect(plan.updated).toMatchObject({ recipes: 1 });
    expect(plan.newRecipes).toEqual(["Paul Hollywood’s Iced Gems"]);
  });

  it("orders parent tables before the rows that reference them", async () => {
    await exec(
      "after.db",
      `INSERT INTO bakers VALUES (2, 'Paul Hollywood', 'paul.jpg', NULL);
       INSERT INTO recipes VALUES (2, 'Iced Gems', 'https://gbbo/iced-gems', 2, NULL);`,
    );
    const { statements } = await planSync(dbPath("before.db"), dbPath("after.db"));
    expect(statements.map((statement) => statement.split(" ")[2])).toEqual(["bakers", "recipes"]);
  });

  it("never deletes rows missing from the new scrape", async () => {
    await exec("after.db", "DELETE FROM recipe_diets; DELETE FROM recipes WHERE id = 1;");
    const plan = await planSync(dbPath("before.db"), dbPath("after.db"));
    expect(plan.statements).toEqual([]);
  });

  it("quotes text safely and keeps NULLs", async () => {
    await exec(
      "after.db",
      "INSERT INTO recipes VALUES (2, 'It''s a \"showstopper\"; DROP TABLE recipes', 'https://gbbo/x', NULL, NULL);",
    );
    const plan = await planSync(dbPath("before.db"), dbPath("after.db"));
    await exec("before.db", plan.statements.join("\n"));

    expect(await query("before.db", "SELECT title, baker_id FROM recipes WHERE id = 2")).toEqual([
      { title: 'It\'s a "showstopper"; DROP TABLE recipes', baker_id: null },
    ]);
  });
});
