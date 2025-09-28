import "dotenv/config";
import scrapeBakers from "./scrapers/BakerScraper";
import scrapeRecipes from "./scrapers/RecipeScraper";
import { addMetadata } from "./metadata";

async function main() {
  try {
    await scrapeBakers();
    await scrapeRecipes();
    await addMetadata();
  } catch (e) {
    console.error("Scraping failed:", e);
  }
}

main();
