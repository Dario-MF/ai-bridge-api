const express = require('express');
const cors = require('cors');
const { env } = require('./config/env');
const { whitelist } = require('./middleware/whitelist.middleware');
const { aiRateLimit } = require('./middleware/rateLimit.middleware');
const { errorHandler } = require('./middleware/error.middleware');
const healthRoutes = require('./routes/health.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

// Body parsing
app.use(express.json());

// CORS
const corsOrigin = env.nodeEnv === 'production'
  ? env.allowedOrigins
  : '*';
app.use(cors({ origin: corsOrigin }));

// Routes
app.use('/health', healthRoutes);
app.use('/api/ai', whitelist, aiRateLimit, aiRoutes);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
