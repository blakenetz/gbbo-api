import logging
import os

def get_logger(name):
  logging.basicConfig(
    level=logging.DEBUG if os.getenv('NODE_ENV') == 'development' else logging.INFO,
    format='🍰 %(asctime)s - %(levelname)s: %(message)s',
  )
  return logging.getLogger(name)
  