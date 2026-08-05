using Microsoft.AspNetCore.Diagnostics;

public class ExcepcionesHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        System.Console.WriteLine($"\x1b[31mAQUI ESTA EL ERRORRRR: \x1b[34m{exception}\x1b[0m");
        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;

        await httpContext.Response.WriteAsJsonAsync(new { mensaje = "Tienes un error puto."});

        return true;
    }
}