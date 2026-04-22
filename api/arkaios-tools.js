// api/arkaios-tools.js
// Herramientas avanzadas para que ARKAIOS inspeccione y describa plantillas reales del proyecto.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const MODULES_FILE = path.join(PROJECT_ROOT, 'modules.json');
const HIDDEN_HTML = new Set(['index.html', 'CODIGO_PARA_INDEX.html']);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { tool, params } = req.body || {};

    if (!tool) {
        return res.status(400).json({ error: 'Missing tool parameter' });
    }

    try {
        switch (tool) {
            case 'list_templates':
                return await listTemplates(req, res);

            case 'get_template':
                return await getTemplate(req, res, params);

            case 'edit_template':
                return await editTemplate(req, res, params);

            case 'create_template':
                return await createTemplate(req, res, params);

            case 'analyze_pdf':
                return await analyzePDF(req, res, params);

            case 'optimize_template':
                return await optimizeTemplate(req, res, params);

            default:
                return res.status(400).json({
                    error: 'Unknown tool',
                    available_tools: [
                        'list_templates',
                        'get_template',
                        'edit_template',
                        'create_template',
                        'analyze_pdf',
                        'optimize_template'
                    ]
                });
        }
    } catch (error) {
        console.error(`Error executing tool ${tool}:`, error);
        return res.status(500).json({
            error: 'Tool execution failed',
            message: error.message
        });
    }
}

async function listTemplates(req, res) {
    const templates = await buildTemplateCatalog();

    return res.status(200).json({
        success: true,
        templates,
        count: templates.length
    });
}

async function getTemplate(req, res, params) {
    const { template_id, file } = params || {};
    const templates = await buildTemplateCatalog();

    const template = templates.find((item) => {
        return item.id === template_id || item.file === file;
    });

    if (!template) {
        return res.status(404).json({
            error: 'Template not found',
            requested: { template_id, file }
        });
    }

    return res.status(200).json({
        success: true,
        template
    });
}

async function editTemplate(req, res, params) {
    const { template_id, changes, section } = params || {};

    if (!template_id || !changes) {
        return res.status(400).json({
            error: 'Missing required parameters',
            required: ['template_id', 'changes']
        });
    }

    return res.status(200).json({
        success: true,
        template_id,
        section,
        message: 'Template edited successfully (placeholder)',
        modified_code: changes,
        hint: 'El usuario puede copiar este codigo y aplicarlo manualmente',
        next_steps: [
            '1. Copiar el codigo generado',
            '2. Abrir la plantilla en un editor',
            '3. Reemplazar la seccion indicada',
            '4. Guardar y recargar'
        ]
    });
}

async function createTemplate(req, res, params) {
    const { name, description, type, specifications } = params || {};

    if (!name || !type) {
        return res.status(400).json({
            error: 'Missing required parameters',
            required: ['name', 'type']
        });
    }

    const templateCode = generateTemplateCode(type, specifications);

    return res.status(200).json({
        success: true,
        template: {
            name,
            description,
            type,
            code: templateCode
        },
        message: 'New template created successfully',
        instructions: [
            '1. Copiar el codigo HTML generado',
            '2. Crear un nuevo archivo .html en el proyecto',
            '3. Pegar el codigo',
            '4. Agregar el boton correspondiente en modules.json'
        ]
    });
}

async function analyzePDF(req, res, params) {
    const { pdf_url, pdf_base64 } = params || {};

    if (!pdf_url && !pdf_base64) {
        return res.status(400).json({
            error: 'Missing PDF source',
            required: 'Either pdf_url or pdf_base64'
        });
    }

    return res.status(200).json({
        success: true,
        message: 'PDF analysis in progress (placeholder)',
        analysis: {
            pages: 1,
            detected_structure: 'educational_document',
            suggested_template: 'plantilla_escolar_carta_mx_autoajuste_y_areas_editables.html',
            extractable_fields: ['title', 'content', 'images']
        },
        hint: 'Implementar integracion con servicio de OCR para analisis real'
    });
}

