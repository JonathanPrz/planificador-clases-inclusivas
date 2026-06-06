# Planificador Inclusivo UIE

[![Licencia](https://img.shields.io/badge/licencia-MIT-blue.svg)](LICENSE)
[![Hecho con](https://img.shields.io/badge/hecho%20con-Vanilla%20JS-f7df1e)](.)
[![Hosting](https://img.shields.io/badge/hosting-GitHub%20Pages-222222)](.)

Herramienta web para planificación inclusiva en educación superior. Genera recomendaciones de apoyo pedagógico según condiciones de estudiantes, usando DUA y matriz CIF-OMS.

**En vivo:** https://jonathanprz.github.io/planificador-clases-inclusivas/

---

## ¿Qué es?

Un punto de encuentro para comprender qué se espera del docente al aplicar DUA, definir adecuaciones curriculares de acceso y coordinar apoyos para estudiantes con discapacidad o necesidades específicas.

## Autoría del prototipo

Prototipo diseñado y desarrollado por Jonathan Pérez, Coordinación de Inclusión, Duoc UC Campus Arauco, como iniciativa de innovación pedagógica para apoyar la planificación inclusiva.

## Stack

| Tecnología | Uso |
|---|---|
| HTML5 + CSS3 | Interfaz (~4400 líneas CSS) |
| JavaScript (Vanilla) | Lógica completa (~3800 líneas en supports.js) |
| [Chart.js](https://www.chartjs.org/) | Radar chart comparativo |
| [pdfMake](https://pdfmake.org/) | Generación de PDF |
| GitHub Pages | Hosting estático |

Sin framework, sin bundler, sin backend. 100% en el navegador.

## Estructura del proyecto

```
├── index.html          ← Punto de entrada (SPA)
├── styles.css          ← Todos los estilos
├── app.js              ← Init y navegación
├── data.js             ← Datos: condiciones, matriz CIF, reglas
├── supports.js         ← Lógica principal: UI, recomendaciones, radar
├── report.js           ← Generación de PDF
├── theme.js            ← Modo oscuro/claro
├── dua.js              ← Módulo DUA
├── navigation.js       ← Navegación entre vistas
├── tabs.js             ← Tabs dentro de vistas
├── content.js          ← Contenido de apoyos adicionales
├── logos.js            ← Logos en base64
├── sw.js              ← Service Worker
└── docs/              ← Documentación completa
```

## Desarrollo local

No requiere instalación. Solo un servidor HTTP estático:

```bash
php -S localhost:8000
# o
python -m http.server 8000
# o
npx serve .
```

## Documentación

| Sección | Audiencia |
|---|---|
| [Manual de usuario](docs/manual-usuario/README.md) | Docentes |
| [Documentación técnica](docs/desarrollador/README.md) | Desarrolladores |
| [Arquitectura](docs/desarrollador/arquitectura.md) | Desarrolladores |
| [Presentación ejecutiva](docs/presentacion/index.html) | Directivos |

## Licencia

MIT © Unidad de Inclusión y Equidad — Duoc UC
