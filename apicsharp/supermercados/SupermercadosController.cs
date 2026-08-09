using System.Data.Common;
using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace apicsharp.supermercados;

[ApiController]
[Route("api/supermercados")]
public class SupermercadosController : ControllerBase
{
    public Db _db;
    public SupermercadosController(Db db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> ListarSupermercados()
    {
        using DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        using DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "SELECT * FROM supermercado";

        DbDataReader reader = await comando.ExecuteReaderAsync();

        List<Supermercado> supermercados = [];

        while (await reader.ReadAsync())
        {
            int idSupermercado = reader.GetInt32(0);
            string nombre = reader.GetString(1);
            supermercados.Add(new Supermercado(idSupermercado, nombre));
        }

        return Ok(supermercados);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSupermercado(int id)
    {
        using DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        using DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "SELECT * FROM supermercado where id = @id";

        comando.AgregarParametro("@id", id);

        DbDataReader reader = await comando.ExecuteReaderAsync();

        while (!await reader.ReadAsync())
        {
            return NotFound();
        }

        int supermercadoId = reader.GetInt32(0);
        string nombre = reader.GetString(1);


        return Ok(new Supermercado(supermercadoId, nombre));

    }

    [HttpPost]
    public async Task<IActionResult> CrearSupermercado([FromBody] Supermercado supermercado)
    {
        using DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        using DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "INSERT INTO supermercado (nombre) values (@nombre); SELECT last_insert_rowid()";

        comando.AgregarParametro("@nombre", supermercado.Nombre);

        object? resultado = await comando.ExecuteScalarAsync();

        return Ok(resultado);

    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> BorrarSupermercado(int id)
    {
        using DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        using DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "delete from supermercado where id = @id returning id";
        comando.AgregarParametro("@id", id);

        object? resultado = await comando.ExecuteScalarAsync();
        return resultado is null ? NotFound() : Ok(resultado);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarSupermercado(int id, [FromBody] Supermercado supermercado)
    {
        DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "update supermercado set nombre = @nombre where id = @id";
        comando.AgregarParametro("@nombre", supermercado.Nombre);
        comando.AgregarParametro("@id", id);

        int filas = await comando.ExecuteNonQueryAsync();

        return filas == 0 ? NotFound() : Ok();
    }


    [HttpPatch("{id}")]
    public async Task<IActionResult> EditarSupermercado(int id, [FromBody] Supermercado supermercado)
    {
        DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "update supermercado set nombre = coalesce(@nombre, nombre) where id = @id";

        comando.AgregarParametro("@nombre", supermercado.Nombre);
        comando.AgregarParametro("@id", id);

        int filas = await comando.ExecuteNonQueryAsync();

        return filas == 0 ? NotFound() : Ok();
    }

}
