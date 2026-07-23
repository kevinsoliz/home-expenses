from fastapi import APIRouter
from sqlmodel import select

from database import SessionDep
from .models import Producto
from .schemas import ProductoCreate

router = APIRouter(prefix="/productos", tags=["productos"])


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
