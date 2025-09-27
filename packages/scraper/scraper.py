import requests
from bs4 import BeautifulSoup, Tag, ResultSet
import time
import sqlite3
from typing import List
import re
import concurrent.futures
from threading import Lock

from util import get_logger, get_db_file_path

def parse_time_to_minutes(time_str):
  pattern = r"(\d+)\s*(d|h|m)"
  matches = re.findall(pattern, time_str)

  total_minutes = 0
  for match in matches:
    value, unit = match
    value = int(value)

    if unit == "d":
      total_minutes += value * 24 * 60
    elif unit == "h":
      total_minutes += value * 60
    elif unit == "m":
      total_minutes += value

  return total_minutes

class WebScraper:
  def __init__(self, max_page: int = 100):
    # Configure logging
    self.logger = get_logger(__name__)
    self.logger.debug('Initializing...')

    # Config DB connection
    db_file = get_db_file_path()
    self.connection = sqlite3.connect(db_file)
    self.sql = self.connection.cursor()

    self.base_url = "https://thegreatbritishbakeoff.co.uk/recipes/all"
    self.card_selector = "ADD-CARD-SELECTOR"
    self.max_page = max_page
    # uncomment to enable sql trace
    # self.connection.set_trace_callback(print)
  
  def _generate_page_url(self, page_number: int) -> str:  
    return self.base_url
  
  def _get_soup(self, url: str) -> BeautifulSoup:
    self.logger.debug('Initializing BeautifulSoup...')
    headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    }
    page = requests.get(url, headers=headers)
    soup = BeautifulSoup(page.content, "html.parser")
    return soup
  
  
  def _scrape_page(self, url: str, page: int) -> List[dict]:
    self.logger.debug('Scraping page...')
    try:
      soup = self._get_soup(url)
      cards = soup.find_all(class_=self.card_selector)
      return self._extract_items(cards, page)
    except requests.RequestException as e:
      self.logger.error(f"Request error on page {page}: {e}")
      return []
    except Exception as e:
      self.logger.error(f"Unexpected error on page {page}: {e}")
      return []
  
  def _extract_items(self, cards: ResultSet[Tag], page: int) -> List[dict]: 
    self.logger.debug('Extracting items...')
    return []
  
  def _save_to_db(self, results: List[dict]) -> None:
    self.logger.debug('Saving to DB...')

  def scrape(self) -> None:
    self.logger.debug('Scraping...')
    page = 1
    item_count = 0
    while True:
      url = self._generate_page_url(page)
      results = self._scrape_page(url, page)
      count = len(results)
      item_count += count

      if count == 0:
        break
      
      self.logger.info(f"Scraped page {page}: {count} items")
      self._save_to_db(results)

      if page >= self.max_page:
        break
      
      page += 1
      # Increased delay to avoid rate limiting
      time.sleep(2)
    
    self.logger.info(f"Total pages scraped: {page}")
    self.connection.close()

  

