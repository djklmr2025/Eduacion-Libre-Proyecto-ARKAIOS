import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import arkaiosHandler from './api/arkaios.js';
import arkaiosImageHandler from './api/arkaios-image.js';
import batchImagesHandler from './api/batch-images.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// API Routes
app.all('/api/arkaios', (req, res) => {
    arkaiosHandler(req, res);
});

app.all('/api/arkaios-image', (req, res) => {
    arkaiosImageHandler(req, res);
});

app.all('/api/batch-images', (req, res) => {
    batchImagesHandler(req, res);
});

app.listen(port, () => {
    console.log(`Servidor local corriendo en http://localhost:${port}`);
    console.log(`Abre esta URL en tu navegador para probar la aplicación.`);
});
