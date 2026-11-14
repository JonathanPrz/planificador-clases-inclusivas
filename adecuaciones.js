(function () {
var DATA = window.UiePlannerData;
var PDF = window.UiePlannerPdf;
var CATALOG = (window.UiePlannerCatalog && window.UiePlannerCatalog.apoyos) || [];

var ACTIVITIES = DATA.accessMatrixActivities.map(function(a) { return { id: a.id, label: a.label }; });
var SHORT = DATA.shortActivityLabels || {};
var DERIVED = {
    grupo: { label: 'Trabajo en grupo', from: ['sociales', 'hablar'] },
    ava: { label: 'Aula virtual AVA', from: ['leer', 'escribir', 'acceder'] },
    terreno: { label: 'Salidas a terreno', from: ['acceder', 'practicas_rec'] }
};
var LABELS = {};
ACTIVITIES.forEach(function(a) { LABELS[a.id] = a.label; });
Object.keys(DERIVED).forEach(function(k) { LABELS[k] = DERIVED[k].label; });

var LEVEL_NAMES = ['Sin barrera', 'Leve', 'Moderada', 'Significativa'];
var MATRIX_SCALE = [
    { value: 4, label: 'Participa sin ajustes' },
    { value: 3, label: 'Observar' },
    { value: 2, label: 'Requiere apoyo' },
    { value: 1, label: 'No participa sin apoyo' }
];
var ORIGINS = [
    ['visual', 'Visual'], ['auditivo', 'Auditivo'], ['motor', 'Motor'], ['sensorial', 'Sensorial (táctil o vestibular)'],
    ['cognitivo', 'Procesamiento cognitivo'], ['social', 'Comunicación social'], ['regulacion', 'Regulación emocional'], ['salud', 'Salud y energía']
];
var CONDITIONS = [
    ['Neurodesarrollo', ['social', 'cognitivo', 'regulacion']], ['Intelectual', ['cognitivo']], ['Sordoceguera', ['visual', 'auditivo']],
    ['Física', ['motor']], ['Visual', ['visual']], ['Auditiva', ['auditivo']], ['Visceral', ['salud']], ['Psíquica', ['regulacion']],
    ['Vestibular', ['sensorial', 'motor']], ['Táctil', ['sensorial']]
];
var TIPOS = {
    presentacion: 'Cómo se presenta la información',
    respuesta: 'Cómo responde o demuestra lo aprendido',
    entorno: 'El espacio, los recursos o la organización',
    tiempo: 'Los tiempos o plazos'
};
var MOMENTOS = { clase: 'En clase', fuera: 'Fuera de clase', evaluacion: 'En evaluaciones' };

var QUESTIONS = [
    { id: 'modalidad', multi: true, text: '¿Qué modalidad tiene la asignatura?', hint: 'Filtra los apoyos que no sirven en esa modalidad.', opts: [['teorica', 'Teórica'], ['practica', 'Práctica (taller, laboratorio)'], ['profesional', 'Práctica profesional'], ['online', 'Online']] },
    { id: 'evalua', multi: true, text: '¿Cómo se evalúa principalmente?', hint: 'Sube los apoyos para esas evaluaciones.', opts: [['escrita', 'Pruebas escritas con tiempo'], ['entregas', 'Trabajos con plazo'], ['oral', 'Presentaciones orales'], ['practica', 'Demostraciones prácticas'], ['plataforma', 'Evaluaciones en plataforma']] },
    { id: 'competencia', multi: true, wide: true, text: '¿Algún formato es parte de la competencia que se evalúa?', hint: 'Los apoyos que cambien ese formato se marcan «Revisar con el docente».', opts: [['oral', 'Comunicación oral'], ['escrito', 'Producción escrita'], ['tiempo', 'Rapidez o tiempo límite'], ['practico', 'Ejecución práctica'], ['ninguno', 'Ninguno']] },
    { id: 'grupo', text: '¿Hay trabajo en grupo frecuente?', hint: 'Activa la actividad «Trabajo en grupo».', opts: [['si', 'Sí'], ['aveces', 'A veces'], ['no', 'No']] },
    { id: 'materiales', text: '¿Cómo se entregan los materiales?', hint: 'Digital o ambos activa «Aula virtual».', opts: [['impresos', 'Impresos en clase'], ['digital', 'Digitales en el AVA'], ['ambos', 'Ambos']] },
    { id: 'incluye', multi: true, text: '¿La asignatura incluye…?', hint: 'Agrega apoyos de seguridad o de salidas a terreno.', opts: [['riesgo', 'Herramientas o equipos con riesgo'], ['terreno', 'Salidas a terreno'], ['ninguno', 'Ninguno de estos']] },
    { id: 'oralclase', text: '¿Hay participación oral obligatoria en clase?', hint: 'Sube los apoyos de «Hablar».', opts: [['si', 'Sí'], ['no', 'No']] },
    { id: 'preocupa', wide: true, text: '¿Qué le preocupa más al docente hoy?', hint: 'Ordena primero esas actividades cuando tienen el mismo nivel.', opts: [['comprension', 'Comprensión'], ['participacion', 'Participación'], ['evaluaciones', 'Evaluaciones'], ['asistencia', 'Asistencia y plazos'], ['grupo', 'Relación con el grupo']] },
    { id: 'humano', multi: true, wide: true, text: '¿Se cuenta con apoyo humano disponible?', hint: 'Los apoyos que requieren un recurso no disponible quedan marcados para coordinar.', opts: [['lsch', 'Intérprete de lengua de señas'], ['guia', 'Guía intérprete'], ['tutor', 'Tutor par'], ['ayudante', 'Ayudante'], ['ninguno', 'Ninguno']] }
];
var CONCERN = {
    comprension: ['leer', 'recordar'],
    participacion: ['sala_clases', 'hablar', 'grupo'],
    evaluaciones: ['examenes', 'escribir'],
    asistencia: ['ayuda', 'acceder', 'ava'],
    grupo: ['sociales', 'grupo']
};
var SWAP = /alternativ|escrit|sin público|en vez|reemplaz|grabad|flexibil|formato|rol activo|en pareja|sustitut|equivalente/i;
var FORMAT = {
    oral: /oral|exposici|hablar|presentaci[oó]n/i,
    practico: /pr[aá]ctic|ejecuci|procedimiento|manipula/i
};
var RADAR_COLORS = ['#2a78d6', '#eb6834', '#1baf7a'];
var SHOW = 4;
var MAX_STUDENTS = 8;

var state = {
    asignatura: '',
    seccion: '',
    docente: '',
    answers: { modalidad: [], evalua: [], competencia: [], grupo: '', materiales: '', incluye: [], oralclase: '', preocupa: '', humano: [] },
    students: [],
    nextUid: 1,
    chartView: null
};
var lastResults = {};

function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}
function has(list, value) { return (list || []).indexOf(value) !== -1; }
function ans(id) { return state.answers[id]; }
function answered(value) { return Array.isArray(value) ? value.length > 0 : !!value; }

function newStudent() {
    var uid = state.nextUid++;
    return {
        uid: uid, name: '', carrera: '', fecha: '', entregadaPor: 'Psicopedagogía', vigencia: 'Semestre en curso',
        matrix: {}, conditions: [], origins: [], funciona: '', evitar: '',
        selected: {}, expanded: {}, inChart: true
    };
}
function studentLabel(student, index) {
    return student.name.trim() || 'Estudiante ' + (index + 1);
}
function studentIndex(uid) {
    for (var i = 0; i < state.students.length; i++) if (state.students[i].uid === uid) return i;
    return -1;
}
function findStudent(uid) { return state.students[studentIndex(uid)]; }
function matrixCount(student) {
    return ACTIVITIES.filter(function(a) { return student.matrix[a.id]; }).length;
}

function renderShell(root) {
    root.innerHTML =
        '<ol class="adq-steps" aria-label="Pasos">' +
            '<li><a href="#adq-paso-1"><span class="adq-step-num" id="adq-s1" data-n="1">1</span>La asignatura</a></li>' +
            '<li><a href="#adq-paso-2"><span class="adq-step-num" id="adq-s2" data-n="2">2</span>Estudiantes</a></li>' +
            '<li><a href="#adq-paso-3"><span class="adq-step-num" id="adq-s3" data-n="3">3</span>Apoyos y documentos</a></li>' +
        '</ol>' +
        '<div class="adq-layout"><div class="adq-main">' +
        '<div class="adq-block" id="adq-paso-1">' +
            blockHead(1, 'Conversación con el docente', 'adq-p1', 'Nueve preguntas cerradas que estandarizan la conversación. Se responden una vez por sección y valen para todos sus estudiantes.', 'Responde: asesor de inclusión con el docente') +
            '<div class="adq-fields">' +
                textField('asignatura', 'Asignatura (opcional)', 'Texto libre') +
                textField('seccion', 'Sección (opcional)', 'Sin informar') +
                textField('docente', 'Docente (opcional)', 'Sin informar') +
            '</div>' +
            '<div class="adq-questions">' + QUESTIONS.map(renderQuestion).join('') + '</div>' +
        '</div>' +
        '<div class="adq-block" id="adq-paso-2">' +
            blockHead(2, 'Estudiantes', 'adq-p2', 'Copia la matriz CIF tal como la entrega psicopedagogía, con su misma escala de 4 a 1. El origen de la barrera es opcional y ayuda a ordenar.', 'Fuente: entrevista PAEDIS de psicopedagogía') +
            '<div id="adq-students" class="adq-students"></div>' +
            '<button class="btn btn-secondary" id="adq-add-student" type="button">+ Agregar estudiante</button>' +
        '</div>' +
        '</div><aside class="adq-side" aria-label="Apoyos propuestos y documentos">' +
        '<div class="adq-block" id="adq-paso-3">' +
            blockHead(3, 'Apoyos propuestos', 'adq-p3', 'Agrupados por la actividad donde está la barrera, de mayor a menor nivel. Marca los que se acordaron con el docente.', '') +
            '<p class="adq-review-note">Catálogo en revisión por el equipo de asesores. Cada apoyo trae en «Detalle» cuándo se aplica, qué no cambia, cuándo no aplica y su fuente.</p>' +
            '<div id="adq-chart"></div>' +
            '<div id="adq-whole-class"></div>' +
            '<div id="adq-results" class="adq-results" aria-live="polite"></div>' +
            '<div class="adq-cta">' +
                '<button class="btn adq-doc-btn adq-doc-primary" type="button" id="adq-doc-teacher">Plan para el docente<small>Solo apoyos acordados. Sin condición ni diagnóstico.</small></button>' +
                '<button class="btn adq-doc-btn" type="button" id="adq-doc-coord">Ficha de coordinación<small>Uso interno: matriz, origen, coordinaciones y seguimiento.</small></button>' +
            '</div>' +
        '</div>' +
        '</aside></div>';
}
function blockHead(n, title, progressId, text, who) {
    return '<div class="adq-block-head"><span class="adq-block-num" aria-hidden="true">' + n + '</span><div>' +
        '<h3>' + esc(title) + ' <span class="adq-progress" id="' + progressId + '"></span></h3>' +
        '<p>' + esc(text) + '</p>' +
        (who ? '<span class="adq-who">' + esc(who) + '</span>' : '') +
    '</div></div>';
}
function textField(key, label, placeholder) {
    return '<label class="adq-field">' + esc(label) + '<input class="text-control" type="text" data-section-field="' + key + '" placeholder="' + esc(placeholder) + '" autocomplete="off"></label>';
}
function renderQuestion(q) {
    var opts = q.opts.map(function(o) {
        return '<label class="adq-chip"><input type="' + (q.multi ? 'checkbox' : 'radio') + '" name="adq-q-' + q.id + '" value="' + o[0] + '" data-question="' + q.id + '"><span>' + esc(o[1]) + '</span></label>';
    }).join('');
    return '<fieldset class="adq-q' + (q.wide ? ' is-wide' : '') + '"><legend>' + esc(q.text) + '</legend>' +
        '<p class="adq-hint">' + esc(q.hint) + (q.multi ? ' Puedes marcar varias.' : '') + '</p>' +
        '<div class="adq-opts">' + opts + '</div></fieldset>';
}

function renderStudents() {
    var box = document.getElementById('adq-students');
    box.innerHTML = state.students.map(renderStudentCard).join('');
    var add = document.getElementById('adq-add-student');
    add.disabled = state.students.length >= MAX_STUDENTS;
    add.textContent = state.students.length >= MAX_STUDENTS ? 'Máximo ' + MAX_STUDENTS + ' estudiantes' : '+ Agregar estudiante';
}
function renderStudentCard(student, index) {
    var u = student.uid;
    var rows = ACTIVITIES.map(function(a) {
        var cells = MATRIX_SCALE.map(function(s) {
            var level = 4 - s.value;
            var checked = student.matrix[a.id] === s.value ? ' checked' : '';
            return '<td><label class="adq-lvl adq-lvl-' + level + '"><input type="radio" name="adq-m-' + u + '-' + a.id + '" value="' + s.value + '" data-matrix="' + a.id + '" data-uid="' + u + '"' + checked + ' aria-label="' + esc(a.label) + ': ' + s.value + ', ' + esc(s.label) + '"><span aria-hidden="true">' + s.value + '</span></label></td>';
        }).join('');
        return '<tr><th scope="row">' + esc(a.label) + '</th>' + cells + '</tr>';
    }).join('');
    var head = MATRIX_SCALE.map(function(s) { return '<th scope="col"><span class="adq-scale-num">' + s.value + '</span><span class="adq-scale-label">' + esc(s.label) + '</span></th>'; }).join('');
    var conds = CONDITIONS.map(function(c) {
        return '<label class="adq-chip"><input type="checkbox" data-condition="' + esc(c[0]) + '" data-uid="' + u + '"' + (has(student.conditions, c[0]) ? ' checked' : '') + '><span>' + esc(c[0]) + '</span></label>';
    }).join('');
    var origins = ORIGINS.map(function(o) {
        return '<label class="adq-chip"><input type="checkbox" data-origin="' + o[0] + '" data-uid="' + u + '"' + (has(student.origins, o[0]) ? ' checked' : '') + '><span>' + esc(o[1]) + '</span></label>';
    }).join('');
    var vig = ['Semestre en curso', 'Requiere actualizar'].map(function(v) { return '<option' + (student.vigencia === v ? ' selected' : '') + '>' + v + '</option>'; }).join('');
    return '<article class="adq-student" data-uid="' + u + '" aria-labelledby="adq-st-' + u + '">' +
        '<div class="adq-student-top">' +
            '<h4 id="adq-st-' + u + '">' + esc(studentLabel(student, index)) + '</h4>' +
            '<span class="adq-progress" id="adq-mp-' + u + '"></span>' +
            '<label class="adq-inchart"><input type="checkbox" data-student-field="inChart" data-uid="' + u + '"' + (student.inChart ? ' checked' : '') + '> Incluir en el gráfico</label>' +
            (state.students.length > 1 ? '<button class="btn btn-secondary btn-sm" type="button" data-remove="' + u + '">Quitar</button>' : '') +
        '</div>' +
        '<div class="adq-fields">' +
            studentField(u, 'name', 'Nombre o iniciales (opcional)', student.name, 'Ej.: C. M.') +
            studentField(u, 'carrera', 'Carrera (opcional)', student.carrera, 'Sin informar') +
        '</div>' +
        '<div class="adq-sub">' +
            '<h5>Matriz CIF de psicopedagogía</h5>' +
            '<div class="adq-fields adq-fields-3">' +
                studentField(u, 'entregadaPor', 'Entregada por', student.entregadaPor, 'Psicopedagogía') +
                '<label class="adq-field">Fecha de entrevista PAEDIS<input class="text-control" type="date" data-student-field="fecha" data-uid="' + u + '" value="' + esc(student.fecha) + '"></label>' +
                '<label class="adq-field">Vigencia<select class="text-control" data-student-field="vigencia" data-uid="' + u + '">' + vig + '</select></label>' +
            '</div>' +
            '<div class="adq-matrix-wrap"><table class="adq-matrix"><caption class="sr-only">Matriz CIF de ' + esc(studentLabel(student, index)) + ', escala de 4 a 1</caption>' +
                '<thead><tr><th scope="col">Actividad</th>' + head + '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
            '<p class="adq-matrix-help">Se digita igual que en la ficha: 4 participa sin ajustes y 1 no participa sin apoyo. El planificador lo convierte en nivel de barrera.</p>' +
            '<div class="adq-derived" id="adq-derived-' + u + '"></div>' +
        '</div>' +
        '<details class="adq-sub adq-opt"><summary>Origen de la barrera (opcional) <span class="adq-private">Solo ficha de coordinación</span></summary>' +
            '<p class="adq-hint">Si se conoce, prioriza los apoyos que responden a ese origen. Se pueden marcar varias condiciones: cada una suma su origen sugerido, y el origen se puede corregir a mano.</p>' +
            '<p class="adq-sublabel">Condición (opcional, puede ser más de una)</p><div class="adq-opts">' + conds + '</div>' +
            '<p class="adq-sublabel">Origen de la barrera</p><div class="adq-opts" data-origins="' + u + '">' + origins + '</div>' +
        '</details>' +
        '<details class="adq-sub adq-opt"><summary>Lo que dice el estudiante</summary>' +
            '<div class="adq-fields adq-fields-2">' +
                '<label class="adq-field">Lo que le funciona<textarea class="text-control" rows="2" data-student-field="funciona" data-uid="' + u + '">' + esc(student.funciona) + '</textarea></label>' +
                '<label class="adq-field">Lo que prefiere evitar<textarea class="text-control" rows="2" data-student-field="evitar" data-uid="' + u + '">' + esc(student.evitar) + '</textarea></label>' +
            '</div>' +
        '</details>' +
    '</article>';
}
function studentField(uid, key, label, value, placeholder) {
    return '<label class="adq-field">' + esc(label) + '<input class="text-control" type="text" data-student-field="' + key + '" data-uid="' + uid + '" value="' + esc(value) + '" placeholder="' + esc(placeholder) + '" autocomplete="off"></label>';
}

function levels(student) {
    var lv = {};
    ACTIVITIES.forEach(function(a) { lv[a.id] = student.matrix[a.id] ? 4 - student.matrix[a.id] : 0; });
    var active = {
        grupo: ans('grupo') === 'si' || ans('grupo') === 'aveces',
        ava: ans('materiales') === 'digital' || ans('materiales') === 'ambos' || has(ans('modalidad'), 'online'),
        terreno: has(ans('incluye'), 'terreno')
    };
    Object.keys(DERIVED).forEach(function(k) {
        lv[k] = active[k] ? Math.max.apply(null, DERIVED[k].from.map(function(f) { return lv[f]; })) : 0;
    });
    return { lv: lv, active: active };
}
function reviewFor(item) {
    var comp = ans('competencia');
    var out = [];
    if (has(comp, 'tiempo') && item.tipo === 'tiempo') out.push('rapidez o tiempo límite');
    if (has(comp, 'oral') && FORMAT.oral.test(item.texto) && SWAP.test(item.texto)) out.push('comunicación oral');
    if (has(comp, 'escrito') && /escrit|redac/i.test(item.texto) && /oral|verbal|dictado|grabad|alternativ|en vez|reemplaz/i.test(item.texto) && item.tipo === 'respuesta') out.push('producción escrita');
    if (has(comp, 'practico') && FORMAT.practico.test(item.texto) && SWAP.test(item.texto)) out.push('ejecución práctica');
    return out;
}
function coordFor(item) {
    var h = ans('humano');
    if (!h.length) return [];
    var out = [];
    if (has(item.etiquetas, 'canal_lsch') && !has(h, 'lsch')) out.push('intérprete de lengua de señas');
    if (has(item.etiquetas, 'canal_guia_interprete') && !has(h, 'guia')) out.push('guía intérprete');
    if (has(item.etiquetas, 'apoyo_humano') && !has(item.etiquetas, 'canal_lsch') && !has(item.etiquetas, 'canal_guia_interprete') && has(h, 'ninguno')) out.push('apoyo humano');
    return out;
}
function duaCoverage() {
    var links = DATA.duaCatalogLinks || {};
    var checked = (window.UiePlannerDua && window.UiePlannerDua.getCheckedDuaItems) ? window.UiePlannerDua.getCheckedDuaItems() : [];
    var map = {};
    checked.forEach(function(d) {
        (links[d.checkId] || []).forEach(function(id) { (map[id] = map[id] || []).push(d); });
    });
    return map;
}
var DUA_COVER = {};
function coveredBy(item) { return DUA_COVER[item.id] || []; }
function getRepeatedSupports() {
    var counts = {};
    state.students.forEach(function(student) {
        selectedItems(student).forEach(function(g) {
            g.items.forEach(function(it) {
                if (!counts[it.id]) counts[it.id] = { item: it, students: [] };
                if (counts[it.id].students.indexOf(student.uid) === -1) counts[it.id].students.push(student.uid);
            });
        });
    });
    return Object.keys(counts).filter(function(id) { return counts[id].students.length >= 2; }).map(function(id) {
        return { id: id, texto: counts[id].item.texto, item: counts[id].item, students: counts[id].students };
    });
}
function notifyChange() {
    document.dispatchEvent(new CustomEvent('uie-adecuaciones-change'));
}
function score(student, item, act, L) {
    var s = L.lv[act] * 100;
    if (coveredBy(item).length) s -= 60;
    if (student.origins.length) {
        var hit = item.origenes.filter(function(o) { return has(student.origins, o); }).length;
        s += hit ? 30 + Math.min(hit, 3) * 2 - (item.origenes.length >= 8 ? 20 : 0) : -40;
    }
    if (act === 'examenes' && has(item.momentos, 'evaluacion')) s += 8;
    if (act === 'hablar' && ans('oralclase') === 'si') s += 10;
    if (has(ans('incluye'), 'riesgo') && /segurid|herramient|puesto|protecci|alarma/i.test(item.texto)) s += 25;
    if (has(ans('modalidad'), 'profesional') && has(item.modalidades, 'profesional')) s += 15;
    return s;
}
function compute(student) {
    var L = levels(student);
    var mods = ans('modalidad');
    var groups = {};
    CATALOG.forEach(function(item) {
        if (mods.length && !item.modalidades.some(function(m) { return has(mods, m); })) return;
        var best = null;
        item.actividades.forEach(function(act) {
            if (!(L.lv[act] > 0)) return;
            if (!best || L.lv[act] > L.lv[best]) best = act;
        });
        if (!best) return;
        (groups[best] = groups[best] || []).push({ item: item, s: score(student, item, best, L) });
    });
    var concern = CONCERN[ans('preocupa')] || [];
    var order = Object.keys(groups).sort(function(a, b) {
        return (L.lv[b] - L.lv[a]) || ((has(concern, b) ? 1 : 0) - (has(concern, a) ? 1 : 0)) || LABELS[a].localeCompare(LABELS[b]);
    });
    order.forEach(function(k) { groups[k].sort(function(x, y) { return y.s - x.s; }); });
    return { L: L, groups: groups, order: order, concern: concern };
}

function renderDerived(student, L) {
    var box = document.getElementById('adq-derived-' + student.uid);
    if (!box) return;
    var parts = Object.keys(DERIVED).map(function(k) {
        var d = DERIVED[k];
        if (!L.active[k]) return '<b>' + d.label + '</b>: no aplica según las preguntas';
        return '<b>' + d.label + '</b>: ' + LEVEL_NAMES[L.lv[k]] + ' (toma el nivel más alto de ' + d.from.map(function(f) { return LABELS[f].toLowerCase(); }).join(' y ') + ')';
    });
    box.innerHTML = 'Actividades que no están en la matriz: ' + parts.join(' · ');
}
function renderResults() {
    DUA_COVER = duaCoverage();
    var box = document.getElementById('adq-results');
    var multi = state.students.length > 1;
    lastResults = {};
    var html = '';
    state.students.forEach(function(student, index) {
        var R = compute(student);
        lastResults[student.uid] = R;
        renderDerived(student, R.L);
        html += '<section class="adq-student-results" aria-labelledby="adq-res-' + student.uid + '">' +
            '<div class="adq-toolbar">' +
                '<h4 id="adq-res-' + student.uid + '">' + (multi ? esc(studentLabel(student, index)) : 'Apoyos para ' + esc(studentLabel(student, index))) + '</h4>' +
                '<span class="adq-applied">' + appliedText(student) + '</span>' +
                '<span class="adq-count" id="adq-count-' + student.uid + '"></span>' +
            '</div>' +
            renderGroups(student, R) +
        '</section>';
    });
    box.innerHTML = html;
    state.students.forEach(function(student) { renderCount(student); });
    renderChart();
    renderWholeClass();
    renderProgress();
    notifyChange();
}
function renderWholeClass() {
    var box = document.getElementById('adq-whole-class');
    if (!box) return;
    var repeated = getRepeatedSupports();
    var coveredActions = {};
    state.students.forEach(function(student) {
        var R = lastResults[student.uid];
        if (!R) return;
        R.order.forEach(function(act) {
            R.groups[act].forEach(function(e) { coveredBy(e.item).forEach(function(d) { coveredActions[d.checkId] = d.text; }); });
        });
    });
    var actions = Object.keys(coveredActions).map(function(k) { return coveredActions[k]; });
    if (!repeated.length && !actions.length) { box.innerHTML = ''; return; }
    var html = '<section class="adq-whole" aria-labelledby="adq-whole-title"><h4 id="adq-whole-title">Para todo el curso</h4>';
    if (actions.length) {
        html += '<p><b>Ya en la base DUA de la clase.</b> Estas acciones DUA cubren apoyos que necesitan estos estudiantes; los apoyos equivalentes aparecen marcados y al final de cada actividad.</p><ul>' +
            actions.map(function(t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
    }
    if (repeated.length) {
        html += '<p><b>Acordados para dos o más estudiantes.</b> Conviene aplicarlos a todo el curso e incorporarlos a la <a href="#planificar">planificación DUA</a>. En el plan para el docente aparecen una sola vez, como apoyos para todo el curso.</p><ul>' +
            repeated.map(function(r) { return '<li>' + esc(r.texto) + ' <span class="adq-whole-n">(' + r.students.length + ' estudiantes)</span></li>'; }).join('') + '</ul>';
    }
    box.innerHTML = html + '</section>';
}
function appliedText(student) {
    var mods = ans('modalidad').map(function(m) { return QUESTIONS[0].opts.filter(function(o) { return o[0] === m; })[0][1].replace(/ \(.*\)/, ''); });
    var orig = student.origins.map(function(o) { return ORIGINS.filter(function(x) { return x[0] === o; })[0][1]; });
    return 'Modalidad: <b>' + (mods.length ? esc(mods.join(', ')) : 'sin responder, se muestran todas') + '</b> · Origen: <b>' + (orig.length ? esc(orig.join(', ')) : 'sin informar') + '</b>';
}
function renderGroups(student, R) {
    if (!matrixCount(student)) {
        return '<div class="adq-empty">Digita la matriz CIF de este estudiante en el paso 2 para ver los apoyos.</div>';
    }
    if (!R.order.length) {
        return '<div class="adq-empty">La matriz no muestra barreras (todas las actividades en 4) o ningún apoyo coincide con la modalidad elegida.</div>';
    }
    return '<div class="adq-groups">' + R.order.map(function(act) {
        var list = R.groups[act];
        var lvl = R.L.lv[act];
        var gid = 'adq-g-' + student.uid + '-' + act;
        var why = DERIVED[act] ? 'Actividad derivada de las preguntas' : (has(R.concern, act) ? 'Preocupación del docente' : '');
        var expanded = !!student.expanded[act];
        var limit = expanded ? list.length : Math.min(SHOW, list.length);
        var items = list.slice(0, limit).map(function(entry) { return renderItem(student, entry.item); }).join('');
        var more = list.length > SHOW
            ? '<button type="button" class="adq-more" data-expand="' + act + '" data-uid="' + student.uid + '" aria-expanded="' + expanded + '">' + (expanded ? 'Mostrar menos' : 'Ver ' + (list.length - SHOW) + ' apoyos más para ' + esc(LABELS[act].toLowerCase())) + '</button>'
            : '';
        return '<section class="adq-group" aria-labelledby="' + gid + '">' +
            '<div class="adq-group-head"><h5 id="' + gid + '">' + esc(LABELS[act]) + '</h5>' +
                '<span class="adq-badge adq-badge-' + lvl + '">Barrera ' + LEVEL_NAMES[lvl].toLowerCase() + '</span>' +
                (why ? '<span class="adq-why">' + why + '</span>' : '') +
            '</div><ul class="adq-items">' + items + '</ul>' + more + '</section>';
    }).join('') + '</div>';
}
function renderItem(student, it) {
    var id = 'adq-c-' + student.uid + '-' + it.id;
    var rv = reviewFor(it);
    var co = coordFor(it);
    var sources = it.fuentes.map(function(f) {
        return f.url ? '<a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(f.cita) + '</a>' : esc(f.cita);
    }).join('; ');
    return '<li class="adq-item">' +
        '<input type="checkbox" id="' + id + '" data-select="' + it.id + '" data-uid="' + student.uid + '"' + (student.selected[it.id] ? ' checked' : '') + '>' +
        '<div><label for="' + id + '" class="adq-item-text">' + esc(it.texto) + '</label>' +
        (rv.length ? '<div class="adq-note"><b>Revisar con el docente:</b> cambia ' + esc(rv.join(' y ')) + ', que la asignatura evalúa. Úsalo solo si el docente confirma que no es parte de la competencia.</div>' : '') +
        (co.length ? '<div class="adq-note adq-note-coord"><b>Requiere coordinar</b> ' + esc(co.join(', ')) + ': hoy no está disponible según las preguntas.</div>' : '') +
        (coveredBy(it).length ? '<div class="adq-note adq-note-dua"><b>Ya está en la base DUA de la clase:</b> «' + esc(coveredBy(it)[0].text) + '». Basta con mantenerlo; no hace falta acordarlo aparte.</div>' : '') +
        '<details class="adq-detail"><summary>Detalle</summary><dl>' +
            '<dt>Cuándo</dt><dd>' + esc(it.momentos.map(function(m) { return MOMENTOS[m]; }).join(', ')) + '</dd>' +
            '<dt>Ajusta</dt><dd>' + esc(TIPOS[it.tipo] || '') + '</dd>' +
            '<dt>No cambia</dt><dd>' + esc(it.noCambia || 'Por completar en la revisión del equipo.') + '</dd>' +
            '<dt>No aplica</dt><dd>' + esc(it.noAplica || 'Por completar en la revisión del equipo.') + '</dd>' +
            '<dt>Fuente</dt><dd>' + sources + '</dd>' +
        '</dl></details></div></li>';
}
function selectedItems(student) {
    var R = lastResults[student.uid];
    if (!R) return [];
    var out = [];
    R.order.forEach(function(act) {
        var items = R.groups[act].filter(function(e) { return student.selected[e.item.id]; }).map(function(e) { return e.item; });
        if (items.length) out.push({ act: act, level: R.L.lv[act], items: items });
    });
    return out;
}
function countSelected(student) {
    return selectedItems(student).reduce(function(n, g) { return n + g.items.length; }, 0);
}
function renderCount(student) {
    var R = lastResults[student.uid];
    var el = document.getElementById('adq-count-' + student.uid);
    if (!el || !R) return;
    var total = 0;
    R.order.forEach(function(k) { total += R.groups[k].length; });
    el.innerHTML = '<b>' + countSelected(student) + '</b> acordados de ' + total + ' propuestos';
}
function setProgress(pid, sid, text, done) {
    var p = document.getElementById(pid);
    if (p) { p.textContent = text; p.className = 'adq-progress' + (done ? ' is-done' : ''); }
    var s = document.getElementById(sid);
    if (s) { s.className = 'adq-step-num' + (done ? ' is-done' : ''); s.textContent = done ? '✓' : s.getAttribute('data-n'); }
}
function renderProgress() {
    var q = QUESTIONS.filter(function(x) { return answered(ans(x.id)); }).length;
    setProgress('adq-p1', 'adq-s1', q + ' de ' + QUESTIONS.length + ' respondidas', q === QUESTIONS.length);
    var complete = 0;
    state.students.forEach(function(student) {
        var m = matrixCount(student);
        if (m === ACTIVITIES.length) complete++;
        var el = document.getElementById('adq-mp-' + student.uid);
        if (el) { el.textContent = 'Matriz ' + m + ' de ' + ACTIVITIES.length; el.className = 'adq-progress' + (m === ACTIVITIES.length ? ' is-done' : ''); }
    });
    setProgress('adq-p2', 'adq-s2', complete + ' de ' + state.students.length + ' con matriz completa', complete === state.students.length);
    var sel = state.students.reduce(function(n, s) { return n + countSelected(s); }, 0);
    setProgress('adq-p3', 'adq-s3', sel + ' acordados', sel > 0);
}

function chartStudents() {
    var withMatrix = state.students.filter(function(s) { return matrixCount(s) > 0; });
    var chosen = withMatrix.filter(function(s) { return s.inChart; });
    return chosen.length ? chosen : withMatrix;
}
function studentLevels(student) {
    return ACTIVITIES.map(function(a) { return student.matrix[a.id] ? 4 - student.matrix[a.id] : 0; });
}
function renderChart() {
    var box = document.getElementById('adq-chart');
    var students = chartStudents();
    destroyRadar();
    if (!students.length) {
        box.innerHTML = '<section class="cif-chart-panel cif-chart-empty" aria-labelledby="adq-chart-title"><h3 id="adq-chart-title">Mapa de barreras</h3><p>El mapa aparece cuando digitas la matriz de al menos un estudiante.</p></section>';
        return;
    }
    var view = state.chartView || (students.length > 1 ? 'radar' : 'bars');
    var note = students.length > 3 ? '<p class="small-note cif-radar-note">El radar compara hasta 3 estudiantes. Usa «Incluir en el gráfico» en cada ficha para elegir cuáles, o la vista Detalle.</p>' : '';
    box.innerHTML = '<section class="cif-chart-panel" aria-labelledby="adq-chart-title" data-view="' + view + '">' +
        '<div class="cif-chart-head"><div><h3 id="adq-chart-title">Mapa de barreras</h3>' +
            '<p>Nivel de barrera por actividad según la matriz de psicopedagogía: 0 sin barrera, 1 leve, 2 moderada, 3 significativa.</p></div>' +
            '<div class="cif-view-switch" role="group" aria-label="Tipo de gráfico">' +
                '<button type="button" data-chart-view="radar" aria-pressed="' + (view === 'radar') + '">Comparar</button>' +
                '<button type="button" data-chart-view="bars" aria-pressed="' + (view === 'bars') + '">Detalle</button>' +
            '</div></div>' +
        '<div class="cif-view-radar"' + (view === 'radar' ? '' : ' hidden') + '>' + note + '<div id="adq-radar" class="cif-radar-container"></div></div>' +
        '<div class="cif-view-bars"' + (view === 'bars' ? '' : ' hidden') + '>' + barTable(students) + '</div>' +
    '</section>';
    if (view === 'radar') renderRadar(students.slice(0, 3));
}
function barTable(students) {
    var cols = students.slice(0, 4);
    var head = cols.map(function(s) { return '<th scope="col">' + esc(studentLabel(s, studentIndex(s.uid))) + '</th>'; }).join('');
    var body = ACTIVITIES.map(function(a, ai) {
        var cells = cols.map(function(s) {
            var level = studentLevels(s)[ai];
            var known = !!s.matrix[a.id];
            return '<td><span class="cif-meter" aria-hidden="true"><span class="cif-minibar requirement-level-' + level + '" style="width:' + Math.round(level / 3 * 100) + '%"></span></span>' +
                '<span class="cif-value' + (level ? '' : ' is-zero') + '" aria-hidden="true">' + (known ? level : '–') + '</span>' +
                '<span class="sr-only">' + (known ? LEVEL_NAMES[level] : 'Sin dato') + '</span></td>';
        }).join('');
        return '<tr><th scope="row">' + esc(SHORT[a.id] || a.label) + '</th>' + cells + '</tr>';
    }).join('');
    var legend = '<ul class="cif-legend" aria-label="Niveles de barrera">' + [0, 1, 2, 3].map(function(l) {
        return '<li><span class="cif-swatch requirement-level-' + l + '" aria-hidden="true"></span>' + l + ' · ' + LEVEL_NAMES[l] + '</li>';
    }).join('') + '</ul>';
    return '<div class="cif-chart"><table class="cif-table"><caption class="sr-only">Nivel de barrera por actividad y estudiante, de 0 a 3</caption>' +
        '<thead><tr><th scope="col">Actividad</th>' + head + '</tr></thead><tbody>' + body + '</tbody></table>' + legend +
        (students.length > 4 ? '<p class="small-note">Se muestran los primeros 4 estudiantes. Usa «Incluir en el gráfico» para elegir otros.</p>' : '') + '</div>';
}
function destroyRadar() {
    var c = document.getElementById('adq-radar');
    if (c && c.__chart) { c.__chart.destroy(); c.__chart = null; }
}
function renderRadar(students) {
    var container = document.getElementById('adq-radar');
    if (!container || typeof Chart === 'undefined') {
        if (container) container.innerHTML = '<p class="small-note">El gráfico de radar no está disponible sin conexión. Usa la vista Detalle.</p>';
        return;
    }
    var dark = document.body.classList.contains('theme-dark');
    var theme = {
        text: dark ? '#e8eaed' : '#0d0d0d',
        grid: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)',
        angle: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.18)',
        tick: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
    };
    container.innerHTML = '<div class="cif-radar-card"><div class="cif-radar-body"><div class="cif-radar-wrapper"><canvas></canvas></div><div class="cif-radar-legend-right"></div></div></div>';
    var canvas = container.querySelector('canvas');
    var legend = container.querySelector('.cif-radar-legend-right');
    var datasets = students.map(function(s, i) {
        var color = RADAR_COLORS[i % RADAR_COLORS.length];
        return {
            label: studentLabel(s, studentIndex(s.uid)), data: studentLevels(s),
            borderColor: color, backgroundColor: color + '1A', borderWidth: 2,
            pointBackgroundColor: color, pointBorderColor: '#ffffff', pointBorderWidth: 1.5, pointRadius: 4, pointHoverRadius: 6, fill: true, tension: 0
        };
    });
    try {
        var chart = new Chart(canvas.getContext('2d'), {
            type: 'radar',
            data: { labels: ACTIVITIES.map(function(a) { return SHORT[a.id] || a.label; }), datasets: datasets },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                scales: { r: { min: 0, max: 3,
                    ticks: { stepSize: 1, font: { size: 10 }, color: theme.tick, backdropColor: 'transparent', callback: function(v) { return v > 0 ? String(v) : ''; } },
                    pointLabels: { font: { size: 11, weight: '600' }, color: theme.text },
                    grid: { color: theme.grid }, angleLines: { color: theme.angle } } },
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(ctx) { return ctx.dataset.label + ': ' + LEVEL_NAMES[ctx.raw]; } } } }
            }
        });
        container.__chart = chart;
        legend.innerHTML = '<div class="radar-legend-title">Estudiantes</div>';
        students.forEach(function(s, i) {
            var item = document.createElement('button');
            item.type = 'button';
            item.className = 'radar-legend-item';
            item.setAttribute('aria-pressed', 'true');
            item.innerHTML = '<span class="legend-item-dot" aria-hidden="true" style="background-color:' + RADAR_COLORS[i] + '"></span><span class="legend-item-label">' + esc(datasets[i].label) + '</span>';
            item.addEventListener('click', function() {
                var visible = chart.isDatasetVisible(i);
                chart.setDatasetVisibility(i, !visible);
                item.classList.toggle('radar-hidden', visible);
                item.setAttribute('aria-pressed', String(!visible));
                chart.update();
            });
            legend.appendChild(item);
        });
    } catch (e) {
        container.innerHTML = '<p class="small-note">No se pudo dibujar el radar. Usa la vista Detalle.</p>';
    }
}

