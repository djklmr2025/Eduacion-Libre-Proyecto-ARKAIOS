// api/freepik.js
// Endpoint serverless para buscar imágenes en Freepik sin exponer la API key en el navegador

export default async function handler(req, res) {
  // Configuración de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejo de la solicitud OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir solicitudes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.FREEPIK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'FREEPIK_API_KEY no está configurada en el servidor.' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'Cuerpo de la solicitud inválido (JSON malformado).' });
  }

  const { q, limit = 10 } = body;

  if (!q) {
    return res.status(400).json({ error: 'El parámetro "q" (búsqueda) es requerido.' });
  }

  const apiUrl = process.env.FREEPIK_API_URL || 'https://api.freepik.com/v1/resources';
  const searchUrl = `${apiUrl}?locale=es-ES&page=1&limit=${limit}&order=latest&term=${encodeURIComponent(q)}`;

  try {
    const freepikResponse = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Freepik-API-Key': apiKey,
      },
    });

    // Propagar headers de rate limit si Freepik los envía
    const rateLimit = freepikResponse.headers.get('X-Ratelimit-Limit');
    const rateLimitRemaining = freepikResponse.headers.get('X-Ratelimit-Remaining');
    const rateLimitReset = freepikResponse.headers.get('X-Ratelimit-Reset');

    if (rateLimit) res.setHeader('X-Ratelimit-Limit', rateLimit);
    if (rateLimitRemaining) res.setHeader('X-Ratelimit-Remaining', rateLimitRemaining);
    if (rateLimitReset) res.setHeader('X-Ratelimit-Reset', rateLimitReset);

    if (!freepikResponse.ok) {
      const errorData = await freepikResponse.text();
      console.error('Error de API Freepik:', errorData);
      return res.status(freepikResponse.status).json({
        error: `Error de la API de Freepik: ${freepikResponse.statusText}`,
        details: errorData,
      });
    }

    const data = await freepikResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error interno del servidor:', error);
    return res.status(500).json({ error: 'Error interno del servidor al contactar la API de Freepik.' });
  }
}
