(function () {
var PDF = window.UiePlannerPdf;
const { accommodationsData, autismMyths, goodPracticesData, matrixRecommendationRules, accommodationCifMap, shortActivityLabels, prioridadLabels, recommendationsData } = window.UiePlannerData;

const barrierDimensions = [
    { key: 'context', label: 'Contexto' },
    { key: 'materials', label: 'Materiales' },
    { key: 'methods', label: 'Métodos' },
    { key: 'interaction', label: 'Interacción' },
    { key: 'evaluacion', label: 'Evaluaciones' },
    { key: 'tech', label: 'Tecnologías' }
];

const barrierProfiles = {
    fisica:       { context: 3, materials: 1, methods: 1, interaction: 2, evaluacion: 2, tech: 2 },
    auditiva:     { context: 1, materials: 2, methods: 2, interaction: 2, evaluacion: 1, tech: 2 },
    visual:       { context: 1, materials: 3, methods: 2, interaction: 1, evaluacion: 2, tech: 3 },
    sordoceguera: { context: 2, materials: 3, methods: 2, interaction: 2, evaluacion: 2, tech: 2 },
    tactil:       { context: 1, materials: 1, methods: 1, interaction: 0, evaluacion: 2, tech: 1 },
    vestibular:   { context: 3, materials: 1, methods: 1, interaction: 1, evaluacion: 1, tech: 0 },
    visceral:     { context: 2, materials: 1, methods: 1, interaction: 1, evaluacion: 2, tech: 1 },
    intelectual:  { context: 2, materials: 2, methods: 3, interaction: 3, evaluacion: 3, tech: 1 },
    psiquica:     { context: 1, materials: 1, methods: 1, interaction: 2, evaluacion: 2, tech: 1 },
    autismo:      { context: 2, materials: 1, methods: 2, interaction: 3, evaluacion: 2, tech: 1 }
};

const shortConditionNames = {
    fisica: 'Física',
    auditiva: 'Auditiva',
    visual: 'Visual',
    sordoceguera: 'Sordoceguera',
    tactil: 'Táctil',
    vestibular: 'Vestibular',
    visceral: 'Visceral',
    intelectual: 'Intelectual',
    psiquica: 'Psíquica',
    autismo: 'Neurodesarrollo',
    multiple: 'Múltiple'
};

const categoryLabels = {
    context: 'Contexto aula',
    materials: 'Materiales de estudio',
    methods: 'Métodos de enseñanza',
    interaction: 'Interacción en aula',
    evaluacion: 'De las evaluaciones',
    tech: 'Tecnologías asistivas'
};

function getActivityTagString(activities) {
    if (!activities || !activities.length) return '';
    var labels = activities.map(function(a) { return shortActivityLabels[a] || a; });
    return ' <span class="activity-tags">(' + labels.join(', ') + ')</span>';
}

function getSemaforo(activities, studentScores) {
    if (!studentScores || !activities || !activities.length) return null;
    var minScore = 4;
    activities.forEach(function(actId) {
        var score = Number(studentScores[actId] || 0);
        if (score > 0 && score < 4 && score < minScore) minScore = score;
    });
    return minScore < 4 ? minScore : null;
}

// MERGE GUIDE: When adding new recommendations in data.js, check if they overlap
// with existing merge groups below. If they do, add the text to the relevant group's
// `texts` array and adjust `mergedText` to reflect the broader reason.
// If no overlap is found, no action is needed: the recommendation displays normally.
const mergeGroups = [
    {
        category: 'evaluacion',
        texts: [
            'Otorga tiempo adicional para responder evaluaciones cuando sea necesario.',
            'Otorga tiempo adicional para responder evaluaciones si es necesario.',
            'Otorga más tiempo en evaluaciones si es necesario.',
            'Ofrece tiempo adicional si es necesario.',
            'Otorga tiempo adicional y flexibiliza plazos de entrega.'
        ],
        mergedText: 'Otorga tiempo adicional en evaluaciones y flexibiliza plazos según necesidad.'
    },
    {
        category: 'evaluacion',
        texts: [
            'Flexibiliza plazos si el estudiante debe ausentarse por su condición.',
            'Flexibiliza plazos de entrega cuando exista fatiga.',
            'Flexibiliza plazos de entrega y fechas de evaluación según condición de salud.',
            'Flexibiliza fechas y plazos cuando existan episodios documentados.',
            'Flexibiliza entregas, pausas y evaluaciones cuando exista sobrecarga o desregulación.'
        ],
        mergedText: 'Flexibiliza plazos de entrega y fechas de evaluación según la condición.'
    },
    {
        category: 'materials',
        texts: [
            'Disponibiliza materiales digitales con anticipación.',
            'Disponibiliza materiales en AVA con anterioridad para consulta previa.',
            'Disponibiliza materiales antes de la clase para anticipación.',
            'Mantén contenidos disponibles con anticipación para periodos de ausencia o fatiga.'
        ],
        mergedText: 'Disponibiliza materiales con anticipación en el AVA.'
    },
    {
        category: 'interaction',
        texts: [
            'Evita interpretaciones disciplinarias de pausas o ausencias justificadas.',
            'Usa comunicación clara, respetuosa y no punitiva frente a crisis o ausencias.'
        ],
        mergedText: 'Usa comunicación clara y respetuosa frente a crisis, pausas o ausencias justificadas.'
    }
];

const matrixData = {};
const hiddenRecommendations = {};
const advisorCommentsByStudent = {};
const clarificationData = {};
const manualRecommendationsByStudentCategory = {};

const ruleDimensionWeights = {
    fisica_escribir_teclado: { evaluacion: 1, tech: 0.7 },
    fisica_escribir_tiempo: { evaluacion: 1 },
    visual_leer_formato: { materials: 1, tech: 0.7 },
    visual_leer_descripcion: { materials: 1, methods: 0.7 },
    intelectual_leer_claridad: { materials: 1, methods: 0.7 },
    auditiva_hablar_acceso_comunicacional: { interaction: 1, tech: 0.7 },
    auditiva_hablar_turnos: { interaction: 1, context: 0.7 },
    autismo_hablar_preparada: { interaction: 1, evaluacion: 0.7 },
    autismo_recordar_estructura: { methods: 1, tech: 0.7 },
    evaluacion_instrucciones_claras: { evaluacion: 1, materials: 0.7 },
    evaluacion_tiempo_pausas: { evaluacion: 1, context: 0.5 },
    evaluacion_auditiva_formato: { evaluacion: 1, tech: 0.7 },
    evaluacion_visual_formato: { evaluacion: 1, tech: 0.7 },
    practicos_fisica_alternativa: { methods: 1, context: 0.7 },
    practicos_visual_descripcion: { methods: 1, interaction: 0.7 },
    practicos_autismo_roles: { methods: 1, interaction: 0.7 },
    sala_auditiva_visibilidad: { context: 1, interaction: 0.7 },
    sala_autismo_previsibilidad: { context: 1, methods: 0.7 },
    sala_psiquica_exposicion: { interaction: 1, context: 0.7 },
    sociales_autismo_roles: { interaction: 1 },
    sociales_auditiva_acceso: { interaction: 1 },
    ayuda_canal_explicito: { interaction: 1 },
    ayuda_checklist: { methods: 0.7, interaction: 1 },
    acceder_fisica_ruta: { context: 1 },
    acceder_visual_orientacion: { context: 1 }
};

const selectedConditionKeys = [];

var currentMode = 'medical';
var editingMode = false;

function setEditingMode(enabled) {
    editingMode = Boolean(enabled);
    var supportsSection = document.getElementById('apoyos');
    var toggle = document.getElementById('btn-toggle-editing-mode');
    if (supportsSection) supportsSection.classList.toggle('editing-mode', editingMode);
    if (toggle) {
        toggle.textContent = editingMode ? 'Terminar edición' : 'Editar recomendaciones';
        toggle.setAttribute('aria-pressed', String(editingMode));
    }
    renderSelectedSupportRecommendations();
}

function bindChartToggle() {
    if (document.body.dataset.chartToggleBound === 'true') return;
    document.body.dataset.chartToggleBound = 'true';
    document.addEventListener('click', function(event) {
        var toggle = event.target.closest('.cif-bar-toggle');
        if (!toggle) return;
        var panel = toggle.closest('.barrier-map-panel');
        var chart = panel ? panel.querySelector('.cif-chart') : null;
        if (!chart) return;
        var expanded = toggle.getAttribute('aria-expanded') !== 'false';
        chart.hidden = expanded;
        toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        toggle.textContent = expanded ? 'Mostrar gráfico' : 'Ocultar gráfico';
    });
}

function initModeSelector() {
    bindChartToggle();
    var genMedical = document.getElementById('btn-generate-plan-medical');
    var editToggle = document.getElementById('btn-toggle-editing-mode');

    if (genMedical && genMedical.dataset.boundGen !== 'true') {
        genMedical.addEventListener('click', function() { openPlanModal(); });
        genMedical.setAttribute('data-bound-gen', 'true');
        genMedical.style.display = '';
    }
    if (editToggle && editToggle.dataset.boundEdit !== 'true') {
        editToggle.addEventListener('click', function() {
            setEditingMode(!editingMode);
        });
        editToggle.setAttribute('data-bound-edit', 'true');
        setEditingMode(editingMode);
    }
}

const conditionGridOrder = ['autismo', 'intelectual', 'sordoceguera', 'fisica', 'visual', 'auditiva', 'visceral', 'psiquica', 'vestibular', 'tactil', 'multiple'];

function getSelectedConditionKeys() {
    return selectedConditionKeys.slice();
}

function toggleCondition(key) {
    if (key === 'multiple') {
        var idx = selectedConditionKeys.indexOf('multiple');
        if (idx === -1) {
            selectedConditionKeys.push('multiple');
        } else {
            var components = selectedConditionKeys.filter(function(k) { return k !== 'multiple'; });
            selectedConditionKeys.length = 0;
            if (components.length) {
                selectedConditionKeys.push(components[0]);
            }
        }
    } else {
        var isMultipleMode = selectedConditionKeys.indexOf('multiple') !== -1;
        var idx = selectedConditionKeys.indexOf(key);

        if (isMultipleMode) {
            if (idx === -1) {
                selectedConditionKeys.push(key);
            } else {
                selectedConditionKeys.splice(idx, 1);
            }
        } else {
            if (idx === -1) {
                selectedConditionKeys.length = 0;
                selectedConditionKeys.push(key);
            } else {
                selectedConditionKeys.splice(idx, 1);
            }
        }
    }
    renderConditionPills();
    renderConditionDetail();
    renderSelectedSupportRecommendations();
}

function initConditionPills() {
    initModeSelector();
    currentMode = 'medical';
    renderMedicalStudents(renderSelectedSupportRecommendations);
    renderSelectedSupportRecommendations();
    setEditingMode(editingMode);
}

function renderConditionPills() {
    var container = document.getElementById('condition-pills-medical') || document.getElementById('condition-pills');
    if (!container) return;

    var isMultipleMode = selectedConditionKeys.indexOf('multiple') !== -1;

    container.innerHTML = conditionGridOrder.map(function(key) {
        var isMultiple = key === 'multiple';
        var data = accommodationsData[key];
        if (!data && !isMultiple) return '';
        var isSelected = selectedConditionKeys.indexOf(key) !== -1;
        var classes = 'condition-pill';
        if (isSelected) classes += ' active';
        if (isMultiple && isSelected) classes += ' multiple';
        if (!isMultiple && isMultipleMode && isSelected) classes += ' component';

        var label = isMultiple ? 'Múltiple' : shortConditionNames[key];
        return '<button class="' + classes + '" data-condition-key="' + key + '">' +
            '<span class="condition-pill-name">' + label + '</span>' +
            '</button>';
    }).join('');

    container.querySelectorAll('.condition-pill').forEach(function(pill) {
        pill.addEventListener('click', function() {
            toggleCondition(pill.getAttribute('data-condition-key'));
        });
    });
}

function renderConditionDetail() {
    var detail = document.getElementById('condition-detail-medical') || document.getElementById('condition-detail');
    if (!detail) return;

    if (!selectedConditionKeys.length) {
        detail.innerHTML = '<p class="condition-detail-hint">Selecciona una condición para ver sus recomendaciones de apoyo.</p>';
        return;
    }

    var isMultipleMode = selectedConditionKeys.indexOf('multiple') !== -1;
    var componentKeys = selectedConditionKeys.filter(function(k) { return k !== 'multiple'; });

    if (isMultipleMode && !componentKeys.length) {
        detail.innerHTML = '<p class="condition-detail-hint">Selecciona las condiciones que deseas combinar.</p>';
        return;
    }

    var students = getSelectedSupportStudentGroups();

    if (!students.length) {
        detail.innerHTML = '<p class="condition-detail-hint">No se encontraron recomendaciones para las condiciones seleccionadas.</p>';
        return;
    }

    var radarId = 'cif-radar-detail';
    var profilesHtml = renderCIFChartPanel(students, radarId) +
    students.map(function(student) {
        var group = {
            conditions: student.conditions,
            students: [{ label: student.label, name: student.name, cardIndex: student.cardIndex }]
        };
        try { return renderProfileGroup(group); } catch (e) { return ''; }
    }).join('');

    var conditionNames = componentKeys.map(function(k) {
        var d = accommodationsData[k];
        return d ? d.name : shortConditionNames[k] || k;
    }).join(' + ');

    detail.innerHTML =
        '<div class="results-title-header">' +
            '<div>' +
                '<h3>Recomendaciones por estudiante</h3>' +
                '<p>El color orienta la prioridad de apoyo: observar, ajustar o intervenir. Revisa las recomendaciones como acuerdos editables según la barrera observada y la conversación con el estudiante.</p>' +
            '</div>' +
        '</div>' +
        profilesHtml;

    activateCIFChartPanel(students, radarId);
}

function getStudentMatrixProfile(studentIndex) {
    const entry = matrixData[studentIndex];
    return entry && entry.applied ? entry.profile : null;
}

function getStudentAssessmentSource(studentIndex) {
    const entry = matrixData[studentIndex];
    return entry && entry.applied ? (entry.source || 'matrix') : 'standard';
}

function getStudentMatrixScores(studentIndex) {
    const entry = matrixData[studentIndex];
    return entry ? entry.scores || {} : {};
}

function hasEnteredMatrixScores(studentIndex) {
    return Object.values(readStudentMatrixScores(studentIndex)).some(function(value) {
        return Number(value || 0) > 0;
    });
}

function renderSupports() {
    const results = document.getElementById('support-results');
    if (!results) return;
    renderSelectedSupportRecommendations();
}

function renderSelectedSupportRecommendations() {
    var results = document.getElementById('support-results');
    if (!results) return;
    var layout = document.querySelector('.support-layout');

    var students = getSelectedSupportStudentGroups();

    if (!students.length) {
        results.classList.add('hidden');
        results.innerHTML = '';
        if (layout) layout.style.display = 'none';
        return;
    }

    if (layout) layout.style.display = '';
    results.classList.remove('hidden');
    var hasMultiple = students.some(function(s) { return s.conditions && s.conditions.length > 1; });
    var hasMatrixApplied = students.some(function(student) {
        return !!getStudentMatrixProfile(student.cardIndex);
    });
    var descriptionText = hasMatrixApplied
        ? 'Lee este gráfico como un mapa de énfasis: muestra dónde conviene concentrar observación, coordinación o apoyo. En las recomendaciones siguientes, el semáforo precisa la prioridad de cada ajuste.'
        : hasMultiple
        ? 'Estas orientaciones combinan condiciones seleccionadas y evitan duplicar apoyos. Úsalas como referencia inicial mientras identificas barreras concretas.'
        : 'Estas orientaciones sirven como referencia cuando no hay ficha disponible. La decisión final debe ajustarse a la barrera observada y al diálogo con el estudiante.';

    var radarId = 'cif-radar-results';
    var profilesHtml = '';
    try {
        profilesHtml = students.map(function(student) {
            var group = {
                conditions: student.conditions,
                students: [{ label: student.label, name: student.name, cardIndex: student.cardIndex }]
            };
            try { return renderProfileGroup(group); } catch (e) { return '<p style="color:red">Error en recomendaciones: ' + e.message + '</p>'; }
        }).join('');
    } catch (e) {
        console.error('Error general en profiles:', e.message);
        profilesHtml = '<p style="color:red">Error en recomendaciones: ' + e.message + '</p>';
    }

    profilesHtml = renderCIFChartPanel(students, radarId) + profilesHtml;

    var headerHtml = hasMatrixApplied
        ? '<div class="results-title-header"><div><span class="source-pill">Perfil CIF</span><p>' + descriptionText + '</p></div></div>'
        : '<div class="results-title-header"><div><span class="source-pill">Consultor por condici\u00f3n</span><h3>Orientaciones iniciales para observar barreras</h3><p>' + descriptionText + '</p></div></div>';

    results.innerHTML = headerHtml + profilesHtml;
    activateCIFChartPanel(students, radarId);
    bindRecommendationEditing();
    bindManualRecommendationEditing();
    bindAdvisorCommentFields();
    bindClarificationModal();
    bindClarificationButtons();
}

var cifChartView = null;

function studentHasMatrix(student, index) {
    var scores = getStudentMatrixScores(student.cardIndex || student.index || (index + 1));
    return Object.values(scores).some(function(v) { return Number(v || 0) > 0; });
}

function getChartStudents(students) {
    var withMatrix = students.filter(function(student, index) { return studentHasMatrix(student, index); });
    var chosen = withMatrix.filter(function(student) {
        var card = document.querySelector('.support-student-card[data-student-index="' + student.cardIndex + '"]');
        var box = card ? card.querySelector('.show-in-chart') : null;
        return box && box.checked;
    });
    return chosen.length ? chosen : withMatrix;
}

function renderCIFChartPanel(students, radarId) {
    var chartStudents = getChartStudents(students || []);
    if (!chartStudents.length) {
        if (!students || !students.length) return '';
        return '<section class="cif-chart-panel cif-chart-empty" aria-labelledby="' + radarId + '-title">' +
            '<h3 id="' + radarId + '-title">Mapa de barreras CIF</h3>' +
            '<p>El mapa aparece cuando completas la matriz CIF de al menos un estudiante. Ábrela en su tarjeta, en «Ajustar perfil con matriz CIF».</p>' +
        '</section>';
    }
    var view = cifChartView || (chartStudents.length > 1 ? 'radar' : 'bars');
    var radarNote = chartStudents.length > 3 ? '<p class="small-note cif-radar-note">El radar compara hasta 3 estudiantes. Marca «Incluir en el gráfico» en las fichas para elegir cuáles, o usa la vista Detalle.</p>' : '';
    return '<section class="cif-chart-panel" aria-labelledby="' + radarId + '-title" data-view="' + view + '">' +
        '<div class="cif-chart-head">' +
            '<div>' +
                '<h3 id="' + radarId + '-title">Mapa de barreras CIF</h3>' +
                '<p>Nivel de ajuste sugerido por actividad, de 0 (sin ajuste) a 3 (prioritario), según la matriz CIF.</p>' +
            '</div>' +
            '<div class="cif-view-switch" role="group" aria-label="Tipo de gráfico">' +
                '<button type="button" data-cif-view="radar" aria-pressed="' + (view === 'radar') + '">Comparar</button>' +
                '<button type="button" data-cif-view="bars" aria-pressed="' + (view === 'bars') + '">Detalle</button>' +
            '</div>' +
        '</div>' +
        '<div class="cif-view-radar"' + (view === 'radar' ? '' : ' hidden') + '>' + radarNote + '<div id="' + radarId + '" class="cif-radar-container"></div></div>' +
        '<div class="cif-view-bars"' + (view === 'bars' ? '' : ' hidden') + '>' + renderCIFBarChart(chartStudents, { bare: true }) + '</div>' +
    '</section>';
}

function activateCIFChartPanel(students, radarId) {
    var container = document.getElementById(radarId);
    if (!container) return;
    var panel = container.closest('.cif-chart-panel');
    var chartStudents = getChartStudents(students || []).slice(0, 3);
    var radarView = panel.querySelector('.cif-view-radar');
    if (!radarView.hidden) renderCIFRadarChart(chartStudents, radarId);
    panel.querySelectorAll('[data-cif-view]').forEach(function(button) {
        button.addEventListener('click', function() {
            var view = button.getAttribute('data-cif-view');
            cifChartView = view;
            panel.setAttribute('data-view', view);
            panel.querySelectorAll('[data-cif-view]').forEach(function(b) {
                b.setAttribute('aria-pressed', String(b === button));
            });
            panel.querySelector('.cif-view-bars').hidden = view !== 'bars';
            radarView.hidden = view !== 'radar';
            if (view === 'radar' && !container.__cifRadarChart) renderCIFRadarChart(chartStudents, radarId);
        });
    });
}

function renderCIFBarChart(students, options) {
    options = options || {};
    var activities = window.UiePlannerData.accessMatrixActivities;
    var hasAnyMatrix = false;

    var studentCols = [];
    var chartStudents = options.bare ? students.filter(function(student, index) { return studentHasMatrix(student, index); }) : students;
    chartStudents.slice(0, 4).forEach(function(student, index) {
        var studentIndex = student.cardIndex || (index + 1);
        var matrixScores = getStudentMatrixScores(studentIndex);
        var hasMatrix = Object.values(matrixScores).some(function(v) { return Number(v || 0) > 0; });

        var rows;
        var isReference;
        if (hasMatrix) {
            hasAnyMatrix = true;
            isReference = false;
            rows = activities.map(function(act) {
                var score = Number(matrixScores[act.id] || 0);
                var requirement = scoreToRequirement(score);
                return { id: act.id, score: score, severity: requirement };
            });
        } else {
            isReference = true;
            var condKeys = student.conditions.map(function(c) { return c.key; });
            rows = activities.map(function(act) {
                var maxSev = 0;
                condKeys.forEach(function(ck) {
                    var profile = barrierProfiles[ck];
                    if (!profile) return;
                    act.dims.forEach(function(dim) {
                        maxSev = Math.max(maxSev, profile[dim] || 0);
                    });
                });
                return { id: act.id, score: 0, severity: maxSev };
            });
        }

        studentCols.push({ label: formatStudentLabel(student), rows: rows, isReference: isReference });
    });

    var extraCount = Math.max(0, chartStudents.length - 4);

    if (!hasAnyMatrix) return '';
    if (options.bare) {
        studentCols = studentCols.filter(function(col) { return !col.isReference; });
    }

    var headerCells = studentCols.map(function(col) {
        return '<th scope="col">' + escapeSupportHtml(col.label) + '</th>';
    }).join('');

    var bodyRows = activities.map(function(act, ai) {
        var label = shortActivityLabels[act.id] || act.label;
        var cells = studentCols.map(function(col) {
            var level = Math.max(0, Math.min(3, col.rows[ai].severity));
            var widthPct = level > 0 ? Math.round((level / 3) * 100) : 0;
            return '<td>' +
                '<span class="cif-meter" aria-hidden="true"><span class="cif-minibar requirement-level-' + level + '" style="width:' + widthPct + '%"></span></span>' +
                '<span class="cif-value' + (level ? '' : ' is-zero') + '" aria-hidden="true">' + level + '</span>' +
                '<span class="sr-only">' + requirementLabel(level) + '</span>' +
                '</td>';
        }).join('');
        return '<tr><th scope="row">' + escapeSupportHtml(label) + '</th>' + cells + '</tr>';
    }).join('');

    var sourceLabel = hasAnyMatrix ? 'Matriz CIF aplicada' : 'Orientaci\u00f3n por condici\u00f3n';
    var descText = hasAnyMatrix
        ? 'Datos de la matriz CIF del estudiante. Cada barra muestra el nivel de apoyo sugerido seg\u00fan la compatibilidad registrada.'
        : 'Valores de referencia basados en el perfil t\u00edpico de la condici\u00f3n. Aplica la matriz CIF para obtener datos reales del estudiante.';

    var legendHtml = '<ul class="cif-legend" aria-label="Niveles de barrera">' +
        [0,1,2,3].map(function(lvl) {
            return '<li><span class="cif-swatch requirement-level-' + lvl + '" aria-hidden="true"></span>' + lvl + ' · ' + requirementLabel(lvl) + '</li>';
        }).join('') +
        '</ul>';

    if (options.bare) {
        return '<div class="cif-chart">' +
            '<table class="cif-table">' +
                '<caption class="sr-only">Nivel de barrera por actividad CIF y estudiante, de 0 a 3</caption>' +
                '<thead><tr><th scope="col">Actividad CIF</th>' + headerCells + '</tr></thead>' +
                '<tbody>' + bodyRows + '</tbody>' +
            '</table>' +
            legendHtml +
            (extraCount ? '<p class="small-note">Se muestran los primeros 4 estudiantes con matriz. Usa «Incluir en el gráfico» para elegir otros.</p>' : '') +
        '</div>';
    }

    return '<div class="barrier-map-panel">' +
        '<div class="resource-heading">' +
            '<span class="source-pill">' + sourceLabel + '</span>' +
            '<div class="barrier-map-heading">' +
                '<div>' +
                    '<h3>Apoyos sugeridos por actividad CIF</h3>' +
                    '<p>' + descText + '</p>' +
                '</div>' +
                (options.hideToggle ? '' : '<button class="btn btn-secondary btn-sm cif-bar-toggle" type="button" aria-expanded="true">Ocultar gr\u00e1fico</button>') +
            '</div>' +
        '</div>' +
        '<div class="cif-chart">' +
            '<table class="cif-table">' +
                '<caption class="sr-only">Nivel de barrera por actividad CIF y estudiante, de 0 a 3</caption>' +
                '<thead><tr><th scope="col">Actividad CIF</th>' + headerCells + '</tr></thead>' +
                '<tbody>' + bodyRows + '</tbody>' +
            '</table>' +
            legendHtml +
            (extraCount ? '<p class="small-note">+ ' + extraCount + ' estudiante(s) no graficados.</p>' : '') +
        '</div>' +
        '</div>';
}

var CIF_RADAR_COLORS = [
    { border: '#2a78d6', bg: 'rgba(42,120,214,0.10)' },
    { border: '#eb6834', bg: 'rgba(235,104,52,0.10)' },
    { border: '#1baf7a', bg: 'rgba(27,175,122,0.10)' },
    { border: '#eda100', bg: 'rgba(237,161,0,0.10)' },
    { border: '#e87ba4', bg: 'rgba(232,123,164,0.10)' },
    { border: '#008300', bg: 'rgba(0,131,0,0.10)' },
    { border: '#6250d6', bg: 'rgba(98,80,214,0.10)' },
    { border: '#e34948', bg: 'rgba(227,73,72,0.10)' }
];

function getRadarThemeColors() {
    var isDark = document.body.classList.contains('theme-dark');
    return {
        textColor: isDark ? '#e8eaed' : '#0d0d0d',
        gridColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)',
        angleColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.18)',
        tickColor: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
    };
}

