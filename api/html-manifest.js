// api/html-manifest.js
// Auto-detecta todos los .html del repo, lee su <title> y los categoriza
// Sin configuración manual — cada nuevo .html aparece solo en el menú

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';

// ─── Archivos a excluir del menú ───
const EXCLUIR = new Set([
  'index.html',
  'CODIGO_PARA_INDEX.html',
  'diagnostico-api-imagenes.html',
  'generador-ia-imagenes.html', // si quieres ocultarlo
]);

// ─── Mapa de categorías por palabras clave en el nombre de archivo ───
const CATEGORIAS = [
  {
    key: 'educativo',
    keywords: ['brecha-digital', 'cultura-de-paz', 'educativo', 'modulo'],
    title: 'Módulos Educativos',
    icon: '📚',
  },
  {
    key: 'texto',
    keywords: ['carta', 'milimetrica', 'biografia', 'carta_mx'],
    title: 'Módulos de Texto',
    icon: '📝',
  },
  {
    key: 'imagen',
    keywords: ['plantilla', 'cuadros', 'imagenes', 'fotos', 'circulos'],
    title: 'Plantillas de Imagen',
    icon: '🖼️',
  },
  {
    key: 'herramientas',
    keywords: ['buscador', 'generador', 'pixabay', 'descargador', 'orquestador', 'hoja'],
    title: 'Herramientas',
    icon: '🔧',
  },
  {
    key: 'sistema',
    keywords: ['portal', 'elemia', 'material', 'panel', 'biblioteca'],
    title: 'Sistema',
    icon: '🏢',
  },
];

const ICONOS_ARCHIVO = {
  'brecha-digital': '📡',
  'cultura-de-paz': '☮️',
  'biografia_profesional': '👤',
  'hoja_milimetrica_interactiva': '📐',
  'plantilla_escolar_carta_mx': '📄',
  'generador-fotos-infantiles': '👶',
  'buscador-imagenes-educativo': '🔍',
  'pixabay-descargador-lote': '🌐',
  'plantilla_circulos_jack': '⭕',
  'plantilla-cuadros-imagenes-v2': '🖼️',
  'plantilla-imagenes-v2': '🎨',
  'generador-ia-imagenes': '🤖',
  'material-educativo-reutilizable': '📖',
  'orquestador-html-plus': '⚙️',
  'elemia-panel': '🧠',
  'portal-empresarial': '🏢',
};

// ─── Extrae <title> del HTML ───
function extractTitle(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const match = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (match && match[1]) {
      // Limpia: quita "| ARKAIOS", "ARKAIOS -", etc.
      return match[1]
        .replace(/\|.*$/g, '')
        .replace(/ARKAIOS\s*[-–—]?\s*/gi, '')
        .replace(/Sistema Educativo Profesional v\d+\.\d+/gi, '')
        .trim();
    }
  } catch {}
  return null;
}

// ─── Nombre amigable desde el nombre de archivo ───
function prettifyFilename(name) {
  return name
    .replace(/\.html?$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\bv(\d+)\b/gi, 'v$1')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

// ─── Obtiene ícono para archivo ───
function getIcono(filename) {
  const base = filename.replace(/\.html?$/i, '');
  for (const [key, icon] of Object.entries(ICONOS_ARCHIVO)) {
    if (base.includes(key) || base === key) return icon;
  }
  return '📄';
}

// ─── Categoriza el archivo ───
function getCategoria(filename) {
  const lower = filename.toLowerCase();
  for (const cat of CATEGORIAS) {
    if (cat.keywords.some(kw => lower.includes(kw))) {
      return cat.key;
    }
  }
  return 'herramientas'; // fallback
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Raíz del proyecto (un nivel arriba de /api/)
    const root = resolve(process.cwd());
    const files = readdirSync(root).filter(f => {
      if (!f.endsWith('.html')) return false;
      if (EXCLUIR.has(f)) return false;
      try {
        return statSync(join(root, f)).isFile();
      } catch {
        return false;
      }
    });

    // Agrupar por categoría
    const grupos = {};
    for (const cat of CATEGORIAS) {
      grupos[cat.key] = { ...cat, items: [] };
    }

    for (const file of files) {
      const catKey = getCategoria(file);
      const filePath = join(root, file);
      const title = extractTitle(filePath) || prettifyFilename(file);
      const icon = getIcono(file);

      grupos[catKey].items.push({
        label: title,
        icon,
        target: file,
      });
    }

    // Armar sections solo con items no vacíos
    const sections = CATEGORIAS
      .map(cat => ({
        title: cat.title,
        icon: cat.icon,
        items: grupos[cat.key].items,
      }))
      .filter(s => s.items.length > 0);

    return res.status(200).json({
      success: true,
      total: files.length,
      sections,
    });

  } catch (err) {
    console.error('[html-manifest]', err);
    return res.status(500).json({ error: err.message });
  }
}
