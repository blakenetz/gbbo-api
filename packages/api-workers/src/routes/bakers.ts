import { Hono } from 'hono'
import { DatabaseService } from '../services/database'

const bakers = new Hono<{ Bindings: { DB: D1Database } }>()

bakers.get('/', async (c) => {
  const db = new DatabaseService(c.env.DB)
  const search = c.req.query('q')
  const result = await db.getItems('bakers', search)
  return c.json(result.items)
})

bakers.get('/count', async (c) => {
  const db = new DatabaseService(c.env.DB)
  const result = await db.getItems('bakers')
  return c.json({ count: result.total })
})

bakers.get('/:id', async (c) => {
  const db = new DatabaseService(c.env.DB)
  const id = parseInt(c.req.param('id'))
  
  if (isNaN(id)) {
    return c.json({ error: 'Invalid baker ID' }, 400)
  }

  const baker = await db.getItemById('bakers', id)
  if (!baker) {
    return c.json({ error: 'Baker not found' }, 404)
  }

  return c.json(baker)
})

export { bakers }