function getCIFRadarLabels() {
    return window.UiePlannerData.accessMatrixActivities.map(function(a) {
        return shortActivityLabels[a.id] || a.label;
    });
}

function getCIFRadarDataset(student, index) {
    var studentIndex = student.cardIndex || (index + 1);
    var matrixScores = getStudentMatrixScores(studentIndex);
    var hasMatrix = Object.values(matrixScores).some(function(v) { return Number(v || 0) > 0; });
    var color = CIF_RADAR_COLORS[index % CIF_RADAR_COLORS.length];

    var data;
    if (hasMatrix) {
        data = window.UiePlannerData.accessMatrixActivities.map(function(act) {
            var score = Number(matrixScores[act.id] || 0);
            return score > 0 ? 4 - score : 0;
        });
    } else {
        data = window.UiePlannerData.accessMatrixActivities.map(function() { return 0; });
    }

    return {
        label: formatStudentLabel(student),
        data: data,
        borderColor: color.border,
        backgroundColor: color.bg,
        borderWidth: 2,
        pointBackgroundColor: color.border,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0
    };
}

function renderCIFRadarChart(students, containerId, options) {
    options = options || {};
    if (typeof Chart === 'undefined') return;

    var container = document.getElementById(containerId);
    if (!container) return;

    var prevChart = container.__cifRadarChart;
    if (prevChart) { prevChart.destroy(); container.__cifRadarChart = null; }
    container.innerHTML = '';

    if (!students || !students.length) return;

    var filteredStudents = [];
    students.forEach(function(student, idx) {
        var studentIndex = student.cardIndex || (idx + 1);
        var matrixScores = getStudentMatrixScores(studentIndex);
        var hasMatrix = Object.values(matrixScores).some(function(v) {
            return Number(v || 0) > 0;
        });
        if (hasMatrix) filteredStudents.push(student);
    });
    if (!filteredStudents.length) return;

    container.__radarStudents = students;
    container.__radarOptions = options;

    var card = document.createElement('div');
    card.className = 'cif-radar-card';

    var body = document.createElement('div');
    body.className = 'cif-radar-body';

    var wrapper = document.createElement('div');
    wrapper.className = 'cif-radar-wrapper';

    var canvas = document.createElement('canvas');
    wrapper.appendChild(canvas);
    body.appendChild(wrapper);

    var legendEl = document.createElement('div');
    legendEl.className = 'cif-radar-legend-right';
    body.appendChild(legendEl);
    card.appendChild(body);
    container.appendChild(card);

    var labels = getCIFRadarLabels();
    var datasets = filteredStudents.map(function(s, i) {
        return getCIFRadarDataset(s, i);
    });

    var ctx = canvas.getContext('2d');
    var theme = getRadarThemeColors();
    try {
        var chart = new Chart(ctx, {
            type: 'radar',
            data: { labels: labels, datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 0,
                        max: 3,
                        ticks: {
                            stepSize: 1,
                            font: { size: 10 },
                            color: theme.tickColor,
                            backdropColor: 'transparent',
                            callback: function(value) {
                                return value > 0 ? String(value) : '';
                            }
                        },
                        pointLabels: {
                            font: { size: 11, weight: '600' },
                            color: theme.textColor
                        },
                        grid: {
                            color: theme.gridColor
                        },
                        angleLines: {
                            color: theme.angleColor
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                var label = context.dataset.label || '';
                                var val = context.raw;
                                var adjLabel = val === 3 ? 'Ajuste prioritario' : val === 2 ? 'Ajuste moderado' : val === 1 ? 'Ajuste menor' : 'Sin ajuste necesario';
                                var cifOriginal = val === 3 ? 'CIF: Incompatible' : val === 2 ? 'CIF: Parcial' : val === 1 ? 'CIF: Buena' : 'CIF: Perfecta / Sin dato';
                                return label + ': ' + adjLabel + ' (' + cifOriginal + ')';
                            }
                        }
                    }
                }
            }
        });
        container.__cifRadarChart = chart;

        var legendTitle = document.createElement('div');
        legendTitle.className = 'radar-legend-title';
        legendTitle.textContent = 'Estudiantes';
        legendEl.appendChild(legendTitle);

        filteredStudents.forEach(function(student, i) {
            var color = CIF_RADAR_COLORS[i % CIF_RADAR_COLORS.length];
            var item = document.createElement('button');
            item.type = 'button';
            item.className = 'radar-legend-item';
            item.setAttribute('aria-pressed', 'true');

            var dot = document.createElement('span');
            dot.className = 'legend-item-dot';
            dot.setAttribute('aria-hidden', 'true');
            dot.style.backgroundColor = color.border;

            var label = document.createElement('span');
            label.className = 'legend-item-label';
            label.textContent = formatStudentLabel(student);

            item.appendChild(dot);
            item.appendChild(label);

            item.addEventListener('click', function() {
                var meta = chart.getDatasetMeta(i);
                var wasHidden = !!(meta.hidden || false);
                chart.setDatasetVisibility(i, wasHidden);
                item.classList.toggle('radar-hidden', !wasHidden);
                item.setAttribute('aria-pressed', wasHidden ? 'true' : 'false');
                chart.update();
            });

            legendEl.appendChild(item);
        });
    } catch (e) {
        console.error('Error al crear radar chart:', e);
    }
}

