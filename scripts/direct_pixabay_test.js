// scripts/direct_pixabay_test.js
// Simple direct fetch to Pixabay to validate the API key and response structure.

async function run() {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) {
    console.error('PIXABAY_API_KEY not set');
    process.exit(2);
  }
  const q = process.env.TEST_Q || 'gatos';
  const per = process.env.TEST_PER || 6;
  const url = 'https://pixabay.com/api/?' + new URLSearchParams({ key, q, image_type: 'photo', safesearch: 'true', per_page: String(per) }).toString();
  try {
    const r = await fetch(url);
    console.log('Status:', r.status);
    const text = await r.text();
    console.log('Body:', text.substring(0, 2000));
  } catch (e) {
    console.error('Fetch error:', e);
    process.exit(1);
  }
}

run();
