#!/usr/bin/env node

const http = require('http');

const payload = {
  range: {
    from: 1774445854455,
    to: 1778765854455,
  },
  facts: {
    symbol: 'BBVA.MC',
    resolution: '1D',
    candlesCount: 32,
    netChangePct: 0.62,
    primaryTrend: 'up',
    structureType: 'mixed',
    trendStrength: 'medium',
    recentLeg: 'mixed',
    dominantBehaviour: 'bullish_continuation',
    marketPhase: 'impulse',
    priceLocation: 'mid_range',
    zoneContext: 'between_levels',
    nearestZoneRole: 'support_below_price',
    nearestSupport: 18.34,
    nearestResistance: 18.985,
    mixedSignals: true,
    rsiState: 'neutral',
    macdSignal: 'neutral',
    volumeSpike: false,
    volatilityRegime: 'low',
    attention: [
      'price_near_support',
      'price_near_resistance',
      'adx_no_trend',
      'mixed_trend_context',
    ],
    confidence: 'medium',
    guardrails: {
      missingData: [],
      forbiddenClaims: [
        'do_not_recommend_buy_or_sell',
        'do_not_predict_price_targets',
      ],
    },
  },
};

const data = JSON.stringify(payload);

const req = http.request(
  'http://localhost:3000/api/ai/chart-analysis',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  },
  (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      const result = JSON.parse(body);
      console.log(`\nStatus: ${res.statusCode}`);
      console.log(`OK: ${result.ok}\n`);
      if (result.analysis) {
        console.log('--- Análisis ---\n');
        console.log(result.analysis);
        console.log('');
      } else {
        console.log('Error:', result.error);
      }
    });
  }
);

req.on('error', (err) => {
  console.error('No se pudo conectar al servidor. ¿Está corriendo en puerto 3000?');
  console.error(err.message);
});

req.write(data);
req.end();
