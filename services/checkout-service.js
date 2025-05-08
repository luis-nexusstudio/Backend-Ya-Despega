/*
    -- Author:	Luis Melendez
    -- Create date: 08/05/2024
    -- Update date: 
    -- Description:	Servicio que encapsula la lógica para crear preferencias de pago con Mercado Pago
    -- Update:      
                    
*/

const { preferenceService } = require('../config/mercado-pago');
const { isEmail } = require('validator');

async function createPreference(items, payerEmail, orderId) {

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

    const preferenceData = { items: mpItems, payer: { email: payerEmail } };
    const result = await preferenceService.create({ body: preferenceData });
    return result.response?.body?.id
        || result.body?.id
        || result.id;

  } catch (err) {
    console.error('MP Error:', err);
    throw new Error(`Error al crear preferencia de pago: ${err.message}`);
  }
}

module.exports = { createPreference };
