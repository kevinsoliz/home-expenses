from datetime import date

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
    lista_compra_id: int | None = Field(default=None, foreign_key="listacompra.id")


class ListaCompra(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    fecha: date
    total: float
    persona_id: int | None = Field(default=None, foreign_key="persona.id")


class ListaCompraPagador(SQLModel, table=True):
    lista_compra_id: int = Field(foreign_key="listacompra.id", primary_key=True)
    persona_id: int = Field(foreign_key="persona.id", primary_key=True)

