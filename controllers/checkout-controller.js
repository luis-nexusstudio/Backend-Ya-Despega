const admin = require('../config/firebase');
const { createPreference } = require('../services/checkout-service');

async function handleCreatePreference(req, res) {
  try {
    const { items, payerEmail } = req.body;
    const payerUid = req.user.uid;

    if (!payerUid) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Debe enviar al menos un ítem.' });
    }
    if (!payerEmail) {
      return res.status(400).json({ error: 'Falta payerEmail.' });
    }

    // 🔐 Generamos el external_reference una sola vez
    const externalRef = `orden-${payerUid}-${Date.now()}`;

    // 🔗 Creamos la preferencia con el external_reference unificado
    const { prefId, initPoint } = await createPreference(items, payerEmail, payerUid, externalRef);

    // 📦 Guardamos la orden en Firestore con el mismo external_reference
    const orderRef = admin.firestore().collection('ordenes').doc(prefId);

    const mpItems = items.map(i => ({
      title:      i.name,
      quantity:   Number(i.qty),
      unit_price: parseFloat(i.price),
    }));

    await orderRef.set({
      userId: payerUid,
      status: 'created',
      createdAt: new Date().toISOString(),
      items: mpItems,
      external_reference: externalRef
    });

    return res.json({
      preferenceId: prefId,
      checkoutUrl:  initPoint,
      externalReference: externalRef
    });

  } catch (err) {
    console.error('Error creando preference:', err);
    return res.status(500).json({ error: 'No se pudo crear la referencia de pago.' });
  }
}

module.exports = { handleCreatePreference };