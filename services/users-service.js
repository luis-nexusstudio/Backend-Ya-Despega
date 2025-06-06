/*
    -- Author:	Pedro Martinez
    -- Create date: 16/05/2025
    -- Update date: 
    -- Description:	Servicio para manejar operaciones con usuarios en Firestore
    -- Update:      
                    
*/

const admin = require('../config/firebase');
const db = admin.firestore();

/**
 * Obtiene un usuario por su ID
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object|null>} - Datos del usuario o null si no existe
 */
async function getUserById(userId) {
  const doc = await db.collection('usuarios').doc(userId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

/**
 * Obtiene todos los usuarios
 * @param {number} limit - Límite de usuarios a obtener (opcional)
 * @returns {Promise<Array>} - Array de usuarios
 */
async function getAllUsers(limit = 100) {
  const snapshot = await db.collection('usuarios').limit(limit).get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Busca usuarios por campo específico
 * @param {string} field - Campo por el cual filtrar
 * @param {any} value - Valor a buscar
 * @returns {Promise<Array>} - Array de usuarios que coinciden
 */
async function getUsersByField(field, value) {
  const snapshot = await db.collection('usuarios').where(field, '==', value).get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Busca un usuario por su email
 * @param {string} email - Email del usuario
 * @returns {Promise<Object|null>} - Usuario encontrado o null si no existe
 */
async function getUserByEmail(email) {
  if (!email) return null;
  
  const snapshot = await db.collection('usuarios').where('email', '==', email).limit(1).get();
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

/**
 * Actualiza un usuario por su ID
 * @param {string} userId - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<Object>} - Respuesta con status e info actualizada
 */
async function updateUserById(userId, userData) {
  // Verificar que el usuario existe
  const userRef = db.collection('usuarios').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    return { 
      status: 'error',
      message: 'Usuario no encontrado'
    };
  }
  
  // Filtrar campos que no se pueden actualizar directamente
  const { id, created_at, ...updateData } = userData;
  
  // Añadir timestamp de actualización
  updateData.updated_at = admin.firestore.FieldValue.serverTimestamp();
  
  // Actualizar el documento
  await userRef.update(updateData);
  
  // Obtener usuario actualizado
  const updatedDoc = await userRef.get();
  
  return {
    status: 'success',
    user: {
      id: updatedDoc.id,
      ...updatedDoc.data()
    }
  };
}

/**
 * Registrar un usuario con verificación de email
 * @param {Object} userData - Datos a registrar
 * @returns {Promise<Object>} - Respuesta con status e info actualizada
 */
async function addUser(userData) {
  try {
    const { email, password, nombres, apellido_paterno, apellido_materno, numero_celular } = userData;

    // 1. CREAR USUARIO EN FIREBASE AUTH
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        emailVerified: false
      });
      console.log('✅ Usuario creado en Auth:', userRecord.uid);
    } catch (authError) {
      console.error('❌ Error en Firebase Auth:', authError);
      
      // Manejar errores específicos de Auth
      if (authError.code === 'auth/email-already-exists') {
        return {
          status: 'error',
          message: 'El correo ya está registrado'
        };
      }
      
      return {
        status: 'error',
        message: 'Error al crear usuario en autenticación'
      };
    }

    // 2. CREAR DOCUMENTO EN FIRESTORE
    try {
      const userDocData = {
        nombres: nombres,
        apellido_paterno: apellido_paterno,
        apellido_materno: apellido_materno,
        numero_celular: numero_celular,
        email: email,
        rol_id: "1",
        fecha_registro: admin.firestore.FieldValue.serverTimestamp(),
        estatus_verificacion: "pendiente",
        fecha_verificacion: null,
        ultimo_envio_verificacion: admin.firestore.FieldValue.serverTimestamp()
      };

      const userRef = db.collection('usuarios').doc(userRecord.uid);
      await userRef.set(userDocData);
      
      console.log('✅ Usuario guardado en Firestore:', userRecord.uid);

      // Obtener documento creado
      const savedDoc = await userRef.get();

      return {
        status: 'success',
        message: 'Usuario registrado exitosamente. Te hemos enviado un correo de verificación.',
        user: {
          id: savedDoc.id,
          ...savedDoc.data()
        }
      };

    } catch (firestoreError) {
       console.error('❌ Error en Firestore:', firestoreError);
      
      // ROLLBACK: Si falla Firestore, eliminar usuario de Auth
      try {
        await admin.auth().deleteUser(userRecord.uid);
        console.log('🔄 Rollback: Usuario eliminado de Auth');
      } catch (deleteError) {
        console.error('❌ Error en rollback:', deleteError);
      }

      return {
        status: 'error',
        message: 'Error al guardar datos del usuario'
      };
    }

  } catch (error) {
    console.error('❌ Error general en registro:', error);
    return {
      status: 'error',
      message: 'Error interno del servidor'
    };
  }
}

/**
 * Verificar el estado de verificación de email de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Estado de verificación
 */
async function getVerificationStatus(userId) {
  try {
    // 1. Obtener estado actual de Firebase Auth
    const userRecord = await admin.auth().getUser(userId);
    
    // 2. Obtener estado en Firestore
    const userDoc = await db.collection('usuarios').doc(userId).get();
    
    if (!userDoc.exists) {
      return {
        status: 'error',
        message: 'Usuario no encontrado en base de datos'
      };
    }

    const userData = userDoc.data();
    const authEmailVerified = userRecord.emailVerified;
    const firestoreStatus = userData.estatus_verificacion;

    // 3. Sincronizar estados si es necesario
    if (authEmailVerified && firestoreStatus === 'pendiente') {
      // El usuario verificó en Firebase Auth pero no está actualizado en Firestore
      await db.collection('usuarios').doc(userId).update({
        estatus_verificacion: 'success',
        fecha_verificacion: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Estado de verificación sincronizado para usuario ${userId}`);
      
      return {
        status: 'success',
        verified: true,
        auth_verified: true,
        firestore_status: 'success',
        message: 'Email verificado correctamente',
        can_purchase: true
      };
    }

    return {
      status: 'success',
      verified: authEmailVerified && firestoreStatus === 'success',
      auth_verified: authEmailVerified,
      firestore_status: firestoreStatus,
      message: authEmailVerified ? 'Email verificado' : 'Email pendiente de verificación'
    };

  } catch (error) {
    console.error('❌ Error verificando estado:', error);
    return {
      status: 'error',
      message: 'Error al verificar estado de email'
    };
  }
}


module.exports = {
  getUserById,
  getAllUsers,
  getUsersByField,
  getUserByEmail,
  updateUserById,
  addUser,
  getVerificationStatus
};