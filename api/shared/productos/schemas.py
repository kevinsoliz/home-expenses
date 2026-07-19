from sqlmodel import SQLModel


class ProductoCreate(SQLModel):
    nombre: str
