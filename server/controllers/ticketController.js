const { query }  = require('../config/db');
const email      = require('../services/emailService');

exports.getTickets = async (req, res, next) => {
  try {
    const { status, priority, category, search, page=1, limit=20 } = req.query;
    const conds = [], params = [];
    let i = 1;

    if (req.user.role === 'user') { conds.push(`t.created_by=$${i++}`); params.push(req.user.id); }
    if (status)   { conds.push(`t.status=$${i++}`);      params.push(status); }
    if (priority) { conds.push(`t.priority=$${i++}`);    params.push(priority); }
    if (category) { conds.push(`t.category_id=$${i++}`); params.push(parseInt(category)); }
    if (search)   { conds.push(`(t.title ILIKE $${i} OR t.description ILIKE $${i})`); params.push(`%${search}%`); i++; }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const total = parseInt((await query(`SELECT COUNT(*) FROM tickets t ${where}`, params)).rows[0].count);

    const { rows } = await query(
      `SELECT t.id,t.title,t.status,t.priority,t.created_at,t.updated_at,
              c.name AS category, u.name AS created_by_name, a.name AS assigned_to_name
       FROM tickets t
       LEFT JOIN categories c ON c.id=t.category_id
       LEFT JOIN users u ON u.id=t.created_by
       LEFT JOIN users a ON a.id=t.assigned_to
       ${where} ORDER BY t.created_at DESC LIMIT $${i} OFFSET $${i+1}`,
      [...params, parseInt(limit), (parseInt(page)-1)*parseInt(limit)]
    );
    res.json({ tickets: rows, pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total/limit) } });
  } catch(e){ next(e); }
};

exports.createTicket = async (req, res, next) => {
  try {
    const { title, description, priority='medium', category_id } = req.body;
    const { rows } = await query(
      'INSERT INTO tickets(title,description,priority,category_id,created_by) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [title, description, priority, category_id||null, req.user.id]
    );
    const t = rows[0];
    await query('INSERT INTO status_logs(ticket_id,changed_by,new_status,note) VALUES($1,$2,$3,$4)',
      [t.id, req.user.id, 'open', 'Ticket created']);
    await email.notifyTicketCreated(t, req.user);
    res.status(201).json(t);
  } catch(e){ next(e); }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT t.*,c.name AS category,
              u.name AS created_by_name, u.email AS created_by_email,
              a.name AS assigned_to_name,a.email AS assigned_to_email
       FROM tickets t
       LEFT JOIN categories c ON c.id=t.category_id
       LEFT JOIN users u ON u.id=t.created_by
       LEFT JOIN users a ON a.id=t.assigned_to
       WHERE t.id=$1`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Ticket not found' });
    const t = rows[0];
    if (req.user.role==='user' && t.created_by!==req.user.id)
      return res.status(403).json({ error: 'Access denied' });

    const isStaff = ['admin','technician'].includes(req.user.role);
    const comments = (await query(
      `SELECT cm.*,u.name AS author_name,u.role AS author_role
       FROM comments cm LEFT JOIN users u ON u.id=cm.author_id
       WHERE cm.ticket_id=$1 ${isStaff?'':'AND cm.is_internal=false'}
       ORDER BY cm.created_at ASC`, [req.params.id]
    )).rows;
    const statusHistory = (await query(
      `SELECT sl.*,u.name AS changed_by_name FROM status_logs sl
       LEFT JOIN users u ON u.id=sl.changed_by
       WHERE sl.ticket_id=$1 ORDER BY sl.created_at ASC`, [req.params.id]
    )).rows;

    res.json({ ticket: t, comments, statusHistory });
  } catch(e){ next(e); }
};

exports.updateTicket = async (req, res, next) => {
  try {
    const existing = (await query('SELECT * FROM tickets WHERE id=$1', [req.params.id])).rows[0];
    if (!existing) return res.status(404).json({ error: 'Ticket not found' });
    if (req.user.role==='user' && existing.created_by!==req.user.id)
      return res.status(403).json({ error: 'Access denied' });
    const { title, description, priority, category_id } = req.body;
    const { rows } = await query(
      'UPDATE tickets SET title=COALESCE($1,title),description=COALESCE($2,description),priority=COALESCE($3,priority),category_id=COALESCE($4,category_id) WHERE id=$5 RETURNING *',
      [title, description, priority, category_id, req.params.id]
    );
    res.json(rows[0]);
  } catch(e){ next(e); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const existing = (await query('SELECT * FROM tickets WHERE id=$1', [id])).rows[0];
    if (!existing) return res.status(404).json({ error: 'Ticket not found' });
    const extra = status==='resolved' ? ',resolved_at=NOW()' : status==='closed' ? ',closed_at=NOW()' : '';
    const { rows } = await query(`UPDATE tickets SET status=$1${extra} WHERE id=$2 RETURNING *`, [status, id]);
    await query('INSERT INTO status_logs(ticket_id,changed_by,old_status,new_status,note) VALUES($1,$2,$3,$4,$5)',
      [id, req.user.id, existing.status, status, note||null]);
    const creator = (await query('SELECT name,email FROM users WHERE id=$1', [existing.created_by])).rows[0];
    if (creator) await email.notifyStatusChanged(rows[0], creator, existing.status);
    res.json(rows[0]);
  } catch(e){ next(e); }
};

exports.assignTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { technician_id } = req.body;
    const tech = (await query("SELECT id,name,email FROM users WHERE id=$1 AND role='technician'", [technician_id])).rows[0];
    if (!tech) return res.status(400).json({ error: 'Technician not found' });
    const { rows } = await query('UPDATE tickets SET assigned_to=$1 WHERE id=$2 RETURNING *', [technician_id, id]);
    if (!rows.length) return res.status(404).json({ error: 'Ticket not found' });
    await email.notifyTicketAssigned(rows[0], tech);
    res.json(rows[0]);
  } catch(e){ next(e); }
};

exports.deleteTicket = async (req, res, next) => {
  try {
    const { rows } = await query('DELETE FROM tickets WHERE id=$1 RETURNING id', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ message: 'Ticket deleted' });
  } catch(e){ next(e); }
};
