from sqlmodel import SQLModel, Field


class Persona(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str


class Producto(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str
    precio: float | None = Field(default=None)


class ProductoCreate(SQLModel):
    nombre: str


class ItemListacompra(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    producto_id: int | None = Field(default=None, foreign_key="producto.id")
    cantidad: int
    comprado: bool = Field(default=False)

