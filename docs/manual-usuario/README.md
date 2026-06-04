# Manual de usuario — Planificador Inclusivo UIE

Herramienta web de apoyo docente para diseñar clases inclusivas usando DUA y el modelo CIF/OMS.

**Acceso:** https://jonathanprz.github.io/planificador-clases-inclusivas/

---

## 1. Introducción

El Planificador Inclusivo UIE es una herramienta web gratuita que ayuda a docentes de Duoc UC a:

- Diseñar una **base DUA** para toda la clase
- Definir **adecuaciones curriculares de acceso** para estudiantes con discapacidad o necesidades específicas
- **Priorizar apoyos** según el nivel de barrera identificado
- **Generar reportes PDF** con el plan de apoyo por estudiante

> **Importante:** Esta herramienta no reemplaza diagnósticos ni evaluaciones formales. Es una guía para la toma de decisiones pedagógicas.

---

## 2. Navegación general

La aplicación tiene 4 vistas principales, accesibles desde el menú superior:

| Vista | Ícono | Propósito |
|---|---|---|
| Inicio | 🏠 | Introducción y resumen de la herramienta |
| DUA | 📋 | Checklist de diseño universal para la clase |
| Adecuaciones | 🛠️ | Recomendaciones por condición + matriz CIF |
| Adicionales | 📚 | Guías complementarias (crisis, accesibilidad, etc.) |

Cada vista se organiza en paneles y tabs para facilitar la navegación.

---

## 3. Paso 1: DUA — Base para toda la clase

La pestaña "DUA" permite definir estrategias de Diseño Universal que aplicarán a todos los estudiantes del curso.

### Cómo usar:

1. Ir a la vista **DUA**
2. Revisar las 3 etapas:
   - **Motivación** — ¿cómo involucrar a los estudiantes?
   - **Representación** — ¿cómo presentar la información?
   - **Acción y expresión** — ¿cómo demostrar lo aprendido?
3. Marcar las estrategias que aplicarán en la clase
4. Las selecciones quedan registradas y se incluyen en el PDF

---

## 4. Paso 2: Adecuaciones por condición

Esta es la funcionalidad principal. Permite obtener recomendaciones personalizadas según la condición del estudiante.

### 4.1 Consultor por condición

1. Ir a la vista **Adecuaciones**
2. En la pestaña **"Apoyos (por condición)"**, seleccionar las condiciones del estudiante
3. El sistema mostrará recomendaciones clasificadas en 6 dimensiones:

| Dimensión | Ejemplos |
|---|---|
| Contexto aula | Ubicación, ruido, iluminación |
| Materiales de estudio | Textos accesibles, formatos alternativos |
| Métodos de enseñanza | Instrucciones claras, ritmo |
| Interacción en aula | Participación, trabajo grupal |
| Evaluaciones | Formatos, tiempo, retroalimentación |
| Tecnologías asistivas | Lector de pantalla, magnificador |

4. Cada recomendación tiene un badge de prioridad:

| Badge | Significado |
|---|---|
| ⚪ Sin ajuste | No se requiere ajuste |
| 🟢 Menor | Observar y ajustar si es necesario |
| 🟡 Moderado | Implementar apoyo sugerido |
| 🔴 Prioritario | Intervenir con ajuste significativo |

### 4.2 Matriz CIF/OMS (opcional)

Para un ajuste más preciso, se puede completar la **Matriz de Acceso CIF**:

1. Hacer clic en **"Ajustar perfil con matriz CIF"** dentro de la tarjeta del estudiante
2. Completar la rúbrica de 11 actividades, puntuando de 1 a 4:

| Puntaje | Significado |
|---|---|
| 4 | Participa sin ajustes |
| 3 | Observar |
| 2 | Requiere apoyo |
| 1 | No participa sin apoyo |

3. El sistema calcula automáticamente la severidad invertida (4→0, 1→3+)
4. Las recomendaciones se ajustan según los puntajes ingresados

#### Botones de la matriz:

| Botón | Acción |
|---|---|
| **Limpiar matriz** | Borra todos los puntajes y vuelve al perfil por condición |
| **Ocultar matriz** | Cierra la sección sin perder datos ingresados |

### 4.3 Múltiples estudiantes

Se pueden agregar varios estudiantes usando el botón **"+ Agregar estudiante"**. Cada uno tiene su propia tarjeta con:

- Nombre del estudiante (opcional)
- Selección de condición
- Matriz CIF independiente
- Checkbox **"Mostrar en gráfico"** para incluirlo en el radar comparativo

---

## 5. Radar comparativo

El radar CIF muestra una comparación visual entre estudiantes, indicando el nivel de apoyo requerido por actividad:

- Cada estudiante es un polígono de color distinto
- El centro del radar = sin ajuste
- El borde exterior = ajuste prioritario
- Se puede ocultar/mostrar estudiantes con el ícono 👁 en la leyenda

### Leyenda del radar:

- Niveles: 0 Sin ajuste · 1 Menor · 2 Moderado · 3 Prioritario
- Leyenda interactiva: haz clic en el ojo de un estudiante para ocultarlo/mostrarlo

---

## 6. Reportes

### 6.1 Plan de apoyo PDF

Desde el modal **"Plan"** (en la vista Adecuaciones), se puede generar un PDF completo que incluye:

1. DUA base seleccionado
2. Buenas prácticas generales
3. Radar de ajustes CIF
4. Recomendaciones detalladas por estudiante
5. Comentarios del asesor

Opciones al generar:
- **Incluir DUA** — agrega la sección de diseño universal
- **Incluir gráficos** — agrega el radar de ajustes

### 6.2 Reporte completo

Desde la vista **Reportes**, se genera un PDF más completo que incluye adicionalmente el seguimiento y mejora.

---

## 7. Apoyos complementarios

La vista **Adicionales** contiene guías y recursos sobre:

| Sección | Contenido |
|---|---|
| Crisis | Protocolo frente a crisis de estudiantes |
| Accesibilidad digital | Pautas WCAG, herramientas |
| Lectura fácil | Adaptación de textos |
| Laboral | Inserción laboral inclusiva |
| Lenguaje | Vocabulario inclusivo |
| Referencias | Documentos institucionales y legales |

---

## 8. Preguntas frecuentes

**¿Necesito instalar algo?**
No. La herramienta funciona completamente en el navegador.

**¿Los datos se guardan en algún servidor?**
No. Todo el procesamiento es local en tu navegador. No se envía información a ningún servidor.

**¿Puedo usar la herramienta sin conexión?**
Sí, si ya has cargado la página antes, el Service Worker permite el funcionamiento offline parcial.

**¿La matriz CIF es obligatoria?**
No. Puedes obtener recomendaciones solo seleccionando la condición del estudiante. La matriz es un complemento opcional para mayor precisión.

---

## 9. Glosario

| Término | Definición |
|---|---|
| **DUA** | Diseño Universal para el Aprendizaje. Marco que propone anticipar barreras diversificando la enseñanza. |
| **CIF** | Clasificación Internacional del Funcionamiento, de la Discapacidad y de la Salud (OMS). |
| **ACA** | Adecuación Curricular de Acceso. Ajuste que elimina barreras sin modificar objetivos de aprendizaje. |
| **Barrera** | Factor del entorno que dificulta la participación en igualdad de condiciones. |
| **Ajuste razonable** | Modificación necesaria y adecuada para garantizar la participación. |
| **Matriz de acceso** | Rúbrica que mide compatibilidad entre el estudiante y las actividades académicas. |
