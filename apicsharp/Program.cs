using Microsoft.Data.Sqlite;


WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<Db>();
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ExcepcionesHandler>();

WebApplication app = builder.Build();

Db db = app.Services.GetRequiredService<Db>();
db.InicializaMiBD();

app.UseExceptionHandler();
app.MapControllers();

app.Run();