// scripts/test_pixabay.js
// Test harness to invoke the serverless handler in api/pixabay.js locally
// Reads PIXABAY_API_KEY from process.env and POSTs a sample query.

import path from 'path';
const modPath = path.resolve('api/pixabay.js');

async function run() {
  if (!process.env.PIXABAY_API_KEY) {
    console.error('ERROR: PIXABAY_API_KEY not set in environment');
    process.exit(2);
  }

  const handlerModule = await import(`../api/pixabay.js`);
  const handler = handlerModule && handlerModule.default ? handlerModule.default : handlerModule;

  const req = {
    method: 'POST',
    body: { q: process.env.TEST_Q || 'gatos', per_page: process.env.TEST_PER ? Number(process.env.TEST_PER) : 6 }
  };

  const res = {
    headers: {},
    statusCode: 200,
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(obj) { console.log('=== RESPONSE JSON START ==='); console.log(JSON.stringify(obj, null, 2)); console.log('=== RESPONSE JSON END ==='); return Promise.resolve(); },
    end() { return Promise.resolve(); }
  };

  try {
    await handler(req, res);
    console.log('Test complete. Response headers:', res.headers, 'status:', res.statusCode);
  } catch (err) {
    console.error('Handler threw error:', err);
    process.exit(1);
  }
}

run();
