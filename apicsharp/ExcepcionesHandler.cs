using Microsoft.AspNetCore.Diagnostics;

public class ExcepcionesHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        System.Console.WriteLine($"AQUI ESTA EL ERRORRRR: {exception}");
        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;

        await httpContext.Response.WriteAsJsonAsync(new { mensaje = "Tienes un error puto."});

        return true;
    }
}