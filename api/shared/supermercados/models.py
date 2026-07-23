from sqlmodel import SQLModel, Field


class Supermercado(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str
