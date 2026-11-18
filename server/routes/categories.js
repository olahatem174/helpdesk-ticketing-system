const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { query } = require('../config/db');
router.get('/', protect, async (_req, res, next) => {
  try { res.json((await query('SELECT * FROM categories ORDER BY name ASC')).rows); }
  catch(e){ next(e); }
});
module.exports = router;
