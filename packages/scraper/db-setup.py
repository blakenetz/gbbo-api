import sqlite3
import os

from util import get_logger, get_db_file_path

logger = get_logger(__name__)
database_file = get_db_file_path()

logger.debug(f"Setting up database in {database_file}...")
con = sqlite3.connect(database_file)

logger.debug("Dropping tables...")

con.execute('DROP TABLE IF EXISTS recipe_diets;')
con.execute('DROP TABLE IF EXISTS recipes;')
con.execute('DROP TABLE IF EXISTS diets;')
con.execute('DROP TABLE IF EXISTS bakers;')

logger.debug("Creating tables...")

con.execute('''
            CREATE TABLE bakers 
            (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            img TEXT NOT NULL,
            UNIQUE(name, img)
            );''')

con.execute('''
            CREATE TABLE diets
            (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE
            );''')

con.execute('''
            CREATE TABLE recipes 
            (
            id INTEGER PRIMARY KEY, 
            title TEXT NOT NULL, 
            link TEXT NOT NULL UNIQUE, 
            img TEXT NOT NULL, 
            difficulty INTEGER,
            is_technical INTEGER NOT NULL,
            time int, 
            baker_id INTEGER,
            FOREIGN KEY (baker_id) REFERENCES bakers(id)
            );''')

con.execute(''' 
            CREATE TABLE recipe_diets
            (
            id INTEGER PRIMARY KEY,
            recipe_id INTEGER NOT NULL,
            diet_id INTEGER NOT NULL,
            FOREIGN KEY(recipe_id) REFERENCES recipes(id),
            FOREIGN KEY(diet_id) REFERENCES diets(id),
            UNIQUE(recipe_id, diet_id)
            );''')

logger.debug("Finished!")

