const { procesarNotificacionDePago } = require('../services/notifications-service');

async function handlePaymentNotification(req, res) {
  let ev;

  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length) {
    ev = req.body;
  } else {
    ev = {
      type: req.query.type,
      action: 'payment.updated',
      data: {
        id: req.query['data.id'] || req.query.id
      }
    };
  }

  console.log('📩 Webhook recibido:', JSON.stringify(ev, null, 2));

  const paymentId = ev.data?.id;
  if (!paymentId) {
    console.warn('⚠️ payment.id ausente en webhook');
    return res.sendStatus(200);
  }

  // Solo procesamos payment.created o payment.updated
  if (ev.type === 'payment' && ['payment.created', 'payment.updated'].includes(ev.action)) {
    console.log(`🔍 Procesando ${ev.action} ID: ${paymentId}`);
    try {
      await procesarNotificacionDePago(paymentId);
      console.log('✅ Webhook procesado exitosamente');
    } catch (err) {
      console.error('❌ Error al procesar webhook:', err);
    }
  } else {
    console.log(`↩️ Ignorado: type=${ev.type}, action=${ev.action}`);
  }

  return res.sendStatus(200);
}

module.exports = { handlePaymentNotification };