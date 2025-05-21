const { getEventById, getBoletosByEventoRef } = require('../services/events-service');

async function handleGetEventDetails(req, res) {
  try {
    const eventId = req.params.eventId;
    const evento = await getEventById(eventId);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });

    const boletos = await getBoletosByEventoRef(evento.ref);

    res.json({
      id: evento.id,
      nombre: evento.nombre || '',
      fecha_inicio: evento.fecha_inicio || '',
      fecha_fin: evento.fecha_fin || '',
      ubicacion: evento.ubicacion || '',
      estatus_activo: evento.estatus_activo ?? true,
      cuota_servicio: evento.cuota_servicio ?? 0.04,
      detalles: evento.detalles || '',
      terminos: typeof evento.terminos === 'string'
        ? evento.terminos.split(',').map(t => t.trim())
        : Array.isArray(evento.terminos)
        ? evento.terminos
        : [],
      tickets: boletos
    });
  } catch (err) {
    console.error('Error en evento:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  handleGetEventDetails
};