function onChange(event) {
    var t = event.target;
    var uid = t.getAttribute('data-uid') ? Number(t.getAttribute('data-uid')) : null;
    var student = uid ? findStudent(uid) : null;
    if (t.hasAttribute('data-question')) return onAnswer(t);
    if (t.hasAttribute('data-matrix') && student) {
        student.matrix[t.getAttribute('data-matrix')] = Number(t.value);
        return renderResults();
    }
    if (t.hasAttribute('data-condition') && student) {
        var c = t.getAttribute('data-condition');
        student.conditions = t.checked ? student.conditions.concat([c]) : student.conditions.filter(function(v) { return v !== c; });
        var o = [];
        CONDITIONS.forEach(function(x) { if (has(student.conditions, x[0])) x[1].forEach(function(v) { if (!has(o, v)) o.push(v); }); });
        student.origins = o;
        var box = document.querySelector('[data-origins="' + uid + '"]');
        if (box) box.querySelectorAll('input').forEach(function(i) { i.checked = has(o, i.getAttribute('data-origin')); });
        return renderResults();
    }
    if (t.hasAttribute('data-origin') && student) {
        var og = t.getAttribute('data-origin');
        student.origins = t.checked ? student.origins.concat([og]) : student.origins.filter(function(v) { return v !== og; });
        return renderResults();
    }
    if (t.hasAttribute('data-select') && student) {
        student.selected[t.getAttribute('data-select')] = t.checked;
        renderCount(student);
        renderWholeClass();
        renderProgress();
        return notifyChange();
    }
    if (t.getAttribute('data-student-field') === 'inChart' && student) {
        student.inChart = t.checked;
        return renderChart();
    }
    if (t.hasAttribute('data-student-field') && student) {
        student[t.getAttribute('data-student-field')] = t.value;
        if (t.getAttribute('data-student-field') === 'name') {
            var i = studentIndex(uid);
            var h = document.getElementById('adq-st-' + uid);
            if (h) h.textContent = studentLabel(student, i);
            renderResults();
        }
    }
}
function onInput(event) {
    var t = event.target;
    if (t.hasAttribute('data-section-field')) { state[t.getAttribute('data-section-field')] = t.value; return; }
    if (t.hasAttribute('data-student-field') && t.getAttribute('data-student-field') !== 'name' && t.type !== 'checkbox') {
        var student = findStudent(Number(t.getAttribute('data-uid')));
        if (student) student[t.getAttribute('data-student-field')] = t.value;
    }
}
function onAnswer(input) {
    var q = QUESTIONS.filter(function(x) { return x.id === input.getAttribute('data-question'); })[0];
    if (!q.multi) {
        state.answers[q.id] = input.value;
    } else {
        var list = state.answers[q.id].slice();
        if (input.checked) {
            if (input.value === 'ninguno') list = ['ninguno'];
            else { list = list.filter(function(v) { return v !== 'ninguno'; }); list.push(input.value); }
        } else {
            list = list.filter(function(v) { return v !== input.value; });
        }
        state.answers[q.id] = list;
        document.querySelectorAll('input[name="adq-q-' + q.id + '"]').forEach(function(i) { i.checked = has(list, i.value); });
    }
    renderResults();
}
function onClick(event) {
    var t = event.target.closest('button');
    if (!t) return;
    if (t.id === 'adq-add-student') {
        if (state.students.length >= MAX_STUDENTS) return;
        state.students.push(newStudent());
        renderStudents(); renderResults();
        var last = state.students[state.students.length - 1];
        var input = document.querySelector('.adq-student[data-uid="' + last.uid + '"] input');
        if (input) input.focus();
        return;
    }
    if (t.hasAttribute('data-remove')) {
        var uid = Number(t.getAttribute('data-remove'));
        var idx = studentIndex(uid);
        window.UiePlannerNotice.askConfirm('¿Quitar a ' + studentLabel(state.students[idx], idx) + ' y su matriz?', function() {
            state.students.splice(idx, 1);
            renderStudents(); renderResults();
        }, 'Quitar');
        return;
    }
    if (t.hasAttribute('data-expand')) {
        var st = findStudent(Number(t.getAttribute('data-uid')));
        var act = t.getAttribute('data-expand');
        st.expanded[act] = !st.expanded[act];
        renderResults();
        var again = document.querySelector('[data-expand="' + act + '"][data-uid="' + st.uid + '"]');
        if (again) again.focus();
        return;
    }
    if (t.hasAttribute('data-chart-view')) {
        state.chartView = t.getAttribute('data-chart-view');
        renderChart();
        var btn = document.querySelector('[data-chart-view="' + state.chartView + '"]');
        if (btn) btn.focus();
        return;
    }
    if (t.id === 'adq-doc-teacher') return openTeacherPlan();
    if (t.id === 'adq-doc-coord') return openCoordinationSheet();
}

