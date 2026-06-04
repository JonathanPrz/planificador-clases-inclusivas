# Arquitectura del Planificador Inclusivo UIE

## Diagrama de módulos

```mermaid
flowchart TD
    A[index.html] --> B[app.js]
    A --> C[styles.css]
    
    B --> D[navigation.js]
    B --> E[tabs.js]
    B --> F[theme.js]
    
    D --> G[vista inicio]
    D --> H[vista DUA]
    D --> I[vista adecuaciones]
    D --> J[vista adicionales]
    
    I --> K[supports.js]
    H --> L[dua.js]
    
    K --> M[data.js]
    K --> N[report.js]
    K --> O[logos.js]
    
    N --> P[pdfMake CDN]
    K --> Q[Chart.js CDN]
```

## Flujo de datos

```mermaid
flowchart LR
    A[data.js] --> B[condition keys]
    A --> C[matrixScores]
    A --> D[recommendationsData]
    A --> E[barrierProfiles]
    
    B --> F[supports.js]
    C --> F
    D --> F
    E --> F
    
    F --> G[getCIFRadarDataset]
    F --> H[applyStudentMatrix]
    F --> I[clearStudentMatrix]
    F --> J[computePrioritizedRecommendations]
    F --> K[renderPdfCIFRadarChartCanvas]
    
    H --> L[matrixData global]
    I --> L
    L --> G
    L --> J
    
    J --> M[recomendaciones priorizadas]
    K --> N[canvas → dataURL → PDF]
```

## Modelo CIF/OMS

```mermaid
erDiagram
    ACTIVIDAD {
        string id
        string label
        list dims
        list conds
    }
    CONDICION {
        string key
        string name
        string source
    }
    MATRIX_SCORES {
        int estudiante_index
        dict scores
        bool applied
    }
    RECOMENDACION {
        string text
        string dimension
        int priorityLevel
        string source
    }
    
    ACTIVIDAD ||--o{ MATRIX_SCORES : "tiene puntaje"
    CONDICION ||--o{ MATRIX_SCORES : "filtra"
    MATRIX_SCORES ||--|{ RECOMENDACION : "genera"
```

## Flujo de recomendaciones

```mermaid
flowchart TD
    A[Seleccionar condición] --> B{¿Matriz CIF activa?}
    B -->|Sí| C[Leer matrixScores]
    B -->|No| D[Usar barrierProfiles de referencia]
    
    C --> E[Calcular severity por actividad]
    D --> E
    
    E --> F[score 4 → severidad 0 → Sin ajuste]
    E --> G[score 3 → severidad 1 → Observar]
    E --> H[score 2 → severidad 2 → Recomendado]
    E --> I[score 1 → severidad 3+ → Prioritario]
    
    F --> J[Filtrar por condición]
    G --> J
    H --> J
    I --> J
    
    J --> K[Agrupar por dimensión CIF]
    K --> L[Renderizar UI + PDF]
```

## Ciclo de renderizado del radar

```mermaid
flowchart LR
    A[getStudentMatrixScores] --> B{¿Tiene datos?}
    B -->|Sí| C[4 - score → necesidad apoyo]
    B -->|No| D[retorna [0,0,0,0,0]]
    
    C --> E[Chart.js radar]
    D --> E
    
    E --> F[Legend interactivo]
    E --> G[Tooltip con severidad]
    
    subgraph PDF
        H[renderPdfCIFRadarChartCanvas]
        I[canvas 340x350 a 2x DPI]
        H --> I
    end
    
    C --> H
    F --> J[Toggle visibilidad]
    G --> J
```

## Matriz de datos

### Actividades CIF (11)

| ID | Label | Dimensiones |
|---|---|---|
| `escribir` | Escribir | evaluacion, tech |
| `leer` | Leer | materials |
| `hablar` | Hablar | interaction |
| `recordar` | Recordar cosas | methods |
| `examenes` | Rendir exámenes | evaluacion |
| `practicos` | Participar en ramos prácticos | methods, interaction |
| `sala_clases` | Participar en la sala de clases | interaction, context |
| `sociales` | Participar en actividades sociales | interaction |
| `practicas_rec` | Participar en actividades prácticas | interaction, context |
| `ayuda` | Obtener ayuda | interaction |
| `acceder` | Acceder a la institución | context |

### Niveles de severidad (semáforo)

| Score CIF | Severidad | Etiqueta | Color |
|---|---|---|---|
| 4 | 0 | Sin ajuste | Gris |
| 3 | 1 | Menor / Observar | Verde |
| 2 | 2 | Moderado / Recomendado | Amarillo |
| 1 | 3+ | Prioritario / Intervenir | Rojo |

## PDF (pdfMake)

El proyecto tiene dos puntos de generación de PDF:

1. **Plan de apoyo** (`supports.js` → `generatePlanPDF`):
   - Desde el modal "Plan" en la vista de adecuaciones
   - Incluye DUA + Buenas Prácticas + Radar (canvas 2x) + Recomendaciones
   - Cada sección en página separada

2. **Reporte completo** (`report.js` → `generatePdfMake`):
   - Desde la vista Reportes
   - Incluye DUA + Buenas Prácticas + Barras CIF + Recomendaciones

### Proceso del radar en PDF

```mermaid
flowchart LR
    A[renderPdfCIFRadarChartCanvas] --> B[Mide nombres estudiantes]
    A --> C[Mide etiquetas actividades]
    C --> D[Calcula ancho canvas dinámico]
    B --> D
    D --> E[Dibuja radar en canvas]
    D --> F[Dibuja leyenda estudiantes abajo]
    D --> G[Dibuja niveles severidad]
    E --> H[toDataURL PNG]
    G --> H
    H --> I[pdfMake image width: min(W, 360)]
```

## Tema oscuro/claro

- Detectado por clase `theme-dark` en `<body>`
- `theme.js` maneja toggle manual + persistencia en localStorage
- `getRadarThemeColors()` retorna colores según modo
- `initRadarThemeObserver()` en `app.js` re-renderiza radar al cambiar tema
