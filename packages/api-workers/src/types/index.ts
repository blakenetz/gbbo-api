export interface Recipe {
  id: number
  title: string
  link: string
  img: string
  difficulty?: number
  time?: number
  baker_id?: number
  baker?: Baker
  diets?: Diet[]
  categories?: Category[]
  bake_types?: BakeType[]
}

export interface Baker {
  id: number
  name: string
  img: string
  season?: number
  recipes?: Recipe[]
}

export interface Diet {
  id: number
  name: string
  recipes?: Recipe[]
}

export interface Category {
  id: number
  name: string
  recipes?: Recipe[]
}

export interface BakeType {
  id: number
  name: string
  recipes?: Recipe[]
}

export interface RecipeFilters {
  q?: string
  difficulty?: number
  time?: number
  baker_ids?: number[]
  diet_ids?: number[]
  category_ids?: number[]
  bake_type_ids?: number[]
  season?: number
}

export interface PaginationParams {
  limit?: number
  skip?: number
}
