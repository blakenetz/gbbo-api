import requests
from bs4 import BeautifulSoup, PageElement, ResultSet
import time
import random
import logging
import sqlite3
from typing import List

class WebScraper:
  def __init__(self):
    self.base_url = "https://thegreatbritishbakeoff.co.uk/recipes/all/"

    # Configure logging
    logging.basicConfig(
      level=logging.DEBUG, 
      format='🍰 %(asctime)s - %(levelname)s: %(message)s'
    )
    self.logger = logging.getLogger(__name__)
    self.logger.debug('Initializing...')

    # Config DB connection
    self.connection = sqlite3.connect("gbbo.db")
    self.sql = self.connection.cursor()

  def _generate_page_url(self, page_number: int) -> str:
    return f"{self.base_url}/page/{page_number}"

  def _scrape_page(self, url: str) -> List[dict]:
    self.logger.debug('Scraping page...')
    page = requests.get(url)
    soup = BeautifulSoup(page.content, "html.parser")
    cards = soup.find_all(class_="recipes-loop__item")
    return self._extract_items(cards, page)
  
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
          time = time.string

        results.append({
          'link': card.find('a')['href'],
          'img': img['src'],
          'title': title,
          'baker': None if baker_info is None else { 'name': baker_info['alt'], 'img': baker_info['src'] },
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
      if (result['baker']):
        self.sql.execute('INSERT OR IGNORE INTO bakers(name, img) VALUES(?,?)', (result["baker"]['name'], result["baker"]['img']))
        baker_id = self.sql.lastrowid

      self.sql.execute(''' 
                  INSERT INTO recipes(link, img, title, difficulty, is_technical, time, baker_id) 
                    VALUES(?,?,?,?,?,?,?)
                  ''', 
                  (result["link"], result["img"], result["title"], result["difficulty"], result["is_technical"], result["time"], baker_id)
                  )
      recipe_id = self.sql.lastrowid
      
      if len(result["diets"]) == 0:
        self.connection.commit()
      else:
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

  def scrape(self) -> None:
    self.logger.debug('Scraping...')
    page = 1
    recipe_count = 0
    while True:
      url = self._generate_page_url(page)
      results = self._scrape_page(url)
      count = len(results)
      recipe_count += count

      if count == 0:
        break
      
      self.logger.info(f"Scraped page {page}: {count} items")
      self._save_to_db(results)
      page += 1
      # we want 4 rps
      time.sleep(.25)
    
    self.logger.info(f"Total pages scraped: {page}")
