/*
    -- Author:	Luis Melendez
    -- Create date: 08/05/2024
    -- Update date: 
    -- Description:	Servicio que encapsula la lógica para crear preferencias de pago con Mercado Pago
    -- Update:      
                    
*/

const { preferenceService } = require('../config/mercado-pago');
const { isEmail } = require('validator');

async function createPreference(items, payerEmail, payerUid, externalReference) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Debe enviarse al menos un ítem para la preferencia.');
  }
  if (!isEmail(payerEmail)) {
    throw new Error('El correo del pagador no es válido.');
  }

  const mpItems = items.map(i => {
    const qty = Number(i.qty);
    const price = parseFloat(i.price);
    if (!i.name || qty <= 0 || isNaN(price) || price <= 0) {
      throw new Error(`Ítem inválido: ${JSON.stringify(i)}`);
    }
    return {
      title:       i.name,
      quantity:    qty,
      unit_price:  price,
      currency_id: process.env.CURRENCY_ID || 'MXN',
    };
  });

  try {
    const preferenceData = {
      items: mpItems,
      payer: { email: payerEmail },
      back_urls: {
        success: "ydapp://payment-success",
        pending: "ydapp://payment-pending",
        failure: "ydapp://payment-failure"
      },
      auto_return: "approved",
      external_reference: externalReference,
      metadata: {
        firebase_uid: payerUid,
        boletos: JSON.stringify(mpItems)
      }
    };

    const result = await preferenceService.create({ body: preferenceData });
    const data = result.response?.body || result.body || result;

    const prefId = data.id;
    const initPoint = data.init_point;

    if (!prefId || !initPoint) {
      throw new Error("No se devolvió init_point o id válidos");
    }

    return { prefId, initPoint };

  } catch (err) {
    console.error('MP Error:', err);
    throw new Error(`Error al crear preferencia de pago: ${err.message}`);
  }
}

module.exports = { createPreference };