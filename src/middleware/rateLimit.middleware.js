const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

const aiRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: env.dailyMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Daily request limit exceeded. Try again tomorrow.',
    },
  },
});

module.exports = { aiRateLimit };
