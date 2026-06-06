# Versión B Comercial Limpia

Esta carpeta define la ruta para crear una versión comercial del Planificador Inclusivo sin logos, referencias ni documentación institucional de Duoc UC.

## Objetivo

Crear una base independiente para ofrecer soluciones web educativas a colegios, institutos, fundaciones u otras instituciones, manteniendo trazabilidad de autoría y evitando mezclar marca, documentos o contenidos internos de Duoc UC.

## Nombre De Trabajo

**Aula Clara**

Nombre temporal para distinguir la versión comercial del prototipo institucional. Antes de publicarlo se debe revisar disponibilidad de dominio, marca y uso en redes.

## Principio De Separación

La versión B no debe ser una copia renombrada. Debe ser una adaptación limpia:

- sin logos Duoc, UIE ni Campus Arauco;
- sin referencias a documentos institucionales internos;
- sin credenciales, formularios ni métricas asociadas al prototipo;
- sin fichas reales ni ejemplos que permitan inferir datos de estudiantes;
- con fuentes públicas y correctamente citadas;
- con repositorio propio y documentación propia.

## Repositorio Sugerido

Crear un repositorio nuevo, separado del prototipo:

```text
aula-clara
```

El repo comercial debe partir desde una copia sanitizada, no desde el historial completo del repo actual, porque este historial contiene referencias, propuestas y documentación vinculada a Duoc UC.

## Artefactos De Esta Carpeta

| Archivo | Uso |
|---|---|
| `inventario-limpieza.md` | Lista de elementos que no deben pasar a la versión comercial |
| `fuentes-publicas.md` | Fuentes públicas sugeridas para reconstruir contenido editorial |
| `ruta-fork-limpio.md` | Secuencia para crear el repositorio comercial separado |
| `ficha-producto.md` | Descripción inicial del producto comercial |

## Regla De Oro

Si un texto, imagen, documento, métrica, enlace o flujo solo tiene sentido dentro de Duoc UC, no debe pasar a la versión B.
