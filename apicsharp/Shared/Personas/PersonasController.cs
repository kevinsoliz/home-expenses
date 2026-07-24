using Microsoft.AspNetCore.Mvc;

namespace apicsharp.Shared.Personas;

[ApiController]
[Route("personas")]
public class PersonasController : ControllerBase
{
    private readonly PersonaRepository _repositorio;

    // El controller solo depende del repositorio, no de la BD.
    public PersonasController(PersonaRepository repositorio)
    {
        _repositorio = repositorio;
    }

    // GET /personas
    [HttpGet]
    public List<Persona> Listar()
    {
        return _repositorio.Listar();
    }

    // GET /personas/{id}
    [HttpGet("{id}")]
    public ActionResult<Persona> Obtener(int id)
    {
        Persona? persona = _repositorio.Obtener(id);

        if (persona is null)
        {
            return NotFound(new { detail = "Esa persona no existe." });
        }

        return persona;
    }
}
