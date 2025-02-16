using EventoApi.Data;
using EventoApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EventoApi.Services
{
    public class LugarService : ILugarService
    {
        private readonly EntradasContext _context;
        private readonly ILogger<LugarService> _logger;

        public LugarService(EntradasContext context, ILogger<LugarService> logger)
        {
            _context = context;
            _logger = logger;
        }


        // Método para obtener todos los lugares
        public async Task<IEnumerable<Lugar>> ObtenerLugaresAsync()
        {
            try
            {
                var lugares = await _context.Lugars.ToListAsync();  // Obtener lugares de la base de datos
                if (!lugares.Any())
                {
                    _logger.LogWarning("No se encontraron lugares en la base de datos.");
                }
                return lugares;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los lugares.");
                throw new Exception("Error al obtener los lugares.", ex);
            }
        }

        public async Task<Lugar?> ObtenerLugarPorIdAsync(int LugarId)
        {
            try
            {
                // Buscar el lugar por ID en la base de datos
                var lugar = await _context.Lugars
                                          .FirstOrDefaultAsync(l => l.ID == LugarId);  // Filtra por ID

                if (lugar == null)
                {
                    // Si no se encuentra el lugar, se puede loguear una advertencia
                    _logger.LogWarning($"No se encontró el lugar con ID {LugarId}.");
                }

                return lugar;  // Retorna el lugar encontrado o null si no se encontró
            }
            catch (Exception ex)
            {
                // Manejo de errores
                _logger.LogError(ex, "Error al obtener el lugar por ID.");
                throw new Exception("Error al obtener el lugar por ID.", ex);
            }
        }
    
    }
}
