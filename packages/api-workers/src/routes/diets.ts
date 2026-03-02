import { Hono } from 'hono'
import { DatabaseService } from '../services/database'

const diets = new Hono<{ Bindings: { DB: D1Database } }>()

diets.get('/', async (c) => {
  const db = new DatabaseService(c.env.DB)
  const search = c.req.query('q')
  const result = await db.getItems('diets', search)
  return c.json(result.items)
})

diets.get('/count', async (c) => {
  const db = new DatabaseService(c.env.DB)
  const result = await db.getItems('diets')
  return c.json({ count: result.total })
})

diets.get('/:id', async (c) => {
  const db = new DatabaseService(c.env.DB)
  const id = parseInt(c.req.param('id'))
  
  if (isNaN(id)) {
    return c.json({ error: 'Invalid diet ID' }, 400)
  }

  const diet = await db.getItemById('diets', id)
  if (!diet) {
    return c.json({ error: 'Diet not found' }, 404)
  }

  return c.json(diet)
})

export { diets }
