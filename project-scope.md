# home-expenses — Alcance del proyecto

App sencilla para repartir los **gastos comunes de casa** (comida y cosas que usa todo el mundo) entre las personas que aportan. Proyecto **personal y de aprendizaje**: la excusa perfecta para practicar **FastAPI** (Python) y **Angular**.

## Objetivo doble

1. **Resolver un problema real:** dividir de forma justa lo que se compra en común, y llevar una lista de la compra compartida.
2. **Aprender:** el bucle completo web → Angular pide → FastAPI sirve → SQLite guarda.

## El problema (contexto real)

- Varias personas viven en la misma casa; unas aportan al gasto común y otras no (p. ej. quien no tiene ingresos ahora).
- Hay cosas que come **todo el mundo** (arroz, aceite, agua, limpieza...) y cosas que solo comen **algunos**.
- **Regla de oro:** al bote común solo entra lo que consume todo el mundo. Lo que solo usan unos, lo paga quien lo compra.
- Se usa sobre todo **desde el móvil** (iPhone + Android), así que tiene que ser web accesible desde cualquier navegador.

## Stack

- **Frontend:** Angular (standalone + signals). Mobile-first. Misma URL para todos.
- **Backend:** FastAPI. Un puñado de endpoints REST. Aquí está el aprendizaje.
- **BBDD:** SQLite (un solo archivo, cero servidor). Con SQLModel (Pydantic + SQLAlchemy, del autor de FastAPI).

### Por qué así (decisiones)

- **SQLite, no Postgres.** Para una app de casa, Postgres es matar moscas a cañonazos. SQLite aguanta esto de sobra. Se cambia luego si algún día hace falta.
- **FastAPI aunque la app "no lo necesite".** El objetivo es aprender FastAPI; el backend es el punto, no sobreingeniería.
- **Una sola web (no app nativa).** Cubre iPhone y Android con un mismo código.

## Features mínimas (v1)

1. **Registrar gasto común**
   - Meter: producto, precio, cantidad. Total = precio × cantidad.
   - Suma a un **contador de gastos comunes** (solo comunes, nada más).
2. **Reparto + "pagado"**
   - Calcular cuánto debe cada aportante 
   - Badge **"pagado"** para marcar el Bizum como hecho.
3. **Lista pendiente de compra**
   - Apuntar lo que va faltando (lista compartida).
   - Marcar como comprado.

## Modelo de datos (borrador)

- **Persona:** id, nombre
- **Gasto:** id, ItemListaCompra, precio, cantidad, total, fecha, pagado.
- **ItemListaCompra:** id, nombre, comprado.

## Endpoints (borrador)

- `GET/POST /gastos`, `PATCH /gastos/{id}` (marcar pagado)
- `GET/POST /lista`, `PATCH/DELETE /lista/{id}`
- `GET /resumen` (contador de comunes + cuánto debe cada uno)

## Plan por fases (para aprender, no para copiar)

1. **Backend solo.** FastAPI + SQLite + endpoints. Probar los enlaces con yaak o curl.
2. **Frontend.** Angular consumiendo la API. El front es "tonto": pinta lo que la API le da.
3. **Desplegar.** Para que los móviles lo alcancen de verdad (Render/Railway, gratis). Al principio corre en local.



## Estado

- [x] Alcance definido (este documento)
- [ ] Fase 1: backend FastAPI + SQLite
- [ ] Fase 2: frontend Angular
- [ ] Fase 3: despliegue
