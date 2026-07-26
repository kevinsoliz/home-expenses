using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

[ApiController]
[Route("hora")]
public class Hora: ControllerBase
{
    private Db _db;
    public Hora(Db db)
    {
     _db = db;   
    }
    
    [HttpGet("actual")]
    public async Task<string> ObtenerHoraActual()
    {
        using SqliteConnection conexion = _db.CrearConexion();
        await conexion.OpenAsync();

        SqliteCommand consulta = conexion.CreateCommand();
        consulta.CommandText = "select datetime('now')";

        object? resultado = await consulta.ExecuteScalarAsync();

        string horaActual = resultado?.ToString() ?? "fuck";
        System.Console.WriteLine($"Deberias ver esto: {horaActual}");
        return horaActual;
    }
}