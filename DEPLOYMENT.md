# Guía de Deployment en Vercel

Esta guía te ayudará a desplegar el proyecto en Vercel para que el proxy de Perplexity funcione correctamente.

## Prerrequisitos

- Cuenta en [Vercel](https://vercel.com) (gratuita)
- API Key de Perplexity (obtenerla en [perplexity.ai](https://www.perplexity.ai/settings/api))
- Repositorio de GitHub con el código (opcional pero recomendado)

## Opción 1: Deployment desde GitHub (Recomendado)

### Paso 1: Conectar Repositorio

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New Project"**
3. Selecciona **"Import Git Repository"**
4. Autoriza a Vercel para acceder a tu GitHub
5. Selecciona el repositorio `Eduacion-Libre-Proyecto-ARKAIOS`

### Paso 2: Configurar Proyecto

1. **Framework Preset**: Selecciona "Other" (es un proyecto estático)
2. **Root Directory**: Deja el valor por defecto (`.`)
3. **Build Command**: Deja vacío (no necesitamos build)
4. **Output Directory**: Deja vacío

### Paso 3: Configurar Variables de Entorno

1. En la sección **"Environment Variables"**, agrega:
   - **Key**: `PPLX_API_KEY`
   - **Value**: Tu API key de Perplexity
   - **Environment**: Selecciona "Production", "Preview" y "Development"

2. Click en **"Add"**

### Paso 4: Deploy

1. Click en **"Deploy"**
2. Espera a que termine el deployment (1-2 minutos)
3. Una vez completado, verás tu dominio (ej. `https://tu-proyecto.vercel.app`)

### Paso 5: Actualizar index.html

1. Copia el dominio de tu proyecto
2. Abre `index.html` en tu editor
3. Busca la función `callPerplexity` (alrededor de la línea 921)
4. Reemplaza `'https://TU_DOMINIO_VERCEL.vercel.app/api/pplx'` con tu dominio real
5. Guarda el archivo
6. Haz commit y push a GitHub
7. Vercel automáticamente re-desplegará con los cambios

## Opción 2: Deployment con Vercel CLI

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Login

```bash
vercel login
```

### Paso 3: Deploy desde el directorio del proyecto

```bash
cd c:\arkaios\Eduacion-Libre-Proyecto-ARKAIOS
vercel
```

Sigue las instrucciones en pantalla:
- Link to existing project? **No**
- What's your project's name? **eduacion-libre-arkaios** (o el nombre que prefieras)
- In which directory is your code located? **./** (presiona Enter)

### Paso 4: Configurar Variable de Entorno

```bash
vercel env add PPLX_API_KEY
```

Cuando te pregunte:
- What's the value of PPLX_API_KEY? **[Pega tu API key]**
- Add PPLX_API_KEY to which Environments? **Selecciona todas (Production, Preview, Development)**

### Paso 5: Re-deploy con la variable de entorno

```bash
vercel --prod
```

### Paso 6: Obtener el dominio

El CLI te mostrará el dominio de tu proyecto. Cópialo y actualiza `index.html` como se indicó arriba.

## Verificación

### 1. Probar el endpoint directamente

Usa curl o Postman para probar el endpoint:

```bash
curl -X POST https://tu-proyecto.vercel.app/api/pplx \
  -H "Content-Type: application/json" \
  -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Hola, ¿cómo estás?\"}]}"
```

Deberías recibir una respuesta JSON con el contenido generado por Perplexity.

### 2. Probar desde el navegador

1. Abre `https://tu-proyecto.vercel.app` en tu navegador
2. Abre el panel del asistente IA (botón 🤖)
3. Envía un mensaje
4. Si Puter no está configurado, debería hacer fallback a Perplexity automáticamente
5. Verifica en DevTools (Network tab) que la petición va a `/api/pplx`
6. No deberías ver errores de CORS en la consola

## Troubleshooting

### Error: "Missing PPLX_API_KEY"

- Verifica que configuraste la variable de entorno en Vercel Dashboard
- Ve a tu proyecto → Settings → Environment Variables
- Asegúrate de que `PPLX_API_KEY` esté configurada para todos los entornos

### Error: CORS sigue apareciendo

- Verifica que actualizaste la URL en `index.html` con tu dominio de Vercel
- Asegúrate de que la URL incluya `/api/pplx` al final
- Verifica que hiciste commit y push de los cambios

### Error: "Invalid API key"

- Verifica que tu API key de Perplexity sea válida
- Ve a [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api) para verificar
- Regenera la key si es necesario y actualiza la variable de entorno en Vercel

### El deployment falla

- Verifica que el archivo `api/pplx.js` esté en la raíz del proyecto
- Verifica que `vercel.json` esté en la raíz del proyecto
- Revisa los logs de deployment en Vercel Dashboard

## Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Perplexity API Docs](https://docs.perplexity.ai/)

## Mantenimiento

### Actualizar el proyecto

Si conectaste GitHub, cualquier push a la rama principal automáticamente desplegará los cambios.

Si usas Vercel CLI:
```bash
vercel --prod
```

### Rotar API Key

1. Genera una nueva API key en Perplexity
2. Ve a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
3. Edita `PPLX_API_KEY` con la nueva key
4. Re-deploya el proyecto

---

¿Necesitas ayuda? Abre un issue en el repositorio o consulta la documentación de Vercel.