function destroyCIFRadarChart(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var chart = container.__cifRadarChart;
    if (chart) { chart.destroy(); container.__cifRadarChart = null; }
}

function rethemeAllRadarCharts(theme) {
    theme = theme || getRadarThemeColors();
    var containers = document.querySelectorAll('[id^="cif-radar-"]');
    containers.forEach(function(container) {
        var chart = container.__cifRadarChart;
        if (!chart) return;
        var opts = chart.options;
        if (opts.scales && opts.scales.r) {
            var rScale = opts.scales.r;
            if (rScale.ticks) rScale.ticks.color = theme.tickColor;
            if (rScale.pointLabels) rScale.pointLabels.color = theme.textColor;
            if (rScale.grid) rScale.grid.color = theme.gridColor;
            if (rScale.angleLines) rScale.angleLines.color = theme.angleColor;
        }
        if (opts.plugins && opts.plugins.legend && opts.plugins.legend.labels) {
            opts.plugins.legend.labels.color = theme.textColor;
        }
        chart.update('none');

        var legendEl = container.querySelector('.cif-radar-legend-right');
        if (legendEl) {
            legendEl.querySelectorAll('.legend-item-label').forEach(function(el) {
                el.style.color = theme.textColor;
            });
        }
    });
}

function mergeConditionProfiles(conditionKeys) {
    return barrierDimensions.reduce(function(profile, dimension) {
        profile[dimension.key] = conditionKeys.reduce(function(max, key) {
            var value = barrierProfiles[key] ? (barrierProfiles[key][dimension.key] || 0) : 0;
            return Math.max(max, value);
        }, 0);
        return profile;
    }, {});
}

function renderGoodPractices() {
    const container = document.getElementById('good-practices');
    if (!container) return;
    container.innerHTML = `
        <div class="resource-heading">
            <span class="source-pill">Adecuaciones de Acceso</span>
            <h3>Buenas prácticas antes de seleccionar una adecuación</h3>
        </div>
        <div class="good-grid">
            ${goodPracticesData.map(item => `
                <article class="mini-card">
                    <h4>${item.title}</h4>
                    <p>${item.text}</p>
                </article>
            `).join('')}
        </div>
    `;
}

function renderMedicalStudents(onStudentChange) {
    var container = document.getElementById('support-students-medical');
    var addBtn = document.getElementById('add-student-btn-medical');
    if (!container) return;

    var count = Number(container.getAttribute('data-student-count')) || 1;
    count = Math.max(1, Math.min(8, count));
    container.setAttribute('data-student-count', String(count));

    var existingCards = container.querySelectorAll('.support-student-card');
    var existingCount = existingCards.length;

    if (count > existingCount) {
        for (var i = existingCount; i < count; i++) {
            container.appendChild(createMedicalStudentCard(i + 1));
        }
    } else if (count < existingCount) {
        for (var j = existingCount - 1; j >= count; j--) {
            existingCards[j].remove();
        }
    }

    container.querySelectorAll('.support-student-card:not([data-events-bound])').forEach(function(card) {
        var studentIndex = card.getAttribute('data-student-index');

        var nameInput = card.querySelector('.student-name');
        if (nameInput) {
            nameInput.addEventListener('change', function() {
                renderSelectedSupportRecommendations();
            });
        }

        card.querySelectorAll('.show-in-chart').forEach(function(cb) {
            cb.addEventListener('change', function() {
                if (this.checked) {
                    var idx = card.getAttribute('data-student-index');
                    var scores = getStudentMatrixScores(idx);
                    var hasRealScores = Object.values(scores).some(function(v) { return Number(v || 0) > 0; });
                    if (!hasRealScores) {
                        this.checked = false;
                        showToast('Para ver el gráfico, completa la rúbrica CIF del estudiante.');
                        return;
                    }
                }
                renderSelectedSupportRecommendations();
            });
        });

        card.querySelectorAll('input[type="radio"][name^="student-matrix"]').forEach(function(radio) {
            radio.addEventListener('change', function() {
                updateStudentMatrixBadge(studentIndex);
                if (readMedicalConditionKeys(studentIndex).length) {
                    applyStudentMatrix(studentIndex);
                }
            });
        });

        var clearMatrixBtn = card.querySelector('.clear-assessment');
        var closeMatrixBtn = card.querySelector('.close-matrix');
        if (clearMatrixBtn) clearMatrixBtn.addEventListener('click', function() { clearStudentMatrix(studentIndex); });
        if (closeMatrixBtn) closeMatrixBtn.addEventListener('click', function() {
            var details = card.querySelector('.student-matrix-toggle');
            if (details) details.removeAttribute('open');
        });

        var removeBtn = card.querySelector('.btn-remove-student');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() { removeLastMedicalStudent(onStudentChange); });
        }

        card.setAttribute('data-events-bound', '');
    });

    if (addBtn && addBtn.dataset.boundMedical !== 'true') {
        addBtn.addEventListener('click', function() { addMedicalStudentCard(onStudentChange); });
        addBtn.setAttribute('data-bound-medical', 'true');
    }

    updateMedicalRemoveButtons();
    updateMedicalAddButton();
    updateMedicalConditionSummaries();
    container.querySelectorAll('.support-student-card').forEach(function(card) {
        updateStudentMatrixBadge(card.getAttribute('data-student-index'));
    });
}

function renderSupportStudents(onStudentChange) {
    renderMedicalStudents(onStudentChange || renderSelectedSupportRecommendations);
}

function createAssessmentRows(studentIndex, prefix) {
    var activities = window.UiePlannerData.accessMatrixActivities;
    return activities.map(function(act) {
        var cells = [4, 3, 2, 1].map(function(val) {
            return '<td class="matrix-col-score">' +
                '<label class="matrix-radio-group">' +
                '<input type="radio" name="' + prefix + '-' + studentIndex + '-' + act.id + '" value="' + val + '">' +
                '<span>' + val + '</span>' +
                '</label></td>';
        }).join('');
        return '<tr><td class="matrix-activity-label">' + act.label + '</td>' + cells + '</tr>';
    }).join('');
}

function createMedicalStudentCard(studentIndex) {
    var wrapper = document.createElement('article');
    wrapper.className = 'support-student-card';
    wrapper.setAttribute('data-student-index', String(studentIndex));
    wrapper.setAttribute('data-multiple', 'false');

    var pillsHtml = conditionGridOrder.map(function(key) {
        var isMultiple = key === 'multiple';
        var data = accommodationsData[key];
        if (!data && !isMultiple) return '';
        var label = isMultiple ? 'Múltiple' : (shortConditionNames[key] || key);
        var extraClass = isMultiple ? ' multiple' : '';
        return '<button class="condition-pill' + extraClass + '" data-condition-key="' + key + '">' +
            '<span class="condition-pill-name">' + label + '</span>' +
            '</button>';
    }).join('');

    var matrixRows = createAssessmentRows(studentIndex, 'student-matrix');

    wrapper.innerHTML =
        '<h4>Estudiante ' + studentIndex + '</h4>' +
        '<p class="privacy-hint">Los datos personales son opcionales. Puedes usar iniciales o un código. <button type="button" class="privacy-info-btn" data-open-privacy>¿Qué debo considerar?</button></p>' +
        '<div class="student-management-fields">' +
            '<label><span>Nombre (opcional)</span><input id="student-name-medical-' + studentIndex + '" class="text-control student-name student-profile-field student-personal-field" type="text" autocomplete="off" placeholder="Estudiante ' + studentIndex + '"></label>' +
            '<label><span>RUT (opcional)</span><input class="text-control student-rut student-profile-field student-personal-field" type="text" autocomplete="off" placeholder="Sin informar"></label>' +
            '<label><span>Carrera (opcional)</span><input class="text-control student-career student-profile-field" type="text" placeholder="Sin informar"></label>' +
            '<label><span>Código asignatura (opcional)</span><input class="text-control student-section student-profile-field" type="text" placeholder="Sin informar"></label>' +
        '</div>' +
        '<div class="student-card-status" id="student-status-medical-' + studentIndex + '">Sin condición de referencia seleccionada</div>' +
        '<p class="condition-consultor-note">Selecciona una condición solo para orientar la observación. Luego formula el ajuste desde la barrera concreta, no desde la etiqueta.</p>' +
        '<div class="condition-pills-inline" id="condition-pills-card-' + studentIndex + '">' +
            pillsHtml +
        '</div>' +
        '<details class="student-context-toggle">' +
            '<summary>Contexto para decidir los apoyos <span class="student-context-optional">(opcional)</span></summary>' +
            '<div class="student-context-body">' +
                '<label class="student-context-field"><span>¿Qué evalúa la asignatura?</span>' +
                    '<textarea class="text-control student-outcome" rows="2" placeholder="Ejemplo: diagnostica fallas eléctricas en un circuito residencial…"></textarea></label>' +
                '<fieldset class="student-context-formats">' +
                    '<legend>¿Algún formato es parte de lo que se evalúa?</legend>' +
                    '<p class="student-context-help">Márcalo solo si el formato es la competencia y no solo el medio para demostrarla. En ese caso, el PDF marcará para revisar los apoyos que lo cambian.</p>' +
                    '<label><input type="checkbox" class="student-format" value="oral"> Comunicación oral</label>' +
                    '<label><input type="checkbox" class="student-format" value="escrito"> Producción escrita</label>' +
                    '<label><input type="checkbox" class="student-format" value="tiempo"> Rapidez o tiempo límite</label>' +
                    '<label><input type="checkbox" class="student-format" value="practico"> Ejecución práctica o manual</label>' +
                '</fieldset>' +
                '<label class="student-context-field"><span>Lo que el estudiante dice que le funciona</span>' +
                    '<textarea class="text-control student-voice" rows="2" placeholder="Ejemplo: recibir el material antes de clase y responder por escrito…"></textarea></label>' +
                '<p class="student-context-help">Registra solo lo que el estudiante aceptó compartir. Aparecerá en el PDF.</p>' +
            '</div>' +
        '</details>' +
        '<label class="radar-visibility-toggle">' +
            '<input type="checkbox" class="show-in-chart">' +
            '<span>Incluir en el gráfico</span>' +
        '</label>' +
        '<details class="student-matrix-toggle assessment-tools">' +
            '<summary>Ajustar perfil con matriz CIF <span class="student-matrix-badge" id="student-matrix-badge-' + studentIndex + '"></span></summary>' +
            '<div class="assessment-tool-grid">' +
                '<section class="student-matrix-section">' +
                    '<h5 class="matrix-heading">Matriz de acceso CIF/OMS</h5>' +
                    '<p class="matrix-help">Puede llenarse desde la ficha del estudiante y ajustarse posteriormente con evidencia del aula.</p>' +
                    '<div class="student-matrix-wrap"><table class="student-matrix-table">' +
                        '<thead><tr><th>Actividad</th><th class="matrix-col-score">4</th><th class="matrix-col-score">3</th><th class="matrix-col-score">2</th><th class="matrix-col-score">1</th></tr></thead>' +
                        '<tbody>' + matrixRows + '</tbody>' +
                    '</table>' +
                    '<div class="student-matrix-legend"><span><strong>4</strong> participa sin ajustes</span><span><strong>3</strong> observar</span><span><strong>2</strong> requiere apoyo</span><span><strong>1</strong> no participa sin apoyo</span></div><p class="matrix-help">La matriz mide compatibilidad: 4 es mayor compatibilidad y 1 es menor compatibilidad. El grafico invierte esa escala para mostrar necesidad de apoyo.</p></div>' +
                    '<div class="student-matrix-actions"><button class="btn btn-secondary btn-sm clear-assessment" type="button">Limpiar matriz</button><button class="btn btn-secondary btn-sm close-matrix" type="button">Ocultar matriz</button></div>' +
                '</section>' +
            '</div>' +
        '</details>' +
        '<button class="btn-remove-student" type="button" title="Eliminar estudiante" style="display:none">&times;</button>';

    wrapper.querySelectorAll('.condition-pill').forEach(function(pill) {
        pill.addEventListener('click', function() {
            var key = pill.getAttribute('data-condition-key');
            var isMultiplePill = key === 'multiple';
            var isMultipleMode = wrapper.getAttribute('data-multiple') === 'true';

            if (isMultiplePill) {
                var newMode = !isMultipleMode;
                wrapper.setAttribute('data-multiple', String(newMode));
                if (newMode) {
                    pill.classList.add('active');
                } else {
                    pill.classList.remove('active');
                    var activePills = wrapper.querySelectorAll('.condition-pill.active:not(.multiple)');
                    if (activePills.length > 1) {
                        for (var i = 1; i < activePills.length; i++) {
                            activePills[i].classList.remove('active');
                        }
                    }
                }
            } else {
                if (isMultipleMode) {
                    pill.classList.toggle('active');
                } else {
                    var wasActive = pill.classList.contains('active');
                    wrapper.querySelectorAll('.condition-pill:not(.multiple)').forEach(function(p) {
                        p.classList.remove('active');
                    });
                    if (!wasActive) pill.classList.add('active');
                }
            }

            updateMedicalConditionSummaries(studentIndex);
            if ((matrixData[studentIndex] && matrixData[studentIndex].applied) || hasEnteredMatrixScores(studentIndex)) {
                applyStudentMatrix(studentIndex);
                return;
            }
            updateMedicalAddButton();
            updateMedicalRemoveButtons();
            renderSelectedSupportRecommendations();
        });
    });

    return wrapper;
}

function addMedicalStudentCard(onStudentChange) {
    var container = document.getElementById('support-students-medical');
    if (!container) return;
    var count = Number(container.getAttribute('data-student-count')) || 1;
    if (count >= 8) return;
    container.setAttribute('data-student-count', String(count + 1));
    renderMedicalStudents(onStudentChange);
}

function removeLastMedicalStudent(onStudentChange) {
    var container = document.getElementById('support-students-medical');
    if (!container) return;
    var count = Number(container.getAttribute('data-student-count')) || 1;
    if (count <= 1) return;
    var cards = container.querySelectorAll('.support-student-card');
    if (cards.length > 0) cards[cards.length - 1].remove();
    container.setAttribute('data-student-count', String(count - 1));
    updateMedicalRemoveButtons();
    updateMedicalAddButton();
    updateMedicalConditionSummaries();
    if (typeof onStudentChange === 'function') onStudentChange();
}

function updateMedicalAddButton() {
    var addBtn = document.getElementById('add-student-btn-medical');
    var container = document.getElementById('support-students-medical');
    if (!addBtn || !container) return;
    var count = Number(container.getAttribute('data-student-count')) || 1;
    if (count >= 8) { addBtn.style.display = 'none'; return; }
    var cards = container.querySelectorAll('.support-student-card');
    var lastCard = cards[cards.length - 1];
    if (!lastCard) { addBtn.style.display = 'none'; return; }
    var hasCondition = lastCard.querySelectorAll('.condition-pill.active').length > 0;
    addBtn.style.display = hasCondition ? '' : 'none';
}

function updateMedicalRemoveButtons() {
    var container = document.getElementById('support-students-medical');
    if (!container) return;
    var cards = container.querySelectorAll('.support-student-card');
    var count = Number(container.getAttribute('data-student-count')) || 1;
    cards.forEach(function(card, index) {
        var btn = card.querySelector('.btn-remove-student');
        if (!btn) return;
        btn.style.display = (count > 1 && index === cards.length - 1) ? '' : 'none';
    });
}

function updateMedicalConditionSummaries() {
    document.querySelectorAll('#support-students-medical .support-student-card').forEach(function(card) {
        var idx = card.getAttribute('data-student-index');
        var selected = Array.from(card.querySelectorAll('.condition-pill.active'))
            .map(function(pill) {
                var key = pill.getAttribute('data-condition-key');
                return shortConditionNames[key] || key;
            })
            .filter(Boolean);
        var status = document.getElementById('student-status-medical-' + idx) ||
                     document.getElementById('student-status-' + idx);
        if (status) {
            var assessment = getStudentAssessmentSource(idx);
            if (selected.length) {
                status.textContent = selected.join(', ') + (assessment === 'matrix' ? ' · ajustado por matriz CIF' : '');
                status.className = 'student-card-status status-conditions';
                status.title = selected.join(', ');
            } else {
                status.textContent = 'Sin condición de referencia seleccionada';
                status.className = 'student-card-status';
                status.title = '';
            }
        }
    });
}

