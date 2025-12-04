export default async function handler(req, res) {
    // CORS headers
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

    const { apiKey, prompt, count = 1 } = body || {};

    if (!apiKey) {
        return res.status(400).json({ error: 'Missing apiKey' });
    }
    if (!prompt) {
        return res.status(400).json({ error: 'Missing prompt' });
    }

    try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: 'You are an advanced AI capable of generating images. When asked to generate an image, provide the direct URL to the generated image in your response. If you cannot generate an image directly, explain why.'
                    },
                    {
                        role: 'user',
                        content: `Generate ${count} image(s) of: ${prompt}. Return only the image URLs.`
                    }
                ],
                model: 'grok-beta',
                stream: false,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            return res.status(response.status).json({ error: errData.error?.message || response.statusText });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (err) {
        console.error('Grok API Error:', err);
        return res.status(500).json({ error: 'Server error: ' + err.message });
    }
}
