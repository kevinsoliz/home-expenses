using System.ComponentModel;
using System.Data.Common;
using apicsharp.personas;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;

[ApiController]
[Route("api/productos")]
public class ProductoController : ControllerBase
{
    private Db _db;
    public ProductoController(Db db)
    {
        _db = db;

    }

    [HttpGet]
    public async Task<IActionResult> GetProductos()
    {
        List<Producto> productos = [];

        DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();
        DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "select * from producto";

        DbDataReader reader = await comando.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            int productoId = reader.GetInt32(0);
            string nombre = reader.GetString(1);

            productos.Add(new Producto(productoId, nombre));
        }


        return Ok(productos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUnProducto(int id)
    {
        DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();
        DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "select * from producto where id = @id";
        comando.AgregarParametro("@id", id);

        DbDataReader reader = await comando.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
        {
            return NotFound();
        }

        int productoId = reader.GetInt32(0);
        string nombre = reader.GetString(1);

        return Ok(new Producto(productoId, nombre));

    }

    [HttpPost]
    public async Task<IActionResult> PostProducto([FromBody] Producto producto)
    {
        DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();
        DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "insert into producto (nombre) values (@nombre)";
        comando.AgregarParametro("@nombre", producto.Nombre);

        int filas = await comando.ExecuteNonQueryAsync();

        return filas == 0 ? NotFound() : Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProducto(int id)
    {
        DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();
        DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "delete from producto where id = @id";
        comando.AgregarParametro("@id", id);

        int filas = await comando.ExecuteNonQueryAsync();

        return filas == 0 ? NotFound() : Ok();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProducto(int id, [FromBody] Persona persona)
    {
        DbConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();
        DbCommand comando = conexion.CreateCommand();
        comando.CommandText = "update producto set nombre = @nombre where id = @id";

        comando.AgregarParametro("@id", id);
        comando.AgregarParametro("@nombre", persona.Nombre);

        int filas = await comando.ExecuteNonQueryAsync();

        return filas == 0 ? NotFound() : Ok();
    }
}