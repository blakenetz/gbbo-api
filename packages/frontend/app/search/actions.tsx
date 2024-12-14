"use server";
import { Recipe, RecipeSearchParams } from "@/types";
import { API_URL } from "@/util";

export async function fetchRecipeByQuery(
  params: RecipeSearchParams
): Promise<Recipe[]> {
  const { baker_ids, diet_ids, ...initialParams } = params;
  const queryParams = new URLSearchParams(initialParams);

  if (baker_ids) {
    baker_ids.split(",").forEach((id) => queryParams.append("baker_ids", id));
  }
  if (diet_ids) {
    diet_ids.split(",").forEach((id) => queryParams.append("diet_ids", id));
  }

  const response = await fetch(`${API_URL}/recipe?${queryParams.toString()}`);

  return response.json();
}
