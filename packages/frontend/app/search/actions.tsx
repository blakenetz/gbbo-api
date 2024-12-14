"use server";
import { Recipe, RecipeSearchParams } from "@/types";
import { API_URL } from "@/util";

export async function fetchRecipeByQuery(
  params: RecipeSearchParams
): Promise<Recipe[]> {
  const { baker_ids, diet_ids, bake_type_ids, category_ids, ...initialParams } =
    params;
  const queryParams = new URLSearchParams(initialParams);

  Object.entries({ baker_ids, diet_ids, bake_type_ids, category_ids }).forEach(
    ([key, value]) => {
      if (value) {
        value.split(",").forEach((id) => queryParams.append(key, id));
      }
    }
  );

  const response = await fetch(`${API_URL}/recipe?${queryParams.toString()}`);

  return response.json();
}
