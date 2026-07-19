from sqlmodel import SQLModel, Field


class Producto(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str
    precio: float | None = Field(default=None)
