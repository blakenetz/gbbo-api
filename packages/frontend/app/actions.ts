"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchRandomRecipe(quantity: number = 3) {
  const response = await fetch(`${API_URL}/recipes?search=${query}`);
  return response.json();
}
