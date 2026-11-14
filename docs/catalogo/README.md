# Catálogo de apoyos por barrera (borrador)

Primera clasificación automática de los 166 apoyos actuales (148 del catálogo por condición y 28 reglas de la matriz CIF, sin duplicados) según el nuevo modelo:

| Campo | Valores |
| --- | --- |
| Actividad con barrera | Las 11 actividades de la matriz CIF de psicopedagogía (PAEDIS) |
| Origen de la barrera | visual, auditivo, motor, sensorial, cognitivo, social, regulacion, salud |
| Tipo de ajuste | presentacion, respuesta, entorno, tiempo |
| Modalidad | teorica, practica, profesional, online |
| Momento | clase, evaluacion, fuera |
| Etiquetas | tecnologia, apoyo_humano, coordinacion, canal_lsch, canal_braille, canal_guia_interprete |

Todos los apoyos quedan en estado `pendiente` hasta que el equipo de asesores los revise en la planilla «Revisión del catálogo de apoyos por barrera». `migrar.js` regenera el borrador desde `data.js` (`node migrar.js`).

`apoyos-nuevos.json` agrega 34 apoyos propuestos por la UIE para los vacíos de cobertura (práctica profesional, aula virtual, trabajo en grupo, prácticas en terreno y ramos prácticos), cada uno con su fuente, «qué no cambia» y «cuándo no aplica». También asigna las actividades nuevas a 11 apoyos existentes. `migrar.js` los incorpora al borrador (ap167 a ap200). Tres apoyos llevan la fuente «Propuesta UIE sin fuente específica»: requieren validación del equipo.

Actividades nuevas, además de las 11 de la matriz: `grupo` (Trabajo en grupo), `ava` (Aula virtual AVA) y `terreno` (Prácticas en terreno).

Vacíos que siguen: «Hablar» y «Participar en la sala de clases» no tienen apoyos para práctica profesional, y la práctica profesional comparte pocos apoyos con el resto del catálogo. El equipo puede marcar qué apoyos generales también sirven en práctica profesional.
