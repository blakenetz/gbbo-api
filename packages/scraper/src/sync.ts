import { writeFile } from "node:fs/promises";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

// Parents before children, so foreign keys hold when the statements run in order.
export const SYNC_TABLES = [
  "bakers",
  "diets",
  "categories",
  "bake_types",
  "recipes",
  "recipe_diets",
  "recipe_categories",
  "recipe_bake_types",
] as const;

type Value = string | number | null;
type Row = Record<string, Value>;

export interface SyncPlan {
  statements: string[];
  added: Record<string, number>;
  updated: Record<string, number>;
  newRecipes: string[];
}

export function sqlLiteral(value: Value): string {
  if (value === null) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${value.replaceAll("'", "''")}'`;
}

function upsert(table: string, row: Row): string {
  const columns = Object.keys(row);
  const values = columns.map((column) => sqlLiteral(row[column]));
  const updates = columns
    .filter((column) => column !== "id")
    .map((column) => `${column} = excluded.${column}`);
  return `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")}) ON CONFLICT(id) DO UPDATE SET ${updates.join(", ")};`;
}

async function readRows(path: string, table: string): Promise<Row[]> {
  const db = await open({ filename: path, driver: sqlite3.Database, mode: sqlite3.OPEN_READONLY });
  try {
    return await db.all<Row[]>(`SELECT * FROM ${table} ORDER BY id`);
  } finally {
    await db.close();
  }
}

// SQL that brings a database matching `beforePath` up to date with `afterPath`: one
// upsert per new or changed row, keyed by id. Rows are never deleted, so a partial
// scrape can't remove data.
export async function planSync(beforePath: string, afterPath: string): Promise<SyncPlan> {
  const plan: SyncPlan = { statements: [], added: {}, updated: {}, newRecipes: [] };

  for (const table of SYNC_TABLES) {
    const before = new Map((await readRows(beforePath, table)).map((row) => [row.id, row]));
    plan.added[table] = 0;
    plan.updated[table] = 0;

    for (const row of await readRows(afterPath, table)) {
      const previous = before.get(row.id);
      if (previous && Object.keys(row).every((column) => previous[column] === row[column])) continue;

      plan.statements.push(upsert(table, row));
      if (previous) {
        plan.updated[table]++;
      } else {
        plan.added[table]++;
        if (table === "recipes") plan.newRecipes.push(String(row.title));
      }
    }
  }
  return plan;
}

// Markdown summary for logs and the GitHub Actions job summary.
export function summarize(plan: SyncPlan): string {
  if (plan.statements.length === 0) return "No changes: the database is up to date.\n";

  const lines = ["| Table | Added | Updated |", "| --- | --- | --- |"];
  for (const table of SYNC_TABLES) {
    if (plan.added[table] || plan.updated[table]) {
      lines.push(`| ${table} | ${plan.added[table]} | ${plan.updated[table]} |`);
    }
  }
  if (plan.newRecipes.length > 0) {
    lines.push("", "New recipes:", ...plan.newRecipes.map((title) => `- ${title}`));
  }
  return `${lines.join("\n")}\n`;
}

// Usage: ts-node src/sync.ts <before.db> <after.db> <out.sql>
// Writes the upserts to <out.sql> (empty when nothing changed) and prints a summary.
async function main([beforePath, afterPath, outPath]: string[]) {
  if (!beforePath || !afterPath || !outPath) {
    throw new Error("Usage: sync <before.db> <after.db> <out.sql>");
  }
  const plan = await planSync(beforePath, afterPath);
  await writeFile(outPath, plan.statements.map((statement) => `${statement}\n`).join(""));
  process.stdout.write(summarize(plan));
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
