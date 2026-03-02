import { query } from "../db.js";

export interface RecipeFilters {
  q?: string;
  difficulty?: number;
  time?: number;
  baker_ids?: number[];
  diet_ids?: number[];
  category_ids?: number[];
  bake_type_ids?: number[];
  season?: number;
  limit?: number;
  skip?: number;
}

export interface BakerRow {
  id: number;
  name: string;
  img: string;
  season: number | null;
}

export interface DietRow {
  id: number;
  name: string;
}

export interface RecipeRow {
  id: number;
  title: string;
  link: string;
  img: string;
  difficulty: number | null;
  time: number | null;
  baker_id: number | null;
  baker: BakerRow | null;
  diets: DietRow[];
  categories: DietRow[];
  bake_types: DietRow[];
}

function buildRecipeWhereClause(filters: RecipeFilters): { sql: string; params: unknown[] } {
  const conditions: string[] = ["1=1"];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.q?.trim()) {
    conditions.push(`LOWER(r.title) LIKE LOWER($${idx})`);
    params.push(`%${filters.q.trim()}%`);
    idx++;
  }
  if (filters.difficulty != null && filters.difficulty >= 1 && filters.difficulty <= 3) {
    conditions.push(`r.difficulty = $${idx}`);
    params.push(filters.difficulty);
    idx++;
  }
  if (filters.time != null) {
    conditions.push(`r.time <= $${idx}`);
    params.push(filters.time);
    idx++;
  }
  if (filters.baker_ids?.length) {
    conditions.push(`r.baker_id = ANY($${idx}::int[])`);
    params.push(filters.baker_ids);
    idx++;
  }
  if (filters.season != null) {
    conditions.push(`b.season = $${idx}`);
    params.push(filters.season);
    idx++;
  }

  let joinSql = "LEFT JOIN bakers b ON b.id = r.baker_id";
  if (filters.diet_ids?.length) {
    joinSql += ` INNER JOIN recipe_diets rd_f ON rd_f.recipe_id = r.id AND rd_f.diet_id = ANY($${idx}::int[])`;
    params.push(filters.diet_ids);
    idx++;
  }
  if (filters.category_ids?.length) {
    joinSql += ` INNER JOIN recipe_categories rc_f ON rc_f.recipe_id = r.id AND rc_f.category_id = ANY($${idx}::int[])`;
    params.push(filters.category_ids);
    idx++;
  }
  if (filters.bake_type_ids?.length) {
    joinSql += ` INNER JOIN recipe_bake_types rbt_f ON rbt_f.recipe_id = r.id AND rbt_f.bake_type_id = ANY($${idx}::int[])`;
    params.push(filters.bake_type_ids);
    idx++;
  }

  const limit = Math.min(Math.max(1, filters.limit ?? 50), 100);
  const skip = Math.max(0, filters.skip ?? 0);
  params.push(limit, skip);

  const whereSql = conditions.join(" AND ");
  // Use subquery so multiple INNER JOINs don't duplicate rows; then fetch full recipe with relations
  const sql = `
    SELECT r.id, r.title, r.link, r.img, r.difficulty, r.time, r.baker_id,
      (SELECT json_build_object('id', b.id, 'name', b.name, 'img', b.img, 'season', b.season) FROM bakers b WHERE b.id = r.baker_id) as baker,
      (SELECT COALESCE(json_agg(json_build_object('id', d.id, 'name', d.name) ORDER BY d.id), '[]'::json) FROM recipe_diets rd JOIN diets d ON d.id = rd.diet_id WHERE rd.recipe_id = r.id) as diets,
      (SELECT COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name) ORDER BY c.id), '[]'::json) FROM recipe_categories rcat JOIN categories c ON c.id = rcat.category_id WHERE rcat.recipe_id = r.id) as categories,
      (SELECT COALESCE(json_agg(json_build_object('id', bt.id, 'name', bt.name) ORDER BY bt.id), '[]'::json) FROM recipe_bake_types rbt2 JOIN bake_types bt ON bt.id = rbt2.bake_type_id WHERE rbt2.recipe_id = r.id) as bake_types
    FROM (SELECT DISTINCT r.id FROM recipes r ${joinSql} WHERE ${whereSql} ORDER BY r.id LIMIT $${idx} OFFSET $${idx + 1}) sub
    JOIN recipes r ON r.id = sub.id
    ORDER BY r.id
  `;
  return { sql, params };
}

