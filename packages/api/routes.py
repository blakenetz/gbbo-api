from typing import Annotated, Optional
from fastapi import APIRouter, Query
from db import SessionDep
from models import BakeType, Baker, Category, Diet
from services import GenericService, RecipeService

recipe_router = APIRouter()
baker_router = APIRouter()
diet_router = APIRouter()
category_router = APIRouter()
bake_type_router = APIRouter()
# recipe router
@recipe_router.get("/")
def get_recipes(
  session: SessionDep,
  limit: Optional[int] = 50,
  skip: Optional[int] = 0,
  q: Annotated[Optional[str], Query(description="Case insensitive search against recipe title")] = None,
  difficulty: Annotated[Optional[int], Query(le=3, ge=1, description="Difficulty on a 1-3 scale")] = None,
  time: Annotated[Optional[int], Query(description="Max time in minutes")] = None,
  baker_ids: Annotated[list[int], Query(description="List of baker ids. Available at GET /bakers")] = None,
  diet_ids: Annotated[list[int], Query(description="List of diet ids. Available at GET /diets")] = None,
  category_ids: Annotated[list[int], Query(description="List of category ids. Available at GET /categories")] = None,
  bake_type_ids: Annotated[list[int], Query(description="List of bake type ids. Available at GET /bake_types")] = None,
  season: Annotated[Optional[int], Query(description="Filter by baker season")] = None,
):
  return RecipeService.get_recipes(
    session, limit, skip, q, difficulty, 
     time, baker_ids, diet_ids,
    category_ids, bake_type_ids, season
  )

@recipe_router.get("/count")
def get_recipe_count(
  session: SessionDep,
  q: Annotated[Optional[str], Query(description="Case insensitive search against recipe title")] = None,
  difficulty: Annotated[Optional[int], Query(le=3, ge=1, description="Difficulty on a 1-3 scale")] = None,
  time: Annotated[Optional[int], Query(description="Max time in minutes")] = None,
  baker_ids: Annotated[list[int], Query(description="List of baker ids. Available at GET /bakers")] = None,
  diet_ids: Annotated[list[int], Query(description="List of diet ids. Available at GET /diets")] = None,
  category_ids: Annotated[list[int], Query(description="List of category ids. Available at GET /categories")] = None,
  bake_type_ids: Annotated[list[int], Query(description="List of bake type ids. Available at GET /bake_types")] = None,
  season: Annotated[Optional[int], Query(description="Filter by baker season")] = None,
):
  return RecipeService.get_recipe_count(session, q, difficulty, time, baker_ids, diet_ids, category_ids, bake_type_ids, season)

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
  return GenericService.get_item_count(Diet, session)

@diet_router.get("/{diet_id}")
def get_diet_by_id(diet_id: int, session: SessionDep):
  return GenericService.get_item(Diet, session, diet_id)

# category router
@category_router.get("/")
def get_categories(
  session: SessionDep,
  q: Annotated[Optional[str], Query(description="Case insensitive search against category name")] = None
):
  return GenericService.get_items(Category, session, q) 

@category_router.get("/count")
def get_category_count(session: SessionDep):
  return GenericService.get_item_count(Category, session)

@category_router.get("/{category_id}")
def get_category_by_id(category_id: int, session: SessionDep):
  return GenericService.get_item(Category, session, category_id)

# bake type router
@bake_type_router.get("/")
def get_bake_types(
  session: SessionDep,
  q: Annotated[Optional[str], Query(description="Case insensitive search against bake type name")] = None
):
  return GenericService.get_items(BakeType, session, q) 

@bake_type_router.get("/count")
def get_bake_type_count(session: SessionDep):
  return GenericService.get_item_count(BakeType, session)

@bake_type_router.get("/{bake_type_id}")
def get_bake_type_by_id(bake_type_id: int, session: SessionDep):
  return GenericService.get_item(BakeType, session, bake_type_id)