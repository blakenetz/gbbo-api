import { scrape } from "./base";
import { ScrapedItem } from "../types";
import { runQuery } from "../utils/db";
import type { CheerioAPI } from "cheerio";

async function extractBakerItems(
  $: CheerioAPI,
  cards: any[]
): Promise<ScrapedItem[]> {
  const results: ScrapedItem[] = [];
  // Attempt to infer season from page headings (e.g., "Series 16")
  let season: number | null = null;
  try {
    const headingText = [
      $('h1').text(),
      $('h2').text(),
      $('.page-title').text(),
      $('.hero__title').text(),
    ]
      .join(' ')
      .trim();
    const m = /series\s*(\d+)/i.exec(headingText);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n)) season = n;
    }
  } catch {}
  for (const card of cards) {
    const $card = $(card);
    try {
      // Tiles are structured as <article class="featured-block"> with <a><div.img><img/></div><div.details><h3></h3></div></a>
      const $a = $card.find('a').first();
      const $img = $a.find('img').first();
      const img = ($img.attr('src') || '').trim();
      let name = ($a.find('h3').first().text() || '').trim();
      if (!name) name = ($a.attr('title') || '').trim();
      if (!name) name = ($img.attr('alt') || '').trim();
      if (!name || !img) continue;

      results.push({ img, name, season });
    } catch (err) {
      console.error("Error processing baker card:", err);
      continue;
    }
  }
  return results;
}

async function saveBakerItems(items: ScrapedItem[]): Promise<void> {
  for (const item of items) {
    await runQuery(
      "INSERT OR IGNORE INTO bakers(name, img, season) VALUES(?, ?, ?)",
      [item.name, item.img, item.season ?? null]
    );
  }
}

function generateBakersPageUrl(pageNumber: number, baseUrl: string): string {
  // Site uses per-series pages: e.g., /bakers/series-16/
  // Map pageNumber -> series-{pageNumber}
  const n = Math.max(1, pageNumber);
  return `${baseUrl}-${n}/`;
}

export default async function scrapeBakers(): Promise<void> {
  await scrape({
    baseUrl: "https://thegreatbritishbakeoff.co.uk/bakers/series",
    getCardSelector: () => "article.featured-block",
    extractItems: extractBakerItems,
    saveToDatabase: saveBakerItems,
    generatePageUrl: generateBakersPageUrl,
  });
}
