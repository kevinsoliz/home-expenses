from fastapi import APIRouter, HTTPException
from sqlmodel import select

from database import SessionDep
from .models import Persona

router = APIRouter(prefix="/personas", tags=["personas"])


@router.get("")
def listar_personas(session: SessionDep) -> list[Persona]:
    return session.exec(select(Persona)).all()


@router.get("/{id}")
def lista_persona(session: SessionDep, id: int) -> Persona:
    persona = session.get(Persona, id)

    if persona is None:
        raise HTTPException(status_code=404, detail="Esa persona no existe.")

    return persona
