using Microsoft.Data.Sqlite;

public class Db
{
    private string _cadenaConexion;
    public Db(IConfiguration configuracion)
    {
        _cadenaConexion = configuracion.GetConnectionString("MiBaseDeDatos"  ) ?? throw new InvalidOperationException(
                "Falta la cadena de conexión 'MiBaseDeDatos' en appsettings.json.");
        
    }

    public SqliteConnection CrearConexion()
    {
        return new SqliteConnection(_cadenaConexion);
    }


}