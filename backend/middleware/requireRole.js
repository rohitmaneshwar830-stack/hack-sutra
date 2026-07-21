/**
 * Factory middleware that restricts access based on user role.
 * Usage: requireRole('admin') or requireRole('citizen', 'admin')
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

module.exports = requireRole;
