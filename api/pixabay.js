// api/pixabay.js
// Endpoint serverless para buscar imágenes en Pixabay sin exponer la API key en el navegador
// - Añade cache simple (24h) por query para respetar la política de Pixabay
// - Propaga headers de rate-limit (si Pixabay los devuelve)

import { getCached, setCached } from '../lib/pixabayCache.js';

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

  const per = String(Math.min(Math.max(per_page, 3), 50));
  const cacheKey = `${q}::${per}`;

  const cached = await getCached(cacheKey);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return res.status(200).json(cached);
  }

  const url =
    'https://pixabay.com/api/?' +
    new URLSearchParams({
      key,
      q,
      image_type: 'photo',
      safesearch: 'true',
      per_page: per
    }).toString();

  try {
    const r = await fetch(url);

    // Propagar headers de rate limit si vienen
    const rlLimit = r.headers.get('X-RateLimit-Limit');
    const rlRemaining = r.headers.get('X-RateLimit-Remaining');
    const rlReset = r.headers.get('X-RateLimit-Reset');
    if (rlLimit) res.setHeader('X-RateLimit-Limit', rlLimit);
    if (rlRemaining) res.setHeader('X-RateLimit-Remaining', rlRemaining);
    if (rlReset) res.setHeader('X-RateLimit-Reset', rlReset);

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: text || 'Pixabay error' });
    }

    const data = await r.json();

    // Cachear la respuesta (estructura completa de Pixabay)
    try {
      await setCached(cacheKey, data);
    } catch (e) {
      // ignore
    }

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + (err.message || err) });
  }
}
