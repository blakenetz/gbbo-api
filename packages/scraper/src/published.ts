import type { CheerioAPI } from "cheerio";
import { fetchPage } from "./scrapers/base";
import { getAll, runQuery } from "./utils/db";

// Recipe pages are fetched a few at a time to stay polite to the GBBO site.
const CONCURRENCY = 4;

function collectPublishedDates(node: unknown, dates: string[]): void {
  if (Array.isArray(node)) {
    for (const child of node) collectPublishedDates(child, dates);
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key === "datePublished" && typeof value === "string") dates.push(value);
      else collectPublishedDates(value, dates);
    }
  }
}

// The page's JSON-LD has a WebPage node with a full timestamp and a Recipe node
// with only the date; prefer the timestamp. Returns an ISO 8601 UTC string.
export function extractPublishedAt($: CheerioAPI): string | null {
  const dates: string[] = [];
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      collectPublishedDates(JSON.parse($(element).text()), dates);
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  });

  const value = dates.find((date) => date.includes("T")) ?? dates[0];
  const publishedAt = value ? new Date(value) : null;
  return publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt.toISOString() : null;
}

// Fills published_at for every recipe that doesn't have one yet.
export async function addPublishedDates(): Promise<void> {
  const recipes = await getAll<{ id: number; link: string }>(
    "SELECT id, link FROM recipes WHERE published_at IS NULL",
  );
  console.info(`Fetching publish dates for ${recipes.length} recipes`);

  let stored = 0;
  for (let i = 0; i < recipes.length; i += CONCURRENCY) {
    await Promise.all(
      recipes.slice(i, i + CONCURRENCY).map(async ({ id, link }) => {
        try {
          const publishedAt = extractPublishedAt(await fetchPage(link));
          if (!publishedAt) {
            console.warn(`No publish date found for ${link}`);
            return;
          }
          await runQuery("UPDATE recipes SET published_at = ? WHERE id = ?", [publishedAt, id]);
          stored++;
        } catch (error) {
          console.error(`Failed to fetch publish date for ${link}:`, error);
        }
      }),
    );
  }
  console.info(`Stored publish dates for ${stored}/${recipes.length} recipes`);
}
