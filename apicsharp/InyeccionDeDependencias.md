# Inyección de dependencias (DI)

## El problema que resuelve

Sin DI, si una clase necesita otra, la crea ella misma con `new`:

```csharp
public class PersonaRepository
{
    private readonly Db _db = new Db(???); // ¿de dónde saco IConfiguration aquí?
}
```

Esto encadena problemas: `PersonaRepository` tiene que saber cómo construir un `Db`, `Db` tiene que saber cómo construir su connection string, y si mañana `Db` necesita algo más, hay que tocar todas las clases que lo crean con `new`. Además, es imposible sustituir `Db` por una versión falsa en un test sin reescribir `PersonaRepository`.

## La solución: no crear, pedir

Con DI, una clase **no crea** sus dependencias, las **pide** en el constructor y confía en que alguien se las dé:

```csharp
public class PersonaRepository
{
    private readonly Db _db;
    public PersonaRepository(Db db) => _db = db; // se la dan hecha
}
```

Ese "alguien" es el **contenedor de DI**: una pieza de ASP.NET Core que sabe qué instancia darle a cada clase que la pida.

## Registro de servicios

Para que el contenedor sepa qué dar, primero hay que decírselo — eso es "registrar un servicio", con `builder.Services`:

```csharp
builder.Services.AddSingleton<Db>();
builder.Services.AddScoped<PersonaRepository>();
```

A partir de ahí, cuando ASP.NET Core necesita crear un `PersonaController` (porque llegó una petición HTTP), y ese controller pide un `PersonaRepository` en su constructor, y ese repository pide un `Db` — el contenedor arma toda esa cadena automáticamente, sin que nadie escriba `new` en ningún lado.

```csharp
public class PersonaController : ControllerBase
{
    private readonly PersonaRepository _repo;
    public PersonaController(PersonaRepository repo) => _repo = repo; // inyectado
}
```

## Tres formas de registrar (duración de la instancia)

- **`AddSingleton<T>()`** — una única instancia para toda la vida de la aplicación. Para servicios sin estado propio de cada petición (ej. `Db`, que solo guarda un connection string).
- **`AddScoped<T>()`** — una instancia nueva por cada petición HTTP, compartida entre todo lo que la pida dentro de esa misma petición. Uso típico: un `DbContext` de Entity Framework.
- **`AddTransient<T>()`** — una instancia nueva cada vez que se pide, incluso dentro de la misma petición. Para servicios ligeros y sin estado.

## Por qué importa

1. **Desacopla** — `PersonaRepository` no sabe cómo se construye `Db`, solo sabe que existe.
2. **Testeable** — en un test se puede registrar una versión falsa de `Db` sin tocar `PersonaRepository`.
3. **Un solo lugar de configuración** — cambiar cómo se construye algo (ej. el connection string) se hace en un sitio, no en cada clase que lo usa.
