"use server";
import { Recipe } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchRecipeByQuery(q: string): Promise<Recipe[]> {
  const response = await fetch(`${API_URL}/recipe?q=${q}`);
  return response.json();
}
