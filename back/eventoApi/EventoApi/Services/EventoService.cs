using EventoApi.Data;
using EventoApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EventoApi.Hubs;
using Microsoft.AspNetCore.SignalR;


namespace EventoApi.Services
{
    public class EventoService : IEventoService
    {
        private readonly EntradasContext _context;  // Aquí usamos el contexto de la base de datos
        private readonly ILogger<EventoService> _logger;
        private readonly IHubContext<EventoHub> _hubContext;

        // Constructor que recibe el contexto y el logger para el registro de logs
        public EventoService(EntradasContext context, ILogger<EventoService> logger, IHubContext<EventoHub> hubContext)
        {
            _context = context;
            _logger = logger;
            _hubContext = hubContext;
        }

        // Método para obtener todos los eventos
        public async Task<IEnumerable<Evento>> ObtenerEventosAsync()
        {
            try
            {
                var eventos = await _context.Eventos.Include(e => e.LugarIDNavegation).ToListAsync();
                if (!eventos.Any())
                {
                    _logger.LogWarning("No se encontraron eventos en la base de datos.");
                }
                return eventos;
            }
            catch (Exception ex)
            {
                
                throw new Exception("Error al obtener los eventos.", ex);
            }
        }

        // Método para obtener un evento por su ID
        public async Task<Evento?> ObtenerEventoPorIdAsync(int id)
        {
            if (id <= 0)
            {
                _logger.LogError("ID inválido: {Id}", id);
                throw new ArgumentException("El ID debe ser mayor a 0.", nameof(id));
            }

            var evento = await _context.Eventos
                .Include(e => e.LugarIDNavegation) // ✅ Cargar el lugar asociado
                .FirstOrDefaultAsync(e => e.ID == id);

            if (evento == null)
            {
                _logger.LogWarning("Evento con ID {Id} no encontrado.", id);
            }

            return evento;
        }

        // Método para crear un nuevo evento
        public async Task<Evento> CrearEventoAsync(Evento evento)
        {
            if (evento == null)
            {
                throw new ArgumentNullException(nameof(evento), "El evento no puede ser nulo.");
            }

            // Validaciones básicas
            if (string.IsNullOrWhiteSpace(evento.Nombre))
            {
                throw new ArgumentException("El nombre del evento es requerido.");
            }

            if (!evento.Fecha.HasValue)
            {
                throw new ArgumentException("La fecha del evento es requerida.");
            }

            if (!evento.HorarioInicio.HasValue || !evento.HorarioFin.HasValue)
            {
                throw new ArgumentException("Los horarios de inicio y fin son requeridos.");
            }

            if (evento.LugarId <= 0)
            {
                throw new ArgumentException("El ID del lugar debe ser válido.");
            }

            try
            {
                // Verificar que el lugar existe
                var lugar = await _context.Lugars
                    .FirstOrDefaultAsync(l => l.ID == evento.LugarId);

                if (lugar == null)
                {
                    throw new KeyNotFoundException($"No se encontró el lugar con ID {evento.LugarId}");
                }

                // Establecer la relación de navegación
                evento.LugarIDNavegation = lugar;

                // Agregar el evento
                await _context.Eventos.AddAsync(evento);
                await _context.SaveChangesAsync();

                // Notificar a través de SignalR
                await _hubContext.Clients.All.SendAsync("RecibirEvento",
                    $"Se creó un nuevo evento: {evento.Nombre} en {evento.Fecha}");

                return evento;
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Error de base de datos al crear el evento.");
                throw new Exception("Error al guardar el evento en la base de datos.", dbEx);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el evento");
                throw new Exception("Error general al crear el evento.", ex);
            }
        }


        // Método para actualizar un evento existente
        public async Task<bool> ActualizarEventoAsync(int id, Evento evento)
        {
            if (id != evento.ID)
            {
                _logger.LogError("Error al actualizar: ID proporcionado {Id} no coincide con el evento {EventoId}", id, evento.ID);
                return false;
            }

            var eventoExistente = await _context.Eventos.FindAsync(id);
            if (eventoExistente == null)
            {
                _logger.LogWarning("Intento de actualizar evento con ID {Id}, pero no existe.", id);
                return false;
            }

            _context.Entry(eventoExistente).CurrentValues.SetValues(evento);  // Actualizar el evento
            await _context.SaveChangesAsync();  // Guardar los cambios
            _logger.LogInformation("Evento con ID {Id} actualizado exitosamente.", id);
            return true;
        }

        // Método para eliminar un evento
        public async Task<bool> EliminarEventoAsync(int id)
        {
            var evento = await _context.Eventos.FindAsync(id);
            if (evento == null)
            {
                _logger.LogWarning("Intento de eliminar evento con ID {Id}, pero no existe.", id);
                return false;
            }

            _context.Eventos.Remove(evento);  // Eliminar el evento
            await _context.SaveChangesAsync();  // Guardar los cambios
            _logger.LogInformation("Evento con ID {Id} eliminado exitosamente.", id);
            return true;
        }

     
    }
}