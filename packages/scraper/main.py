from scraper import BakerScraper, RecipeScraper, add_metadata

def main() -> None:
  baker_scraper = BakerScraper()
  recipe_scraper = RecipeScraper(max_workers=4)  # Use parallel scraping

  try: 
    baker_scraper.scrape()
    recipe_scraper.scrape_parallel()  # Use parallel version
    add_metadata()

  except Exception as e:
    print(f"Scraping failed: {e}")

if __name__ == '__main__':
    main()