/*
    -- Author:	Pedro Martinez
    -- Create date: 16/05/2025
    -- Update date: 
    -- Description:	Define las reglas de validación para las rutas de usuarios
    -- Update:      
                    
*/

const { query, param, body, validationResult } = require('express-validator');

const getUserByEmailRules = [
  query('email').isEmail().withMessage('Debe proporcionar un email válido'),
];

const getUserByIdRules = [
  param('userId').notEmpty().withMessage('El ID de usuario es requerido'),
];

const getAllUsersRules = [
  query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('El límite debe ser un número entre 1 y 500'),
];

const searchUsersRules = [
  query('field').notEmpty().withMessage('El campo field es requerido'),
  query('value').notEmpty().withMessage('El campo value es requerido'),
];

const updateUserRules = [
  param('userId').notEmpty().withMessage('El ID de usuario es requerido'),
  body().notEmpty().withMessage('Se requieren datos para actualizar'),
  body('email').optional().isEmail().withMessage('Formato de correo electrónico inválido'),
  body('nombre').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('telefono').optional().isString().trim().matches(/^[0-9+\s()-]{8,20}$/).withMessage('Formato de teléfono inválido'),
  body('rol').optional().isIn(['admin', 'cliente', 'staff']).withMessage('Rol no válido'),
  
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

module.exports = {
  getUserByEmailRules,
  getUserByIdRules,
  getAllUsersRules,
  searchUsersRules,
  updateUserRules,
  validate,
};