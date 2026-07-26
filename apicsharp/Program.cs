using Microsoft.Data.Sqlite;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

WebApplication app = builder.Build();

app.MapGet("/", () => "Hello world");


SqliteConnection conn = new SqliteConnection("Data Source=mibase.db");
await conn.OpenAsync();

SqliteCommand consulta = conn.CreateCommand();
consulta.CommandText = "select datetime('now')";

object? resultado = await consulta.ExecuteScalarAsync();
System.Console.WriteLine($"Lahora de la bd: {resultado}");
System.Console.WriteLine(conn.State);

app.Run();