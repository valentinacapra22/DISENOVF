using EventoApi.Models;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace EventoApi.Hubs
{
    public class EventoHub :  Hub 
    {

        // Método que el servidor usará para notificar a los clientes
        public async Task EnviarEvento(Evento evento)
        {
            await Clients.All.SendAsync("RecibirEvento", evento); // Envía el evento a todos los clientes
        }

    }
}
