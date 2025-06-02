// controllers/home-controller.js
const { getHomeEventData } = require('../services/home-service');

/**
 * Controlador para obtener información del evento principal
 * GET /api/home-event/:eventId
 */
async function handleGetHomeEvent(req, res) {
  try {
    // Obtener eventId de los parámetros de la ruta
    const { eventId } = req.params;
    
    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: 'EventId requerido',
        message: 'Debe proporcionar un eventId válido'
      });
    }

    // Log de la petición
    console.log(`🔍 [HomeController] Solicitando datos para eventId: ${eventId}, usuario: ${req.user.uid}`);
    
    const homeEventData = await getHomeEventData(eventId);
    
    // Log para debugging (remover en producción si no es necesario)
    console.log(`✅ [HomeController] Home event data retrieved successfully for event: ${eventId}`);
    
    res.status(200).json({
      success: true,
      data: homeEventData
    });

  } catch (error) {
    console.error(`❌ [HomeController] Error en handleGetHomeEvent para eventId ${req.params.eventId}:`, error);
    
    // Manejo específico de errores
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado',
        message: 'El evento solicitado no existe en la base de datos'
      });
    }

    if (error.message.includes('requerido')) {
      return res.status(400).json({
        success: false,
        error: 'Parámetros inválidos',
        message: error.message
      });
    }

    // Error genérico del servidor
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo obtener la información del evento'
    });
  }
}

module.exports = {
  handleGetHomeEvent
};