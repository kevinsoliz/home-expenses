from datetime import date
from sqlmodel import SQLModel, Field


class Persona(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str


class ItemListacompra(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str
    comprado: bool = Field(default=False)


class Gasto(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    item_lista_compra_id: int | None = Field(
        default=None, foreign_key="itemlistacompra.id")
    precio: float
    cantidad: int
    total: float
    fecha: date = Field(default_factory=date.today)
    pagado: bool = Field(default=False)
