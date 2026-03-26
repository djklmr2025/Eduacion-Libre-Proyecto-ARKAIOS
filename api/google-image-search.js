export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_CSE_CX || process.env.GOOGLE_SEARCH_CX;

    if (!apiKey || !cx) {
        return res.status(500).json({
            error: 'Google Custom Search no está configurado en el servidor.',
            missing: {
                apiKey: !apiKey,
                cx: !cx
            }
        });
    }

    let body;
    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch (error) {
        return res.status(400).json({ error: 'JSON inválido.' });
    }

    const { q, per_page = 10, diagnostic = false } = body;
    const query = String(q || '').trim();

    if (!query) {
        return res.status(400).json({ error: 'El parámetro "q" es requerido.' });
    }

    try {
        if (diagnostic) {
            const webUrl = new URL('https://www.googleapis.com/customsearch/v1');
            webUrl.searchParams.set('key', apiKey);
            webUrl.searchParams.set('cx', cx);
            webUrl.searchParams.set('q', query);
            webUrl.searchParams.set('num', '1');

            const webResponse = await fetch(webUrl);
            const webData = await webResponse.json();

            if (!webResponse.ok || webData.error) {
                return res.status(webResponse.status || 500).json({
                    error: webData?.error?.message || 'Falló la búsqueda web',
                    step: 'web_search',
                    details: webData
                });
            }
        }

        const imageUrl = new URL('https://www.googleapis.com/customsearch/v1');
        imageUrl.searchParams.set('key', apiKey);
        imageUrl.searchParams.set('cx', cx);
        imageUrl.searchParams.set('q', query);
        imageUrl.searchParams.set('searchType', 'image');
        imageUrl.searchParams.set('num', String(Math.min(Math.max(Number(per_page) || 10, 1), 10)));

        const imageResponse = await fetch(imageUrl);
        const imageData = await imageResponse.json();

        if (!imageResponse.ok || imageData.error) {
            return res.status(imageResponse.status || 500).json({
                error: imageData?.error?.message || 'Falló la búsqueda de imágenes',
                step: 'image_search',
                details: imageData
            });
        }

        const items = Array.isArray(imageData.items) ? imageData.items : [];
        const results = items.map((item) => ({
            title: item.title || '',
            link: item.link || '',
            displayLink: item.displayLink || '',
            thumbnail: item.image?.thumbnailLink || item.link || '',
            contextLink: item.image?.contextLink || ''
        }));

        return res.status(200).json({
            success: true,
            query,
            count: results.length,
            totalResults: imageData.searchInformation?.totalResults || null,
            diagnostic,
            results
        });
    } catch (error) {
        console.error('Google image search error:', error);
        return res.status(500).json({
            error: 'Error interno al consultar Google Custom Search.',
            details: error.message
        });
    }
}
