import BaseScraper from './BaseScraper';
import { ScrapedItem } from '../types';
import { runQuery } from '../utils/db';

export default class BakerScraper extends BaseScraper {
  constructor() {
    super({ maxPage: 1 });
    this.baseUrl = "https://thegreatbritishbakeoff.co.uk/bakers";
  }

  protected getCardSelector(): string {
    return ".baker-avatars__group";
  }

  protected async extractItems(cards: Element[]): Promise<ScrapedItem[]> {
    const results: ScrapedItem[] = [];

    for (const card of cards) {
      try {
        const seasonEl = card.querySelector('.baker-avatars__group__title');
        const seasonText = seasonEl?.textContent?.trim() || '';
        const parsedSeasonText = (seasonText.match(/\d+/g) || []).join('');
        const season = parsedSeasonText ? parseInt(parsedSeasonText, 10) : null;

        const bakerEls = Array.from(
          card.querySelectorAll(".baker-avatars__list__item")
        );
        for (const bakerEl of bakerEls) {
          const imgEl = bakerEl.querySelector("img");
          if (!imgEl) continue;
          const img = imgEl.getAttribute("src") || "";
          const name = imgEl.getAttribute("alt") || "";
          if (!name || !img) continue;

          results.push({
            img,
            name,
            season,
          });
        }
      } catch (err) {
        console.error('Error processing baker card:', err);
        continue;
      }
    }

    return results;
  }

  protected async saveToDatabase(items: ScrapedItem[]): Promise<void> {
    for (const item of items) {
      await runQuery(
        "INSERT OR IGNORE INTO bakers(name, img, season) VALUES(?, ?, ?)",
        [item.name, item.img, item.season ?? null]
      );
    }
  }

  protected override generatePageUrl(_pageNumber: number): string {
    // bakers page has all seasons on one page
    return this.baseUrl;
  }
}
