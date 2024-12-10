from typing import Annotated, Optional
from fastapi import APIRouter, Query
from db import SessionDep
from models import Baker, Diet
from services import GenericService, RecipeService

recipe_router = APIRouter()
baker_router = APIRouter()
diet_router = APIRouter()

# recipe router
@recipe_router.get("/")
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

@recipe_router.get("/count")
def get_recipe_count(session: SessionDep):
  return RecipeService.get_recipe_count(session)

@recipe_router.get("/{recipe_id}")
def get_recipe_by_id(session: SessionDep, recipe_id: int):
  return RecipeService.get_recipe(session, recipe_id)


# baker router
@baker_router.get("/")
def get_bakers(
  session: SessionDep,
  q: Annotated[Optional[str], Query(description="Case insensitive search against baker's name")] = None
):
  return GenericService.get_items(Baker, session, q)
  
@baker_router.get("/count")
def get_baker_count(session: SessionDep):
  return GenericService.get_item_count(Baker, session)

@baker_router.get("/{baker_id}")
def get_baker_by_id(baker_id: int, session: SessionDep):
  return GenericService.get_item(Baker, session, baker_id)


# diet router
@diet_router.get("/")
def get_diets(
  session: SessionDep,
  q: Annotated[Optional[str], Query(description="Case insensitive search against diet name")] = None
):
  return GenericService.get_items(Diet, session, q)

@diet_router.get("/count")
def get_diet_count(session: SessionDep):
  return GenericService.get_item_count(Baker, session)

@diet_router.get("/{diet_id}")
def get_diet_by_id(diet_id: int, session: SessionDep):
  return GenericService.get_item(Diet, session, diet_id)
