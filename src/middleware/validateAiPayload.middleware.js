const { env } = require('../config/env');

const FORBIDDEN_KEYS = ['systemPrompt', 'userPrompt', 'messages', 'apiKey', 'OPENAI_API_KEY'];

function validateAiPayload(req, res, next) {
  const { body } = req;

  if (!body || typeof body !== 'object') {
    return reject(res, 'Request body is required');
  }

  const { facts, range } = body;

  if (!facts || typeof facts !== 'object' || Array.isArray(facts)) {
    return reject(res, '"facts" must be a non-null object');
  }

  if (range !== undefined) {
    if (typeof range !== 'object' || Array.isArray(range) || range === null) {
      return reject(res, '"range" must be an object');
    }
    if (range.from !== undefined || range.to !== undefined) {
      if (typeof range.from !== 'number' || typeof range.to !== 'number') {
        return reject(res, '"range.from" and "range.to" must be numbers');
      }
      if (range.from >= range.to) {
        return reject(res, '"range.from" must be less than "range.to"');
      }
    }
  }

  const serialized = JSON.stringify(body);

  if (serialized.length > env.maxFactsPayloadSize) {
    return reject(res, `Payload exceeds maximum allowed size (${env.maxFactsPayloadSize} chars)`);
  }

  if (containsForbiddenKeys(body)) {
    return reject(res, 'Payload contains forbidden fields');
  }

  next();
}

function containsForbiddenKeys(obj) {
  if (!obj || typeof obj !== 'object') return false;
  for (const key of Object.keys(obj)) {
    if (FORBIDDEN_KEYS.includes(key)) return true;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (containsForbiddenKeys(obj[key])) return true;
    }
  }
  return false;
}

function reject(res, message) {
  return res.status(400).json({
    ok: false,
    error: {
      code: 'INVALID_AI_PAYLOAD',
      message,
    },
  });
}

module.exports = { validateAiPayload };
