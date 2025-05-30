// routes/orders.js
const express = require('express');
const router = express.Router();
const { getOrder, getAllOrders } = require('../controllers/orders-controller');
const firebaseAuth = require('../middleware/auth');

// GET /api/orders/:prefId - Obtener una orden específica
router.get('/orders/ref/:prefRef', firebaseAuth, getOrder);

// GET /api/orders - Obtener todas las órdenes del usuario autenticado
router.get('/orders', firebaseAuth, getAllOrders);

module.exports = router;