using Microsoft.Data.Sqlite;


WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<Db>();
builder.Services.AddControllers();

WebApplication app = builder.Build();

Db db = app.Services.GetRequiredService<Db>();


using SqliteConnection conexion = db.CrearConexion();

await conexion.OpenAsync();


SqliteCommand consulta = conexion.CreateCommand();


consulta.CommandText = "select datetime('now')";

// app.MapGet("/", () => "Hello world");

object? resultado = await consulta.ExecuteScalarAsync();

System.Console.WriteLine($"Lahora de la bd: {resultado}");
System.Console.WriteLine(conexion.State);

app.MapControllers();

app.Run();