export async function getRecipes(filters: RecipeFilters): Promise<RecipeRow[]> {
  const { sql, params } = buildRecipeWhereClause(filters);
  const result = await query<{
    id: number;
    title: string;
    link: string;
    img: string;
    difficulty: number | null;
    time: number | null;
    baker_id: number | null;
    baker: BakerRow | null;
    diets: DietRow[];
    categories: DietRow[];
    bake_types: DietRow[];
  }>(sql, params);

  return result.rows.map((row) => ({
    ...row,
    diets: Array.isArray(row.diets) ? row.diets : [],
    categories: Array.isArray(row.categories) ? row.categories : [],
    bake_types: Array.isArray(row.bake_types) ? row.bake_types : [],
  }));
}

export async function getRecipeCount(filters: Omit<RecipeFilters, "limit" | "skip">): Promise<number> {
  const conditions: string[] = ["1=1"];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.q?.trim()) {
    conditions.push(`LOWER(r.title) LIKE LOWER($${idx})`);
    params.push(`%${filters.q.trim()}%`);
    idx++;
  }
  if (filters.difficulty != null && filters.difficulty >= 1 && filters.difficulty <= 3) {
    conditions.push(`r.difficulty = $${idx}`);
    params.push(filters.difficulty);
    idx++;
  }
  if (filters.time != null) {
    conditions.push(`r.time <= $${idx}`);
    params.push(filters.time);
    idx++;
  }
  if (filters.baker_ids?.length) {
    conditions.push(`r.baker_id = ANY($${idx}::int[])`);
    params.push(filters.baker_ids);
    idx++;
  }
  if (filters.season != null) {
    conditions.push(`b.season = $${idx}`);
    params.push(filters.season);
    idx++;
  }

  let joinSql = "LEFT JOIN bakers b ON b.id = r.baker_id";
  if (filters.diet_ids?.length) {
    joinSql += ` INNER JOIN recipe_diets rd_f ON rd_f.recipe_id = r.id AND rd_f.diet_id = ANY($${idx}::int[])`;
    params.push(filters.diet_ids);
    idx++;
  }
  if (filters.category_ids?.length) {
    joinSql += ` INNER JOIN recipe_categories rc_f ON rc_f.recipe_id = r.id AND rc_f.category_id = ANY($${idx}::int[])`;
    params.push(filters.category_ids);
    idx++;
  }
  if (filters.bake_type_ids?.length) {
    joinSql += ` INNER JOIN recipe_bake_types rbt_f ON rbt_f.recipe_id = r.id AND rbt_f.bake_type_id = ANY($${idx}::int[])`;
    params.push(filters.bake_type_ids);
    idx++;
  }

  const whereSql = conditions.join(" AND ");
  const sql = `SELECT COUNT(DISTINCT r.id)::int as c FROM recipes r ${joinSql} WHERE ${whereSql}`;
  const result = await query<{ c: number }>(sql, params);
  return result.rows[0]?.c ?? 0;
}

export async function getRecipeById(id: number): Promise<RecipeRow | null> {
  const sql = `
    SELECT r.id, r.title, r.link, r.img, r.difficulty, r.time, r.baker_id,
      (SELECT json_build_object('id', b.id, 'name', b.name, 'img', b.img, 'season', b.season) FROM bakers b WHERE b.id = r.baker_id) as baker,
      (SELECT COALESCE(json_agg(json_build_object('id', d.id, 'name', d.name) ORDER BY d.id), '[]'::json) FROM recipe_diets rd JOIN diets d ON d.id = rd.diet_id WHERE rd.recipe_id = r.id) as diets,
      (SELECT COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name) ORDER BY c.id), '[]'::json) FROM recipe_categories rcat JOIN categories c ON c.id = rcat.category_id WHERE rcat.recipe_id = r.id) as categories,
      (SELECT COALESCE(json_agg(json_build_object('id', bt.id, 'name', bt.name) ORDER BY bt.id), '[]'::json) FROM recipe_bake_types rbt2 JOIN bake_types bt ON bt.id = rbt2.bake_type_id WHERE rbt2.recipe_id = r.id) as bake_types
    FROM recipes r
    WHERE r.id = $1
    GROUP BY r.id
  `;
  const result = await query<{
    id: number;
    title: string;
    link: string;
    img: string;
    difficulty: number | null;
    time: number | null;
    baker_id: number | null;
    baker: BakerRow | null;
    diets: DietRow[];
    categories: DietRow[];
    bake_types: DietRow[];
  }>(sql, [id]);
  const row = result.rows[0];
  if (!row) return null;
  return {
    ...row,
    diets: Array.isArray(row.diets) ? row.diets : [],
    categories: Array.isArray(row.categories) ? row.categories : [],
    bake_types: Array.isArray(row.bake_types) ? row.bake_types : [],
  };
}
