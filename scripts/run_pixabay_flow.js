// scripts/run_pixabay_flow.js
// Calls the pixabay-clear and pixabay handlers directly (no vercel dev needed)
import path from 'path';

async function runHandler(modulePath, req) {
  const mod = await import(modulePath);
  const handler = mod && mod.default ? mod.default : mod;
  const res = {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.body = obj; return Promise.resolve(); },
    end() { return Promise.resolve(); }
  };
  try {
    await handler(req, res);
    return res;
  } catch (e) {
    return { error: String(e) };
  }
}

async function main() {
  if (!process.env.PIXABAY_API_KEY) {
    console.error('PIXABAY_API_KEY not set in env');
    process.exit(2);
  }

  console.log('Clearing cache via handler...');
  const clearReq = { method: 'POST', body: {} };
  const clearRes = await runHandler('../api/pixabay-clear.js', clearReq);
  console.log('Clear response:', JSON.stringify(clearRes, null, 2));

  console.log('\nCalling pixabay handler for q="gatos" per_page=6');
  const req = { method: 'POST', body: { q: 'gatos', per_page: 6 } };
  const res = await runHandler('../api/pixabay.js', req);
  console.log('Pixabay response status:', res.statusCode);
  console.log('Pixabay response headers:', JSON.stringify(res.headers, null, 2));
  console.log('Pixabay response body (truncated):');
  if (res.body && typeof res.body === 'object') {
    const out = { total: res.body.total, totalHits: res.body.totalHits, hitsSample: (res.body.hits || []).slice(0,3).map(h=>({id:h.id,previewURL:h.previewURL,webformatURL:h.webformatURL})) };
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(res.body);
  }
}

main();
