# Planificador Inclusivo — Resumen Anclado

## Propósito
App web (sin backend/build) para planificación inclusiva en educación superior. Genera recomendaciones de apoyo pedagógico según condiciones de estudiantes, usando matriz CIF-OMS.

## Stack
- HTML + CSS (`styles.css`, ~4900 líneas) + JS vanilla (`supports.js`, `data.js`, `report.js`, `pdf.js`)
- Sin framework. Sin bundler. Dependencias runtime por CDN: pdfmake (PDF) y Chart.js (radar).

## Convenciones
- Al cambiar un `.css` o `.js`, actualizar el `?v=` de todos los archivos locales en `index.html`
- Usar `window.UiePlannerNotice.showNotice` / `askConfirm` en lugar de `alert` / `confirm`
- Escapar con `escapeSupportHtml` todo texto escrito por el usuario antes de insertarlo como HTML
- No subir datos reales de estudiantes al repositorio (fichas, nombres, RUT)
- Código legacy: `var` en lugar de `const/let`, funciones nombradas vs arrow
- Mantener ese estilo en el archivo donde se trabaje
- No agregar comentarios a menos que se solicite
- Las recomendaciones vienen de `recommendationsData` o `accommodationsData`

## Decisiones técnicas clave

### 1. Recomendaciones viven en data.js
- `recommendationsData` tiene catálogo de apoyos clasificados por condición y dimensión
- `matrixRecommendationRules` asigna reglas específicas según puntajes CIF
- `accommodationsData` es el respaldo/legado

### 2. Chart CIF (renderCIFBarChart)
- Muestra actividades CIF vs estudiantes en tabla compacta (filas=actividades, columnas=estudiantes)
- Sin matriz: usa perfiles de barrera de referencia (`barrierProfiles`) con opacidad reducida
- Leyenda única al pie en lugar de etiquetas repetidas
- Botón toggle para ocultar/mostrar
- También se renderiza en PDF descargable vía `renderCIFChartPdfSection` (tabla nativa pdfmake con barras vectoriales)
- Se incluye en vista de impresión `updatePrintableRecommendations`

### 2b. Panel «Mapa de barreras CIF» (web)
- `renderCIFChartPanel` + `activateCIFChartPanel`: un solo panel con vistas «Comparar» (radar, máx. 3 estudiantes) y «Detalle» (barras). Por defecto: radar si hay 2+ estudiantes con matriz, barras si hay 1
- La casilla «Incluir en el gráfico» de cada ficha elige qué estudiantes entran; si ninguna está marcada, entran todos los que tienen matriz

### 3. Recomendaciones sin matriz
- `renderProfileGroup` usa `getReferenceScores` para asignar scores basados en perfiles de barrera
- Esto permite mostrar badges de prioridad incluso sin datos de matriz
- Scores de referencia se calculan con `barrierProfiles[condición]` × dimensiones CIF

### 4. Prioridades (niveles de barrera)
- Colores: escala secuencial de un solo tono (gris → rojo claro → rojo → rojo oscuro), legible para daltonismo y en blanco y negro. Variables `--lvl-0` a `--lvl-3` en CSS y `UiePlannerPdf.LEVELS` en PDF. Siempre acompañar el color con número o texto
- Severidad 0 → score 4 → Sin ajuste
- Severidad 1 → score 3 → Observación
- Severidad 2 → score 2 → Recomendado
- Severidad ≥3 → score 1 → Prioritario

### 5. Archivos principales
- `data.js`: Datos de condiciones, matriz CIF, reglas, recomendaciones y referencias
- `supports.js`: Lógica de UI, renderizado, cálculos de prioridad
- `report.js`: Resumen imprimible y PDF del diálogo de reporte
- `pdf.js`: Estilo común de los PDF (`window.UiePlannerPdf`), carga de pdfmake y vista previa antes de descargar. Todo PDF nuevo debe pasar por `UiePlannerPdf.preview(docDef, archivo, { title })`
- `privacy.js`: Nota emergente de protección de datos (Ley 21.719)
- `notice.js`: Avisos y confirmaciones en diálogo accesible
- `index.html`: Punto de entrada

### 6. Privacidad
- Sin analítica ni contadores externos
- Los datos de estudiantes no se guardan en el navegador ni se envían a servidores

### 7. Fuentes
- Índice y enlaces oficiales en `docs/fuentes/README.md`
- Respaldo de todos los PDF y su versión en Markdown (OneDrive Duoc UC): https://duoccl0-my.sharepoint.com/:f:/g/personal/jperezas_duoc_cl/IgAr9EYQbJg_S72MOb0hDQFNAZ57BycOLUHV272CYYwA68M?e=TjNrmv
- Para extraer texto de una fuente, usar primero ese respaldo en Markdown

### 8. Respaldo
- Los respaldos se guardan fuera de este repositorio, con fecha
- No eliminar respaldos antiguos
