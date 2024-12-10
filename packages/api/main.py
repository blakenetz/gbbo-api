from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from db import create_db_and_tables
from routes import recipe_router, diet_router, baker_router
from util import get_logger 

logger = get_logger(__name__)

# FastAPI Setup
app = FastAPI(
  title="GBBO Recipe API",
  description="Unofficial API for Great British Bake Off Recipes",
  version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(recipe_router, prefix='/recipe', tags=['recipe'])
app.include_router(baker_router, prefix="/baker", tags=['baker'])
app.include_router(diet_router, prefix="/diet", tags=['diet'])

@app.on_event("startup")
def on_startup():
  create_db_and_tables()

# Run application
if __name__ == "__main__":
  uvicorn.run(app, host="0.0.0.0", port=8000)