(function () {
const referencesData = [
    { code: 'AUT', title: 'Orientaciones docentes para estudiantes del espectro autista', source: 'Duoc UC', url: 'docs/guias/Guia%20Orientaciones%20Autismo%20v2024.pdf', year: 2024, type: 'guide', authors: 'Duoc UC' },
    { code: 'DUA 3.0', title: 'Universal Design for Learning Guidelines version 3.0', source: 'CAST', url: 'https://udlguidelines.cast.org/', year: 2024, type: 'web', authors: 'CAST' },
    { code: 'ORG', title: 'Directrices del Diseño Universal para el Aprendizaje, versión 3.0 [organizador gráfico]', source: 'CAST', url: 'https://udlguidelines.cast.org/static/udlg3-graphicorganizer-digital-numbers-a11y-spanish-latin-america.pdf', year: 2024, type: 'pdf', authors: 'CAST' },
    { code: 'LEY 21.790', title: 'Ley 21.790: protege los derechos de estudiantes cuidadores de la educación superior, promoviendo la corresponsabilidad y asegurando la conciliación entre actividades familiares, académicas y formativas', source: 'Chile', url: 'https://www.bcn.cl/leychile/navegar?idLey=21790', year: 2026, type: 'law', authors: 'Congreso Nacional de Chile' },
    { code: 'LEY 21.719', title: 'Ley 21.719: regula la protección y el tratamiento de los datos personales y crea la Agencia de Protección de Datos Personales', source: 'Chile', url: 'https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf', year: 2024, type: 'law', authors: 'Ministerio Secretaría General de la Presidencia, Chile' },
    { code: 'LEY 21.690', title: 'Ley 21.690: introduce modificaciones al Código del Trabajo y otros cuerpos legales en materia de inclusión laboral de personas con discapacidad y asignatarias de pensión de invalidez', source: 'Chile', url: 'https://www.bcn.cl/leychile/navegar?idNorma=1206100', year: 2024, type: 'law', authors: 'Ministerio de Desarrollo Social y Familia, Chile' },
    { code: 'DUA Duoc', title: 'Experiencia DUA en Duoc UC', source: 'Duoc UC', url: 'docs/investigacion/Experiencia%20DUA.pdf', year: 2025, type: 'report', authors: 'Duoc UC' },
    { code: 'ADE', title: 'Guía de Adecuaciones Curriculares de Acceso', source: 'Duoc UC', url: 'docs/guias/Gu%C3%ADa%20Adecuaciones%20Curriculares%20de%20Acceso.pdf', year: 2025, type: 'guide', authors: 'Duoc UC' },
    { code: 'ACC', title: 'Guía de Introducción a la Accesibilidad Digital', source: 'Duoc UC', url: 'docs/guias/Gu%C3%ADa%20de%20Introducci%C3%B3n%20a%20la%20Accesibilidad%20Digital.pdf', year: 2025, type: 'guide', authors: 'Duoc UC' },
    { code: 'VOC', title: 'Orientaciones para un vocabulario inclusivo', source: 'Duoc UC', url: 'docs/guias/Orientaciones%20Vocabulario%20Inclusivo.pdf', year: 2025, type: 'guide', authors: 'Duoc UC' },
    { code: 'PRÁCTICA', title: 'De la formación a la práctica: cuadernillo de apoyo', source: 'Duoc UC', url: 'docs/guias/Cuadernillo%20de%20la%20Formaci%C3%B3n%20a%20la%20Pr%C3%A1ctica.pdf', year: 2025, type: 'guide', authors: 'Duoc UC' },
    { code: 'WCAG', title: 'Web Content Accessibility Guidelines (WCAG) 2.2', source: 'W3C', url: 'https://www.w3.org/TR/WCAG22/', year: 2023, type: 'web', authors: 'W3C' },
    { code: 'LEY TEA', title: 'Ley 21.545: establece la promoción de la inclusión, la atención integral y la protección de los derechos de las personas con trastorno del espectro autista en el ámbito social, de salud y educación', source: 'Chile', url: 'https://www.bcn.cl/leychile/navegar?idNorma=1190123', year: 2023, type: 'law', authors: 'Ministerio de Desarrollo Social y Familia, Chile' },
    { code: 'UNE LF', title: 'UNE 153101:2018 EX. Lectura Fácil. Pautas y recomendaciones para la elaboración de documentos', source: 'AENOR', url: 'https://tienda.aenor.com/p/norma-une-153101-2018-ex-n0060036', year: 2018, type: 'standard', authors: 'AENOR' },
    { code: 'VALIDACIÓN LF', title: 'UNE 153102:2018 EX. Guía en Lectura Fácil para validadores de documentos', source: 'AENOR', url: 'https://tienda.aenor.com/p/norma-une-153102-2018-ex-n0061282', year: 2018, type: 'standard', authors: 'AENOR' },
    { code: 'LEY 21.403', title: 'Ley 21.403: reconoce la sordoceguera como discapacidad única y promueve la plena inclusión social de las personas sordociegas', source: 'Chile', url: 'https://www.bcn.cl/leychile/navegar?idNorma=1170743', year: 2022, type: 'law', authors: 'Ministerio de Desarrollo Social y Familia, Chile' },
    { code: 'LEY 21.303', title: 'Ley 21.303: modifica la Ley 20.422 para promover el uso de la lengua de señas', source: 'Chile', url: 'https://bcn.cl/2nbuh', year: 2021, type: 'law', authors: 'Ministerio de Desarrollo Social y Familia, Chile' },
    { code: 'LEY 21.091', title: 'Ley 21.091: sobre educación superior', source: 'Chile', url: 'https://www.diariooficial.interior.gob.cl/publicaciones/2018/05/29/42068/01/1404565.pdf', year: 2018, type: 'law', authors: 'Ministerio de Educación, Chile' },
    { code: 'LEY 21.015', title: 'Ley 21.015: incentiva la inclusión de personas con discapacidad al mundo laboral', source: 'Chile', url: 'https://www.bcn.cl/leychile/navegar?idNorma=1103997', year: 2017, type: 'law', authors: 'Ministerio de Desarrollo Social, Chile' },
    { code: 'CIF MANUAL', title: 'How to use the ICF: A Practical Manual for using the International Classification of Functioning, Disability and Health', source: 'WHO', url: 'https://www.who.int/publications/m/item/how-to-use-the-icf---a-practical-manual-for-using-the-international-classification-of-functioning-disability-and-health', year: 2013, type: 'manual', authors: 'World Health Organization' },
    { code: 'CIF BAS', title: 'Towards a Common Language for Functioning, Disability and Health: ICF (Beginner\'s Guide)', source: 'WHO', url: 'https://www.who.int/publications/m/item/icf-beginner-s-guide-towards-a-common-language-for-functioning-disability-and-health', year: 2002, type: 'guide', authors: 'World Health Organization' },
    { code: 'LEY 20.609', title: 'Ley 20.609: establece medidas contra la discriminación', source: 'Chile', url: 'https://www.bcn.cl/leychile/navegar?idNorma=1042092', year: 2012, type: 'law', authors: 'Congreso Nacional de Chile' },
    { code: 'LEY 20.422', title: 'Ley 20.422: establece normas sobre igualdad de oportunidades e inclusión social de personas con discapacidad', source: 'Chile', url: 'https://www.bcn.cl/leychile/navegar?idNorma=1010903', year: 2010, type: 'law', authors: 'Ministerio de Planificación, Chile' },
    { code: 'CDPD', title: 'Decreto 201: promulga la Convención de las Naciones Unidas sobre los derechos de las personas con discapacidad y su protocolo facultativo', source: 'Chile', url: 'https://www.bcn.cl/leychile/navegar?idNorma=278018', year: 2008, type: 'law', authors: 'Ministerio de Relaciones Exteriores, Chile' },
    { code: 'CIF OMS', title: 'International Classification of Functioning, Disability and Health (ICF)', source: 'WHO', url: 'https://www.who.int/standards/classifications/international-classification-of-functioning-disability-and-health', year: 2001, type: 'web', authors: 'World Health Organization' },
    { code: 'DEC', title: 'Orientaciones para la elaboración del protocolo de respuesta a situaciones de desregulación emocional y conductual de estudiantes en establecimientos educacionales', source: 'Chile', url: 'https://especial.mineduc.cl/wp-content/uploads/sites/31/2022/09/PROTOCOLO-DEC-2022.pdf', year: 2022, type: 'guide', authors: 'Ministerio de Educación, Chile' },
    { code: 'LF EUROPA', title: 'Information for all: European standards for making information easy to read and understand', source: 'Inclusion Europe', url: 'https://www.inclusion-europe.eu/easy-to-read-standards-guidelines/', year: 2009, type: 'standard', authors: 'Inclusion Europe' },
    { code: 'WAI REDACCIÓN', title: 'Writing for Web Accessibility: tips for getting started', source: 'W3C', url: 'https://www.w3.org/WAI/tips/writing/', year: 2024, type: 'web', authors: 'W3C Web Accessibility Initiative' },
    { code: 'CONVULSIÓN', title: 'Primeros auxilios de crisis epilépticas: cómo ayudar a alguien que está teniendo una crisis', source: 'Epilepsy Foundation', url: 'https://www.epilepsy.com/primerosauxilios', year: 2020, type: 'infographic', authors: 'Epilepsy Foundation of America' },
    { code: 'LEY FÁCIL 21.790', title: 'Ley Fácil: estudiantes cuidadores', source: 'Chile', url: 'https://www.bcn.cl/portal/leyfacil/recurso/estudiantes-cuidadores', year: 2026, type: 'web', authors: 'Biblioteca del Congreso Nacional de Chile' },
    { code: 'REQUISITOS-INHERENTES', title: 'Declaraciones de requisitos inherentes y ajustes razonables (QUT, UTS, Western Sydney University), bajo Disability Standards for Education 2005', source: 'Catálogo de apoyos', url: 'https://www.qut.edu.au/study/applying/clinical-exercise-physiology-inherent-requirements', year: 2005, type: 'web' },
    { code: 'ADCET-PRACTICAS', title: 'ADCET, Fieldwork, Work Placements, Excursions and Practicums', source: 'Catálogo de apoyos', url: 'https://adcet.edu.au/inclusive-teaching/teaching-assessment/fieldwork-and-placement', year: null, type: 'web' },
    { code: 'LEEDS-PASAPORTE', title: 'University of Leeds (2024), Guidance for clinical placements on reasonable adjustments and Health Passports', source: 'Catálogo de apoyos', url: 'https://placements.leeds.ac.uk/wp-content/uploads/sites/58/2024/09/Guidance-for-clinical-placements-on-reasonable-adjustments-and-Health-Passports-1.pdf', year: 2024, type: 'pdf' },
    { code: 'SHERIDAN-AUTISMO', title: 'Sheridan College (2021), Strategies to Support Students with Autism (aprendizaje integrado al trabajo)', source: 'Catálogo de apoyos', url: 'https://core.ac.uk/download/428272549.pdf', year: 2021, type: 'pdf' },
    { code: 'STURGESS-GRUPO', title: 'Sturgess (2020), University of Leicester, principios de buena práctica para el trabajo con pares de estudiantes autistas (AHEAD Journal)', source: 'Catálogo de apoyos', url: 'https://www.ahead.ie/journal/The-development-of-good-practice-principles-for-supporting-students-with-autism-to-work-with-their-peers', year: 2020, type: 'web' },
    { code: 'FABRI-AUTISMUNI', title: 'Fabri, proyecto Autism&Uni, recomendaciones para docentes universitarios', source: 'Catálogo de apoyos', url: 'https://www.inkl.com/news/how-to-help-autistic-students-succeed-at-university', year: null, type: 'web' },
    { code: 'DOIT-ONLINE', title: 'Burgstahler, 20 Tips for Teaching an Accessible Online Course (DO-IT, University of Washington)', source: 'Catálogo de apoyos', url: 'https://www.washington.edu/doit/node/6672', year: null, type: 'web' },
    { code: 'UALR-ONLINE', title: 'UA Little Rock, Disability Resource Center, guía de educación online accesible', source: 'Catálogo de apoyos', url: 'https://ualr.edu/disability/online-education/', year: null, type: 'web' },
    { code: 'WWU-ONLINE', title: 'Western Washington University, Accessible Online Course Design (precisión de subtítulos automáticos)', source: 'Catálogo de apoyos', url: 'https://disability.wwu.edu/node/12', year: null, type: 'web' },
    { code: 'NDC-ONLINE', title: 'National Deaf Center (2020), Making Online Learning Accessible for Deaf Students', source: 'Catálogo de apoyos', url: 'https://core.ac.uk/download/372702175.pdf', year: 2020, type: 'pdf' },
    { code: 'WCAG-22', title: 'W3C, WCAG 2.2 (1.1.1 texto alternativo, 1.2.2 subtítulos, 1.3.1 estructura, 2.1.1 teclado)', source: 'Catálogo de apoyos', url: 'https://www.w3.org/TR/WCAG22/', year: null, type: 'web' },
    { code: 'GCU-TERRENO', title: 'Glasgow Caledonian University, Guide to inclusive field trips', source: 'Catálogo de apoyos', url: 'https://www.gcu.ac.uk/currentstudents/support/disabilityservice/staff-materials/guide-to-inclusive-field-trips', year: null, type: 'web' },
    { code: 'THE-TERRENO', title: 'Alexis-Martin, Ten steps to equity: making fieldwork accessible (THE Campus)', source: 'Catálogo de apoyos', url: 'https://www.timeshighereducation.com/campus/ten-steps-equity-making-fieldwork-accessible', year: null, type: 'web' },
    { code: 'DOIT-TERRENO', title: 'DO-IT, University of Washington, casos de trabajo en terreno', source: 'Catálogo de apoyos', url: 'https://doit.uw.edu/fieldwork/', year: null, type: 'web' },
    { code: 'DOIT-LAB', title: 'DO-IT, seguridad en laboratorio para estudiantes sordos; Burgstahler (2012), Making Science Labs Accessible', source: 'Catálogo de apoyos', url: 'https://doit.uw.edu/knowledge-base/what-lab-safety-issues-need-to-be-considered-when-working-with-a-student-who-is-deaf', year: 2012, type: 'web' },
    { code: 'ACCESSCOMPUTING-LAB', title: 'AccessComputing, University of Washington, Science Labs (rol activo y esencial en trabajo en pareja)', source: 'Catálogo de apoyos', url: 'https://accesscomputing.uw.edu/science-labs', year: null, type: 'web' },
    { code: 'UCDAVIS-LAB', title: 'UC Davis Chemistry, Accommodating Students with Disabilities in Chemistry Teaching Laboratories (evaluación de necesidades)', source: 'Catálogo de apoyos', url: 'https://chemistry.ucdavis.edu/sites/g/files/dgvnsk196/files/files/page/needs-assessment.pdf', year: null, type: 'pdf' },
    { code: 'DOIT-SALUD', title: 'DO-IT, ajustes en laboratorio para estudiantes con condiciones de salud', source: 'Catálogo de apoyos', url: 'https://www.washington.edu/doit/node/4722', year: null, type: 'web' },
    { code: 'OTTAWA-LAB', title: 'MacLean, Making Lab Based Courses Inclusive (uOttawa, eCampusOntario)', source: 'Catálogo de apoyos', url: 'https://openlibrary-repo.ecampusontario.ca/jspui/bitstream/123456789/1689/2/Making-Lab-Based-Courses-Inclusive-1669839512.-htmlbook.html', year: null, type: 'web' }
];

const duaStagesData = [
    {
        id: 'exploracion',
        label: 'Exploración',
        badge: 'Antes de decidir',
            source: 'Experiencia DUA Duoc UC',
            intro: 'Conoce al grupo antes de escoger estrategias. No todos los cursos son diversos en el mismo sentido.',
            focus: ['Levantar preferencias, barreras e intereses.', 'Revisar antecedentes compartidos por equipos de apoyo.', 'Observar rutinas, comprensión, motivación, sensibilidad sensorial, movilidad y participación socioemocional.'],
            checklist: [
            'Revisar la información y los acuerdos de apoyo que la Unidad de Inclusión haya compartido.',
            'Aplicar una encuesta, diálogo o actividad breve para conocer intereses y preferencias.',
            'Identificar las barreras del curso (físicas, sensoriales, digitales, comunicacionales o actitudinales) y cómo responde a rutinas, cambios y trabajo en grupo.',
            'Detectar posibles distractores, fuentes de ansiedad o momentos de baja previsibilidad.',
            'Usar ejemplos que reflejen las experiencias, realidades y orígenes de los estudiantes.'
        ],
        principles: ['base', 'compromiso', 'base', 'compromiso', 'compromiso'],
        when: 'Antes de la clase',
        example: 'Antes de iniciar una unidad, pregunta qué formatos ayudan más a comprender: demostración, guía paso a paso, video breve, práctica acompañada o lectura.'
    },
    {
        id: 'preparacion',
        label: 'Preparación',
        badge: 'Diseño de la sesión',
        source: 'Marco DUA 3.0',
        intro: 'Prepara la clase con opciones para entender, participar y responder, sin cambiar el objetivo.',
        focus: ['Aclarar propósito y criterios de logro.', 'Preparar materiales accesibles y editables.', 'Planificar apoyos sin bajar exigencias.'],
        checklist: [
            'Definir objetivos claros y comunicarlos en más de un formato.',
            'Dar opciones reales para elegir cómo trabajar o entregar, sin cambiar el objetivo.',
            'Preparar materiales legibles: títulos, buen contraste, letra clara y descripción de las imágenes importantes.',
            'Diseñar instrucciones paso a paso con tiempos, roles y criterios explícitos.',
            'Anticipar alternativas de respuesta: escrita, oral, visual, práctica o digital.',
            'Preparar vocabulario, símbolos o conceptos clave con ejemplos y apoyos visuales, considerando a quienes tienen otro idioma materno.',
            'Permitir herramientas de apoyo para producir (corrector, plantillas, calculadora, software) cuando no sean lo que se evalúa.',
            'Activar conocimientos previos y destacar las ideas clave de la clase, por ejemplo con un caso, un esquema o una pregunta inicial.'
        ],
        principles: ['representacion', 'compromiso', 'representacion', 'accion', 'accion', 'representacion', 'accion', 'representacion'],
        when: 'Antes de la clase',
        example: 'Para una evaluación aplicada, permite escoger entre informe breve, demostración técnica o defensa oral con pauta común.'
    },
    {
        id: 'integracion',
        label: 'Integración',
        badge: 'En el aula',
            source: 'Experiencia DUA Duoc UC',
        intro: 'Durante la clase, observa cómo responde el curso y ajusta sobre la marcha.',
        focus: ['Monitorear participación real.', 'Ajustar ritmos y apoyos durante la clase.', 'Promover pertenencia, colaboración con roles claros y retroalimentación formativa.'],
        checklist: [
            'Explicar la estructura de la clase y anticipar cambios de rutina.',
            'Usar ejemplos conectados con contextos reales y diversos, e incluir momentos de juego o desafío cuando sirvan al objetivo.',
            'Organizar el trabajo colaborativo con roles definidos, normas de convivencia e instrucciones orales, escritas y visuales.',
            'Dar comentarios a tiempo que digan qué hacer para mejorar, sobre el proceso y el resultado, por escrito, en audio o con ejemplos.',
            'Permitir pausas, aclaraciones o apoyos cuando aparezcan barreras no previstas.',
            'Verificar la comprensión durante la clase con preguntas, reformulación o ejemplos antes de avanzar.',
            'Modelar el procedimiento y dar práctica guiada antes del trabajo autónomo, retirando el apoyo de a poco.',
            'Cuidar que todos tengan un lugar en el curso: normas de respeto acordadas y conflictos que se reparan conversando.'
        ],
        principles: ['compromiso', 'compromiso', 'compromiso', 'compromiso', 'compromiso', 'representacion', 'accion', 'compromiso'],
        when: 'Durante la clase',
        example: 'En trabajo grupal, asigna roles visibles: coordinación, registro, vocería y control de tiempos, permitiendo ajustes si un rol genera sobrecarga.'
    },
    {
        id: 'optimizacion',
        label: 'Optimización',
        badge: 'Mejora continua',
        source: 'Marco DUA 3.0',
        intro: 'Después de la clase, decide qué mantener, qué ajustar y qué dejar para la próxima.',
        focus: ['Revisar datos de participación y logro.', 'Detectar nuevas barreras.', 'Documentar decisiones útiles para la próxima versión.'],
        checklist: [
            'Registrar qué apoyos aumentaron la participación, la comprensión o la autonomía, para reutilizarlos o ajustarlos.',
            'Preguntar al curso qué facilitó o dificultó el aprendizaje.',
            'Ordenar los materiales del AVA para que sean fáciles de encontrar, leer y usar.',
            'Planificar una mejora concreta para la siguiente clase.',
            'Dejar criterios, pasos y recursos visibles para que el estudiante revise su avance.',
            'Cerrar con una breve reflexión donde los estudiantes digan qué les ayudó a aprender.'
        ],
        principles: ['base', 'base', 'representacion', 'base', 'accion', 'accion'],
        when: 'Después de la clase',
        example: 'Si muchos estudiantes pidieron instrucciones nuevamente, convierte la pauta en una lista visible con ejemplo de entrega esperada.'
    }
];

const duaPrinciples = {
    compromiso: { label: 'Motivación', short: 'Motivación', term: 'Compromiso', text: 'Que quieran aprender: interés, sentido y sentirse parte del curso.' },
    representacion: { label: 'Comprensión', short: 'Comprensión', term: 'Representación', text: 'Que puedan entender: la información en más de una forma y con apoyos.' },
    accion: { label: 'Expresión', short: 'Expresión', term: 'Acción y expresión', text: 'Que puedan mostrar lo aprendido: formas de responder, herramientas y organización.' },
    base: { label: 'Conocer y revisar', short: 'Conocer y revisar', text: 'Conocer al curso y revisar la clase. No cuenta como principio, pero sostiene los tres.' }
};

const duaCatalogLinks = {
    'preparacion-2': ['ap037', 'ap071', 'ap179'],
    'preparacion-3': ['ap008', 'ap096', 'ap107', 'ap131', 'ap144'],
    'preparacion-4': ['ap011', 'ap109'],
    'preparacion-5': ['ap100'],
    'preparacion-6': ['ap016', 'ap067', 'ap139'],
    'integracion-0': ['ap052', 'ap116', 'ap127', 'ap159'],
    'integracion-2': ['ap076', 'ap157'],
    'integracion-5': ['ap104'],
    'integracion-6': ['ap150'],
    'optimizacion-4': ['ap141']
};

const accommodationsData = {
    fisica: {
        name: 'Discapacidad física o movilidad reducida',
        source: 'Adecuaciones de Acceso',
        context: [
            'Oriente al estudiante respecto de los espacios físicos de la sede y sala para facilitar desplazamientos.',
            'Asegura rutas accesibles, mesa adecuada y espacio de circulación.',
            'Coordina ubicación estratégica según movilidad, fatiga o uso de apoyos.',
            'Ofrece pausas acordadas cuando exista fatiga o dolor, y tiempo adicional si escribir o desplazarse toma más tiempo; parte con 25 % y ajusta según lo que realmente use.'
        ],
        materials: [
            'Disponibiliza materiales digitales con anticipación.'
        ],
        methods: [
            'Si la clase tiene componente práctico que requiere permanecer de pie, evalúe silla u otro elemento de apoyo.',
            'Flexibiliza formato de actividades prácticas cuando exista dificultad motora.',
            'Divide tareas extensas en etapas verificables.'
        ],
        interaction: [
            'Familiarícese con la tecnología asistiva que use el estudiante y sea proactivo en su uso.',
            'Evita asumir ayuda sin preguntarla; acuerda apoyos con la persona.',
            'Considera participación oral, digital o asistida.',
            'Facilita salir de la sala si el estudiante lo requiere (medicación o baño).'
        ],
        evaluacion: [
            'Si hay dificultad en la expresión oral, acuerda más tiempo para exposiciones, salvo que la fluidez oral sea parte de lo que se evalúa.',
            'Ofrece exponer solo frente al docente si la ansiedad lo requiere.',
            'Flexibiliza plazos de entrega cuando exista fatiga.'
        ],
        tech: [
            'Permite uso de computador, grabación o ayudas técnicas.',
            'Facilita acceso a tecnologías de apoyo para escritura o comunicación.'
        ]
    },
    auditiva: {
        name: 'Discapacidad auditiva',
        source: 'Adecuaciones de Acceso',
        context: [
            'Facilita asiento con buena visibilidad del docente, intérprete o pizarra.',
            'Reduce ruido de fondo y ordena turnos de habla.'
        ],
        materials: [
            'Entrega instrucciones y contenidos clave por escrito.',
            'Asegura subtítulos, transcripciones o guiones de material audiovisual.',
            'Considera el tiempo que suma la interpretación en lengua de señas o la lectura de instrucciones extensas, y ajusta el tiempo de la actividad en esa medida.'
        ],
        methods: [
            'Apoya explicaciones orales con esquemas, palabras clave y ejemplos escritos.',
            'Verifica comprensión sin exponer públicamente.'
        ],
        interaction: [
            'Respeta lengua de señas, lectura labial, audífonos, implantes o intérprete según corresponda.',
            'Habla de frente y evita cubrir la boca.',
            'Parafrasee consultas de compañeros para que el estudiante acceda al aporte de sus pares.'
        ],
        evaluacion: [
            'Entrega por escrito toda la información que se daría en forma oral durante la evaluación.',
            'Permite el uso de recursos de apoyo habituales en evaluaciones orales o escritas.'
        ],
        tech: [
            'Facilita el uso de intérprete de lengua de señas, Transvoz u otras tecnologías de transcripción.'
        ]
    },
    visual: {
        name: 'Discapacidad visual o baja visión',
        source: 'Adecuaciones de Acceso',
        context: [
            'Coordina ubicación, iluminación y acceso a enchufes según necesidad.',
            'Evita cambiar mobiliario sin avisar.'
        ],
        materials: [
            'Usa documentos accesibles, editables y compatibles con lector de pantalla.',
            'Describe imágenes, gráficos y acciones realizadas en pizarra.',
            'Ajusta el tiempo de lectura y navegación según lo que demore el formato accesible (lector de pantalla, ampliación o braille).'
        ],
        methods: [
            'No dependas solo del color, la ubicación visual o gestos para comunicar información.',
            'En presentaciones, usa letra grande, fuente sin serifa, buen contraste y evita elementos distractores.',
            'En salidas a terreno, anticipe barreras para permitir la participación del estudiante.',
            'Ofrece alternativas táctiles, auditivas o digitales cuando sea pertinente.'
        ],
        interaction: [
            'Pregunta preferencias de formato: macrotipo, lector de pantalla, audio o Braille digital.',
            'Lee en voz alta información proyectada relevante.'
        ],
        evaluacion: [
            'Permite realizar evaluaciones por medios digitales y plataformas virtuales.',
            'Dispón el material escrito con anticipación para su adaptación.',
            'En evaluaciones, otorga tiempo adicional según lo que demore el formato accesible; revisa con el estudiante cuánto usa realmente.'
        ],
        tech: [
            'Asegura compatibilidad con lectores de pantalla y dispositivos Braille.',
            'Revisa accesibilidad con herramientas como Blackboard Ally.'
        ]
    },
    sordoceguera: {
        name: 'Sordoceguera',
        source: 'Adecuaciones de Acceso',
        context: [
            'Asigna lugar cómodo para estudiante y guía intérprete.',
            'Anticipa cambios de sala, mobiliario o actividad.',
            'Flexibiliza tiempos de desplazamiento y comunicación.'
        ],
        materials: [
            'Sube materiales al AVA con anticipación y formatos compatibles con líneas Braille.',
            'Prioriza recursos táctiles o descripciones textuales claras.'
        ],
        methods: [
            'Organiza secuencias previsibles, con información esencial claramente jerarquizada.',
            'Evita actividades dependientes de estímulos simultáneos no accesibles.'
        ],
        interaction: [
            'Coordina comunicación a través de guía intérprete cuando corresponda.',
            'Confirma acuerdos de apoyo antes de actividades fuera del aula.'
        ],
        evaluacion: [
            'Acuerda formatos de evaluación que permitan expresar los aprendizajes.',
            'Prioriza evaluaciones de ejecución práctica cuando sea posible.'
        ],
        tech: [
            'Asegura que la tecnología usada sea compatible con líneas Braille y guía intérprete.'
        ]
    },
    tactil: {
        name: 'Discapacidad sensorial táctil',
        source: 'Adecuaciones de Acceso',
        context: [
            'Asegura mobiliario ergonómico (mesa y silla ajustables) según necesidad.',
            'Reserva asiento con acceso a enchufe para trabajo en dispositivo electrónico si hay dificultad de escritura manual.'
        ],
        materials: [
            'Disponibiliza materiales en AVA con anterioridad para consulta previa.'
        ],
        methods: [
            'En actividades con manipulación de instrumentos, anticípate a las necesidades y ofrece alternativas.'
        ],
        interaction: [
            'Permite salir de la sala si el estudiante lo requiere.'
        ],
        evaluacion: [
            'Ofrece formatos alternativos (digital u oral) ante dificultades de escritura manual.',
            'Otorga tiempo adicional cuando la evaluación exija escribir o manipular con rapidez; parte con 25 % y ajusta según lo que realmente use.',
            'Flexibiliza plazos si el estudiante debe ausentarse por su condición.'
        ],
        tech: [
            'Permite el uso de dispositivos electrónicos como alternativa a la escritura manual.'
        ]
    },
    vestibular: {
        name: 'Discapacidad sensorial vestibular',
        source: 'Adecuaciones de Acceso',
        context: [
            'Mantén la sala ordenada y predecible, con iluminación adecuada y sin luces parpadeantes.',
            'Reserva asiento contiguo a una pared, lejos de ventanas con altura o brillos intensos.',
            'Evita movimientos bruscos o cambios repentinos que puedan generar desequilibrio.'
        ],
        materials: [
            'Usa fuentes claras y formatos simples, sin animaciones ni transiciones innecesarias.',
            'Ofrece textos de refuerzo para trabajo autónomo en formato amigable.'
        ],
        methods: [
            'Evita exceso de estímulos visuales y auditivos durante las clases.',
            'Si usas videos con estímulos intensos, avisa con anticipación para que el estudiante tome resguardos.'
        ],
        interaction: [
            'Permite que el estudiante se mueva o se retire de la sala si es necesario.',
            'En trabajos en equipo, entrega instrucciones y roles definidos con anticipación.'
        ],
        evaluacion: [
            'Ofrece pausas y la posibilidad de detenerse si aparecen mareos; usa tiempo adicional solo si la barrera afecta la rapidez de respuesta.',
            'Flexibiliza plazos si el estudiante debe ausentarse por su condición.'
        ],
        tech: [
            'Evita tecnologías con estímulos visuales intensos o parpadeantes en evaluaciones.'
        ]
    },
    visceral: {
        name: 'Discapacidad visceral u orgánica',
        source: 'Adecuaciones de Acceso',
        context: [
            'Coordina ubicación cercana a ventilación, salida o servicios si es necesario.',
            'Considera mobiliario ergonómico o condiciones ambientales específicas.',
            'Flexibiliza pausas y asistencia según controles, tratamientos o episodios de salud.'
        ],
        materials: [
            'Mantén contenidos disponibles con anticipación para periodos de ausencia o fatiga.',
            'Ofrece alternativas digitales para continuidad.'
        ],
        methods: [
            'Planifica actividades por tramos para reducir sobrecarga física.',
            'Permite participación asincrónica cuando sea razonable.'
        ],
        interaction: [
            'Resguarda privacidad del diagnóstico y acuerda apoyos directamente con la persona.',
            'Evita interpretaciones disciplinarias de pausas o ausencias justificadas.'
        ],
        evaluacion: [
            'Flexibiliza plazos de entrega y fechas de evaluación según condición de salud.',
            'Ofrece pausas o salidas acordadas por necesidades de salud; repón ese tiempo y suma tiempo adicional solo si la barrera afecta la rapidez de respuesta.'
        ],
        tech: [
            'Facilita plataformas digitales para continuidad cuando el estudiante no pueda asistir.'
        ]
    },
    intelectual: {
        name: 'Discapacidad intelectual',
        source: 'Adecuaciones de Acceso',
        context: [
            'Coordina asiento reservado en la primera fila, sin distracciones.',
            'Establece reglas claras sobre uso de celular y dispositivos durante la clase.',
            'Reduce distractores y ubica al estudiante donde pueda pedir apoyo con facilidad.',
            'Mantén rutinas claras y predecibles.'
        ],
        materials: [
            'Usa lectura fácil, glosarios, ejemplos concretos y apoyos visuales simples.',
            'Entrega instrucciones en pasos numerados.',
            'Refuerce aprendizajes con videos y material gráfico que acerque contenido teórico a la práctica.',
            'Destaca títulos y palabras clave con tipografía diferente y colores significativos.'
        ],
        methods: [
            'Modela la tarea antes de pedir desempeño autónomo.',
            'Relaciona conceptos abstractos con situaciones reales o manipulables.'
        ],
        interaction: [
            'Evita palabras ambiguas, juegos de palabras innecesarios o ironías.',
            'Mantén orden en participaciones: turnos de habla y evita interrupciones entre pares.',
            'Valore los errores para aclarar conceptos.',
            'Verifica comprensión con preguntas concretas y sin infantilizar.',
            'Refuerza avances y estrategias usadas.'
        ],
        evaluacion: [
            'Entrega con anticipación y por escrito las fechas de evaluaciones.',
            'Segmenta instrucciones con pasos breves, a modo de lista de verificación.',
            'Prefiere preguntas directas y guiadas, evita enunciados extensos o ambiguos.',
            'Ofrece formatos alternativos (práctico, oral, visual) para comprobar aprendizajes.',
            'Flexibiliza plazos de entrega y, en evaluaciones con tiempo limitado, otorga tiempo adicional si leer o escribir con rapidez no es lo que se evalúa (referencia: 25 %).'
        ],
        tech: [
            'Apoya con organizadores gráficos digitales y calendarios de estudio.'
        ]
    },
    psiquica: {
        name: 'Discapacidad psíquica o salud mental',
        source: 'Adecuaciones de Acceso',
        context: [
            'Procura ambiente calmo, reglas conocidas y acceso claro a redes de apoyo.',
            'Evita exposición innecesaria en situaciones de alta ansiedad.'
        ],
        materials: [
            'Disponibiliza materiales antes de la clase para anticipación.',
            'Resume instrucciones críticas por escrito.'
        ],
        methods: [
            'Mantén estructura consistente y avisa cambios relevantes.',
            'Ofrece alternativas graduales para participación oral o grupal.'
        ],
        interaction: [
            'Usa comunicación clara, respetuosa y no punitiva frente a crisis o ausencias.',
            'Manténgase atento a requerimientos emocionales del estudiante y ofrezca apoyo.',
            'Acuerda señales o canales de apoyo si corresponde.'
        ],
        evaluacion: [
            'Ofrece flexibilidad para presentaciones orales: opción sin público, e ir incrementando nivel de exposición poco a poco.',
            'Retroalimente con frecuencia y de manera personalizada.',
            'Flexibiliza fechas y plazos cuando existan episodios documentados.',
            'Prioriza pausas acordadas, un ambiente con menos estímulos o dividir la evaluación; el tiempo adicional no tiene respaldo en la investigación para esta barrera salvo que afecte la rapidez de respuesta.'
        ],
        tech: [
            'Permite entrega de trabajos por medios digitales cuando la presencialidad sea una barrera.'
        ]
    },
    autismo: {
        name: 'Condición del Neurodesarrollo',
        source: 'Autismo',
        context: [
            'Entregue información sobre reglas del aula: levantar la mano, momento para preguntas, dinámicas de participación.',
            'Anticipa estructura, reglas, tiempos de descanso y cambios de rutina.',
            'Permite audífonos con cancelación de ruido u otros apoyos sensoriales en trabajo autónomo.'
        ],
        materials: [
            'Entrega material antes de la clase y usa instrucciones explícitas.',
            'Evita ambigüedades, ironías o dobles sentidos no explicados.'
        ],
        methods: [
            'Divide actividades en pasos y explicita expectativas de logro.',
            'Ofrece alternativas para participación social o trabajo grupal.'
        ],
        interaction: [
            'Reconoce fortalezas: foco, honestidad, organización, memoria o interés intenso.',
            'Acuerda apoyos sin exigir divulgación pública de la condición.'
        ],
        evaluacion: [
            'Flexibiliza entregas, pausas y evaluaciones cuando exista sobrecarga o desregulación.',
            'Brinda información adicional durante la evaluación si el estudiante muestra signos de estrés.',
            'Decide el tiempo adicional caso a caso: úsalo si la barrera afecta la rapidez de respuesta y combínalo con instrucciones claras, anticipación y un ambiente con menos estímulos.'
        ],
        tech: [
            'Permite el uso de audífonos con cancelación de ruido durante trabajo autónomo y evaluaciones.'
        ],
        highlights: [
            { title: 'Anticipación', text: 'Comunica estructura, actividades, tiempos y cambios antes de la clase.' },
            { title: 'Claridad', text: 'Define expectativas, reglas de participación y criterios de evaluación sin ambigüedades.' },
            { title: 'Trabajo grupal', text: 'Usa roles explícitos, retroalimentación y opción de reuniones individuales si aparecen dificultades.' },
            { title: 'Desregulación', text: 'Prioriza calma, flexibilidad, reducción de estímulos y coordinación con apoyos especializados.' }
        ],
        regulation: [
            {
                title: 'Antes',
                items: [
                    'Anticipa cambios de rutina, evaluaciones, trabajos grupales y transiciones.',
                    'Acuerda una forma discreta para pedir pausa o apoyo.',
                    'Identifica posibles sobrecargas sensoriales: ruido, luces, tiempos extensos o instrucciones ambiguas.'
                ]
            },
            {
                title: 'Durante',
                items: [
                    'Mantén un tono calmo, claro y breve.',
                    'Reduce estímulos y ofrece un espacio o pausa segura si es posible.',
                    'Evita confrontar, exigir explicación inmediata o exponer a la persona frente al curso.'
                ]
            },
            {
                title: 'Después',
                items: [
                    'Retoma la comunicación cuando la persona esté disponible para hacerlo.',
                    'Revisa qué desencadenó la situación y qué ajuste puede prevenirla.',
                    'Coordina apoyos especializados cuando corresponda, resguardando privacidad y dignidad.'
                ]
            }
        ]
    }
};

const goodPracticesData = [
    {
        title: 'Primero elimina barreras generales',
        text: 'Aplica DUA y ajustes de aula antes de pensar en una medida individual. Las adecuaciones se usan cuando persisten barreras específicas.'
    },
    {
        title: 'No bajes el estándar',
        text: 'Una adecuación de acceso cambia recursos, apoyos, tiempos o formatos, pero mantiene los resultados de aprendizaje.'
    },
    {
        title: 'Acuerda con la persona',
        text: 'Consulta preferencias y necesidades reales; no todas las personas con una misma discapacidad requieren el mismo apoyo.'
    },
    {
        title: 'Cuida continuidad y privacidad',
        text: 'Registra acuerdos útiles para próximas clases y resguarda información personal o diagnóstica.'
    },
    {
        title: 'Entrega la programación completa desde el inicio',
        text: 'Al comenzar el curso, comparte fechas de evaluaciones, condiciones y cualquier información relevante. Esto reduce ansiedad y permite anticipación.'
    },
    {
        title: 'Informa sobre los apoyos institucionales',
        text: 'Comunica al curso que existen equipos de apoyo, adaptaciones disponibles y canales para solicitar ayuda. El docente es puente entre el estudiante y los recursos.'
    },
    {
        title: 'Fomenta la colaboración entre pares',
        text: 'Promueve compartir apuntes, incluir en grupos de trabajo y construir cultura inclusiva. La inclusión también se construye entre compañeros, no solo desde el docente.'
    }
];

const vocabularyData = [
    { bad: 'Minusválido/a', good: 'Persona con discapacidad o persona usuaria de silla de ruedas', why: 'Evita asociar discapacidad con menor valor personal.' },
    { bad: 'Persona con capacidades diferentes', good: 'Persona con discapacidad', why: 'Evita eufemismos que ocultan las barreras del entorno.' },
    { bad: 'Sordomudo/a', good: 'Persona sorda o persona con discapacidad auditiva', why: 'La sordera no implica imposibilidad de comunicarse.' },
    { bad: 'Lenguaje de señas', good: 'Lengua de señas', why: 'Reconoce que es una lengua de una comunidad lingüística.' },
    { bad: 'Invidente / no vidente', good: 'Persona ciega o persona con discapacidad visual', why: 'Nombra la condición sin negar otras formas de percepción.' },
    { bad: 'Sufre discapacidad', good: 'Persona con discapacidad', why: 'Evita presentar la discapacidad como tragedia individual.' },
    { bad: 'Retraso mental', good: 'Persona con discapacidad intelectual', why: 'Usa terminología vigente y respetuosa.' },
    { bad: 'El autista, el TEA (para nombrar a alguien)', good: 'Persona autista o persona en el espectro autista, según prefiera', why: 'Muchas personas autistas prefieren nombrarse así; otras prefieren poner la persona primero. Pregunta y respeta su preferencia.' },
    { bad: 'Discapacitado/a, inválido/a', good: 'Persona con discapacidad o persona en situación de discapacidad', why: 'Ambos términos se usan en Chile: el primero en la Ley 20.422 y el segundo en SENADIS y el Minsal.' },
    { bad: 'Enfermo/a mental, loco/a', good: 'Persona con una condición de salud mental o con discapacidad psíquica', why: 'Evita estigmatizar y nombra la condición sin reducir a la persona.' },
    { bad: 'Normal (para comparar)', good: 'Sin discapacidad, o el resto del curso', why: 'Llamar «normal» a unos implica que otros no lo son.' },
    { bad: 'Confinado/a a una silla de ruedas', good: 'Persona usuaria de silla de ruedas', why: 'La silla es un apoyo que da movilidad, no un encierro.' }
];

const autismMyths = [
    'No todas las personas autistas presentan las mismas características ni requieren los mismos apoyos.',
    'La comunicación puede ser oral, escrita, visual, gestual o mediada por apoyos.',
    'La desregulación no es mala conducta: suele responder a sobrecarga, ansiedad o estímulos desencadenantes.',
    'Durante una desregulación, confrontar, ironizar o exigir explicación inmediata puede aumentar la sobrecarga.',
    'Las fortalezas también importan: justicia social, honestidad, foco, organización e intereses intensos pueden enriquecer el aprendizaje.'
];

const glossaryData = [
    { term: 'Accesibilidad universal', desc: 'Condición que permite que entornos, procesos, productos y servicios sean comprensibles y utilizables por todas las personas, de la forma más autónoma posible (Ley 20.422).' },
    { term: 'Adecuación curricular de acceso', desc: 'Apoyo individual que cambia cómo el estudiante accede a la información, responde o se ubica en el entorno, o el tiempo disponible, sin cambiar el resultado de aprendizaje ni la exigencia.' },
    { term: 'Ajustes razonables', desc: 'Modificaciones necesarias y adecuadas para un caso particular, que no impongan una carga desproporcionada, para participar en igualdad de condiciones (CDPD, art. 2; Ley 21.091).' },
    { term: 'Asesor de inclusión', desc: 'Profesional de la Unidad de Inclusión que acompaña al docente para diseñar la clase y acordar los ajustes de un estudiante.' },
    { term: 'Barreras', desc: 'Factores del entorno (físicos, comunicacionales, digitales, pedagógicos, de evaluación o actitudinales) que limitan la participación y el aprendizaje.' },
    { term: 'Desregulación emocional o sensorial', desc: 'Reacción intensa ante estímulos o situaciones que sobrepasan a la persona, que en ese momento no logra manejar ni expresar lo que siente. Requiere calma, menos estímulos y apoyos acordados.' },
    { term: 'DUA (Diseño Universal para el Aprendizaje)', desc: 'Marco de CAST para diseñar clases que consideren desde el inicio la variedad de estudiantes: distintas formas de motivarse, de comprender y de expresar lo aprendido.' },
    { term: 'Lectura fácil', desc: 'Forma de redactar y presentar información con pautas específicas (UNE 153101, Inclusion Europe) que se comprueba con personas con dificultades de comprensión.' },
    { term: 'Macrotipo', desc: 'Texto ampliado para personas con baja visión, ajustado según necesidad real y no como solución automática.' },
    { term: 'Matriz CIF', desc: 'Registro que entrega psicopedagogía, inspirado en la Clasificación Internacional del Funcionamiento de la OMS. Califica de 4 a 1 cuánto participa el estudiante en 11 actividades académicas.' },
    { term: 'Neurodiversidad', desc: 'Reconocimiento de la variabilidad neurológica humana como parte natural de la diversidad.' },
    { term: 'Texto alternativo', desc: 'Descripción breve y funcional de una imagen para transmitir su propósito a quienes no la perciben visualmente.' }
];

const accessMatrixActivities = [
    { id: 'escribir',      label: 'Escribir',                         dims: ['evaluacion','tech'],          conds: ['fisica','tactil','intelectual'] },
    { id: 'leer',          label: 'Leer',                             dims: ['materials'],                  conds: ['visual','sordoceguera','intelectual'] },
    { id: 'hablar',        label: 'Hablar',                           dims: ['interaction'],                conds: ['auditiva','sordoceguera','autismo','psiquica'] },
    { id: 'recordar',      label: 'Recordar cosas',                   dims: ['methods'],                    conds: ['intelectual','psiquica','autismo'] },
    { id: 'examenes',      label: 'Rendir exámenes',                  dims: ['evaluacion'],                 conds: ['fisica','auditiva','visual','sordoceguera','tactil','vestibular','visceral','intelectual','psiquica','autismo'] },
    { id: 'practicos',     label: 'Participar en ramos prácticos',    dims: ['methods','interaction'],      conds: ['fisica','auditiva','visual','sordoceguera','tactil','vestibular','autismo','visceral'] },
    { id: 'sala_clases',   label: 'Participar en la sala de clases',  dims: ['interaction','context'],      conds: ['auditiva','visual','sordoceguera','autismo','psiquica'] },
    { id: 'sociales',      label: 'Participar en actividades sociales',dims: ['interaction'],               conds: ['auditiva','sordoceguera','autismo','psiquica'] },
    { id: 'practicas_rec', label: 'Participar en actividades prácticas',dims: ['interaction','context'],     conds: ['fisica','vestibular','auditiva','visual'] },
    { id: 'ayuda',         label: 'Obtener ayuda',                    dims: ['interaction'],                conds: ['auditiva','sordoceguera','autismo','psiquica','intelectual'] },
    { id: 'acceder',       label: 'Acceder a la institución',         dims: ['context'],                    conds: ['fisica','visual','vestibular'] }
];

const matrixRecommendationRules = [
    { id: 'fisica_escribir_teclado', text: 'Permitir uso de computador, teclado adaptado, dictado u otra ayuda técnica para responder por escrito.', conditions: ['fisica','tactil'], activities: ['escribir'], dimensions: ['evaluacion','tech'], scores: [1,2], priority: 'alta' },
    { id: 'fisica_escribir_tiempo', text: 'Otorgar tiempo adicional o pausas si la escritura manual genera fatiga, dolor o lentitud motora.', conditions: ['fisica','tactil'], activities: ['escribir'], dimensions: ['evaluacion'], scores: [1,2], priority: 'media' },
    { id: 'intelectual_escribir_pasos', text: 'Entregar pauta de respuesta con pasos visibles, ejemplo breve y criterios de logro antes de comenzar.', conditions: ['intelectual'], activities: ['escribir'], dimensions: ['evaluacion'], scores: [1,2], priority: 'alta' },
    { id: 'visual_leer_formato', text: 'Entregar textos digitales accesibles, editables y compatibles con lector de pantalla o ampliación.', conditions: ['visual','sordoceguera'], activities: ['leer'], dimensions: ['materials','tech'], scores: [1,2], priority: 'alta' },
    { id: 'visual_leer_descripcion', text: 'Describir imágenes, gráficos, tablas o información visual relevante en formato textual o verbal.', conditions: ['visual','sordoceguera'], activities: ['leer'], dimensions: ['materials','methods'], scores: [1,2], priority: 'alta' },
    { id: 'intelectual_leer_claridad', text: 'Reformular instrucciones extensas con lenguaje claro, secuencia de pasos y apoyo visual cuando corresponda.', conditions: ['intelectual'], activities: ['leer'], dimensions: ['materials','methods'], scores: [1,2], priority: 'media' },
    { id: 'auditiva_hablar_acceso_comunicacional', text: 'Acordar el canal de comunicación: lengua de señas, lectura labial, transcripción, subtítulos o apoyo escrito según preferencia.', conditions: ['auditiva','sordoceguera'], activities: ['hablar'], dimensions: ['interaction','tech'], scores: [1,2], priority: 'alta' },
    { id: 'auditiva_hablar_turnos', text: 'Ordenar turnos de habla, hablar de frente y repetir por escrito instrucciones o acuerdos relevantes.', conditions: ['auditiva','sordoceguera'], activities: ['hablar','sala_clases'], dimensions: ['interaction','context'], scores: [1,2], priority: 'alta' },
    { id: 'autismo_hablar_preparada', text: 'Permitir respuestas escritas, visuales o preparadas cuando la participación oral espontánea sea una barrera.', conditions: ['autismo','psiquica'], activities: ['hablar','sala_clases'], dimensions: ['interaction','evaluacion'], scores: [1,2], priority: 'alta' },
    { id: 'autismo_hablar_anticipacion', text: 'Anticipar preguntas, roles o momentos de participación y evitar exposición oral sorpresiva.', conditions: ['autismo','psiquica'], activities: ['hablar','sociales','sala_clases'], dimensions: ['interaction'], scores: [1,2], priority: 'alta' },
    { id: 'autismo_recordar_estructura', text: 'Usar agenda, checklist, calendario o recordatorios visibles para organizar tareas, fechas y pasos.', conditions: ['autismo','psiquica','intelectual'], activities: ['recordar'], dimensions: ['methods','tech'], scores: [1,2], priority: 'alta' },
    { id: 'intelectual_recordar_modelado', text: 'Dividir tareas en pasos breves, modelar el procedimiento y verificar comprensión antes del trabajo autónomo.', conditions: ['intelectual','autismo'], activities: ['recordar'], dimensions: ['methods'], scores: [1,2], priority: 'alta' },
    { id: 'evaluacion_instrucciones_claras', text: 'Entregar instrucciones de evaluación por escrito, segmentadas y con criterios claros antes de iniciar.', conditions: ['autismo','intelectual','psiquica','auditiva','sordoceguera','visual'], activities: ['examenes'], dimensions: ['evaluacion','materials'], scores: [1,2], priority: 'alta' },
    { id: 'evaluacion_tiempo_pausas', text: 'Acordar pausas, división de la evaluación o tiempo adicional según la barrera. El tiempo adicional solo se justifica si la evaluación exige rapidez en la habilidad afectada: parte con 25 %, revisa cuánto usa realmente y justifica por escrito si supera el 50 %.', conditions: ['fisica','visual','sordoceguera','tactil','vestibular','visceral','intelectual','psiquica','autismo'], activities: ['examenes'], dimensions: ['evaluacion','context'], scores: [1,2], priority: 'media' },
    { id: 'evaluacion_auditiva_formato', text: 'Evitar instrucciones exclusivamente orales y asegurar subtítulos, transcripción o mediación comunicacional si la evaluación depende de audio.', conditions: ['auditiva','sordoceguera'], activities: ['examenes'], dimensions: ['evaluacion','tech'], scores: [1,2], priority: 'alta' },
    { id: 'evaluacion_visual_formato', text: 'Permitir formato digital accesible, ampliación, lector de pantalla o alternativa textual para contenidos visuales.', conditions: ['visual','sordoceguera'], activities: ['examenes'], dimensions: ['evaluacion','tech'], scores: [1,2], priority: 'alta' },
    { id: 'practicos_fisica_alternativa', text: 'Ajustar el puesto, herramienta, postura o secuencia de ejecución para participar sin alterar el resultado de aprendizaje.', conditions: ['fisica','tactil','vestibular','visceral'], activities: ['practicos','practicas_rec'], dimensions: ['methods','context'], scores: [1,2], priority: 'alta' },
    { id: 'practicos_visual_descripcion', text: 'Anticipar procedimientos prácticos con descripciones, guías táctiles o apoyo verbal para acceder a información visual.', conditions: ['visual','sordoceguera'], activities: ['practicos','practicas_rec'], dimensions: ['methods','interaction'], scores: [1,2], priority: 'alta' },
    { id: 'practicos_autismo_roles', text: 'Asignar roles explícitos, pasos observables y criterios de colaboración para reducir ambigüedad en actividades prácticas.', conditions: ['autismo','intelectual','psiquica'], activities: ['practicos'], dimensions: ['methods','interaction'], scores: [1,2], priority: 'media' },
    { id: 'sala_auditiva_visibilidad', text: 'Ubicar al estudiante con buena visibilidad del docente, pizarra, intérprete o apoyos escritos.', conditions: ['auditiva','sordoceguera','visual'], activities: ['sala_clases'], dimensions: ['context','interaction'], scores: [1,2], priority: 'alta' },
    { id: 'sala_autismo_previsibilidad', text: 'Mantener estructura de clase predecible, reglas explícitas y anticipación de cambios relevantes.', conditions: ['autismo','psiquica','intelectual'], activities: ['sala_clases'], dimensions: ['context','methods'], scores: [1,2], priority: 'alta' },
    { id: 'sala_psiquica_exposicion', text: 'Ofrecer participación gradual o alternativa cuando la exposición pública aumente ansiedad o bloquee la participación.', conditions: ['psiquica','autismo'], activities: ['sala_clases','sociales'], dimensions: ['interaction','context'], scores: [1,2], priority: 'media' },
    { id: 'sociales_autismo_roles', text: 'Estructurar interacciones sociales con roles claros, acuerdos de comunicación y opción de participación gradual.', conditions: ['autismo','psiquica','intelectual'], activities: ['sociales'], dimensions: ['interaction'], scores: [1,2], priority: 'alta' },
    { id: 'sociales_auditiva_acceso', text: 'Asegurar que actividades sociales relevantes tengan turnos visibles, apoyo escrito o mediación comunicacional.', conditions: ['auditiva','sordoceguera'], activities: ['sociales'], dimensions: ['interaction'], scores: [1,2], priority: 'media' },
    { id: 'ayuda_canal_explicito', text: 'Acordar un canal explícito y discreto para pedir ayuda: mensaje, señal, horario de consulta o persona referente.', conditions: ['autismo','psiquica','intelectual','auditiva','sordoceguera'], activities: ['ayuda'], dimensions: ['interaction'], scores: [1,2], priority: 'alta' },
    { id: 'ayuda_checklist', text: 'Entregar una lista breve de pasos para intentar antes de pedir apoyo y reducir incertidumbre al solicitar ayuda.', conditions: ['autismo','intelectual','psiquica'], activities: ['ayuda'], dimensions: ['methods','interaction'], scores: [1,2], priority: 'media' },
    { id: 'acceder_fisica_ruta', text: 'Verificar ruta accesible, sala, mobiliario, tiempos de desplazamiento y alternativas si hay barreras físicas.', conditions: ['fisica','vestibular'], activities: ['acceder'], dimensions: ['context'], scores: [1,2], priority: 'alta' },
    { id: 'acceder_visual_orientacion', text: 'Anticipar ubicación de salas, cambios de espacio y referencias de orientación accesibles.', conditions: ['visual','sordoceguera'], activities: ['acceder'], dimensions: ['context'], scores: [1,2], priority: 'alta' }
];

const accommodationCifMap = {
    fisica: {
        context: [["acceder","sala_clases"],["acceder","sala_clases"],["sala_clases"],["sala_clases"]],
        materials: [["leer"]],
        methods: [["practicos","practicas_rec","sala_clases"],["practicos","practicas_rec"],["sala_clases"]],
        interaction: [["escribir","sala_clases"],["ayuda","sala_clases"],["escribir","sala_clases"],["sala_clases"]],
        evaluacion: [["examenes"],["examenes"],["examenes","escribir"]],
        tech: [["escribir","examenes"],["escribir","examenes"]]
    },
    auditiva: {
        context: [["leer","sala_clases"],["sala_clases","sociales"]],
        materials: [["leer","sala_clases"],["leer","sala_clases"],["leer","examenes"]],
        methods: [["leer","sala_clases"],["ayuda","sala_clases"]],
        interaction: [["hablar","sala_clases","sociales"],["sala_clases"],["sala_clases","sociales"]],
        evaluacion: [["leer","examenes"],["hablar","leer","escribir","examenes"]],
        tech: [["hablar","leer","examenes"]]
    },
    visual: {
        context: [["sala_clases"],["sala_clases"]],
        materials: [["leer","escribir"],["leer","sala_clases"],["leer"]],
        methods: [["sala_clases"],["leer","sala_clases"],["practicas_rec","practicos"],["leer"]],
        interaction: [["leer","escribir","ayuda"],["sala_clases"]],
        evaluacion: [["leer","escribir","examenes"],["leer","examenes"],["leer","escribir","examenes"]],
        tech: [["leer","escribir"],["leer","escribir"]]
    },
    sordoceguera: {
        context: [["acceder","sala_clases"],["acceder","sala_clases","recordar"],["acceder","sala_clases"]],
        materials: [["leer"],["leer"]],
        methods: [["recordar","sala_clases"],["sala_clases"]],
        interaction: [["hablar","sala_clases","sociales"],["ayuda","practicas_rec"]],
        evaluacion: [["examenes","escribir","hablar","leer"],["examenes"]],
        tech: [["leer","escribir","hablar"]]
    },
    tactil: {
        context: [["escribir"],["escribir","sala_clases"]],
        materials: [["leer"]],
        methods: [["practicos","practicas_rec"]],
        interaction: [["sala_clases"]],
        evaluacion: [["escribir","hablar","examenes"],["escribir","examenes"],["examenes"]],
        tech: [["escribir"]]
    },
    vestibular: {
        context: [["sala_clases"],["sala_clases"],["sala_clases"]],
        materials: [["leer"],["leer"]],
        methods: [["sala_clases"],["sala_clases"]],
        interaction: [["sala_clases","acceder"],["sociales"]],
        evaluacion: [["examenes","leer","escribir"],["examenes"]],
        tech: [["examenes"]]
    },
    visceral: {
        context: [["sala_clases","acceder"],["sala_clases","acceder"],["sala_clases"]],
        materials: [["leer"],["leer"]],
        methods: [["sala_clases"],["escribir"]],
        interaction: [["ayuda"],["sala_clases"]],
        evaluacion: [["examenes","escribir"],["examenes","escribir"]],
        tech: [["leer","escribir"]]
    },
    intelectual: {
        context: [["sala_clases"],["sala_clases","recordar"],["sala_clases","ayuda"],["recordar","sala_clases"]],
        materials: [["leer","recordar"],["leer","recordar"],["leer","recordar"],["leer","recordar"]],
        methods: [["recordar"],["recordar"]],
        interaction: [["sala_clases"],["sala_clases","sociales"],["sala_clases"],["sala_clases"],["sala_clases","recordar"]],
        evaluacion: [["leer","recordar","examenes"],["leer","recordar","examenes"],["leer","examenes"],["examenes","hablar","escribir","practicos"],["examenes","escribir"]],
        tech: [["recordar","leer","escribir"]]
    },
    psiquica: {
        context: [["sala_clases","ayuda"],["sala_clases","sociales"]],
        materials: [["leer"],["leer"]],
        methods: [["recordar","sala_clases"],["hablar","sociales","sala_clases"]],
        interaction: [["ayuda","sala_clases"],["ayuda"],["ayuda"]],
        evaluacion: [["hablar","examenes"],["sala_clases"],["examenes","escribir"],["examenes","escribir"]],
        tech: [["escribir"]]
    },
    autismo: {
        context: [["sala_clases","recordar"],["recordar","sala_clases"],["sala_clases"]],
        materials: [["leer","recordar"],["leer","sala_clases","examenes"]],
        methods: [["recordar"],["hablar","sociales","sala_clases"]],
        interaction: [["sala_clases"],["ayuda","sala_clases"]],
        evaluacion: [["examenes","escribir"],["examenes","leer","ayuda"],["examenes","escribir"]],
        tech: [["sala_clases","examenes"]]
    }
};

const shortActivityLabels = {
    'escribir': 'Escribir',
    'leer': 'Leer',
    'hablar': 'Hablar',
    'recordar': 'Recordar',
    'examenes': 'Evaluación',
    'practicos': 'Ramos prácticos',
    'sala_clases': 'Aula',
    'sociales': 'Social',
    'practicas_rec': 'Act. prácticas',
    'ayuda': 'Ayuda',
    'acceder': 'Acceso'
};

const prioridadLabels = {
    1: { icon: '🟢', label: 'Barrera leve — observar' },
    2: { icon: '🟡', label: 'Barrera moderada — ajustar' },
    3: { icon: '🔴', label: 'Barrera significativa — intervenir' }
};

function buildRecommendationsData() {
    var data = {};
    var dims = ['context', 'materials', 'methods', 'interaction', 'evaluacion', 'tech'];
    Object.keys(accommodationsData).forEach(function(cond) {
        data[cond] = { name: accommodationsData[cond].name, source: accommodationsData[cond].source };
        dims.forEach(function(dim) {
            var items = [];
            var accItems = accommodationsData[cond][dim] || [];
            var cifMap = accommodationCifMap[cond] && accommodationCifMap[cond][dim] ? accommodationCifMap[cond][dim] : [];
            accItems.forEach(function(text, idx) {
                items.push({ text: text, activities: cifMap[idx] || [] });
            });
            if (items.length) data[cond][dim] = items;
        });
        if (accommodationsData[cond].highlights) data[cond].highlights = accommodationsData[cond].highlights;
        if (accommodationsData[cond].regulation) data[cond].regulation = accommodationsData[cond].regulation;
    });
    return data;
}

const recommendationsData = buildRecommendationsData();

window.UiePlannerData = {
    referencesData,
    duaStagesData,
    accommodationsData,
    goodPracticesData,
    vocabularyData,
    autismMyths,
    glossaryData,
    accessMatrixActivities,
    duaPrinciples,
    duaCatalogLinks,
    matrixRecommendationRules,
    accommodationCifMap,
    shortActivityLabels,
    prioridadLabels,
    recommendationsData
};

})();
