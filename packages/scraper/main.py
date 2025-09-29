from scraper import BakerScraper, RecipeScraper, add_metadata
import datetime

def main() -> None:
  baker_scraper = BakerScraper()
  recipe_scraper = RecipeScraper()

  try: 
    baker_scraper.scrape()
    recipe_scraper.scrape()
    add_metadata()
    return datetime.datetime.now()

  except Exception as e:
    print(f"Scraping failed: {e}")

if __name__ == '__main__':
    main()