from scraper import BakerScraper, RecipeScraper

def main() -> None:
  baker_scraper = BakerScraper()
  recipe_scraper = RecipeScraper()

  try: 
    baker_scraper.scrape()
    recipe_scraper.scrape()

  except Exception as e:
    print(f"Scraping failed: {e}")

if __name__ == '__main__':
    main()