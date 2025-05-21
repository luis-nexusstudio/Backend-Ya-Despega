const admin = require('../config/firebase');
const axios = require('axios');

const MAX_ATTEMPTS = 3;
const prioridad = { approved: 3, pending: 2, rejected: 1 };

async function procesarNotificacionDePago(paymentId) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  const url = `https://api.mercadopago.com/v1/payments/${paymentId}`;
  const db = admin.firestore();

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    try {
      const { data: payment } = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const prefId = payment.preference_id;
      let orderRef;
      let idUsado = prefId;

      if (prefId) {
        orderRef = db.collection('ordenes').doc(prefId);
      } else if (payment.external_reference) {
        console.warn(`⚠️ preference_id vacío, usando external_reference: ${payment.external_reference}`);
        const snapshot = await db.collection('ordenes')
          .where('external_reference', '==', payment.external_reference)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          orderRef = snapshot.docs[0].ref;
          idUsado = payment.external_reference;
        } else {
          console.warn(`❗ No se encontró orden con external_reference: ${payment.external_reference}`);
          return;
        }
      } else {
        console.warn(`❗ No se puede procesar el pago ${paymentId}, sin preference_id ni external_reference`);
        return;
      }

      const orderSnap = await orderRef.get();
      if (!orderSnap.exists) {
        console.warn(`❗ Orden no encontrada en Firestore para ID: ${idUsado}`);
        return;
      }

      const estadoActual = orderSnap.data().status || 'pending';
      const nuevaPrioridad = prioridad[payment.status] || 0;
      const prioridadActual = prioridad[estadoActual] || 0;

      if (nuevaPrioridad > prioridadActual) {
        await orderRef.update({
          status: payment.status,
          status_detail: payment.status_detail,
          payment_id: payment.id,
          updatedAt: new Date().toISOString()
        });
        console.log(`✅ Estado actualizado: ${estadoActual} → ${payment.status}`);
      } else {
        console.log(`🔁 Estado ignorado (menor o igual prioridad): ${estadoActual} vs ${payment.status}`);
      }

      // Guardar intento de pago
      await orderRef.update({
        payment_attempts: admin.firestore.FieldValue.arrayUnion({
          id: payment.id,
          status: payment.status,
          status_detail: payment.status_detail,
          createdAt: payment.date_created || new Date().toISOString(),
          method: payment.payment_method_id || null,
          type: payment.payment_type_id || null
        })
      });

      // Enviar notificación si hay token
      const { userId } = orderSnap.data();
      const tokenSnap = await db.collection('tokens').doc(userId).get();
      const fcmToken = tokenSnap.exists ? tokenSnap.data().fcm_token : null;

      if (fcmToken) {
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title: payment.status === 'approved'
              ? '✅ Pago exitoso'
              : 'ℹ️ Estado de tu pago',
            body: payment.status === 'approved'
              ? 'Gracias por tu compra. Tus boletos están listos.'
              : `Tu pago está: ${payment.status}`
          }
        });
        console.log(`📲 Notificación enviada a usuario ${userId}`);
      }

      return; // todo ok

    } catch (err) {
      if (err.response?.status === 404 && i < MAX_ATTEMPTS - 1) {
        console.warn(`⏳ Pago aún no disponible. Reintentando... (${i + 1}/${MAX_ATTEMPTS})`);
        await new Promise(r => setTimeout(r, 1500));
      } else {
        console.error('❌ Error al consultar el pago:', err.response?.data || err.message);
        throw err;
      }
    }
  }

  console.warn('🚫 Se agotaron los intentos; el pago sigue sin estar disponible.');
}

module.exports = { procesarNotificacionDePago };