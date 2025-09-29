# GBBO API

Monorepo with a FastAPI backend, a Next.js frontend, and a TypeScript scraper for Great British Bake Off recipes.

## Prerequisites

- Node.js and npm (repo uses `npm@11`)
- Python 3.9
- Poetry (for Python deps)
- Optional: Docker and Docker Compose

## Getting Started (local)

1. Install dependencies at the root (also installs Python deps via postinstall):
   - `npm install`
   - `cd packages/api && poetry install`
2. Initialize the SQLite database (runs scraper setup):
   - `npm run setup`
3. Start dev servers (API on 8000, frontend on 3000):
   - `npm run dev`

Root scripts (powered by Turborepo):

- `npm run dev` — runs `dev` in all packages
- `npm run build` — builds all packages
- `npm run start` — starts all packages
- `npm run lint` — lints all packages
- `npm run setup` — runs setup tasks (e.g., DB init via scraper)

## Using Docker

You can run both services with Docker:

- `docker compose up --build`

Services/ports (see `docker-compose.yml`):

- API: http://localhost:8000
- Frontend: http://localhost:3000 (expects `NEXT_PUBLIC_API_URL=http://localhost:8000`)

## Packages

- `packages/api` — FastAPI app with SQLModel/SQLite
- `packages/frontend` — Next.js app (Mantine UI)
- `packages/scraper` — Python scraper and DB setup utilities

## API Overview

Base URL (local): `http://localhost:8000`

Routers and key routes:

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

CORS: frontend origin `http://localhost:3000` is allowed in dev.

## Scraper

From the root you can run via Turbo:

- Setup/DB init: `npm run setup`

Or directly in the scraper package:

- `cd packages/scraper`
- Initialize DB: `npm run setup`
- Scrape data: `npm run scrape`

## Configuration

- Database: SQLite (see API `db.py`). Docker compose sets `DATABASE_URL=sqlite:///./sql_app.db` for container runs.
- Frontend -> API URL: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000` in Docker compose).

## Project Layout

```
packages/
  api/        # FastAPI app
  frontend/   # Next.js app
  scraper/    # Python scraper & DB setup
```

## Development Notes

- Python version is pinned to 3.9 in Poetry configs.
- If ports are busy, adjust `docker-compose.yml` or package scripts.
