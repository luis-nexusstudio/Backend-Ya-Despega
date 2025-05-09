/*
    -- Author:	Luis Melendez
    -- Create date: 08/05/2024
    -- Update date: 
    -- Description:	Configura el cliente de Mercado Pago y exporta el servicio de preferencias
    -- Update:      
                    
*/

const { MercadoPagoConfig, Preference } = require('mercadopago');

const accessToken = process.env.MP_ACCESS_TOKEN
 
if (!accessToken) {
  throw new Error(
    `No se encontró MP_ACCESS_TOKEN en las variables de entorno`
  );
}

const mpClient = new MercadoPagoConfig({
  accessToken
});

module.exports = {
  preferenceService: new Preference(mpClient),
};
