const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { query } = require('../config/db');

const sign = (user) => jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if ((await query('SELECT id FROM users WHERE email=$1', [email])).rows.length)
      return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      "INSERT INTO users (name,email,password_hash,role) VALUES($1,$2,$3,'user') RETURNING id,name,email,role",
      [name, email, hash]
    );
    res.status(201).json({ token: sign(rows[0]), user: rows[0] });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await query('SELECT * FROM users WHERE email=$1', [email]);
    const user = rows[0];
    if (!user || !user.is_active || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Invalid credentials' });
    const { password_hash, ...safe } = user;
    res.json({ token: sign(user), user: safe });
  } catch (e) { next(e); }
};

exports.getMe = async (req, res, next) => {
  try {
    const { rows } = await query('SELECT id,name,email,role,created_at FROM users WHERE id=$1', [req.user.id]);
    res.json(rows[0]);
  } catch (e) { next(e); }
};
