const { query } = require('../config/db');

exports.getComments = async (req, res, next) => {
  try {
    const isStaff = ['admin','technician'].includes(req.user.role);
    const { rows } = await query(
      `SELECT cm.*,u.name AS author_name,u.role AS author_role
       FROM comments cm LEFT JOIN users u ON u.id=cm.author_id
       WHERE cm.ticket_id=$1 ${isStaff?'':'AND cm.is_internal=false'}
       ORDER BY cm.created_at ASC`, [req.params.id]
    );
    res.json(rows);
  } catch(e){ next(e); }
};

exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, is_internal=false } = req.body;
    if (!(await query('SELECT id FROM tickets WHERE id=$1',[id])).rows.length)
      return res.status(404).json({ error: 'Ticket not found' });
    const isStaff = ['admin','technician'].includes(req.user.role);
    const { rows } = await query(
      'INSERT INTO comments(ticket_id,author_id,body,is_internal) VALUES($1,$2,$3,$4) RETURNING *',
      [id, req.user.id, body, isStaff ? is_internal : false]
    );
    res.status(201).json({ ...rows[0], author_name: req.user.name, author_role: req.user.role });
  } catch(e){ next(e); }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM comments WHERE id=$1',[req.params.commentId]);
    if (!rows.length) return res.status(404).json({ error: 'Comment not found' });
    if (req.user.role!=='admin' && rows[0].author_id!==req.user.id)
      return res.status(403).json({ error: 'Access denied' });
    await query('DELETE FROM comments WHERE id=$1',[req.params.commentId]);
    res.json({ message: 'Comment deleted' });
  } catch(e){ next(e); }
};
