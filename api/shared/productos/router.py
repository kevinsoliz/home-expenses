from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from database import get_session
from .models import Producto
from .schemas import ProductoCreate

router = APIRouter(prefix="/productos", tags=["productos"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.get("")
def listar_productos(session: SessionDep) -> list[Producto]:
    return session.exec(select(Producto)).all()


@router.post("")
def crear_producto(session: SessionDep, producto: ProductoCreate) -> Producto:
    nuevo_producto = Producto(nombre=producto.nombre)
    session.add(nuevo_producto)
    session.commit()
    session.refresh(nuevo_producto)
    return nuevo_producto
