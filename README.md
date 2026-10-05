# GBBO API

Monorepo with a Cloudflare Workers API, a Next.js frontend, and a TypeScript scraper for Great British Bake Off recipes.

Deployed @ <https://gbbo-frontend.pages.dev/>

## Architecture

- **Frontend**: Next.js 16 (static export for Cloudflare Pages)
- **API**: Cloudflare Workers with TypeScript + Hono
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Scraper**: TypeScript/Node.js for data collection

## Prerequisites

- Node.js `>=22.13.0`
- pnpm 12 (`npm install -g pnpm@12`, or see <https://pnpm.io/installation>). The repo pins its exact version in `package.json#packageManager`, and pnpm downloads that version automatically.
- Wrangler is installed in `packages/api-workers`; run it as `pnpm exec wrangler` from that directory (log in once with `pnpm exec wrangler login`)

pnpm's default supply-chain policy refuses dependency versions published less than 24 hours ago, so a brand-new release can only be installed the next day.

## Getting Started (local)

1. Install dependencies:
   - `pnpm install`

2. Build all packages:
   - `pnpm run build`

3. Start local development:
   - Frontend: `cd packages/frontend && pnpm run dev`
   - Workers API: `cd packages/api-workers && pnpm run dev`

## Deployment

### Automatic (GitHub Actions)

`.github/workflows/deploy.yml` checks and deploys both packages:

- **Quality checks first.** Every run starts with `pnpm run lint`, `pnpm run typecheck`, `pnpm run test` and `pnpm run build`. Nothing is migrated or deployed unless they pass. This job needs no secrets, so it also runs for pull requests from forks.
- **Push to `main` → production.** Applies D1 migrations to `gbbo-db`, deploys the `gbbo-api` worker, builds the frontend against that worker's URL, and deploys it to the `gbbo-frontend` Pages project (<https://gbbo-frontend.pages.dev/>).
- **Pull request → preview.** Runs the same steps against the `dev` environment: the `gbbo-db-dev` D1 database, the `gbbo-api-dev` worker, and a Pages branch preview (`https://<branch>.gbbo-frontend.pages.dev`). Both URLs are linked on the PR as the `preview` and `preview-api` deployments. Pull requests from forks get the quality checks but no preview, because they don't receive secrets.

Required GitHub secrets:

- `CLOUDFLARE_API_TOKEN` (needs edit access to Workers Scripts, D1 and Pages)
- `CLOUDFLARE_ACCOUNT_ID`

### Manual (CLI)

Wrangler's D1 commands target a local database unless you pass `--remote`.

1. Create the D1 databases (once):

   ```bash
   cd packages/api-workers
   pnpm exec wrangler d1 create gbbo-db       # production
   pnpm exec wrangler d1 create gbbo-db-dev   # previews
   # Copy each database_id into wrangler.toml (top level and [env.dev])
   ```

2. Apply the schema and data migrations:

   ```bash
   pnpm exec wrangler d1 migrations apply gbbo-db --remote
   pnpm exec wrangler d1 migrations apply gbbo-db-dev --remote --env dev
   ```

   `migrations/0002_import_data.sql` is generated from the scraper's `gbbo.db`: `node scripts/export-data.js && node scripts/import-data.js`.

3. Deploy:

   ```bash
   pnpm run deploy                       # production
   pnpm exec wrangler deploy --env dev   # preview API
   ```

## Package Scripts

Root scripts:

- `pnpm run build` — builds all packages
- `pnpm run dev` — runs dev servers (where applicable)
- `pnpm run start` — starts production servers
- `pnpm run lint` — lints the whole repo with [oxlint](https://oxc.rs/docs/guide/usage/linter) (config: `.oxlintrc.json`)
- `pnpm run typecheck` — type-checks every package (`tsc --noEmit`; the frontend runs `next typegen` first)
- `pnpm run test` — runs every package's [Vitest](https://vitest.dev) tests
- `pnpm run setup` — runs setup tasks

Tests by package:

- **API Workers** — integration tests run the worker in the Workers runtime against a local D1 database built from `migrations/` (via `@cloudflare/vitest-plugin`). Expected values come from SQL over that same database.
- **Frontend** — unit tests for search paging, URL updates and filter labels.
- **Scraper** — unit tests for reading publish dates from recipe pages' JSON-LD.

### Individual Packages

- **Frontend** (`packages/frontend`):
  - `pnpm run dev` — Next.js dev server
  - `pnpm run build` — Build for static export

- **API Workers** (`packages/api-workers`):
  - `pnpm run dev` — Local Workers dev
  - `pnpm run deploy` — Deploy to Cloudflare
  - `pnpm run d1:local` — Apply migrations to the local D1 database used by `pnpm run dev`

- **Scraper** (`packages/scraper`):
  - `pnpm run scrape` — Run data scraper
  - `pnpm run setup` — Initialize database

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
