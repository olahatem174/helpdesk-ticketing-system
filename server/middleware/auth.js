const jwt   = require('jsonwebtoken');
const { query } = require('../config/db');

/**
 * protect — verifies JWT, attaches req.user
 */
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const { rows } = await query('SELECT id,name,email,role,is_active FROM users WHERE id=$1', [decoded.id]);
    if (!rows.length || !rows[0].is_active) return res.status(401).json({ error: 'User not found or inactive' });
    req.user = rows[0];
    next();
  } catch (err) {
    res.status(401).json({ error: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' });
  }
};

/**
 * authorize(...roles) — role guard middleware
 */
const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Access denied' });

module.exports = { protect, authorize };
