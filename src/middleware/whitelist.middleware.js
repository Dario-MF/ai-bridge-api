const { env } = require('../config/env');

function whitelist(req, res, next) {
  const origin = req.get('origin');

  // Allow requests without origin header in development/test (Postman, curl)
  if (!origin) {
    if (env.nodeEnv === 'development' || env.nodeEnv === 'test') {
      return next();
    }
    return res.status(403).json({
      ok: false,
      error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origin header is required' },
    });
  }

  const normalized = origin.replace(/\/+$/, '');

  if (!env.allowedOrigins.includes(normalized)) {
    return res.status(403).json({
      ok: false,
      error: {
        code: 'ORIGIN_NOT_ALLOWED',
        message: `Origin "${origin}" is not allowed`,
      },
    });
  }

  next();
}

module.exports = { whitelist };
