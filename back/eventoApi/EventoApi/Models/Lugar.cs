using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace EventoApi.Models;

public partial class Lugar
{
    public int ID { get; set; }

    public string? Descripcion { get; set; } = null!;

    public int CiudadId { get; set; }

    public virtual Ciudad? CiudadIDNavegation { get; set; }

    [JsonIgnore]
    public virtual ICollection<Evento> Eventos { get; set; } = new List<Evento>();
}
