using apicsharp;
using Scalar.AspNetCore;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// --- Servicios (equivale a lo de arriba en main.py: middlewares y routers) ---

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Db es sin estado (solo guarda la cadena de conexión), así que una única
// instancia para toda la app. Los controllers la reciben por constructor.
builder.Services.AddSingleton<Db>();

// Repositorios (uno por feature). Scoped: una instancia por petición HTTP.
builder.Services.AddScoped<apicsharp.Shared.Personas.PersonaRepository>();

// CORS: mismos orígenes que el CORSMiddleware de main.py.
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:4200", "http://192.168.18.174:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()));

WebApplication app = builder.Build();

// Crea las tablas al arrancar (lo que en Python hacía Alembic).
app.Services.GetRequiredService<Db>().InitSchema();

// --- Pipeline de peticiones ---

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();             // expone /openapi/v1.json
    app.MapScalarApiReference();  // UI en /scalar (equivale al /docs de FastAPI)
}

app.UseCors();
app.MapControllers();

app.Run();
