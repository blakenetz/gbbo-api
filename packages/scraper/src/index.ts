import 'dotenv/config';
import BakerScraper from './scrapers/BakerScraper';
import RecipeScraper from './scrapers/RecipeScraper';
import { addMetadata } from './metadata';

async function main() {
  const bakerScraper = new BakerScraper();
  const recipeScraper = new RecipeScraper();

  try {
    await bakerScraper.scrape();
    await recipeScraper.scrape();
    await addMetadata();
  } catch (e) {
    console.error('Scraping failed:', e);
  }
}

main();
