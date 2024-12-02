from fastapi import FastAPI
import logging
import uvicorn
from db import create_db_and_tables
from routes import recipe_router, diet_router, baker_router 

# Configure logging
logging.basicConfig(
  level=logging.INFO, 
  format='🍰 %(asctime)s - %(levelname)s: %(message)s',
)
logger = logging.getLogger(__name__)

# FastAPI Setup
app = FastAPI(
  title="GBBO Recipe API",
  description="Unofficial API for Great British Bake Off Recipes",
  version="0.1.0"
)

# Include API routers
app.include_router(recipe_router, tags=["recipes"])
app.include_router(baker_router, tags=["bakers"])
app.include_router(diet_router, tags=["diets"])

@app.on_event("startup")
def on_startup():
  create_db_and_tables()

# Run application
if __name__ == "__main__":
  uvicorn.run(app, host="0.0.0.0", port=8000)