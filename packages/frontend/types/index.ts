export interface Recipe {
  id: number;
  title: string;
  link: string;
  img: string;
  difficulty: number | null;
  is_technical: boolean;
  time: number | null;
  baker: Baker | null;
  diet: Diet[];
}

type RecipeSearchParamsKeys =
  | "limit"
  | "skip"
  | "q"
  | "difficulty"
  | "is_technical"
  | "time"
  | "baker_ids"
  | "diet_ids";

export type RecipeSearchParams = Partial<
  Record<RecipeSearchParamsKeys, string>
>;

export interface Baker {
  id: number;
  name: string;
  img: string;
}

export interface Diet {
  id: number;
  name: string;
}