class RecipeScraper(WebScraper):
  def __init__(self, max_workers: int = 4):
    super().__init__()
    self.logger.debug('Initializing RecipeScraper...')
    self.card_selector = "recipes-loop__item"
    self.max_workers = max_workers

  def _generate_page_url(self, page_number: int) -> str:
    return f"{self.base_url}/page/{page_number}"
  
  def _extract_items(self, cards: ResultSet[Tag], page: int) -> List[dict]:
    self.logger.debug('Extracting items...')
    
    if len(cards) == 0:
      return []
    
    results = []
    for card in cards: 
      try:
        figure = card.find("figure")
        if not figure:
          continue
        img = figure.find("img")
        if not img:
          continue

        content = card.find(class_="recipes-loop__item__content")
        if not content:
          continue
        h5 = content.find('h5')
        if not h5:
          continue
        title = str(h5.get_text()) if h5 and hasattr(h5, 'get_text') else ""        
        meta = card.find(class_="recipes-loop__item__meta")
        if not meta:
          continue

        thumbnail = card.find(class_="thumbnail-baker")
        baker_info = None if thumbnail is None else thumbnail.find('img')
        
        difficulty_level = meta.find('span', class_="difficulty-level")
        difficulty = None if difficulty_level is None else len(difficulty_level.select('span:not([class*="disabled"])'))

        dietary = meta.find_all(class_='dietary__item')  

        time_span = next(iter(meta.select('span[class*="bakingTime"]')), None)
        time = None
        if time_span and hasattr(time_span, 'get_text'):
          time = parse_time_to_minutes(time_span.get_text())

        results.append({
          'link': card.find('a').get('href') if card.find('a') else '',
          'img': img.get('src') if img else '',
          'title': title,
          'baker': None if baker_info is None else {
            'name': baker_info.get('alt') if baker_info else '',
            'img': baker_info.get('src') if baker_info else ''
          },
          'difficulty': difficulty,
          'diets': [x.get("title") for x in dietary if x and hasattr(x, 'get')],
          'time': time
        })
      except requests.RequestException as e:
        self.logger.error(f"Request error on page {page}: {e}")
        return []
    
    return results

  def _save_to_db(self, results: List[dict]) -> None:
    self.logger.debug('Saving to DB...')
    for result in results:
      baker_id = None
      baker = result['baker']
      if (result['baker']):
        # Try to find existing baker first
        row = self.sql.execute("SELECT id FROM bakers WHERE name = :name AND img = :img", baker).fetchone()

        if row is None:
          # Baker doesn't exist, create new record
          self.sql.execute('INSERT INTO bakers(name, img) VALUES(:name, :img)', baker)
          baker_id = self.sql.lastrowid
        else:
          baker_id = row[0]

      self.sql.execute(''' 
                       INSERT OR IGNORE INTO recipes(link, img, title, difficulty, time, baker_id) 
                       VALUES(:link, :img, :title, :difficulty, :time, :baker_id)
                       ''', 
                       {**result, **{ "baker_id": baker_id }}
                       )
      
      # Get recipe_id - either from new insert or existing record
      recipe_row = self.sql.execute('SELECT id FROM recipes WHERE link = :link', result).fetchone()
      recipe_id = recipe_row[0] if recipe_row else self.sql.lastrowid
      
      if len(result["diets"]) > 0:
        # insert into diets table
        diet_params = list(map(lambda x: (x,), result['diets']))
        self.sql.executemany("INSERT OR IGNORE INTO diets(name) VALUES(?)", diet_params)
        self.connection.commit()
        # fetch diet_id array
        placeholders = ','.join('?' * len(result["diets"]))
        self.sql.execute(f'SELECT id FROM diets WHERE name IN ({placeholders})', result['diets'])
        diet_ids = self.sql.fetchall()
        # create (diet_id, recipe_id) tuple and insert into recipe_diets table
        recipe_diet_params = list(map(lambda x: (*x, recipe_id), diet_ids))
        self.sql.executemany("INSERT OR IGNORE INTO recipe_diets(diet_id, recipe_id) VALUES(?,?)", recipe_diet_params)
      
      self.connection.commit()

  def _scrape_recipe_page_parallel(self, page_num: int) -> int:
    """Scrape a single recipe page and return count of items"""
    try:
      # Create a new connection for this thread
      db_file = get_db_file_path()
      connection = sqlite3.connect(db_file)
      sql = connection.cursor()
      
      url = self._generate_page_url(page_num)
      soup = self._get_soup(url)
      cards = soup.find_all(class_=self.card_selector)
      
      if len(cards) == 0:
        connection.close()
        return 0
      
      results = []
      for card in cards: 
        try:
          figure = card.find("figure")
          if not figure:
            continue
          img = figure.find("img")
          if not img:
            continue

          content = card.find(class_="recipes-loop__item__content")
          if not content:
            continue
          h5 = content.find('h5')
          if not h5:
            continue
          title = str(h5.get_text()) if h5 and hasattr(h5, 'get_text') else ""        
          meta = card.find(class_="recipes-loop__item__meta")
          if not meta:
            continue

          thumbnail = card.find(class_="thumbnail-baker")
          baker_info = None if thumbnail is None else thumbnail.find('img')
          
          difficulty_level = meta.find('span', class_="difficulty-level")
          difficulty = None if difficulty_level is None else len(difficulty_level.select('span:not([class*="disabled"])'))

          dietary = meta.find_all(class_='dietary__item')  

          time = next(iter(meta.select('span[class*="bakingTime"]')), None)
          if time != None:
            time = parse_time_to_minutes(time.string)

          results.append({
            'link': card.find('a')['href'],
            'img': img['src'],
            'title': title,
            'baker': None if baker_info is None else {
              'name': baker_info['alt'],
              'img': baker_info['src']
            },
            'difficulty': difficulty,
            'diets': [x.get("title") for x in dietary if x and hasattr(x, 'get')],
            'time': time
          })
        except Exception as e:
          self.logger.error(f"Error processing recipe card on page {page_num}: {e}")
          continue
      
      # Save to database
      for result in results:
        baker_id = None
        baker = result['baker']
        if (result['baker']):
          # Try to find existing baker first
          row = sql.execute("SELECT id FROM bakers WHERE name = :name AND img = :img", baker).fetchone()

          if row is None:
            # Baker doesn't exist, create new record
            sql.execute('INSERT INTO bakers(name, img) VALUES(:name, :img)', baker)
            baker_id = sql.lastrowid
          else:
            baker_id = row[0]

        sql.execute(''' 
                     INSERT OR IGNORE INTO recipes(link, img, title, difficulty, time, baker_id) 
                     VALUES(:link, :img, :title, :difficulty, :time, :baker_id)
                     ''', 
                     {**result, **{ "baker_id": baker_id }}
                     )
        
        # Get recipe_id - either from new insert or existing record
        recipe_row = sql.execute('SELECT id FROM recipes WHERE link = :link', result).fetchone()
        recipe_id = recipe_row[0] if recipe_row else sql.lastrowid
        
        if len(result["diets"]) > 0:
          # insert into diets table
          diet_params = list(map(lambda x: (x,), result['diets']))
          sql.executemany("INSERT OR IGNORE INTO diets(name) VALUES(?)", diet_params)
          connection.commit()
          # fetch diet_id array
          placeholders = ','.join('?' * len(result["diets"]))
          sql.execute(f'SELECT id FROM diets WHERE name IN ({placeholders})', result['diets'])
          diet_ids = sql.fetchall()
          # create (diet_id, recipe_id) tuple and insert into recipe_diets table
          recipe_diet_params = list(map(lambda x: (*x, recipe_id), diet_ids))
          sql.executemany("INSERT OR IGNORE INTO recipe_diets(diet_id, recipe_id) VALUES(?,?)", recipe_diet_params)
        
        connection.commit()
      
      connection.close()
      return len(results)
      
    except Exception as e:
      self.logger.error(f'Error scraping recipe page {page_num}: {e}')
      return 0

  def scrape_parallel(self) -> None:
    """Parallel version of scrape method"""
    self.logger.debug(f'Scraping with {self.max_workers} workers...')
    
    # First, discover how many pages exist by checking a few pages
    page = 1
    empty_pages = 0
    max_empty_pages = 3  # Stop if we hit 3 empty pages in a row
    
    while page <= self.max_page:
      url = self._generate_page_url(page)
      results = self._scrape_page(url, page)
      count = len(results)
      
      if count == 0:
        empty_pages += 1
        if empty_pages >= max_empty_pages:
          break
      else:
        empty_pages = 0
        # Save the first page immediately to establish baseline
        if page == 1:
          self._save_to_db(results)
          self.logger.info(f"Scraped page {page}: {count} items")
      
      page += 1
    
    total_pages = page - 1 - max_empty_pages
    self.logger.info(f"Found {total_pages} pages to scrape")
    
    if total_pages <= 1:
      self.connection.close()
      return
    
    # Now scrape remaining pages in parallel
    page_numbers = list(range(2, total_pages + 1))  # Skip page 1 as we already did it
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
      future_to_page = {executor.submit(self._scrape_recipe_page_parallel, page): page for page in page_numbers}
      
      total_items = 0
      for future in concurrent.futures.as_completed(future_to_page):
        page = future_to_page[future]
        try:
          count = future.result()
          total_items += count
          self.logger.info(f"Completed page {page}: {count} items")
        except Exception as exc:
          self.logger.error(f'Page {page} generated an exception: {exc}')
    
    self.logger.info(f"Total items scraped: {total_items}")
    self.connection.close()

