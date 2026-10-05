import { Award, Cake, ChefHat, Clock, Gauge, Leaf, Tv, type LucideIcon } from "lucide-react";
import { difficulties } from "@/components/card/cardContent";
import { dietIcons } from "@/components/diet/diet";
import { getBakeTypeStyle, getCategoryStyle } from "@/components/taxonomy";
import type { Filters, SearchFilterKey } from "@/util/api";

export interface FilterOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  image?: string;
  /** Dropdown group, e.g. a baker's series. */
  group?: string;
  /** Chip text when the label alone is ambiguous, e.g. two bakers called Aaron. */
  chipLabel?: string;
}

export interface FilterDefinition {
  param: Exclude<SearchFilterKey, "q">;
  label: string;
  icon: LucideIcon;
  multiple: boolean;
  options: FilterOption[];
}

export interface ActiveFilter {
  param: SearchFilterKey;
  value: string;
  label: string;
}

const TIME_OPTIONS: FilterOption[] = [
  { value: "30", label: "Under 30 minutes" },
  { value: "60", label: "Under 1 hour" },
  { value: "120", label: "Under 2 hours" },
  { value: "180", label: "Under 3 hours" },
];

// The search page's filters, in toolbar order.
export function buildFilterDefinitions({ bakers, bakeTypes, categories, diets }: Filters): FilterDefinition[] {
  const seasons = [...new Set(bakers.flatMap(({ season }) => (season ? [season] : [])))].sort(
    (a, b) => b - a,
  );
  const bakerOptions = [...bakers]
    .sort((a, b) => (b.season ?? 0) - (a.season ?? 0) || a.name.localeCompare(b.name))
    .map((baker) => ({
      value: String(baker.id),
      label: baker.name,
      image: baker.img,
      group: baker.season ? `Series ${baker.season}` : "Judges & guests",
      chipLabel: baker.season ? `${baker.name} · Series ${baker.season}` : baker.name,
    }));

  return [
    {
      param: "bake_type_ids",
      label: "Bake type",
      icon: Cake,
      multiple: true,
      options: bakeTypes.map(({ id, name }) => ({
        value: String(id),
        label: name,
        icon: getBakeTypeStyle(name).icon,
      })),
    },
    {
      param: "category_ids",
      label: "Category",
      icon: Award,
      multiple: true,
      options: categories.map(({ id, name }) => ({
        value: String(id),
        label: name,
        icon: getCategoryStyle(name).icon,
      })),
    },
    {
      param: "diet_ids",
      label: "Diet",
      icon: Leaf,
      multiple: true,
      options: diets.map(({ id, name }) => ({
        value: String(id),
        label: name,
        icon: dietIcons[name]?.Icon,
      })),
    },
    {
      param: "difficulty",
      label: "Difficulty",
      icon: Gauge,
      multiple: false,
      // Difficulty is 1-based in the API.
      options: difficulties.map(({ label, icon }, i) => ({ value: String(i + 1), label, icon })),
    },
    { param: "time", label: "Time", icon: Clock, multiple: false, options: TIME_OPTIONS },
    { param: "baker_ids", label: "Baker", icon: ChefHat, multiple: true, options: bakerOptions },
    {
      param: "season",
      label: "Series",
      icon: Tv,
      multiple: false,
      options: seasons.map((season) => ({ value: String(season), label: `Series ${season}` })),
    },
  ];
}

export function getSelectedValues(searchParams: URLSearchParams, param: SearchFilterKey): string[] {
  return searchParams.get(param)?.split(",").filter(Boolean) ?? [];
}

// Every applied filter value with a human label, the text query first.
export function getActiveFilters(
  searchParams: URLSearchParams,
  definitions: FilterDefinition[],
): ActiveFilter[] {
  const q = searchParams.get("q");
  const active: ActiveFilter[] = q ? [{ param: "q", value: q, label: `“${q}”` }] : [];

  for (const { param, options } of definitions) {
    for (const value of getSelectedValues(searchParams, param)) {
      const option = options.find((candidate) => candidate.value === value);
      active.push({ param, value, label: option?.chipLabel ?? option?.label ?? value });
    }
  }
  return active;
}
