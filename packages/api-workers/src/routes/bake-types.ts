import { Hono } from 'hono'
import { DatabaseService } from '../services/database'

const bakeTypes = new Hono<{ Bindings: { DB: D1Database } }>()

bakeTypes.get('/', async (c) => {
  const db = new DatabaseService(c.env.DB)
  const search = c.req.query('q')
  const result = await db.getItems('bake_types', search)
  return c.json(result.items)
})

bakeTypes.get('/count', async (c) => {
  const db = new DatabaseService(c.env.DB)
  const result = await db.getItems('bake_types')
  return c.json({ count: result.total })
})

bakeTypes.get('/:id', async (c) => {
  const db = new DatabaseService(c.env.DB)
  const id = parseInt(c.req.param('id'))
  
  if (isNaN(id)) {
    return c.json({ error: 'Invalid bake type ID' }, 400)
  }

  const bakeType = await db.getItemById('bake_types', id)
  if (!bakeType) {
    return c.json({ error: 'Bake type not found' }, 404)
  }

  return c.json(bakeType)
})

export { bakeTypes }
