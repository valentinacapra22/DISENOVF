using Microsoft.AspNetCore.Mvc;
using EventoApi.Models;
using EventoApi.Services;
using EventoApi.Utilidad;
using System.Linq;

namespace EventoApi.Controllers
{
    [Route("API/[controller]")]
    [ApiController]
    public class EventoController : ControllerBase
    {
        private readonly IEventoService _eventoService;
        private readonly ILogger<EventoController> _logger;

        public EventoController(IEventoService eventoService, ILogger<EventoController> logger)
        {
            _eventoService = eventoService;
            _logger = logger;
        }

        // ✅ Obtener todos los eventos
        [HttpGet("ListaEventos")]
        public async Task<IActionResult> ObtenerEventos()
        {
            try
            {
                var eventos = await _eventoService.ObtenerEventosAsync();
                return Ok(eventos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la lista de eventos.");
                return StatusCode(500, "Error interno del servidor.");
            }
        }

        // ✅ Obtener evento por ID
        [HttpGet("EventoPorId/{id}")]
        public async Task<IActionResult> ObtenerEventoPorId(int id)
        {
            if (id <= 0)
                return BadRequest("El ID proporcionado no es válido.");

            try
            {
                var evento = await _eventoService.ObtenerEventoPorIdAsync(id);
                if (evento == null)
                    return NotFound("Evento no encontrado.");

                return Ok(evento);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el evento por ID.");
                return StatusCode(500, "Error interno del servidor.");
            }
        }

        [HttpPost("CrearEvento")]
        public async Task<IActionResult> CrearEvento([FromBody] Evento evento)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var nuevoEvento = await _eventoService.CrearEventoAsync(evento);
                return CreatedAtAction(
                    nameof(ObtenerEventoPorId),
                    new { id = nuevoEvento.ID },
                    nuevoEvento
                );
            }
            catch (ArgumentException argEx)
            {
                _logger.LogWarning(argEx, "Error de validación al crear evento");
                return BadRequest(argEx.Message);
            }
            catch (KeyNotFoundException notFoundEx)
            {
                _logger.LogWarning(notFoundEx, "Recurso no encontrado al crear evento");
                return NotFound(notFoundEx.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el evento");
                return StatusCode(500, "Error interno del servidor al crear el evento.");
            }
        }

        // ✅ Editar evento
        [HttpPut("EditarEvento/{id}")]
        public async Task<IActionResult> ActualizarEvento(int id, [FromBody] Evento evento)
        {
            if (id != evento.ID)
                return BadRequest("El ID del evento no coincide con el ID proporcionado.");

            try
            {
                var resultado = await _eventoService.ActualizarEventoAsync(id, evento);
                if (!resultado)
                    return NotFound("Evento no encontrado para actualizar.");

                return Ok("Evento actualizado con éxito.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar el evento.");
                return StatusCode(500, "Error interno del servidor.");
            }
        }
    }
}