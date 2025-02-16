import axios from 'axios';

const API_URL = 'http://localhost:5125/API/Evento';
const API_LUGAR_URL = 'http://localhost:5125/API/Lugar';

// Configuración global de axios
axios.defaults.withCredentials = true;

// Función auxiliar para manejar errores
const handleError = (error, context) => {
    const errorMessage = error.response?.data || error.message || 'Error desconocido';
    console.error(`Error en ${context}:`, errorMessage);
    throw new Error(`${context}: ${errorMessage}`);
};

// Función para validar la respuesta
const validateResponse = (response, context) => {
    if (!response?.data) {
        throw new Error(`${context}: No se recibieron datos`);
    }
    return response;
};

export const getLugares = async () => {
    try {
        const response = await axios.get(`${API_LUGAR_URL}/ListaLugares`);
        return validateResponse(response, 'getLugares');
    } catch (error) {
        return handleError(error, 'getLugares');
    }
};

export const getLugarById = async (id) => {
    try {
        const response = await axios.get(`${API_LUGAR_URL}/${id}`);
        return validateResponse(response, 'getLugarById');
    } catch (error) {
        return handleError(error, 'getLugarById');
    }
};

export const getEvents = async () => {
    try {
        const response = await axios.get(`${API_URL}/ListaEventos`);
        return validateResponse(response, 'getEvents');
    } catch (error) {
        return handleError(error, 'getEvents');
    }
};

export const getEventById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/EventoPorId/${id}`);
        return validateResponse(response, 'getEventById');
    } catch (error) {
        return handleError(error, 'getEventById');
    }
};

export const createEvent = async (eventData) => {
    try {
        const formattedData = {
            nombre: eventData.nombre?.trim(),
            fecha: eventData.fecha,
            horarioInicio: eventData.horarioInicio,
            horarioFin: eventData.horarioFin,
            descripcion: eventData.descripcion?.trim(),
            lugarId: parseInt(eventData.lugarId)
        };

        // Validaciones
        if (!formattedData.nombre) throw new Error('El nombre es requerido');
        if (!formattedData.fecha) throw new Error('La fecha es requerida');
        if (!formattedData.lugarId) throw new Error('El lugar es requerido');

        const response = await axios.post(`${API_URL}/CrearEvento`, formattedData);
        return validateResponse(response, 'createEvent');
    } catch (error) {
        return handleError(error, 'createEvent');
    }
};

export const editEvent = async (id, eventData) => {
    try {
        const formatearHora = (hora) => {
            if (!hora) return '';
            if (hora === '00:00:00' || hora === '00:00') {
                return eventData.horaOriginalInicio || eventData.horaOriginalFin || hora;
            }
            if (hora.includes(':')) {
                const [hours, minutes, seconds = '00'] = hora.split(':');
                return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
            }
            return hora;
        };

        const formattedData = {
            id: id,
            nombre: eventData.nombre?.trim(),
            fecha: new Date(eventData.fecha).toISOString().split('T')[0],
            horarioInicio: formatearHora(eventData.horarioInicio || eventData.horaInicio),
            horarioFin: formatearHora(eventData.horarioFin || eventData.horaFin),
            descripcion: eventData.descripcion?.trim(),
            lugarId: parseInt(eventData.lugarId || eventData.lugar)
        };

        // Validaciones
        if (!formattedData.nombre) throw new Error('El nombre es requerido');
        if (!formattedData.fecha) throw new Error('La fecha es requerida');
        if (!formattedData.lugarId) throw new Error('El lugar es requerido');

        const response = await axios.put(`${API_URL}/EditarEvento/${id}`, formattedData);
        return validateResponse(response, 'editEvent');
    } catch (error) {
        return handleError(error, 'editEvent');
    }
};