function updateStudentStatusBadgeForContainer(containerId, idx, conditions) {
    var status = document.getElementById('student-status-' + containerId.replace('support-students-', '') + '-' + idx) ||
                 document.getElementById('student-status-' + idx);
    if (!status) return;
    var hasMatrix = matrixData[idx] && matrixData[idx].applied;
    var hasConditions = conditions ? conditions.length > 0 : false;

    if (hasMatrix) {
        status.textContent = 'Matriz de acceso aplicada';
        status.className = 'student-card-status status-matrix';
    } else if (hasConditions) {
        status.textContent = conditions.length + ' condición(es) seleccionada(s)';
        status.className = 'student-card-status status-conditions';
    } else {
        status.textContent = 'Sin apoyos definidos';
        status.className = 'student-card-status';
    }
}

function getSelectedSupportStudentGroups() {
    var containerId = currentMode === 'social' ? 'support-students-social' : 'support-students-medical';
    var cards = document.querySelectorAll('#' + containerId + ' .support-student-card');

    if (cards.length) {
        return Array.from(cards).map(function(card) {
            var index = card.dataset.studentIndex;
            var name = (card.querySelector('.student-name')?.value || '').trim();
            var activePills = Array.from(card.querySelectorAll('.condition-pill.active'));
            var conditions = activePills
                .map(function(pill) {
                    var key = pill.getAttribute('data-condition-key');
                    var data = accommodationsData[key];
                    if (!data) return null;
                    return { key: key, name: data.name, source: data.source };
                })
                .filter(Boolean);
            return {
                label: 'Estudiante ' + index,
                cardIndex: Number(index),
                name: name,
                conditions: conditions
            };
        }).filter(function(student) {
            return student.conditions.length;
        });
    }

    if (currentMode === 'medical' && selectedConditionKeys.length) {
        var componentKeys = selectedConditionKeys.filter(function(k) { return k !== 'multiple'; });
        if (!componentKeys.length) return [];
        return [{
            label: 'Perfil seleccionado',
            cardIndex: 1,
            name: '',
            conditions: componentKeys.map(function(key) {
                var data = accommodationsData[key];
                return data ? { key: key, name: data.name, source: data.source } : null;
            }).filter(Boolean)
        }];
    }

    return [];
}

function recommendationCategories(condition) {
    return [
        { title: 'Contexto aula', items: condition.context },
        { title: 'Materiales de estudio', items: condition.materials },
        { title: 'Métodos de enseñanza', items: condition.methods },
        { title: 'Interacción en aula', items: condition.interaction },
        { title: 'De las evaluaciones', items: condition.evaluacion },
        { title: 'Tecnologías asistivas', items: condition.tech }
    ];
}

function countRecommendations(condition) {
    return recommendationCategories(condition).reduce((total, group) => total + group.items.length, 0);
}

function groupStudentsByCondition(students) {
    const map = new Map();
    students.forEach(student => {
        student.conditions.forEach(condition => {
            if (!map.has(condition.key)) {
                map.set(condition.key, { condition, students: [] });
            }
            map.get(condition.key).students.push({
                label: student.label,
                name: student.name,
                cardIndex: student.cardIndex
            });
        });
    });
    return Array.from(map.values());
}

function formatStudentLabel(student) {
    return student.name || student.label || ('Estudiante ' + (student.index || student.cardIndex || ''));
}

function groupStudentsByProfile(students) {
    const map = new Map();
    students.forEach(function(student) {
        const key = student.conditions.map(function(c) { return c.key; }).sort().join('|');
        if (!map.has(key)) {
            map.set(key, { conditions: student.conditions.slice(), students: [] });
        }
        map.get(key).students.push({ label: student.label, name: student.name, cardIndex: student.cardIndex });
    });
    return Array.from(map.values());
}

function getMergedRecommendations(conditionKeys) {
    const categories = ['context', 'materials', 'methods', 'interaction', 'evaluacion', 'tech'];
    const result = {};
    var data = recommendationsData || accommodationsData;

    categories.forEach(function(cat) {
        const allItems = [];
        conditionKeys.forEach(function(key) {
            const condition = data[key];
            if (condition && condition[cat]) {
                condition[cat].forEach(function(item) {
                    allItems.push({
                        text: item.text || item,
                        activities: item.activities || [],
                        conditionKey: key,
                        shortName: shortConditionNames[key] || key
                    });
                });
            }
        });

        const applicableMerges = mergeGroups.filter(function(group) {
            if (group.category !== cat) return false;
            const matchCount = group.texts.filter(function(t) {
                return allItems.some(function(item) { return item.text === t; });
            }).length;
            return matchCount >= 2;
        });

        const mergedItems = [];
        const usedTexts = {};

        applicableMerges.forEach(function(group) {
            group.texts.forEach(function(text) { usedTexts[text] = true; });
            var mergedActivities = [];
            group.texts.forEach(function(text) {
                var found = allItems.filter(function(i) { return i.text === text; });
                found.forEach(function(f) {
                    f.activities.forEach(function(a) { if (mergedActivities.indexOf(a) === -1) mergedActivities.push(a); });
                });
            });
            mergedItems.push({ text: group.mergedText, isMerged: true, shortNames: [], activities: mergedActivities });
        });

        allItems.forEach(function(item) {
            if (usedTexts[item.text]) return;
            const existing = mergedItems.find(function(m) { return m.text === item.text && !m.isMerged; });
            if (existing) {
                if (existing.shortNames.indexOf(item.shortName) === -1) {
                    existing.shortNames.push(item.shortName);
                }
                item.activities.forEach(function(a) { if (existing.activities.indexOf(a) === -1) existing.activities.push(a); });
                return;
            }
            mergedItems.push({
                text: item.text,
                isMerged: false,
                shortNames: conditionKeys.length > 1 ? [item.shortName] : [],
                activities: item.activities || []
            });
        });

        result[cat] = mergedItems;
    });

    return result;
}

function hiddenRecommendationKey(cat, text) {
    return cat + '|' + text;
}

function isRecommendationHidden(cat, text) {
    return !!hiddenRecommendations[hiddenRecommendationKey(cat, text)];
}

function concreteRecommendationKey(studentIndex, item) {
    return 'matrix-' + studentIndex + '|' + (item.id || item.text);
}

function isConcreteRecommendationHidden(studentIndex, item) {
    return !!hiddenRecommendations[concreteRecommendationKey(studentIndex, item)];
}

function clarificationKey(studentIndex, activityId) {
    return studentIndex + '|' + activityId;
}

function readClarification(studentIndex, activityId) {
    return clarificationData[clarificationKey(studentIndex, activityId)] || null;
}

function hasClarificationContent(data) {
    if (!data) return false;
    return ['where', 'trigger', 'support', 'source'].some(function(key) {
        return String(data[key] || '').trim().length > 0;
    });
}

function getCategoryRequirementForGroup(group, cat) {
    var hasMatrix = groupHasMatrixProfile(group);
    return group.students.reduce(function(max, student) {
        var profile = getStudentMatrixProfile(student.cardIndex);
        if (hasMatrix && !profile) return max;
        if (!profile) {
            profile = mergeConditionProfiles(group.conditions.map(function(c) { return c.key; }));
        }
        return Math.max(max, profile[cat] || 0);
    }, 0);
}

function requirementDot(value) {
    var level = Math.max(0, Math.min(4, Math.round(value || 0)));
    var label = requirementLabel(level);
    return '<span class="requirement-dot requirement-level-' + level + '" title="' + label + '"></span>';
}

function requirementLabel(value) {
    var level = Math.max(0, Math.min(4, Math.round(value || 0)));
    return level >= 3 ? 'Barrera significativa — intervenir' : level === 2 ? 'Barrera moderada — ajustar' : level === 1 ? 'Barrera leve — observar' : 'Sin barrera detectada';
}

function groupHasMatrixProfile(group) {
    return group.students.some(function(student) {
        return !!getStudentMatrixProfile(student.cardIndex);
    });
}

function escapeSupportHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function(character) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
}

function renderAdvisorCommentFields(group) {
    if (!group.students.length) return '';
    var fields = group.students.map(function(student) {
        var idx = student.cardIndex;
        var label = escapeSupportHtml(formatStudentLabel(student));
        var value = escapeSupportHtml(advisorCommentsByStudent[idx] || '');
        return '<div class="advisor-comment-result-field">' +
            '<label for="advisor-comments-result-' + idx + '">Recomendación adicional del asesor · ' + label + '</label>' +
            '<textarea id="advisor-comments-result-' + idx + '" class="text-control advisor-comments-field advisor-comments-result-field" data-student-index="' + idx + '" rows="4" placeholder="Escribe una recomendación adicional para el PDF, si corresponde.">' + value + '</textarea>' +
            '</div>';
    }).join('');
    return '<div class="advisor-comments-section advisor-comments-results">' + fields + '</div>';
}

function bindAdvisorCommentFields() {
    document.querySelectorAll('.advisor-comments-result-field:not([data-bound])').forEach(function(field) {
        field.addEventListener('input', function() {
            advisorCommentsByStudent[field.getAttribute('data-student-index')] = field.value;
        });
        field.setAttribute('data-bound', 'true');
    });
}

function bindRecommendationEditing() {
    document.querySelectorAll('.recommendation-toggle:not([data-bound])').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var key = btn.getAttribute('data-rec-key');
            if (!key) return;
            hiddenRecommendations[key] = !hiddenRecommendations[key];
            renderSelectedSupportRecommendations();
        });
        btn.setAttribute('data-bound', 'true');
    });
}

function manualCategoryKey(studentIndex, categoryKey) {
    return String(studentIndex) + '::' + categoryKey;
}

function getManualRecommendations(studentIndex, categoryKey) {
    return manualRecommendationsByStudentCategory[manualCategoryKey(studentIndex, categoryKey)] || [];
}

function saveManualRecommendation(studentIndex, categoryKey, text, sourceActivityId, suggestedLabel) {
    var cleanText = String(text || '').trim();
    if (!cleanText) return;
    var key = manualCategoryKey(studentIndex, categoryKey);
    if (!manualRecommendationsByStudentCategory[key]) manualRecommendationsByStudentCategory[key] = [];
    manualRecommendationsByStudentCategory[key].push({
        id: 'manual-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        text: cleanText,
        sourceActivityId: sourceActivityId || '',
        suggestedLabel: suggestedLabel || ''
    });
}

function deleteManualRecommendation(studentIndex, categoryKey, manualId) {
    var key = manualCategoryKey(studentIndex, categoryKey);
    manualRecommendationsByStudentCategory[key] = getManualRecommendations(studentIndex, categoryKey).filter(function(item) {
        return item.id !== manualId;
    });
}

function getManualPromptLabelForCategory(prompts, categoryKey) {
    var prompt = (prompts || []).find(function(item) {
        return (item.dimensions || []).indexOf(categoryKey) !== -1;
    });
    if (!prompt) return 'Agregar recomendación';
    var activity = prompt.activities && prompt.activities.length ? prompt.activities[0] : 'esta barrera';
    var lower = String(activity).toLowerCase();
    if (lower.indexOf('acceder') !== -1 || lower.indexOf('institución') !== -1) {
        return 'Se necesita adecuación en el acceso a la institución';
    }
    return 'Se necesita adecuación para ' + lower;
}

function renderManualRecommendations(studentIndex, categoryKey) {
    return getManualRecommendations(studentIndex, categoryKey).map(function(item) {
        return '<li class="manual-recommendation-item">' +
            '<span class="concrete-recommendation-body">' +
                '<span class="concrete-recommendation-main"><strong class="concrete-recommendation-text">' + escapeSupportHtml(item.text) + '</strong><span class="requirement-badge requirement-level-2">Agregada manualmente</span></span>' +
                (item.suggestedLabel ? '<small class="recommendation-reason">' + escapeSupportHtml(item.suggestedLabel) + '</small>' : '') +
            '</span>' +
            '<button class="manual-recommendation-delete" type="button" data-student-index="' + studentIndex + '" data-category-key="' + categoryKey + '" data-manual-id="' + escapeSupportHtml(item.id) + '">Eliminar</button>' +
        '</li>';
    }).join('');
}

function renderManualRecommendationControls(studentIndex, categoryKey, promptLabel) {
    var label = promptLabel || 'Agregar recomendación';
    return '<li class="manual-recommendation-control" data-student-index="' + studentIndex + '" data-category-key="' + categoryKey + '" data-suggested-label="' + escapeSupportHtml(label) + '">' +
        '<button class="manual-add-button" type="button">+ ' + escapeSupportHtml(label) + '</button>' +
        '<div class="manual-recommendation-editor" hidden>' +
            '<textarea class="text-control manual-recommendation-text" rows="3" placeholder="Escribe la recomendación acordada para esta categoría."></textarea>' +
            '<div class="manual-recommendation-actions">' +
                '<button class="btn btn-primary btn-sm manual-save-button" type="button">Guardar</button>' +
                '<button class="btn btn-secondary btn-sm manual-cancel-button" type="button">Cancelar</button>' +
            '</div>' +
        '</div>' +
    '</li>';
}

function bindManualRecommendationEditing() {
    document.querySelectorAll('.manual-add-button:not([data-bound])').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var control = btn.closest('.manual-recommendation-control');
            if (!control) return;
            var editor = control.querySelector('.manual-recommendation-editor');
            if (editor) editor.hidden = false;
            btn.style.display = 'none';
        });
        btn.setAttribute('data-bound', 'true');
    });

    document.querySelectorAll('.manual-cancel-button:not([data-bound])').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var control = btn.closest('.manual-recommendation-control');
            if (!control) return;
            var editor = control.querySelector('.manual-recommendation-editor');
            var addBtn = control.querySelector('.manual-add-button');
            var field = control.querySelector('.manual-recommendation-text');
            if (field) field.value = '';
            if (editor) editor.hidden = true;
            if (addBtn) addBtn.style.display = '';
        });
        btn.setAttribute('data-bound', 'true');
    });

    document.querySelectorAll('.manual-save-button:not([data-bound])').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var control = btn.closest('.manual-recommendation-control');
            if (!control) return;
            var field = control.querySelector('.manual-recommendation-text');
            saveManualRecommendation(
                control.getAttribute('data-student-index'),
                control.getAttribute('data-category-key'),
                field ? field.value : '',
                '',
                control.getAttribute('data-suggested-label') || ''
            );
            renderSelectedSupportRecommendations();
        });
        btn.setAttribute('data-bound', 'true');
    });

    document.querySelectorAll('.manual-recommendation-delete:not([data-bound])').forEach(function(btn) {
        btn.addEventListener('click', function() {
            deleteManualRecommendation(btn.getAttribute('data-student-index'), btn.getAttribute('data-category-key'), btn.getAttribute('data-manual-id'));
            renderSelectedSupportRecommendations();
        });
        btn.setAttribute('data-bound', 'true');
    });
}

function bindClarificationButtons() {
    document.querySelectorAll('.clarification-open:not([data-bound])').forEach(function(btn) {
        btn.addEventListener('click', function() {
            openClarificationModal(btn.getAttribute('data-student-index'), btn.getAttribute('data-activity-id'));
        });
        btn.setAttribute('data-bound', 'true');
    });
}

function bindClarificationModal() {
    var overlay = document.getElementById('clarification-modal-overlay');
    if (!overlay || overlay.dataset.bound === 'true') return;
    var closeBtn = document.getElementById('clarification-modal-close');
    var cancelBtn = document.getElementById('clarification-cancel');
    var saveBtn = document.getElementById('clarification-save');
    if (closeBtn) closeBtn.addEventListener('click', closeClarificationModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeClarificationModal);
    if (saveBtn) saveBtn.addEventListener('click', saveClarificationResponse);
    overlay.addEventListener('click', function(event) {
        if (event.target === overlay) closeClarificationModal();
    });
    overlay.setAttribute('data-bound', 'true');
}

