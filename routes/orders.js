// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { getOrder } = require('../controllers/orders-controller');
const firebaseAuth = require('../middleware/auth');
const { FirebaseAuthError } = require('firebase-admin/auth');

// GET /api/orders/:prefId
router.get('/orders/:prefId',firebaseAuth ,getOrder);

module.exports = router;