class BakerScraper(WebScraper):
  def __init__(self):
    super().__init__()
    self.logger.debug('Initializing BakerScraper...')
    self.card_selector = "baker-avatars__group"
    self.max_page = 1

  def _extract_items(self, cards: ResultSet[Tag], page: int) -> List[dict]:
    self.logger.debug('Extracting items...')
    
    if len(cards) == 0:
      return []
    
    results = []
    for card in cards: 
      try:
        season_element = card.find(class_="baker-avatars__group__title")
        season_text = season_element.get_text() if season_element else ""
        parsed_season_text = ''.join(filter(str.isdigit, season_text))
        season = int(parsed_season_text) if parsed_season_text else None
        bakers = card.find_all(class_="baker-avatars__list__item")

        for baker in bakers:
          _baker = baker.find("img")
          if not _baker:
            continue
          img = _baker.get('src', '')
          name = _baker.get('alt', '')
        
          results.append({
            'img': img,
            'name': name,
            'season': season
          })

      except requests.RequestException as e:
        self.logger.error(f"Request error on page {page}: {e}")
        return []
    
    return results
  
  def _save_to_db(self, results: List[dict]) -> None:
    self.logger.debug('Saving to DB...')
    for result in results:  
      self.sql.execute('INSERT OR IGNORE INTO bakers(name, img, season) VALUES(:name, :img, :season)', result)
      self.connection.commit()


