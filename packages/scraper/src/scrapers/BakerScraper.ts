import { scrape } from './BaseScraper';
import { ScrapedItem } from '../types';
import { runQuery } from '../utils/db';
import type { CheerioAPI } from 'cheerio';

const BAKERS_BASE_URL = "https://thegreatbritishbakeoff.co.uk/bakers";

function getCardSelectorBakers(): string {
  return ".baker-avatars__group";
}

async function extractBakerItems($: CheerioAPI, cards: any[]): Promise<ScrapedItem[]> {
  const results: ScrapedItem[] = [];
  for (const card of cards) {
    const $card = $(card);
    try {
      const seasonText = $card.find('.baker-avatars__group__title').text().trim() || '';
      const parsedSeasonText = (seasonText.match(/\d+/g) || []).join('');
      const season = parsedSeasonText ? parseInt(parsedSeasonText, 10) : null;

      const bakerEls = $card.find(".baker-avatars__list__item").toArray();
      for (const bakerEl of bakerEls) {
        const $imgEl = $(bakerEl).find("img").first();
        if ($imgEl.length === 0) continue;
        const img = $imgEl.attr("src") || "";
        const name = $imgEl.attr("alt") || "";
        if (!name || !img) continue;

        results.push({ img, name, season });
      }
    } catch (err) {
      console.error('Error processing baker card:', err);
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

function generateBakersPageUrl(_pageNumber: number, baseUrl: string): string {
  // bakers page has all seasons on one page
  return baseUrl;
}

export default async function scrapeBakers(): Promise<void> {
  await scrape({
    baseUrl: BAKERS_BASE_URL,
    getCardSelector: getCardSelectorBakers,
    extractItems: extractBakerItems,
    saveToDatabase: saveBakerItems,
    generatePageUrl: generateBakersPageUrl,
  });
}
