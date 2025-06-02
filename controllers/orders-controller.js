// controllers/orders-controller.js actualizado
const { fetchOrderForUserByExternalReference, fetchAllOrdersForUser } = require('../services/orders-service');

// Función para obtener una orden específica
async function getOrder(req, res) {
  const externalReference = req.params.prefRef;
  const uid = req.user.uid;
  console.log(`🔔 [getOrder] llamada recibida – uid=${uid}, externalReference=${externalReference}`);

  try {
    if (!externalReference) {
      console.log('⚠️ [getOrder] external_reference faltante');
      return res.status(400).json({ error: 'external_reference es requerido' });
    }

    const order = await fetchOrderForUserByExternalReference(externalReference, uid);
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

// Nueva función para obtener todas las órdenes de un usuario
async function getAllOrders(req, res) {
  const uid = req.user.uid;
  console.log(`🔔 [getAllOrders] llamada recibida – uid=${uid}`);

  try {
    const orders = await fetchAllOrdersForUser(uid);
    console.log(`✅ [getAllOrders] encontradas ${orders.length} órdenes para ${uid}`);
    return res.json(orders);
  } catch (err) {
    console.error('🔥 [getAllOrders] error interno:', err);
    return res.status(500).json({ error: 'Error obteniendo las órdenes del usuario' });
  }
}

module.exports = {
  getOrder,
  getAllOrders
};