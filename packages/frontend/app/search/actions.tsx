"use server";
import { Recipe, RecipeSearchParams } from "@/types";
import { API_URL } from "@/util";

const recipesPerPage = 25;

export async function fetchRecipeByQuery(
  params: RecipeSearchParams
): Promise<{ recipes: Recipe[]; total: number }> {
  const { baker_ids, diet_ids, bake_type_ids, category_ids, ...initialParams } =
    params;
  const queryParams = new URLSearchParams(initialParams);
  queryParams.set("limit", recipesPerPage.toString());
  queryParams.set("skip", "0");

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
