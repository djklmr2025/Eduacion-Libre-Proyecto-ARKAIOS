// api/pixabay.js
// Endpoint serverless para buscar imágenes en Pixabay sin exponer la API key en el navegador

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { q, per_page = 10 } = body || {};

  if (!q) {
    return res.status(400).json({ error: 'Missing q' });
  }

  const key = process.env.PIXABAY_API_KEY;

  if (!key) {
    return res.status(500).json({ error: 'PIXABAY_API_KEY no configurada' });
  }

  const url =
    'https://pixabay.com/api/?' +
    new URLSearchParams({
      key,
      q,
      image_type: 'photo',
      safesearch: 'true',
      per_page: String(Math.min(Math.max(per_page, 3), 50))
    }).toString();

  try {
    const r = await fetch(url);
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: text || 'Pixabay error' });
    }

    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + (err.message || err) });
  }
}
