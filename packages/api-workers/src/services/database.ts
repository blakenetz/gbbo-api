import type { Recipe, Baker, Diet, Category, BakeType, RecipeFilters, PaginationParams } from '../types'

export class DatabaseService {
  constructor(private db: D1Database) {}

  // Recipe queries
  async getRecipes(filters: RecipeFilters = {}, pagination: PaginationParams = {}): Promise<{ recipes: Recipe[], total: number }> {
    const { limit = 50, skip = 0 } = pagination
    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    // Build WHERE clause
    if (filters.q) {
      whereClause += ` AND LOWER(r.title) LIKE LOWER(?)`
      params.push(`%${filters.q}%`)
    }
    if (filters.difficulty) {
      whereClause += ` AND r.difficulty = ?`
      params.push(filters.difficulty)
    }
    if (filters.time) {
      whereClause += ` AND r.time <= ?`
      params.push(filters.time)
    }
    if (filters.season) {
      whereClause += ` AND b.season = ?`
      params.push(filters.season)
    }
    if (filters.baker_ids && filters.baker_ids.length > 0) {
      const placeholders = filters.baker_ids.map(() => '?').join(',')
      whereClause += ` AND r.baker_id IN (${placeholders})`
      params.push(...filters.baker_ids)
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM recipes r
      LEFT JOIN bakers b ON r.baker_id = b.id
      ${whereClause}
    `
    const countResult = await this.db.prepare(countQuery).bind(...params).first()
    const total = countResult?.count || 0

    // Get recipes with relationships
    const recipesQuery = `
      SELECT 
        r.id, r.title, r.link, r.img, r.difficulty, r.time, r.baker_id,
        b.id as baker_id, b.name as baker_name, b.img as baker_img, b.season as baker_season
      FROM recipes r
      LEFT JOIN bakers b ON r.baker_id = b.id
      ${whereClause}
      ORDER BY r.title
      LIMIT ? OFFSET ?
    `
    
    const recipesResult = await this.db.prepare(recipesQuery)
      .bind(...params, limit, skip)
      .all()

    const recipes = await Promise.all(
      recipesResult.results.map(async (row: any) => {
        const recipe: Recipe = {
          id: row.id,
          title: row.title,
          link: row.link,
          img: row.img,
          difficulty: row.difficulty,
          time: row.time,
          baker_id: row.baker_id
        }

        if (row.baker_id) {
          recipe.baker = {
            id: row.baker_id,
            name: row.baker_name,
            img: row.baker_img,
            season: row.baker_season
          }
        }

        // Get related data
        recipe.diets = await this.getRecipeDiets(row.id)
        recipe.categories = await this.getRecipeCategories(row.id)
        recipe.bake_types = await this.getRecipeBakeTypes(row.id)

        return recipe
      })
    )

    return { recipes, total }
  }

  async getRecipeById(id: number): Promise<Recipe | null> {
    const query = `
      SELECT 
        r.id, r.title, r.link, r.img, r.difficulty, r.time, r.baker_id,
        b.id as baker_id, b.name as baker_name, b.img as baker_img, b.season as baker_season
      FROM recipes r
      LEFT JOIN bakers b ON r.baker_id = b.id
      WHERE r.id = ?
    `
    
    const result = await this.db.prepare(query).bind(id).first()
    if (!result) return null

    const recipe: Recipe = {
      id: result.id,
      title: result.title,
      link: result.link,
      img: result.img,
      difficulty: result.difficulty,
      time: result.time,
      baker_id: result.baker_id
    }

    if (result.baker_id) {
      recipe.baker = {
        id: result.baker_id,
        name: result.baker_name,
        img: result.baker_img,
        season: result.baker_season
      }
    }

    recipe.diets = await this.getRecipeDiets(id)
    recipe.categories = await this.getRecipeCategories(id)
    recipe.bake_types = await this.getRecipeBakeTypes(id)

    return recipe
  }

  private async getRecipeDiets(recipeId: number): Promise<Diet[]> {
    const query = `
      SELECT d.id, d.name
      FROM diets d
      JOIN recipe_diets rd ON d.id = rd.diet_id
      WHERE rd.recipe_id = ?
    `
    const result = await this.db.prepare(query).bind(recipeId).all()
    return result.results as Diet[]
  }

  private async getRecipeCategories(recipeId: number): Promise<Category[]> {
    const query = `
      SELECT c.id, c.name
      FROM categories c
      JOIN recipe_categories rc ON c.id = rc.category_id
      WHERE rc.recipe_id = ?
    `
    const result = await this.db.prepare(query).bind(recipeId).all()
    return result.results as Category[]
  }

  private async getRecipeBakeTypes(recipeId: number): Promise<BakeType[]> {
    const query = `
      SELECT bt.id, bt.name
      FROM bake_types bt
      JOIN recipe_bake_types rbt ON bt.id = rbt.bake_type_id
      WHERE rbt.recipe_id = ?
    `
    const result = await this.db.prepare(query).bind(recipeId).all()
    return result.results as BakeType[]
  }

  // Generic queries for other entities
  async getItems<T>(table: string, search?: string): Promise<{ items: T[], total: number }> {
    let whereClause = ''
    const params: any[] = []

    if (search) {
      whereClause = 'WHERE LOWER(name) LIKE LOWER(?)'
      params.push(`%${search}%`)
    }

    const countQuery = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`
    const countResult = await this.db.prepare(countQuery).bind(...params).first()
    const total = countResult?.count || 0

    const itemsQuery = `SELECT * FROM ${table} ${whereClause} ORDER BY name`
    const itemsResult = await this.db.prepare(itemsQuery).bind(...params).all()

    return { items: itemsResult.results as T[], total }
  }

  async getItemById<T>(table: string, id: number): Promise<T | null> {
    const query = `SELECT * FROM ${table} WHERE id = ?`
    const result = await this.db.prepare(query).bind(id).first()
    return result as T || null
  }
}
