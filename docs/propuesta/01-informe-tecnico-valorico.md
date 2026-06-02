# Informe Técnico-Valórico
## Planificador Inclusivo UIE — Herramienta de Planificación Docente bajo DUA

**Preparado para:** Dirección Académica / Unidad de Inclusión — Duoc UC
**Elaborado por:** Jonathan Pérez | [fecha]
**Versión del software:** 1.0 (estable, desplegada en GitHub Pages)

---

## 1. Resumen Ejecutivo

El **Planificador Inclusivo UIE** es una aplicación web progresiva (PWA) diseñada para que docentes de Duoc UC planifiquen clases inclusivas aplicando el Diseño Universal para el Aprendizaje (DUA) y adecuaciones curriculares, en cumplimiento de la normativa chilena de inclusión en educación superior (Ley 20.422, Decreto 83, Ley 21.369).

La herramienta fue desarrollada en 5 días de trabajo intensivo (47 commits) y se encuentra operativa, desplegada y funcionando sin errores conocidos. Su arquitectura vanilla (HTML/CSS/JS sin frameworks) garantiza mantenibilidad, cero dependencias externas y bajo costo de operación.

**Valoración sugerida:** $1.500.000 – $3.000.000 CLP (licencia única) + honorarios por implementación y capacitación.

---

## 2. Descripción del Proyecto

### 2.1. ¿Qué resuelve?

Los docentes de Duoc UC enfrentan la exigencia institucional y legal de planificar clases inclusivas. Sin embargo:

- No existe una herramienta centralizada que guíe la aplicación del DUA paso a paso.
- Las adecuaciones curriculares para estudiantes con discapacidad se gestionan de formacasuística, sin estandarización.
- El registro y seguimiento de estas acciones es precario o inexistente.
- El tiempo docente es limitado; cualquier solución debe ser inmediata y sin curva de aprendizaje.

**El Planificador Inclusivo UIE resuelve todo esto en una sola pantalla, sin instalación, sin registro, sin costo operativo.**

### 2.2. Funcionalidades principales

| Módulo | Descripción | Impacto |
|---|---|---|
| **Checklist DUA** | 4 etapas (Exploración, Preparación, Integración, Optimización) con 25 ítems concretos. Progreso persistente en localStorage. | Estandariza la aplicación del DUA en cualquier asignatura. |
| **Adecuaciones Curriculares** | 8 perfiles de discapacidad, hasta 8 estudiantes anónimos, fusión inteligente de recomendaciones. | Reemplaza planillas manuales y correos inconsistentes. |
| **Gráfico Radar** | Visualización de barreras por estudiante en 6 dimensiones. | Permite identificar patrones y priorizar apoyos. |
| **Generación de Informes PDF** | Documento profesional con logo UIE, DUA + adecuaciones + prácticas + preguntas de mejora. | Provee respaldo formal para cada plan de apoyo. |
| **Módulos de Apoyo** | Crisis, accesibilidad digital, lectura fácil, inserción laboral, vocabulario inclusivo, referencias legales. | Expande el alcance más allá del aula. |
| **PWA / Offline** | Service Worker con caché v12. Funciona sin internet después de la primera carga. | Accesible en cualquier contexto, sin consumo de datos. |
| **Modo Oscuro / Responsive** | Adaptación a preferencia del usuario, 3 breakpoints, menú hamburguesa. | Usable en computador, tablet o teléfono. |

---

## 3. Desglose de Horas de Desarrollo

### 3.1. Metodología de estimación

Se utilizó el método de **estimación por entregables** (similar a COCOMO II para proyectos pequeños), considerando:

- **Valor/hora sugerido para desarrollador full-stack senior en Chile:** $12.000 – $18.000 CLP
- **Valor/hora para profesional con especialización en accesibilidad e inclusión:** $18.000 – $25.000 CLP

### 3.2. Desglose detallado

