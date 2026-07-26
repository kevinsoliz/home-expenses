using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("fucker")]
public class PersonaController: ControllerBase
{
    [HttpGet("{nombre}/{apellido}/{edad}")]
    public string Saludar(string nombre, string apellido, int edad)
    {
        Persona persona = new Persona(nombre, apellido, edad);
        Console.Beep(500, 200);
        Console.WriteLine(persona.ToString());
        return persona.ToString();
    }
    
}