/*
    -- Author:	Pedro Martinez
    -- Create date: 16/05/2025
    -- Update date: 
    -- Description:	Controlador para manejar las rutas relacionadas con usuarios
    -- Update:      
                    
*/

const { 
  getUserById, 
  getAllUsers, 
  getUsersByField,
  getUserByEmail,
  updateUserById
} = require('../services/users-service');

/**
 * Maneja la solicitud para obtener un usuario por ID
 */
async function handleGetUserById(req, res) {
  try {
    const userId = req.params.userId;
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error obteniendo usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Maneja la solicitud para obtener todos los usuarios
 */
async function handleGetAllUsers(req, res) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const users = await getAllUsers(limit);
    
    res.json({ users });
  } catch (err) {
    console.error('Error obteniendo usuarios:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Maneja la solicitud para buscar usuarios por campo específico
 */
async function handleSearchUsers(req, res) {
  try {
    const { field, value } = req.query;
    
    if (!field || value === undefined) {
      return res.status(400).json({ error: 'Se requieren los parámetros field y value' });
    }
    
    const users = await getUsersByField(field, value);
    res.json({ users });
  } catch (err) {
    console.error('Error buscando usuarios:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Maneja la solicitud para buscar un usuario por email
 */
async function handleGetUserByEmail(req, res) {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Se requiere el parámetro email' });
    }
    
    const user = await getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado con ese email' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error buscando usuario por email:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Maneja la solicitud para actualizar un usuario por ID
 */
async function handleUpdateUserById(req, res) {
  try {
    const userId = req.params.userId;
    const userData = req.body;
    
    // Verificar que se enviaron datos para actualizar
    if (!userData || Object.keys(userData).length === 0) {
      return res.status(400).json({ error: 'No se enviaron datos para actualizar' });
    }
    
    // Intentar actualizar el usuario
    const result = await updateUserById(userId, userData);
    
    if (result.status === 'error') {
      return res.status(404).json({ error: result.message });
    }
    
    res.json({ 
      message: 'Usuario actualizado correctamente',
      user: result.user 
    });
  } catch (err) {
    console.error('Error actualizando usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  handleGetUserById,
  handleGetAllUsers,
  handleSearchUsers,
  handleGetUserByEmail,
  handleUpdateUserById
};