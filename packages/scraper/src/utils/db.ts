import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

// Mirror Python util.py get_db_file_path -> ../../gbbo.db
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../../gbbo.db");

export async function getDb() {
  try {
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    // Enable foreign key constraints
    await db.get("PRAGMA foreign_keys = ON");
    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

export async function runQuery(
  query: string,
  params: any[] = []
): Promise<{ lastID: number; changes: number }> {
  const db = await getDb();
  try {
    const result = await db.run(query, params);
    return {
      lastID: result.lastID ?? 0,
      changes: result.changes ?? 0,
    };
  } catch (error) {
    console.error(`Error running query: ${query}`, { error, params });
    throw error;
  } finally {
    await db.close();
  }
}

export async function getOne<T = any>(
  query: string,
  params: any[] = []
): Promise<T | undefined> {
  const db = await getDb();
  try {
    return await db.get<T>(query, params);
  } catch (error) {
    console.error(`Error in getOne: ${query}`, { error, params });
    throw error;
  } finally {
    await db.close();
  }
}

export async function getAll<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const db = await getDb();
  try {
    return await db.all<T[]>(query, params);
  } catch (error) {
    console.error(`Error in getAll: ${query}`, { error, params });
    throw error;
  } finally {
    await db.close();
  }
}

export async function initializeDatabase(dropAndRecreate = false) {
  const db = await getDb();
  try {
    // Enable WAL mode for better concurrency
    await db.exec("PRAGMA journal_mode = WAL");
    if (dropAndRecreate) {
      await db.exec(`
        DROP TABLE IF EXISTS recipe_diets;
        DROP TABLE IF EXISTS recipe_categories;
        DROP TABLE IF EXISTS recipe_bake_types;
        DROP TABLE IF EXISTS recipes;
        DROP TABLE IF EXISTS diets;
        DROP TABLE IF EXISTS categories;
        DROP TABLE IF EXISTS bake_types;
        DROP TABLE IF EXISTS bakers;
      `);
    }

    // Create tables if they don't exist (schema mirrors Python db-setup.py)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS bakers (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        img TEXT NOT NULL,
        season INTEGER,
        UNIQUE(name, img)
      );
      
      CREATE TABLE IF NOT EXISTS diets (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );
      
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );
      
      CREATE TABLE IF NOT EXISTS bake_types (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );
      
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY, 
        title TEXT NOT NULL, 
        link TEXT NOT NULL UNIQUE, 
        img TEXT NOT NULL, 
        difficulty INTEGER,
        time INTEGER, 
        baker_id INTEGER,
        FOREIGN KEY (baker_id) REFERENCES bakers(id)
      );
      
      CREATE TABLE IF NOT EXISTS recipe_diets (
        id INTEGER PRIMARY KEY,
        recipe_id INTEGER NOT NULL,
        diet_id INTEGER NOT NULL,
        FOREIGN KEY(recipe_id) REFERENCES recipes(id),
        FOREIGN KEY(diet_id) REFERENCES diets(id),
        UNIQUE(recipe_id, diet_id)
      );
      
      CREATE TABLE IF NOT EXISTS recipe_categories (
        id INTEGER PRIMARY KEY,
        recipe_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        FOREIGN KEY(recipe_id) REFERENCES recipes(id),
        FOREIGN KEY(category_id) REFERENCES categories(id),
        UNIQUE(recipe_id, category_id)
      );
      
      CREATE TABLE IF NOT EXISTS recipe_bake_types (
        id INTEGER PRIMARY KEY,
        recipe_id INTEGER NOT NULL,
        bake_type_id INTEGER NOT NULL,
        FOREIGN KEY(recipe_id) REFERENCES recipes(id),
        FOREIGN KEY(bake_type_id) REFERENCES bake_types(id),
        UNIQUE(recipe_id, bake_type_id)
      );
    `);

    console.info("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    await db.close();
  }
}
