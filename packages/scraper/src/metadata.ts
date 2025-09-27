import { JSDOM } from "jsdom";
import DataScraper from "./scrapers/DataScraper";

export async function addMetadata(): Promise<void> {
  const url = "https://thegreatbritishbakeoff.co.uk/recipes/all";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const html = await res.text();
    const { document } = new JSDOM(html).window;

    // Categories
    const categoryInputs = Array.from(
      document.querySelectorAll('input[name="category"]')
    ) as HTMLInputElement[];
    for (const input of categoryInputs) {
      const value = input.getAttribute("value");
      if (!value || value === "All") continue;
      const scraper = new DataScraper("categories", String(value), "category");
      await scraper.scrape();
    }

    // Bake types
    const typeInputs = Array.from(
      document.querySelectorAll('input[name="type"]')
    ) as HTMLInputElement[];
    for (const input of typeInputs) {
      const value = input.getAttribute("value");
      if (!value || value === "All") continue;
      const scraper = new DataScraper("bake_types", String(value), "type");
      await scraper.scrape();
    }
  } catch (e) {
    console.error("Failed to add metadata:", e);
  }
}
