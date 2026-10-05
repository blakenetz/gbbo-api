import { Hono, type Context } from 'hono'
import { DatabaseService } from '../services/database'
import type { RecipeFilters, PaginationParams, RecipeSort } from '../types'

const recipes = new Hono<{ Bindings: { DB: D1Database } }>()

function parseNumber(value: string | undefined): number | undefined {
  const parsed = value === undefined ? NaN : parseInt(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

// Accepts repeated (`?diet_ids=1&diet_ids=2`) and comma-separated (`?diet_ids=1,2`) ids.
function parseIds(c: Context, key: string): number[] | undefined {
  const ids = (c.req.queries(key) ?? [])
    .flatMap((value) => value.split(','))
    .map(Number)
    .filter(Number.isInteger)
  return ids.length > 0 ? ids : undefined
}

function parseFilters(c: Context): RecipeFilters {
  return {
    q: c.req.query('q'),
    difficulty: parseNumber(c.req.query('difficulty')),
    time: parseNumber(c.req.query('time')),
    season: parseNumber(c.req.query('season')),
    baker_ids: parseIds(c, 'baker_ids'),
    diet_ids: parseIds(c, 'diet_ids'),
    category_ids: parseIds(c, 'category_ids'),
    bake_type_ids: parseIds(c, 'bake_type_ids'),
  }
}

recipes.get('/', async (c) => {
  const db = new DatabaseService(c.env.DB)
  const pagination: PaginationParams = {
    limit: parseNumber(c.req.query('limit')) ?? 50,
    skip: parseNumber(c.req.query('skip')) ?? 0,
  }

  const sort: RecipeSort = c.req.query('sort') === 'recent' ? 'recent' : 'title'
  const result = await db.getRecipes(parseFilters(c), pagination, sort)
  return c.json(result.recipes)
})

recipes.get('/count', async (c) => {
  const db = new DatabaseService(c.env.DB)
  const result = await db.getRecipes(parseFilters(c), {})
  return c.json({ count: result.total })
})

recipes.get('/:id', async (c) => {
  const db = new DatabaseService(c.env.DB)
  const id = parseInt(c.req.param('id'))
  
  if (isNaN(id)) {
    return c.json({ error: 'Invalid recipe ID' }, 400)
  }

  const recipe = await db.getRecipeById(id)
  if (!recipe) {
    return c.json({ error: 'Recipe not found' }, 404)
  }

  return c.json(recipe)
})

export { recipes }
