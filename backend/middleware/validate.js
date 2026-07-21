const { validationResult } = require('express-validator');

/**
 * Middleware to format express-validator errors.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return first error message
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

module.exports = validate;
