# 🚀 Guía de Deployment - ARKAIOS AI Integration

## Resumen

Esta guía te ayudará a desplegar el Centro de Plantillas Educativas con integración completa de ARKAIOS AI.

---

## Prerrequisitos

- Cuenta en [Vercel](https://vercel.com) (gratuita)
- Repositorio de GitHub con el código
- Token de autenticación ARKAIOS: `(obtener de tu configuración de ARKAIOS)`

---

## Paso 1: Preparar el Repositorio

### 1.1 Hacer commit de los cambios

```bash
cd c:\arkaios\Eduacion-Libre-Proyecto-ARKAIOS

# Agregar todos los cambios
git add .

# Hacer commit
git commit -m "feat: integrar ARKAIOS AI como agente principal"

# Push a GitHub
git push origin main
```

### 1.2 Eliminar archivos obsoletos (opcional)

```bash
# Eliminar proxy de Perplexity (ya no se usa)
git rm api/pplx.js
git rm PERPLEXITY_SETUP.md

# Commit
git commit -m "chore: eliminar archivos obsoletos de Perplexity"
git push
```

---

## Paso 2: Deployment en Vercel

### Opción A: Desde GitHub (Recomendado)

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New Project"**
3. Selecciona **"Import Git Repository"**
4. Selecciona el repositorio `Eduacion-Libre-Proyecto-ARKAIOS`
5. Configuración:
   - **Framework Preset**: Other
   - **Root Directory**: `.` (por defecto)
   - **Build Command**: (dejar vacío)
   - **Output Directory**: (dejar vacío)

### Opción B: Con Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd c:\arkaios\Eduacion-Libre-Proyecto-ARKAIOS
vercel

# Seguir las instrucciones en pantalla
```

---

## Paso 3: Configurar Variables de Entorno

En Vercel Dashboard → Tu Proyecto → Settings → Environment Variables:

| Variable | Valor |
|----------|-------|
| `AIDA_AUTH_TOKEN` | `tu_token_de_autenticacion_arkaios` |
| `ARKAIOS_BASE_URL` | `https://arkaios-gateway-open.onrender.com` |
| `AIDA_GATEWAY_URL` | `https://arkaios-gateway-open.onrender.com/aida/gateway` |

**Importante**: Selecciona "Production", "Preview" y "Development" para cada variable.

---

## Paso 4: Actualizar Dominio en index.html

1. Una vez desplegado, Vercel te dará un dominio (ej. `https://eduacion-libre-arkaios.vercel.app`)
2. Copia el dominio
3. Abre `index.html` en tu editor
4. Busca la línea con `'https://TU_DOMINIO_VERCEL.vercel.app/api/arkaios'`
5. Reemplaza `TU_DOMINIO_VERCEL` con tu dominio real

**Ejemplo:**
```javascript
// Antes:
const response = await fetch('https://TU_DOMINIO_VERCEL.vercel.app/api/arkaios', {

// Después:
const response = await fetch('https://eduacion-libre-arkaios.vercel.app/api/arkaios', {
```

6. Guardar, commit y push:
```bash
git add index.html
git commit -m "fix: actualizar dominio de Vercel"
git push
```

Vercel re-desplegará automáticamente.

---

## Paso 5: Verificación

### 5.1 Probar el endpoint ARKAIOS

```bash
curl -X POST https://tu-dominio.vercel.app/api/arkaios \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hola ARKAIOS, ¿estás listo?"}]}'
```

**Resultado esperado**: Respuesta JSON con contenido generado por ARKAIOS.

### 5.2 Probar desde el navegador

1. Abre `https://tu-dominio.vercel.app`
2. Click en el botón del asistente IA (🤖)
3. Envía un mensaje: "Hola ARKAIOS"
4. Verifica que responde correctamente
5. Abre DevTools → Network tab
6. Verifica que la petición va a `/api/arkaios`
7. No deberías ver errores de CORS en Console

### 5.3 Probar capacidades avanzadas

Prueba estos comandos:

- **Editar**: "Quiero editar la plantilla actual para cambiar los colores"
- **Crear**: "Crea una nueva plantilla para un certificado escolar"
- **Analizar**: "Explícame la estructura de la plantilla de Carta MX"
- **Optimizar**: "Optimiza la plantilla actual para mejor rendimiento"

---

## Troubleshooting

### Error: "Missing AIDA_AUTH_TOKEN"

→ Verifica que configuraste la variable de entorno en Vercel Dashboard  
→ Re-deploya el proyecto después de agregar la variable

### ARKAIOS no responde

→ Verifica que el gateway está activo: `https://arkaios-gateway-open.onrender.com`  
→ Revisa los logs en Vercel Dashboard → Deployments → Functions

### Error: "ARKAIOS error: 401"

→ Verifica que el token `AIDA_AUTH_TOKEN` es correcto  
→ Asegúrate de que no tiene espacios extras

### El dominio no se actualizó

→ Verifica que hiciste commit y push de los cambios en `index.html`  
→ Espera a que Vercel termine de re-desplegar

---

## Próximos Pasos

Una vez que la integración básica funcione:

1. **Fase 2**: Implementar capacidades de edición de plantillas
2. **Fase 3**: Agregar reconocimiento de PDF
3. **Fase 4**: Testing final y optimización

**Deadline**: 12 de diciembre de 2025

---

## Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [ARKAIOS Gateway](https://arkaios-gateway-open.onrender.com)
- [Repositorio GitHub](https://github.com/djklmr2025/Eduacion-Libre-Proyecto-ARKAIOS)

---

¿Necesitas ayuda? Revisa los logs en Vercel o consulta la documentación de ARKAIOS.
