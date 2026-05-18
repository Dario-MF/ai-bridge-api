const OpenAI = require('openai');
const { env } = require('../config/env');
const { CHART_ANALYSIS_SYSTEM_PROMPT } = require('../prompts/chartAnalysis.prompt');

let client;

function getClient() {
  if (!env.openaiApiKey) {
    const err = new Error('OPENAI_API_KEY is not configured');
    err.code = 'OPENAI_API_KEY_NOT_CONFIGURED';
    err.status = 503;
    throw err;
  }
  if (!client) {
    client = new OpenAI({
      apiKey: env.openaiApiKey,
      timeout: env.openaiTimeoutMs,
    });
  }
  return client;
}

async function generateChartAnalysis({ facts }) {
  const openai = getClient();

  let response;
  try {
    response = await openai.responses.create({
      model: env.openaiModel,
      input: [
        { role: 'system', content: CHART_ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(facts) },
      ],
      max_output_tokens: env.maxOutputTokens,
    });
  } catch (err) {
    const wrapped = new Error('AI provider request failed');
    wrapped.code = 'AI_ANALYSIS_FAILED';
    wrapped.status = 502;
    wrapped.cause = err;
    throw wrapped;
  }

  const text = response.output_text ?? extractText(response);
  return text;
}

function extractText(response) {
  if (response.output && Array.isArray(response.output)) {
    for (const item of response.output) {
      if (item.type === 'message' && Array.isArray(item.content)) {
        for (const block of item.content) {
          if (block.type === 'output_text' || block.type === 'text') {
            return block.text;
          }
        }
      }
    }
  }
  return '';
}

module.exports = { generateChartAnalysis };
