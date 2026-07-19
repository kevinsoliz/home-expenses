from sqlmodel import SQLModel, Field


class Persona(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str
