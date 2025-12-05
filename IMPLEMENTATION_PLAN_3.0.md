# 🚀 ARKAIOS - Plan de Implementación 2025

## Fecha: 2025-12-04
## Versión: 3.0 - "Workshop & Project Management"

---

## 📝 RESUMEN DE MEJORAS SOLICITADAS

### 1. Búsqueda de Imágenes Mejorada ✅
**Problema:** Los botones de búsqueda (Pixabay, Pexels, Freepik) dan 12 fotos por default
**Solución:** Preguntar primero el tema, luego la cantidad deseada

**Archivos a modificar:**
- `plantilla-cuadros-imagenes-v2.html`
- `plantilla-imagenes-v2.html`
- Todas las plantillas con búsqueda de imágenes

---

### 2. Rediseño del Index - Menú Compacto ✅
**Problema:** El sidebar ocupa mucho espacio
**Solución:** 
- Menú desplegable tipo dropdown para "Plantillas"
- Botón compacto que muestre/oculte las opciones
- Más espacio para el área de trabajo

**Diseño propuesto:**
```
┌─────────────────────────────────────┐
│ 🎓 ARKAIOS  [▼ Plantillas] [+ Nuevo]│
│                                      │
│  ┌────────────────────────────────┐ │
│  │                                │ │
│  │    Área de Trabajo (iframe)    │ │
│  │                                │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### 3. Sistema Workshop 🔬
**Propósito:** Espacio para experimentar con nuevas plantillas antes de integrarlas

**Características:**
- Carpeta `/workshop` para plantillas en desarrollo
- Interfaz para probar nuevas implementaciones
- Botón "Aprobar" para mover a producción
- Botón "Descartar" para eliminar experimentos

**Estructura de carpetas:**
```
/
├── index.html (principal)
├── /templates (plantillas aprobadas)
│   ├── plantilla_escolar.html
│   ├── biografia_profesional.html
│   └── ...
├── /workshop (experimentos)
│   ├── nueva_plantilla_1.html
│   ├── test_diseño.html
│   └── ...
└── /projects (proyectos guardados)
    ├── proyecto_matematicas.json
    ├── tarea_historia.json
    └── ...
```

---

### 4. Gestión de Proyectos 💾
**Funcionalidad:** Guardar y reabrir trabajos

**Características:**
- Guardar estado actual de cualquier plantilla
- Lista de proyectos guardados
- Reabrir y continuar editando
- Exportar/Importar proyectos

**Formato de guardado (JSON):**
```json
{
  "id": "proyecto_123",
  "nombre": "Tarea de Matemáticas",
  "plantilla": "plantilla_escolar.html",
  "fecha_creacion": "2025-12-04T20:00:00",
  "fecha_modificacion": "2025-12-04T20:15:00",
  "datos": {
    "nombre": "Juan Pérez",
    "materia": "Matemáticas",
    "imagenes": ["url1", "url2"],
    "textos": {...}
  },
  "pdf_generado": "base64_string_or_url"
}
```

---

### 5. Auto-detección de PDFs 📄
**Funcionalidad:** Reconocer PDFs creados por el sistema y permitir re-editarlos

**Características:**
- Metadata embebida en PDFs generados
- Botón "Importar PDF" para continuar editando
- Extracción de datos del PDF
- Restaurar estado de la plantilla

---

## 🎯 PRIORIDADES DE IMPLEMENTACIÓN

### Fase 1 (Inmediata) ⚡
1. ✅ Arreglar búsqueda de imágenes (cantidad personalizada)
2. ✅ Rediseñar index.html con menú compacto
3. ✅ Agregar botón "+ Nuevo" para crear plantillas

### Fase 2 (Corto plazo) 📅
4. Implementar sistema Workshop
5. Crear gestor de proyectos básico
6. Agregar funcionalidad de guardado

### Fase 3 (Mediano plazo) 🚀
7. Sistema de auto-detección de PDFs
8. Importar/Exportar proyectos
9. Integración completa con IA para crear plantillas

---

## 💡 NOTAS TÉCNICAS

### Tecnologías a usar:
- **LocalStorage** para proyectos guardados localmente
- **IndexedDB** para almacenamiento más robusto
- **PDF.js** para leer PDFs generados
- **File System Access API** para importar/exportar

### Compatibilidad:
- Mantener compatibilidad con versión actual
- Migración gradual de plantillas existentes
- No romper funcionalidad actual

---

## 🔄 PRÓXIMOS PASOS

1. Implementar cambios de Fase 1
2. Probar en local
3. Desplegar a Vercel
4. Recopilar feedback
5. Iterar y mejorar

---

**Creado por:** Claude (ARKAIOS AI)
**Fecha:** 2025-12-04
**Estado:** En progreso 🚧
