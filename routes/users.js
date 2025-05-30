/*
    -- Author:	Pedro Martinez
    -- Create date: 16/05/2025
    -- Update date: 
    -- Description:	Define las rutas para obtener información de usuarios
    -- Update:      
                    
*/

const express = require('express');
const router = express.Router();
const firebaseAuth = require('../middleware/auth');
const { 
  handleGetUserById, 
  handleGetAllUsers, 
  handleSearchUsers,
  handleGetUserByEmail,
  handleUpdateUserById
} = require('../controllers/users-controller');
const {
  getUserByEmailRules,
  getUserByIdRules,
  getAllUsersRules,
  searchUsersRules,
  updateUserRules,
  validate
} = require('../middleware/user-validators');

// Ruta para obtener un usuario por ID
router.get('/user/:userId', firebaseAuth, getUserByIdRules, validate, handleGetUserById);

// Ruta específica para buscar usuario por email
router.get('/user', firebaseAuth, getUserByEmailRules, validate, handleGetUserByEmail);

// Ruta para obtener todos los usuarios
router.get('/users', firebaseAuth, getAllUsersRules, validate, handleGetAllUsers);

// Ruta para buscar usuarios por campo específico
router.get('/users/search', firebaseAuth, searchUsersRules, validate, handleSearchUsers);

// Ruta para actualizar un usuario por ID
router.put('/user/:userId', firebaseAuth, updateUserRules, validate, handleUpdateUserById);

module.exports = router;