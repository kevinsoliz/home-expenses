# Tipos de servidor en .NET — líneas equivalentes

Referencia: `Program.cs` (servidor HTTP con minimal API).

```csharp
WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
WebApplication app = builder.Build();

app.MapGet("", () => "Hola mundo");

app.Run();
```

## Servidor TCP (crudo, sin protocolo encima)

```csharp
TcpListener listener = new TcpListener(IPAddress.Any, 5000);
listener.Start();

TcpClient client = await listener.AcceptTcpClientAsync();
await using NetworkStream stream = client.GetStream();
await stream.WriteAsync(Encoding.UTF8.GetBytes("Hola mundo"));

listener.Stop();
```

## Servidor UDP
 
```csharp
UdpClient listener = new UdpClient(5000);

UdpReceiveResult result = await listener.ReceiveAsync();
await listener.SendAsync(Encoding.UTF8.GetBytes("Hola mundo"), result.RemoteEndPoint);

listener.Close();
```

## Servidor WebSocket

```csharp
WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
WebApplication app = builder.Build();

app.UseWebSockets();
app.Map("/ws", async (HttpContext ctx) =>
{
    using WebSocket socket = await ctx.WebSockets.AcceptWebSocketAsync();
    await socket.SendAsync(Encoding.UTF8.GetBytes("Hola mundo"), WebSocketMessageType.Text, true, CancellationToken.None);
});

app.Run();
```

## Servidor gRPC

```csharp
WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
builder.Services.AddGrpc();
WebApplication app = builder.Build();

app.MapGrpcService<SaludoService>(); // implementa el método definido en el .proto

app.Run();
```

## Servidor SSE (Server-Sent Events, solo push, HTTP puro)

```csharp
WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
WebApplication app = builder.Build();

app.MapGet("/eventos", async (HttpContext ctx) =>
{
    ctx.Response.Headers.Append("Content-Type", "text/event-stream");
    await ctx.Response.WriteAsync("data: Hola mundo\n\n");
    await ctx.Response.Body.FlushAsync();
});

app.Run();
```

## Servidor de base de datos, SMTP/FTP, colas de mensajes, DNS

No entran en 5 líneas: son productos completos (PostgreSQL, Postfix, RabbitMQ, BIND) que implementan protocolos binarios propios con años de trabajo detrás. Lo que se programa normalmente es el **cliente** que se conecta a ellos, no el servidor en sí.

Todos los proveedores ADO.NET implementan las mismas interfaces (`IDbConnection`, `IDbCommand`), así que las líneas son casi idénticas — cambia la clase de conexión y el connection string, nada más:

```csharp
// SQLite (archivo local, sin proceso servidor separado)
SqliteConnection conn = new SqliteConnection("Data Source=mibase.db");
await conn.OpenAsync();

// PostgreSQL
NpgsqlConnection conn = new NpgsqlConnection("Host=localhost;Database=mibase;Username=x;Password=y");
await conn.OpenAsync();

// MySQL
MySqlConnection conn = new MySqlConnection("Server=localhost;Database=mibase;User=x;Password=y");
await conn.OpenAsync();

// SQL Server
SqlConnection conn = new SqlConnection("Server=localhost;Database=mibase;User Id=x;Password=y;");
await conn.OpenAsync();
```

→ omitido: implementación de esos servidores desde cero. Agregar solo si el objetivo es construir un motor de DB/mail/cola propio (poco probable).
