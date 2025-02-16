using System;
using System.Collections.Generic;

namespace EventoApi.Models;

public partial class Evento
{
    public int ID { get; set; }

    public string? Nombre { get; set; }

    public DateOnly? Fecha { get; set; }

    public TimeOnly? HorarioInicio { get; set; }

    public TimeOnly? HorarioFin { get; set; }

    public string? Descripcion { get; set; }

    public int LugarId { get; set; }

    public virtual Lugar? LugarIDNavegation { get; set; }
}
