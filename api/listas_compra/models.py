from datetime import date

from sqlmodel import SQLModel, Field


class ItemListaCompra(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    producto_id: int | None = Field(default=None, foreign_key="producto.id")
    cantidad: int
    lista_compra_id: int | None = Field(default=None, foreign_key="listacompra.id")


class ListaCompra(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    fecha: date
    total: float = 0
    pagada: bool = Field(default=False)
    persona_id: int | None = Field(default=None, foreign_key="persona.id")


class ListaCompraPagador(SQLModel, table=True):
    lista_compra_id: int = Field(foreign_key="listacompra.id", primary_key=True)
    persona_id: int = Field(foreign_key="persona.id", primary_key=True)
