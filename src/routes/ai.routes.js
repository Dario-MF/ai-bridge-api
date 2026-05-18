const { Router } = require('express');
const { validateAiPayload } = require('../middleware/validateAiPayload.middleware');
const { chartAnalysis } = require('../controllers/ai.controller');

const router = Router();

router.post('/chart-analysis', validateAiPayload, chartAnalysis);

module.exports = router;
