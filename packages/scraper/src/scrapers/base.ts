import { load, type CheerioAPI } from "cheerio";
import { ScrapedItem } from "../types";

export type Helpers = {
  getTextContent: typeof getTextContent;
  getAttribute: typeof getAttribute;
  parseTimeToMinutes: typeof parseTimeToMinutes;
};

export type ScrapeConfig<Ctx = unknown> = {
  baseUrl: string;
  context?: Ctx;
  getCardSelector: (context?: Ctx) => string;
  extractItems: (
    $: CheerioAPI,
    cards: any[],
    helpers: Helpers,
    context?: Ctx
  ) => Promise<ScrapedItem[]>;
  saveToDatabase: (items: ScrapedItem[], context?: Ctx) => Promise<void>;
  generatePageUrl?: (
    pageNumber: number,
    baseUrl: string,
    context?: Ctx
  ) => string;
};

const BATCH_SIZE = 10; // number of pages to process concurrently

async function fetchPage(url: string): Promise<CheerioAPI> {
  try {
    console.debug(`Fetching page: ${url}`);
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const html = await res.text();
    const $ = load(html);
    return $;
  } catch (error) {
    console.error(`Error fetching page ${url}:`, error);
    throw error;
  }
}

function generatePageUrlDefault(pageNumber: number, baseUrl: string): string {
  return `${baseUrl}?page=${pageNumber}`;
}

export async function scrape<Ctx = unknown>(
  cfg: ScrapeConfig<Ctx>
): Promise<void> {
  const baseUrl = cfg.baseUrl;
  const allItems: ScrapedItem[] = [];

  let pageStart = 1;
  // We don't know the max page; we stop when a full batch has no cards
  while (true) {
    const pages = Array.from({ length: BATCH_SIZE }, (_, i) => pageStart + i);
    console.info(
      `Processing pages ${pageStart}-${pageStart + BATCH_SIZE - 1} concurrently`
    );

    try {
      const results = await Promise.all(
        pages.map(async (page) => {
          const url = (cfg.generatePageUrl || generatePageUrlDefault)(
            page,
            baseUrl,
            cfg.context
          );
          const $ = await fetchPage(url);
          const cards = $(cfg.getCardSelector(cfg.context)).toArray();
          if (cards.length === 0) {
            return { items: [] as ScrapedItem[], empty: true };
          }
          const helpers: Helpers = {
            getTextContent,
            getAttribute,
            parseTimeToMinutes,
          };
          const items = await cfg.extractItems($, cards, helpers, cfg.context);
          return { items, empty: items.length === 0 };
        })
      );

      const batchHadCards = results.some((r) => !r.empty);
      for (const r of results) allItems.push(...r.items);

      if (!batchHadCards) {
        console.info(
          `No cards found in batch ${pageStart}-${
            pageStart + BATCH_SIZE - 1
          }, ending scrape`
        );
        break;
      }

      pageStart += BATCH_SIZE;
    } catch (error) {
      console.error(
        `Error processing batch ${pageStart}-${pageStart + BATCH_SIZE - 1}:`,
        error
      );
      break;
    }
  }

  if (allItems.length > 0) {
    console.info(`Saving ${allItems.length} items to database`);
    await cfg.saveToDatabase(allItems, cfg.context);
  } else {
    console.warn("No items were scraped");
  }
}

// Helper method to safely get text content from an element
export function getTextContent(
  element: Element | null,
  selector: string,
  defaultValue: string = ""
): string {
  const el = selector ? element?.querySelector(selector) : element;
  return el?.textContent?.trim() || defaultValue;
}

// Helper method to safely get attribute value from an element
export function getAttribute(
  element: Element | null,
  selector: string,
  attribute: string,
  defaultValue: string = ""
): string {
  const el = selector ? element?.querySelector(selector) : element;
  return el?.getAttribute(attribute)?.trim() || defaultValue;
}

// Helper method to parse time strings (e.g., "1h 30m") into minutes
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;

  const timePattern = /(?:\d+\s*(?:d|h|m|min|mins|hour|hours|day|days))/gi;
  const matches = timeStr.match(timePattern) || [];

  return matches.reduce((total, match) => {
    const value = parseInt(match.replace(/\D/g, ""));

    if (match.includes("d")) return total + value * 24 * 60; // days to minutes
    if (match.includes("h")) return total + value * 60; // hours to minutes
    return total + value; // minutes
  }, 0);
}
