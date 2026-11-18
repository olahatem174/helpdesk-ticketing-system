const errorHandler = (err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error' });
};
module.exports = errorHandler;