class DataScraper(RecipeScraper):
  def __init__(self, model: str, value: str, param: str | None = None):
    super().__init__()
    self.logger.debug('Initializing DataScraper...')
    self.model = model
    self.value = value
    self.param = param if param else model
    self.fk = param + '_id' if param else model.rstrip('s') + '_id'

  def _generate_page_url(self, page_number: int) -> str:
    return f"{self.base_url}/page/{page_number}?{self.param}={self.value}"
  
  def _save_to_db(self, results: List[dict]) -> None:
    self.logger.debug('Saving to DB...')
    self.sql.execute(f'INSERT OR IGNORE INTO {self.model}(name) VALUES(?)', (self.value,) )
    model_id = self.sql.execute(f'SELECT id FROM {self.model} WHERE name = :name', { "name": self.value }).fetchone()[0]

    for result in results:
      recipe_id = self.sql.execute('SELECT id FROM recipes WHERE link = :link', result).fetchone()[0]

      if recipe_id is None:
        self.logger.debug(f"Unable to find recipe {result['link']}")
        continue
      else:
        self.sql.execute(f'INSERT OR IGNORE INTO recipe_{self.model}(recipe_id, {self.fk}) VALUES(?, ?)', (recipe_id, model_id))
      
    self.connection.commit()

class UpdateScraper:
  def __init__(self):
    self.logger = get_logger(__name__)
    self.logger.debug('Initializing UpdateScraper...')
    
    # Config DB connection
    db_file = get_db_file_path()
    self.connection = sqlite3.connect(db_file, check_same_thread=False)
    self.sql = self.connection.cursor()
    self.db_lock = Lock()

  def _get_soup(self, url: str) -> BeautifulSoup:
    headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    }
    page = requests.get(url, headers=headers)
    soup = BeautifulSoup(page.content, "html.parser")
    return soup

  def _scrape_series_baker(self, series_url: str) -> List[dict]:
    """Scrape a single series for bakers"""
    self.logger.info(f'Scraping series: {series_url}')
    
    try:
      # Create a new connection for this thread
      db_file = get_db_file_path()
      connection = sqlite3.connect(db_file)
      sql = connection.cursor()
      
      # Get soup for this series
      soup = self._get_soup(series_url)
      cards = soup.find_all(class_="baker-avatars__group")
      
      results = []
      for card in cards: 
        try:
          season_text = card.find(class_="baker-avatars__group__title").string
          parsed_season_text = ''.join(filter(str.isdigit, season_text))
          season = int(parsed_season_text) if parsed_season_text else None
          bakers = card.find_all(class_="baker-avatars__list__item")

          for baker in bakers:
            _baker = baker.find("img")
            img = _baker['src']
            name = _baker['alt']
          
            results.append({
              'img': img,
              'name': name,
              'season': season
            })
        except Exception as e:
          self.logger.error(f"Error processing baker card: {e}")
          continue
      
      # Save to database
      for result in results:  
        sql.execute('INSERT OR IGNORE INTO bakers(name, img, season) VALUES(:name, :img, :season)', result)
        connection.commit()
      
      connection.close()
      return results
      
    except Exception as e:
      self.logger.error(f'Error scraping series {series_url}: {e}')
      return []

  def _scrape_recipe_page(self, page_num: int) -> List[dict]:
    """Scrape a single recipe page"""
    self.logger.info(f'Scraping recipe page: {page_num}')
    
    try:
      # Create a new connection for this thread
      db_file = get_db_file_path()
      connection = sqlite3.connect(db_file)
      sql = connection.cursor()
      
      url = f"https://thegreatbritishbakeoff.co.uk/recipes/all/page/{page_num}"
      soup = self._get_soup(url)
      cards = soup.find_all(class_="recipes-loop__item")
      
      results = []
      for card in cards: 
        try:
          figure = card.find("figure")
          if not figure:
            continue
          img = figure.find("img")
          if not img:
            continue

          content = card.find(class_="recipes-loop__item__content")
          if not content:
            continue
          h5 = content.find('h5')
          if not h5:
            continue
          title = str(h5.get_text()) if h5 and hasattr(h5, 'get_text') else ""        
          meta = card.find(class_="recipes-loop__item__meta")
          if not meta:
            continue

          thumbnail = card.find(class_="thumbnail-baker")
          baker_info = None if thumbnail is None else thumbnail.find('img')
          
          difficulty_level = meta.find('span', class_="difficulty-level")
          difficulty = None if difficulty_level is None else len(difficulty_level.select('span:not([class*="disabled"])'))

          dietary = meta.find_all(class_='dietary__item')  

          time = next(iter(meta.select('span[class*="bakingTime"]')), None)
          if time != None:
            time = parse_time_to_minutes(time.string)

          results.append({
            'link': card.find('a')['href'],
            'img': img['src'],
            'title': title,
            'baker': None if baker_info is None else {
              'name': baker_info['alt'],
              'img': baker_info['src']
            },
            'difficulty': difficulty,
            'diets': [x.get("title") for x in dietary if x and hasattr(x, 'get')],
            'time': time
          })
        except Exception as e:
          self.logger.error(f"Error processing recipe card: {e}")
          continue
      
      # Save to database
      for result in results:
        baker_id = None
        baker = result['baker']
        if (result['baker']):
          # Try to find existing baker first
          row = sql.execute("SELECT id FROM bakers WHERE name = :name AND img = :img", baker).fetchone()

          if row is None:
            # Baker doesn't exist, create new record
            sql.execute('INSERT INTO bakers(name, img) VALUES(:name, :img)', baker)
            baker_id = sql.lastrowid
          else:
            baker_id = row[0]

        sql.execute(''' 
                     INSERT OR IGNORE INTO recipes(link, img, title, difficulty, time, baker_id) 
                     VALUES(:link, :img, :title, :difficulty, :time, :baker_id)
                     ''', 
                     {**result, **{ "baker_id": baker_id }}
                     )
        
        # Get recipe_id - either from new insert or existing record
        recipe_row = sql.execute('SELECT id FROM recipes WHERE link = :link', result).fetchone()
        recipe_id = recipe_row[0] if recipe_row else sql.lastrowid
        
        if len(result["diets"]) > 0:
          # insert into diets table
          diet_params = list(map(lambda x: (x,), result['diets']))
          sql.executemany("INSERT OR IGNORE INTO diets(name) VALUES(?)", diet_params)
          connection.commit()
          # fetch diet_id array
          placeholders = ','.join('?' * len(result["diets"]))
          sql.execute(f'SELECT id FROM diets WHERE name IN ({placeholders})', result['diets'])
          diet_ids = sql.fetchall()
          # create (diet_id, recipe_id) tuple and insert into recipe_diets table
          recipe_diet_params = list(map(lambda x: (*x, recipe_id), diet_ids))
          sql.executemany("INSERT OR IGNORE INTO recipe_diets(diet_id, recipe_id) VALUES(?,?)", recipe_diet_params)
        
        connection.commit()
      
      connection.close()
      return results
      
    except Exception as e:
      self.logger.error(f'Error scraping recipe page {page_num}: {e}')
      return []

  def update_bakers(self, max_workers: int = 4) -> None:
    """Update bakers by scraping all available series from the bakers page in parallel"""
    self.logger.info('Updating bakers...')
    
    try:
      # Get the bakers page to find all available series
      soup = self._get_soup('https://thegreatbritishbakeoff.co.uk/bakers/')
      
      # Find the series navigation element
      series_nav = soup.find('nav', id='series-category')
      if not series_nav:
        self.logger.error('Could not find series navigation element')
        return
      
      # Extract all series links
      series_links = series_nav.find_all('a') if series_nav else []
      series_urls = []
      
      for link in series_links:
        href = link.get('href')
        if href and 'series-' in href:
          series_urls.append(href)
      
      self.logger.info(f'Found {len(series_urls)} series to scrape with {max_workers} workers')
      
      # Scrape series in parallel
      with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_url = {executor.submit(self._scrape_series_baker, url): url for url in series_urls}
        
        for future in concurrent.futures.as_completed(future_to_url):
          url = future_to_url[future]
          try:
            results = future.result()
            self.logger.info(f'Completed scraping {url}: {len(results)} bakers')
          except Exception as exc:
            self.logger.error(f'Series {url} generated an exception: {exc}')
        
    except Exception as e:
      self.logger.error(f'Error updating bakers: {e}')

  def update_recipes(self, max_workers: int = 4) -> None:
    """Update recipes by checking for new content on the first few pages in parallel"""
    self.logger.info('Updating recipes...')
    
    try:
      max_pages = 5  # Limit to first 5 pages for updates
      page_numbers = list(range(1, max_pages + 1))
      
      self.logger.info(f'Scraping {max_pages} recipe pages with {max_workers} workers')
      
      # Scrape pages in parallel
      with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_page = {executor.submit(self._scrape_recipe_page, page): page for page in page_numbers}
        
        for future in concurrent.futures.as_completed(future_to_page):
          page = future_to_page[future]
          try:
            results = future.result()
            self.logger.info(f'Completed scraping page {page}: {len(results)} recipes')
          except Exception as exc:
            self.logger.error(f'Page {page} generated an exception: {exc}')
        
    except Exception as e:
      self.logger.error(f'Error updating recipes: {e}')

  def update_metadata(self) -> None:
    """Update categories and bake types metadata"""
    self.logger.info('Updating metadata...')
    
    try:
      add_metadata()
    except Exception as e:
      self.logger.error(f'Error updating metadata: {e}')

  def update_all(self, max_workers: int = 4) -> None:
    """Run all update operations with parallel processing"""
    self.logger.info(f'Starting full update with {max_workers} workers...')
    
    self.update_bakers(max_workers)
    self.update_recipes(max_workers)
    self.update_metadata()
    
    self.connection.close()
    self.logger.info('Update completed!')

# Iterate over remaining queries and add metadata fields
def add_metadata() -> None:
  page = requests.get('https://thegreatbritishbakeoff.co.uk/recipes/all')
  soup = BeautifulSoup(page.content, "html.parser")
  
  categories = soup.select('input[name="category"]')
  for category in categories:
    category_value = category.get('value')
    if not category_value or category_value == 'All':
      continue
    categoryScraper = DataScraper('categories', str(category_value), 'category')
    categoryScraper.scrape()

  types = soup.select('input[name="type"]')
  for type_input in types:
    type_value = type_input.get('value')
    if not type_value or type_value == 'All':
      continue
    typeScraper = DataScraper('bake_types', str(type_value), 'type')
    typeScraper.scrape()

    