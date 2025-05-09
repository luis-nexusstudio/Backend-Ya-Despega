/*
    -- Author:	Luis Melendez
    -- Create date: 08/05/2024
    -- Update date: 
    -- Description:	Define las reglas de validación para la creación de preferencias de pago y el middleware de validación de entradas
    -- Update:      
                    
*/

const { body, validationResult } = require('express-validator');

const createPreferenceRules = [
  body('items').isArray({ min: 1 }),
  body('items.*.name').isString().trim().escape(),
  body('items.*.qty').isInt({ min: 1 }),
  body('items.*.price').isFloat({ gt: 0 }),
  body('payerEmail').isEmail().normalizeEmail(),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

module.exports = {
  createPreferenceRules,
  validate,
};
