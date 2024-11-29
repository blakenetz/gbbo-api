from typing import Annotated, TypedDict, Union
from fastapi import FastAPI, HTTPException, Query, Depends
import logging 
from sqlmodel import Field, Session, SQLModel, create_engine, select, UniqueConstraint

class Recipe(SQLModel, table=True, extend_existing=True):
  __tablename__ = 'recipes'

  id: Union[int, None] = Field(default=None, primary_key=True)
  title: str = Field(nullable=False)
  link: str = Field(nullable=False, unique=True)
  img: str = Field(nullable=False)
  difficulty: Union[int, None]
  is_technical: bool = Field(nullable=False)
  time: Union[int, None]
  baker_id: Union[int, None] = Field(default=None, foreign_key="bakers.id")

class Diet(SQLModel, table=True, extend_existing=True):
  __tablename__ = 'diets'

  id: Union[int, None] = Field(default=None, primary_key=True)
  name: str = Field(nullable=False, unique=True)

class Baker(SQLModel, table=True, extend_existing=True):
  __tablename__ = 'bakers'
  __table_args__ = (UniqueConstraint('name', 'img'),)

  id: Union[int, None] = Field(default=None, primary_key=True)
  name: str = Field(nullable=False)
  img: str = Field(nullable=False)

class RecipeDiet(SQLModel, table=True, extend_existing=True):
  __tablename__ = 'recipe_diets'
  __table_args__ = (UniqueConstraint('recipe_id', 'diet_id'),)
  
  id: Union[int, None] = Field(default=None, primary_key=True)
  recipe_id: int = Field(foreign_key="recipes.id", nullable=False)
  diet_id: int = Field(foreign_key="diets.id", nullable=False)

# Configure logging
logging.basicConfig(
  level=logging.DEBUG, 
  format='🍰 %(asctime)s - %(levelname)s: %(message)s',
)
logger = logging.getLogger(__name__)

# Config DB connection
sqlite_file_name = "gbbo.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args, echo=True)

def create_db_and_tables():
  SQLModel.metadata.create_all(engine)

def get_session():
  with Session(engine) as session:
    yield session

SessionDep = Annotated[Session, Depends(get_session)]

app = FastAPI()

@app.on_event("startup")
def on_startup():
  create_db_and_tables()

@app.get("/")
def read_root():
  return {"data": [], 'message': 'Greetings from the unofficial GBBO API!'}

@app.get("/recipes")
def get_recipes(
  session: SessionDep,
  q: Annotated[Union[str, None], Query(description="Case insensitive search against recipe title")] = None, 
  limit: Union[int, None] = 50, 
  skip: Union[int, None] = 0, 
  baker_ids: Annotated[list[int], Query(description="List of baker ids. Available at GET /bakers")] = None, 
  diet_ids: Annotated[list[int], Query(description="List of diet ids. Available at GET /diets")] = None,
  difficulty: Annotated[Union[int, None], Query(le=3, ge=1, description="Difficulty on a 1-3 scale")] = None, 
  is_technical: Annotated[Union[bool, None], Query(description="Filter by technical bakes only")] = None, 
  time: Annotated[Union[int, None], Query(description="Max time in minutes")] = None, 
): 
  statement = select(Recipe).offset(skip).limit(limit)
  if (q):
    statement = statement.where(Recipe.title.contains(q))
  if (baker_ids):
    statement = statement.where(Recipe.baker_id.in_(baker_ids))
  if (difficulty):
    statement = statement.where(Recipe.difficulty == difficulty)
  if (is_technical):
    statement = statement.where(Recipe.is_technical == is_technical)
  if (time):
    statement = statement.where(Recipe.time <= time)

  results = session.exec(statement).all()
  return {"data": list(results)}

@app.get("/recipe/{recipe_id}")
def get_recipe(recipe_id: int, session: SessionDep):
  result = session.get(Recipe, recipe_id)
  return {"data": result}

@app.get("/bakers")
def get_bakers(
  session: SessionDep,
  q: Annotated[Union[str, None], Query(description="Case insensitive search against baker's name")] = None
):
  statement = select(Baker)
  if (q):
    statement = statement.where(Baker.name.contains(q))
  
  results = session.exec(statement).all()
  return {"data": list(results)}

@app.get("/baker/{baker_id}")
def get_baker(baker_id: int, session: SessionDep):
  result = session.get(Baker, baker_id)
  return {"data": result}

@app.get("/diets")
def get_diets(
  session: SessionDep,
  q: Annotated[Union[str, None], Query(description="Case insensitive search against diet name")] = None
):
  statement = select(Diet)
  if (q):
    statement = statement.where(Diet.name.contains(q))
  
  results = session.exec(statement).all()
  return {"data": list(results)}

@app.get("/diet/{diet_id}")
def get_diet(diet_id: int, session: SessionDep):
  result = session.get(Diet, diet_id)
  return {'data': result}


