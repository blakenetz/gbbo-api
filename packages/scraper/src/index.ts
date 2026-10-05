import "dotenv/config";
import scrapeBakers from "./scrapers/baker";
import scrapeRecipes from "./scrapers/recipe";
import { addMetadata } from "./metadata";
import { addPublishedDates } from "./published";

async function main() {
  try {
    await scrapeBakers();
    await scrapeRecipes();
    await addMetadata();
    await addPublishedDates();
  } catch (e) {
    console.error("Scraping failed:", e);
    // Non-zero exit so scheduled runs fail visibly instead of syncing partial data.
    process.exitCode = 1;
  }
}

main();
