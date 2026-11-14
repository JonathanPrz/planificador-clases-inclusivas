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

### 0. Flujo de adecuaciones por barrera (adecuaciones.js, vigente)
- `adecuaciones.js` (`window.UiePlannerAdecuaciones`) maneja toda la sección «Adecuaciones curriculares» dentro de `#adecuaciones-app`
- Paso 1: 9 preguntas que el asesor responde con el docente, una vez por sección (valen para todos los estudiantes). Filtran por modalidad (teórica, práctica, práctica profesional, online), marcan «Revisar con el docente» si un apoyo cambia un formato que se evalúa, y «Requiere coordinar» si falta un apoyo humano
- Paso 2: estudiantes (máx. 8). La matriz CIF se digita igual que la ficha de psicopedagogía (PAEDIS), escala 4 a 1. Nivel de barrera = 4 − valor (0 sin barrera, 1 leve, 2 moderada, 3 significativa). Condición opcional, varias permitidas; solo sugiere el origen de la barrera
- Actividades derivadas (no están en la matriz): trabajo en grupo, aula virtual, salidas a terreno. Se activan con las preguntas y toman el nivel más alto de sus actividades relacionadas
- Paso 3: apoyos de `catalogo.js` agrupados por actividad con barrera. Ninguno viene marcado: el asesor marca los acordados con el docente
- Dos PDF: «Plan para el docente» (sin condición, matriz ni origen) y «Ficha de coordinación» (uso interno, datos sensibles)
- `catalogo.js` se genera con `node docs/catalogo/generar-catalogo-js.js` desde `docs/catalogo/catalogo-por-barrera-borrador.json`. No editarlo a mano
- Diseño pensado primero para PC: desde 1180 px, Adecuaciones usa dos columnas (preguntas y estudiantes a la izquierda; apoyos y documentos fijos a la derecha) y DUA muestra el panel «Cobertura DUA 3.0» al costado. Bajo ese ancho todo se apila. No eliminar la versión estrecha: WCAG 1.4.10 exige que funcione a 320 px (zoom al 400 %)
- `#apoyos` y `#planificar` usan `overflow: clip` para que las columnas fijas (`position: sticky`) funcionen; no volver a `overflow: hidden`
- Conexión con DUA: `duaCatalogLinks` (data.js) relaciona acciones DUA con apoyos del catálogo. Si la acción está marcada, el apoyo aparece como «Ya está en la base DUA». Los apoyos acordados para 2+ estudiantes se muestran en «Para todo el curso», van una sola vez en el plan para el docente y aparecen en el panel de DUA. Si se regenera el catálogo y cambian los códigos `apNNN`, revisar esa tabla
- Eventos entre módulos: `uie-dua-change`, `uie-adecuaciones-change`, `uie-theme-change`

### 0b. DUA (dua.js)
- Acciones redactadas como lo que se planifica hacer (infinitivo), con `when` por etapa (antes, durante o después de la clase)
- Cada acción tiene su principio DUA 3.0 en `principles` (compromiso, representación, acción y expresión, o «base» para conocer y revisar). La cobertura se mide por principio: 0 acciones = sin acciones, 1 = inicial, 2 o más = cubierto. Nunca volver a medir por cantidad total
- Los índices de `checklist` son la clave guardada en el navegador (`etapa-índice`): agregar acciones solo al final de cada etapa
- El flujo antiguo por condición en `supports.js` (tarjetas, reglas, modal de plan) quedó sin uso en la página; se conserva solo lo que usan otras partes (checklist DUA, buenas prácticas)


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

### 2c. Contexto para decidir apoyos (por estudiante)
- Campos opcionales en la tarjeta: «¿Qué evalúa la asignatura?», formatos que son parte de lo evaluado (oral, escrito, tiempo, práctico) y «Lo que el estudiante dice que le funciona». Van al PDF
- `FORMAT_PATTERNS` + `formatConflictNote`: si un apoyo cambia un formato marcado, el PDF agrega «Revisar». Basado en la distinción estándar de competencia vs. método de evaluación (EHRC 2024)
- Tiempo adicional: referencia de 25 %, solo si la evaluación exige rapidez en la habilidad afectada (Harrison, Pollock y Holmes, 2022)

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
