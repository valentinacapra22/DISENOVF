import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createEvent, editEvent, getEvents, getLugares } from "../apiService/apiService";
import useSignalR from "../useSignalR/useSignalR";
import './AltaEvento.css';

const AltaEvento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const eventoEditado = location.state?.evento;

  const [form, setForm] = useState({
    id: 0,
    nombre: "",
    fecha: "",
    horarioInicio: "",
    horarioFin: "",
    descripcion: "",
    lugarId: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lugares, setLugares] = useState([]);

  useSignalR(() => {
    console.log("Evento recibido a través de SignalR");
  });

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    return new Date(fecha).toISOString().split('T')[0];
  };

  useEffect(() => {
    const cargarLugares = async () => {
      setIsLoading(true);
      try {
        const response = await getLugares();
        if (response?.data) {
          setLugares(response.data);
        } else {
          throw new Error("No se pudieron obtener los lugares");
        }
      } catch (error) {
        setError("No se pudieron cargar los lugares.");
      } finally {
        setIsLoading(false);
      }
    };

    cargarLugares();

    if (eventoEditado) {
      setForm({
        id: eventoEditado.id || 0,
        nombre: eventoEditado.nombre || "",
        fecha: formatFecha(eventoEditado.fecha) || "",
        horarioInicio: eventoEditado.horarioInicio || "",
        horarioFin: eventoEditado.horarioFin || "",
        descripcion: eventoEditado.descripcion || "",
        lugarId: eventoEditado.lugarId?.toString() || "",
      });
    }
  }, [eventoEditado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    if (error) setError(null);
  };

  const validarFormulario = () => {
    if (!form.fecha || !form.horarioInicio || !form.horarioFin || !form.nombre || !form.lugarId) {
      setError("Todos los campos son obligatorios");
      return false;
    }

    if (form.horarioFin <= form.horarioInicio) {
      setError("La hora de fin debe ser posterior a la hora de inicio.");
      return false;
    }

    if (new Date(form.fecha) < new Date().setHours(0, 0, 0, 0)) {
      setError("La fecha no puede ser anterior a hoy.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const eventoFormateado = {
        id: form.id,
        nombre: form.nombre,
        fecha: form.fecha,
        horarioInicio: form.horarioInicio,
        horarioFin: form.horarioFin,
        descripcion: form.descripcion,
        lugarId: parseInt(form.lugarId),
      };

      if (eventoEditado) {
        await editEvent(eventoEditado.id, eventoFormateado);
        setSuccessMessage("Evento actualizado exitosamente");
      } else {
        await createEvent(eventoFormateado);
        setSuccessMessage("Evento creado exitosamente");
      }

      // Volvemos a obtener la lista de eventos después de guardar cambios
      await getEvents();

      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setError("Error al guardar el evento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="alta-evento-container">
      <h1 className="alta-evento-title">
        {eventoEditado ? "Editar Evento" : "Alta Evento"}
      </h1>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="alta-evento-form">
        <div>
          <label className="alta-evento-label">Fecha:</label>
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            required
            className="alta-evento-input"
          />
        </div>

        <div className="alta-evento-grid">
          <div>
            <label className="alta-evento-label">Horario Inicio:</label>
            <input
              type="time"
              name="horarioInicio"
              value={form.horarioInicio}
              onChange={handleChange}
              required
              className="alta-evento-input"
              step="1"
            />
          </div>

          <div>
            <label className="alta-evento-label">Horario Fin:</label>
            <input
              type="time"
              name="horarioFin"
              value={form.horarioFin}
              onChange={handleChange}
              required
              className="alta-evento-input"
              step="1"
            />
          </div>
        </div>

        <div>
          <label className="alta-evento-label">Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            className="alta-evento-input"
            maxLength={100}
          />
        </div>

        <div>
          <label className="alta-evento-label">Lugar:</label>
          <select
            name="lugarId"
            value={form.lugarId}
            onChange={handleChange}
            required
            className="alta-evento-input"
          >
            <option value="">Seleccionar lugar</option>
            {lugares.map((lugar) => (
              <option key={lugar.id} value={lugar.id}>
                {lugar.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="alta-evento-label">Descripción:</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            required
            className="alta-evento-input"
            rows="3"
            maxLength={500}
          />
        </div>

        <div className="alta-evento-buttons">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="alta-evento-button alta-evento-button-cancel"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="alta-evento-button alta-evento-button-save"
            disabled={isLoading}
          >
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default AltaEvento;