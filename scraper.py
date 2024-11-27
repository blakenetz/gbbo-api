import requests
from bs4 import BeautifulSoup
import sqlite3

connection = sqlite3.connect("gbbo.db")
sql = connection.cursor()

URL = "https://thegreatbritishbakeoff.co.uk/recipes/all/"
page = requests.get(URL)

soup = BeautifulSoup(page.content, "html.parser")

cards = soup.find_all(class_="recipes-loop__item")

def extract(card):
  figure = card.find("figure")
  img = list(filter(lambda x: x.name == 'img', figure.children))[0]

  title = card.find(class_="recipes-loop__item__content").find('h5').string
  
  thumbnail = card.find(class_="thumbnail-baker").find('img')

  meta = card.find(class_="recipes-loop__item__meta")
  
  difficulty_level = meta.find('span', class_="difficulty-level")
  difficulty = len(difficulty_level.select('span:not([class*="disabled"])'))

  dietary = meta.find_all(class_='dietary__item')  
  

  time = next(iter(meta.select('span[class*="bakingTime"]')), None)
  if time != None:
    time = time.string

  return {
    'link': card.find('a')['href'],
    'img': img['src'],
    'title': title,
    'baker': {
      'name': thumbnail['alt'],
      'img': thumbnail['src']
    },
    'difficulty': difficulty,
    'diets': list(map(lambda x: (x["title"], ), dietary)),
    'is_technical': 1 if card.find(class_="recipes-loop__item__tag") is not None else 0,
    'time': time
  }

results = list(map(extract, cards))

# print(results)

for result in results:  
  sql.execute('INSERT OR IGNORE INTO bakers(name, img) VALUES(?,?)', (result["baker"]['name'], result["baker"]['img']))
  baker_id = sql.lastrowid

  sql.execute(''' 
              INSERT INTO recipes(link, img, title, difficulty, is_technical, time, baker_id) 
                VALUES(?,?,?,?,?,?,?)
              ''', 
              (result["link"], result["img"], result["title"], result["difficulty"], result["is_technical"], result["time"], baker_id)
              )
  recipe_id = sql.lastrowid
  
  if len(result["diets"]) > 0:
    sql.executemany("INSERT OR IGNORE INTO diets(name) VALUES(?)", result["diets"])
    # for diet_id in result["diets"]:
    #   sql.execute('INSERT INTO recipe_diets(recipe_id, diet_id) VALUES(?,?)', (recipe_id, diet_id))
    

  

