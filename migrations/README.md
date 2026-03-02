# Database migrations (PostgreSQL)

Used for RDS Serverless (and any Postgres) deployment.

## Apply schema

After provisioning RDS Serverless PostgreSQL, run the initial schema:

```bash
psql "$DATABASE_URL" -f migrations/001_initial_schema.sql
```

Or from the project root:

```bash
psql "$DATABASE_URL" -f migrations/001_initial_schema.sql
```

## Seed data

**Option A – Scraper with Postgres**  
Use the scraper’s optional Postgres support: set `DATABASE_URL` to your RDS connection string and run setup + scrape (see main README and `packages/scraper`). This seeds RDS directly.

**Option B – Export from SQLite, then import**  
1. Build and run the app locally so you have a populated `gbbo.db`.  
2. Export data to CSV or SQL (e.g. using `sqlite3` or a one-off script).  
3. Import into Postgres (respecting foreign keys: bakers, diets, categories, bake_types first; then recipes; then recipe_diets, recipe_categories, recipe_bake_types).  
4. After bulk insert, update sequences:  
   `SELECT setval(pg_get_serial_sequence('bakers', 'id'), (SELECT MAX(id) FROM bakers));` (and similarly for other tables with SERIAL).

The TypeScript scraper can be extended to write to Postgres when `DATABASE_URL` is set (see plan step 5).
