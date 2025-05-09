/*
    -- Author:	Luis Melendez
    -- Create date: 08/05/2024
    -- Update date: 
    -- Description:	Middleware para validar el token de Firebase y proteger rutas con autenticación
    -- Update:      
                    
*/

const admin = require('../config/firebase');

async function firebaseAuth(req, res, next) {
  const header = req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No se ingreso el Token o no tiene el formato esperado' });
  }
  const idToken = header.split(' ')[1];
  try {
    req.user = await admin.auth().verifyIdToken(idToken);
    next();
  } catch (err) {
    console.error('Firebase verifyIdToken error:', err);
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = firebaseAuth;
