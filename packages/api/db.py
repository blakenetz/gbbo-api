from typing import Annotated
from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine
import os

# Config DB connection
current_dir = os.path.abspath(os.path.dirname(__file__))
db_file = os.path.join(current_dir, "../..", "gbbo.db")

sqlite_url = f"sqlite:///{db_file}"
connect_args = {"check_same_thread": False}

engine = create_engine(sqlite_url, connect_args=connect_args, echo=True)

# DB helper functions and types
def create_db_and_tables():
  SQLModel.metadata.create_all(engine)

def get_session():
  with Session(engine) as session:
    yield session

SessionDep = Annotated[Session, Depends(get_session)]