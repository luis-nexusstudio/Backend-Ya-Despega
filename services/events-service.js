const admin = require('../config/firebase');
const db = admin.firestore();

async function getEventById(eventId) {
  const doc = await db.collection('eventos').doc(eventId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data(), ref: doc.ref };
}

async function getBoletosByEventoRef(eventRef) {
  const snapshot = await db.collection('boletos').where('evento_ref', '==', eventRef).get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    descripcion: doc.data().descripcion,
    tipo: doc.data().tipo,
    precio: doc.data().precio,
    disponibilidad: doc.data().disponibilidad,
    beneficios: Array.isArray(doc.data().beneficios)
      ? doc.data().beneficios
      : typeof doc.data().beneficios === 'string'
        ? doc.data().beneficios.split(',').map(b => b.trim())
        : []
  }));
}

module.exports = {
  getEventById,
  getBoletosByEventoRef
};