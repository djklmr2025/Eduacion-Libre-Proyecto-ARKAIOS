import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Simulated Vercel handlers
import googleImageSearch from './api/google-image-search.js';
import arkaiosTools from './api/arkaios-tools.js';

app.all('/api/google-image-search', async (req, res) => {
    try {
        await googleImageSearch(req, res);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.all('/api/arkaios-tools', async (req, res) => {
    try {
        await arkaiosTools(req, res);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.listen(8080, () => {
    console.log('Local DEV server running on http://127.0.0.1:8080');
});
