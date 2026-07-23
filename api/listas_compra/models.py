from datetime import date

from sqlmodel import SQLModel, Field


class ItemListaCompra(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    producto_id: int | None = Field(default=None, foreign_key="producto.id")
    cantidad: int
    lista_compra_id: int | None = Field(default=None, foreign_key="listacompra.id")
    precio_unidad: float = 0


class ListaCompra(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    fecha: date
    supermercado_id: int | None = Field(default=None, foreign_key="supermercado.id")
    cerrada: bool = Field(default=False)
    pagada: bool = Field(default=False)
    persona_id: int | None = Field(default=None, foreign_key="persona.id")


class ListaCompraPagador(SQLModel, table=True):
    lista_compra_id: int = Field(foreign_key="listacompra.id", primary_key=True)
    persona_id: int = Field(foreign_key="persona.id", primary_key=True)
