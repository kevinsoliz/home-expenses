
from sqlmodel import Session, select

from database import engine
from models import Persona

with Session(engine) as session:
    # persona = Persona(nombre="Bob")
    # session.add(persona)
    # session.commit()
    # session.refresh(persona)
    personas = session.exec(select(Persona)).all()
    
    for persona in personas:
        print(f"Nombre: {persona.nombre}\nId: {persona.id}\n")

