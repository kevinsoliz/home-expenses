using Microsoft.Data.Sqlite;

namespace apicsharp.Shared.Personas;

// Toda la lógica de acceso a datos de 'persona' vive aquí.
// El controller no sabe que existe SQL ni SQLite.
public class PersonaRepository
{
    private readonly Db _db;

    public PersonaRepository(Db db)
    {
        _db = db;
    }

    public List<Persona> Listar()
    {
        using SqliteConnection connection = _db.CreateConnection();
        connection.Open();

        using SqliteCommand command = connection.CreateCommand();
        command.CommandText = "SELECT id, nombre FROM persona";

        List<Persona> personas = [];
        using SqliteDataReader reader = command.ExecuteReader();
        while (reader.Read())
        {
            personas.Add(Mapear(reader));
        }
        return personas;
    }

    // Devuelve null si no existe; el controller decide qué hacer con eso (404).
    public Persona? Obtener(int id)
    {
        using SqliteConnection connection = _db.CreateConnection();
        connection.Open();

        using SqliteCommand command = connection.CreateCommand();
        command.CommandText = "SELECT id, nombre FROM persona WHERE id = @id";
        command.Parameters.AddWithValue("@id", id);

        using SqliteDataReader reader = command.ExecuteReader();
        return reader.Read() ? Mapear(reader) : null;
    }

    // Mapeo fila -> objeto en un solo sitio, para no repetirlo en cada consulta.
    private static Persona Mapear(SqliteDataReader reader) => new()
    {
        Id = reader.GetInt32(0),
        Nombre = reader.GetString(1),
    };
}
