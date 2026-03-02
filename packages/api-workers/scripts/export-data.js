const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to your existing SQLite database
const dbPath = path.join(__dirname, '../../../gbbo.db');

const db = new sqlite3.Database(dbPath);

async function exportData() {
  return new Promise((resolve, reject) => {
    const exportData = {
      bakers: [],
      diets: [],
      categories: [],
      bake_types: [],
      recipes: [],
      recipe_diets: [],
      recipe_categories: [],
      recipe_bake_types: []
    };

    db.serialize(() => {
      // Export bakers
      db.all("SELECT * FROM bakers", (err, rows) => {
        if (err) return reject(err);
        exportData.bakers = rows;
      });

      // Export diets
      db.all("SELECT * FROM diets", (err, rows) => {
        if (err) return reject(err);
        exportData.diets = rows;
      });

      // Export categories
      db.all("SELECT * FROM categories", (err, rows) => {
        if (err) return reject(err);
        exportData.categories = rows;
      });

      // Export bake_types
      db.all("SELECT * FROM bake_types", (err, rows) => {
        if (err) return reject(err);
        exportData.bake_types = rows;
      });

      // Export recipes
      db.all("SELECT * FROM recipes", (err, rows) => {
        if (err) return reject(err);
        exportData.recipes = rows;
      });

      // Export join tables
      db.all("SELECT * FROM recipe_diets", (err, rows) => {
        if (err) return reject(err);
        exportData.recipe_diets = rows;
      });

      db.all("SELECT * FROM recipe_categories", (err, rows) => {
        if (err) return reject(err);
        exportData.recipe_categories = rows;
      });

      db.all("SELECT * FROM recipe_bake_types", (err, rows) => {
        if (err) return reject(err);
        exportData.recipe_bake_types = rows;
        
        // Write to file when all queries are done
        const fs = require('fs');
        fs.writeFileSync(
          path.join(__dirname, '../migrations/data.json'), 
          JSON.stringify(exportData, null, 2)
        );
        
        console.log('Data exported successfully!');
        console.log('Bakers:', exportData.bakers.length);
        console.log('Diets:', exportData.diets.length);
        console.log('Categories:', exportData.categories.length);
        console.log('Bake Types:', exportData.bake_types.length);
        console.log('Recipes:', exportData.recipes.length);
        
        resolve(exportData);
      });
    });
  });
}

exportData().catch(console.error);
