// api/pplx.js
// Función serverless de Vercel para proxy de Perplexity API
// Resuelve el problema de CORS al llamar al API desde el servidor

export default async function handler(req, res) {
  // Validar método HTTP - solo POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validar que se envíen los mensajes requeridos
  const { messages } = req.body || {};
  if (!messages) {
    return res.status(400).json({ error: 'Missing messages' });
  }

  // Obtener API key desde variable de entorno (configurada en Vercel Dashboard)
  const key = process.env.PPLX_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Missing PPLX_API_KEY environment variable' });
  }

  try {
    // Llamar al API de Perplexity desde el servidor (sin restricciones CORS)
    const r = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-32k-online',
        temperature: 0.35,
        max_tokens: 800,
        messages,
      }),
    });

    // Obtener respuesta como texto para manejar errores
    const text = await r.text();
    
    // Si la respuesta no es exitosa, retornar el error
    if (!r.ok) {
      return res.status(r.status).send(text);
    }

    // Intentar parsear el JSON
    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (parseError) {
      // Si el JSON es inválido, retornar error descriptivo
      return res.status(500).json({ 
        error: 'Invalid JSON from Perplexity', 
        raw: text 
      });
    }
  } catch (error) {
    // Manejar errores de red u otros errores inesperados
    console.error('Error calling Perplexity API:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
