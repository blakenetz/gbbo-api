# GBBO API

Monorepo with a Cloudflare Workers API, a Next.js frontend, and a TypeScript scraper for Great British Bake Off recipes.

## Architecture

- **Frontend**: Next.js 16 (static export for Cloudflare Pages)
- **API**: Cloudflare Workers with TypeScript + Hono
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Scraper**: TypeScript/Node.js for data collection

## Prerequisites

- Node.js and npm (repo uses `npm@11`)
- Cloudflare CLI (for deployment): `npm install -g wrangler`

## Getting Started (local)

1. Install dependencies:
   - `npm install`

2. Build all packages:
   - `npm run build`

3. Start local development:
   - Frontend: `cd packages/frontend && npm run dev`
   - Workers API: `cd packages/api-workers && npm run dev`

## Deployment

### Automatic (GitHub Actions)

1. Add GitHub secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

2. Push to `feat/cloudflare-migration` branch to trigger deployment.

### Manual (CLI)

1. Create D1 database (once):

   ```bash
   cd packages/api-workers
   npx wrangler d1 create gbbo-db
   # Copy database_id into wrangler.toml
   ```

2. Apply schema and import data:

   ```bash
   npx wrangler d1 migrations apply gbbo-db --env production
   node scripts/export-data.js
   node scripts/import-data.js
   npx wrangler d1 execute gbbo-db --env production --file migrations/0002_import_data.sql
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

## Package Scripts

Root scripts (powered by Turborepo):

- `npm run build` — builds all packages
- `npm run dev` — runs dev servers (where applicable)
- `npm run start` — starts production servers
- `npm run lint` — lints all packages
- `npm run setup` — runs setup tasks

### Individual Packages

- **Frontend** (`packages/frontend`):
  - `npm run dev` — Next.js dev server
  - `npm run build` — Build for static export

- **API Workers** (`packages/api-workers`):
  - `npm run dev` — Local Workers dev
  - `npm run deploy` — Deploy to Cloudflare

- **Scraper** (`packages/scraper`):
  - `npm run scrape` — Run data scraper
  - `npm run setup` — Initialize database

## API Overview

Base URL (deployed): `https://gbbo-api.your-subdomain.workers.dev`

Routes:

- `/recipe`
  - `GET /recipe` — list recipes with filters: `q`, `difficulty` (1-3), `time` (minutes), `baker_ids`, `diet_ids`, `category_ids`, `bake_type_ids`
  - `GET /recipe/count` — total recipe count with same filters
  - `GET /recipe/{id}` — recipe by id
- `/baker`
  - `GET /baker` — list bakers (filter `q`)
  - `GET /baker/count` — baker count
  - `GET /baker/{id}` — baker by id
- `/diet`, `/category`, `/bake_type`
  - Each supports: `GET /` (list with `q`), `GET /count`, `GET /{id}`

## Cost Savings

Migrated from Railway ($5/month) to Cloudflare ($0-2/month):

| Service  | Old        | New          | Savings |
| -------- | ---------- | ------------ | ------- |
| Platform | Railway $5 | Workers $0-2 | $3-5    |
| Database | Included   | D1 Free      | $0      |
| Frontend | Included   | Pages Free   | $0      |

## Migration Status

✅ Frontend converted to static export
✅ Workers API implemented
✅ D1 database schema created
✅ GitHub Actions deployment configured
⏳ Final testing and production deployment