function today() {
    return new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fileSlug(text) {
    return (text || 'asignatura').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'asignatura';
}
function formatDate(value) {
    if (!value) return 'sin fecha';
    var p = value.split('-');
    return p.length === 3 ? p[2] + '-' + p[1] + '-' + p[0] : value;
}
function sectionMeta() {
    var parts = [];
    if (state.asignatura.trim()) parts.push('Asignatura: ' + state.asignatura.trim());
    if (state.seccion.trim()) parts.push('Sección: ' + state.seccion.trim());
    if (state.docente.trim()) parts.push('Docente: ' + state.docente.trim());
    return parts.join(' · ');
}
function answerText(q) {
    var v = ans(q.id);
    var list = q.multi ? v : (v ? [v] : []);
    if (!list.length) return 'Sin responder';
    return list.map(function(x) { var o = q.opts.filter(function(p) { return p[0] === x; })[0]; return o ? o[1] : x; }).join(', ');
}
function requireSelection() {
    var total = state.students.reduce(function(n, s) { return n + countSelected(s); }, 0);
    if (!total) {
        window.UiePlannerNotice.showNotice('Marca al menos un apoyo acordado en el paso 3 antes de generar el documento.');
        return false;
    }
    return true;
}

function openTeacherPlan() {
    if (!requireSelection()) return;
    var content = PDF.firstPageHeader(today());
    content.push({ text: 'Plan de apoyo para la asignatura', style: 'mainTitle' });
    if (sectionMeta()) content.push({ text: sectionMeta(), style: 'metaText', margin: [0, 0, 0, 10] });
    content.push({
        table: { widths: ['*'], body: [[{ text: 'Estos apoyos se acordaron con el asesor de inclusión. No cambian los resultados de aprendizaje ni los criterios de evaluación. Información confidencial: úsala solo para planificar la asignatura y no la compartas con terceros.', style: 'bodyText' }]] },
        layout: PDF.boxLayout(), margin: [0, 0, 0, 8]
    });
    var n = 0;
    var repeated = getRepeatedSupports();
    var repeatedIds = repeated.map(function(r) { return r.id; });
    var duaKept = {};
    state.students.forEach(function(student) {
        selectedItems(student).forEach(function(g) { g.items.forEach(function(it) { coveredBy(it).forEach(function(d) { duaKept[d.checkId] = d.text; }); }); });
    });
    var duaKeptList = Object.keys(duaKept).map(function(k) { return duaKept[k]; });
    if (repeated.length || duaKeptList.length) {
        n++;
        content.push(PDF.sectionTitle(n, 'Para todo el curso'));
        if (repeated.length) {
            content.push({ text: 'Apoyos acordados para varios estudiantes. Conviene aplicarlos a todo el curso:', style: 'bodyText' });
            content.push(PDF.bulletList(repeated.map(function(r) {
                var stack = [{ text: r.texto }];
                if (r.item.noCambia) stack.push({ text: 'No cambia: ' + r.item.noCambia, style: 'metaText' });
                return { stack: stack, margin: [0, 0, 0, 4] };
            })));
        }
        if (duaKeptList.length) {
            content.push({ text: 'Acciones de su planificación DUA que ya responden a lo que necesitan estos estudiantes. Basta con mantenerlas:', style: 'bodyText', margin: [0, 6, 0, 2] });
            content.push(PDF.bulletList(duaKeptList));
        }
    }
    state.students.forEach(function(student, index) {
        var groups = selectedItems(student).map(function(g) {
            return { act: g.act, level: g.level, items: g.items.filter(function(it) { return repeatedIds.indexOf(it.id) === -1; }) };
        }).filter(function(g) { return g.items.length; });
        if (!groups.length) return;
        n++;
        content.push(PDF.sectionTitle(n, studentLabel(student, index)));
        if (student.funciona.trim() || student.evitar.trim()) {
            var voice = [];
            if (student.funciona.trim()) voice.push({ text: [{ text: 'Le funciona: ', bold: true }, student.funciona.trim()] });
            if (student.evitar.trim()) voice.push({ text: [{ text: 'Prefiere evitar: ', bold: true }, student.evitar.trim()] });
            content.push({ stack: voice, style: 'noteText' });
        }
        groups.forEach(function(g) {
            content.push({ text: [LABELS[g.act], { text: '   Barrera ' + LEVEL_NAMES[g.level].toLowerCase(), fontSize: 9, bold: true, color: PDF.LEVELS[g.level].text }], style: 'categoryTitle' });
            content.push(PDF.bulletList(g.items.map(function(it) {
                var stack = [{ text: it.texto }];
                if (it.noCambia) stack.push({ text: 'No cambia: ' + it.noCambia, style: 'metaText' });
                var rv = reviewFor(it);
                if (rv.length) stack.push({ text: 'Revisar con el docente: cambia ' + rv.join(' y ') + ', que la asignatura evalúa.', fontSize: 9, bold: true, color: '#8A5A00', margin: [0, 1, 0, 2] });
                if (coveredBy(it).length) stack.push({ text: 'Ya está en su planificación DUA.', style: 'metaText' });
                return { stack: stack, margin: [0, 0, 0, 4] };
            })));
        });
    });
    content.push(PDF.sectionTitle(n + 1, 'Seguimiento'));
    content.push({ stack: [
        { text: 'Revisar con el asesor de inclusión, dentro de las próximas cuatro semanas, si los apoyos funcionan. Si algo no resulta, se ajusta en conjunto.', style: 'bodyText' },
        { table: { widths: [90, '*', '*'], body: [
            [{ text: 'Fecha', style: 'tableHeader' }, { text: 'Qué funcionó', style: 'tableHeader' }, { text: 'Qué ajustar', style: 'tableHeader' }],
            [{ text: ' ', margin: [0, 10] }, '', ''], [{ text: ' ', margin: [0, 10] }, '', '']
        ] }, layout: PDF.tableLayout(), margin: [0, 6, 0, 0] }
    ], unbreakable: true });
    PDF.preview({ content: content }, 'plan-docente-' + fileSlug(state.asignatura) + '.pdf', { title: 'Plan para el docente' });
}

function openCoordinationSheet() {
    if (!state.students.some(function(s) { return matrixCount(s) > 0; })) {
        window.UiePlannerNotice.showNotice('Digita la matriz de al menos un estudiante antes de generar la ficha de coordinación.');
        return;
    }
    var content = PDF.firstPageHeader(today());
    content.push({ text: 'Ficha de coordinación', style: 'mainTitle' });
    content.push({ text: (sectionMeta() ? sectionMeta() + ' · ' : '') + 'Uso interno UIE', style: 'metaText', margin: [0, 0, 0, 10] });
    content.push({
        table: { widths: ['*'], body: [[{ text: 'Contiene datos sensibles (Ley 21.719). Guárdala solo en los registros de la Unidad de Inclusión Educativa. Al docente se entrega el plan para el docente, que no incluye la condición ni la matriz.', style: 'bodyText' }]] },
        layout: PDF.boxLayout(), margin: [0, 0, 0, 8]
    });
    content.push(PDF.sectionTitle(1, 'Contexto de la asignatura'));
    content.push({
        table: { widths: [190, '*'], body: QUESTIONS.map(function(q) {
            return [{ text: q.text, style: 'tableCell', color: '#4B5563' }, { text: answerText(q), style: 'tableCell' }];
        }) },
        layout: PDF.tableLayout({ compact: true })
    });
    var withMatrix = state.students.filter(function(s) { return matrixCount(s) > 0; });
    content.push(PDF.sectionTitle(2, 'Mapa de barreras'));
    for (var start = 0; start < withMatrix.length; start += 4) {
        PDF.levelBarChart(ACTIVITIES.map(function(a) { return SHORT[a.id] || a.label; }), withMatrix.slice(start, start + 4).map(function(s) {
            return { label: studentLabel(s, studentIndex(s.uid)), values: studentLevels(s) };
        })).forEach(function(node) { content.push(node); });
    }
    var num = 3;
    var repeatedIds = getRepeatedSupports().map(function(r) { return r.id; });
    state.students.forEach(function(student, index) {
        if (!matrixCount(student)) return;
        var R = lastResults[student.uid] || compute(student);
        content.push(PDF.sectionTitle(num++, studentLabel(student, index)));
        var info = [];
        if (student.carrera.trim()) info.push('Carrera: ' + student.carrera.trim());
        info.push('Matriz entregada por ' + (student.entregadaPor.trim() || 'psicopedagogía') + ' · entrevista PAEDIS: ' + formatDate(student.fecha) + ' · ' + student.vigencia);
        content.push({ text: info.join('\n'), style: 'metaText', margin: [0, 0, 0, 6] });
        var conds = student.conditions.length ? student.conditions.join(', ') : 'Sin condición informada';
        var origs = student.origins.length ? student.origins.map(function(o) { return ORIGINS.filter(function(x) { return x[0] === o; })[0][1]; }).join(', ') : 'Sin informar';
        content.push({ text: [{ text: 'Condición: ', bold: true }, conds, '\n', { text: 'Origen de la barrera: ', bold: true }, origs], style: 'bodyText', margin: [0, 0, 0, 6] });
        var rows = [[{ text: 'Actividad', style: 'tableHeader' }, { text: 'Matriz (4 a 1)', style: 'tableHeader' }, { text: 'Nivel de barrera', style: 'tableHeader' }]];
        ACTIVITIES.forEach(function(a) {
            var v = student.matrix[a.id];
            rows.push([{ text: a.label, style: 'tableCell' }, { text: v ? String(v) : 'Sin dato', style: 'tableCell' }, { text: v ? LEVEL_NAMES[4 - v] : '—', style: 'tableCell' }]);
        });
        Object.keys(DERIVED).forEach(function(k) {
            if (R.L.active[k]) rows.push([{ text: DERIVED[k].label + ' (derivada)', style: 'tableCell', italics: true }, { text: '—', style: 'tableCell' }, { text: LEVEL_NAMES[R.L.lv[k]], style: 'tableCell' }]);
        });
        content.push({ table: { headerRows: 1, widths: ['*', 80, 100], body: rows }, layout: PDF.tableLayout({ compact: true }) });
        var groups = selectedItems(student);
        var coord = [], review = [];
        groups.forEach(function(g) { g.items.forEach(function(it) {
            coordFor(it).forEach(function(c) { if (!has(coord, c)) coord.push(c); });
            if (reviewFor(it).length) review.push(it.texto + ' (' + reviewFor(it).join(' y ') + ')');
        }); });
        content.push({ text: 'Por coordinar', style: 'subSectionTitle' });
        content.push(coord.length ? PDF.bulletList(coord) : { text: 'Nada pendiente según las preguntas.', style: 'bodyText' });
        content.push({ text: 'Apoyos que tocan lo que se evalúa', style: 'subSectionTitle' });
        content.push(review.length ? PDF.bulletList(review) : { text: 'Ninguno.', style: 'bodyText' });
        content.push({ text: 'Apoyos acordados', style: 'subSectionTitle' });
        if (groups.length) {
            groups.forEach(function(g) {
                content.push({ text: LABELS[g.act] + ' · barrera ' + LEVEL_NAMES[g.level].toLowerCase(), style: 'categoryTitle' });
                content.push(PDF.bulletList(g.items.map(function(it) { return it.texto + '  [' + it.id + ']' + (repeatedIds.indexOf(it.id) !== -1 ? '  · para todo el curso' : '') + (coveredBy(it).length ? '  · ya en base DUA' : ''); })));
            });
        } else {
            content.push({ text: 'Aún no hay apoyos acordados.', style: 'bodyText' });
        }
        if (student.funciona.trim() || student.evitar.trim()) {
            content.push({ text: 'Lo que dice el estudiante', style: 'subSectionTitle' });
            content.push({ text: [{ text: 'Le funciona: ', bold: true }, student.funciona.trim() || '—', '\n', { text: 'Prefiere evitar: ', bold: true }, student.evitar.trim() || '—'], style: 'bodyText' });
        }
    });
    content.push(PDF.sectionTitle(num, 'Seguimiento'));
    content.push({
        table: { widths: [70, 90, '*', '*'], body: [
            [{ text: 'Fecha', style: 'tableHeader' }, { text: 'Con quién', style: 'tableHeader' }, { text: 'Qué funcionó', style: 'tableHeader' }, { text: 'Qué ajustar', style: 'tableHeader' }],
            [{ text: ' ', margin: [0, 10] }, '', '', ''], [{ text: ' ', margin: [0, 10] }, '', '', ''], [{ text: ' ', margin: [0, 10] }, '', '', '']
        ] },
        layout: PDF.tableLayout()
    });
    content.push({ text: 'Catálogo de apoyos en revisión por el equipo de asesores (' + ((window.UiePlannerCatalog && window.UiePlannerCatalog.version) || '') + '). Los códigos entre corchetes identifican cada apoyo en el catálogo.', style: 'sourceText', margin: [0, 10, 0, 0] });
    PDF.preview({ content: content }, 'ficha-coordinacion-' + fileSlug(state.asignatura) + '.pdf', { title: 'Ficha de coordinación' });
}

function init() {
    var root = document.getElementById('adecuaciones-app');
    if (!root || root.dataset.ready === 'true') return;
    root.dataset.ready = 'true';
    state.students.push(newStudent());
    renderShell(root);
    renderStudents();
    renderResults();
    root.addEventListener('change', onChange);
    root.addEventListener('input', onInput);
    root.addEventListener('click', onClick);
    document.addEventListener('uie-theme-change', function() { if (document.getElementById('adq-radar')) renderChart(); });
    document.addEventListener('uie-dua-change', renderResults);
}

window.UiePlannerAdecuaciones = {
    init: init,
    getState: function() { return state; },
    getRepeatedSupports: getRepeatedSupports,
    compute: compute
};
})();
