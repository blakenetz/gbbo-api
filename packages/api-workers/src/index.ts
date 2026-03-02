import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { recipes } from './routes/recipes'
import { bakers } from './routes/bakers'
import { diets } from './routes/diets'
import { categories } from './routes/categories'
import { bakeTypes } from './routes/bake-types'

type Bindings = {
  DB: D1Database
  ENVIRONMENT: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://gbbo.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.get('/', (c) => {
  return c.json({ 
    message: 'GBBO Recipe API',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT
  })
})

app.route('/recipe', recipes)
app.route('/baker', bakers)
app.route('/diet', diets)
app.route('/category', categories)
app.route('/bake_type', bakeTypes)

export default app
