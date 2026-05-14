const dotenv = require('dotenv');
dotenv.config();

function parseList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

function parseNum(value, fallback) {
  const n = Number(value);
  if (value !== undefined && value !== '' && Number.isNaN(n)) {
    throw new Error(`Invalid numeric env value: "${value}"`);
  }
  return value !== undefined && value !== '' ? n : fallback;
}

const env = {
  port: parseNum(process.env.PORT, 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  openaiTimeoutMs: parseNum(process.env.OPENAI_TIMEOUT_MS, 8000),
  allowedOrigins: parseList(process.env.ALLOWED_ORIGINS),
  dailyMaxRequests: parseNum(process.env.DAILY_MAX_REQUESTS, 300),
  maxFactsPayloadSize: parseNum(process.env.MAX_FACTS_PAYLOAD_SIZE, 5000),
  maxOutputTokens: parseNum(process.env.MAX_OUTPUT_TOKENS, 180),
};

function validateEnv() {
  if (env.nodeEnv === 'production') {
    if (!env.openaiApiKey) {
      throw new Error('[env] OPENAI_API_KEY is required in production');
    }
    if (!env.allowedOrigins.length) {
      throw new Error('[env] ALLOWED_ORIGINS is required in production');
    }
  }
}

module.exports = { env, validateEnv };
