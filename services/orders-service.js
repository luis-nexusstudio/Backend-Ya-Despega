// services/orderService.js
const admin = require('../config/firebase');
const db = admin.firestore();

/**
 * Trae la orden cuyo doc.id = preferenceId, y que su campo userId === uid.
 */
async function fetchOrderForUser(preferenceId, uid) {
  const docRef = db.collection('ordenes').doc(preferenceId);
  const snap = await docRef.get();
  if (!snap.exists) {
    return null;
  }
  const data = snap.data();
  if (data.userId !== uid) {
    // el usuario no es dueño de esta orden
    return null;
  }
  return { id: snap.id, ...data };
}

module.exports = {
  fetchOrderForUser
};