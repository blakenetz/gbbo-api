from typing import List, Optional, Union
from fastapi import HTTPException
from sqlmodel import Session,  select
from sqlmodel.sql.expression import SelectOfScalar
from sqlalchemy.orm import selectinload
from models import Baker, Diet, Recipe, RecipeDiet, RecipeResponse

class RecipeService:
  @staticmethod 
  def parse_recipe(db_result: Recipe) -> RecipeResponse:
    data = db_result.model_dump(exclude={'baker_id'})
    data['baker'] = db_result.baker.model_dump(exclude={"recipes"}) if db_result.baker else None
    data['diet'] = db_result.diets
    
    return data
  
  @staticmethod 
  def get_root_statement() -> SelectOfScalar[Recipe]:
    return (
      select(Recipe)
      .options(
        selectinload(Recipe.baker),
        selectinload(Recipe.diets)
      )
    )
  
  @classmethod
  def get_recipes(
    self,
    session: Session,
    limit: int = 50,
    skip: int = 0,
    q: Optional[str] = None,
    difficulty: Optional[int] = None,
    is_technical: Optional[bool] = None,
    time: Optional[int] = None,
    baker_ids: Optional[List[int]] = None,
    diet_ids: Optional[List[int]] = None
  ) -> List[dict]:
    """Fetch recipes with multiple filtering options."""
    statement = self.get_root_statement()
    statement = statement.offset(skip).limit(limit)
    
    # Apply filters dynamically
    filters = [
      (q, lambda s: s.where(Recipe.title.contains(q))),
      (difficulty, lambda s: s.where(Recipe.difficulty == difficulty)),
      (is_technical is not None, lambda s: s.where(Recipe.is_technical == is_technical)),
      (time, lambda s: s.where(Recipe.time <= time)),
      (baker_ids, lambda s: s.where(Recipe.baker_id.in_(baker_ids))),
    ]
    
    for condition, filter in filters:
      if condition:
        statement = filter(statement)
    
    # Special handling for diet_ids
    if diet_ids:
      statement = (
        statement
        .join(RecipeDiet, RecipeDiet.recipe_id == Recipe.id)
        .where(RecipeDiet.diet_id.in_(diet_ids))
        .distinct()
      )

    results = session.exec(statement).all()
    
    if not results:
      raise HTTPException(status_code=404, detail="No recipes found")
    
    return [self.parse_recipe(result) for result in results]
  
  @classmethod
  def get_recipe(
    self,
    session: Session,
    id: int,
  ) -> List[dict]:
    statement = self.get_root_statement()
    statement = statement.where(Recipe.id == id)
    
    result = session.exec(statement).first()
    
    if not result:
      raise HTTPException(status_code=404, detail="No recipe found")
    
    return self.parse_recipe(result)

class GenericService:
  @classmethod
  def get_items(self, model: Union[Baker, Diet], session: Session, q: Optional[str] = None):
    statement = select(model)
    if q:
      statement = statement.where(model.name.contains(q))

    results = session.exec(statement).all()
    
    if not results:
      raise HTTPException(status_code=404, detail=f"No {model.__name__} found")
    
    return list(results)
  
  @classmethod
  def get_item(self, model: Union[Baker, Diet], session: Session, id: int):
    result = session.get(model, id)

    if not result:
      raise HTTPException(status_code=404, detail=f"No {model.__name__} found")
    
    return result