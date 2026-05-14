const { env } = require('../config/env');

function errorHandler(err, req, res, _next) {
  const code = err.code || 'AI_ANALYSIS_FAILED';
  const status = err.status || 500;

  // Never expose internal error details in production
  const message = env.nodeEnv === 'production' && status >= 500
    ? 'Internal server error'
    : err.message || 'Internal server error';

  const response = {
    ok: false,
    error: {
      code,
      message,
    },
  };

  if (env.nodeEnv === 'development') {
    response.error.details = err.stack;
  }

  res.status(status).json(response);
}

module.exports = { errorHandler };
