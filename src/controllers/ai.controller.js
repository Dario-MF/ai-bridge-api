const { generateChartAnalysis } = require('../services/openai.service');

async function chartAnalysis(req, res, next) {
  try {
    const { facts } = req.body;
    const analysis = await generateChartAnalysis({ facts });
    res.json({ ok: true, analysis });
  } catch (err) {
    next(err);
  }
}

module.exports = { chartAnalysis };