| Fase | Actividad | Horas | Valor estimado ($15.000/hr) |
|---|---|---|---|
| **Investigación** | Estudio de DUA (CAST), normativa chilena (Ley 20.422, Decreto 83, Ley 21.369, Decreto 170), perfiles de discapacidad, buenas prácticas en educación superior inclusiva | 20 | $300.000 |
| **Diseño UX/UI** | Arquitectura de información, wireframes, diseño responsive, paleta de colores accesible, modo oscuro, diseño del sistema de componentes | 15 | $225.000 |
| **Desarrollo Frontend** | 8 módulos JS (IIFE), 2.384 líneas CSS, 650 líneas HTML, navegación SPA por hash, tabs DUA con teclado, gráfico radar Canvas | 50 | $750.000 |
| **PWA / Service Worker** | Estrategia de caché network-first, versionamiento (v12), precarga de assets, Google Fonts, pdfmake CDN | 5 | $75.000 |
| **Generación PDF** | Integración con pdfmake, diseño de template profesional con logo, maquetación de 3 variantes de informe, lazy loading | 10 | $150.000 |
| **Accesibilidad** | Roles ARIA, focus-visible, prefers-reduced-motion, contraste WCAG, navegación por teclado, lectores de pantalla | 10 | $150.000 |
| **Pruebas** | Pruebas manuales en Chrome, Firefox, Edge, responsive mobile/tablet/desktop, validación de persistencia, caso borde (0 estudiantes, todos los perfiles, etc.) | 8 | $120.000 |
| **Documentación** | README, prompt para Gem (Adaptador Técnico), ejemplo de lectura fácil matemática, script generador de formularios de retroalimentación | 5 | $75.000 |
| **Despliegue** | GitHub Pages, configuración de dominio, certificación HTTPS, pruebas post-despliegue | 3 | $45.000 |
| **Gestión y coordinación** | Commits (47), control de versiones, resolución de incidencias, reversiones experimentales | 4 | $60.000 |
| **Totales** | | **130 horas** | **$1.950.000 CLP** |

### 3.3. Valor por hora de mantención y soporte

| Servicio | Horas/mes | Valor mensual |
|---|---|---|
| Hosting (GitHub Pages — sin costo) | — | $0 |
| Actualizaciones normativas (leyes, decretos, perfiles) | 4 | $60.000 |
| Corrección de errores y parches de seguridad | 2 | $30.000 |
| Soporte a docentes (vía correo o reunión) | 2 | $30.000 |
| Mejoras continuas según feedback | 4 | $60.000 |
| **Total mantención mensual** | **12 hrs/mes** | **$180.000 CLP/mes** |

---

## 4. Complejidad Técnica

### 4.1. Arquitectura

- **Sin frameworks:** cero dependencias externas (excepto pdfmake, lazy-loaded). No hay riesgo de breaking changes por actualizaciones de terceros.
- **8 módulos IIFE:** encapsulamiento con namespacing (`window.UiePlanner*`), patrón de módulo revelador.
- **SPA con hash routing:** sin servidor, sin configuración de rutas, funcionando en GitHub Pages sin backend.
- **~4.700 líneas de código fuente** (excluyendo assets y documentación).

### 4.2. Decisiones técnicas relevantes

| Decisión | Justificación |
|---|---|
| **Vanilla JS** | Cero dependencias, sin bundler, sin npm. El proyecto no envejece por obsolescencia de frameworks. |
| **localStorage** | Persistencia del checklist DUA y tema sin backend ni autenticación. |
| **pdfmake lazy-loaded** | El paquete (~200 KB) solo se carga cuando el usuario genera un informe. |
| **Canvas para radar** | Visualización liviana sin bibliotecas de gráficos (Chart.js, D3, etc.). |
| **Service Worker propio** | Sin Workbox ni abstracciones. Control fino de la estrategia de caché. |
| **Sin base de datos** | Sin backend, sin servidor, sin costos recurrentes de infraestructura. |

### 4.3. Facilidad de mantención

- Código estructurado, comentado, con nomenclatura consistente.
- Commits con conventional commits (`feat:`, `fix:`, `perf:`, `refactor:`).
- Historial de 47 commits que documenta la evolución del proyecto.
- Sin dependencias externas que requieran actualización periódica.

---

## 5. Valor Educativo e Institucional

### 5.1. Cumplimiento normativo

