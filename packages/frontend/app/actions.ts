import { API_URL } from "@/util";

export async function fetchRandomRecipe(quantity: number = 3) {
  const response = await fetch(`${API_URL}/recipe/count`);
  const max = await response.json();

  return Promise.all(
    Array.from({ length: quantity }, async () => {
      const id = Math.floor(Math.random() * max);
      const response = await fetch(`${API_URL}/recipe/${id}`);
      return response.json();
    })
  );
}
