// routes/home.js
const express = require('express');
const router = express.Router();
const firebaseAuth = require('../middleware/auth');
const { handleGetHomeEvent } = require('../controllers/home-controller');

/**
 * GET /api/home-event
 * Obtiene información del evento principal para la vista Home
 * Requiere autenticación Firebase
 */
router.get('/home-event/:eventId', firebaseAuth, handleGetHomeEvent);

module.exports = router;