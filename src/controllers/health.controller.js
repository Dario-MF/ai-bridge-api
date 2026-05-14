function health(req, res) {
  res.json({ ok: true, service: 'ai-bridge-api' });
}

module.exports = { health };
