-- GBBO API – PostgreSQL schema for RDS Serverless
-- Mirrors SQLite schema from packages/scraper and packages/api (models.py).

-- Drop in reverse dependency order (for clean re-run)
DROP TABLE IF EXISTS recipe_diets;
DROP TABLE IF EXISTS recipe_categories;
DROP TABLE IF EXISTS recipe_bake_types;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS diets;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS bake_types;
DROP TABLE IF EXISTS bakers;

-- Main tables
CREATE TABLE bakers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  img TEXT NOT NULL,
  season INTEGER,
  UNIQUE(name, img)
);

CREATE TABLE diets (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE bake_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT NOT NULL UNIQUE,
  img TEXT NOT NULL,
  difficulty INTEGER,
  time INTEGER,
  baker_id INTEGER REFERENCES bakers(id)
);

CREATE TABLE recipe_diets (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id),
  diet_id INTEGER NOT NULL REFERENCES diets(id),
  UNIQUE(recipe_id, diet_id)
);

CREATE TABLE recipe_categories (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  UNIQUE(recipe_id, category_id)
);

CREATE TABLE recipe_bake_types (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id),
  bake_type_id INTEGER NOT NULL REFERENCES bake_types(id),
  UNIQUE(recipe_id, bake_type_id)
);

-- Indexes for common filters
CREATE INDEX idx_recipes_baker_id ON recipes(baker_id);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_time ON recipes(time);
CREATE INDEX idx_recipes_title_lower ON recipes(LOWER(title));
CREATE INDEX idx_recipe_diets_recipe_id ON recipe_diets(recipe_id);
CREATE INDEX idx_recipe_diets_diet_id ON recipe_diets(diet_id);
CREATE INDEX idx_recipe_categories_recipe_id ON recipe_categories(recipe_id);
CREATE INDEX idx_recipe_categories_category_id ON recipe_categories(category_id);
CREATE INDEX idx_recipe_bake_types_recipe_id ON recipe_bake_types(recipe_id);
CREATE INDEX idx_recipe_bake_types_bake_type_id ON recipe_bake_types(bake_type_id);
CREATE INDEX idx_bakers_season ON bakers(season);
