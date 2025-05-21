// controllers/orderController.js
const { fetchOrderForUser } = require('../services/orders-service');

async function getOrder(req, res) {
  const { preferenceId } = req.params;
  const uid = req.user.uid;
  console.log(`🔔 [getOrder] llamada recibida – uid=${uid}, preferenceId=${preferenceId}`);

  try {
    if (!preferenceId) {
      console.log('⚠️ [getOrder] preferenceId faltante');
      return res.status(400).json({ error: 'preferenceId es requerido' });
    }

    const order = await fetchOrderForUser(preferenceId, uid);
    if (!order) {
      console.log(`❌ [getOrder] orden no encontrada o no autorizada para ${uid}`);
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    console.log(`✅ [getOrder] orden encontrada:`, order);
    return res.json(order);
  } catch (err) {
    console.error('🔥 [getOrder] error interno:', err);
    return res.status(500).json({ error: 'Error obteniendo la orden' });
  }
}

module.exports = {
  getOrder
};