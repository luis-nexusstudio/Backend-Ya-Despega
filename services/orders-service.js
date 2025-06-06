// services/orders-service.js actualizado
const admin = require('../config/firebase');
const db = admin.firestore();

/**
 * Trae la orden cuyo doc.id = preferenceId, y que su campo userId === uid.
 */
async function fetchOrderForUserByExternalReference(externalReference, uid) {
  const querySnapshot = await db.collection('ordenes')
    .where('external_reference', '==', externalReference)
    .where('userId', '==', uid)
    .limit(1)
    .get();

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  const data = doc.data();

  let total = 0;
  if (data.items && Array.isArray(data.items)) {
    total = data.items.reduce((sum, item) => {
      return sum + (item.unit_price || item.price || 0) * (item.quantity || item.qty || 1);
    }, 0);
  }

  return {
    id: doc.id,
    items: formatItems(data.items || []),
    total: total,
    status: data.status || 'pending',
    createdAt: data.createdAt || '',
    ...data
  };
}


/**
 * Trae todas las órdenes del usuario, ordenadas por fecha de creación (más recientes primero)
 */
async function fetchAllOrdersForUser(uid) {

  const querySnapshot = await db.collection('ordenes')
    .where('userId', '==', uid)
    .where('status', 'not-in', ['created'])
    .get();
  
  if (querySnapshot.empty) {
    return [];
  }
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    
    // Calcular el total de la orden
    let total = 0;
    if (data.items && Array.isArray(data.items)) {
      total = data.items.reduce((sum, item) => {
        return sum + (item.unit_price || item.price || 0) * (item.quantity || item.qty || 1);
      }, 0);
    }
    
    return {
      id: doc.id,
      items: formatItems(data.items || []),
      total: total,
      status: data.status || 'pending',
      createdAt: data.createdAt || '',
      ...data
    };
  });
}

/**
 * Función para formatear los items para la API
 */
function formatItems(items) {
  return items.map(item => ({
    name: item.title || item.name || 'Producto sin nombre',
    qty: item.quantity || item.qty || 1,
    price: item.unit_price || item.price || 0
  }));
}

module.exports = {
  fetchOrderForUserByExternalReference,
  fetchAllOrdersForUser
};