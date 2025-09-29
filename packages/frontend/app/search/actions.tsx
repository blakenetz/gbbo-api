"use server";
import { Recipe, RecipeSearchParams } from "@/types";
import { API_URL, cacheConfig, paginationAmount } from "@/util";
import { Diet, Baker, BakeType, Category } from "@/types";
import { redirect } from "next/navigation";

export async function fetchFilters(): Promise<{
  bakers: Baker[];
  diets: Diet[];
  bakeTypes: BakeType[];
  categories: Category[];
}> {
  const responses = await Promise.all([
    fetch(`${API_URL}/baker`, cacheConfig),
    fetch(`${API_URL}/diet`, cacheConfig),
    fetch(`${API_URL}/bake_type`, cacheConfig),
    fetch(`${API_URL}/category`, cacheConfig),
  ]);

  const [bakers, diets, bakeTypes, categories] = await Promise.all(
    responses.map((response) => response.json())
  );

  return { bakers, diets, bakeTypes, categories };
}

export async function submitFilters(formData: FormData) {
  const q = formData.get("q") as string;
  const difficulty = formData.get("difficulty") as string;
  const time = formData.get("time") as string;
  const season = formData.get("season") as string;
  const bakers = formData.get("bakers") as string;
  const diets = formData.getAll("diets") as string[];
  const bakeTypes = formData.getAll("bake_types") as string[];
  const categories = formData.getAll("categories") as string[];

  const searchParams = new URLSearchParams();

  if (q) searchParams.append("q", q);
  if (difficulty) searchParams.append("difficulty", difficulty);
  if (time && time !== "0") searchParams.append("time", time);
  if (season) searchParams.append("season", season);
  if (bakers) searchParams.append("baker_ids", bakers);
  if (diets.length > 0) searchParams.append("diet_ids", diets.join(","));
  if (bakeTypes.length > 0)
    searchParams.append("bake_type_ids", bakeTypes.join(","));
  if (categories.length > 0)
    searchParams.append("category_ids", categories.join(","));

  if (searchParams.size > 0) {
    redirect(`/search?${searchParams.toString()}`);
  }
}

export async function fetchRecipeByQuery(
  params: RecipeSearchParams
): Promise<{ recipes: Recipe[]; total: number }> {
  const {
    baker_ids,
    diet_ids,
    bake_type_ids,
    category_ids,
    page,
    ...initialParams
  } = params;
  const queryParams = new URLSearchParams(initialParams);

  const limit = Number(page ?? 1) * paginationAmount;
  const skip = limit - paginationAmount;

  queryParams.set("limit", limit.toString());
  queryParams.set("skip", skip.toString());

  Object.entries({ baker_ids, diet_ids, bake_type_ids, category_ids }).forEach(
    ([key, value]) => {
      if (value) {
        value.split(",").forEach((id) => queryParams.append(key, id));
      }
    }
  );

  const responses = await Promise.all([
    fetch(`${API_URL}/recipe?${queryParams.toString()}`),
    fetch(`${API_URL}/recipe/count?${queryParams.toString()}`),
  ]);

  const [recipes, total] = await Promise.all(responses.map((r) => r.json()));

  return { recipes, total };
}
