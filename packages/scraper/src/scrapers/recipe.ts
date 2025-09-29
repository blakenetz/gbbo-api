import { scrape, Helpers } from "./base";
import type { CheerioAPI } from "cheerio";
import { ScrapedItem } from "../types";
import { getOne, runQuery } from "../utils/db";

const RECIPES_BASE_URL = "https://thegreatbritishbakeoff.co.uk/recipes/all";

function getCardSelectorRecipes(): string {
  return ".recipes-loop__item";
}

async function extractRecipeItems(
  $: CheerioAPI,
  cards: any[],
  helpers: Helpers
): Promise<ScrapedItem[]> {
  const results: ScrapedItem[] = [];
  for (const card of cards) {
    const $card = $(card);
    try {
      const $imgEl = $card.find("figure img").first();
      if ($imgEl.length === 0) continue;

      const $content = $card.find(".recipes-loop__item__content").first();
      if ($content.length === 0) continue;

      const $h5 = $content.find("h5").first();
      if ($h5.length === 0) continue;

      const title = $h5.text().trim();
      const link = ($card.find("a").attr("href") || "").trim();
      const img = ($imgEl.attr("src") || "").trim();

      const $bakerImgEl = $content.find("img").first();
      const baker = $bakerImgEl.length
        ? {
            name: $bakerImgEl.attr("alt") || "",
            img: $bakerImgEl.attr("src") || "",
          }
        : null;

      const difficultyText = (
        $content
          .find("[data-difficulty], .recipes-loop__item__difficulty")
          .text() || ""
      ).trim();
      const difficulty = difficultyText
        ? parseInt(difficultyText.replace(/[^0-9]/g, ""), 10) || null
        : null;

      const diets = Array.from(
        new Set(
          $card
            .find("[title]")
            .toArray()
            .map((el: any) => $(el).attr("title")?.trim())
            .filter(
              (v: string | undefined): v is string =>
                typeof v === "string" && v.toLowerCase() !== "all"
            )
        )
      );

      const timeText = (
        $card.find(".recipes-loop__item__time, time").text() || ""
      ).trim();
      const time = helpers.parseTimeToMinutes(timeText);

      results.push({ link, img, title, baker, difficulty, diets, time });
    } catch (e) {
      console.error("Error processing recipe card:", e);
      continue;
    }
  }
  return results;
}

async function saveRecipeItems(items: ScrapedItem[]): Promise<void> {
  for (const result of items) {
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

    const recipeRow = await getOne<{ id: number }>(
      "SELECT id FROM recipes WHERE link = ?",
      [result.link]
    );
    if (!recipeRow) continue;
    const recipeId = recipeRow.id;

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

function generateRecipePageUrl(pageNumber: number, baseUrl: string): string {
  return `${baseUrl}/page/${pageNumber}`;
}

export default async function scrapeRecipes(): Promise<void> {
  await scrape({
    baseUrl: RECIPES_BASE_URL,
    getCardSelector: getCardSelectorRecipes,
    extractItems: extractRecipeItems,
    saveToDatabase: saveRecipeItems,
    generatePageUrl: generateRecipePageUrl,
  });
}
