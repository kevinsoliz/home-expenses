using System.Net;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("cuqui")]
public class Cuquis : ControllerBase
{
    [HttpGet("cuquis")]
    public string? DevuelveCoqui()
    {
        string? valor = Request.Cookies["miCoqui"];
        System.Console.WriteLine($"Este es el valor de coqui: {valor}");
        return valor ?? "no hay coqui";
    }

    [HttpGet("crear")]
    public string CrearCuqui()
    {
        Response.Cookies.Append("miCoqui", "MIFuckingCokie");
        return "cookie lista!";
    }
    
}