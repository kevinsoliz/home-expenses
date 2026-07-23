from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, create_engine

# importados para que Alembic los vea en SQLModel.metadata
from shared.personas.models import Persona  # noqa: F401
from shared.productos.models import Producto  # noqa: F401
from shared.supermercados.models import Supermercado  # noqa: F401
from listas_compra.models import ItemListaCompra, ListaCompra, ListaCompraPagador  # noqa: F401

sqlite_file_name = "home_expenses.db"
engine = create_engine(f"sqlite:///{sqlite_file_name}")


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
