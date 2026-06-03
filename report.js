(function () {
var goodPracticesData = window.UiePlannerData.goodPracticesData;
var getCheckedDuaItems = window.UiePlannerDua.getCheckedDuaItems;
var getDuaStageSummary = window.UiePlannerDua.getDuaStageSummary;
var formatStudentLabel = window.UiePlannerSupports.formatStudentLabel;
var getSelectedSupportStudentGroups = window.UiePlannerSupports.getSelectedSupportStudentGroups;
var groupStudentsByCondition = window.UiePlannerSupports.groupStudentsByCondition;
var groupStudentsByProfile = window.UiePlannerSupports.groupStudentsByProfile;
var getMergedRecommendations = window.UiePlannerSupports.getMergedRecommendations;
var categoryLabels = window.UiePlannerSupports.categoryLabels;
var shortConditionNames = window.UiePlannerSupports.shortConditionNames;
var recommendationCategories = window.UiePlannerSupports.recommendationCategories;
var getStudentMatrixProfile = window.UiePlannerSupports.getStudentMatrixProfile;
var getStudentMatrixScores = window.UiePlannerSupports.getStudentMatrixScores;
var getReferenceScores = window.UiePlannerSupports.getReferenceScores;
var scoreToRequirement = window.UiePlannerSupports.scoreToRequirement;
var renderCIFBarChart = window.UiePlannerSupports.renderCIFBarChart;
var barrierProfiles = window.UiePlannerSupports.barrierProfiles;
var shortActivityLabels = window.UiePlannerData.shortActivityLabels;
var prioridadLabels = window.UiePlannerData.prioridadLabels;
var accessMatrixActivities = window.UiePlannerData.accessMatrixActivities;

function getActivityTagString(activities) {
    if (!activities || !activities.length) return '';
    var labels = activities.map(function(a) { return shortActivityLabels[a] || a; });
    return ' (' + labels.join(', ') + ')';
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

function getSemaforoText(level) {
    if (!level || !prioridadLabels[level]) return '';
    var p = prioridadLabels[level];
    return ' [' + p.icon + ' ' + p.label + ']';
}

function groupHasMatrixProfile(group) {
    return group.students.some(function(s) { return !!getStudentMatrixProfile(s.cardIndex); });
}

function getFirstStudentScores(group) {
    if (!group || !group.students || !group.students.length) return null;
    return getStudentMatrixScores(group.students[0].cardIndex);
}

var REPORT_TITLE = 'Plan de apoyo docente para la clase';
var reportSource = 'dua';

function initReports() {
    var emptyDuaButton = document.getElementById('btn-empty-dua');
    var emptySupportsButton = document.getElementById('btn-empty-supports');
    var emptyCloseButton = document.getElementById('btn-empty-close');
    var cartActions = document.getElementById('cart-actions');

    if (emptyDuaButton) emptyDuaButton.addEventListener('click', function() { goToReportSource('planificar'); });
    if (emptySupportsButton) emptySupportsButton.addEventListener('click', function() { goToReportSource('apoyos'); });
    if (emptyCloseButton) emptyCloseButton.addEventListener('click', closeReportDialog);

    if (cartActions) {
        cartActions.addEventListener('click', function(e) {
            var btn = e.target.closest('.btn');
            if (!btn || btn.disabled) return;
            var action = btn.dataset.action;
            if (!action) return;
            handleCartAction(action, btn);
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeReportDialog();
    });

    document.querySelectorAll('.btn-open-report').forEach(function(button) {
        button.addEventListener('click', function() {
            reportSource = button.dataset.source || 'dua';
            renderPlanSummary();
            var dialog = document.getElementById('report-dialog');
            if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
        });
    });
}

function handleCartAction(action, btn) {
    var originalText = btn.textContent;
    switch (action) {
        case 'download-dua':
            btn.disabled = true;
            btn.textContent = 'Generando PDF...';
            ensurePdfMake(function() {
                generateDuaPdf(function() {
                    btn.disabled = false;
                    btn.textContent = originalText;
                });
            }, function() {
                btn.disabled = false;
                btn.textContent = originalText;
            });
            break;
        case 'download-acc':
            btn.disabled = true;
            btn.textContent = 'Generando PDF...';
            ensurePdfMake(function() {
                generateAccPdf(function() {
                    btn.disabled = false;
                    btn.textContent = originalText;
                });
            }, function() {
                btn.disabled = false;
                btn.textContent = originalText;
            });
            break;
        case 'download-full':
            btn.disabled = true;
            btn.textContent = 'Generando PDF...';
            ensurePdfMake(function() {
                generatePdfMake(function() {
                    btn.disabled = false;
                    btn.textContent = originalText;
                });
            }, function() {
                btn.disabled = false;
                btn.textContent = originalText;
            });
            break;
        case 'email':
            openRecommendationEmail();
            break;
    }
}

function renderPlanSummary() {
    var container = document.getElementById('cart-items');
    var actionsContainer = document.getElementById('cart-actions');
    if (!container) return;

    var checkedDua = getCheckedDuaItems();
    var students = getSelectedSupportStudentGroups();
    var profiles = groupStudentsByProfile(students);
    var duaSummary = getDuaStageSummary();
    var hasDua = checkedDua.length > 0;
    var hasSupports = students.length > 0;
    var both = hasDua && hasSupports;
    var conditionCount = profiles.reduce(function(count, p) { return count + p.conditions.length; }, 0);

    if (!hasDua && !hasSupports) {
        setReportEmptyMode(true);
        container.innerHTML = '<div class="report-empty-state" role="status"><strong>Aún no hay información para generar el plan.</strong><p>Selecciona decisiones DUA, registra estudiantes con apoyos acordados, o ambos. Con esos datos se podrá descargar un PDF o abrir un correo con mensaje base editable.</p></div>';
        if (actionsContainer) actionsContainer.innerHTML = '';
        clearPrintableRecommendations();
        return;
    }

    setReportEmptyMode(false);

    var items = '';
    if (hasDua) {
        items += '<article class="cart-item"><strong>Base DUA para la clase</strong><span>' + checkedDua.length + ' decisión(es) seleccionada(s)</span><p>' + duaSummary.level.label + '. ' + duaSummary.level.text + '</p></article>';
    }
    if (hasSupports) {
        items += '<article class="cart-item"><strong>Adecuaciones acordadas</strong><span>' + students.length + ' estudiante(s), ' + conditionCount + ' condición(es)</span><p>' + profiles.map(function(p) { return p.conditions.map(function(c) { return c.name; }).join(' · '); }).join('; ') + '</p></article>';
    }
    if (!hasDua && hasSupports) {
        items += '<article class="cart-item cart-item-warning"><strong>Base DUA sin seleccionar</strong><span>Se recomienda completar</span><p>Se sugiere revisar la base DUA antes de compartir el plan.</p><a class="btn btn-primary" href="#planificar" onclick="document.getElementById(\'report-dialog\').close();" style="margin-top:8px;">Ir a Planificar DUA</a></article>';
    }
    if (hasDua && !hasSupports) {
        items += '<article class="cart-item cart-item-warning"><strong>Adecuaciones sin registrar</strong><span>Opcional</span><p>Puedes agregar adecuaciones curriculares de acceso si hay estudiantes que requieren apoyos específicos.</p><a class="btn btn-primary" href="#apoyos" onclick="document.getElementById(\'report-dialog\').close();" style="margin-top:8px;">Ir a Adecuaciones</a></article>';
    }
    container.innerHTML = items;

    if (actionsContainer) {
        var buttons = '';
        if (both) {
            buttons += '<button class="btn btn-primary" data-action="download-full" type="button">Descargar plan completo</button>';
            if (reportSource === 'dua') {
                buttons += '<button class="btn btn-secondary" data-action="download-dua" type="button">Descargar solo base DUA</button>';
            } else {
                buttons += '<button class="btn btn-secondary" data-action="download-acc" type="button">Descargar solo adecuaciones</button>';
            }
        } else if (hasDua) {
            buttons += '<button class="btn btn-primary" data-action="download-dua" type="button">Descargar base DUA</button>';
        } else if (hasSupports) {
            buttons += '<button class="btn btn-primary" data-action="download-acc" type="button">Descargar adecuaciones</button>';
        }
        buttons += '<button class="btn btn-secondary" data-action="email" type="button">Abrir correo</button>';
        actionsContainer.innerHTML = buttons;
    }

    updatePrintableRecommendations();
}

function openRecommendationEmail() {
    var checkedDua = getCheckedDuaItems();
    var students = getSelectedSupportStudentGroups();
    var profiles = groupStudentsByProfile(students);
    var body = buildEmailBody(checkedDua, students, profiles);
    var mailto = 'mailto:?subject=' + encodeURIComponent(REPORT_TITLE) + '&body=' + encodeURIComponent(body);
    window.location.href = mailto;
}

function buildEmailBody(checkedDua, students, profiles) {
    var lines = [
        'Hola,',
        '',
        'Comparto el plan de apoyo docente acordado para la clase.',
        '',
        'El plan considera:',
        '- Base DUA: ' + (checkedDua.length ? checkedDua.length + ' decisión(es) seleccionada(s)' : 'sin decisiones DUA seleccionadas') + '.',
        '- Adecuaciones curriculares de acceso: ' + (students.length ? students.length + ' estudiante(s) con apoyos acordados' : 'sin estudiantes registrados') + '.'
    ];
    if (profiles.length) {
        lines.push('- Perfiles considerados: ' + profiles.map(function(p) { return p.conditions.map(function(c) { return c.name; }).join(' · '); }).join('; ') + '.');
    }
    lines.push('', 'Adjunto el PDF con el detalle de las recomendaciones para su revisión y seguimiento.', '', 'Quedo atento/a a comentarios o ajustes.');
    return lines.join('\n');
}

function setReportEmptyMode(isEmpty) {
    var actions = document.getElementById('cart-actions');
    var emptyActions = document.getElementById('report-empty-actions');
    if (actions) actions.classList.toggle('hidden', isEmpty);
    if (emptyActions) emptyActions.classList.toggle('hidden', !isEmpty);
}

function closeReportDialog() {
    var dialog = document.getElementById('report-dialog');
    if (dialog && dialog.open) dialog.close();
}

function goToReportSource(sectionId) {
    closeReportDialog();
    if (window.location.hash === '#' + sectionId) {
        var el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }
    window.location.hash = sectionId;
}

function clearPrintableRecommendations() {
    var sheet = document.getElementById('recommendations-print');
    if (sheet) sheet.innerHTML = '';
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function(character) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
}

function formatReportDate() {
    return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());
}

function getReportData() {
    var checkedDua = getCheckedDuaItems();
    var students = getSelectedSupportStudentGroups();
    var profiles = groupStudentsByProfile(students);
    var duaSummary = getDuaStageSummary();
    return { checkedDua: checkedDua, students: students, profiles: profiles, duaSummary: duaSummary };
}

function renderProfileSection(grouped, index, firstSupportNumber) {
    var conditionKeys = grouped.conditions.map(function(c) { return c.key; });
    var conditionNames = grouped.conditions.map(function(c) { return c.name; });
    var studentNames = grouped.students.map(function(s) { return escapeHtml(formatStudentLabel(s)); }).join(', ');
    var hasMultiple = conditionKeys.length > 1;
    var merged = getMergedRecommendations(conditionKeys);
    var sources = [];
    grouped.conditions.forEach(function(c) {
        if (sources.indexOf(c.source) === -1) sources.push(c.source);
    });
    var hasMatrixProfile = groupHasMatrixProfile(grouped);
    var hasReferenceProfile = !hasMatrixProfile && conditionKeys.length > 0 && conditionKeys.some(function(k) { return barrierProfiles[k]; });
    var refScores = hasReferenceProfile ? getReferenceScores(conditionKeys) : null;

    var categoriesHtml = ['context', 'materials', 'methods', 'interaction', 'evaluacion', 'tech'].map(function(cat) {
        var items = merged[cat];
        if (!items || !items.length) return '';
        var html = '<h3>' + categoryLabels[cat] + '</h3>';

        if (hasMatrixProfile || refScores) {
            var scores = hasMatrixProfile ? getFirstStudentScores(grouped) : refScores;
            var buckets = { 1: [], 2: [], 3: [] };
            items.forEach(function(item) {
                if (!item.activities || !item.activities.length) { buckets[1].push(item); return; }
                var level = getSemaforo(item.activities, scores) || 1;
                buckets[level].push(item);
            });
            var priorityHeaders = { 1: 'Barrera significativa — intervenir', 2: 'Barrera moderada — ajustar', 3: 'Barrera leve — observar' };
            [1, 2, 3].forEach(function(level) {
                var bucket = buckets[level];
                if (!bucket || !bucket.length) return;
                html += '<p class="print-priority-header">' + priorityHeaders[level] + '</p><ul>';
                html += bucket.map(function(item) {
                    var tag = '';
                    if (!item.isMerged && hasMultiple && item.shortNames.length > 0) {
                        tag = ' (' + item.shortNames.join(', ') + ')';
                    }
                    var activityTags = getActivityTagString(item.activities);
                    return '<li>' + item.text + tag + '<span class="print-activity-tags">' + activityTags + '</span></li>';
                }).join('');
                html += '</ul>';
            });
        } else {
            html += '<ul>' + items.map(function(item) {
                var tag = '';
                if (!item.isMerged && hasMultiple && item.shortNames.length > 0) {
                    tag = ' (' + item.shortNames.join(', ') + ')';
                }
                var activityTags = getActivityTagString(item.activities);
                return '<li>' + item.text + tag + '<span class="print-activity-tags">' + activityTags + '</span></li>';
            }).join('') + '</ul>';
        }
        return html;
    }).join('');

    return '<section class="print-report-section"><h2>' + (index + firstSupportNumber) + '. ' + studentNames + '</h2><p><strong>Condición:</strong> ' + conditionNames.join(' · ') + ' <span class="print-source">Fuente: ' + sources.join(', ') + '</span></p>' + categoriesHtml + '</section>';
}

function renderProfilePdfSection(grouped, index, firstSupportNumber) {
    var conditionKeys = grouped.conditions.map(function(c) { return c.key; });
    var conditionNames = grouped.conditions.map(function(c) { return c.name; });
    var studentNames = grouped.students.map(function(s) { return formatStudentLabel(s); }).join(', ');
    var hasMultiple = conditionKeys.length > 1;
    var merged = getMergedRecommendations(conditionKeys);
    var sources = [];
    grouped.conditions.forEach(function(c) {
        if (sources.indexOf(c.source) === -1) sources.push(c.source);
    });
    var hasMatrixProfile = groupHasMatrixProfile(grouped);

    var content = [];
    content.push({ text: (index + firstSupportNumber) + '. ' + studentNames, style: 'sectionTitle' });
    content.push({ text: [{ text: 'Condición: ', bold: true }, conditionNames.join(' · ')], style: 'bodyText', color: '#4b5563', italics: true, margin: [10, 0, 0, 4] });
    content.push({ text: '' });

    var hasReferenceProfile = !hasMatrixProfile && conditionKeys.length > 0 && conditionKeys.some(function(k) { return barrierProfiles[k]; });
    var refScores = hasReferenceProfile ? getReferenceScores(conditionKeys) : null;

    ['context', 'materials', 'methods', 'interaction', 'evaluacion', 'tech'].forEach(function(cat) {
        var items = merged[cat];
        if (!items || !items.length) return;
        content.push({ text: categoryLabels[cat], style: 'subSectionTitle' });

        if (hasMatrixProfile || refScores) {
            var scores = hasMatrixProfile ? getFirstStudentScores(grouped) : refScores;
            var buckets = { 1: [], 2: [], 3: [], 0: [] };
            items.forEach(function(item) {
                if (!item.activities || !item.activities.length) { buckets[0].push(item); return; }
                var level = getSemaforo(item.activities, scores) || 0;
                buckets[level].push(item);
            });
            var priorityHeaders = { 1: 'Barrera significativa — intervenir', 2: 'Barrera moderada — ajustar', 3: 'Barrera leve — observar', 0: 'Sin barrera detectada' };
            var priorityColors = { 1: '#ea4335', 2: '#fbbc04', 3: '#34a853', 0: '#9aa0a6' };
            [1, 2, 3, 0].forEach(function(level) {
                var bucket = buckets[level];
                if (!bucket || !bucket.length) return;
                content.push({
                    columns: [
                        { width: 'auto', text: priorityHeaders[level], style: 'bodyText', bold: true, italics: true, fontSize: 9.5, color: '#6b7280', margin: [0, 0, 4, 0] },
                        { width: 'auto', canvas: [{ type: 'rect', x: 0, y: 0, w: 9, h: 9, r: 2, color: priorityColors[level] }], margin: [0, 3, 0, 0] }
                    ],
                    margin: [8, 4, 0, 2]
                });
                content.push({ ul: bucket.map(function(item) {
                    var text = item.text;
                    if (!item.isMerged && hasMultiple && item.shortNames.length > 0) {
                        text += ' (' + item.shortNames.join(', ') + ')';
                    }
                    text += getActivityTagString(item.activities);
                    return text;
                }) });
            });
        } else {
            content.push({ ul: items.map(function(item) {
                var text = item.text;
                if (!item.isMerged && hasMultiple && item.shortNames.length > 0) {
                    text += ' (' + item.shortNames.join(', ') + ')';
                }
                text += getActivityTagString(item.activities);
                return text;
            }) });
        }
        content.push({ text: '' });
    });

    content.push({ text: 'Fuente: ' + sources.join(', '), style: 'sourceText' });
    content.push({ text: '' });
    return content;
}

function pdfRequirementLabel(value) {
    var level = Math.max(0, Math.min(4, Math.round(value || 0)));
    return level >= 3 ? 'Barrera significativa — intervenir' : level === 2 ? 'Barrera moderada — ajustar' : level === 1 ? 'Barrera leve — observar' : 'Sin barrera detectada';
}

function renderCIFChartPdfSection(students) {
    var activities = accessMatrixActivities;
    if (!activities || !students || !students.length) return [];
    var hasAnyMatrix = students.some(function(s) {
        var scores = getStudentMatrixScores(s.cardIndex || s.index || 1);
        return Object.values(scores).some(function(v) { return Number(v || 0) > 0; });
    });
    if (!hasAnyMatrix) return [];
    var levelColors = { 0: '#9aa0a6', 1: '#34a853', 2: '#fbbc04', 3: '#ea4335', 4: '#ea4335' };

    var cols = [];
    students.slice(0, 4).forEach(function(student, index) {
        var studentIndex = student.cardIndex || student.index || (index + 1);
        var matrixScores = getStudentMatrixScores(studentIndex);
        var hasMatrix = Object.values(matrixScores).some(function(v) { return Number(v || 0) > 0; });
        var rows;
        if (hasMatrix) {
            rows = activities.map(function(act) {
                var score = Number(matrixScores[act.id] || 0);
                return { score: score, severity: scoreToRequirement(score) };
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
                return { score: 0, severity: maxSev };
            });
        }
        cols.push({ label: formatStudentLabel(student), rows: rows });
    });

    var colW = 100;
    var hPad = 4;

    var body = [];
    var headerRow = [{ text: 'Actividad CIF', fontSize: 8, bold: true, color: '#374151', fillColor: '#f3f4f6', alignment: 'right', margin: [0, 3, 6, 3] }];
    cols.forEach(function(col) {
        headerRow.push({ text: col.label, fontSize: 8, bold: true, color: '#374151', fillColor: '#f3f4f6', alignment: 'center', margin: [0, 3, 0, 3] });
    });
    body.push(headerRow);

    activities.forEach(function(act, ai) {
        var label = shortActivityLabels[act.id] || act.label;
        var row = [{ text: label, fontSize: 8, alignment: 'left', color: '#6b7280', margin: [6, 1, 6, 1] }];
        cols.forEach(function(col) {
            var rd = col.rows[ai];
            var level = rd.severity;
            var color = levelColors[level] || '#9aa0a6';
            var bw = level > 0 ? Math.min(Math.round((level / 3) * (colW - hPad * 2 - 4) * 1.5), colW - hPad * 2) : 0;
            row.push({
                stack: [
                    bw > 0 ? { canvas: [{ type: 'rect', x: 0, y: 0, w: bw, h: 10, r: 3, color: color }], margin: [0, 0, 0, 0] } : { text: '', fontSize: 1 }
                ],
                alignment: 'left',
                margin: [hPad, 1, hPad, 1]
            });
        });
        body.push(row);
    });

    var legendStack = [
        { text: 'Niveles:', fontSize: 7, color: '#6b7280', margin: [0, 0, 0, 3] }
    ];
    [0, 1, 2, 3].forEach(function(lvl) {
        var l = lvl === 0 ? 'Sin barrera detectada' : lvl === 1 ? 'Barrera leve \u2014 observar' : lvl === 2 ? 'Barrera moderada \u2014 ajustar' : 'Barrera significativa \u2014 intervenir';
        var c = levelColors[lvl];
        legendStack.push({
            columns: [
                { canvas: [{ type: 'rect', x: 0, y: 0, w: 8, h: 8, r: 2, color: c }], width: 10 },
                { text: l, fontSize: 7, color: '#6b7280', width: '*' }
            ],
            margin: [0, 0, 0, 2]
        });
    });

    return [
        { text: 'Apoyos por actividad CIF', style: 'subSectionTitle' },
        { text: 'Cada barra muestra el nivel de apoyo sugerido según la actividad CIF.', style: 'bodyText', fontSize: 8, color: '#6b7280', italics: true, margin: [0, 0, 0, 4] },
        {
            columns: [
                { width: '*', text: '' },
                { width: 'auto', table: { widths: [Math.round(90 * 1.2)].concat(cols.map(function() { return colW; })), body: body }, layout: 'lightHorizontalLines', fontSize: 8 },
                { width: 'auto', stack: legendStack, margin: [10, 0, 0, 0] },
                { width: '*', text: '' }
            ],
            margin: [0, 0, 0, 4]
        },
        { text: '' }
    ];
}

function updatePrintableRecommendations() {
    var sheet = document.getElementById('recommendations-print');
    if (!sheet) return;

    var data = getReportData();
    var checkedDua = data.checkedDua;
    var students = data.students;
    var profiles = data.profiles;
    var duaSummary = data.duaSummary;

    if (!checkedDua.length && !students.length) {
        clearPrintableRecommendations();
        return;
    }

    var goodPracticesNumber = checkedDua.length ? 2 : 1;
    var firstSupportNumber = goodPracticesNumber + 1;

    sheet.innerHTML = '<header class="print-report-header"><div class="print-brand"><img class="print-logo" src="' + LOGO_UIE_BASE64 + '" alt="Unidad de Inclusión Educativa"></div><div class="print-report-meta"><span>Plan de apoyo docente</span><span>Equipo de Inclusión Académica · Duoc UC Campus Arauco</span><span>' + formatReportDate() + '</span></div></header><h1>' + REPORT_TITLE + '</h1><p class="print-intro">Documento orientativo para acordar una base DUA de clase y, cuando corresponda, adecuaciones curriculares de acceso para estudiantes registrados.</p>' + (checkedDua.length ? '<section class="print-report-section"><h2>1. Base DUA para toda la clase</h2><p>Estas decisiones describen la base común de clase: apoyos pedagógicos generales para anticipar barreras, diversificar la participación y sostener el resultado de aprendizaje.</p>' + (function() { var ck = {}; checkedDua.forEach(function(i) { ck[i.text] = true; }); return window.UiePlannerData.duaStagesData.map(function(stage) { return '<div class="print-subsection"><h3>' + stage.label + '</h3><ul>' + stage.checklist.map(function(text) { return '<li><span class="print-checkbox' + (ck[text] ? ' checked' : '') + '"></span> ' + text + '</li>'; }).join('') + '</ul></div>'; }).join(''); })() + '</section>' : '') + '<section class="print-report-section"><h2>' + goodPracticesNumber + '. Buenas prácticas generales para adecuaciones</h2><ul>' + goodPracticesData.map(function(item) { return '<li><strong>' + item.title + ':</strong> ' + item.text + '</li>'; }).join('') + '</ul></section>' + (function() { try { return renderCIFBarChart(students, { hideToggle: true }); } catch(e) { return ''; } })() + profiles.map(function(grouped, index) { return renderProfileSection(grouped, index, firstSupportNumber); }).join('') + '<section class="print-report-section"><h2>Seguimiento y mejora</h2><ul><li>¿Qué barrera apareció o persistió durante la clase?</li><li>¿Qué apoyo favoreció comprensión, participación, autonomía o bienestar?</li><li>¿La retroalimentación fue clara, oportuna y centrada en el proceso?</li><li>¿Las instrucciones y recursos estuvieron disponibles en formatos accesibles?</li><li>¿Qué ajuste concreto conviene mantener, retirar o probar en la próxima clase?</li></ul></section><footer class="print-report-footer">Documento generado desde el Planificador Inclusivo UIE. Orientaciones alineadas con documentación institucional y fuentes disponibles en Apoyos adicionales / Referencias.</footer>';
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

function ensurePdfMake(callback, onError) {
    if (window.pdfMake) { callback(); return; }
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/pdfmake.min.js';
    script.onerror = function() {
        if (onError) onError();
        else alert('No se pudo generar el PDF. Verifica tu conexión a internet.');
    };
    var fonts = document.createElement('script');
    fonts.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/vfs_fonts.min.js';
    var loaded = 0;
    function onLoad() {
        loaded++;
        if (loaded === 2) callback();
    }
    script.onload = onLoad;
    fonts.onload = onLoad;
    fonts.onerror = script.onerror;
    document.head.appendChild(script);
    document.head.appendChild(fonts);
}

function buildPdfHeader(logoBase64) {
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
    return { columns: [{ canvas: canvas, width: s + 4, margin: [0, 1.5, 0, 0] }, { text: text, width: '*' }], margin: [0, 2, 0, 2] };
}

function generatePdfMake(callback) {
    var data = getReportData();
    var checkedDua = data.checkedDua;
    var students = data.students;
    var profiles = data.profiles;
    var duaSummary = data.duaSummary;

    imageToBase64(LOGO_UIE_BASE64, function(logoBase64) {
        var content = buildPdfHeader(logoBase64);
        var goodPracticesNumber = checkedDua.length ? 2 : 1;

        content.push({ text: REPORT_TITLE, style: 'mainTitle' });
        content.push({ text: 'Documento orientativo para acordar una base DUA de clase y, cuando corresponda, adecuaciones curriculares de acceso para estudiantes registrados.', style: 'introText' });
        content.push({ text: '' });

        if (checkedDua.length) {
            content.push({ text: '1. Base DUA para toda la clase', style: 'sectionTitle' });
            content.push({ text: 'Estas decisiones describen la base común de clase: apoyos pedagógicos generales para anticipar barreras, diversificar la participación y sostener el resultado de aprendizaje.', style: 'bodyText' });
            content.push({ text: '' });

            var checkedTexts = {};
            checkedDua.forEach(function(item) { checkedTexts[item.text] = true; });
            window.UiePlannerData.duaStagesData.forEach(function(stage) {
                content.push({ text: stage.label, style: 'subSectionTitle' });
                stage.checklist.forEach(function(itemText) {
                    content.push(checkboxItem(itemText, !!checkedTexts[itemText]));
                });
                content.push({ text: '' });
            });
        }

        content.push({ text: goodPracticesNumber + '. Buenas prácticas generales para adecuaciones', style: 'sectionTitle' });
        content.push({ ul: goodPracticesData.map(function(item) { return { text: [{ text: item.title + ': ', bold: true }, item.text] }; }) });
        content.push({ text: '' });

        var firstSupportNumber = goodPracticesNumber + 1;
        var studentIdx = 0;
        profiles.forEach(function(grouped) {
            grouped.students.forEach(function(student) {
                var studentChart = renderCIFChartPdfSection([student]);
                studentChart.forEach(function(item) { content.push(item); });
                var sectionContent = renderProfilePdfSection({ conditions: grouped.conditions, students: [student] }, studentIdx++, firstSupportNumber);
                sectionContent.forEach(function(item) { content.push(item); });
            });
        });

        var followUpNum = firstSupportNumber + studentIdx;
        content.push({ text: followUpNum + '. Seguimiento y mejora', style: 'sectionTitle' });
        content.push({ ul: [
            '¿Qué barrera apareció o persistió durante la clase?',
            '¿Qué apoyo favoreció comprensión, participación, autonomía o bienestar?',
            '¿La retroalimentación fue clara, oportuna y centrada en el proceso?',
            '¿Las instrucciones y recursos estuvieron disponibles en formatos accesibles?',
            '¿Qué ajuste concreto conviene mantener, retirar o probar en la próxima clase?'
        ] });
        content.push({ text: '' });

        content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#d1d5db' }] });
        content.push({ text: '' });
        content.push({ text: 'Documento generado desde el Planificador Inclusivo UIE. Orientaciones alineadas con documentación institucional y fuentes disponibles en Apoyos adicionales / Referencias.', style: 'footerText' });

        var docDefinition = {
            content: content,
            styles: {
                headerOrg: { fontSize: 13, bold: true, color: '#b42318' },
                headerMeta: { fontSize: 8.5, color: '#6b7280' },
                mainTitle: { fontSize: 20, bold: true, color: '#111827', margin: [0, 0, 0, 8] },
                introText: { fontSize: 10.5, color: '#4b5563', margin: [0, 0, 0, 16], italics: true },
                sectionTitle: { fontSize: 14, bold: true, color: '#111827', margin: [0, 14, 0, 8] },
                subSectionTitle: { fontSize: 11, bold: true, color: '#b42318', margin: [0, 10, 0, 4] },
                bodyText: { fontSize: 10.5, color: '#111827', margin: [0, 3, 0, 3] },
                sourceText: { fontSize: 8.5, color: '#9ca3af', margin: [0, 3, 0, 3] },
                footerText: { fontSize: 8.5, color: '#9ca3af', margin: [0, 6, 0, 0], italics: true }
            },
            defaultStyle: { fontSize: 10.5, color: '#111827', font: 'Roboto' },
            pageMargins: [40, 40, 40, 40]
        };

        try {
            pdfMake.createPdf(docDefinition).download('plan-apoyo-docente.pdf');
        } catch(e) {
            console.error('Error generando PDF:', e);
            alert('No se pudo generar el PDF. Intenta recargar la página e intentar de nuevo.');
        }
        if (callback) callback();
    });
}

function generateDuaPdf(callback) {
    var duaSummary = getDuaStageSummary();
    var checkedDua = getCheckedDuaItems();
    if (!checkedDua.length) {
        if (callback) callback();
        return;
    }

    imageToBase64(LOGO_UIE_BASE64, function(logoBase64) {
        var content = buildPdfHeader(logoBase64);

        content.push({ text: 'Base DUA para la clase', style: 'mainTitle' });
        content.push({ text: '' });

        var checkedTexts = {};
        checkedDua.forEach(function(item) { checkedTexts[item.text] = true; });
        window.UiePlannerData.duaStagesData.forEach(function(stage) {
            content.push({ text: stage.label, style: 'subSectionTitle' });
            stage.checklist.forEach(function(itemText) {
                content.push(checkboxItem(itemText, !!checkedTexts[itemText]));
            });
            content.push({ text: '' });
        });

        content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#d1d5db' }] });
        content.push({ text: '' });
        content.push({ text: 'Documento generado desde el Planificador Inclusivo UIE.', style: 'footerText' });

        var docDefinition = {
            content: content,
            styles: {
                headerOrg: { fontSize: 13, bold: true, color: '#b42318' },
                headerMeta: { fontSize: 8.5, color: '#6b7280' },
                mainTitle: { fontSize: 20, bold: true, color: '#111827', margin: [0, 0, 0, 8] },
                subSectionTitle: { fontSize: 11, bold: true, color: '#b42318', margin: [0, 10, 0, 4] },
                bodyText: { fontSize: 10.5, color: '#111827', margin: [0, 3, 0, 3] },
                footerText: { fontSize: 8.5, color: '#9ca3af', margin: [0, 6, 0, 0], italics: true }
            },
            defaultStyle: { fontSize: 10.5, color: '#111827', font: 'Roboto' },
            pageMargins: [40, 40, 40, 40]
        };

        try {
            pdfMake.createPdf(docDefinition).download('base-dua-clase.pdf');
        } catch(e) {
            console.error('Error generando PDF DUA:', e);
            alert('No se pudo generar el PDF. Intenta recargar la página e intentar de nuevo.');
        }
        if (callback) callback();
    });
}

function generateAccPdf(callback) {
    var students = getSelectedSupportStudentGroups();
    var profiles = groupStudentsByProfile(students);
    if (!students.length) {
        if (callback) callback();
        return;
    }

    var conditionCount = profiles.reduce(function(count, p) { return count + p.conditions.length; }, 0);

    imageToBase64(LOGO_UIE_BASE64, function(logoBase64) {
        var content = buildPdfHeader(logoBase64);

        content.push({ text: 'Adecuaciones curriculares de acceso', style: 'mainTitle' });
        content.push({ text: [{ text: 'Estudiantes: ', bold: true }, students.length + ' estudiante(s), ' + conditionCount + ' condición(es)'], style: 'bodyText' });
        content.push({ text: [{ text: 'Perfiles: ', bold: true }, profiles.map(function(p) { return p.conditions.map(function(c) { return c.name; }).join(' · '); }).join('; ') + '.'], style: 'bodyText' });
        content.push({ text: '' });

        content.push({ text: '1. Buenas prácticas generales para adecuaciones', style: 'sectionTitle' });
        content.push({ ul: goodPracticesData.map(function(item) { return { text: [{ text: item.title + ': ', bold: true }, item.text] }; }) });
        content.push({ text: '' });

        var studentIdx = 0;
        profiles.forEach(function(grouped) {
            grouped.students.forEach(function(student) {
                var studentChart = renderCIFChartPdfSection([student]);
                studentChart.forEach(function(item) { content.push(item); });
                var sectionContent = renderProfilePdfSection({ conditions: grouped.conditions, students: [student] }, studentIdx++, 2);
                sectionContent.forEach(function(item) { content.push(item); });
            });
        });

        var followUpNum = 2 + studentIdx;
        content.push({ text: followUpNum + '. Seguimiento y mejora', style: 'sectionTitle' });
        content.push({ ul: [
            '¿Qué barrera apareció o persistió durante la clase?',
            '¿Qué apoyo favoreció comprensión, participación, autonomía o bienestar?',
            '¿La retroalimentación fue clara, oportuna y centrada en el proceso?',
            '¿Las instrucciones y recursos estuvieron disponibles en formatos accesibles?',
            '¿Qué ajuste concreto conviene mantener, retirar o probar en la próxima clase?'
        ] });
        content.push({ text: '' });

        content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#d1d5db' }] });
        content.push({ text: '' });
        content.push({ text: 'Documento generado desde el Planificador Inclusivo UIE. Orientaciones alineadas con documentación institucional y fuentes disponibles en Apoyos adicionales / Referencias.', style: 'footerText' });

        var docDefinition = {
            content: content,
            styles: {
                headerOrg: { fontSize: 13, bold: true, color: '#b42318' },
                headerMeta: { fontSize: 8.5, color: '#6b7280' },
                mainTitle: { fontSize: 20, bold: true, color: '#111827', margin: [0, 0, 0, 8] },
                sectionTitle: { fontSize: 14, bold: true, color: '#111827', margin: [0, 14, 0, 8] },
                subSectionTitle: { fontSize: 11, bold: true, color: '#b42318', margin: [0, 10, 0, 4] },
                bodyText: { fontSize: 10.5, color: '#111827', margin: [0, 3, 0, 3] },
                sourceText: { fontSize: 8.5, color: '#9ca3af', margin: [0, 3, 0, 3] },
                footerText: { fontSize: 8.5, color: '#9ca3af', margin: [0, 6, 0, 0], italics: true }
            },
            defaultStyle: { fontSize: 10.5, color: '#111827', font: 'Roboto' },
            pageMargins: [40, 40, 40, 40]
        };

        try {
            pdfMake.createPdf(docDefinition).download('adecuaciones-curriculares.pdf');
        } catch(e) {
            console.error('Error generando PDF adecuaciones:', e);
            alert('No se pudo generar el PDF. Intenta recargar la página e intentar de nuevo.');
        }
        if (callback) callback();
    });
}

window.UiePlannerReport = {
    initReports,
    renderPlanSummary,
    updatePrintableRecommendations,
    ensurePdfMake,
    generateDuaPdf,
    generateAccPdf,
    generatePdfMake
};
})();