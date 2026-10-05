import type { BakeType, Baker, Category, Diet, Recipe } from "@/types";
import { API_URL, paginationAmount } from "@/util";

// URL query keys the search page understands besides `page`; each maps to an API filter.
export const SEARCH_FILTER_KEYS = [
  "q",
  "difficulty",
  "time",
  "season",
  "baker_ids",
  "diet_ids",
  "category_ids",
  "bake_type_ids",
] as const;

export type SearchFilterKey = (typeof SEARCH_FILTER_KEYS)[number];

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

// One page of search results for the search page's URL params, plus the total match count.
export async function fetchRecipePage(
  searchParams: URLSearchParams,
): Promise<{ recipes: Recipe[]; total: number }> {
  const filters: Record<string, string> = {};
  for (const key of SEARCH_FILTER_KEYS) {
    const value = searchParams.get(key);
    if (value) filters[key] = value;
  }
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [recipes, total] = await Promise.all([
    fetchRecipes({ ...filters, limit: paginationAmount, skip: (page - 1) * paginationAmount }),
    fetchRecipeCount(filters),
  ]);
  return { recipes, total };
}
