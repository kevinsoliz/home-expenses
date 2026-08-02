using System.Data;
using System.Data.Common;
using apicsharp.personas;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

[Route("personas")]
public class PersonaController : ControllerBase
{
    private Db _db;

    public PersonaController(Db db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<List<Persona>> GetPersonas()
    {
        List<Persona> personas = [];
        using DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        using DbCommand consulta = conexion.CreateCommand();
        consulta.CommandText = "select * from persona";

        DbDataReader reader = await consulta.ExecuteReaderAsync();

        while (reader.Read())
        {
            int id = reader.GetInt32(0);
            string nombre = reader.GetString(1);
            string? apellido = reader.IsDBNull(2) ? null : reader.GetString(2);
            personas.Add(new Persona (id, nombre, apellido));
        }

        return personas;

    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Persona>> GetPersona(int id)
    {
        using DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        using DbCommand consulta = conexion.CreateCommand();
        consulta.CommandText = "select * from persona where id = @id";

        consulta.AgregarParametro("@id", id);
       

        DbDataReader reader = await consulta.ExecuteReaderAsync();

        if (!reader.Read())
        {
            return NotFound();
        }

        int personaId = reader.GetInt32(0);
        string nombre = reader.GetString(1);
        string? apellido = reader.IsDBNull(2) ? null : reader.GetString(2);

        return new Persona(personaId, nombre, apellido);
    }

    [HttpPost]
    public async Task<IActionResult> PostPersonas([FromBody] Persona persona)
    {
        using DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        using DbCommand consulta = conexion.CreateCommand();
        consulta.CommandText = "insert into persona (nombre) values (@nombre)";
        consulta.AgregarParametro("@nombre", persona.Nombre);

        await consulta.ExecuteNonQueryAsync();

        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePersona(int id)
    {
        using DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();


        using DbCommand consulta = conexion.CreateCommand();
        consulta.CommandText = "delete from persona where id = @id";

        consulta.AgregarParametro("@id", id);

        int filas = await consulta.ExecuteNonQueryAsync();

        if (filas == 0)
        {
            return NotFound();
        }



        return Ok($"Todo correcto id: {id}");
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePersona(int id, [FromBody] Persona persona)
    {
        using DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        using DbCommand consulta = conexion.CreateCommand();

        consulta.CommandText = "update persona set nombre = @nombre where id = @id";
        consulta.AgregarParametro("@nombre", persona.Nombre);
        consulta.AgregarParametro("@id", id);

        int filas = consulta.ExecuteNonQuery();

        if (filas == 0)
        {
            return NotFound();
        }

        return Ok();

    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> PatchPersona(int id, [FromBody] Persona persona)
    {
        using DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        using DbCommand consulta = conexion.CreateCommand();
        consulta.CommandText = "update persona set nombre = coalesce(@nombre, nombre), apellido = coalesce(@apellido, apellido) where id = @id";

        consulta.AgregarParametro("@nombre", persona.Nombre);
        consulta.AgregarParametro("@apellido", persona.Apellido);
        consulta.AgregarParametro("@id", id);

        int filas = consulta.ExecuteNonQuery();

        return filas == 0 ? NotFound() : Ok();



    }
}