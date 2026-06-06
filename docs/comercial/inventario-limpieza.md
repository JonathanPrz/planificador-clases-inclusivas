# Inventario De Limpieza Para Versión Comercial

Este inventario identifica elementos del prototipo actual que no deben migrar directamente a una versión comercial.

## Marca E Identidad

Retirar o reemplazar:

- `Planificador Inclusivo UIE`
- `Unidad de Inclusión Educativa`
- `Unidad de Inclusión y Equidad`
- `Duoc UC`
- `Campus Arauco`
- logos UIE en `logos.js`
- carpeta `Logo UIE/`
- textos de footer con autoría vinculada a Duoc UC
- metadatos o títulos que mencionen Duoc UC

Reemplazar por:

- nombre comercial propio;
- identidad visual neutra o propia;
- créditos de autoría del producto comercial;
- texto de alcance no institucional.

## Contenido Y Fuentes Institucionales

No migrar sin revisión:

- guías Duoc UC en `docs/guias/`;
- referencias con `source: 'Duoc UC'` en `data.js`;
- casos DUA con fuente “Experiencia DUA en Duoc UC”;
- textos que indiquen “Ruta recomendada · Duoc UC” o equivalentes;
- documentos de propuesta dirigidos a Duoc UC;
- ejemplos de fichas o estudiantes de contexto institucional.

Reemplazar por:

- fuentes públicas;
- ejemplos ficticios;
- redacción propia;
- referencias normativas o técnicas abiertas.

## Métricas Y Formularios

No migrar:

- `clarityProjectId` del prototipo;
- URL y anon key de Supabase del prototipo;
- link de Microsoft Forms actual;
- nombres de eventos o etiquetas que tengan contexto UIE si no aplican al producto.

Reemplazar por:

- Clarity o analítica del producto comercial;
- base de datos propia si se mantiene contador visible;
- formulario comercial propio;
- política de privacidad propia.

## PDF Y Reportes

Retirar o reemplazar:

- encabezados “Unidad de Inclusión Educativa”;
- “Equipo de Inclusión Académica · Duoc UC Campus Arauco”;
- logo UIE;
- footer “Documento generado desde el Planificador Inclusivo UIE”;
- menciones a documentación institucional.

Reemplazar por:

- nombre del producto comercial;
- logo propio o texto neutro;
- pie de página con alcance orientativo;
- fuentes públicas citadas.

## Documentación

No migrar al repo comercial:

- `docs/propuesta/*` dirigido a Duoc UC;
- ficha técnica de autoría del prototipo Duoc;
- presentaciones con “Para Duoc UC”;
- informes con valoración, ROI o argumentos específicos para Duoc;
- historial Git completo del prototipo si contiene documentación institucional.

Crear documentación nueva:

- README comercial;
- manual de usuario genérico;
- arquitectura técnica genérica;
- ficha de producto;
- términos de uso y privacidad preliminares.

## Código Reutilizable Con Revisión

Puede reutilizarse si se limpia contexto:

- estructura SPA HTML/CSS/JS;
- motor de recomendaciones, si se desacopla de fuentes institucionales;
- generación PDF, con plantilla neutra;
- matriz CIF, con fuentes públicas;
- sistema de métricas, con credenciales nuevas;
- modo claro/oscuro;
- componentes de UI.

## Riesgos A Evitar

- vender a otra institución una copia con marca Duoc;
- usar documentos institucionales como catálogo comercial;
- conservar credenciales del prototipo;
- mantener referencias a estudiantes reales o fichas originales;
- presentar el producto como institucional si será comercial;
- mezclar mantenimiento Duoc con desarrollo comercial.
