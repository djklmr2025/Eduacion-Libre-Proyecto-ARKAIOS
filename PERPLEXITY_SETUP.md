# 🚀 Quick Start: Perplexity Proxy Setup

## ¿Qué se hizo?

Se implementó un proxy serverless para resolver el problema de CORS con la API de Perplexity. Ahora las llamadas al API se hacen desde el servidor (Vercel) en lugar del navegador.

## Archivos creados/modificados

✅ **Creados:**
- `api/pplx.js` - Función serverless que actúa como proxy
- `vercel.json` - Configuración de Vercel
- `DEPLOYMENT.md` - Guía completa de deployment

✅ **Modificados:**
- `index.html` - Actualizada función `callPerplexity` para usar el proxy

## Próximos pasos

### 1. Desplegar en Vercel

**Opción A: Desde GitHub (Recomendado)**
1. Haz commit y push de todos los cambios a GitHub
2. Ve a [vercel.com](https://vercel.com) → "Add New Project"
3. Importa tu repositorio `Eduacion-Libre-Proyecto-ARKAIOS`
4. En "Environment Variables" agrega:
   - Key: `PPLX_API_KEY`
   - Value: Tu API key de Perplexity
5. Click "Deploy"

**Opción B: Con Vercel CLI**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy desde el directorio del proyecto
cd c:\arkaios\Eduacion-Libre-Proyecto-ARKAIOS
vercel

# Agregar variable de entorno
vercel env add PPLX_API_KEY
# Pega tu API key cuando te lo pida

# Re-deploy
vercel --prod
```

### 2. Actualizar el dominio en index.html

Una vez desplegado, Vercel te dará un dominio (ej. `https://eduacion-libre-arkaios.vercel.app`).

1. Abre `index.html`
2. Busca la línea con `'https://TU_DOMINIO_VERCEL.vercel.app/api/pplx'`
3. Reemplaza `TU_DOMINIO_VERCEL` con tu dominio real
4. Guarda y vuelve a desplegar

**Ejemplo:**
```javascript
// Antes:
const response = await fetch('https://TU_DOMINIO_VERCEL.vercel.app/api/pplx', {

// Después:
const response = await fetch('https://eduacion-libre-arkaios.vercel.app/api/pplx', {
```

### 3. Verificar que funciona

1. Abre tu sitio en el navegador
2. Click en el botón del asistente IA (🤖)
3. Envía un mensaje
4. Si Puter falla, debería usar Perplexity automáticamente
5. Verifica en DevTools que no hay errores de CORS

## ¿Dónde obtener la API Key de Perplexity?

1. Ve a [perplexity.ai](https://www.perplexity.ai/settings/api)
2. Inicia sesión o crea una cuenta
3. Ve a "API" en la configuración
4. Genera una nueva API key
5. Cópiala (no la compartas públicamente)

## Troubleshooting

### "Missing PPLX_API_KEY"
→ Configura la variable de entorno en Vercel Dashboard

### CORS sigue apareciendo
→ Verifica que actualizaste la URL en `index.html` con tu dominio real

### "Invalid API key"
→ Verifica tu API key en perplexity.ai/settings/api

## Documentación completa

Para más detalles, consulta `DEPLOYMENT.md`

---

**¿Necesitas ayuda?** Abre un issue en GitHub o consulta la documentación de Vercel.
