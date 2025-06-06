/*
    -- Author:	Luis Melendez
    -- Create date: 02/06/2025
    -- Update date: 
    -- Description:	Controlador para manejar verificación de email
    -- Update:      
                    
*/

const { getVerificationStatus } = require('../services/users-service');

/**
 * Obtiene el estado de verificación del email del usuario actual
 * GET /api/verification/status
 */
async function handleGetVerificationStatus(req, res) {
  try {
    const userId = req.user.uid;
    
    console.log(`🔍 [VerificationController] Consultando estado para usuario: ${userId}`);
    
    const result = await getVerificationStatus(userId);
    
    if (result.status === 'error') {
      return res.status(500).json({
        success: false,
        error: result.message
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        verified: result.verified,
        auth_verified: result.auth_verified,
        firestore_status: result.firestore_status,
        message: result.message,
        can_purchase: result.verified
      }
    });

  } catch (error) {
    console.error(`❌ [VerificationController] Error:`, error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
}

/**
 * Endpoint para que el frontend pueda verificar si puede proceder con compras
 * GET /api/verification/can-purchase
 */
async function handleCanPurchase(req, res) {
  try {
    const userId = req.user.uid;
    
    const result = await getVerificationStatus(userId);
    
    const canPurchase = result.status === 'success' && result.verified;
    
    res.status(200).json({
      success: true,
      can_purchase: canPurchase,
      verified: result.verified || false,
      message: canPurchase 
        ? 'Usuario puede realizar compras' 
        : 'Email debe ser verificado para comprar'
    });

  } catch (error) {
    console.error(`❌ [VerificationController] Error en can-purchase:`, error);
    res.status(500).json({
      success: false,
      can_purchase: false,
      error: 'Error verificando permisos de compra'
    });
  }
}

module.exports = {
  handleGetVerificationStatus,
  handleCanPurchase
};