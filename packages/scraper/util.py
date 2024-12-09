import logging
import os

def get_logger(name: str) -> logging.Logger:
  logging.basicConfig(
      level=logging.INFO, 
      format='🍰 %(asctime)s - %(levelname)s: %(message)s'
    )
  return logging.getLogger(name)

def get_db_file_path() -> str:
  script_dir = os.path.abspath(os.path.dirname(__file__))
  return os.path.join(script_dir, "../../gbbo.db")