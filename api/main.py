from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_db_and_tables
from shared.personas.router import router as personas_router
from shared.productos.router import router as productos_router


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

app.include_router(personas_router)
app.include_router(productos_router)


@app.get("/")
def read_root():
    return {"status": "ok"}
