require('dotenv').config({ path: '../env' });
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const { testConnection } = require('./config/db');
const errorHandler       = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/tickets',    require('./routes/tickets'));
app.use('/api/tickets',    require('./routes/comments'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/categories', require('./routes/categories'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── Error handler (must be last) ──────────────────────────────
app.use(errorHandler);

// ── Boot ──────────────────────────────────────────────────────
(async () => {
  await testConnection();
  app.listen(PORT, () => console.log(`\n🚀 API → http://localhost:${PORT}\n`));
})();
