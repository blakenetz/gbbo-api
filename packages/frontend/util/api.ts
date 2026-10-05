import type { BakeType, Baker, Category, Diet, Recipe } from "@/types";
import { API_URL } from "@/util";

export interface Filters {
  bakers: Baker[];
  diets: Diet[];
  bakeTypes: BakeType[];
  categories: Category[];
}

let filtersRequest: Promise<Filters> | undefined;

// Shared by the sidebar and page sections, so the taxonomy is requested once per page load.
export function fetchFilters(): Promise<Filters> {
  filtersRequest ??= loadFilters().catch((error: unknown) => {
    filtersRequest = undefined;
    throw error;
  });
  return filtersRequest;
}

async function loadFilters(): Promise<Filters> {
  const responses = await Promise.all([
    fetch(`${API_URL}/baker`),
    fetch(`${API_URL}/diet`),
    fetch(`${API_URL}/bake_type`),
    fetch(`${API_URL}/category`),
  ]);
  const [bakers, diets, bakeTypes, categories] = await Promise.all(
    responses.map((response) => response.json()),
  );
  return { bakers, diets, bakeTypes, categories };
}

export async function fetchRecipeCount(
  params: Record<string, string | number> = {},
): Promise<number> {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  );
  const response = await fetch(`${API_URL}/recipe/count?${query}`);
  const data: unknown = await response.json();
  return typeof data === "object" && data !== null && "count" in data && typeof data.count === "number"
    ? data.count
    : 0;
}

export async function fetchRecipes(params: Record<string, string | number>): Promise<Recipe[]> {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  );
  const response = await fetch(`${API_URL}/recipe?${query}`);
  return response.ok ? response.json() : [];
}
