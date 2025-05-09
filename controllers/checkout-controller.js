/*
    -- Author:	Luis Melendez
    -- Create date: 08/05/2024
    -- Update date: 
    -- Description:	Controlador encargado de procesar la ruta de creación de preferencias de pago de Mercado Pago
    -- Update:      
                    
*/

const { createPreference } = require('../services/checkout-service');

async function handleCreatePreference(req, res) {
  try {
    const { items, payerEmail } = req.body;
    const prefId = await createPreference(items, payerEmail);
    if (!prefId) {
      console.error('No se obtuvo preferenceId');
      return res.status(500).json({ error: 'No se obtuvo preferenceId' });
    }
    res.json({ preferenceId: prefId });
  } catch (err) {
    console.error('Error creando preference:', err);
    res.status(500).json({ error: 'No se pudo crear la preference' });
  }
}

module.exports = { handleCreatePreference };