function openClarificationModal(studentIndex, activityId) {
    var overlay = document.getElementById('clarification-modal-overlay');
    if (!overlay) return;
    var activity = (window.UiePlannerData.accessMatrixActivities || []).find(function(item) {
        return item.id === activityId;
    });
    var data = readClarification(studentIndex, activityId) || {};
    overlay.setAttribute('data-student-index', studentIndex);
    overlay.setAttribute('data-activity-id', activityId);
    var title = document.getElementById('clarification-modal-title');
    var activityLabel = document.getElementById('clarification-activity-label');
    if (title) title.textContent = 'Precisar barrera';
    if (activityLabel) activityLabel.textContent = activity ? activity.label : 'Actividad CIF';
    ['where', 'trigger', 'support', 'source'].forEach(function(key) {
        var field = document.getElementById('clarification-' + key);
        if (field) field.value = data[key] || '';
    });
    overlay.style.display = '';
    document.body.style.overflow = 'hidden';
}

function closeClarificationModal() {
    var overlay = document.getElementById('clarification-modal-overlay');
    if (!overlay) return;
    overlay.style.display = 'none';
    overlay.removeAttribute('data-student-index');
    overlay.removeAttribute('data-activity-id');
    if (!document.getElementById('plan-modal-overlay') || document.getElementById('plan-modal-overlay').style.display === 'none') {
        document.body.style.overflow = '';
    }
}

function saveClarificationResponse() {
    var overlay = document.getElementById('clarification-modal-overlay');
    if (!overlay) return;
    var studentIndex = overlay.getAttribute('data-student-index');
    var activityId = overlay.getAttribute('data-activity-id');
    if (!studentIndex || !activityId) return;
    clarificationData[clarificationKey(studentIndex, activityId)] = {
        where: (document.getElementById('clarification-where')?.value || '').trim(),
        trigger: (document.getElementById('clarification-trigger')?.value || '').trim(),
        support: (document.getElementById('clarification-support')?.value || '').trim(),
        source: (document.getElementById('clarification-source')?.value || '').trim()
    };
    closeClarificationModal();
    renderSelectedSupportRecommendations();
}

function renderManualCategoryExtras(students, categoryKey, prompts) {
    return (students || []).map(function(student) {
        var studentIndex = student.cardIndex || student.index;
        var manualHtml = renderManualRecommendations(studentIndex, categoryKey);
        var promptLabel = getManualPromptLabelForCategory(prompts || [], categoryKey);
        return manualHtml + (editingMode ? renderManualRecommendationControls(studentIndex, categoryKey, promptLabel) : '');
    }).join('');
}

function getReferenceScores(conditionKeys) {
    var activities = window.UiePlannerData.accessMatrixActivities;
    var scores = {};
    activities.forEach(function(act) {
        var maxSev = 0;
        conditionKeys.forEach(function(ck) {
            var profile = barrierProfiles[ck];
            if (!profile) return;
            act.dims.forEach(function(dim) {
                maxSev = Math.max(maxSev, profile[dim] || 0);
            });
        });
        scores[act.id] = maxSev === 0 ? 4 : maxSev === 1 ? 3 : maxSev === 2 ? 2 : 1;
    });
    return scores;
}

function renderProfileGroup(group) {
    const hasMatrixProfile = groupHasMatrixProfile(group);
    if (hasMatrixProfile) {
        return renderMatrixAdjustedProfileGroup(group);
    }

    var conditionKeys = group.conditions.map(function(c) { return c.key; });
    var mainHtml = renderStandardRecommendationGroup(group, { hasMatrixProfile: false });
    const hasAutism = conditionKeys.indexOf('autismo') !== -1;

    let highlightHtml = '';
    let regulationHtml = '';
    let mythsHtml = '';

    if (hasAutism) {
        const autismData = accommodationsData.autismo;
        if (autismData.highlights) {
            highlightHtml = '<div class="context-panel"><h4>Apoyos destacados para esta condición</h4><div class="mini-grid">' +
                autismData.highlights.map(function(item) {
                    return '<article class="mini-card"><h5>' + item.title + '</h5><p>' + item.text + '</p></article>';
                }).join('') + '</div></div>';
        }
        if (autismData.regulation) {
            regulationHtml = '<div class="regulation-panel"><div class="resource-heading"><span class="source-pill">Autismo</span><h4>Desregulación emocional y conductual</h4><p>Orientación pedagógica de apoyo, no protocolo clínico. La desregulación suele responder a sobrecarga, ansiedad, cambios inesperados o estímulos desencadenantes.</p></div><div class="regulation-grid">' +
                autismData.regulation.map(function(regGroup) {
                    return '<article class="regulation-card"><h5>' + regGroup.title + '</h5><ul class="acc-list">' +
                        regGroup.items.map(function(item) { return '<li>' + item + '</li>'; }).join('') + '</ul></article>';
                }).join('') + '</div></div>';
        }
        mythsHtml = '<div class="myths-panel"><div class="resource-heading"><span class="source-pill">Autismo</span><h4>Mitos y trato en autismo</h4><p>Estas orientaciones ayudan a evitar prejuicios al acompañar la práctica docente.</p></div><div class="myths-grid">' +
            autismMyths.map(function(item) { return '<article class="myth-item">' + item + '</article>'; }).join('') + '</div></div>';
    }

    var lastClose = mainHtml.lastIndexOf('</article>');
    if (lastClose !== -1) {
        mainHtml = mainHtml.slice(0, lastClose) + highlightHtml + regulationHtml + mythsHtml + '</article>' + mainHtml.slice(lastClose + 10);
    }
    return mainHtml;
}

function renderMatrixAdjustedProfileGroup(group) {
    var matrixStudents = group.students.filter(function(student) {
        return !!getStudentMatrixProfile(student.cardIndex);
    });
    var standardStudents = group.students.filter(function(student) {
        return !getStudentMatrixProfile(student.cardIndex);
    });
    var conditionNames = group.conditions.map(function(c) { return c.name; }).join(' - ');
    var standardHtml = '';

    if (standardStudents.length) {
        standardHtml = renderStandardRecommendationGroup({
            conditions: group.conditions,
            students: standardStudents
        }, { hasMatrixProfile: false });
    }

    return matrixStudents.map(function(student) {
        var entry = matrixData[student.cardIndex] || {};
        var label = escapeSupportHtml(formatStudentLabel(student));
        var scores = entry.scores || {};
        var studentGroup = {
            conditions: group.conditions,
            students: [student]
        };
        var studentHtml = renderStandardRecommendationGroup(studentGroup, {
            hasMatrixProfile: true,
            studentScores: scores
        });

        return studentHtml;
    }).join('') + standardHtml;
}

function renderStandardRecommendationGroup(group, options) {
    options = options || {};
    var conditionKeys = group.conditions.map(function(c) { return c.key; });
    var conditionNames = group.conditions.map(function(c) { return c.name; });
    var sources = [];
    group.conditions.forEach(function(c) {
        if (sources.indexOf(c.source) === -1) sources.push(c.source);
    });
    var studentNames = group.students.map(function(s) { return escapeSupportHtml(formatStudentLabel(s)); }).join(', ');
    var hasMultiple = conditionKeys.length > 1;
    var hasMatrixProfile = options.hasMatrixProfile;
    var studentScores = options.studentScores || getFirstStudentScores(group);
    var merged = getMergedRecommendations(conditionKeys);
    var sourcePills = sources.filter(function(s) { return s !== 'Adecuaciones de Acceso'; }).map(function(s) { return '<span class="source-pill">' + s + '</span>'; }).join(' ');
    var categoriesHtml = ['context', 'materials', 'methods', 'interaction', 'evaluacion', 'tech'].map(function(cat) {
        var items = merged[cat];
        var requirement = getCategoryRequirementForGroup(group, cat);
        var itemsHtml = '';
        if (items && items.length) {
            var itemsWithPriority = items.map(function(item) {
                var priority = 0;
                if (hasMatrixProfile) {
                    var level = getSemaforo(item.activities, studentScores);
                    if (level) {
                        priority = getMatrixSeverity(level).requirement;
                    }
                }
                return { item: item, priority: priority };
            });
            itemsWithPriority.sort(function(a, b) {
                return b.priority - a.priority;
            });
            itemsHtml = itemsWithPriority.map(function(entry) {
                var item = entry.item;
                var tag = '';
                if (!item.isMerged && hasMultiple && item.shortNames.length > 0) {
                    tag = ' <span class="condition-tag">' + item.shortNames.join(', ') + '</span>';
                }
                var activityTags = getActivityTagString(item.activities);
                var badgeHtml = '';
                if (hasMatrixProfile) {
                    badgeHtml = requirementDot(entry.priority > 0 ? entry.priority : 0);
                }
                var key = hiddenRecommendationKey(cat, item.text);
                var hidden = isRecommendationHidden(cat, item.text);
                return '<li class="' + (hidden ? 'recommendation-hidden' : '') + '">' +
                    '<span class="standard-recommendation-main"><span>' + item.text + tag + activityTags + '</span>' + badgeHtml + '</span>' +
                    '<button class="recommendation-toggle" type="button" data-rec-key="' + key + '">' + (hidden ? 'Restaurar' : 'Ocultar') + '</button>' +
                    '</li>';
            }).join('');
        } else {
            itemsHtml = '<li class="empty-dimension">Sin recomendaciones específicas para esta dimensión.</li>';
        }
        var manualHtml = renderManualCategoryExtras(group.students, cat, []);
        return '<article class="acc-card"><h4>' + categoryLabels[cat] + '</h4><ul class="acc-list">' + itemsHtml + manualHtml + '</ul></article>';
    }).join('');

    var hasActiveScores = hasMatrixProfile && studentScores && Object.values(studentScores).some(function(v) { return Number(v || 0) > 0 && Number(v || 0) < 4; });
    var legendHtml = '';
    if (hasActiveScores) {
        legendHtml = '<div class="rec-legend">' +
            [0,1,2,3].map(function(lvl) {
                var label = requirementLabel(lvl);
                return '<span class="rec-legend-item"><span class="requirement-dot requirement-level-' + lvl + '"></span>' + label + '</span>';
            }).join('') +
            '</div>';
    }

    return '<article class="support-recommendation-group">' +
        '<div class="results-title-header"><div>' +
        '<h3>' + studentNames + '</h3>' +
        '<p>' + sourcePills + ' <strong>Condición:</strong> ' + conditionNames.join(' - ') + '</p>' +
        '</div></div>' +
        legendHtml +
        '<div class="support-grid">' + categoriesHtml + '</div>' +
        renderAdvisorCommentFields(group) +
        '</article>';
}

function getFirstStudentScores(group) {
    if (!group || !group.students || !group.students.length) return null;
    var entry = matrixData[group.students[0].cardIndex];
    return entry ? entry.scores : null;
}

function getManualItemsForStudent(studentIndex) {
    return ['context', 'materials', 'methods', 'interaction', 'evaluacion', 'tech'].flatMap(function(cat) {
        return getManualRecommendations(studentIndex, cat).map(function(item) {
            return {
                id: item.id,
                kind: 'manual',
                text: item.text,
                activities: item.suggestedLabel ? [item.suggestedLabel] : [],
                activityIds: item.sourceActivityId ? [item.sourceActivityId] : [],
                dimensions: [cat],
                dimensionLabels: [categoryLabels[cat] || cat],
                priorityLevel: 2,
                scores: [],
                evidenceCount: 0,
                maxRequirement: 0,
                weights: {}
            };
        });
    });
}

function getVisibleMatrixItems(student, options) {
    options = options || {};
    var idx = student.cardIndex || student.index;
    var items = computePrioritizedRecommendations(student.matrixScores || {}, student.conditionKeys || student.conditions.map(function(c) { return c.key; }))
        .filter(function(item) { return item.kind !== 'manual_prompt' && !isConcreteRecommendationHidden(idx, item); });
    return options.includeManual ? items.concat(getManualItemsForStudent(idx)) : items;
}

function groupMatrixItemsByDimension(items) {
    return barrierDimensions.map(function(dim) {
        return {
            key: dim.key,
            label: categoryLabels[dim.key] || dim.label,
            items: (items || []).filter(function(item) {
                return (item.dimensions || []).indexOf(dim.key) !== -1;
            })
        };
    }).filter(function(group) { return group.items.length > 0; });
}

function formatClarificationEvidence(studentIndex, item) {
    var activityId = (item.activityIds || [])[0] || '';
    var data = activityId ? readClarification(studentIndex, activityId) : null;
    if (!hasClarificationContent(data)) return '';
    return [
        data.where ? 'Contexto: ' + data.where : '',
        data.trigger ? 'Causa observada: ' + data.trigger : '',
        data.support ? 'Apoyo usado: ' + data.support : '',
        data.source ? 'Fuente: ' + data.source : ''
    ].filter(Boolean).join(' | ');
}

function readStudentMatrixScores(studentIndex) {
    var scores = {};
    var activities = window.UiePlannerData.accessMatrixActivities;
    activities.forEach(function(act) {
        var checked = document.querySelector('input[name="social-matrix-' + studentIndex + '-' + act.id + '"]:checked') ||
                      document.querySelector('input[name="student-matrix-' + studentIndex + '-' + act.id + '"]:checked');
        scores[act.id] = checked ? Number(checked.value) : 0;
    });
    return scores;
}

function readMedicalConditionKeys(studentIndex) {
    var card = document.querySelector('#support-students-medical .support-student-card[data-student-index="' + studentIndex + '"]');
    if (!card) return [];
    return Array.from(card.querySelectorAll('.condition-pill.active')).map(function(pill) {
        return pill.getAttribute('data-condition-key');
    }).filter(function(key) { return key && key !== 'multiple' && accommodationsData[key]; });
}

function ruleMatchesMatrixActivity(rule, activity, score, conditionKeys) {
    if (rule.activities.indexOf(activity.id) === -1) return false;
    if (rule.scores.indexOf(score) === -1) return false;
    return conditionKeys.some(function(key) { return rule.conditions.indexOf(key) !== -1; });
}

function getRuleWeights(rule) {
    if (rule.dimensionWeights) return rule.dimensionWeights;
    if (ruleDimensionWeights[rule.id]) return ruleDimensionWeights[rule.id];
    return (rule.dimensions || []).reduce(function(weights, dim, index) {
        weights[dim] = index === 0 ? 1 : 0.7;
        return weights;
    }, {});
}

function scoreToRequirement(score) {
    return getMatrixSeverity(Number(score || 0)).requirement;
}

function weightedValueToLevel(value) {
    if (value >= 2.5) return 3;
    if (value >= 1.5) return 2;
    if (value >= 0.75) return 1;
    return 0;
}

function getActivityLabelById(activityId) {
    var activity = (window.UiePlannerData.accessMatrixActivities || []).find(function(item) {
        return item.id === activityId;
    });
    return activity ? activity.label : activityId;
}

function addPrioritizedItem(items, byId, itemId, itemData, activity, score, severity) {
    if (!byId[itemId]) {
        byId[itemId] = {
            id: itemId,
            kind: itemData.kind || 'recommendation',
            text: itemData.text,
            activities: [],
            activityIds: [],
            dimensions: itemData.dimensions || [],
            dimensionLabels: (itemData.dimensions || []).map(function(dim) { return categoryLabels[dim] || dim; }),
            priorityLevel: 0,
            scores: [],
            evidenceCount: 0,
            maxRequirement: 0,
            weights: itemData.weights || {}
        };
        items.push(byId[itemId]);
    }

    var item = byId[itemId];
    var activityLabel = activity.label || getActivityLabelById(activity.id);
    if (item.activities.indexOf(activityLabel) === -1) item.activities.push(activityLabel);
    if (item.activityIds.indexOf(activity.id) === -1) item.activityIds.push(activity.id);
    item.scores.push(score);
    item.evidenceCount += 1;
    item.maxRequirement = Math.max(item.maxRequirement, severity.requirement);
    item.priorityLevel = Math.max(item.priorityLevel, severity.requirement);
}

