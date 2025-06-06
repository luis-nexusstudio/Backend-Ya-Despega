// services/home-service.js
const admin = require('../config/firebase');
const db = admin.firestore();

/**
 * Obtiene información específica del evento principal (home)
 * Incluye: fechas, información del evento, lineup y ubicación
 * @param {string} eventId - ID del evento a obtener
 */
async function getHomeEventData(eventId) {
  if (!eventId) {
    throw new Error('EventId es requerido');
  }

  try {
    const eventDoc = await db.collection('eventos').doc(eventId).get();
    
    if (!eventDoc.exists) {
      throw new Error('Evento no encontrado');
    }

    const eventData = eventDoc.data();
    
    // Extraer información del lineup si existe
    const lineup = [];
    if (eventData.line_up && typeof eventData.line_up === 'object' && !Array.isArray(eventData.line_up)) {
      // Si line_up es un objeto/map (Pastor_1, Pastor_2, etc.)
      for (const [key, pastor] of Object.entries(eventData.line_up)) {
        if (pastor && pastor.nombre && pastor.informacion) {
          lineup.push({
            nombre: pastor.nombre,
            informacion: pastor.informacion,
            imageName: pastor.imageName
          });
        }
      }
    } else if (Array.isArray(eventData.line_up)) {
      // Si line_up es un array (compatibilidad con formato anterior)
      eventData.line_up.forEach(speaker => {
        if (speaker && speaker.nombre && speaker.informacion) {
            console.log(speaker.imageName)

          lineup.push({
            nombre: speaker.nombre,
            informacion: speaker.informacion,
            imageName: speaker.imageName
          });
        }
      });
}

    // Formatear fechas de Firestore Timestamp a Date
    const formatFirebaseDate = (timestamp) => {
      if (timestamp && timestamp._seconds) {
        return {
          _seconds: timestamp._seconds,
          _nanoseconds: timestamp._nanoseconds || 0
        };
      }
      if (timestamp && timestamp.seconds) {
        return {
          _seconds: timestamp.seconds,
          _nanoseconds: timestamp.nanoseconds || 0
        };
      }
      // Si es una fecha de JavaScript, convertir a formato Firebase
      if (timestamp instanceof Date) {
        return {
          _seconds: Math.floor(timestamp.getTime() / 1000),
          _nanoseconds: (timestamp.getTime() % 1000) * 1000000
        };
      }
      return timestamp;
    };

    return {
      id: eventDoc.id,
      fecha_inicio: formatFirebaseDate(eventData.fecha_inicio),
      fecha_fin: formatFirebaseDate(eventData.fecha_fin),
      informacion_evento: eventData.informacion_evento || '',
      lineup: lineup.map(speaker => ({
        nombre: speaker.nombre || '',
        informacion: speaker.informacion || '',
        imageName: speaker.imageName || ''
      })),
      ubicacion: eventData.ubicacion?.ubicacion_nombre || '',
      coordenadas: {
        lat: eventData.ubicacion?.ubicacion_lat || 21.1428,
        lng: eventData.ubicacion?.ubicacion_lng || -101.6866
      },
      nombre: eventData.nombre || '',
      terminos: Array.isArray(eventData.terminos) 
        ? eventData.terminos 
        : typeof eventData.terminos === 'string'
          ? eventData.terminos.split(',').map(t => t.trim())
          : []
    };

  } catch (error) {
    console.error(`Error obteniendo evento home con ID ${eventId}:`, error);
    throw new Error(`Error al obtener información del evento: ${error.message}`);
  }
}

module.exports = {
  getHomeEventData
};