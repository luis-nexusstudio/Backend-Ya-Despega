/*
    -- Author:	Luis Melendez
    -- Create date: 08/05/2024
    -- Update date: 
    -- Description:	Define la ruta para crear preferencias de pago y aplica middleware de autenticación y validación
    -- Update:      
                    
*/

const express = require('express');
const { handleCreatePreference } = require('../controllers/checkout-controller');
const firebaseAuth = require('../middleware/auth');
const { createPreferenceRules, validate } = require('../middleware/validators');

const router = express.Router();

// Endpoint que hara el proceso de la preference
router.post(
  '/create-preference',
  firebaseAuth,
  createPreferenceRules,
  validate,
  handleCreatePreference
);

module.exports = router;
