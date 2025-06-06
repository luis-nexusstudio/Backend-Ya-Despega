/*
    -- Author:	Luis Melendez
    -- Create date: 02/06/2025
    -- Update date: 
    -- Description:	Rutas para manejo de verificación de email
    -- Update:      
                    
*/

const express = require('express');
const router = express.Router();
const firebaseAuth = require('../middleware/auth');
const { 
  handleGetVerificationStatus, 
  handleCanPurchase
} = require('../controllers/verification-controller');

/**
 * GET /api/verification/status
 * Obtiene el estado detallado de verificación del usuario
 */
router.get('/verification/status', firebaseAuth, handleGetVerificationStatus);

/**
 * GET /api/verification/can-purchase  
 * Verifica si el usuario puede realizar compras
 */
router.get('/verification/can-purchase', firebaseAuth, handleCanPurchase);


module.exports = router;