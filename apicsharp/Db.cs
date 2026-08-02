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

    public void InicializaMiBD()
    {
        using SqliteConnection conexion = CrearConexion();
        conexion.Open();

        using SqliteCommand consulta = conexion.CreateCommand();
        consulta.CommandText = """

        CREATE TABLE IF NOT EXISTS persona (
            id INTEGER NOT NULL PRIMARY KEY,
            nombre TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS producto (
            id INTEGER NOT NULL PRIMARY KEY,
            nombre TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS supermercado (
            id INTEGER NOT NULL PRIMARY KEY,
            nombre TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS lista_compra (
            id INTEGER NOT NULL PRIMARY KEY,
            fecha TEXT NOT NULL,
            supermercado_id INTEGER NOT NULL,
            cerrada INTEGER NOT NULL DEFAULT 0,
            total REAL NOT NULL DEFAULT 0,
            pagada INTEGER NOT NULL DEFAULT 0
        );


        CREATE TABLE IF NOT EXISTS item_lista_compra(
            id INTEGER NOT NULL PRIMARY KEY,
            lista_compra_id INTEGER NOT NULL,
            producto_id INTEGER NOT NULL,
            cantidad REAL NOT NULL DEFAULT 0,
            precio_unidad REAL NOT NULL DEFAULT 0,
            FOREIGN KEY (lista_compra_id) REFERENCES lista_compra(id),
            FOREIGN KEY (producto_id) REFERENCES producto(id)
        );

        CREATE TABLE IF NOT EXISTS categoria (
            id INTEGER NOT NULL PRIMARY KEY,
            nombre TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS gasto (
            id INTEGER NOT NULL PRIMARY KEY,
            fecha TEXT NOT NULL,
            importe REAL NOT NULL,
            categoria_id INTEGER NOT NULL,
            pagada INTEGER NOT NULL DEFAULT 0,
            descripcion TEXT NOT NULL,
            FOREIGN KEY (categoria_id) REFERENCES categoria(id)
        );
        """;

        //TODO: Me falta la lista_compra_pagador
        new SqliteCommand("PRAGMA foreign_keys = ON;", conexion).ExecuteNonQuery();
        consulta.ExecuteNonQuery();
        
    }


}