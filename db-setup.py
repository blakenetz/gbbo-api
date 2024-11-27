import sqlite3

con = sqlite3.connect("gbbo.db")

con.execute('DROP TABLE IF EXISTS recipe_diets;')
con.execute('DROP TABLE IF EXISTS recipes;')
con.execute('DROP TABLE IF EXISTS diets;')
con.execute('DROP TABLE IF EXISTS bakers;')

con.execute('''
            CREATE TABLE bakers 
            (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            img TEXT NOT NULL,
            UNIQUE(name, img)
            );''')

con.execute('''
            CREATE TABLE diets
            (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
            );''')

con.execute('''
            CREATE TABLE recipes 
            (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            title TEXT NOT NULL, 
            link TEXT NOT NULL UNIQUE, 
            img TEXT NOT NULL, 
            difficulty INTEGER NOT NULL,
            is_technical INTEGER NOT NULL,
            time TEXT, 
            baker_id INTEGER NOT NULL,
            FOREIGN KEY (baker_id) REFERENCES bakers(id)
            );''')

con.execute(''' 
            CREATE TABLE recipe_diets
            (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipe_id INTEGER NOT NULL,
            diet_id INTEGER NOT NULL,
            FOREIGN KEY(recipe_id) REFERENCES recipes(id),
            FOREIGN KEY(diet_id) REFERENCES diets(id),
            UNIQUE(recipe_id, diet_id)
            );''')


