public class Persona
{
    string nombre;
    string apellido;
    int edad;

    public Persona(string nombre, string apellido, int edad)
    {
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
    }

    public override string ToString()
    {
        return $"{nombre} {apellido} tiene {edad}";
    }

}