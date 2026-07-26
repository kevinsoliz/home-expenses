# Ejecutar consultas con ADO.NET

Una vez la conexión está abierta, se crea un `Command` con el SQL y se ejecuta con uno de estos tres métodos, según qué devuelva la consulta.

```csharp
SqliteCommand cmd = conn.CreateCommand();
cmd.CommandText = "SELECT datetime('now')";

object? resultado = await cmd.ExecuteScalarAsync();
Console.WriteLine(resultado);
```

## Los tres métodos

- **`ExecuteScalarAsync`** — devuelve un solo valor (`COUNT`, `MAX`, la hora, etc.).
- **`ExecuteReaderAsync`** — devuelve varias filas/columnas (`SELECT * FROM productos`), se recorre con `while (await reader.ReadAsync())`.
- **`ExecuteNonQueryAsync`** — para `INSERT`/`UPDATE`/`DELETE`, no devuelve filas, solo la cantidad de filas afectadas.

## ¿Son iguales en SQLite, MySQL, SQL Server, PostgreSQL?

Sí. Los tres métodos existen igual en cualquier proveedor porque todos implementan las mismas interfaces base de ADO.NET (`DbCommand` / `IDbCommand`). Lo único que cambia es la clase concreta del comando (igual que pasaba con la conexión):

```csharp
// SQLite
SqliteCommand cmd = conn.CreateCommand();

// PostgreSQL
NpgsqlCommand cmd = conn.CreateCommand();

// MySQL
MySqlCommand cmd = conn.CreateCommand();

// SQL Server
SqlCommand cmd = conn.CreateCommand();
```

En los cuatro casos, después de crear el `cmd`, el código es idéntico: `cmd.CommandText = "..."`, y después `ExecuteScalarAsync` / `ExecuteReaderAsync` / `ExecuteNonQueryAsync`. Lo único que puede variar es la sintaxis del SQL en sí (ej. `datetime('now')` en SQLite vs `NOW()` en PostgreSQL/MySQL vs `GETDATE()` en SQL Server), porque eso ya no es ADO.NET sino el dialecto SQL propio de cada motor.

## ¿Por qué `ExecuteScalarAsync` devuelve `object?`?

`object` es el tipo base del que heredan todos los tipos en C# (`int`, `string`, `DateTime`, cualquier clase). Es el tipo más genérico posible. El `?` indica que también puede ser `null` si la consulta no devuelve nada.

`ExecuteScalarAsync` no sabe de antemano si tu `SELECT` va a traer un `int`, un `string` o una `DateTime` — depende de la consulta. Por eso devuelve el tipo más genérico posible, y hay que castear al tipo real esperado:

```csharp
object? resultado = await cmd.ExecuteScalarAsync();

// si sabes que es un COUNT (entero)
int total = Convert.ToInt32(resultado);

// si sabes que es texto/fecha
string? hora = resultado?.ToString();
```

`Console.WriteLine(resultado)` funciona sin castear porque acepta `object` y llama a `.ToString()` internamente.

## Una conexión por petición: ¿no es caro? — el pool de conexiones

El patrón normal es abrir una conexión nueva en cada petición (con `using`, para que se cierre sola). Parece caro, pero no lo es gracias al **pool de conexiones**.

**Qué es:** un conjunto de conexiones físicas (ya con el handshake de red y la autenticación hechos) que el proveedor ADO.NET mantiene vivas en segundo plano y reutiliza, en vez de abrir/cerrar una conexión real cada vez.

**Cuándo se activa:** solo, sin escribir código extra — viene activado por defecto (`Pooling=true`) en Npgsql, SqlClient, MySqlConnector, etc. La primera vez que se abre una conexión con un connection string dado, el proveedor crea el pool para ese string; las siguientes veces reutiliza una conexión libre de ahí. `Dispose()`/salir del `using` no cierra la conexión física, la devuelve al pool.

**Analogía (taxis):**
- **PostgreSQL/SQL Server/MySQL** — el servidor está en otra máquina/proceso, con red de por medio. Pedir un taxi nuevo cada vez implica que venga desde el garage. El pool = tener taxis ya circulando cerca, listos.
- **SQLite** — no hay otro edificio: la base de datos es un archivo en el mismo disco. Abrir la conexión es como abrir la puerta de tu propia casa, ya casi no cuesta nada. Por eso el pool existe igual (activado por defecto en `Microsoft.Data.Sqlite`) pero aporta mucho menos: el costo que evita (el viaje de red) no existe ahí.

**Configuración:** se ajusta desde el mismo connection string:
```
"Host=localhost;Database=x;Minimum Pool Size=5;Maximum Pool Size=100;"
```