function addCatalogRecommendationsForActivity(items, byId, conditionKey, activity, score, severity) {
    var data = accommodationsData[conditionKey];
    var cifMap = accommodationCifMap && accommodationCifMap[conditionKey];
    var added = 0;

    if (!data || !cifMap) return 0;

    ['context', 'materials', 'methods', 'interaction', 'evaluacion', 'tech'].forEach(function(cat) {
        var recommendations = data[cat] || [];
        var activityMaps = cifMap[cat] || [];
        recommendations.forEach(function(text, index) {
            var activityIds = activityMaps[index] || [];
            if (activityIds.indexOf(activity.id) === -1) return;
            var weights = {};
            weights[cat] = 1;
            addPrioritizedItem(items, byId, 'catalog-' + conditionKey + '-' + cat + '-' + index, {
                text: text,
                dimensions: [cat],
                weights: weights
            }, activity, score, severity);
            added += 1;
        });
    });

    return added;
}

function computePrioritizedRecommendations(scores, conditionKeys) {
    var activities = window.UiePlannerData.accessMatrixActivities;
    var filterKeys = (conditionKeys || []).filter(function(key) { return accommodationsData[key]; });
    var byId = {};
    var items = [];

    if (!filterKeys.length) return [];

    activities.forEach(function(activity) {
        var score = Number(scores[activity.id] || 0);
        if (!score || score === 4) return;
        var severity = getMatrixSeverity(score);

        var catalogMatches = 0;
        filterKeys.forEach(function(conditionKey) {
            catalogMatches += addCatalogRecommendationsForActivity(items, byId, conditionKey, activity, score, severity);
        });

        if (catalogMatches > 0) return;

        if (score === 3) {
            items.push({
                id: 'observation-' + activity.id,
                kind: 'observation',
                text: getMatrixObservation(activity.label),
                activities: [activity.label],
                activityIds: [activity.id],
                dimensions: activity.dims || [],
                dimensionLabels: (activity.dims || []).map(function(dim) { return categoryLabels[dim] || dim; }),
                priorityLevel: 1,
                scores: [score],
                severityClass: severity.className
            });
            return;
        }

        var matchingRules = (matrixRecommendationRules || []).filter(function(rule) {
            return ruleMatchesMatrixActivity(rule, activity, score, filterKeys);
        });

        if (!matchingRules.length) {
            var fallbackId = 'manual-prompt-' + activity.id + '-' + filterKeys.join('-');
            if (!byId[fallbackId]) {
                byId[fallbackId] = {
                    id: fallbackId,
                    kind: 'manual_prompt',
                    text: getManualPromptLabelForCategory([{ activities: [activity.label], dimensions: activity.dims || [] }], (activity.dims || [])[0]),
                    activities: [],
                    activityIds: [],
                    dimensions: activity.dims || [],
                    dimensionLabels: (activity.dims || []).map(function(dim) { return categoryLabels[dim] || dim; }),
                    priorityLevel: Math.min(2, severity.requirement),
                    scores: [],
                    evidenceCount: 0,
                    maxRequirement: 0,
                    weights: {}
                };
                items.push(byId[fallbackId]);
            }
            byId[fallbackId].activities.push(activity.label);
            byId[fallbackId].activityIds.push(activity.id);
            byId[fallbackId].scores.push(score);
            byId[fallbackId].evidenceCount += 1;
            byId[fallbackId].maxRequirement = Math.max(byId[fallbackId].maxRequirement, severity.requirement);
            return;
        }

        matchingRules.forEach(function(rule) {
            if (!byId[rule.id]) {
                var dims = rule.dimensions || [];
                byId[rule.id] = {
                    id: rule.id,
                    kind: 'recommendation',
                    text: rule.text,
                    activities: [],
                    activityIds: [],
                    dimensions: dims,
                    dimensionLabels: dims.map(function(dim) { return categoryLabels[dim] || dim; }),
                    priorityLevel: 0,
                    scores: [],
                    evidenceCount: 0,
                    maxRequirement: 0,
                    weights: getRuleWeights(rule)
                };
                items.push(byId[rule.id]);
            }

            var item = byId[rule.id];
            var weights = item.weights || {};
            var primaryWeight = Object.keys(weights).reduce(function(max, dimKey) {
                return Math.max(max, Number(weights[dimKey]) || 0);
            }, 0);
            var weightedRequirement = severity.requirement * Math.max(0.7, primaryWeight);
            var level = weightedValueToLevel(weightedRequirement);

            if (item.activities.indexOf(activity.label) === -1) item.activities.push(activity.label);
            if (item.activityIds.indexOf(activity.id) === -1) item.activityIds.push(activity.id);
            item.scores.push(score);
            item.evidenceCount += 1;
            item.maxRequirement = Math.max(item.maxRequirement, severity.requirement);
            item.priorityLevel = Math.max(item.priorityLevel, level);
        });
    });

    items.forEach(function(item) {
        if (item.kind === 'recommendation' && item.priorityLevel === 2 && item.evidenceCount >= 2 && item.maxRequirement >= 3) {
            item.priorityLevel = 3;
        }
        item.priorityLevel = Math.max(1, Math.min(3, item.priorityLevel || 1));
    });

    return items.sort(function(a, b) {
        if (b.priorityLevel !== a.priorityLevel) return b.priorityLevel - a.priorityLevel;
        if (b.evidenceCount !== a.evidenceCount) return (b.evidenceCount || 0) - (a.evidenceCount || 0);
        return String(a.text).localeCompare(String(b.text));
    });
}

function computeProfileFromPrioritizedRecommendations(items) {
    var evidence = {};
    barrierDimensions.forEach(function(dim) {
        evidence[dim.key] = { maxValue: 0, strongCount: 0, primaryCount: 0 };
    });

    (items || []).forEach(function(item) {
        if (item.kind === 'manual_prompt') return;
        if (item.kind === 'observation') {
            (item.dimensions || []).forEach(function(dimKey) {
                if (!evidence[dimKey]) return;
                evidence[dimKey].maxValue = Math.max(evidence[dimKey].maxValue, 1);
            });
            return;
        }
        var level = item.priorityLevel || 0;
        var weights = item.weights || {};
        var dims = Object.keys(weights).length ? Object.keys(weights) : (item.dimensions || []);
        dims.forEach(function(dimKey, index) {
            if (!evidence[dimKey]) return;
            var weight = Object.keys(weights).length ? Math.max(0, Math.min(1, Number(weights[dimKey]) || 0)) : (index === 0 ? 1 : 0.7);
            var value = level * weight;
            evidence[dimKey].maxValue = Math.max(evidence[dimKey].maxValue, value);
            if (weightedValueToLevel(value) >= 2) evidence[dimKey].strongCount += 1;
            if (weight >= 1) evidence[dimKey].primaryCount += 1;
        });
    });

    return barrierDimensions.reduce(function(profile, dim) {
        var item = evidence[dim.key];
        var level = weightedValueToLevel(item.maxValue);
        if (level === 2 && item.strongCount >= 2) level = 3;
        if (level === 3 && item.primaryCount === 0 && item.strongCount < 2) level = 2;
        profile[dim.key] = level;
        return profile;
    }, {});
}

function applyStudentMatrix(studentIndex) {
    var scores = readStudentMatrixScores(studentIndex);
    var scored = Object.values(scores).filter(function(v) { return v > 0; });
    if (!scored.length) return;
    var conditionKeys = readMedicalConditionKeys(studentIndex);
    if (!conditionKeys.length) {
        window.UiePlannerNotice.showNotice('Selecciona la condición registrada en la ficha antes de identificar barreras. Esto evita sugerir apoyos que no corresponden.');
        return;
    }

    var prioritizedRecommendations = computePrioritizedRecommendations(scores, conditionKeys);
    var profile = computeProfileFromPrioritizedRecommendations(prioritizedRecommendations);

    matrixData[studentIndex] = {
        scores: scores,
        profile: profile,
        prioritizedRecommendations: prioritizedRecommendations,
        conditionKeys: conditionKeys,
        applied: true,
        source: 'matrix'
    };

    var card = document.querySelector('.support-student-card[data-student-index="' + studentIndex + '"]');
    if (card) card.setAttribute('data-assessment-source', 'matrix');

    updateStudentMatrixBadge(studentIndex);
    updateMedicalConditionSummaries();
    updateMedicalAddButton();
    updateMedicalRemoveButtons();
    renderSelectedSupportRecommendations();
}

function clearStudentMatrix(studentIndex) {
    delete matrixData[studentIndex];

    var card = document.querySelector('.support-student-card[data-student-index="' + studentIndex + '"]');
    if (card) {
        card.setAttribute('data-assessment-source', 'standard');
        card.querySelectorAll('input[type="radio"][name^="social-matrix"]').forEach(function(radio) {
            radio.checked = false;
        });
        card.querySelectorAll('input[type="radio"][name^="student-matrix"]').forEach(function(radio) {
            radio.checked = false;
        });
    }

    updateStudentMatrixBadge(studentIndex);
    updateStudentStatusBadgeForContainer('support-students-social', studentIndex, null);
    updateStudentStatusBadge(studentIndex);
    updateMedicalConditionSummaries();
    renderSelectedSupportRecommendations();
}

function updateStudentMatrixBadge(studentIndex) {
    var badge = document.getElementById('student-matrix-badge-' + studentIndex);
    if (!badge) return;
    var matrixScores = readStudentMatrixScores(studentIndex);
    var scored = Object.values(matrixScores).filter(function(v) { return v > 0; }).length;
    var source = getStudentAssessmentSource(studentIndex);
    badge.textContent = scored ? (source === 'matrix' ? 'Matriz ' : '') + scored + '/11' : '';
    updateStudentStatusBadge(studentIndex);
}

function updateStudentStatusBadge(studentIndex) {
    var status = document.getElementById('student-status-' + studentIndex) ||
                 document.getElementById('student-status-medical-' + studentIndex) ||
                 document.getElementById('student-status-social-' + studentIndex);
    if (!status) return;

    var card = document.querySelector('.support-student-card[data-student-index="' + studentIndex + '"]');
    var hasConditions = card ? card.querySelectorAll('.condition-check:checked, .condition-pill.active:not(.multiple), .social-condition-pill.active:not(.multiple)').length > 0 : false;
    var hasMatrix = !!matrixData[studentIndex] && matrixData[studentIndex].applied;
    var hasMatrixScores = Object.values(readStudentMatrixScores(studentIndex)).filter(function(v) { return v > 0; }).length > 0;

    if (hasMatrix) {
        status.textContent = 'Con matriz de acceso aplicada';
        status.className = 'student-card-status status-matrix';
    } else if (hasConditions) {
        status.textContent = 'Con condiciones seleccionadas';
        status.className = 'student-card-status status-conditions';
    } else if (hasMatrixScores) {
        status.textContent = 'Ajuste CIF sin aplicar';
        status.className = 'student-card-status status-pending';
    } else {
        status.textContent = 'Sin apoyos definidos';
        status.className = 'student-card-status';
    }
}

function openPlanModal(onStudentChange) {
    var overlay = document.getElementById('plan-modal-overlay');
    if (!overlay) return;
    overlay.style.display = '';
    document.body.style.overflow = 'hidden';
    bindPlanModalEvents(onStudentChange);
}

function closePlanModal() {
    var overlay = document.getElementById('plan-modal-overlay');
    if (!overlay) return;
    overlay.style.display = 'none';
    document.body.style.overflow = '';
}

function bindPlanModalEvents(onStudentChange) {
    var closeBtn = document.getElementById('plan-modal-close');
    var overlay = document.getElementById('plan-modal-overlay');
    var genBtn = document.getElementById('btn-generate-pdf');

    if (closeBtn && closeBtn.dataset.bound !== 'true') {
        closeBtn.addEventListener('click', closePlanModal);
        closeBtn.setAttribute('data-bound', 'true');
    }

    if (overlay && overlay.dataset.bound !== 'true') {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closePlanModal();
        });
        overlay.setAttribute('data-bound', 'true');
    }

    if (genBtn && genBtn.dataset.bound !== 'true') {
        genBtn.addEventListener('click', generatePlanPDF);
        genBtn.setAttribute('data-bound', 'true');
    }

    var emailBtn = document.getElementById('btn-generate-email');
    if (emailBtn && emailBtn.dataset.bound !== 'true') {
        emailBtn.addEventListener('click', generatePlanEmail);
        emailBtn.setAttribute('data-bound', 'true');
    }

    var chartsCb = document.getElementById('plan-include-charts');
    if (chartsCb && chartsCb.dataset.bound !== 'true') {
        chartsCb.addEventListener('change', function() {
            if (!this.checked) return;
            var students = collectPlanStudents();
            var hasMatrix = students.some(function(s) {
                var scores = getStudentMatrixScores(s.cardIndex || 1);
                return Object.values(scores).some(function(v) { return Number(v || 0) > 0; });
            });
            if (!hasMatrix) {
                this.checked = false;
                showToast('Para incluir gráficos, completa la rúbrica CIF de al menos un estudiante.');
            }
        });
        chartsCb.setAttribute('data-bound', 'true');
    }
}

function collectPlanStudents() {
    return collectMedicalStudents();
}

var FORMAT_PATTERNS = {
    oral: { label: 'comunicación oral', pattern: /(respuestas? (escritas|visuales|preparadas)|participaci[oó]n oral|exposici[oó]n oral|expresi[oó]n oral|exposiciones|alternativas? a la (presentaci[oó]n|exposici[oó]n))/i },
    escrito: { label: 'producción escrita', pattern: /(dictado|respuestas? orales?|evaluaci[oó]n oral|examen oral|escritura manual|transcrip)/i },
    tiempo: { label: 'rapidez o tiempo límite', pattern: /(tiempo adicional|m[aá]s tiempo|ajusta el tiempo|flexibiliza plazos)/i },
    practico: { label: 'ejecución práctica', pattern: /(puesto, herramienta|postura|secuencia de ejecuci[oó]n|alternativa.{0,30}pr[aá]ctic)/i }
};

function getFormatConflicts(text, formats) {
    return (formats || []).filter(function(key) {
        return FORMAT_PATTERNS[key] && FORMAT_PATTERNS[key].pattern.test(text || '');
    }).map(function(key) { return FORMAT_PATTERNS[key].label; });
}

function formatConflictNote(text, formats) {
    var conflicts = getFormatConflicts(text, formats);
    if (!conflicts.length) return null;
    return { text: 'Revisar: cambia ' + conflicts.join(' y ') + ', que marcaste como parte de lo que se evalúa.', style: 'metaText', color: PDF.LEVELS[3].text, bold: true };
}

function readAdvisorComments(card) {
    var idx = card ? card.getAttribute('data-student-index') : '';
    return (advisorCommentsByStudent[idx] || '').trim();
}

function readStudentProfileField(card, selector) {
    return (card.querySelector(selector)?.value?.trim() || '');
}

function collectMedicalStudents() {
    var students = [];
    var cards = document.querySelectorAll('#support-students-medical .support-student-card');

    cards.forEach(function(card) {
        var studentIndex = Number(card.getAttribute('data-student-index'));
        var name = (card.querySelector('.student-name')?.value?.trim() || '');
        var rut = readStudentProfileField(card, '.student-rut');
        var career = readStudentProfileField(card, '.student-career');
        var section = readStudentProfileField(card, '.student-section');

        var activePills = card.querySelectorAll('.condition-pill.active');
        var conditions = Array.from(activePills).map(function(pill) {
            var key = pill.getAttribute('data-condition-key');
            var data = accommodationsData[key];
            return data ? { key: key, name: data.name, source: data.source } : null;
        }).filter(Boolean);

        if (!conditions.length) return;

        students.push({
            index: studentIndex,
            name: name,
            rut: rut,
            career: career,
            section: section,
            conditions: conditions,
            conditionKeys: conditions.map(function(c) { return c.key; }),
            assessmentSource: getStudentAssessmentSource(studentIndex),
            matrixScores: getStudentMatrixScores(studentIndex),
            cardIndex: studentIndex,
            mode: 'medical',
            outcome: readStudentProfileField(card, '.student-outcome'),
            studentVoice: readStudentProfileField(card, '.student-voice'),
            protectedFormats: Array.from(card.querySelectorAll('.student-format:checked')).map(function(box) { return box.value; }),
            advisorComments: readAdvisorComments(card)
        });
    });

    return students;
}

