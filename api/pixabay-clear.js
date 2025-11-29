// api/pixabay-clear.js
// Endpoint to clear pixabay cache (memory or upstash). POST { q, per_page } to clear specific key, or empty body to clear all.
import { clearCache } from '../lib/pixabayCache.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const { q, per_page } = body || {};
  try {
    const result = await clearCache({ q, per: per_page ? String(per_page) : undefined });
    return res.status(200).json({ ok: true, result });
  } catch (e) {
    return res.status(500).json({ ok: false, error: (e && e.message) || String(e) });
  }
}
