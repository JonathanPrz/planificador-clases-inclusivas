(function () {
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

function _unused_switchMode(mode) {
    currentMode = mode;
    var selector = document.getElementById('mode-selector');
    var panelMedical = document.getElementById('panel-medical');
    var panelSocial = document.getElementById('panel-social');
    var results = document.getElementById('support-results');
    var resultsLayout = document.querySelector('.support-layout');
    var ctaPanel = document.getElementById('plan-cta-panel');
    var genMedical = document.getElementById('btn-generate-plan-medical');
    var genSocial = document.getElementById('btn-generate-plan-social');
    var editToggle = document.getElementById('btn-toggle-editing-mode');

    if (selector) selector.classList.add('mode-selected');
    if (panelMedical) panelMedical.style.display = (mode === 'medical') ? '' : 'none';
    if (panelSocial) panelSocial.style.display = (mode === 'social') ? '' : 'none';
    if (results) results.classList.add('hidden');
    if (resultsLayout) resultsLayout.style.display = 'none';
    if (ctaPanel) ctaPanel.style.display = mode ? '' : 'none';
    if (genMedical) genMedical.style.display = (mode === 'medical') ? '' : 'none';
    if (genSocial) genSocial.style.display = (mode === 'social') ? '' : 'none';

    if (mode === 'medical') {
        renderMedicalStudents(renderSelectedSupportRecommendations);
        initConditionPillsMedical();
    } else if (mode === 'social') {
        _unused_renderSocialStudents(renderSelectedSupportRecommendations);
    }
}

function initModeSelector() {
    var genMedical = document.getElementById('btn-generate-plan-medical');
    var editToggle = document.getElementById('btn-toggle-editing-mode');

    if (genMedical && genMedical.dataset.boundGen !== 'true') {
        genMedical.addEventListener('click', function() { openPlanModal(); });
        genMedical.setAttribute('data-bound-gen', 'true');
        genMedical.style.display = '';
    }
    if (editToggle && editToggle.dataset.boundEdit !== 'true') {
        editToggle.addEventListener('click', function() { setEditingMode(!editingMode); });
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

function initConditionPillsMedical() {
    if (!selectedConditionKeys.length) {
        selectedConditionKeys.push('autismo');
    }

    renderConditionPills();
    renderConditionDetail();
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
    var profilesHtml = '<div id="' + radarId + '" class="cif-radar-container"></div>' +
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
                '<p>Cada sección muestra los apoyos sugeridos según la condición registrada. Niveles: 1 🟢 Menor · 2 🟡 Moderado · 3 🔴 Prioritario. Ajusta según observación directa y conversación con el estudiante.</p>' +
            '</div>' +
        '</div>' +
        profilesHtml;

    renderCIFRadarChart(students, radarId, { height: '380px' });
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
        ? 'Perfil comparado de requerimientos CIF entre los estudiantes. Niveles: 1 🟢 Menor · 2 🟡 Moderado · 3 🔴 Prioritario. Las recomendaciones específicas están más abajo, agrupadas por estudiante.'
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

    profilesHtml = '<div id="' + radarId + '" class="cif-radar-container"></div>' + profilesHtml;

    var headerHtml = hasMatrixApplied
        ? '<div class="results-title-header"><div><span class="source-pill">Perfil CIF</span><p>' + descriptionText + '</p></div></div>'
        : '<div class="results-title-header"><div><span class="source-pill">Consultor por condici\u00f3n</span><h3>Orientaciones iniciales para observar barreras</h3><p>' + descriptionText + '</p></div></div>';

    results.innerHTML = headerHtml + profilesHtml;
    renderCIFRadarChart(students, radarId, { height: '380px' });
    bindRecommendationEditing();
    bindManualRecommendationEditing();
    bindAdvisorCommentFields();
    bindClarificationModal();
    bindClarificationButtons();
}

function _unused_renderSocialResults() {
    var results = document.getElementById('support-results');
    if (!results) return;

    var layout = document.querySelector('.support-layout');
    if (layout) layout.style.display = '';

    var cards = document.querySelectorAll('#support-students-social .support-student-card');
    var hasMatrixData = false;

    var students = Array.from(cards).map(function(card) {
        var idx = card.getAttribute('data-student-index');
        var name = (card.querySelector('.student-name')?.value || '').trim();
        var mData = matrixData[idx];
        if (mData && mData.applied) hasMatrixData = true;
        return {
            label: name || ('Estudiante ' + idx),
            cardIndex: Number(idx),
            name: name,
            conditionKeys: mData ? mData.conditionKeys || _unused_readSocialConditionKeys(idx) : _unused_readSocialConditionKeys(idx),
            conditions: (mData ? mData.conditionKeys || _unused_readSocialConditionKeys(idx) : _unused_readSocialConditionKeys(idx)).map(function(key) {
                var data = accommodationsData[key];
                return data ? { key: key, name: data.name, source: data.source } : null;
            }).filter(Boolean),
            hasMatrix: !!(mData && mData.applied),
            matrixScores: mData ? mData.scores || {} : {}
        };
    });

    results.classList.remove('hidden');

    var matrixStudents = [];
    var recsHtml = students.map(function(student, sIdx) {
        var label = student.name || ('Estudiante ' + student.cardIndex);

        if (student.hasMatrix) {
            matrixStudents.push(student);
            var barrierRecs = getBarrierBasedRecommendations(student.matrixScores, student.conditionKeys || []);

            if (!barrierRecs.length) {
                return '<article class="support-recommendation-group">' +
                    '<div class="results-title-header"><div>' +
                    '<h3>' + label + '</h3>' +
                    '<p>No se identificaron barreras significativas o falta seleccionar la condici\u00f3n registrada en la ficha.</p>' +
                    '</div></div></article>';
            }

            var itemsHtml = barrierRecs.map(function(group) {
                var activityHtml = group.items.map(function(item) {
                    var body = '';
                    if (item.recommendations.length) {
                        body += '<ul class="acc-list">' + item.recommendations.map(function(rec) { return '<li>' + rec + '</li>'; }).join('') + '</ul>';
                    }
                    if (item.observations.length) {
                        body += '<ul class="acc-list matrix-observation-list">' + item.observations.map(function(obs) { return '<li>' + obs + '</li>'; }).join('') + '</ul>';
                    }
                    if (item.clarification) {
                        body += '<p class="matrix-clarification">' + item.clarification + '</p>';
                    }
                    return '<div class="matrix-activity-result">' +
                        '<h5>' + item.activity + ' <span class="matrix-severity ' + item.severityClass + '">' + item.score + ' \u00b7 ' + item.severity + '</span></h5>' +
                        body +
                        '</div>';
                }).join('');
                return '<article class="acc-card barrier-card">' +
                    '<h4>' + group.label + '</h4>' +
                    '<p class="barrier-activities">Barreras en: ' + group.activities.join(', ') + '</p>' +
                    activityHtml +
                    '</article>';
            }).join('');

            var conditionText = student.conditions.length
                ? student.conditions.map(function(c) { return c.name; }).join(', ')
                : 'Sin condici\u00f3n registrada';

            return '<article class="support-recommendation-group">' +
                '<div class="results-title-header"><div>' +
                '<span class="source-pill">Matriz CIF/OMS</span>' +
                '<h3>' + label + '</h3>' +
                '<p><strong>Filtro de pertinencia:</strong> ' + conditionText + '. Las recomendaciones se agrupan en las mismas dimensiones del mapa de barreras.</p>' +
                '</div></div>' +
                '<div class="support-grid">' + itemsHtml + '</div>' +
                '</article>';
        }

        if (!student.conditions.length) {
            return '<article class="support-recommendation-group">' +
                '<div class="results-title-header"><div>' +
                '<h3>' + label + '</h3>' +
                '<p>Selecciona una condici\u00f3n registrada en la ficha para ver orientaciones de apoyo.</p>' +
                '</div></div></article>';
        }

        var group = {
            conditions: student.conditions,
            students: [{ label: student.label, name: student.name, cardIndex: student.cardIndex }]
        };
        try {
            return renderStandardRecommendationGroup(group, { hasMatrixProfile: false });
        } catch (e) {
            return '<article class="support-recommendation-group"><div class="results-title-header"><div><h3>' + label + '</h3><p>Error generando recomendaciones: ' + e.message + '</p></div></div></article>';
        }
    }).join('');

    if (matrixStudents.length) {
        var radarId = 'cif-radar-social';
        recsHtml = '<div id="' + radarId + '" class="cif-radar-container"></div>' + recsHtml;
    }

    var headerHtml = hasMatrixData
        ? '<div class="results-title-header results-toolbar"><div><span class="source-pill">Perfil CIF</span><p>Perfil comparado de requerimientos CIF entre los estudiantes. Las recomendaciones específicas están más abajo, agrupadas por estudiante.</p></div></div>'
        : '<div class="results-title-header results-toolbar"><div><span class="source-pill">Consultor por condici\u00f3n</span><h3>Orientaciones iniciales para observar barreras</h3><p>Revisa cada categor\u00eda como referencia inicial mientras identificas barreras concretas.</p></div></div>';

    results.innerHTML = headerHtml + recsHtml;
    if (matrixStudents.length) {
        renderCIFRadarChart(matrixStudents, 'cif-radar-social', { height: '380px' });
    }
    bindBarrierMapToggles();
    bindRecommendationEditing();
    bindManualRecommendationEditing();
    bindAdvisorCommentFields();
}

function renderCIFBarChart(students, options) {
    options = options || {};
    var activities = window.UiePlannerData.accessMatrixActivities;
    var hasAnyMatrix = false;

    var studentCols = [];
    students.slice(0, 4).forEach(function(student, index) {
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

    var extraCount = Math.max(0, students.length - 4);

    if (!hasAnyMatrix) return '';

    var headerCells = studentCols.map(function(col) {
        return '<div class="cif-student-header">' + col.label + '</div>';
    }).join('');

    var bodyRows = activities.map(function(act, ai) {
        var label = shortActivityLabels[act.id] || act.label;
        var cells = studentCols.map(function(col) {
            var row = col.rows[ai];
            var level = row.severity;
            var widthPct = level > 0 ? (level / 3) * 100 : 0;
            return '<div class="cif-cell">' +
                '<div class="cif-minibar requirement-level-' + level + '" style="width:' + widthPct + '%"></div>' +
                '</div>';
        }).join('');
        var labelCls = ai % 2 === 0 ? 'cif-label-even' : 'cif-label-odd';
        return '<div class="cif-row">' +
            '<div class="cif-label ' + labelCls + '">' + label + '</div>' +
            cells +
            '</div>';
    }).join('');

    var sourceLabel = hasAnyMatrix ? 'Matriz CIF aplicada' : 'Orientaci\u00f3n por condici\u00f3n';
    var descText = hasAnyMatrix
        ? 'Datos de la matriz CIF del estudiante. Cada barra muestra el nivel de apoyo sugerido seg\u00fan la compatibilidad registrada.'
        : 'Valores de referencia basados en el perfil t\u00edpico de la condici\u00f3n. Aplica la matriz CIF para obtener datos reales del estudiante.';

    var legendHtml = '<div class="cif-legend">' +
        [0,1,2,3].map(function(lvl) {
            return '<span class="level-badge level-badge-' + lvl + '">' + requirementLabel(lvl) + '</span>';
        }).join('') +
        '</div>';

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
            '<div class="cif-row">' +
                '<div class="cif-label cif-header-label">Actividad CIF</div>' +
                headerCells +
            '</div>' +
            bodyRows +
            legendHtml +
            (extraCount ? '<p class="small-note">+ ' + extraCount + ' estudiante(s) no graficados.</p>' : '') +
        '</div>' +
        '</div>';
}

function _unused_bindCIFBarToggles() {
    document.querySelectorAll('.cif-bar-toggle:not([data-bound])').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var panel = btn.closest('.barrier-map-panel');
            if (!panel) return;
            var chart = panel.querySelector('.cif-chart');
            if (!chart) return;
            var isHidden = chart.style.display === 'none';
            chart.style.display = isHidden ? '' : 'none';
            btn.textContent = isHidden ? 'Ocultar gr\u00e1fico' : 'Ver gr\u00e1fico';
            btn.setAttribute('aria-expanded', String(isHidden));
        });
        btn.setAttribute('data-bound', 'true');
    });
}

var CIF_RADAR_COLORS = [
    { border: '#4361ee', bg: 'rgba(67,97,238,0.12)' },
    { border: '#f72585', bg: 'rgba(247,37,133,0.12)' },
    { border: '#06d6a0', bg: 'rgba(6,214,160,0.12)' },
    { border: '#ffb703', bg: 'rgba(255,183,3,0.12)' },
    { border: '#7209b7', bg: 'rgba(114,9,183,0.12)' },
    { border: '#e36414', bg: 'rgba(227,100,20,0.12)' },
    { border: '#4cc9f0', bg: 'rgba(76,201,240,0.12)' },
    { border: '#f94144', bg: 'rgba(249,65,68,0.12)' }
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
        borderWidth: 3,
        pointBackgroundColor: color.border,
        pointBorderColor: color.border,
        pointBorderWidth: 1.5,
        pointRadius: 3.5,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.15
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
        if (hasMatrix || student.conditions) filteredStudents.push(student);
    });
    if (!filteredStudents.length) return;

    container.__radarStudents = students;
    container.__radarOptions = options;

    if (options.height) container.style.height = options.height;

    var card = document.createElement('div');
    card.className = 'cif-radar-card';

    var body = document.createElement('div');
    body.className = 'cif-radar-body';

    var wrapper = document.createElement('div');
    wrapper.className = 'cif-radar-wrapper';
    if (options.height) wrapper.style.height = options.height;

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
            var item = document.createElement('div');
            item.className = 'radar-legend-item';

            var dot = document.createElement('span');
            dot.className = 'legend-item-dot';
            dot.style.backgroundColor = color.border;

            var label = document.createElement('span');
            label.className = 'legend-item-label';
            label.textContent = formatStudentLabel(student);

            var eye = document.createElement('span');
            eye.className = 'legend-item-eye';
            eye.textContent = '👁';

            item.appendChild(dot);
            item.appendChild(label);
            item.appendChild(eye);

            item.addEventListener('click', function() {
                var meta = chart.getDatasetMeta(i);
                var wasHidden = !!(meta.hidden || false);
                chart.setDatasetVisibility(i, wasHidden);
                item.classList.toggle('radar-hidden', !wasHidden);
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

function supportRecommendationGroup(grouped) {
    const data = grouped.condition;
    const studentNames = grouped.students.map(student => formatStudentLabel(student)).join(', ');
    return `
        <article class="support-recommendation-group">
            <div class="results-title-header">
                <div>
                    <h3>${studentNames}</h3>
                    <p><span class="source-pill">${data.source}</span> <strong>Condición:</strong> ${data.name}</p>
                </div>
            </div>
            <div class="support-grid">
                ${supportCategory('Contexto aula', data.context)}
                ${supportCategory('Materiales de estudio', data.materials)}
                ${supportCategory('Métodos de enseñanza', data.methods)}
                ${supportCategory('Interacción en aula', data.interaction)}
                ${supportCategory('De las evaluaciones', data.evaluacion)}
                ${supportCategory('Tecnologías asistivas', data.tech)}
            </div>
            ${data.highlights ? `
                <div class="context-panel">
                    <h4>Apoyos destacados para esta condición</h4>
                    <div class="mini-grid">
                        ${data.highlights.map(item => `
                            <article class="mini-card">
                                <h5>${item.title}</h5>
                                <p>${item.text}</p>
                            </article>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            ${data.regulation ? `
                <div class="regulation-panel">
                    <div class="resource-heading">
                        <span class="source-pill">Autismo</span>
                        <h4>Desregulación emocional y conductual</h4>
                        <p>Orientación pedagógica de apoyo, no protocolo clínico. La desregulación suele responder a sobrecarga, ansiedad, cambios inesperados o estímulos desencadenantes.</p>
                    </div>
                    <div class="regulation-grid">
                        ${data.regulation.map(group => `
                            <article class="regulation-card">
                                <h5>${group.title}</h5>
                                <ul class="acc-list">
                                    ${group.items.map(item => `<li>${item}</li>`).join('')}
                                </ul>
                            </article>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            ${data.source === 'Autismo' ? `
                <div class="myths-panel">
                    <div class="resource-heading">
                        <span class="source-pill">Autismo</span>
                        <h4>Mitos y trato en autismo</h4>
                        <p>Estas orientaciones ayudan a evitar prejuicios al acompañar la práctica docente.</p>
                    </div>
                    <div class="myths-grid">
                        ${autismMyths.map(item => `<article class="myth-item">${item}</article>`).join('')}
                    </div>
                </div>
            ` : ''}
        </article>
    `;
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

function supportCategory(title, items) {
    return `
        <article class="acc-card">
            <h4>${title}</h4>
            <ul class="acc-list">${items.map(item => `<li>${item}</li>`).join('')}</ul>
        </article>
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

function _unused_renderSocialStudents(onStudentChange) {
    var container = document.getElementById('support-students-social');
    var addBtn = document.getElementById('add-student-btn-social');
    if (!container) return;

    var count = Number(container.getAttribute('data-student-count')) || 1;
    count = Math.max(1, Math.min(8, count));
    container.setAttribute('data-student-count', String(count));

    var existingCards = container.querySelectorAll('.support-student-card');
    var existingCount = existingCards.length;

    if (count > existingCount) {
        for (var i = existingCount; i < count; i++) {
            container.appendChild(createSocialStudentCard(i + 1));
        }
    } else if (count < existingCount) {
        for (var j = existingCount - 1; j >= count; j--) {
            var removedIndex = existingCards[j].getAttribute('data-student-index');
            delete matrixData[removedIndex];
            existingCards[j].remove();
        }
    }

    container.querySelectorAll('.support-student-card:not([data-events-bound])').forEach(function(card) {
        var studentIndex = card.getAttribute('data-student-index');

        card.querySelectorAll('.student-name').forEach(function(input) {
            input.addEventListener('input', onStudentChange);
            input.addEventListener('change', onStudentChange);
        });

        card.querySelectorAll('.social-condition-pill').forEach(function(pill) {
            pill.addEventListener('click', function() {
                var key = pill.getAttribute('data-condition-key');
                var isMultiplePill = key === 'multiple';
                var isMultipleMode = card.getAttribute('data-multiple') === 'true';

                if (isMultiplePill) {
                    var newMode = !isMultipleMode;
                    card.setAttribute('data-multiple', String(newMode));
                    pill.classList.toggle('active', newMode);
                    if (!newMode) {
                        var activePills = card.querySelectorAll('.social-condition-pill.active:not(.multiple)');
                        if (activePills.length > 1) {
                            for (var i = 1; i < activePills.length; i++) {
                                activePills[i].classList.remove('active');
                            }
                        }
                    }
                } else if (isMultipleMode) {
                    pill.classList.toggle('active');
                } else {
                    var wasActive = pill.classList.contains('active');
                    card.querySelectorAll('.social-condition-pill:not(.multiple)').forEach(function(p) {
                        p.classList.remove('active');
                    });
                    if (!wasActive) pill.classList.add('active');
                }

                _unused_updateSocialConditionSummary(studentIndex);
                if (matrixData[studentIndex] && matrixData[studentIndex].applied) {
                    renderSelectedSupportRecommendations();
                }
            });
        });

        card.querySelectorAll('input[type="radio"][name^="social-matrix"]').forEach(function(radio) {
            radio.addEventListener('change', function() {
                updateStudentMatrixBadge(studentIndex);
                if (_unused_readSocialConditionKeys(studentIndex).length) {
                    applyStudentMatrix(studentIndex);
                }
            });
        });

        var applyBtn = card.querySelector('[id^="apply-matrix-"]');
        var clearBtn = card.querySelector('[id^="clear-matrix-"]');
        if (applyBtn) applyBtn.addEventListener('click', function() { applyStudentMatrix(studentIndex); });
        if (clearBtn) clearBtn.addEventListener('click', function() { clearStudentMatrix(studentIndex); });

        var removeBtn = card.querySelector('.btn-remove-student');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() { _unused_removeLastSocialStudent(onStudentChange); });
        }

        card.setAttribute('data-events-bound', '');
    });

    if (addBtn && addBtn.dataset.boundSocial !== 'true') {
        addBtn.addEventListener('click', function() { _unused_addSocialStudentCard(onStudentChange); });
        addBtn.setAttribute('data-bound-social', 'true');
    }

    _unused_updateSocialRemoveButtons();
    _unused_updateSocialAddButton();
    _unused_updateSocialMatrixSummaries();
    container.querySelectorAll('.support-student-card').forEach(function(card) {
        _unused_updateSocialConditionSummary(card.getAttribute('data-student-index'));
    });
}

function renderSupportStudents(onStudentChange) {
    renderMedicalStudents(onStudentChange || renderSelectedSupportRecommendations);
}

function getConditionFilterButtons(className) {
    return conditionGridOrder.map(function(key) {
        var isMultiple = key === 'multiple';
        var data = accommodationsData[key];
        if (!data && !isMultiple) return '';
        var extraClass = isMultiple ? ' multiple' : '';
        var label = isMultiple ? 'Múltiple' : (shortConditionNames[key] || key);
        return '<button class="condition-pill ' + className + extraClass + '" data-condition-key="' + key + '" type="button">' +
            '<span class="condition-pill-name">' + label + '</span>' +
            '</button>';
    }).join('');
}

function _unused_readSocialConditionKeys(studentIndex) {
    var card = document.querySelector('#support-students-social .support-student-card[data-student-index="' + studentIndex + '"]');
    if (!card) return [];
    return Array.from(card.querySelectorAll('.social-condition-pill.active')).map(function(pill) {
        return pill.getAttribute('data-condition-key');
    }).filter(function(key) { return key && key !== 'multiple'; });
}

function _unused_updateSocialConditionSummary(studentIndex) {
    var card = document.querySelector('#support-students-social .support-student-card[data-student-index="' + studentIndex + '"]');
    if (!card) return;
    var note = card.querySelector('.social-condition-summary');
    var keys = _unused_readSocialConditionKeys(studentIndex);
    if (note) {
        note.textContent = keys.length
            ? 'Filtro activo: ' + keys.map(function(key) { return shortConditionNames[key] || key; }).join(', ')
            : 'Selecciona la condición registrada en la ficha para filtrar apoyos pertinentes.';
    }
    if (matrixData[studentIndex]) {
        matrixData[studentIndex].conditionKeys = keys;
    }
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
        '<label for="student-name-medical-' + studentIndex + '">Nombre del estudiante (opcional)</label>' +
        '<input id="student-name-medical-' + studentIndex + '" class="text-control student-name" type="text" placeholder="Si queda vacío se usará Estudiante ' + studentIndex + '">' +
        '<div class="student-card-status" id="student-status-medical-' + studentIndex + '">Sin condición de referencia seleccionada</div>' +
        '<p class="condition-consultor-note">Selecciona una condición solo para orientar la observación. Luego formula el ajuste desde la barrera concreta, no desde la etiqueta.</p>' +
        '<div class="condition-pills-inline" id="condition-pills-card-' + studentIndex + '">' +
            pillsHtml +
        '</div>' +
        '<label class="radar-visibility-toggle">' +
            '<input type="checkbox" class="show-in-chart">' +
            '<span>Mostrar en gráfico</span>' +
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

function _unused_createSocialStudentCard(studentIndex) {
    var wrapper = document.createElement('article');
    wrapper.className = 'support-student-card';
    wrapper.setAttribute('data-student-index', String(studentIndex));
    wrapper.setAttribute('data-multiple', 'false');

    var activities = window.UiePlannerData.accessMatrixActivities;
    var matrixRows = activities.map(function(act) {
        var cells = [4, 3, 2, 1].map(function(val) {
            return '<td class="matrix-col-score">' +
                '<label class="matrix-radio-group">' +
                '<input type="radio" name="social-matrix-' + studentIndex + '-' + act.id + '" value="' + val + '">' +
                '<span>' + val + '</span>' +
                '</label></td>';
        }).join('');
        return '<tr><td class="matrix-activity-label">' + act.label + '</td>' + cells + '</tr>';
    }).join('');

    wrapper.innerHTML =
        '<h4>Estudiante ' + studentIndex + '</h4>' +
        '<label for="student-name-social-' + studentIndex + '">Nombre del estudiante (opcional)</label>' +
        '<input id="student-name-social-' + studentIndex + '" class="text-control student-name" type="text" placeholder="Si queda vacío se usará Estudiante ' + studentIndex + '">' +
        '<div class="student-card-status" id="student-status-social-' + studentIndex + '">Sin apoyos definidos</div>' +
        '<div class="social-condition-filter">' +
            '<h5 class="matrix-heading">Condición registrada en ficha</h5>' +
            '<p class="matrix-help">Filtra apoyos pertinentes. No cambia el gráfico.</p>' +
            '<div class="condition-pills-inline">' + getConditionFilterButtons('social-condition-pill') + '</div>' +
            '<p class="social-condition-summary">Selecciona la condición registrada en la ficha para filtrar apoyos pertinentes.</p>' +
        '</div>' +
        '<div class="student-matrix-section">' +
            '<h5 class="matrix-heading">Matriz de acceso CIF/OMS</h5>' +
            '<p class="matrix-help">Puntúa cada actividad según la ficha del estudiante.</p>' +
            '<div class="student-matrix-wrap">' +
                '<table class="student-matrix-table">' +
                    '<thead><tr><th>Actividad</th><th class="matrix-col-score">4</th><th class="matrix-col-score">3</th><th class="matrix-col-score">2</th><th class="matrix-col-score">1</th></tr></thead>' +
                    '<tbody>' + matrixRows + '</tbody>' +
                '</table>' +
                '<div class="student-matrix-legend">' +
                    '<span><strong>4</strong> Compatibilidad perfecta</span>' +
                    '<span><strong>3</strong> Compatibilidad buena</span>' +
                    '<span><strong>2</strong> Compatibilidad parcial</span>' +
                    '<span><strong>1</strong> Incompatibilidad</span>' +
                '</div>' +
            '</div>' +
            '<div class="student-matrix-actions">' +
                '<button class="btn btn-primary btn-sm" id="apply-matrix-' + studentIndex + '" type="button">Identificar barreras</button>' +
                '<button class="btn btn-secondary btn-sm" id="clear-matrix-' + studentIndex + '" type="button">Limpiar</button>' +
                '<span class="student-matrix-badge" id="student-matrix-badge-' + studentIndex + '"></span>' +
            '</div>' +
        '</div>' +
        '<button class="btn-remove-student" type="button" title="Eliminar estudiante" style="display:none">&times;</button>';

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

function _unused_addSocialStudentCard(onStudentChange) {
    var container = document.getElementById('support-students-social');
    if (!container) return;
    var count = Number(container.getAttribute('data-student-count')) || 1;
    if (count >= 8) return;
    container.setAttribute('data-student-count', String(count + 1));
    _unused_renderSocialStudents(onStudentChange);
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

function _unused_removeLastSocialStudent(onStudentChange) {
    var container = document.getElementById('support-students-social');
    if (!container) return;
    var count = Number(container.getAttribute('data-student-count')) || 1;
    if (count <= 1) return;
    var cards = container.querySelectorAll('.support-student-card');
    if (cards.length > 0) {
        var matrixIdx = cards[cards.length - 1].getAttribute('data-student-index');
        delete matrixData[matrixIdx];
        cards[cards.length - 1].remove();
    }
    container.setAttribute('data-student-count', String(count - 1));
    _unused_updateSocialRemoveButtons();
    _unused_updateSocialAddButton();
    _unused_updateSocialMatrixSummaries();
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

function _unused_updateSocialAddButton() {
    var addBtn = document.getElementById('add-student-btn-social');
    var container = document.getElementById('support-students-social');
    if (!addBtn || !container) return;
    var count = Number(container.getAttribute('data-student-count')) || 1;
    if (count >= 8) { addBtn.style.display = 'none'; return; }
    var cards = container.querySelectorAll('.support-student-card');
    var lastCard = cards[cards.length - 1];
    if (!lastCard) { addBtn.style.display = 'none'; return; }
    var hasMatrix = matrixData[lastCard.getAttribute('data-student-index')] && matrixData[lastCard.getAttribute('data-student-index')].applied;
    addBtn.style.display = hasMatrix ? '' : 'none';
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

function _unused_updateSocialRemoveButtons() {
    var container = document.getElementById('support-students-social');
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

function _unused_updateSocialMatrixSummaries() {
    document.querySelectorAll('#support-students-social .support-student-card').forEach(function(card) {
        var idx = card.getAttribute('data-student-index');
        updateStudentMatrixBadge(idx);
        updateStudentStatusBadgeForContainer('support-students-social', idx, null);
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

function _unused_renderReferenceCatalog() {
    var conditionKeys = Object.keys(accommodationsData);

    var items = conditionKeys.map(function(key) {
        var data = accommodationsData[key];
        var catsHtml = ['context', 'materials', 'methods', 'interaction', 'evaluacion', 'tech'].map(function(cat) {
            var arr = data[cat];
            if (!arr || !arr.length) return '';
            var listItems = arr.slice(0, 4).map(function(r) { return '<li>' + r + '</li>'; }).join('');
            var extra = arr.length > 4 ? '<li class="ref-more">+ ' + (arr.length - 4) + ' más</li>' : '';
            return '<div class="ref-cat"><strong>' + (categoryLabels[cat] || cat) + '</strong><ul>' + listItems + extra + '</ul></div>';
        }).join('');

        return '<details class="ref-condition">' +
            '<summary><span>' + data.name + '</span></summary>' +
            '<div class="ref-body">' + catsHtml + '</div>' +
            '</details>';
    }).join('');

    return '<div class="results-title-header">' +
        '<div>' +
            '<h3>Recomendaciones por condición</h3>' +
            '<p>Catálogo de referencia para apoyar a cualquier estudiante según su condición. Selecciona condiciones en la ficha de arriba para ver solo las relevantes.</p>' +
        '</div>' +
    '</div>' +
    '<div class="ref-catalog">' + items + '</div>';
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
    var studentNames = group.students.map(function(s) { return formatStudentLabel(s); }).join(', ');
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

function _unused_computeWeightedMatrixProfile(scores, conditionKeys) {
    var activities = window.UiePlannerData.accessMatrixActivities;
    var filterKeys = (conditionKeys || []).filter(function(key) { return accommodationsData[key]; });
    var evidence = {};

    barrierDimensions.forEach(function(dim) {
        evidence[dim.key] = { maxValue: 0, strongCount: 0, primaryCount: 0 };
    });

    activities.forEach(function(activity) {
        var score = scores[activity.id] || 0;
        var requirement = scoreToRequirement(score);
        if (!requirement) return;

        var matchingRules = filterKeys.length ? (matrixRecommendationRules || []).filter(function(rule) {
            return ruleMatchesMatrixActivity(rule, activity, score, filterKeys);
        }) : [];

        if (matchingRules.length) {
            matchingRules.forEach(function(rule) {
                var weights = getRuleWeights(rule);
                Object.keys(weights).forEach(function(dimKey) {
                    if (!evidence[dimKey]) return;
                    var weight = Math.max(0, Math.min(1, Number(weights[dimKey]) || 0));
                    var value = requirement * weight;
                    evidence[dimKey].maxValue = Math.max(evidence[dimKey].maxValue, value);
                    if (weightedValueToLevel(value) >= 2) evidence[dimKey].strongCount += 1;
                    if (weight >= 1) evidence[dimKey].primaryCount += 1;
                });
            });
            return;
        }

        (activity.dims || []).forEach(function(dimKey) {
            if (!evidence[dimKey]) return;
            var value = requirement * 0.7;
            evidence[dimKey].maxValue = Math.max(evidence[dimKey].maxValue, value);
            if (weightedValueToLevel(value) >= 2) evidence[dimKey].strongCount += 1;
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

function _unused_computeRadarProfile(scores) {
    var activities = window.UiePlannerData.accessMatrixActivities;
    var dims = { context: [], materials: [], methods: [], interaction: [], evaluacion: [], tech: [] };

    activities.forEach(function(act) {
        var score = scores[act.id] || 0;
        if (!score) return;
        var radarValue = Math.max(0, 4 - score);
        act.dims.forEach(function(dim) {
            dims[dim].push(radarValue);
        });
    });

    return barrierDimensions.reduce(function(profile, dim) {
        var values = dims[dim.key] || [];
        profile[dim.key] = values.length ? Math.max.apply(null, values) : 0;
        return profile;
    }, {});
}

function applyStudentMatrix(studentIndex) {
    var scores = readStudentMatrixScores(studentIndex);
    var scored = Object.values(scores).filter(function(v) { return v > 0; });
    if (!scored.length) return;
    var conditionKeys = readMedicalConditionKeys(studentIndex);
    if (!conditionKeys.length) {
        alert('Selecciona la condición registrada en la ficha antes de identificar barreras. Esto evita sugerir apoyos que no corresponden.');
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

function readAdvisorComments(card) {
    var idx = card ? card.getAttribute('data-student-index') : '';
    return (advisorCommentsByStudent[idx] || '').trim();
}

function collectMedicalStudents() {
    var students = [];
    var cards = document.querySelectorAll('#support-students-medical .support-student-card');

    cards.forEach(function(card) {
        var studentIndex = Number(card.getAttribute('data-student-index'));
        var name = (card.querySelector('.student-name')?.value?.trim() || '');

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
            conditions: conditions,
            conditionKeys: conditions.map(function(c) { return c.key; }),
            assessmentSource: getStudentAssessmentSource(studentIndex),
            matrixScores: getStudentMatrixScores(studentIndex),
            cardIndex: studentIndex,
            mode: 'medical',
            advisorComments: readAdvisorComments(card)
        });
    });

    return students;
}

function _unused_collectSocialStudents() {
    var students = [];
    var cards = document.querySelectorAll('#support-students-social .support-student-card');

    cards.forEach(function(card) {
        var studentIndex = Number(card.getAttribute('data-student-index'));
        var name = (card.querySelector('.student-name')?.value?.trim() || '');

        var hasMatrix = matrixData[studentIndex] && matrixData[studentIndex].applied;
        var matrixScores = hasMatrix ? matrixData[studentIndex].scores : {};
        var conditionKeys = hasMatrix ? (matrixData[studentIndex].conditionKeys || _unused_readSocialConditionKeys(studentIndex)) : _unused_readSocialConditionKeys(studentIndex);
        var hasScores = hasMatrix && Object.values(matrixScores).filter(function(v) { return v > 0; }).length > 0;

        if (!hasScores) return;

        students.push({
            index: studentIndex,
            name: name,
            conditions: conditionKeys.map(function(key) {
                var data = accommodationsData[key];
                return data ? { key: key, name: data.name, source: data.source } : null;
            }).filter(Boolean),
            conditionKeys: conditionKeys,
            matrixScores: matrixScores,
            cardIndex: studentIndex,
            mode: 'social',
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
        alert(msg);
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
        var headerContent = buildPdfHeader();
        docDef.content = headerContent.concat(docDef.content);
    } catch (e) {
        console.error('Error construyendo documento PDF:', e);
        alert('Error al construir el documento: ' + e.message);
        return;
    }

    if (!window.pdfMake || typeof window.pdfMake.createPdf !== 'function') {
        alert('Librería PDF no disponible. Recarga la página.');
        return;
    }
    var filename = 'plan-de-apoyo-por-condicion.pdf';
    try {
        window.pdfMake.createPdf(docDef).download(filename);
    } catch(e) {
        console.error('Error generando PDF:', e);
        alert('Error al generar el PDF: ' + e.message);
    }
}

function _unused_renderStudentBarChartCanvas(student, label) {
    var activities = window.UiePlannerData.accessMatrixActivities;
    var studentIndex = student.cardIndex || student.index || 1;
    var matrixScores = getStudentMatrixScores(studentIndex);
    var hasMatrix = Object.values(matrixScores).some(function(v) { return Number(v || 0) > 0; });

    var rows;
    if (hasMatrix) {
        rows = activities.map(function(act) {
            var score = Number(matrixScores[act.id] || 0);
            var requirement = scoreToRequirement(score);
            return { label: shortActivityLabels[act.id] || act.label, score: score, severity: requirement };
        });
    } else {
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
            return { label: shortActivityLabels[act.id] || act.label, score: 0, severity: maxSev };
        });
    }

    var barColors = { 0: '#9aa0a6', 1: '#34a853', 2: '#fbbc04', 3: '#ea4335' };
    var barBorderColors = { 0: '#9aa0a6', 1: '#34a853', 2: '#fbbc04', 3: '#ea4335' };
    var rowH = 24;
    var gap = 4;
    var labelW = 100;
    var trackW = 200;
    var scoreW = 30;
    var tagW = 100;
    var marginL = 20;
    var marginT = 30;
    var marginB = 10;
    var w = marginL + labelW + 8 + trackW + 8 + scoreW + 8 + tagW + marginL;
    var h = marginT + rows.length * (rowH + gap) + marginB;
    var maxSev = 3;

    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(label, marginL, 4);

    rows.forEach(function(row, i) {
        var y = marginT + i * (rowH + gap);
        var sev = Math.min(maxSev, Math.max(0, row.severity));
        var barW = sev > 0 ? (sev / maxSev) * trackW : 0;
        var fillColor = barColors[sev];
        var borderColor = barBorderColors[sev];
        var scoreText = row.score > 0 ? String(row.score) : '\u2014';
        var tagText = requirementLabel(sev);
        var alpha = hasMatrix ? 1.0 : 0.55;

        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.fillStyle = '#111827';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(row.label, marginL, y + rowH / 2);

        ctx.fillStyle = '#f3f4f6';
        ctx.beginPath();
        ctx.roundRect(marginL + labelW + 8, y, trackW, rowH, 4);
        ctx.fill();

        if (barW > 0) {
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.roundRect(marginL + labelW + 8, y, barW, rowH, 4);
            ctx.fill();
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(marginL + labelW + 8, y, barW, rowH, 4);
            ctx.stroke();
        }

        ctx.fillStyle = '#374151';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(scoreText, marginL + labelW + 8 + trackW + 4 + scoreW / 2, y + rowH / 2);

        var tagX = marginL + labelW + 8 + trackW + 8 + scoreW + 8;
        var tagColors = { 0: { bg: '#9aa0a6', text: '#ffffff' }, 1: { bg: '#34a853', text: '#ffffff' }, 2: { bg: '#fbbc04', text: '#374151' }, 3: { bg: '#ea4335', text: '#ffffff' } };
        var tc = tagColors[sev] || tagColors[0];
        ctx.fillStyle = tc.bg;
        ctx.beginPath();
        ctx.roundRect(tagX, y, tagW, rowH, 12);
        ctx.fill();
        ctx.fillStyle = tc.text;
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tagText, tagX + tagW / 2, y + rowH / 2);

        ctx.restore();
    });

    return canvas.toDataURL('image/png');
}

function renderPdfCIFRadarChartCanvas(students) {
    var activities = window.UiePlannerData.accessMatrixActivities;
    if (!activities || !students || !students.length || activities.length < 3) return '';

    var W = 320, H = 315, CX = 160, CY = 122, MAX_R = 94;
    var n = activities.length;
    var maxStudents = Math.min(students.length, 4);

    var scale = 3;
    var canvas = document.createElement('canvas');
    canvas.width = W * scale;
    canvas.height = H * scale;
    var ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    var angles = [];
    for (var i = 0; i < n; i++) { angles.push(-Math.PI / 2 + (2 * Math.PI * i) / n); }

    function getPoint(ri, ai) {
        return { x: CX + ri * Math.cos(angles[ai]), y: CY + ri * Math.sin(angles[ai]) };
    }

    // Rings
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    for (var ri = 1; ri <= 3; ri++) {
        var r = (ri / 3) * MAX_R;
        ctx.beginPath();
        for (var j = 0; j < n; j++) {
            var p = getPoint(r, j);
            j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    // Spokes
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 0.5;
    for (var j = 0; j < n; j++) {
        var p = getPoint(MAX_R, j);
        ctx.beginPath();
        ctx.moveTo(CX, CY); ctx.lineTo(p.x, p.y);
        ctx.stroke();
    }

    // Activity labels
    ctx.font = 'bold 9px Arial';
    ctx.fillStyle = '#374151';
    for (var j = 0; j < n; j++) {
        var act = activities[j];
        var label = shortActivityLabels[act.id] || act.label;
        var a = angles[j];
        var lx = CX + (MAX_R + 8) * Math.cos(a);
        var ly = CY + (MAX_R + 8) * Math.sin(a);
        ctx.textAlign = Math.abs(Math.cos(a)) < 0.1 ? 'center' : Math.cos(a) > 0 ? 'left' : 'right';
        ctx.textBaseline = Math.abs(Math.sin(a)) < 0.1 ? 'middle' : Math.sin(a) > 0 ? 'top' : 'bottom';
        ctx.fillText(label, lx, ly);
    }

    // Data for each student (max 4)
    for (var si = 0; si < maxStudents; si++) {
        var student = students[si];
        var color = CIF_RADAR_COLORS[si % CIF_RADAR_COLORS.length];
        var studentIndex = student.cardIndex || student.index || (si + 1);
        var matrixScores = getStudentMatrixScores(studentIndex);
        var hasMatrix = Object.values(matrixScores).some(function(v) { return Number(v || 0) > 0; });

        var data;
        if (hasMatrix) {
            data = activities.map(function(act) {
                var score = Number(matrixScores[act.id] || 0);
                return score > 0 ? 4 - score : 0;
            });
        } else {
            var condKeys = student.conditions.map(function(c) { return c.key; });
            data = activities.map(function(act) {
                var maxSev = 0;
                condKeys.forEach(function(ck) {
                    var profile = barrierProfiles[ck];
                    if (!profile) return;
                    act.dims.forEach(function(dim) { maxSev = Math.max(maxSev, profile[dim] || 0); });
                });
                return maxSev;
            });
        }

        var pts = [];
        for (var j = 0; j < n; j++) {
            var val = Math.min(3, Math.max(0, Number(data[j] || 0)));
            pts.push(getPoint((val / 3) * MAX_R, j));
        }

        // Fill
        ctx.globalAlpha = maxStudents === 1 ? 0.12 : 0.08;
        ctx.beginPath();
        pts.forEach(function(p, j) { j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
        ctx.closePath();
        ctx.fillStyle = color.border;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Stroke
        ctx.beginPath();
        pts.forEach(function(p, j) { j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
        ctx.closePath();
        ctx.strokeStyle = color.border;
        ctx.lineWidth = maxStudents === 1 ? 2.5 : 2;
        ctx.stroke();

        // Points
        pts.forEach(function(p) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = color.border;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }

    // Bottom legend
    var ly = 258;
    ctx.font = '10px Arial';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    var spacing = W / (maxStudents + 1);
    for (var si = 0; si < maxStudents; si++) {
        var student = students[si];
        var color = CIF_RADAR_COLORS[si % CIF_RADAR_COLORS.length];
        var cx = spacing * (si + 1);
        ctx.fillStyle = color.border;
        ctx.fillRect(cx - 50, ly + 1, 8, 8);
        ctx.fillStyle = '#111827';
        ctx.textAlign = 'left';
        ctx.fillText(formatStudentLabel(student), cx - 38, ly);
    }

    // Severity level legend
    var ly2 = ly + 22;
    ctx.font = '9px Arial';
    ctx.textBaseline = 'top';
    var levelColors = ['#9aa0a6', '#34a853', '#fbbc04', '#ea4335'];
    var levelTexts = ['0 Sin ajuste', '1 Menor', '2 Moderado', '3 Prioritario'];
    var prefix = 'Niveles: ';
    var fullStr = prefix;
    for (var li = 0; li < levelTexts.length; li++) {
        fullStr += levelTexts[li];
        if (li < levelTexts.length - 1) fullStr += ' · ';
    }
    var totalW = ctx.measureText(fullStr).width;
    var cx = W / 2 - totalW / 2;
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'left';
    ctx.fillText(prefix, cx, ly2);
    cx += ctx.measureText(prefix).width;
    for (var li = 0; li < levelTexts.length; li++) {
        ctx.fillStyle = levelColors[li];
        ctx.fillRect(cx, ly2 + 2, 7, 7);
        cx += 9;
        ctx.fillStyle = '#6b7280';
        ctx.fillText(levelTexts[li], cx, ly2);
        cx += ctx.measureText(levelTexts[li]).width;
        if (li < levelTexts.length - 1) {
            ctx.fillText(' ' + String.fromCharCode(183) + ' ', cx, ly2);
            cx += ctx.measureText(' ' + String.fromCharCode(183) + ' ').width;
        }
    }

    return { dataUrl: canvas.toDataURL('image/png'), width: W };
}

function renderPdfCIFChart(students) {
    if (!students || !students.length) return [];
    var hasAnyMatrix = students.some(function(s) {
        var scores = getStudentMatrixScores(s.cardIndex || s.index || 1);
        return Object.values(scores).some(function(v) { return Number(v || 0) > 0; });
    });
    if (!hasAnyMatrix) return [];

    var radarResult = renderPdfCIFRadarChartCanvas(students);
    if (!radarResult) return [];
    var radarDataUrl = radarResult.dataUrl;
    var cw = radarResult.width;
    var pdfWidth = Math.min(cw, 285);

    return [
        { text: 'Mapa de énfasis de apoyo', style: 'subSectionTitle' },
        { image: radarDataUrl, width: pdfWidth, alignment: 'center', margin: [0, 2, 0, 4] },
        { text: '' }
    ];
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
    var conditionNames = [];
    var matrixCount = 0;

    students.forEach(function(student) {
        if (student.conditions && student.conditions.length) {
            student.conditions.forEach(function(condition) {
                if (conditionNames.indexOf(condition.name) === -1) conditionNames.push(condition.name);
            });
        }
        var scores = student.matrixScores || getStudentMatrixScores(student.cardIndex || student.index || 1);
        if (scores && Object.values(scores).some(function(value) { return Number(value || 0) > 0; })) {
            matrixCount++;
        }
    });

    content.push({ text: modeTitle, style: 'mainTitle' });
    content.push({ text: 'Documento orientativo para acordar una base DUA de clase y adecuaciones curriculares de acceso.', style: 'introText' });

    content.push({ text: '1. Base DUA para la clase', style: 'sectionTitle' });
    content.push({ text: 'Antes de aplicar adecuaciones individuales, asegura una base común de accesibilidad pedagógica para todo el curso. Estas acciones reducen barreras sin modificar los resultados de aprendizaje.', style: 'bodyText', italics: true, color: '#4b5563' });
    [
        'Entregar la programación completa desde el inicio: fechas, evaluaciones, condiciones y cambios relevantes.',
        'Publicar instrucciones, criterios de logro y ejemplos en formato visible, oral y escrito.',
        'Modelar tareas complejas antes del trabajo autónomo y dividirlas en pasos verificables.',
        'Organizar participación y trabajo grupal con roles claros, turnos y apoyos entre pares.',
        'Ofrecer canales claros para pedir ayuda y comunicar apoyos institucionales disponibles.',
        'Verificar comprensión sin exponer públicamente al estudiante.'
    ].forEach(function(item) {
        content.push({ text: '• ' + item, style: 'bodyText', margin: [10, 1, 0, 1] });
    });

    content.push({ text: '2. Buenas prácticas para adecuaciones individuales', style: 'sectionTitle' });
    goodPracticesData.slice(0, 4).forEach(function(item) {
        content.push({ text: [{ text: '• ' + item.title + ': ', bold: true }, item.text], style: 'bodyText', margin: [10, 1, 0, 1] });
    });
    content.push({ text: '3. Resumen para la gestión docente', style: 'sectionTitle' });
    content.push({
        table: {
            widths: ['25%', '45%', '30%'],
            body: [
                [
                    { text: 'Estudiantes', style: 'tableHeader' },
                    { text: 'Condiciones registradas', style: 'tableHeader' },
                    { text: 'Fuente de priorización', style: 'tableHeader' }
                ],
                [
                    { text: String(students.length), style: 'bodyText' },
                    { text: conditionNames.length ? conditionNames.join(', ') : 'Sin registro', style: 'bodyText' },
                    { text: matrixCount ? matrixCount + ' con matriz CIF aplicada' : 'Orientación por condición', style: 'bodyText' }
                ]
            ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 4, 0, 8]
    });
    content.push({ text: 'La ficha organiza apoyos por estudiante y por categoría Duoc para facilitar decisiones de clase, evaluación y seguimiento.', style: 'bodyText', italics: true, color: '#4b5563', margin: [0, 2, 0, 8] });

    if (includeCharts) {
        var allChartContent = renderPdfCIFChart(students);
        allChartContent.forEach(function(item) { content.push(item); });
    }

    content.push({ text: 'Las adecuaciones curriculares de acceso son ajustes que eliminan barreras sin modificar los objetivos de aprendizaje. A continuación el detalle por estudiante.', style: 'bodyText', italics: true, margin: [0, 6, 0, 8] });

    if (!includeCharts) {
        var legColors = ['#ea4335', '#fbbc04', '#34a853', '#9aa0a6'];
        var legLabels = ['Barrera significativa — intervenir', 'Barrera moderada — ajustar', 'Barrera leve — observar', 'Sin barrera detectada'];
        var legCols = [];
        for (var i = 0; i < 4; i++) {
            legCols.push({ width: 'auto', canvas: [{ type: 'rect', x: 0, y: 0, w: 8, h: 8, r: 2, color: legColors[i] }], margin: [0, 2, 3, 0] });
            legCols.push({ width: 'auto', text: legLabels[i], fontSize: 8, color: '#6b7280', margin: [0, 0, 12, 0] });
        }
        content.push({ columns: legCols, margin: [0, 0, 0, 6] });
    }

    students.forEach(function(student, sIdx) {
        var nameLabel = student.name || ('Estudiante ' + student.index);
        content.push({ text: nameLabel, style: 'sectionTitle' });

        if (student.conditions && student.conditions.length) {
            content.push({ text: 'Condición registrada en ficha: ' + student.conditions.map(function(c) { return c.name; }).join(', '), style: 'bodyText', color: '#4b5563', italics: true, margin: [10, 0, 0, 4] });
        }

        if (student.mode === 'social') {

            content.push({ text: 'Recomendaciones por dimensión del mapa', style: 'subSectionTitle' });
            content.push({ text: 'Cada recomendación se filtra por la condición registrada en la ficha y se agrupa en las mismas dimensiones del mapa de barreras.', style: 'bodyText', color: '#4b5563', italics: true, margin: [10, 0, 0, 4] });

            var barrierRecs = getBarrierBasedRecommendations(student.matrixScores || {}, student.conditionKeys || []);
            if (barrierRecs.length) {
                barrierRecs.forEach(function(group) {
                    content.push({ text: group.label, style: 'bodyText', bold: true, margin: [0, 8, 0, 2] });
                    content.push({ text: 'Barreras en: ' + group.activities.join(', '), style: 'bodyText', color: '#6b7280', italics: true, fontSize: 9, margin: [10, 0, 0, 2] });
                    group.items.forEach(function(item) {
                        content.push({ text: item.activity + ' (' + item.score + ' - ' + item.severity + ')', style: 'bodyText', bold: true, margin: [10, 5, 0, 1] });
                        item.recommendations.forEach(function(rec) {
                            content.push({ text: '• ' + rec, style: 'bodyText', margin: [18, 1, 0, 1] });
                        });
                        item.observations.forEach(function(obs) {
                            content.push({ text: '• ' + obs, style: 'bodyText', color: '#6b7280', italics: true, margin: [18, 1, 0, 1] });
                        });
                        if (item.clarification) {
                            content.push({ text: item.clarification, style: 'bodyText', color: '#6b7280', italics: true, margin: [18, 1, 0, 1] });
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
                content.push({ text: 'Perfil ajustado por matriz de acceso CIF/OMS.', style: 'bodyText', color: '#4b5563', italics: true, margin: [10, 0, 0, 4] });
            }

            content.push({ text: 'Recomendaciones', style: 'subSectionTitle' });
            content.push({ text: 'Revisa cada categoría y acuerda con el estudiante cuáles apoyos implementar. No es necesario aplicar todas: selecciona las que mejor respondan a las barreras identificadas.', style: 'bodyText', color: '#4b5563', italics: true, margin: [10, 0, 0, 4] });

            if (matrixProfile) {
                var groupedMatrixItems = groupMatrixItemsByDimension(getVisibleMatrixItems(student, { includeManual: true }));
                if (groupedMatrixItems.length) {
                    groupedMatrixItems.forEach(function(group) {
                        content.push({ text: group.label, style: 'bodyText', bold: true, margin: [0, 6, 0, 2] });
                        var priorityBuckets = { 3: [], 2: [], 1: [], 0: [], manual: [], clarification: [], observation: [] };
                        group.items.forEach(function(item) {
                            var bucket = item.kind === 'manual' ? 'manual' : item.kind === 'clarification' ? 'clarification' : item.kind === 'observation' ? 'observation' : (item.priorityLevel >= 3 ? 3 : item.priorityLevel === 2 ? 2 : item.priorityLevel === 1 ? 1 : 0);
                            if (priorityBuckets[bucket] !== undefined) priorityBuckets[bucket].push(item);
                        });
                        var priorityHeaders = { 3: 'Barrera significativa — intervenir', 2: 'Barrera moderada — ajustar', 1: 'Barrera leve — observar', 0: 'Sin barrera detectada' };
                        var priorityColors = { 3: '#ea4335', 2: '#fbbc04', 1: '#34a853', 0: '#9aa0a6' };
                        [3, 2, 1, 0].forEach(function(level) {
                            var bucket = priorityBuckets[level];
                            if (!bucket || !bucket.length) return;
                            content.push({
                                columns: [
                                    { width: 'auto', text: priorityHeaders[level], style: 'bodyText', bold: true, italics: true, color: '#4b5563', margin: [0, 0, 4, 0] },
                                    { width: 'auto', canvas: [{ type: 'rect', x: 0, y: 0, w: 9, h: 9, r: 2, color: priorityColors[level] }], margin: [0, 3, 0, 0] }
                                ],
                                margin: [8, 2, 0, 1]
                            });
                            bucket.forEach(function(item) {
                                content.push({ text: '• ' + item.text, style: 'bodyText', margin: [16, 1, 0, 1] });
                                content.push({ text: 'Actividad CIF: ' + item.activities.join(', '), style: 'bodyText', color: '#6b7280', italics: true, fontSize: 9, margin: [22, 0, 0, 1] });
                                var evidence = formatClarificationEvidence(student.cardIndex || student.index, item);
                                if (evidence) {
                                    content.push({ text: 'Evidencia: ' + evidence, style: 'bodyText', color: '#6b7280', italics: true, fontSize: 9, margin: [22, 0, 0, 1] });
                                }
                            });
                        });
                        if (priorityBuckets.clarification.length) {
                            content.push({ text: 'Precisar barrera', style: 'bodyText', bold: true, italics: true, color: '#4b5563', margin: [8, 2, 0, 1] });
                            priorityBuckets.clarification.forEach(function(item) {
                                content.push({ text: '• ' + item.text, style: 'bodyText', margin: [16, 1, 0, 1] });
                            });
                        }
                        if (priorityBuckets.manual.length) {
                            content.push({ text: 'Agregadas manualmente', style: 'bodyText', bold: true, italics: true, color: '#4b5563', margin: [8, 2, 0, 1] });
                            priorityBuckets.manual.forEach(function(item) {
                                content.push({ text: '• ' + item.text, style: 'bodyText', margin: [16, 1, 0, 1] });
                            });
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
                content.push({ text: catNames[cat], style: 'bodyText', bold: true, margin: [0, 6, 0, 2] });

                (items || []).forEach(function(item) {
                    if (isRecommendationHidden(cat, item.text)) return;
                    content.push({ text: '• ' + item.text, style: 'bodyText', margin: [10, 1, 0, 1] });
                });
                manualItems.forEach(function(item) {
                    content.push({ text: '• [Agregada manualmente] ' + item.text, style: 'bodyText', margin: [10, 1, 0, 1] });
                });
            });
            }
        }

        if (student.advisorComments && student.advisorComments.trim()) {
            content.push({ text: 'Recomendación adicional del asesor', style: 'subSectionTitle' });
            content.push({ text: student.advisorComments.trim(), style: 'bodyText', margin: [10, 2, 0, 6] });
        }

        content.push({ text: '' });
    });

    content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#d1d5db' }] });
    content.push({ text: '' });
    content.push({ text: 'Documento generado desde el Planificador Inclusivo UIE. Orientaciones alineadas con documentación institucional y fuentes disponibles en Apoyos adicionales / Referencias.', style: 'footerText' });

    return {
        content: content,
        styles: {
            headerOrg: { fontSize: 12, bold: true, color: '#b42318' },
            headerMeta: { fontSize: 8.5, color: '#6b7280' },
            mainTitle: { fontSize: 18, bold: true, color: '#111827', margin: [0, 0, 0, 7] },
            sectionTitle: { fontSize: 13, bold: true, color: '#111827', margin: [0, 9, 0, 5] },
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

function imageToBase64(url, callback) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        var canvas = document.createElement('canvas');
        var maxW = 400;
        var scale = Math.min(1, maxW / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
            callback(canvas.toDataURL('image/png'));
        } catch (e) {
            callback(null);
        }
    };
    img.onerror = function() {
        var altUrl = url.indexOf(' ') !== -1 ? url.replace(/ /g, '%20') : url.replace(/%20/g, ' ');
        if (altUrl !== url) {
            imageToBase64(altUrl, callback);
        } else {
            callback(null);
        }
    };
    img.src = url;
}

function showToast(msg) {
    var existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.className = 'toast-notification';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.classList.add('toast-show'); }, 10);
    setTimeout(function() {
        t.classList.remove('toast-show');
        setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 400);
    }, 3500);
}

function buildPdfHeader() {
    var logoBase64 = window.LOGO_UIE_BASE64 || '';
    var columns = [];
    if (logoBase64) {
        columns.push({ image: logoBase64, width: 110, margin: [0, 0, 14, 0] });
    }
    columns.push({
        stack: [
            { text: 'Unidad de Inclusión Educativa', style: 'headerOrg' },
            { text: 'Equipo de Inclusión Académica · Duoc UC Campus Arauco', style: 'headerMeta' },
            { text: formatReportDate(), style: 'headerMeta' }
        ],
        alignment: 'right'
    });
    return [
        { columns: columns, columnGap: 8 },
        { canvas: [{ type: 'line', x1: 0, y1: 8, x2: 515, y2: 8, lineWidth: 2, lineColor: '#b42318' }] },
        { text: '' }
    ];
}

function downloadDuaChecklist() {
    if (!window.UiePlannerDua) {
        alert('Error: El módulo DUA no está cargado.');
        return;
    }
    var checkedDua = window.UiePlannerDua.getCheckedDuaItems() || [];
    if (!checkedDua.length) {
        alert('Selecciona al menos un elemento DUA antes de descargar.');
        return;
    }
    var content = buildPdfHeader();
    
    content.push({ text: 'Checklist DUA para la clase', style: 'mainTitle' });
    content.push({ text: '' });

    var checkedTexts = {};
    checkedDua.forEach(function(item) { checkedTexts[item.text] = true; });
    var stages = window.UiePlannerData.duaStagesData || [];
    stages.forEach(function(stage) {
        content.push({ text: stage.label + ' — ' + stage.badge, style: 'subSectionTitle' });
        stage.checklist.forEach(function(item) {
            content.push(checkboxItem(item, !!checkedTexts[item]));
        });
        content.push({ text: '' });
    });

    content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#d1d5db' }] });
    content.push({ text: '' });
    content.push({ text: 'Documento generado desde el Planificador Inclusivo UIE. Orientaciones alineadas con documentación institucional y fuentes disponibles en Apoyos adicionales / Referencias.', style: 'footerText' });

    var docDef = {
        content: content,
        styles: {
            headerOrg: { fontSize: 13, bold: true, color: '#b42318' },
            headerMeta: { fontSize: 8.5, color: '#6b7280' },
            mainTitle: { fontSize: 20, bold: true, color: '#111827', margin: [0, 0, 0, 8] },
            subSectionTitle: { fontSize: 11, bold: true, color: '#b42318', margin: [0, 10, 0, 4] },
            bodyText: { fontSize: 10.5, color: '#111827', margin: [0, 3, 0, 3] },
            footerText: { fontSize: 8.5, color: '#9ca3af', margin: [0, 6, 0, 0], italics: true }
        },
        defaultStyle: { fontSize: 10.5, color: '#111827' },
        pageMargins: [40, 40, 40, 40]
    };

    if (!window.pdfMake || typeof window.pdfMake.createPdf !== 'function') {
        alert('Librería PDF no disponible. Recarga la página.');
        return;
    }
    try {
        window.pdfMake.createPdf(docDef).download('checklist-dua.pdf');
    } catch(e) {
        console.error('Error generando PDF DUA:', e);
        alert('Error al generar el PDF: ' + e.message);
    }
}

function checkboxItem(text, checked) {
    var s = 9;
    var canvas = [
        { type: 'rect', x: 0, y: 0, w: s, h: s, r: 1.5, lineWidth: 1, lineColor: '#6b7280' }
    ];
    if (checked) {
        canvas.push(
            { type: 'line', x1: 2, y1: 5, x2: 4, y2: 7.5, lineWidth: 2.5, lineColor: '#16a34a' },
            { type: 'line', x1: 4, y1: 7.5, x2: 8, y2: 2, lineWidth: 2.5, lineColor: '#16a34a' }
        );
    }
    return { columns: [{ canvas: canvas, width: s + 4, margin: [0, 1.5, 0, 0] }, { text: text, fontSize: 9, width: '*' }], margin: [0, 2, 0, 2] };
}

function generatePlanEmail() {
    var students = collectPlanStudents();
    if (!students.length) {
        var msg = 'Selecciona al menos una condición de referencia para algún estudiante.';
        alert(msg);
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
    renderPdfCIFRadarChartCanvas,
    barrierProfiles,
    openPlanModal,
    closePlanModal,
    generatePlanPDF,
    generatePlanEmail,
    downloadDuaChecklist
};

})();
