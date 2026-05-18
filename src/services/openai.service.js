const openaiSdk = require('openai');
const { env } = require('../config/env');
const { CHART_ANALYSIS_SYSTEM_PROMPT } = require('../prompts/chartAnalysis.prompt');

let client;
const OpenAI = openaiSdk.OpenAI || openaiSdk.default || openaiSdk;

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
    response = await createAnalysisResponse(openai, facts);
  } catch (err) {
    const wrapped = new Error('AI provider request failed');
    wrapped.code = 'AI_ANALYSIS_FAILED';
    wrapped.status = 502;
    wrapped.cause = err;
    throw wrapped;
  }

  const text = extractAnalysisText(response);
  return text;
}

async function createAnalysisResponse(openai, facts) {
  if (openai.responses && typeof openai.responses.create === 'function') {
    return openai.responses.create({
      model: env.openaiModel,
      input: [
        { role: 'system', content: CHART_ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(facts) },
      ],
      max_output_tokens: env.maxOutputTokens,
    });
  }

  return openai.chat.completions.create({
    model: env.openaiModel,
    messages: [
      { role: 'system', content: CHART_ANALYSIS_SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify(facts) },
    ],
    max_completion_tokens: env.maxOutputTokens,
  });
}

function extractAnalysisText(response) {
  if (typeof response.output_text === 'string' && response.output_text.trim()) {
    return response.output_text.trim();
  }

  if (response.output && Array.isArray(response.output)) {
    for (const item of response.output) {
      if (item.type === 'message' && Array.isArray(item.content)) {
        for (const block of item.content) {
          if (block.type === 'output_text' || block.type === 'text') {
            return block.text.trim();
          }
        }
      }
    }
  }

  const chatText = response.choices?.[0]?.message?.content;
  if (typeof chatText === 'string' && chatText.trim()) {
    return chatText.trim();
  }

  const err = new Error('AI provider returned an empty response');
  err.code = 'AI_EMPTY_RESPONSE';
  err.status = 502;
  throw err;
}

module.exports = { generateChartAnalysis };
