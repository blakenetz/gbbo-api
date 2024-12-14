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

export interface BaseModel {
  id: number;
  name: string;
}

export interface Baker extends BaseModel {
  img: string;
}

export type Diet = BaseModel;
