from sqlmodel import SQLModel, Session, create_engine

from shared.personas.models import Persona  # noqa: F401
from shared.productos.models import Producto  # noqa: F401
from listas_compra.models import ItemListaCompra, ListaCompra, ListaCompraPagador  # noqa: F401

sqlite_file_name = "home_expenses.db"
engine = create_engine(f"sqlite:///{sqlite_file_name}")


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session