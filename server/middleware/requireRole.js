/**
 * Role-Based Access Control Middleware
 * Usage: router.delete('/user/:id', verifyToken, requireRole('admin'), handler)
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

module.exports = requireRole;
