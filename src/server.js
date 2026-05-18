const { env, validateEnv } = require('./config/env');
const app = require('./app');

validateEnv();


app.listen(env.port, () => {
  console.log(`[ai-bridge-api] Server running on port ${env.port} (${env.nodeEnv})`);
});