async function optimizeTemplate(req, res, params) {
    const { template_id, optimization_type = 'all' } = params || {};

    if (!template_id) {
        return res.status(400).json({ error: 'Missing template_id parameter' });
    }

    const optimizations = {
        performance: [
            'Minificar CSS',
            'Optimizar imagenes',
            'Eliminar codigo no utilizado'
        ],
        accessibility: [
            'Agregar atributos alt a imagenes',
            'Mejorar contraste de colores',
            'Agregar roles ARIA'
        ],
        seo: [
            'Agregar meta tags',
            'Optimizar estructura de headings',
            'Agregar schema markup'
        ]
    };

    return res.status(200).json({
        success: true,
        template_id,
        optimization_type,
        suggestions: optimization_type === 'all'
            ? optimizations
            : { [optimization_type]: optimizations[optimization_type] },
        message: 'Optimization suggestions generated'
    });
}

async function buildTemplateCatalog() {
    const catalog = [];
    const seenFiles = new Set();
    const modulesData = await readModulesCatalog();

    for (const section of modulesData.sections) {
        for (const item of section.items) {
            const file = String(item.target || '').trim();
            if (!file || seenFiles.has(file)) continue;

            catalog.push({
                id: slugify(file.replace(/\.html$/i, '')),
                name: String(item.label || prettifyName(file)).trim(),
                file,
                description: buildDescription(item.label, section.title),
                category: slugify(section.title || 'general'),
                section: section.title || 'General',
                icon: item.icon || null,
                url: `/${file}`,
                source: 'modules.json',
                listed: true
            });

            seenFiles.add(file);
        }
    }

    const htmlFiles = await scanHtmlFiles();
    for (const file of htmlFiles) {
        if (seenFiles.has(file)) continue;

        catalog.push({
            id: slugify(file.replace(/\.html$/i, '')),
            name: prettifyName(file),
            file,
            description: `Pagina disponible detectada en el repositorio: ${prettifyName(file)}.`,
            category: inferCategory(file),
            section: 'Detectadas',
            icon: null,
            url: `/${file}`,
            source: 'filesystem',
            listed: false
        });

        seenFiles.add(file);
    }

    return catalog.sort((a, b) => {
        if (a.listed !== b.listed) return a.listed ? -1 : 1;
        return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
    });
}

async function readModulesCatalog() {
    try {
        const raw = await fs.readFile(MODULES_FILE, 'utf8');
        const data = JSON.parse(raw);
        return {
            sections: Array.isArray(data.sections) ? data.sections : []
        };
    } catch (error) {
        console.warn('[ARKAIOS] No se pudo leer modules.json:', error.message);
        return { sections: [] };
    }
}

async function scanHtmlFiles() {
    const entries = await fs.readdir(PROJECT_ROOT, { withFileTypes: true });
    return entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => name.toLowerCase().endsWith('.html'))
        .filter((name) => !HIDDEN_HTML.has(name))
        .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

function slugify(value = '') {
    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function prettifyName(file) {
    return String(file)
        .replace(/\.html$/i, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function inferCategory(file) {
    const lower = String(file).toLowerCase();

    if (lower.includes('foto') || lower.includes('imagen') || lower.includes('pixabay')) return 'imagenes';
    if (lower.includes('bio') || lower.includes('carta') || lower.includes('hoja')) return 'texto';
    if (lower.includes('panel') || lower.includes('portal') || lower.includes('orquestador')) return 'sistema';
    return 'general';
}

function buildDescription(label, section) {
    const safeLabel = String(label || 'Plantilla');
    const safeSection = String(section || 'General');
    return `Recurso del modulo ${safeSection}: ${safeLabel}.`;
}

function generateTemplateCode(type, specifications = {}) {
    const baseTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${specifications.title || 'Nueva Plantilla Educativa'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .content {
      line-height: 1.6;
      color: #333;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${specifications.title || 'Nueva Plantilla'}</h1>
    <div class="content">
      <p>Contenido de la plantilla aqui...</p>
      <p>Tipo sugerido: ${type}</p>
    </div>
  </div>
</body>
</html>`;

    return baseTemplate;
}
