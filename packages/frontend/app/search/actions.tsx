"use server";
import { Recipe, RecipeSearchParams } from "@/types";
import { API_URL } from "@/util";

export async function fetchRecipeByQuery(
  params: RecipeSearchParams
): Promise<Recipe[]> {
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`${API_URL}/recipe?${queryParams.toString()}`);
  return response.json();
}
