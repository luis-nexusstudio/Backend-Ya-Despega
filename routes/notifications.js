
const express = require('express');
const router = express.Router();
const { handlePaymentNotification } = require('../controllers/notifications-controller');


router.post('/webhook/mercadopago',   
  express.raw({ type: '*/*' }),
 handlePaymentNotification);

module.exports = router;