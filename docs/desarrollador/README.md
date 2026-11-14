# Documentación para desarrolladores

## Stack tecnológico

| Tecnología | Versión / Detalle |
|---|---|
| HTML5 | Sin framework |
| CSS3 | ~4400 líneas en `styles.css` |
| JavaScript | Vanilla (ES5 — usar `var`, funciones nombradas) |
| [Chart.js](https://www.chartjs.org/) | v4.5.1 (CDN, versión fija) — radar chart |
| [pdfMake](https://pdfmake.org/) | v0.2.12 (CDN) — generación de PDF |
| Hosting | GitHub Pages (static) |

## Requisitos

- Navegador moderno (Chrome, Edge, Firefox, Safari)
- Servidor HTTP básico para desarrollo local:

```bash
# PHP
php -S localhost:8000

# Python
python -m http.server 8000

# Node (npx)
npx serve .
```

## Estructura del proyecto

```
├── index.html              ← Punto de entrada (SPA con tabs)
├── styles.css              ← Todos los estilos (~4400 líneas)
├── app.js                  ← Init, navegación, toggles
├── data.js                 ← Datos de condiciones, matriz CIF, reglas
├── supports.js             ← Lógica principal de UI y recomendaciones
├── report.js               ← Generación de PDF (pdfMake)
├── theme.js                ← Modo oscuro/claro
├── navigation.js           ← Navegación entre vistas
├── tabs.js                 ← Tabs dentro de vistas
├── dua.js                  ← Módulo DUA
├── content.js              ← Contenido de apoyos adicionales
├── privacy.js              ← Nota emergente de protección de datos
├── notice.js               ← Avisos y confirmaciones accesibles
├── logos.js                ← Logos en base64 (PDF e impresión)
├── favicon.png             ← Ícono del sitio
├── sw.js                   ← Desinstala service workers antiguos
├── AGENTS.md               ← Contexto para asistentes IA
└── docs/                   ← Documentación
```

## Convenciones de código

- **Variables**: `var` en lugar de `const`/`let`
- **Funciones**: nombradas (`function nombre()`) en lugar de arrow functions
- **Sin comentarios** a menos que la lógica sea críptica
- **Idioma**: nombres de funciones y variables en inglés; textos de UI en español
- **Texto del usuario**: escapar con `escapeSupportHtml` antes de insertarlo como HTML
- **Avisos**: `window.UiePlannerNotice.showNotice` y `askConfirm`, nunca `alert` ni `confirm`
- **Caché**: al cambiar un `.css` o `.js`, actualizar el `?v=` en `index.html`
- **Datos reales**: nunca subir fichas, nombres o RUT de estudiantes al repositorio

## Archivos clave

| Archivo | Responsabilidad |
|---|---|
| `data.js` | Catálogo de condiciones, matriz CIF/OMS, reglas de recomendación |
| `supports.js` | Renderizado de UI, cálculos de prioridad, radar chart, PDF del plan |
| `report.js` | PDF de reporte completo con pdfMake |

## Cómo contribuir

1. Clonar el repositorio
2. Iniciar servidor local
3. Hacer cambios en los archivos correspondientes
4. Verificar con navegador
5. Crear PR con descripción clara