| Normativa | Cómo la aborda la herramienta |
|---|---|
| **Ley 20.422** (Igualdad de Oportunidades e Inclusión Social de Personas con Discapacidad) | Provee adecuaciones curriculares concretas para 8 perfiles de discapacidad. |
| **Decreto 83** (Adecuaciones Curriculares para EE Diferencial) — aplicado a educación superior | Adapta el concepto de adecuaciones al contexto universitario con recomendaciones específicas. |
| **Ley 21.369** (Acoso sexual, violencia y discriminación de género) | Incluye módulo de crisis y bienestar con enfoque inclusivo y no discriminatorio. |
| **Estándares DUA (CAST)** | Checklist completo basado en las 3 redes (afectiva, reconocimiento, estratégica) y 4 etapas de implementación. |
| **WCAG 2.1** (Accesibilidad web) | La herramienta misma es accesible (roles ARIA, focus-visible, contraste, teclado). |
| **UNE 153101:2018 EX** (Lectura Fácil) | Módulo de lectura fácil con lineamientos y ejemplo concreto. |

### 5.2. Beneficios para Duoc UC

1. **Estandarización:** Todos los docentes aplican el mismo marco DUA con los mismos criterios.
2. **Trazabilidad:** Cada plan de apoyo genera un PDF descargable con respaldo institucional.
3. **Eficiencia:** Lo que antes tomaba horas de reuniones y planillas ahora se resuelve en minutos.
4. **Gratuidad operativa:** Sin costos de licencias de software, hosting, ni mantención de servidores.
5. **Escalabilidad:** Puede ser adoptado por todas las sedes sin restricción técnica.
6. **Imagen institucional:** Duoc UC demuestra compromiso con la inclusión con una herramienta concreta y funcional.

### 5.3. Impacto en la comunidad educativa

- **+15.000 estudiantes en situación de discapacidad** en educación superior en Chile (datos Mineduc/SIES) podrían verse beneficiados indirectamente.
- **+2.500 docentes Duoc UC** podrían usar la herramienta para planificar sus clases.
- **Reducción de barreras** al permitir que cualquier docente, sin formación previa en inclusión, pueda generar planes de apoyo pertinentes.

---

## 6. Análisis Comparativo de Mercado

### 6.1. Alternativas existentes

| Alternativa | Tipo | Ventajas | Limitaciones frente a Planificador Inclusivo |
|---|---|---|---|
| **Planillas Excel/Google Sheets** | Manual | Gratuito, flexible | Sin guía DUA, sin fusión inteligente, sin PDF, sin persistencia, propenso a errores |
| **Google Docs / Word** | Manual | Gratuito, conocido | Mismas limitaciones que Excel; requiere estructuración manual |
| **LMS (Blackboard, Canvas)** | Plataforma educativa | Integrado con el curso | No tienen módulo DUA, no generan planes de apoyo, no tienen adecuaciones por perfil |
| **BookWidgets** | Herramienta docente | Interactivo | Pago ($/año), en inglés, no alineado con normativa chilena, sin adecuaciones |
| **ClassDojo / Nearpod** | Gestión de aula | Popular en escolar | Enfocado en escolar, no en educación superior chilena, sin DUA |
| **Adaptech / WAI-Aria tools** | Evaluación de accesibilidad | Útil para revisar materiales | No planifican clases, no integran DUA con adecuaciones |
| **Desarrollo a medida por consultora** | Desarrollo externo | Personalizable | Costos de $5.000.000+ CLP solo por diagnóstico, tiempos de 3-6 meses |

### 6.2. Ventajas competitivas del Planificador Inclusivo

1. **Único en su tipo en Chile:** No existe otra herramienta gratuita, web, en español, que integre DUA + adecuaciones curriculares + PDF.
2. **Costo cero de implementación:** No requiere servidores, bases de datos, ni licencias de software adicional.
3. **Tiempo cero de adopción:** Se abre en el navegador y se usa al instante. Sin registro, sin login, sin capacitación previa.
4. **Hecho por y para Duoc UC:** Diseñado con el contexto del instituto, sus carreras T-P y su modelo educativo.
5. **Evolución continua:** Posibilidad de agregar módulos (reportes por sede, dashboard institucional, integración Blackboard).

### 6.3. Costo estimado de desarrollar una solución equivalente

| Proveedor | Costo estimado | Tiempo estimado |
|---|---|---|
| Consultora especializada (ej. Thoughtworks, Globant) | $8.000.000 – $15.000.000 CLP | 4 – 6 meses |
| Desarrollador freelance senior | $3.000.000 – $6.000.000 CLP | 2 – 3 meses |
| Equipo interno Duoc UC (2 desarrolladores) | $4.000.000 – $6.000.000 CLP (solo sueldos) | 3 – 4 meses |
| **Valor de referencia del Planificador Inclusivo (horas de desarrollo)** | **$1.950.000 CLP** | **5 días** |

