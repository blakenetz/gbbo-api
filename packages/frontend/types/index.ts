export interface Recipe {
  id: number;
  title: string;
  link: string;
  img: string;
  difficulty: number | null;
  time: number | null;
  baker: Baker | null;
  diets: Diet[];
  bake_types: BakeType[];
  categories: Category[];
}

type RecipeSearchParamsKeys =
  | "limit"
  | "skip"
  | "q"
  | "difficulty"
  | "time"
  | "baker_ids"
  | "diet_ids"
  | "category_ids"
  | "bake_type_ids"
  | "page";
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

export type BakeType = BaseModel;

export type Category = BaseModel;
