using System;
using System.Collections.Generic;

namespace EventoApi.Models;

public partial class Ciudad
{
    public int ID { get; set; }

    public string? Nombre { get; set; }

    public int ProvinciaId { get; set; }

    public virtual ICollection<Lugar> Lugars { get; set; } = new List<Lugar>();

    public virtual Provincia? ProvinciaIDNavegation { get; set; }
}
