/*
    -- Author:	Luis Melendez
    -- Create date: 02/06/2025
    -- Update date: 
    -- Description:	Middleware para verificar que el usuario tenga su email verificado antes de comprar
    -- Update:      
                    
*/

const { getVerificationStatus } = require('../services/users-service');

/**
 * Middleware que verifica si el usuario tiene su email verificado
 * Requerido para operaciones de compra/pago
 */
async function requireEmailVerification(req, res, next) {
  try {
    const userId = req.user.uid;
    
    console.log(`🔐 [EmailVerification] Verificando estado para usuario: ${userId}`);
    
    // Obtener estado de verificación
    const verificationResult = await getVerificationStatus(userId);
    
    if (verificationResult.status === 'error') {
      console.log(`❌ [EmailVerification] Error verificando usuario ${userId}: ${verificationResult.message}`);
      return res.status(500).json({
        error: 'Error verificando estado de verificación',
        message: verificationResult.message
      });
    }
    
    // Verificar si el email está verificado
    if (!verificationResult.verified) {
      console.log(`🚫 [EmailVerification] Usuario ${userId} sin email verificado`);
      return res.status(403).json({
        error: 'Email no verificado',
        message: 'Debes verificar tu correo electrónico para continuar con la compra. Revisa tu bandeja de entrada.',
        verification_required: true,
        auth_verified: verificationResult.auth_verified || false,
        firestore_status: verificationResult.firestore_status || 'pendiente'
      });
    }
    
    console.log(`✅ [EmailVerification] Usuario ${userId} verificado correctamente`);
    
    // Usuario verificado, continuar con la siguiente función
    next();
    
  } catch (error) {
    console.error('❌ [EmailVerification] Error en middleware:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo verificar el estado de verificación del email'
    });
  }
}

/**
 * Middleware opcional para endpoints que requieren verificación pero no bloquean completamente
 * Agrega información de verificación al request para uso posterior
 */
async function checkEmailVerification(req, res, next) {
  try {
    const userId = req.user.uid;
    
    const verificationResult = await getVerificationStatus(userId);
    
    // Agregar información de verificación al request
    req.emailVerification = {
      verified: verificationResult.verified || false,
      status: verificationResult.status,
      message: verificationResult.message,
      auth_verified: verificationResult.auth_verified || false,
      firestore_status: verificationResult.firestore_status || 'pendiente'
    };
    
    next();
    
  } catch (error) {
    console.error('❌ [CheckEmailVerification] Error en middleware:', error);
    
    // En caso de error, asumir no verificado pero no bloquear
    req.emailVerification = {
      verified: false,
      status: 'error',
      message: 'Error verificando estado'
    };
    
    next();
  }
}

module.exports = {
  requireEmailVerification,
  checkEmailVerification
};