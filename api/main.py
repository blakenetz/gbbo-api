from typing import Annotated, Optional
from fastapi import FastAPI, Query, Depends
import logging 
from sqlmodel import Session, SQLModel, create_engine
from models import Baker, Diet
from services import GenericService, RecipeService

# Configure logging
logging.basicConfig(
  level=logging.INFO, 
  format='🍰 %(asctime)s - %(levelname)s: %(message)s',
)
logger = logging.getLogger(__name__)

# Config DB connection
sqlite_file_name = "gbbo.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args, echo=True)

# DB helper functions and types
def create_db_and_tables():
  SQLModel.metadata.create_all(engine)

def get_session():
  with Session(engine) as session:
    yield session

SessionDep = Annotated[Session, Depends(get_session)]
  
# FastAPI Setup
app = FastAPI(
  title="GBBO Recipe API",
  description="Unofficial API for Great British Bake Off Recipes",
  version="0.1.0"
)

@app.on_event("startup")
def on_startup():
  create_db_and_tables()

@app.get("/recipes")
def get_recipes(
  session: SessionDep,
  limit: Optional[int] = 50,
  skip: Optional[int] = 0,
  q: Annotated[Optional[str], Query(description="Case insensitive search against recipe title")] = None,
  difficulty: Annotated[Optional[int], Query(le=3, ge=1, description="Difficulty on a 1-3 scale")] = None,
  is_technical: Annotated[Optional[bool], Query(description="Filter by technical bakes only")] = None,
  time: Annotated[Optional[int], Query(description="Max time in minutes")] = None,
  baker_ids: Annotated[list[int], Query(description="List of baker ids. Available at GET /bakers")] = None,
  diet_ids: Annotated[list[int], Query(description="List of diet ids. Available at GET /diets")] = None,
):
  return RecipeService.get_recipes(
    session, limit, skip, q, difficulty, 
    is_technical, time, baker_ids, diet_ids
  )

@app.get("/recipe/{recipe_id}")
def get_recipe(session: SessionDep, recipe_id: int):
  return RecipeService.get_recipe(session, recipe_id)

@app.get("/bakers")
def get_bakers(
  session: SessionDep,
  q: Annotated[Optional[str], Query(description="Case insensitive search against baker's name")] = None
):
  return GenericService.get_items(Baker, session, q)
  
@app.get("/baker/{baker_id}")
def get_baker(baker_id: int, session: SessionDep):
  return GenericService.get_item(Baker, session, baker_id)

@app.get("/diets")
def get_diets(
  session: SessionDep,
  q: Annotated[Optional[str], Query(description="Case insensitive search against diet name")] = None
):
  return GenericService.get_items(Diet, session, q)

@app.get("/diet/{diet_id}")
def get_diet(diet_id: int, session: SessionDep):
  return GenericService.get_item(Diet, session, diet_id)
