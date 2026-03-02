const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../migrations/data.json'), 'utf8'));

function generateInserts() {
  let sql = '';
  
  data.bakers.forEach(baker => {
    sql += `INSERT INTO bakers (id, name, img, season) VALUES (${baker.id}, '${baker.name.replace(/'/g, "''")}', '${baker.img}', ${baker.season || 'NULL'});\n`;
  });
  
  data.diets.forEach(diet => {
    sql += `INSERT INTO diets (id, name) VALUES (${diet.id}, '${diet.name.replace(/'/g, "''")}');\n`;
  });
  
  data.categories.forEach(category => {
    sql += `INSERT INTO categories (id, name) VALUES (${category.id}, '${category.name.replace(/'/g, "''")}');\n`;
  });
  
  data.bake_types.forEach(bakeType => {
    sql += `INSERT INTO bake_types (id, name) VALUES (${bakeType.id}, '${bakeType.name.replace(/'/g, "''")}');\n`;
  });
  
  data.recipes.forEach(recipe => {
    sql += `INSERT INTO recipes (id, title, link, img, difficulty, time, baker_id) VALUES (${recipe.id}, '${recipe.title.replace(/'/g, "''")}', '${recipe.link}', '${recipe.img}', ${recipe.difficulty || 'NULL'}, ${recipe.time || 'NULL'}, ${recipe.baker_id || 'NULL'});\n`;
  });
  
  data.recipe_diets.forEach(rd => {
    sql += `INSERT INTO recipe_diets (recipe_id, diet_id) VALUES (${rd.recipe_id}, ${rd.diet_id});\n`;
  });
  
  data.recipe_categories.forEach(rc => {
    sql += `INSERT INTO recipe_categories (recipe_id, category_id) VALUES (${rc.recipe_id}, ${rc.category_id});\n`;
  });
  
  data.recipe_bake_types.forEach(rbt => {
    sql += `INSERT INTO recipe_bake_types (recipe_id, bake_type_id) VALUES (${rbt.recipe_id}, ${rbt.bake_type_id});\n`;
  });
  
  return sql;
}

const sql = generateInserts();
fs.writeFileSync(path.join(__dirname, '../migrations/0002_import_data.sql'), sql);

console.log('Import SQL generated successfully!');
console.log('Run: wrangler d1 execute gbbo-db --file=./migrations/0002_import_data.sql');
