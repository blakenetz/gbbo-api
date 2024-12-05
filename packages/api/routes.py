from typing import Annotated, Optional
from fastapi import APIRouter, Query
from db import SessionDep
from models import Baker, Diet
from services import GenericService, RecipeService

recipe_router = APIRouter()
baker_router = APIRouter()
diet_router = APIRouter()

@recipe_router.get("/recipes", tags=['recipes'])
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

@recipe_router.get("/recipe/{recipe_id}", tags=['recipes'])
def get_recipe(session: SessionDep, recipe_id: int):
  return RecipeService.get_recipe(session, recipe_id)

@baker_router.get("/bakers", tags=['bakers'])
def get_bakers(
  session: SessionDep,
  q: Annotated[Optional[str], Query(description="Case insensitive search against baker's name")] = None
):
  return GenericService.get_items(Baker, session, q)
  
@baker_router.get("/baker/{baker_id}", tags=['bakers'])
def get_baker(baker_id: int, session: SessionDep):
  return GenericService.get_item(Baker, session, baker_id)

@diet_router.get("/diets", tags=['diets'])
def get_diets(
  session: SessionDep,
  q: Annotated[Optional[str], Query(description="Case insensitive search against diet name")] = None
):
  return GenericService.get_items(Diet, session, q)

@diet_router.get("/diet/{diet_id}", tags=['diets'])
def get_diet(diet_id: int, session: SessionDep):
  return GenericService.get_item(Diet, session, diet_id)
