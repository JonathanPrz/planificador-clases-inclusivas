# Ruta Para Crear Un Repositorio Comercial Limpio

Esta ruta evita transformar el repositorio actual en producto comercial. El objetivo es crear una base nueva, sanitizada y sin historial institucional.

## 1. Preparar Copia De Trabajo

Crear una copia local fuera del repositorio actual:

```text
aula-clara/
```

No copiar la carpeta `.git`.

## 2. Copiar Solo Archivos Técnicos Necesarios

Copiar inicialmente:

- `index.html`
- `styles.css`
- `app.js`
- `content.js`
- `data.js`
- `dua.js`
- `metrics.js`
- `navigation.js`
- `report.js`
- `supports.js`
- `tabs.js`
- `theme.js`
- `sw.js`

No copiar inicialmente:

- `docs/propuesta/`
- `docs/guias/`
- `docs/investigacion/`
- `Logo UIE/`
- `logos.js`
- respaldos;
- fichas o ejemplos de estudiantes;
- archivos generados para negociación con Duoc UC.

## 3. Reemplazar Marca Antes De Ejecutar

Antes de publicar o compartir:

- cambiar nombre de la herramienta;
- retirar UIE/Duoc/Campus Arauco;
- reemplazar logos;
- reemplazar cabeceras de PDF;
- reemplazar footer;
- eliminar enlaces a formularios, métricas y documentos del prototipo.

## 4. Reconstruir Contenido

Revisar `data.js` y separar:

- contenido reusable redactado por el autor;
- contenido que proviene de documentación institucional;
- contenido que requiere nueva fuente pública;
- recomendaciones que deben reescribirse.

No migrar referencias `source: 'Duoc UC'` sin reemplazo.

## 5. Crear Documentación Comercial Nueva

Crear:

- `README.md` del producto comercial;
- `docs/desarrollador/README.md`;
- `docs/manual-usuario/README.md`;
- `docs/fuentes.md`;
- `docs/privacidad.md`;
- `docs/autoria.md`.

## 6. Inicializar Git Nuevo

En la carpeta comercial:

```bash
git init
git add .
git commit -m "Version comercial inicial sanitizada"
```

Luego crear repositorio remoto propio, por ejemplo:

```text
github.com/<usuario-o-empresa>/aula-clara
```

## 7. Validar Antes De Vender

Antes de ofrecer a otra institución:

- buscar `Duoc`, `UIE`, `Campus Arauco`, `Unidad de Inclusión`, `Planificador Inclusivo`;
- revisar PDF generado;
- revisar README y documentación;
- revisar metadatos HTML;
- revisar fuentes y referencias;
- verificar que no existan credenciales del prototipo;
- probar flujo completo en navegador.

## 8. Definir Licencia Comercial

No reutilizar automáticamente la licencia actual. Definir una licencia o contrato para:

- uso por institución;
- número de sedes o usuarios;
- mantenimiento;
- soporte;
- modificación;
- redistribución;
- autoría;
- confidencialidad.
