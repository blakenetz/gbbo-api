from typing import  List, Optional
from pydantic import BaseModel
from sqlmodel import Field, Relationship,  SQLModel,  UniqueConstraint

class RecipeDiet(SQLModel, table=True, extend_existing=True):
  __tablename__ = 'recipe_diets'
  __table_args__ = (UniqueConstraint('recipe_id', 'diet_id'),)
  id: Optional[int] = Field(default=None, primary_key=True)
  recipe_id: int = Field(foreign_key="recipes.id", nullable=False)
  diet_id: int = Field(foreign_key="diets.id", nullable=False)

class Recipe(SQLModel, table=True, extend_existing=True):
  __tablename__ = 'recipes'
  id: Optional[int] = Field(default=None, primary_key=True)
  title: str = Field(nullable=False)
  link: str = Field(nullable=False, unique=True)
  img: str = Field(nullable=False)
  difficulty: Optional[int]
  is_technical: bool = Field(nullable=False)
  time: Optional[int]
  baker_id: Optional[int] = Field(default=None, foreign_key="bakers.id")
  baker: Optional['Baker'] = Relationship(back_populates='recipes')
  diets: Optional[list['Diet']] = Relationship(back_populates="recipes", link_model=RecipeDiet)

class Diet(SQLModel, table=True, extend_existing=True):
  __tablename__ = 'diets'
  id: Optional[int] = Field(default=None, primary_key=True)
  name: str = Field(nullable=False, unique=True)
  recipes: Optional[list['Recipe']] = Relationship(back_populates="diets", link_model=RecipeDiet)

class Baker(SQLModel, table=True, extend_existing=True):
  __tablename__ = 'bakers'
  __table_args__ = (UniqueConstraint('name', 'img'),)
  id: Optional[int] = Field(default=None, primary_key=True)
  name: str = Field(nullable=False)
  img: str = Field(nullable=False)
  season: Optional[int]
  recipes: list['Recipe'] = Relationship(back_populates='baker')

class RecipeResponse(BaseModel):
  id: int
  title: str
  link: str
  img: str
  difficulty: Optional[int]
  is_technical: bool
  time: Optional[int]
  baker: Optional[Baker] = None
  diets: Optional[List[Diet]] = None