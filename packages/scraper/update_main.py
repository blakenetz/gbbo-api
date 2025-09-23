from scraper import UpdateScraper

def main() -> None:
  update_scraper = UpdateScraper()

  try: 
    update_scraper.update_all()
  except Exception as e:
    print(f"Update failed: {e}")

if __name__ == '__main__':
    main()
