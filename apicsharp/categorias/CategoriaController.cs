using System.Data.Common;
using Microsoft.AspNetCore.Mvc;
namespace apicsharp.categorias;
[ApiController]
[Route("api/categorias")]
public class CategoriaController : ControllerBase
{
   private Db _db;
   public CategoriaController(Db db)
    {
        _db = db;
    }
   
   [HttpGet]
   public async Task<IActionResult> ListCategorias()
    {
        DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();
        DbCommand comando = conexion.CreateCommand();

        comando.CommandText = "select * from categoria";

        List<Categoria> categorias = [];

        DbDataReader reader = await comando.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            int idCategoria = reader.GetInt32(0);
            string nombre = reader.GetString(1);
            categorias.Add(new Categoria(idCategoria, nombre));
            
        }

        return Ok(categorias);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategoria(int id)
    {
        DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "select * from categoria where id = @id";

        comando.AgregarParametro("@id", id);

         DbDataReader reader = await comando.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
        {
            
            return NotFound();
        }

        int idCategoria = reader.GetInt32(0);
        string nombre = reader.GetString(1);

        return Ok(new Categoria(idCategoria, nombre));
    }


    [HttpPost]
    public async Task<IActionResult> CrearCategoria([FromBody] Categoria categoria)
    {
        DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "insert into categoria (nombre) values (@nombre)";
        comando.AgregarParametro("@nombre", categoria.Nombre);

        int filas = await comando.ExecuteNonQueryAsync();

        return filas == 0 ? NotFound() : Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategoria(int id)
    {
        DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "delete from categoria where id = @id";
        comando.AgregarParametro("@id", id);

        int filas = await comando.ExecuteNonQueryAsync();

        return filas == 0 ? NotFound() : Ok();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategoria(int id, [FromBody] Categoria categoria)
    {
        DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "update categoria set nombre = @nombre where id = @id";
        comando.AgregarParametro("@nombre", categoria.Nombre);
        comando.AgregarParametro("@id", id);

        int filas = await comando.ExecuteNonQueryAsync();

        return filas == 0 ? NotFound() : Ok();
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> EditaCategoria(int id, [FromBody] Categoria categoria)
    {
        DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "update categoria set nombre =  coalesce(@nombre, nombre) where id = @id";
        comando.AgregarParametro("@nombre", categoria.Nombre);
        comando.AgregarParametro("@id", id);

        int filas = await comando.ExecuteNonQueryAsync();

        return filas == 0 ? NotFound() : Ok();
    }

 
}