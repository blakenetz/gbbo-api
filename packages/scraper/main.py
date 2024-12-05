from scraper import WebScraper

def main() -> None:
  scraper = WebScraper()

  try: 
    scraper.scrape()

  except Exception as e:
    print(f"Scraping failed: {e}")

if __name__ == '__main__':
    main()