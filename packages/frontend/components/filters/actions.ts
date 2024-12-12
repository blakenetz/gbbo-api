"use server";
import { Diet, Baker } from "@/types";
import { API_URL } from "@/util";

export async function fetchFilters(): Promise<{
  bakers: Baker[];
  diets: Diet[];
}> {
  const responses = await Promise.all([
    fetch(`${API_URL}/baker`),
    fetch(`${API_URL}/diet`),
  ]);
  const [bakers, diets] = await Promise.all(
    responses.map((response) => response.json())
  );

  return { bakers, diets };
}
