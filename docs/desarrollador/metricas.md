# Métricas De Uso

Este módulo registra métricas anónimas para conocer adopción y uso general del Planificador Inclusivo UIE durante la etapa piloto.

## Qué Se Usa

- Microsoft Clarity: comportamiento general de uso, secciones visitadas, clics, scroll, mapas de calor y grabaciones anonimizadas.
- Supabase: contador visible de visitas y corazones en la página.
- Power BI: opcional para un tablero institucional, leyendo una fuente de datos como Supabase, Dataverse, SharePoint List o Azure.

Power BI no reemplaza al tracker web. Sirve para visualizar datos cuando ya existe una fuente que los captura.

## Qué Se Muestra En La Web

- Visitas: una visita por sesión de navegador.
- Corazones: un “me gusta” por navegador, usando `localStorage`.

Estos datos se leen desde Supabase mediante funciones públicas controladas. No se guarda nombre, RUT, carrera, sección ni texto escrito por el usuario.

## Qué Se Envía A Microsoft Clarity

Clarity se usa solo cuando `clarityProjectId` tiene un ID real. Con el placeholder actual no se envía nada.

Eventos personalizados previstos:

- `section_view`: cambio de sección principal.
- `section_time`: permanencia aproximada en una sección antes de navegar, cerrar o cambiar de pestaña.
- `feedback_form_opened`: apertura del formulario de retroalimentación.
- `site_heart_given`: corazón marcado.
- `theme_changed`: cambio entre modo claro y oscuro.
- `support_student_added`: se agrega una tarjeta de estudiante.
- `editing_mode_changed`: se activa o desactiva edición de recomendaciones.
- `matrix_cif_applied`: se aplica matriz CIF.
- `matrix_cif_cleared`: se limpia matriz CIF.
- `support_plan_chart_include_enabled`: se decide incluir gráfico en PDF.
- `support_plan_chart_include_blocked`: se intenta incluir gráfico sin matriz CIF.
- `support_plan_pdf_downloaded`: descarga de PDF de apoyo.
- `support_plan_email_opened`: apertura de correo con plan.
- `dua_checklist_pdf_downloaded`: descarga del checklist DUA.

## Parámetros Permitidos

Solo se registran datos agregados o no sensibles como tags de sesión:

- cantidad de estudiantes,
- cantidad de estudiantes con matriz CIF aplicada,
- sección visitada y segundos aproximados de permanencia,
- cantidad de actividades CIF puntuadas,
- cantidad de ítems DUA seleccionados,
- si se incluyó gráfico,
- grupos amplios de condición.

Los grupos amplios de condición son:

- `fisica`
- `sensorial`
- `neurodesarrollo`
- `intelectual`
- `psiquica`
- `visceral`
- `otra`

## Configuración

En `index.html`, reemplazar los placeholders:

```js
window.UIE_METRICS_CONFIG = {
    clarityProjectId: 'CLARITY_PROJECT_ID',
    supabaseUrl: 'https://TU-PROYECTO.supabase.co',
    supabaseAnonKey: 'SUPABASE_ANON_KEY'
};
```

Para activar Clarity:

1. Crear un proyecto en Microsoft Clarity.
2. Copiar el Project ID.
3. Reemplazar `CLARITY_PROJECT_ID` en `index.html`.
4. Publicar la web y verificar en Clarity que llegan sesiones.

Para activar visitas y corazones:

1. Ejecutar `docs/desarrollador/metricas-supabase.sql` en Supabase.
2. Reemplazar `supabaseUrl` y `supabaseAnonKey` en `index.html`.

## Dónde Revisar

- Clarity: dashboard del proyecto, mapas de calor, grabaciones, filtros y Smart Events.
- Supabase: tabla `site_metrics`.
- Web: bloque “Etapa piloto”, donde aparecen visitas y corazones.
- Power BI: opcional, conectando a la fuente donde se almacenen los contadores o eventos agregados.

## Criterio De Privacidad

La métrica debe responder preguntas de gestión del piloto, no perfilar estudiantes. Si un dato permite identificar a una persona o reconstruir su caso, no debe enviarse.
