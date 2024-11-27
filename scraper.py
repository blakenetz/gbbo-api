import requests
from bs4 import BeautifulSoup

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
    'img': img.src,
    'title': title,
    'baker': {
      'name': thumbnail['alt'],
      'img': thumbnail['src']
    },
    'meta': {
      'difficulty': difficulty,
      'diets': list(map(lambda x: x["title"], dietary)),
      'is_technical': card.find(class_="recipes-loop__item__tag") is not None,
      'time': time
    }
  }

results = list(map(extract, cards))


