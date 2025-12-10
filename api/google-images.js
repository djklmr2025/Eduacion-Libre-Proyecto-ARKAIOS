
export default async function handler(req, res) {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { query, start = 1 } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Falta el parámetro "query"' });
    }

    // Configura estas variables de entorno en Vercel
    const API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
    const CX = process.env.GOOGLE_SEARCH_CX; // Custom Search Engine ID

    if (!API_KEY || !CX) {
        return res.status(500).json({
            error: 'Configuración de API incompleta',
            message: 'Configura GOOGLE_SEARCH_API_KEY y GOOGLE_SEARCH_CX en Vercel'
        });
    }

    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(query)}&searchType=image&num=10&start=${start}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Error en Google API');
        }

        const images = (data.items || []).map(item => ({
            url: item.link,
            thumbnail: item.image.thumbnailLink,
            title: item.title,
            width: item.image.width,
            height: item.image.height,
            context: item.image.contextLink
        }));

        return res.status(200).json({
            success: true,
            images,
            totalResults: data.searchInformation?.totalResults || 0,
            query: query
        });

    } catch (error) {
        console.error('Error en búsqueda de Google:', error);
        return res.status(500).json({
            error: 'Error al buscar imágenes',
            details: error.message
        });
    }
}
