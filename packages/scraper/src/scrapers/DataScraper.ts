import RecipeScraper from "./RecipeScraper";
import { ScrapedItem } from "../types";
import { getOne, runQuery } from "../utils/db";

export default class DataScraper extends RecipeScraper {
  private model: "categories" | "bake_types" | "diets";
  private value: string;
  private param: string; // query param name in URL
  private fk: string; // foreign key name for junction table

  constructor(
    model: "categories" | "bake_types" | "diets",
    value: string,
    param?: string
  ) {
    super();
    this.model = model;
    this.value = value;
    this.param = param || model;
    this.fk = param ? `${param}_id` : `${model.replace(/s$/, "")}_id`;
  }

  protected override generatePageUrl(pageNumber: number): string {
    return `${this.baseUrl}/page/${pageNumber}?${
      this.param
    }=${encodeURIComponent(this.value)}`;
  }

  protected override async saveToDatabase(items: ScrapedItem[]): Promise<void> {
    // Ensure model value exists
    await runQuery(`INSERT OR IGNORE INTO ${this.model}(name) VALUES(?)`, [
      this.value,
    ]);
    const modelRow = await getOne<{ id: number }>(
      `SELECT id FROM ${this.model} WHERE name = ?`,
      [this.value]
    );
    if (!modelRow) return;
    const modelId = modelRow.id;

    for (const item of items) {
      const recipeRow = await getOne<{ id: number }>(
        "SELECT id FROM recipes WHERE link = ?",
        [item.link]
      );
      if (!recipeRow) continue;
      const recipeId = recipeRow.id;

      await runQuery(
        `INSERT OR IGNORE INTO recipe_${this.model}(recipe_id, ${this.fk}) VALUES(?, ?)`,
        [recipeId, modelId]
      );
    }
  }
}
