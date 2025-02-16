using EventoApi.Models;


namespace EventoApi.Services
{
    public interface ILugarService
    {
        Task<IEnumerable<Lugar>> ObtenerLugaresAsync();  // Método para obtener los lugares
        Task<Lugar?> ObtenerLugarPorIdAsync(int LugarId );
    }
}
