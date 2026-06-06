# Matriz De Reemplazos Para Aula Clara

Esta matriz define reemplazos mínimos para crear una primera copia técnica sanitizada de la versión comercial.

## Identidad Principal

| Elemento actual | Reemplazo comercial |
|---|---|
| Planificador Inclusivo UIE | Aula Clara |
| Herramienta de apoyo docente Duoc UC | Herramienta web para apoyo docente inclusivo |
| Unidad de Inclusión Educativa | Aula Clara |
| Unidad de Inclusión y Equidad | Aula Clara |
| Equipo de Inclusión Académica · Duoc UC Campus Arauco | Equipo Aula Clara |
| Duoc UC Campus Arauco | Aula Clara |
| Duoc UC | institución educativa |
| UIE | Aula Clara |

## Metadatos HTML

| Ubicación | Acción |
|---|---|
| `<title>` | Usar `Aula Clara - Apoyo docente inclusivo` |
| `meta description` | Redactar descripción genérica sin Duoc ni UIE |
| `theme-color` | Puede mantenerse si no remite a marca institucional |
| `brand-logo-light` / `brand-logo-dark` | Reemplazar por marca textual temporal o nuevo logo propio |

## Footer Visible

Texto recomendado para versión inicial:

```text
Aula Clara
Herramienta web para orientar apoyos docentes, accesibilidad y planificación inclusiva.

Versión comercial derivada del prototipo original creado por Jonathan Pérez.
Fuentes públicas y referencias: sección Recursos / Referencias.
```

## Reportes PDF

| Elemento actual | Reemplazo |
|---|---|
| Logo UIE | Sin logo o logo Aula Clara |
| Unidad de Inclusión Educativa | Aula Clara |
| Equipo de Inclusión Académica · Duoc UC Campus Arauco | Documento de apoyo docente |
| Documento generado desde el Planificador Inclusivo UIE | Documento generado desde Aula Clara |
| documentación institucional | fuentes públicas citadas |

## Métricas Y Formularios

| Elemento actual | Acción |
|---|---|
| `clarityProjectId: 'x2en890zie'` | Reemplazar por `CLARITY_PROJECT_ID` |
| Supabase URL actual | Reemplazar por placeholder |
| Supabase anon key actual | Reemplazar por placeholder |
| Microsoft Forms actual | Reemplazar por `#` o formulario comercial propio |

## Referencias Y Recursos

No reemplazar mecánicamente referencias de Duoc por texto genérico si el contenido proviene de un documento institucional. En esos casos:

1. retirar la referencia;
2. revisar si existe fuente pública equivalente;
3. reescribir la recomendación con lenguaje propio;
4. citar la fuente pública en documentación.

## Documentación

| Documento actual | Acción |
|---|---|
| `docs/propuesta/*` | No copiar |
| `docs/guias/*` | No copiar sin autorización |
| `docs/investigacion/*` | No copiar sin autorización |
| `docs/manual-usuario/README.md` | Reescribir como manual comercial |
| `docs/desarrollador/*` | Reescribir sin referencias institucionales |

## Validación Posterior

La copia comercial debe pasar búsquedas sin resultados problemáticos en archivos públicos:

```text
Duoc
UIE
Campus Arauco
Unidad de Inclusión
Planificador Inclusivo
x2en890zie
xgcmudquxxdrgpjrqslc
forms.cloud.microsoft/r/9RwvPGcZME
LOGO_UIE
```
