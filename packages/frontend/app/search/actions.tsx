"use server";
import { Recipe, RecipeSearchParams } from "@/types";
import { API_URL, paginationAmount } from "@/util";

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
