from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from sqlmodel import Session, select

from database import create_db_and_tables, get_session
from models import Persona


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="home-expenses API", lifespan=lifespan)


@app.get("/")
def read_root():
    return {"status": "ok"}


SessionDep = Annotated[Session, Depends(get_session)]


@app.get("/personas")
def listar_personas(session: SessionDep) -> list[Persona]:
    return session.exec(select(Persona)).all()

@app.get("/personas/{id}")
def lista_persona(session: SessionDep, id: int) -> Persona:
    persona = session.get(Persona, id)
    
    if persona is None :
        raise HTTPException(status_code=404, detail="Esa persona no existe.")
    
    return persona

