using EventoApi.Models;

namespace EventoApi.Services
{
    public interface IEventoService
    {
        Task<IEnumerable<Evento>> ObtenerEventosAsync();  
        Task<Evento?> ObtenerEventoPorIdAsync(int id);   
        Task<Evento> CrearEventoAsync(Evento evento);  
        Task<bool> ActualizarEventoAsync(int id, Evento evento);
    }
}
