# Creación de objetos y records en C#

Todas son **formas de crear objetos**. El `new` con constructor es siempre el motor de fondo; las demás son atajos de sintaxis sobre él.

---

## 1. Todas las formas de crear un objeto

### Constructores (la base)

```csharp
Persona p1 = new Persona();            // constructor vacío
Persona p2 = new Persona("María");     // constructor con parámetros
```

### Object initializer

```csharp
Persona p = new Persona { Nombre = "María", Apellido = "García" };
```

Atajo para asignar propiedades después del constructor. El compilador genera exactamente lo mismo que asignar propiedad a propiedad:

```csharp
Persona p = new Persona();
p.Nombre = "María";
p.Apellido = "García";
```

Reglas:
- Los `=` van separados por **comas**, no puntos y comas.
- Solo funciona con propiedades que tengan `set` (o `init`).
- No hace falta asignarlas todas: las que falten quedan con su valor por defecto (`0` para int, `null` para string).

### Tipos anónimos (anonymous types)

```csharp
var respuesta = new { mensaje = "Ocurrió un error." };
```

- C# genera internamente una clase sin nombre con esas propiedades.
- **Solo lectura**: las propiedades se asignan al crear y no tienen `set`.
- **Solo viven dentro del método**: no se pueden usar como parámetro ni como tipo de retorno.
- Sirven para respuestas JSON desechables sin crear una clase entera.

### `new()` target-typed (C# 9)

```csharp
Persona p = new();               // el tipo lo deduce del contexto
List<Persona> lista = new();
```

Se puede combinar con object initializer:

```csharp
Persona p = new() { Nombre = "María" };
```

### Collection initializer

```csharp
List<int> nums = new() { 1, 2, 3 };
Dictionary<string, int> d = new() { { "a", 1 } };
```

### Tuplas (datos sin clase)

```csharp
(string, int) t = ("María", 30);
var t2 = (nombre: "María", edad: 30);   // con nombres
```

### Formas indirectas de crear objetos

- **Factories / constructores estáticos**: `Db.Crear()`, `HttpClient.Create()`.
- **Inyección de dependencias (DI)**: el framework crea la instancia y te la inyecta (`PersonaController(Db db)`).
- **Reflection / Activator**: crear con el nombre de la clase en un string; lo usan los frameworks (serializadores, ORMs), casi nunca tu código.

### Mapa mental

```
new Clase(...)            ← el motor (constructor)
  ├─ new Clase { props }  ← object initializer
  ├─ new()                ← target-typed
  ├─ new List { ... }     ← collection initializer
new { props }             ← anónimo (sin clase)
new("a","b")              ← record posicional
with { ... }              ← copia modificada de un record
Factories / DI / Activator ← creación indirecta
```

Regla de oro:
- Objeto solo para una respuesta JSON → **anónimo**.
- Objeto reutilizable → **clase real**.
- Solo datos inmutables → **record**.

---

## 2. Records

Un `record` es un tipo pensado para **datos**. La forma más común de declararlo es la **posicional**, que te genera automáticamente el constructor, las propiedades de solo lectura, comparación por valor y más:

```csharp
public record Persona(int Id, string? Nombre, string? Apellido);
```

Con esto puedes crear:

```csharp
Persona p = new(1, "María", "García");
```

### Maneras de crear un record

**a) Posicional (la más usada):**

```csharp
public record Persona(int Id, string? Nombre, string? Apellido);
Persona p = new(1, "María", "García");
```

**b) Con cuerpo, propiedades `init`:**

```csharp
public record Persona
{
    public int Id { get; init; }
    public string? Nombre { get; init; }
}
Persona p = new() { Id = 1, Nombre = "María" };
```

**c) Híbrido: posicional + propiedades extra:**

```csharp
public record Persona(int Id, string Nombre)
{
    public string? Apellido { get; set; }
}
```

**d) `with` — copiar y modificar:**

```csharp
Persona original = new(1, "María", "García");
Persona modificada = original with { Nombre = "Ana" };
```

`with` crea una **nueva instancia** copiando el original y cambiando solo lo indicado. No se reasigna sobre el original.

---

## 3. Qué significa `init`

`init` es como `set`, pero con una regla: la propiedad **solo se puede asignar durante la construcción** (en el constructor o en el object initializer). Después de crear el objeto, es de solo lectura.

```csharp
public class Persona
{
    public int Id { get; init; }   // se asigna al construir, luego no se toca
    public string? Nombre { get; set; }  // se puede reasignar siempre
}

Persona p = new() { Id = 1 };   // ✅ permitido (se está construyendo)
p.Id = 2;                       // ❌ error: init-only
p.Nombre = "Otra cosa";         // ✅ permitido
```

Resumen de modificadores de acceso a propiedades:

| Modificador | ¿Cuándo se puede asignar? |
|---|---|
| `set` | Siempre (también después de crear) |
| `init` | Solo al construir (constructor o initializer) |
| (ninguno) | Solo en el constructor |

---

## 4. ¿Los records son inmutables?

Sí, por defecto: las propiedades de un `record` posicional son `init`. Pero **inmutable ≠ no se puede crear** — inmutable significa que no puedes *cambiarlo después* de construirlo.

```csharp
Persona p = new(1, "María", "García");
p.Nombre = "Otra";   // ❌ error: init-only
```

Para "modificarlo" no reasignas: copias con `with` (ver arriba).

---

## 5. ¿Cuándo usar record y cuándo class?

En una API los objetos son **transportistas de datos**: van de la base de datos al JSON y vuelta, sin lógica de negocio que los modifique en memoria (el que "edita" es la base de datos, no el código C#). Ese es exactamente el caso de uso del record.

| Necesitas | Usa |
|---|---|
| El objeto viaja entre BD y cliente, no se modifica en memoria | `record` (casi siempre) |
| Lógica que lo cambia en memoria (carritos, cálculos, formularios editables) | `class` con `set` |
| Respuesta JSON desechable | tipo anónimo |
| Dato de solo lectura con alguna propiedad puntual editable | `record` híbrido |

Un `record` sirve tanto de modelo de entrada (el JSON del POST/PUT/PATCH se deserializa con su constructor) como de salida (se serializa a JSON). En una API REST típica: **record casi siempre**.
