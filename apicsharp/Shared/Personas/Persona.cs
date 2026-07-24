namespace apicsharp.Shared.Personas;

// POCO (Plain Old CLR Object): una clase plana, sin ninguna atadura con la base de datos.
// El esquema de la tabla se define aparte, en SQL (ver Db.cs).
public class Persona
{
    // init: solo se asigna al construir el objeto (al leer la fila). La BD genera el Id.
    public int Id { get; init; }
    public required string Nombre { get; set; }
}