---

## 7. Retorno de Inversión (ROI)

### 7.1. Ahorro en horas docentes

**Situación actual (sin herramienta):**
- Un docente que quiere planificar una clase inclusiva: 2-3 horas investigando, diseñando y documentando.
- 30 docentes × 2 asignaturas × 2 evaluaciones = 120 planeaciones al semestre.
- 120 × 2.5 horas = **300 horas docentes por semestre**.

**Con Planificador Inclusivo:**
- Misma tarea: 15-20 minutos por planificación = 0.3 horas.
- 120 × 0.3 horas = **36 horas docentes por semestre**.

**Ahorro: 264 horas docentes por semestre.**
Valor de hora docente promedio: $8.000 CLP → **$2.112.000 CLP ahorrados por semestre.**

### 7.2. Costos evitados

| Concepto | Costo evitado |
|---|---|
| Multas o sanciones por incumplimiento normativo de inclusión | Sin cuantificar, pero potencialmente alto |
| Consultoría externa para implementar DUA | $3.000.000 – $8.000.000 CLP |
| Desarrollo externo de herramienta similar | $3.000.000 – $15.000.000 CLP |
| Capacitaciones a docentes en DUA (presencial) | $500.000 – $1.000.000 CLP por sesión |
| **Total costos evitados (estimado)** | **$6.500.000 – $24.000.000 CLP** |

---

## 8. Recomendación de Valorización

### 8.1. Escenarios de licenciamiento

| Escenario | Descripción | Valor sugerido | Ideal para |
|---|---|---|---|
| **A: Cesión gratuita + honorarios por implementación** | Se entrega el código sin costo. Se cobra por capacitación, instalación y soporte inicial. | $800.000 – $1.200.000 CLP (honorarios) | Relación estratégica; currículum; futuros proyectos |
| **B: Licencia única institucional** | Pago único por el software completo con derecho a uso en todas las sedes. | $1.500.000 – $3.000.000 CLP | Recuperar inversión de desarrollo |
| **C: Licencia + mantención anual** | Licencia inicial + contrato de mantención y soporte por 12 meses. | $1.500.000 (licencia) + $180.000/mes × 12 = $3.660.000 CLP primer año | Ingreso recurrente a largo plazo |
| **D: Desarrollo por hora + royalty** | Pago por las 130 horas de desarrollo + porcentaje del ahorro generado. | $1.950.000 (130h) + 10% ahorro estimado | Modelo mixto, menor riesgo para la institución |

### 8.2. Recomendación del autor

Se recomienda el **Escenario C (Licencia + Mantención Anual)** como punto de partida para la negociación, con disposición a aceptar el **Escenario B (Licencia Única)** como alternativa realista. El Escenario A (cesión gratuita) puede considerarse si el objetivo principal es posicionamiento profesional y futuros proyectos dentro de la institución.

---

## 9. Referencias

- CAST (2018). Universal Design for Learning Guidelines version 2.2. http://udlguidelines.cast.org
- Ministerio de Educación de Chile. Ley 20.422 (2010). Establece normas sobre igualdad de oportunidades e inclusión social de personas con discapacidad.
- Ministerio de Educación de Chile. Decreto 83 (2015). Aprueba criterios y orientaciones de adecuación curricular.
- Ministerio de Educación de Chile. Ley 21.369 (2021). Regula el acoso sexual, la violencia y la discriminación de género en educación superior.
- W3C/WAI. Web Content Accessibility Guidelines (WCAG) 2.1. https://www.w3.org/TR/WCAG21/
- UNE 153101:2018 EX. Lectura Fácil. Pautas y recomendaciones para la elaboración de documentos.
- Duoc UC. Modelo Educativo. https://www.duoc.cl/institucional/modelo-educativo/
- Servicio de Información de Educación Superior (SIES). Estadísticas de educación superior 2024.

---

*Documento generado el [fecha]. Los valores son referenciales y están expresados en pesos chilenos (CLP). Los montos pueden variar según negociación directa con la institución.*
