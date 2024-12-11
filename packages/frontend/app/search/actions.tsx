"use server";
import { Recipe, RecipeSearchParams } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchRecipeByQuery(
  params: RecipeSearchParams
): Promise<Recipe[]> {
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`${API_URL}/recipe?${queryParams.toString()}`);
  return response.json();
}
