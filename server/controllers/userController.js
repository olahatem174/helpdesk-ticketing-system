const { query } = require('../config/db');

exports.getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const params = role ? [role] : [];
    const where  = role ? 'WHERE role=$1' : '';
    const { rows } = await query(`SELECT id,name,email,role,is_active,created_at FROM users ${where} ORDER BY created_at DESC`, params);
    res.json(rows);
  } catch(e){ next(e); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { role, is_active, name } = req.body;
    const { rows } = await query(
      'UPDATE users SET role=COALESCE($1,role),is_active=COALESCE($2,is_active),name=COALESCE($3,name) WHERE id=$4 RETURNING id,name,email,role,is_active',
      [role, is_active, name, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch(e){ next(e); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id===req.user.id) return res.status(400).json({ error: 'Cannot deactivate own account' });
    const { rows } = await query('UPDATE users SET is_active=false WHERE id=$1 RETURNING id',[req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deactivated' });
  } catch(e){ next(e); }
};
