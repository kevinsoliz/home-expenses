using Microsoft.Data.Sqlite;

namespace apicsharp;

// Equivale a api/database.py: sabe dónde está la BD y reparte conexiones.
public class Db
{
    private readonly string _connectionString;

    public Db(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException(
                "Falta la cadena de conexión 'Default' en appsettings.json.");
    }

    // Devuelve una conexión SIN abrir. Quien la pide la abre y la libera con 'using'.
    // ADO.NET mantiene un pool por debajo, así que crear conexiones es barato.
    public SqliteConnection CreateConnection() => new(_connectionString);

    // Sin ORM no hay migraciones: el esquema se crea aquí, al arrancar la app.
    // Esquema copiado de la migración de Alembic (tabla 'persona', en singular).
    public void InitSchema()
    {
        using SqliteConnection connection = CreateConnection();
        connection.Open();

        using SqliteCommand command = connection.CreateCommand();
        command.CommandText = """
            CREATE TABLE IF NOT EXISTS persona (
                id     INTEGER NOT NULL PRIMARY KEY,
                nombre TEXT    NOT NULL
            );
            """;
        command.ExecuteNonQuery();
    }
}
