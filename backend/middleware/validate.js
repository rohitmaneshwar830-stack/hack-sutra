const { validationResult } = require('express-validator');

/**
 * Middleware to format express-validator errors.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        details: errors.array().map(({ path, msg, location }) => ({ path, message: msg, location })),
      },
    });
  }
  next();
};

module.exports = validate;
