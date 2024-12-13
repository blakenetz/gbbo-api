import requests
from bs4 import BeautifulSoup, PageElement, ResultSet
import time
import sqlite3
from typing import List
import re

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
  def __init__(self):
    # Configure logging
    self.logger = get_logger(__name__)
    self.logger.debug('Initializing...')

    # Config DB connection
    db_file = get_db_file_path()
    self.connection = sqlite3.connect(db_file)
    self.sql = self.connection.cursor()

    self.base_url = "https://thegreatbritishbakeoff.co.uk/"
    self.card_selector = "recipes-loop__item"

    # uncomment to enable sql trace
    # self.connection.set_trace_callback(print)

  # Use regex to remove the NNNxNNN substring before the file extension
  def _normalize_image_url(self, url: str) -> str:
    return re.sub(r'-\d+x\d+(-\d+)?', '', url)
  
  def _generate_page_url(self, page_number: int) -> str:  
    return self.base_url
  
  def _get_soup(self, url: str) -> BeautifulSoup:
    self.logger.debug('Initializing BeautifulSoup...')
    page = requests.get(url)
    soup = BeautifulSoup(page.content, "html.parser")
    return soup
  
  
  def _scrape_page(self, url: str, page: int) -> List[dict]:
    self.logger.debug('Scraping page...')
    soup = self._get_soup(url)
    cards = soup.find_all(class_=self.card_selector)
    return self._extract_items(cards, page)
  
  def _extract_items(self, cards: ResultSet[PageElement], page: int) -> List[dict]: 
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
      page += 1
      # we want 4 rps
      time.sleep(.25)
    
    self.logger.info(f"Total pages scraped: {page}")
    self.connection.close()

  

class RecipeScraper(WebScraper):
  def __init__(self):
    super().__init__()
    self.logger.debug('Initializing RecipeScraper...')
    self.base_url = "https://thegreatbritishbakeoff.co.uk/recipes/all/"
    self.card_selector = "recipes-loop__item"
    

  def _generate_page_url(self, page_number: int) -> str:
    return f"{self.base_url}/page/{page_number}"
  
  def _extract_items(self, cards: ResultSet[PageElement], page: int) -> List[dict]:
    self.logger.debug('Extracting items...')
    
    if len(cards) == 0:
      return []
    
    results = []
    for card in cards: 
      try:
        figure = card.find("figure")
        img = list(filter(lambda x: x.name == 'img', figure.children))[0]

        title = card.find(class_="recipes-loop__item__content").find('h5').string
        
        thumbnail = card.find(class_="thumbnail-baker")
        baker_info = None if thumbnail is None else thumbnail.find('img')

        meta = card.find(class_="recipes-loop__item__meta")
        
        difficulty_level = meta.find('span', class_="difficulty-level")
        difficulty = None if difficulty_level is None else len(difficulty_level.select('span:not([class*="disabled"])'))

        dietary = meta.find_all(class_='dietary__item')  

        time = next(iter(meta.select('span[class*="bakingTime"]')), None)
        if time != None:
          time = parse_time_to_minutes(time.string)

        results.append({
          'link': card.find('a')['href'],
          'img': self._normalize_image_url(img['src']),
          'title': title,
          'baker': None if baker_info is None else { 
            'name': baker_info['alt'], 
            'img': self._normalize_image_url(baker_info['src']) 
          },
          'difficulty': difficulty,
          'diets': list(map(lambda x: x["title"], dietary)),
          'is_technical': 1 if card.find(class_="recipes-loop__item__tag") is not None else 0,
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
                       INSERT INTO recipes(link, img, title, difficulty, is_technical, time, baker_id) 
                       VALUES(:link, :img, :title, :difficulty, :is_technical, :time, :baker_id)
                       ''', 
                       {**result, **{ "baker_id": baker_id }}
                       )
      recipe_id = self.sql.lastrowid
      
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

class BakerScraper(WebScraper):
  def __init__(self):
    super().__init__()
    self.logger.debug('Initializing RecipeScraper...')
    self.base_url = "https://thegreatbritishbakeoff.co.uk/bakers"
    self.card_selector = "featured-block"

  def _generate_page_url(self, page_number: int) -> str:
    return f"{self.base_url}/series-{page_number}"
  
  def _extract_items(self, cards: ResultSet[PageElement], page: int) -> List[dict]:
    self.logger.debug('Extracting items...')
    
    if len(cards) == 0:
      return []
    
    results = []
    for card in cards: 
      try:
        img = card.find("img")
        name = card.find('h3').string
        
        results.append({
          'img': self._normalize_image_url(img['src']),
          'name': name,
          'season': page
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