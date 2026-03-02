import { Hono } from 'hono'
import { DatabaseService } from '../services/database'

const categories = new Hono<{ Bindings: { DB: D1Database } }>()

categories.get('/', async (c) => {
  const db = new DatabaseService(c.env.DB)
  const search = c.req.query('q')
  const result = await db.getItems('categories', search)
  return c.json(result.items)
})

categories.get('/count', async (c) => {
  const db = new DatabaseService(c.env.DB)
  const result = await db.getItems('categories')
  return c.json({ count: result.total })
})

categories.get('/:id', async (c) => {
  const db = new DatabaseService(c.env.DB)
  const id = parseInt(c.req.param('id'))
  
  if (isNaN(id)) {
    return c.json({ error: 'Invalid category ID' }, 400)
  }

  const category = await db.getItemById('categories', id)
  if (!category) {
    return c.json({ error: 'Category not found' }, 404)
  }

  return c.json(category)
})

export { categories }
