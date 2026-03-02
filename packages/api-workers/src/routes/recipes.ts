import { Hono } from 'hono'
import { DatabaseService } from '../services/database'
import type { Recipe, RecipeFilters, PaginationParams } from '../types'

const recipes = new Hono<{ Bindings: { DB: D1Database } }>()

recipes.get('/', async (c) => {
  const db = new DatabaseService(c.env.DB)
  
  const filters: RecipeFilters = {
    q: c.req.query('q'),
    difficulty: c.req.query('difficulty') ? parseInt(c.req.query('difficulty')!) : undefined,
    time: c.req.query('time') ? parseInt(c.req.query('time')!) : undefined,
    season: c.req.query('season') ? parseInt(c.req.query('season')!) : undefined,
    baker_ids: c.req.query('baker_ids')?.split(',').map(Number),
    diet_ids: c.req.query('diet_ids')?.split(',').map(Number),
    category_ids: c.req.query('category_ids')?.split(',').map(Number),
    bake_type_ids: c.req.query('bake_type_ids')?.split(',').map(Number),
  }

  const pagination: PaginationParams = {
    limit: c.req.query('limit') ? parseInt(c.req.query('limit')!) : 50,
    skip: c.req.query('skip') ? parseInt(c.req.query('skip')!) : 0,
  }

  const result = await db.getRecipes(filters, pagination)
  return c.json(result.recipes)
})

recipes.get('/count', async (c) => {
  const db = new DatabaseService(c.env.DB)
  
  const filters: RecipeFilters = {
    q: c.req.query('q'),
    difficulty: c.req.query('difficulty') ? parseInt(c.req.query('difficulty')!) : undefined,
    time: c.req.query('time') ? parseInt(c.req.query('time')!) : undefined,
    season: c.req.query('season') ? parseInt(c.req.query('season')!) : undefined,
    baker_ids: c.req.query('baker_ids')?.split(',').map(Number),
    diet_ids: c.req.query('diet_ids')?.split(',').map(Number),
    category_ids: c.req.query('category_ids')?.split(',').map(Number),
    bake_type_ids: c.req.query('bake_type_ids')?.split(',').map(Number),
  }

  const result = await db.getRecipes(filters, {})
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
