-- Main tables
CREATE TABLE IF NOT EXISTS bakers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    img TEXT NOT NULL,
    season INTEGER,
    UNIQUE(name, img)
);

CREATE TABLE IF NOT EXISTS diets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS bake_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    link TEXT NOT NULL UNIQUE,
    img TEXT NOT NULL,
    difficulty INTEGER,
    time INTEGER,
    baker_id INTEGER,
    FOREIGN KEY (baker_id) REFERENCES bakers(id)
);

-- Join tables
CREATE TABLE IF NOT EXISTS recipe_diets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    diet_id INTEGER NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (diet_id) REFERENCES diets(id),
    UNIQUE(recipe_id, diet_id)
);

CREATE TABLE IF NOT EXISTS recipe_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    UNIQUE(recipe_id, category_id)
);

CREATE TABLE IF NOT EXISTS recipe_bake_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    bake_type_id INTEGER NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (bake_type_id) REFERENCES bake_types(id),
    UNIQUE(recipe_id, bake_type_id)
);
