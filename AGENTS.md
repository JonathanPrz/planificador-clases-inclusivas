# Planificador Inclusivo — Resumen Anclado

## Propósito
App web (sin backend/build) para planificación inclusiva en educación superior. Genera recomendaciones de apoyo pedagógico según condiciones de estudiantes, usando matriz CIF-OMS.

## Stack
- HTML + CSS (`styles.css`, ~4100 líneas) + JS vanilla (`supports.js`, `data.js`, `report.js`)
- Sin framework. Sin bundler. Sin dependencias runtime (excepto pdfmake para PDF).

## Convenciones
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

### 3. Recomendaciones sin matriz
- `renderProfileGroup` usa `getReferenceScores` para asignar scores basados en perfiles de barrera
- Esto permite mostrar badges de prioridad incluso sin datos de matriz
- Scores de referencia se calculan con `barrierProfiles[condición]` × dimensiones CIF

### 4. Prioridades (semaforo)
- Severidad 0 → score 4 → Sin ajuste
- Severidad 1 → score 3 → Observación
- Severidad 2 → score 2 → Recomendado
- Severidad ≥3 → score 1 → Prioritario

### 5. Archivos principales
- `data.js`: Datos de condiciones, matriz CIF, reglas, recomendaciones
- `supports.js`: Lógica de UI, renderizado, cálculos de prioridad
- `report.js`: Generación de PDF
- `index.html`: Punto de entrada

### 6. Respaldo
- Los respaldos están en `respaldos/` con fecha
- No eliminar respaldos antiguos
