import BaseScraper from "./BaseScraper";
import { ScrapedItem } from "../types";
import { getOne, runQuery } from "../utils/db";

export default class RecipeScraper extends BaseScraper {
  constructor() {
    super();
    this.baseUrl = "https://thegreatbritishbakeoff.co.uk/recipes/all";
  }

  protected getCardSelector(): string {
    return ".recipes-loop__item";
  }

  protected override generatePageUrl(pageNumber: number): string {
    return `${this.baseUrl}/page/${pageNumber}`;
  }

  protected async extractItems(cards: Element[]): Promise<ScrapedItem[]> {
    const results: ScrapedItem[] = [];

    for (const card of cards) {
      try {
        const imgEl = card.querySelector("figure img");
        if (!imgEl) continue;

        const content = card.querySelector(".recipes-loop__item__content");
        if (!content) continue;

        const h5 = content.querySelector("h5");
        if (!h5) continue;

        const title = h5.textContent?.trim() || "";
        const link = (
          card.querySelector("a")?.getAttribute("href") || ""
        ).trim();
        const img = (imgEl.getAttribute("src") || "").trim();

        // Baker info (if present)
        const bakerImgEl = content.querySelector("img");
        const baker = bakerImgEl
          ? {
              name: bakerImgEl.getAttribute("alt") || "",
              img: bakerImgEl.getAttribute("src") || "",
            }
          : null;

        // Difficulty (numeric if possible)
        const difficultyText = (
          content.querySelector(
            "[data-difficulty], .recipes-loop__item__difficulty"
          )?.textContent || ""
        ).trim();
        const difficulty = difficultyText
          ? parseInt(difficultyText.replace(/[^0-9]/g, ""), 10) || null
          : null;

        // Diets via title attributes like "Vegetarian", "Vegan", etc
        const dietaryEls = Array.from(
          card.querySelectorAll("[title]")
        ) as Element[];
        const diets = Array.from(
          new Set(
            dietaryEls
              .map((el) => el.getAttribute("title")?.trim())
              .filter((v): v is string => typeof v === "string" && v.toLowerCase() !== "all")
          )
        );

        // Time text like "1h 30m"
        const timeText = (
          card.querySelector(".recipes-loop__item__time, time")?.textContent ||
          ""
        ).trim();
        const time = this.parseTimeToMinutes(timeText);

        results.push({
          link,
          img,
          title,
          baker,
          difficulty,
          diets,
          time,
        });
      } catch (e) {
        console.error("Error processing recipe card:", e);
        continue;
      }
    }

    return results;
  }

  protected async saveToDatabase(items: ScrapedItem[]): Promise<void> {
    for (const result of items) {
      // Upsert baker
      let bakerId: number | null = null;
      if (result.baker && result.baker.name && result.baker.img) {
        const row = await getOne<{ id: number }>(
          "SELECT id FROM bakers WHERE name = ? AND img = ?",
          [result.baker.name, result.baker.img]
        );
        if (!row) {
          const insert = await runQuery(
            "INSERT INTO bakers(name, img) VALUES(?, ?)",
            [result.baker.name, result.baker.img]
          );
          bakerId = insert.lastID;
        } else {
          bakerId = row.id;
        }
      }

      // Insert recipe
      await runQuery(
        `INSERT OR IGNORE INTO recipes(title, link, img, difficulty, time, baker_id)
         VALUES(?, ?, ?, ?, ?, ?)`,
        [
          result.title,
          result.link,
          result.img,
          result.difficulty ?? null,
          result.time ?? null,
          bakerId,
        ]
      );

      // Get recipe id
      const recipeRow = await getOne<{ id: number }>(
        "SELECT id FROM recipes WHERE link = ?",
        [result.link]
      );
      if (!recipeRow) continue;
      const recipeId = recipeRow.id;

      // Upsert diets and link
      for (const diet of result.diets || []) {
        await runQuery("INSERT OR IGNORE INTO diets(name) VALUES(?)", [diet]);
        const d = await getOne<{ id: number }>(
          "SELECT id FROM diets WHERE name = ?",
          [diet]
        );
        if (d) {
          await runQuery(
            "INSERT OR IGNORE INTO recipe_diets(recipe_id, diet_id) VALUES(?, ?)",
            [recipeId, d.id]
          );
        }
      }
    }
  }
}
