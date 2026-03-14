const jwt = require('jsonwebtoken');
const { PERMISSIONS } = require('../config/constants');

const protect = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET || 'carcart_secret'); next(); }
  catch { res.status(401).json({ error: 'Token invalid or expired' }); }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: `Access denied. Required: ${roles.join(', ')}` });
  next();
};

const hasPerm = (perm) => (req, res, next) => {
  const p = PERMISSIONS[req.user.role];
  if (!p || !p[perm]) return res.status(403).json({ error: `Permission denied: ${perm}` });
  next();
};

module.exports = { protect, restrictTo, hasPerm };
