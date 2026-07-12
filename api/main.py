from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from database import create_db_and_tables, get_session
from models import Persona, Producto, ProductoCreate


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="home-expenses API", lifespan=lifespan)

#TODO: el origen tiene que ser una variable cuando se vaya a desplegar.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://192.168.18.174:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/productos")
def listar_productos(session: SessionDep) -> list[Producto]:
    return session.exec(select(Producto)).all()

@app.post("/productos")
def crear_producto(session: SessionDep, producto: ProductoCreate) -> Producto:
    nuevo_producto = Producto(nombre=producto.nombre)
    session.add(nuevo_producto)
    session.commit()
    session.refresh(nuevo_producto) 
    return nuevo_producto