import { fileURLToPath } from 'url';

const PEXELS_API_KEY = "4vj6qTzLM9oc0gN7bdgr3vCO7jRDIBe0zJgknfq9geibx9hdQ16TVxpz";
const PIXABAY_API_KEY = "53456758-e7788c27d5c820739d362581f";

async function searchPexels(query) {
    try {
        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
            headers: { Authorization: PEXELS_API_KEY }
        });
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
            return data.photos[0].src.large;
        }
    } catch (e) {
        console.error(`Error Pexels for ${query}:`, e);
    }
    return null;
}

async function searchPixabay(query) {
    try {
        const response = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3`);
        const data = await response.json();
        if (data.hits && data.hits.length > 0) {
            return data.hits[0].largeImageURL;
        }
    } catch (e) {
        console.error(`Error Pixabay for ${query}:`, e);
    }
    return null;
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { category, items } = req.body;

    if (!category || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Invalid request body. Expected { category: string, items: string[] }' });
    }

    try {
        const results = [];

        for (const item of items) {
            let imgUrl = await searchPexels(item);
            if (!imgUrl) {
                imgUrl = await searchPixabay(item);
            }

            if (imgUrl) {
                results.push({ item, status: 'found', url: imgUrl });
            } else {
                results.push({ item, status: 'not_found' });
            }
        }

        res.status(200).json({ message: 'Batch processing complete', results });

    } catch (error) {
        console.error('Batch processing error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
