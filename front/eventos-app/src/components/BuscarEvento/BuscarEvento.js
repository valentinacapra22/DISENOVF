import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getEvents, getLugares } from "../apiService/apiService";
import "./BuscarEvento.css";

const BuscarEvento = () => {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

// Función para normalizar los datos
const normalizarDatos = (lugaresData, eventosData) => {
  console.log("Normalizando datos de lugares:", JSON.stringify(lugaresData, null, 2));
  console.log("Normalizando datos de eventos:", JSON.stringify(eventosData, null, 2));

  // Normalizar lugares
  const lugaresNormalizados = lugaresData.map((lugar) => {
    // Verificar y loguear el ID del lugar
    const lugId = String(lugar.ID !== undefined ? lugar.ID : (lugar.id !== undefined ? lugar.id : ""));
    console.log(`Normalizando lugar: ID=${lugId}, descripcion=${lugar.descripcion}`);
    
    return {
      id: lugId,
      nombre: lugar.descripcion || "Sin nombre",
      original: lugar,
    };
  });

  // Normalizar eventos
  let eventosNormalizados = [];
  if (eventosData && eventosData.length) {
    eventosNormalizados = eventosData.map((evento) => {
      // Verificar todas las propiedades posibles para el lugarID
      const posiblesIDs = ['lugarID', 'lugarId', 'lugar_id', 'LugarID', 'IDLugar', 'id_lugar'];
      let lugarId = "";
      
      for (const idProp of posiblesIDs) {
        if (evento[idProp] !== undefined) {
          lugarId = String(evento[idProp]);
          console.log(`Encontrado ID de lugar en propiedad '${idProp}': ${lugarId}`);
          break;
        }
      }
      
      // Loguear todo el objeto evento para revisión
      console.log(`Evento completo:`, JSON.stringify(evento, null, 2));
      console.log(`Buscando lugar con ID: '${lugarId}' para el evento: ${evento.nombre}`);

      const lugar = lugaresNormalizados.find((l) => l.id === lugarId);
      console.log(`Lugar encontrado:`, lugar);

      return {
        ...evento,
        id: String(evento.id || evento._id || ""),
        lugarId: lugarId,
        fecha: formatearFechaParaMostrar(evento.fecha),
        horarioInicio: evento.horarioInicio?.slice(0, 5) || "No especificado",
        horarioFin: evento.horarioFin?.slice(0, 5) || "No especificado",
        lugarNombre: lugar ? lugar.original.descripcion : `Lugar no encontrado (ID: ${lugarId})`,
      };
    });
  }

  console.log("Lugares normalizados:", JSON.stringify(lugaresNormalizados, null, 2));
  console.log("Eventos normalizados:", JSON.stringify(eventosNormalizados, null, 2));

  return {
    lugares: lugaresNormalizados,
    eventos: eventosNormalizados,
  };
};

  // Función para formatear fechas
  const formatearFechaParaMostrar = (fechaString) => {
    if (!fechaString || typeof fechaString !== "string") return "Fecha no disponible";

    // Si la fecha ya está en formato DD/MM/YYYY, retornarla como está
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaString)) {
      return fechaString;
    }

    try {
      // Intentar con diferentes formatos
      let fecha;

      // Formato ISO: YYYY-MM-DD o YYYY-MM-DDTHH:MM:SS
      if (fechaString.includes("-")) {
        if (fechaString.includes("T")) {
          // Si tiene parte de tiempo, quedarse solo con la fecha
          fechaString = fechaString.split("T")[0];
        }

        // Dividir la fecha en componentes
        const [year, month, day] = fechaString.split("-").map(Number);

        // Verificar que los valores sean válidos
        if (
          isNaN(year) ||
          year < 1000 ||
          year > 9999 ||
          isNaN(month) ||
          month < 1 ||
          month > 12 ||
          isNaN(day) ||
          day < 1 ||
          day > 31
        ) {
          return "Fecha inválida";
        }

        // Convertir a formato DD/MM/YYYY
        return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
      }

      // Otros formatos de fecha
      fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) {
        return "Fecha inválida";
      }

      // Extraer componentes y formatear manualmente
      const day = String(fecha.getDate()).padStart(2, "0");
      const month = String(fecha.getMonth() + 1).padStart(2, "0");
      const year = fecha.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Fecha inválida";
    }
  };

  // Cargar lugares y eventos desde la API
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);

      // Cargar lugares
      const lugaresResponse = await getLugares();
      console.log("Respuesta completa de lugares:", JSON.stringify(lugaresResponse.data, null, 2));

      if (!lugaresResponse.data || !Array.isArray(lugaresResponse.data)) {
        console.error("Formato de datos de lugares incorrecto:", lugaresResponse.data);
        setError("Formato de datos incorrecto al cargar los lugares");
        setLoading(false);
        return;
      }

      // Cargar eventos
      const eventosResponse = await getEvents();
      console.log("Respuesta completa de eventos:", JSON.stringify(eventosResponse.data, null, 2));

      if (!eventosResponse.data || !Array.isArray(eventosResponse.data)) {
        console.error("Formato de datos de eventos incorrecto:", eventosResponse.data);
        setError("Formato de datos incorrecto al cargar los eventos");
        setLoading(false);
        return;
      }

      // Normalizar los datos
      const { lugares: lugaresNormalizados, eventos: eventosNormalizados } = normalizarDatos(
        lugaresResponse.data,
        eventosResponse.data,
      );

      // Actualizar estados
      setLugares(lugaresNormalizados);
      setEventos(eventosNormalizados);
      setError(null);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar los datos: " + (err.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Manejar la edición de un evento
  const handleEditEvent = (evento) => {
    navigate("/alta", {
      state: {
        evento: {
          ...evento,
          fecha: evento.fecha.includes("/") ? evento.fecha.split("/").reverse().join("-") : evento.fecha,
        },
        lugares,
      },
    });
  };

  // Filtrar eventos según la búsqueda
  const eventosFiltrados =
    busqueda.trim() === ""
      ? eventos
      : eventos.filter(
          (evento) =>
            (evento.nombre?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
            (evento.lugarNombre?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
            (evento.descripcion?.toLowerCase() || "").includes(busqueda.toLowerCase()),
        );

  if (loading) {
    return (
      <div className="buscar-evento-loading">
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="buscar-evento-container">
      {error && (
        <div className="buscar-evento-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      )}
      <h1 className="buscar-evento-title">Buscar Evento</h1>
      <div className="buscar-evento-search-bar">
        <input
          type="text"
          placeholder="Buscar evento..."
          className="buscar-evento-input"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar evento"
        />
        <button
          onClick={() => navigate("/alta", { state: { lugares } })}
          className="buscar-evento-button buscar-evento-button-add"
          aria-label="Añadir nuevo evento"
        >
          +
        </button>
      </div>

      {lugares.length === 0 && (
        <div className="buscar-evento-warning">
          <p>No hay lugares disponibles. Por favor, agregue lugares antes de crear eventos.</p>
        </div>
      )}

      {eventosFiltrados.length > 0 ? (
        <table className="buscar-evento-table">
          <thead>
            <tr className="buscar-evento-table-header">
              <th>Nombre</th>
              <th>Fecha</th>
              <th>Hora Inicio</th>
              <th>Hora Fin</th>
              <th>Lugar</th>
              <th>Descripción</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {eventosFiltrados.map((evento) => {
              return (
                <tr key={evento.id} className="buscar-evento-table-row">
                  <td>{evento.nombre || "Sin nombre"}</td>
                  <td>{evento.fecha}</td>
                  <td>{evento.horarioInicio}</td>
                  <td>{evento.horarioFin}</td>
                  <td>{evento.lugarNombre}</td>
                  <td>{evento.descripcion || "Sin descripción"}</td>
                  <td>
                    <button
                      onClick={() => handleEditEvent(evento)}
                      className="buscar-evento-button-edit"
                      aria-label={`Editar evento ${evento.nombre}`}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="buscar-evento-no-results">
          <p>No se encontraron eventos{busqueda ? " que coincidan con la búsqueda" : ""}.</p>
        </div>
      )}
    </div>
  );
};

export default BuscarEvento;