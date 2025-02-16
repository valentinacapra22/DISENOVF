using System.Text.Json.Serialization;
using EventoApi.Data;
using EventoApi.Services;
using Microsoft.EntityFrameworkCore;
using EventoApi.Hubs; // Asegúrate de importar la clase del Hub

var builder = WebApplication.CreateBuilder(args);

// Configurar Entity Framework y MySQL
var connectionString = builder.Configuration.GetConnectionString("MySqlConnection");

builder.Services.AddDbContext<EntradasContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Configuración de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // URL del frontend
              .AllowAnyMethod()  // Permite cualquier método (GET, POST, PUT, DELETE, etc.)
              .AllowAnyHeader()  // Permite cualquier cabecera
              .AllowCredentials();  // Permite credenciales como cookies o cabeceras de autorización
    });
});


builder.Services.AddSignalR(); // Agregar SignalR para WebSockets

// Registrar servicios en la inyección de dependencias
builder.Services.AddScoped<IEventoService, EventoService>();
builder.Services.AddScoped<ILugarService, LugarService>();

// Agregar controladores y otras configuraciones
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();



// Configuración de Swagger en el entorno de desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Aplicar CORS antes de manejar las solicitudes
app.UseCors("AllowAllOrigins");  // Usar la política específica para el frontend

app.UseAuthorization();
// Configurar el pipeline de middleware (para manejar las solicitudes HTTP)
app.MapControllers();

// Agregar la ruta para SignalR
app.MapHub<EventoHub>("/EventoApi"); // WebSockets activo en esta ruta


app.Run();