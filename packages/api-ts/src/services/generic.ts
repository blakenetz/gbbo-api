import { query } from "../db.js";

const TABLES = ["bakers", "diets", "categories", "bake_types"] as const;
export type TableName = (typeof TABLES)[number];

export async function getItems(
  table: TableName,
  q?: string
): Promise<{ id: number; name: string; img?: string; season?: number | null }[]> {
  const cols = table === "bakers" ? "id, name, img, season" : "id, name";
  let sql = `SELECT ${cols} FROM ${table}`;
  const params: unknown[] = [];
  if (q?.trim()) {
    sql += ` WHERE LOWER(name) LIKE LOWER($1)`;
    params.push(`%${q.trim()}%`);
  }
  sql += " ORDER BY id";
  const result = await query(sql, params);
  return result.rows as { id: number; name: string; img?: string; season?: number | null }[];
}

export async function getItemCount(table: TableName): Promise<number> {
  const result = await query<{ count: string }>(`SELECT COUNT(*)::int as count FROM ${table}`, []);
  return parseInt(result.rows[0]?.count ?? "0", 10);
}

export async function getItemById(
  table: TableName,
  id: number
): Promise<{ id: number; name: string; img?: string; season?: number | null } | null> {
  const cols = table === "bakers" ? "id, name, img, season" : "id, name";
  const result = await query<{ id: number; name: string; img?: string; season?: number | null }>(
    `SELECT ${cols} FROM ${table} WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}
