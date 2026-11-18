const { query } = require('../config/db');

exports.getDashboard = async (req, res, next) => {
  try {
    const { role, id: uid } = req.user;

    const cond  = role==='admin' ? '' : role==='technician' ? 'WHERE assigned_to=$1' : 'WHERE created_by=$1';
    const params = role==='admin' ? [] : [uid];

    const statusRows = (await query(`SELECT status,COUNT(*) AS c FROM tickets ${cond} GROUP BY status`, params)).rows;
    const stats = { open:0, in_progress:0, resolved:0, closed:0, total:0 };
    statusRows.forEach(r => { stats[r.status]=parseInt(r.c); stats.total+=parseInt(r.c); });

    let byPriority = null;
    if (role!=='user') {
      const pr = (await query(`SELECT priority,COUNT(*) AS c FROM tickets ${cond} GROUP BY priority`, params)).rows;
      byPriority = {};
      pr.forEach(r => byPriority[r.priority]=parseInt(r.c));
    }

    const byCategory = (await query(
      `SELECT c.name,COUNT(t.id) AS c FROM categories c LEFT JOIN tickets t ON t.category_id=c.id GROUP BY c.name ORDER BY c DESC`
    )).rows;

    const recentTickets = (await query(
      `SELECT t.id,t.title,t.status,t.priority,t.created_at,u.name AS created_by_name
       FROM tickets t LEFT JOIN users u ON u.id=t.created_by
       ${cond} ORDER BY t.created_at DESC LIMIT 5`, params
    )).rows;

    res.json({ stats, byPriority, byCategory, recentTickets });
  } catch(e){ next(e); }
};
