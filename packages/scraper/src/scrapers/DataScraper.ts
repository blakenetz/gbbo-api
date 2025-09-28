import { scrape, Helpers } from "./BaseScraper";
import { ScrapedItem } from "../types";
import { getOne, runQuery } from "../utils/db";
import type { CheerioAPI } from "cheerio";

type Model = "categories" | "bake_types" | "diets";

const RECIPES_BASE_URL = "https://thegreatbritishbakeoff.co.uk/recipes/all";
type DataContext = {
  model: Model;
  value: string;
  queryParam: string;
  fk: string;
};
function getCardSelectorData(): string {
  return ".recipes-loop__item";
}

async function extractDataItems($: CheerioAPI, cards: any[], helpers: Helpers): Promise<ScrapedItem[]> {
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

      const difficultyText = ($content.find("[data-difficulty], .recipes-loop__item__difficulty").text() || "").trim();
      const difficulty = difficultyText
        ? parseInt(difficultyText.replace(/[^0-9]/g, ""), 10) || null
        : null;

      const timeText = ($card.find(".recipes-loop__item__time, time").text() || "").trim();
      const time = helpers.parseTimeToMinutes(timeText);

      results.push({ link, img, title, difficulty, time });
    } catch (e) {
      console.error("Error processing recipe card (data scrape):", e);
      continue;
    }
  }
  return results;
}

async function saveDataItems(items: ScrapedItem[], context?: DataContext): Promise<void> {
  if (!context) return;
  const { model, value, fk } = context;
  await runQuery(`INSERT OR IGNORE INTO ${model}(name) VALUES(?)`, [value]);
  const modelRow = await getOne<{ id: number }>(`SELECT id FROM ${model} WHERE name = ?`, [value]);
  if (!modelRow) return;
  const modelId = modelRow.id;

  for (const item of items) {
    const recipeRow = await getOne<{ id: number }>("SELECT id FROM recipes WHERE link = ?", [item.link]);
    if (!recipeRow) continue;
    const recipeId = recipeRow.id;

    await runQuery(`INSERT OR IGNORE INTO recipe_${model}(recipe_id, ${fk}) VALUES(?, ?)`, [recipeId, modelId]);
  }
}

function generateDataPageUrl(pageNumber: number, baseUrl: string, context?: DataContext): string {
  const qp = context?.queryParam ?? "";
  const val = context?.value ?? "";
  return `${baseUrl}/page/${pageNumber}?${qp}=${encodeURIComponent(val)}`;
}

export default async function scrapeData(model: Model, value: string, param?: string): Promise<void> {
  const context: DataContext = {
    model,
    value,
    queryParam: param || model,
    fk: param ? `${param}_id` : `${model.replace(/s$/, "")}_id`,
  };

  await scrape<DataContext>({
    baseUrl: RECIPES_BASE_URL,
    context,
    getCardSelector: getCardSelectorData,
    extractItems: extractDataItems,
    saveToDatabase: saveDataItems,
    generatePageUrl: generateDataPageUrl,
  });
}
