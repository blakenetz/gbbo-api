import "dotenv/config";
import scrapeBakers from "./scrapers/baker";
import scrapeRecipes from "./scrapers/recipe";
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
