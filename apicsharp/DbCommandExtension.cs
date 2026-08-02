using System.Data.Common;

public static class DbCommandExtension
{
    public static void AgregarParametro(this DbCommand comando, string nombre, object? valor)
    {
        DbParameter parametro = comando.CreateParameter();
        parametro.ParameterName = nombre;
        parametro.Value = valor ?? DBNull.Value;
        comando.Parameters.Add(parametro);
    }
}