function getMatrixSeverity(score) {
    if (score === 1) return { requirement: 3, label: 'Barrera significativa — intervenir', className: 'severity-high' };
    if (score === 2) return { requirement: 2, label: 'Barrera moderada — ajustar', className: 'severity-medium' };
    if (score === 3) return { requirement: 1, label: 'Barrera leve — observar', className: 'severity-watch' };
    return { requirement: 0, label: 'Sin barrera detectada', className: 'severity-none' };
}

function getMatrixObservation(activityLabel) {
    return 'Compatibilidad buena: no requiere ajuste permanente. Observa si en esta asignatura, evaluación o contexto aparece una barrera específica en "' + activityLabel + '".';
}

function getClarificationPrompt(activity) {
    if (activity.id === 'acceder') {
        return 'Precisa la causa de la barrera antes de definir el ajuste: desplazamiento físico, orientación/señalética, sobrecarga sensorial, cambios de rutina, transporte u otra condición del entorno.';
    }
    return 'No hay una recomendación automática pertinente para la condición seleccionada. Precisa la barrera con el estudiante antes de definir el ajuste.';
}

function ruleMatchesMatrixContext(rule, activity, dimKey, score, conditionKeys) {
    if (rule.activities.indexOf(activity.id) === -1) return false;
    if (rule.dimensions.indexOf(dimKey) === -1) return false;
    if (rule.scores.indexOf(score) === -1) return false;
    return conditionKeys.some(function(key) { return rule.conditions.indexOf(key) !== -1; });
}

function getBarrierBasedRecommendations(scores, conditionKeys) {
    var activities = window.UiePlannerData.accessMatrixActivities;
    var rules = matrixRecommendationRules || [];
    var filterKeys = (conditionKeys || []).filter(function(key) { return accommodationsData[key]; });
    if (!filterKeys.length) return [];

    var groupsByDim = {};

    activities.forEach(function(activity) {
        var score = scores[activity.id] || 0;
        if (!score || score === 4) return;
        var severity = getMatrixSeverity(score);

        activity.dims.forEach(function(dimKey) {
            if (!groupsByDim[dimKey]) {
                groupsByDim[dimKey] = {
                    dimension: dimKey,
                    label: categoryLabels[dimKey] || dimKey,
                    activities: [],
                    items: []
                };
            }

            if (groupsByDim[dimKey].activities.indexOf(activity.label) === -1) {
                groupsByDim[dimKey].activities.push(activity.label);
            }

            var matchingRules = score === 3 ? [] : rules.filter(function(rule) {
                return ruleMatchesMatrixContext(rule, activity, dimKey, score, filterKeys);
            });

            var recs = [];
            matchingRules.forEach(function(rule) {
                if (recs.indexOf(rule.text) === -1) recs.push(rule.text);
            });

            var item = {
                activityId: activity.id,
                activity: activity.label,
                score: score,
                requirement: severity.requirement,
                severity: severity.label,
                severityClass: severity.className,
                recommendations: recs,
                observations: [],
                clarification: ''
            };

            if (score === 3) {
                item.observations.push(getMatrixObservation(activity.label));
            } else if (!recs.length) {
                item.clarification = getClarificationPrompt(activity);
            }

            groupsByDim[dimKey].items.push(item);
        });
    });

    return barrierDimensions.map(function(dim) {
        return groupsByDim[dim.key];
    }).filter(Boolean);
}

function generatePlanPDF() {
    var students = collectPlanStudents();
    if (!students.length) {
        var msg = 'Selecciona al menos una condición de referencia para algún estudiante.';
        window.UiePlannerNotice.showNotice(msg);
        return;
    }

    var includeCharts = document.getElementById('plan-include-charts')?.checked || false;

    if (includeCharts) {
        var hasMatrix = students.some(function(s) {
            var scores = getStudentMatrixScores(s.cardIndex || 1);
            return Object.values(scores).some(function(v) { return Number(v || 0) > 0; });
        });
        if (!hasMatrix) {
            showToast('Para incluir gráficos, completa la rúbrica CIF de al menos un estudiante.');
            return;
        }
    }

    var docDef;
    try {
        docDef = buildPlanPDFDocument(students, false, includeCharts);
        docDef.content = buildPdfHeader().concat(docDef.content);
    } catch (e) {
        console.error('Error construyendo documento PDF:', e);
        window.UiePlannerNotice.showNotice('No se pudo preparar el documento. Revisa que cada estudiante tenga al menos una condición seleccionada e intenta de nuevo.');
        return;
    }

    PDF.preview(docDef, 'plan-de-apoyo-por-condicion.pdf', { title: 'Plan de apoyo docente', subject: 'Apoyos y adecuaciones curriculares de acceso' });
}

function getStudentAdjustmentLevels(student, si) {
    var activities = window.UiePlannerData.accessMatrixActivities;
    var studentIndex = student.cardIndex || student.index || (si + 1);
    var matrixScores = getStudentMatrixScores(studentIndex);
    var hasMatrix = Object.values(matrixScores).some(function(v) { return Number(v || 0) > 0; });
    if (hasMatrix) {
        return activities.map(function(act) {
            var score = Number(matrixScores[act.id] || 0);
            return score > 0 ? 4 - score : 0;
        });
    }
    var condKeys = (student.conditions || []).map(function(c) { return c.key; });
    return activities.map(function(act) {
        var maxSev = 0;
        condKeys.forEach(function(ck) {
            var profile = barrierProfiles[ck];
            if (!profile) return;
            act.dims.forEach(function(dim) { maxSev = Math.max(maxSev, profile[dim] || 0); });
        });
        return Math.min(3, maxSev);
    });
}

function renderPdfCIFChart(students) {
    if (!students || !students.length) return [];
    var hasAnyMatrix = students.some(function(s) {
        var scores = getStudentMatrixScores(s.cardIndex || s.index || 1);
        return Object.values(scores).some(function(v) { return Number(v || 0) > 0; });
    });
    if (!hasAnyMatrix) return [];
    var activities = window.UiePlannerData.accessMatrixActivities;
    var labels = activities.map(function(act) { return shortActivityLabels[act.id] || act.label; });
    var output = [];
    for (var start = 0; start < students.length; start += 4) {
        var group = students.slice(start, start + 4);
        var series = group.map(function(student, i) {
            return { label: formatStudentLabel(student), values: getStudentAdjustmentLevels(student, start + i) };
        });
        PDF.levelBarChart(labels, series).forEach(function(node) { output.push(node); });
    }
    return output;
}

function buildPlanPDFDocument(students, includeDua, includeCharts) {
    var content = [];
    var cats = ['context', 'materials', 'methods', 'interaction', 'evaluacion', 'tech'];
    var catNames = { context: 'Contexto aula', materials: 'Materiales de estudio', methods: 'Métodos de enseñanza', interaction: 'Interacción en aula', evaluacion: 'De las evaluaciones', tech: 'Tecnologías asistivas' };

    var matrixTableLayout = {
        hLineWidth: function() { return 0.5; },
        vLineWidth: function() { return 0.5; },
        hLineColor: function() { return '#d1d5db'; },
        vLineColor: function() { return '#d1d5db'; },
        paddingLeft: function() { return 3; },
        paddingRight: function() { return 3; },
        paddingTop: function() { return 1.5; },
        paddingBottom: function() { return 1.5; }
    };
    var isSocial = students.length > 0 && students[0].mode === 'social';
    var modeTitle = 'Ficha docente de apoyos y adecuaciones de acceso';
    var missingText = 'Sin informar';

    function studentInfo(value, fallback) {
        return value && String(value).trim() ? String(value).trim() : (fallback || missingText);
    }

    function studentMatrixLabel(student) {
        var scores = student.matrixScores || getStudentMatrixScores(student.cardIndex || student.index || 1);
        var hasMatrix = scores && Object.values(scores).some(function(value) { return Number(value || 0) > 0; });
        return hasMatrix ? 'Sí' : 'No';
    }

    content.push({ text: modeTitle, style: 'mainTitle' });
    content.push({ text: 'Documento orientativo para acordar una base DUA de clase y adecuaciones curriculares de acceso.', style: 'introText' });

    content.push(PDF.sectionTitle(1, 'Base DUA para la clase'));
    content.push({ text: 'Antes de aplicar adecuaciones individuales, asegura una base común de accesibilidad pedagógica para todo el curso. Estas acciones reducen barreras sin modificar los resultados de aprendizaje.', style: 'noteText' });
    content.push(PDF.bulletList([
        'Entregar la programación completa desde el inicio: fechas, evaluaciones, condiciones y cambios relevantes.',
        'Publicar instrucciones, criterios de logro y ejemplos en formato visible, oral y escrito.',
        'Modelar tareas complejas antes del trabajo autónomo y dividirlas en pasos verificables.',
        'Organizar participación y trabajo grupal con roles claros, turnos y apoyos entre pares.',
        'Ofrecer canales claros para pedir ayuda y comunicar apoyos institucionales disponibles.',
        'Verificar comprensión sin exponer públicamente al estudiante.'
    ]));

    content.push(PDF.sectionTitle(2, 'Resumen para la gestión docente'));
    content.push({ text: 'Identifica a quién corresponde cada apoyo y si la priorización se basó en una matriz CIF o en una orientación inicial por condición.', style: 'noteText' });
    content.push({
        table: {
            headerRows: 1,
            widths: ['24%', '15%', '27%', '20%', '14%'],
            body: [[
                { text: 'ESTUDIANTE', style: 'tableHeader' },
                { text: 'RUT', style: 'tableHeader' },
                { text: 'CARRERA', style: 'tableHeader' },
                { text: 'CÓDIGO ASIGNATURA', style: 'tableHeader' },
                { text: 'MATRIZ CIF', style: 'tableHeader' }
            ]].concat(students.map(function(student) {
                var rut = studentInfo(student.rut);
                var career = studentInfo(student.career);
                var section = studentInfo(student.section);
                return [
                    { text: studentInfo(student.name, 'Estudiante ' + student.index), style: 'tableCell', bold: true },
                    { text: rut, style: 'tableCell', color: rut === missingText ? PDF.COLORS.faint : PDF.COLORS.body },
                    { text: career, style: 'tableCell', color: career === missingText ? PDF.COLORS.faint : PDF.COLORS.body },
                    { text: section, style: 'tableCell', color: section === missingText ? PDF.COLORS.faint : PDF.COLORS.body },
                    { text: studentMatrixLabel(student), style: 'tableCell' }
                ];
            }))
        },
        layout: PDF.tableLayout(),
        margin: [0, 2, 0, 8]
    });
    content.push({ text: 'La condición se usa como referencia de pertinencia; la decisión final responde a barreras observadas y a acuerdos con el estudiante.', style: 'noteText' });

    var chartSectionNumber = includeCharts ? 3 : 0;
    var criteriaSectionNumber = includeCharts ? 4 : 3;
    var supportsSectionNumber = includeCharts ? 5 : 4;
    var followUpSectionNumber = includeCharts ? 6 : 5;

    if (includeCharts) {
        content.push(PDF.sectionTitle(chartSectionNumber, 'Mapa de énfasis de apoyo'));
        content.push({ text: 'Cada barra indica el nivel de ajuste sugerido por actividad CIF (0 a 3). Úsalo como lectura rápida antes de revisar las recomendaciones por estudiante.', style: 'noteText' });
        var allChartContent = renderPdfCIFChart(students);
        allChartContent.forEach(function(item) { content.push(item); });
    }

    content.push(PDF.sectionTitle(criteriaSectionNumber, 'Criterios para aplicar adecuaciones individuales'));
    content.push({ text: 'Usa estos criterios para decidir qué apoyos implementar, resguardando el resultado de aprendizaje, la privacidad y la participación del estudiante.', style: 'noteText' });
    content.push(PDF.bulletList(goodPracticesData.slice(0, 4).map(function(item) {
        return { text: [{ text: item.title + ': ', bold: true, color: PDF.COLORS.ink }, item.text] };
    })));

    content.push(PDF.sectionTitle(supportsSectionNumber, 'Apoyos y adecuaciones por estudiante'));
    content.push({ text: 'Las adecuaciones curriculares de acceso eliminan barreras sin modificar los objetivos de aprendizaje. Las recomendaciones se ordenan de mayor a menor prioridad.', style: 'noteText' });

    students.forEach(function(student, sIdx) {
        var nameLabel = student.name || ('Estudiante ' + student.index);
        content.push({ text: [{ text: supportsSectionNumber + '.' + (sIdx + 1) + '  ', color: PDF.COLORS.muted }, nameLabel], style: 'studentSectionTitle', headlineLevel: 1 });

        if (student.conditions && student.conditions.length) {
            content.push({ text: [{ text: 'Condición registrada: ', color: PDF.COLORS.muted }, student.conditions.map(function(c) { return c.name; }).join(', ')], style: 'bodyText', margin: [0, 0, 0, 2], keepWithNext: true });
        }
        if (student.outcome) {
            content.push({ text: [{ text: 'Qué evalúa la asignatura: ', color: PDF.COLORS.muted }, student.outcome], style: 'bodyText', margin: [0, 0, 0, 2], keepWithNext: true });
        }
        if (student.protectedFormats && student.protectedFormats.length) {
            content.push({ text: [{ text: 'Formatos que son parte de lo evaluado: ', color: PDF.COLORS.muted }, student.protectedFormats.map(function(key) { return FORMAT_PATTERNS[key].label; }).join(', ')], style: 'bodyText', margin: [0, 0, 0, 2], keepWithNext: true });
        }
        if (student.studentVoice) {
            content.push({ text: [{ text: 'Lo que el estudiante dice que le funciona: ', color: PDF.COLORS.muted }, student.studentVoice], style: 'bodyText', margin: [0, 0, 0, 2], keepWithNext: true });
        }

        if (student.mode === 'social') {

            content.push({ text: 'Recomendaciones por dimensión del mapa', style: 'subSectionTitle' });
            content.push({ text: 'Cada recomendación se filtra por la condición registrada en la ficha y se agrupa en las mismas dimensiones del mapa de barreras.', style: 'noteText' });

            var barrierRecs = getBarrierBasedRecommendations(student.matrixScores || {}, student.conditionKeys || []);
            if (barrierRecs.length) {
                barrierRecs.forEach(function(group) {
                    content.push({ text: group.label, style: 'categoryTitle', headlineLevel: 1 });
                    content.push({ text: 'Barreras en: ' + group.activities.join(', '), style: 'metaText' });
                    group.items.forEach(function(item) {
                        content.push({ text: item.activity + ' (' + item.score + ' - ' + item.severity + ')', style: 'bodyText', bold: true, margin: [10, 5, 0, 1] });
                        item.recommendations.forEach(function(rec) {
                            content.push({ text: '• ' + rec, style: 'bodyText', margin: [18, 1, 0, 1] });
                        });
                        item.observations.forEach(function(obs) {
                            content.push({ text: '• ' + obs, style: 'metaText', margin: [18, 1, 0, 1] });
                        });
                        if (item.clarification) {
                            content.push({ text: item.clarification, style: 'metaText', margin: [18, 1, 0, 1] });
                        }
                    });
                });
            } else {
                content.push({ text: 'No se identificaron barreras significativas o falta registrar condición para filtrar apoyos pertinentes.', style: 'bodyText', margin: [10, 4, 0, 4] });
            }

        } else {
            var condKeys = student.conditions.map(function(c) { return c.key; });
            var condNames = student.conditions.map(function(c) { return c.name; });
            var hasMultiple = condKeys.length > 1;
            var matrixProfile = getStudentMatrixProfile(student.cardIndex || student.index);

            if (student.assessmentSource && student.assessmentSource !== 'standard') {
                content.push({ text: 'Perfil ajustado por matriz de acceso CIF/OMS.', style: 'metaText', keepWithNext: true });
            }

            if (matrixProfile) {
                var groupedMatrixItems = groupMatrixItemsByDimension(getVisibleMatrixItems(student, { includeManual: true }));
                if (groupedMatrixItems.length) {
                    groupedMatrixItems.forEach(function(group) {
                        var groupTitle = { text: group.label, style: 'categoryTitle' };
                        var titlePlaced = false;
                        var priorityBuckets = { 3: [], 2: [], 1: [], 0: [], manual: [], clarification: [], observation: [] };
                        group.items.forEach(function(item) {
                            var bucket = item.kind === 'manual' ? 'manual' : item.kind === 'clarification' ? 'clarification' : item.kind === 'observation' ? 'observation' : (item.priorityLevel >= 3 ? 3 : item.priorityLevel === 2 ? 2 : item.priorityLevel === 1 ? 1 : 0);
                            if (priorityBuckets[bucket] !== undefined) priorityBuckets[bucket].push(item);
                        });
                        var priorityHeaders = { 3: 'Barrera significativa — intervenir', 2: 'Barrera moderada — ajustar', 1: 'Barrera leve — observar', 0: 'Sin barrera detectada' };
                        [3, 2, 1, 0].forEach(function(level) {
                            var bucket = priorityBuckets[level];
                            if (!bucket || !bucket.length) return;
                            var block = [];
                            if (!titlePlaced) { block.push(groupTitle); titlePlaced = true; }
                            block.push(PDF.levelTag(level, priorityHeaders[level]));
                            block.push(PDF.bulletList(bucket.map(function(item) {
                                var lines = [{ text: item.text }, { text: 'Actividad CIF: ' + item.activities.join(', '), style: 'metaText' }];
                                var conflictNote = formatConflictNote(item.text, student.protectedFormats);
                                if (conflictNote) lines.push(conflictNote);
                                var evidence = formatClarificationEvidence(student.cardIndex || student.index, item);
                                if (evidence) lines.push({ text: 'Evidencia: ' + evidence, style: 'metaText' });
                                return { stack: lines };
                            }), { indent: 16 }));
                            content.push({ stack: block, unbreakable: bucket.length <= 8 });
                        });
                        if (!titlePlaced) content.push(groupTitle);
                        if (priorityBuckets.clarification.length) {
                            content.push({ text: 'Precisar barrera', fontSize: 9, bold: true, color: PDF.COLORS.secondary, margin: [0, 7, 0, 3] });
                            content.push(PDF.bulletList(priorityBuckets.clarification.map(function(item) { return item.text; }), { indent: 16 }));
                        }
                        if (priorityBuckets.manual.length) {
                            content.push({ text: 'Agregadas manualmente', fontSize: 9, bold: true, color: PDF.COLORS.secondary, margin: [0, 7, 0, 3] });
                            content.push(PDF.bulletList(priorityBuckets.manual.map(function(item) { return item.text; }), { indent: 16 }));
                        }
                    });
                } else {
                    content.push({ text: 'No se activaron ajustes recomendados o prioritarios desde la matriz.', style: 'bodyText', margin: [10, 4, 0, 4] });
                }
            } else {
            var merged = getMergedRecommendations(condKeys);
            cats.forEach(function(cat) {
                var items = merged[cat];
                var manualItems = getManualRecommendations(student.cardIndex || student.index, cat);
                if ((!items || !items.length) && !manualItems.length) return;
                var catItems = [];
                (items || []).forEach(function(item) {
                    if (isRecommendationHidden(cat, item.text)) return;
                    var conflictNote = formatConflictNote(item.text, student.protectedFormats);
                    catItems.push(conflictNote ? { stack: [{ text: item.text }, conflictNote] } : item.text);
                });
                manualItems.forEach(function(item) {
                    catItems.push({ text: [{ text: 'Agregada manualmente · ', color: PDF.COLORS.muted }, item.text] });
                });
                if (catItems.length) content.push({ stack: [{ text: catNames[cat], style: 'categoryTitle' }, PDF.bulletList(catItems)], unbreakable: catItems.length <= 8 });
            });
            }
        }

        if (student.advisorComments && student.advisorComments.trim()) {
            content.push({ text: 'Recomendación adicional del asesor', style: 'subSectionTitle' });
            content.push({ text: student.advisorComments.trim(), style: 'bodyText', margin: [10, 2, 0, 6] });
        }

        content.push({ text: '' });
    });

    content.push(PDF.sectionTitle(followUpSectionNumber, 'Seguimiento de apoyos aplicados'));
    content.push({ text: 'Registra una revisión breve por estudiante para decidir si el apoyo se mantiene, se ajusta o se retira.', style: 'noteText' });
    students.forEach(function(student, sIdx) {
        var nameLabel = student.name || ('Estudiante ' + student.index);
        var followBlock = [];
        followBlock.push({ text: nameLabel, style: 'studentSectionTitle' });
        followBlock.push({
            columns: [
                { width: '*', stack: [
                    checkboxItem('Apoyo aplicado según lo acordado.', false),
                    checkboxItem('Favoreció acceso, participación o demostración de aprendizaje.', false)
                ] },
                { width: '*', stack: [
                    checkboxItem('Persisten barreras o aparecieron nuevas.', false),
                    checkboxItem('Requiere ajustar, retirar o agregar apoyo.', false)
                ] }
            ],
            columnGap: 12,
            margin: [0, 0, 0, 4]
        });
        followBlock.push({
            table: {
                widths: ['100%'],
                body: [[
                    { text: 'Comentarios de seguimiento\n\n\n\n', fontSize: 8.5, color: PDF.COLORS.muted }
                ]]
            },
            layout: PDF.boxLayout(),
            margin: [0, 0, 0, 8]
        });
        content.push({ stack: followBlock, unbreakable: true });
    });

    content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 499, y2: 0, lineWidth: 0.6, lineColor: '#E5E7EB' }] });
    content.push({ text: '' });
    content.push({ text: 'Documento generado desde el Planificador Inclusivo UIE. Orientaciones alineadas con documentación institucional y fuentes disponibles en Apoyos adicionales / Referencias.', style: 'footerText' });

    return {
        content: content,
        styles: {
            headerOrg: { fontSize: 12, bold: true, color: '#b42318' },
            headerMeta: { fontSize: 8.5, color: '#6b7280' },
            mainTitle: { fontSize: 18, bold: true, color: '#111827', margin: [0, 0, 0, 7] },
            sectionTitle: { fontSize: 13, bold: true, color: '#111827', margin: [0, 9, 0, 5] },
            studentSectionTitle: { fontSize: 11.5, bold: true, color: '#111827', margin: [0, 7, 0, 3] },
            subSectionTitle: { fontSize: 10.5, bold: true, color: '#b42318', margin: [0, 6, 0, 3] },
            introText: { fontSize: 9.5, color: '#4b5563', margin: [0, 0, 0, 10], italics: true },
            bodyText: { fontSize: 9.5, color: '#111827', margin: [0, 2, 0, 2] },
            tableHeader: { fontSize: 9.5, bold: true, color: '#111827', fillColor: '#f3f4f6' },
            footerText: { fontSize: 8.5, color: '#9ca3af', margin: [0, 6, 0, 0], italics: true }
        },
        defaultStyle: { fontSize: 9.5, color: '#111827' },
        pageMargins: [40, 40, 40, 40]
    };
}

function formatReportDate() {
    var d = new Date();
    var days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    var months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return days[d.getDay()] + ' ' + d.getDate() + ' de ' + months[d.getMonth()] + ' de ' + d.getFullYear();
}

function showToast(msg) {
    var existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.className = 'toast-notification';
    t.setAttribute('role', 'status');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.classList.add('toast-show'); }, 10);
    setTimeout(function() {
        t.classList.remove('toast-show');
        setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 400);
    }, 3500);
}

function buildPdfHeader() {
    return PDF.firstPageHeader(formatReportDate());
}

function downloadDuaChecklist() {
    if (!window.UiePlannerDua) {
        window.UiePlannerNotice.showNotice('No se pudo cargar el módulo DUA. Recarga la página e intenta de nuevo.');
        return;
    }
    var checkedDua = window.UiePlannerDua.getCheckedDuaItems() || [];
    if (!checkedDua.length) {
        window.UiePlannerNotice.showNotice('Selecciona al menos una decisión DUA antes de generar el PDF.');
        return;
    }
    var content = buildPdfHeader();
    var checkedTexts = {};
    checkedDua.forEach(function(item) { checkedTexts[item.text] = true; });
    var stages = window.UiePlannerData.duaStagesData || [];
    var total = stages.reduce(function(sum, stage) { return sum + stage.checklist.length; }, 0);

    content.push({ text: 'Checklist DUA para la clase', style: 'mainTitle' });
    content.push({ text: checkedDua.length + ' de ' + total + ' decisiones seleccionadas. Las casillas marcadas indican lo que ya está incorporado en la planificación; las vacías quedan como opciones para revisar.', style: 'introText' });

    stages.forEach(function(stage, index) {
        var done = stage.checklist.filter(function(item) { return !!checkedTexts[item]; }).length;
        content.push({
            columns: [
                { width: '*', text: [{ text: (index + 1) + '  ', color: PDF.COLORS.accent }, stage.label, { text: '  ·  ' + stage.badge, color: PDF.COLORS.muted, bold: false, fontSize: 10 }] },
                { width: 'auto', text: done + ' de ' + stage.checklist.length, fontSize: 9, bold: false, color: PDF.COLORS.muted, margin: [0, 3, 0, 0] }
            ],
            style: 'sectionTitle',
            headlineLevel: 1
        });
        stage.checklist.forEach(function(item) {
            content.push(checkboxItem(item, !!checkedTexts[item]));
        });
    });

    content.push({ canvas: [{ type: 'line', x1: 0, y1: 14, x2: 499, y2: 14, lineWidth: 0.6, lineColor: '#E5E7EB' }] });
    content.push({ text: 'Documento generado desde el Planificador Inclusivo UIE. Orientaciones alineadas con documentación institucional y fuentes disponibles en Apoyos adicionales / Referencias.', style: 'footerText' });

    PDF.preview({ content: content }, 'checklist-dua.pdf', { title: 'Checklist DUA', subject: 'Decisiones DUA para la clase' });
}

function checkboxItem(text, checked) {
    return PDF.checkbox(text, checked);
}

function generatePlanEmail() {
    var students = collectPlanStudents();
    if (!students.length) {
        var msg = 'Selecciona al menos una condición de referencia para algún estudiante.';
        window.UiePlannerNotice.showNotice(msg);
        return;
    }

    var includeDua = false;
    var today = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

    var isSocial = students[0].mode === 'social';
    var body = isSocial ? 'Plan de apoyo docente — Ficha o matriz de acceso\n' : 'Plan de apoyo docente — Consultor por condición\n';
    body += 'Generado: ' + today + '\n\n';
    body += 'ESTUDIANTES\n-----------\n\n';

    var cats = ['context', 'materials', 'methods', 'interaction', 'evaluacion', 'tech'];
    var catNames = { context: 'Contexto aula', materials: 'Materiales', methods: 'Métodos', interaction: 'Interacción', evaluacion: 'Evaluaciones', tech: 'Tecnologías' };
    var scoreLabel = { 4: 'Perfecta', 3: 'Buena', 2: 'Parcial', 1: 'Incompatible' };

    students.forEach(function(student) {
        var label = student.name || ('Estudiante ' + student.index);
        body += label + '\n';

        if (student.mode === 'social') {
            body += '\nMATRIZ DE ACCESO CIF/OMS\n';
            var activities = window.UiePlannerData.accessMatrixActivities;
            activities.forEach(function(act) {
                var s = (student.matrixScores || {})[act.id] || 0;
                if (s > 0) {
                    body += '  ' + act.label + ': ' + s + ' (' + (scoreLabel[s] || '') + ')\n';
                }
            });

            if (student.conditions && student.conditions.length) {
                body += '\nCondición registrada en ficha: ' + student.conditions.map(function(c) { return c.name; }).join(', ') + '\n';
            }

            body += '\nRECOMENDACIONES POR DIMENSIÓN DEL MAPA\n';
            var barrierRecs = getBarrierBasedRecommendations(student.matrixScores || {}, student.conditionKeys || []);
            barrierRecs.forEach(function(group) {
                body += '  ' + group.label + '\n';
                body += '  Barreras en: ' + group.activities.join(', ') + '\n';
                group.items.forEach(function(item) {
                    body += '    ' + item.activity + ' (' + item.score + ' - ' + item.severity + ')\n';
                    item.recommendations.forEach(function(rec) {
                        body += '      - ' + rec + '\n';
                    });
                    item.observations.forEach(function(obs) {
                        body += '      - ' + obs + '\n';
                    });
                    if (item.clarification) {
                        body += '      - ' + item.clarification + '\n';
                    }
                });
                body += '\n';
            });

        } else {
            var condNames = student.conditions.map(function(c) { return c.name; });
            body += 'Condiciones: ' + condNames.join(', ') + '\n\n';
            var condKeys = student.conditions.map(function(c) { return c.key; });
            var matrixProfile = getStudentMatrixProfile(student.cardIndex || student.index);

            if (matrixProfile) {
                body += 'RECOMENDACIONES POR DIMENSION\n';
                groupMatrixItemsByDimension(getVisibleMatrixItems(student)).forEach(function(group) {
                    body += '  ' + group.label + ':\n';
                    group.items.forEach(function(item) {
                        var label = item.kind === 'clarification' ? 'Precisar barrera' : item.kind === 'observation' ? 'Observacion situacional' : (item.priorityLevel >= 3 ? 'Barrera significativa — intervenir' : 'Barrera moderada — ajustar');
                        body += '    - [' + label + '] ' + item.text + '\n';
                        body += '      Actividad CIF: ' + item.activities.join(', ') + '\n';
                        var evidence = formatClarificationEvidence(student.cardIndex || student.index, item);
                        if (evidence) body += '      Evidencia: ' + evidence + '\n';
                    });
                });
            } else {
                var merged = getMergedRecommendations(condKeys);
                var standardProfile = mergeConditionProfiles(condKeys);
                cats.forEach(function(cat) {
                    var items = merged[cat];
                    if (!items || !items.length) return;
                    var requirement = Math.max(1, standardProfile[cat] || 0);
                    body += '  ' + catNames[cat] + ':\n';
                    items.forEach(function(item) {
                        if (isRecommendationHidden(cat, item.text)) return;
                        body += '    - [' + requirementLabel(requirement) + '] ' + item.text + '\n';
                    });
                });
            }
            body += '\n';
        }
    });

    if (includeDua) {
        body += 'CHECKLIST DUA\n-------------\n\n';
        var stages = window.UiePlannerData.duaStagesData || [];
        stages.forEach(function(stage) {
            body += stage.label + ':\n';
            (stage.checklist || []).forEach(function(item) { body += '  [ ] ' + item + '\n'; });
            body += '\n';
        });
    }

    body += '\nLeyenda: Estas recomendaciones son orientativas. Ajusta según observación directa y conversación con el estudiante.\n';
    body += 'Generado desde el Planificador Inclusivo UIE.';

    var subject = 'Plan de apoyo docente - ' + today;
    var mailto = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    window.location.href = mailto;
}

window.UiePlannerSupports = {
    renderSupports,
    renderSelectedSupportRecommendations,
    renderGoodPractices,
    renderSupportStudents,
    addMedicalStudentCard,
    removeLastMedicalStudent,
    updateMedicalAddButton,
    updateMedicalRemoveButtons,
    updateMedicalConditionSummaries,
    getSelectedSupportStudentGroups,
    recommendationCategories,
    countRecommendations,
    groupStudentsByCondition,
    groupStudentsByProfile,
    getMergedRecommendations,
    renderProfileGroup,
    initConditionPills,
    renderConditionPills,
    renderConditionDetail,
    toggleCondition,
    getSelectedConditionKeys,
    categoryLabels,
    shortConditionNames,
    formatStudentLabel,
    applyStudentMatrix,
    clearStudentMatrix,
    updateStudentMatrixBadge,
    updateStudentStatusBadge,
    getStudentMatrixProfile,
    getStudentMatrixScores,
    getReferenceScores,
    scoreToRequirement,
    renderCIFBarChart,
    renderCIFRadarChart,
    destroyCIFRadarChart,
    rethemeAllRadarCharts,
    barrierProfiles,
    openPlanModal,
    closePlanModal,
    generatePlanPDF,
    generatePlanEmail,
    downloadDuaChecklist,
    getSemaforo,
    buildPdfHeader,
    groupHasMatrixProfile
};

})();
