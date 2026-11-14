(function () {
const { duaStagesData, duaPrinciples } = window.UiePlannerData;
const { bindTabs } = window.UiePlannerTabs;

function renderDua(onChecklistChange = () => {}) {
    const tabs = document.getElementById('dua-tabs');
    const panels = document.getElementById('dua-panels');
    if (!tabs || !panels) return;

    tabs.innerHTML = duaStagesData.map((stage, index) => `
        <button class="tab-link ${index === 0 ? 'active is-visited' : ''}" id="tab-${stage.id}" type="button" role="tab" aria-selected="${index === 0}" aria-controls="panel-${stage.id}" data-stage-tab="${stage.id}">
            <span class="tab-num">${index + 1}</span>${stage.label}
            <span class="tab-count" data-count-for="${stage.id}"></span>
        </button>
    `).join('');

    panels.innerHTML = duaStagesData.map((stage, index) => `
        <div class="tab-panel ${index === 0 ? 'active' : ''}" id="panel-${stage.id}" data-stage="${stage.id}" role="tabpanel" aria-labelledby="tab-${stage.id}" ${index === 0 ? '' : 'hidden'}>
            <div class="panel-intro">
                <div>
                    <span class="badge-stage">${stage.when}</span>
                    <h3>${stage.label}</h3>
                    <p>${stage.intro}</p>
                </div>
                <span class="source-pill">${stage.source}</span>
            </div>
            <div class="focus-grid">
                ${stage.focus.map(item => `<div class="focus-card">${item}</div>`).join('')}
            </div>
            <div class="checklist-items">
                ${stage.checklist.map((item, itemIndex) => {
                    const principle = (stage.principles || [])[itemIndex] || 'base';
                    return `
                    <label class="check-item">
                        <input type="checkbox" class="DUA-checkbox" data-check-id="${stage.id}-${itemIndex}" data-principle="${principle}">
                        <span class="check-box-custom"></span>
                        <span class="check-content">
                            <span class="check-text">${item}</span>
                            <span class="check-principle check-principle-${principle}">${duaPrinciples[principle].short}</span>
                        </span>
                    </label>`;
                }).join('')}
            </div>
            <div class="example-box">
                <strong>Ejemplo aplicado:</strong>
                <p>${stage.example}</p>
            </div>
            <div class="stage-next">
                ${index < duaStagesData.length - 1
                    ? `<span>Siguiente etapa: <strong>${duaStagesData[index + 1].label}</strong> · ${duaStagesData[index + 1].when.toLowerCase()}</span>
                       <button class="btn btn-primary" type="button" data-go-stage="${duaStagesData[index + 1].id}">Continuar con ${duaStagesData[index + 1].label}</button>`
                    : `<span>Es la última etapa. Revisa la cobertura y descarga tu planificación.</span>
                       <button class="btn btn-secondary" type="button" data-go-stage="${duaStagesData[0].id}">Volver a Exploración</button>`}
            </div>
        </div>
    `).join('');

    bindTabs(tabs, panels);
    bindChecklist(onChecklistChange);
    tabs.addEventListener('click', event => {
        const tab = event.target.closest('[data-stage-tab]');
        if (tab) markVisited(tab.dataset.stageTab);
    });
    tabs.addEventListener('keyup', () => {
        const active = tabs.querySelector('[aria-selected="true"]');
        if (active) markVisited(active.dataset.stageTab);
    });
    document.addEventListener('click', event => {
        const go = event.target.closest('[data-go-stage]');
        if (!go) return;
        goToStage(go.dataset.goStage);
    });
}

function goToStage(stageId) {
    const tab = document.getElementById('tab-' + stageId);
    if (!tab) return;
    tab.click();
    tab.focus();
    const nav = document.getElementById('dua-tabs');
    if (nav) nav.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function markVisited(stageId) {
    const tab = document.getElementById('tab-' + stageId);
    if (tab && !tab.classList.contains('is-visited')) {
        tab.classList.add('is-visited');
        renderCoverage();
    }
}

function updateStageCounts() {
    duaStagesData.forEach(stage => {
        const badge = document.querySelector(`[data-count-for="${stage.id}"]`);
        if (!badge) return;
        const checked = document.querySelectorAll(`#panel-${stage.id} .DUA-checkbox:checked`).length;
        badge.textContent = checked ? String(checked) : '';
        badge.hidden = !checked;
        badge.setAttribute('aria-label', checked === 1 ? '1 acción marcada' : `${checked} acciones marcadas`);
    });
}

function bindChecklist(onChecklistChange) {
    const checkboxes = Array.from(document.querySelectorAll('.DUA-checkbox'));
    const savedState = JSON.parse(localStorage.getItem('dua-checklist-state-v2') || '{}');
    checkboxes.forEach(box => {
        box.checked = Boolean(savedState[box.dataset.checkId]);
        box.addEventListener('change', () => {
            saveChecklistState();
            updateProgress();
            onChecklistChange();
            document.dispatchEvent(new CustomEvent('uie-dua-change'));
        });
    });
    updateProgress();

    window.addEventListener('beforeunload', saveChecklistState);
}

function saveChecklistState() {
    const checkboxes = Array.from(document.querySelectorAll('.DUA-checkbox'));
    const state = {};
    checkboxes.forEach(function(item) {
        state[item.dataset.checkId] = item.checked;
    });
    localStorage.setItem('dua-checklist-state-v2', JSON.stringify(state));
}

function updateProgress() {
    const checkboxes = Array.from(document.querySelectorAll('.DUA-checkbox'));
    const progressText = document.getElementById('progress-text');
    const progressHelper = document.getElementById('progress-helper');
    if (!checkboxes.length) return;
    const checkedCount = checkboxes.filter(box => box.checked).length;
    const level = getDuaCoverageLevel(checkedCount, checkboxes.length);
    if (progressText) {
        progressText.textContent = checkedCount === 1
            ? '1 decisión seleccionada'
            : `${checkedCount} decisiones seleccionadas`;
    }
    if (progressHelper) progressHelper.textContent = `${level.label}: ${level.text}`;
    updateStageCounts();
    renderCoverage();
}

const PRINCIPLE_QUESTIONS = {
    compromiso: '¿Hay algo que pueda despertar interés, dar sentido o hacer sentir parte del curso en esta clase?',
    representacion: '¿Conviene presentar algún contenido de otra forma o apoyar su comprensión?',
    accion: '¿Conviene abrir otra forma de responder, practicar o demostrar lo aprendido?'
};

function getPrincipleCoverage() {
    const checkboxes = Array.from(document.querySelectorAll('.DUA-checkbox'));
    return ['compromiso', 'representacion', 'accion'].map(key => {
        const boxes = checkboxes.filter(box => box.dataset.principle === key);
        const checked = boxes.filter(box => box.checked).length;
        return { key, label: duaPrinciples[key].label, text: duaPrinciples[key].text, question: PRINCIPLE_QUESTIONS[key], checked, total: boxes.length, status: checked ? 'elegido' : 'vacio' };
    });
}

function escapeText(value) {
    return String(value).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function renderCoverage() {
    const box = document.getElementById('dua-coverage');
    if (!box) return;
    const coverage = getPrincipleCoverage();
    const checked = document.querySelectorAll('.DUA-checkbox:checked').length;
    const level = getDuaCoverageLevel(checked);
    const rows = coverage.map(item => `
        <li class="dua-principle is-${item.status}">
            <div class="dua-principle-head"><strong>${item.label}</strong><span class="dua-principle-status">${item.checked ? (item.checked === 1 ? '1 elegida' : item.checked + ' elegidas') : 'Sin elegir'}</span></div>
            <p>${item.checked ? item.text : item.question}</p>
        </li>`).join('');
    const repeated = window.UiePlannerAdecuaciones && window.UiePlannerAdecuaciones.getRepeatedSupports ? window.UiePlannerAdecuaciones.getRepeatedSupports() : [];
    const fromSupports = repeated.length ? `
        <div class="dua-from-supports">
            <h4>Desde adecuaciones</h4>
            <p>${repeated.length === 1 ? 'Un apoyo se acordó' : repeated.length + ' apoyos se acordaron'} para dos o más estudiantes. Conviene incorporarlos a la planificación de toda la clase:</p>
            <ul>${repeated.map(r => `<li>${escapeText(r.texto)}</li>`).join('')}</ul>
        </div>` : '';
    const pending = duaStagesData.filter(stage => {
        const tab = document.getElementById('tab-' + stage.id);
        return tab && !tab.classList.contains('is-visited');
    });
    const stagesNote = pending.length
        ? `<div class="dua-pending"><strong>Etapas que aún no abres:</strong> ${pending.map(stage => `<button type="button" class="dua-pending-link" data-go-stage="${stage.id}">${stage.label}</button>`).join(' ')}</div>`
        : '<div class="dua-pending is-done">Revisaste las cuatro etapas.</div>';
    box.innerHTML = `
        <h3 id="dua-coverage-title">Tu selección por principio</h3>
        <p class="dua-coverage-intro">No hace falta marcarlo todo: elige lo que esta clase necesita.</p>
        ${stagesNote}
        <p class="dua-coverage-level"><strong>${level.label}.</strong> ${level.text}</p>
        <ul class="dua-principles">${rows}</ul>
        ${fromSupports}`;
}

function getDuaStageSummary() {
    const items = getCheckedDuaItems();
    const stages = duaStagesData.map(stage => {
        const stageItems = items.filter(item => item.stageId === stage.id);
        const total = stage.checklist.length;
        const checked = stageItems.length;
        const percentage = total ? Math.round((checked / total) * 100) : 0;
        return {
            id: stage.id,
            label: stage.label,
            checked,
            total,
            percentage,
            items: stageItems
        };
    });
    const total = stages.reduce((sum, stage) => sum + stage.total, 0);
    const checked = stages.reduce((sum, stage) => sum + stage.checked, 0);
    const percentage = total ? Math.round((checked / total) * 100) : 0;
    const level = getDuaCoverageLevel(checked, total);
    return { checked, total, percentage, level, stages };
}

function getDuaCoverageLevel(checked) {
    if (!checked) {
        return {
            label: 'Sin selección todavía',
            text: 'Recorre las etapas y marca lo que planificas hacer.'
        };
    }
    const coverage = getPrincipleCoverage();
    const empty = coverage.filter(item => item.status === 'vacio').map(item => item.label.toLowerCase());
    if (empty.length) {
        return {
            label: 'Para revisar',
            text: `Aún no eliges acciones de ${empty.join(' ni de ')}. Puede estar bien; revisa si alguna sirve a esta clase.`
        };
    }
    return {
        label: 'Los tres principios están presentes',
        text: 'Tu clase ofrece opciones para el interés, la comprensión y la expresión.'
    };
}

function getCheckedDuaItems() {
    return Array.from(document.querySelectorAll('.DUA-checkbox:checked')).map(box => {
        const panel = box.closest('.tab-panel');
        const stageId = panel?.dataset.stage;
        const stageData = duaStagesData.find(stage => stage.id === stageId);
        const stage = stageData?.label || (panel ? document.querySelector(`[aria-controls="${panel.id}"]`)?.textContent.trim().replace(/^\d+/, '').trim() : 'DUA');
        const text = box.closest('.check-item')?.querySelector('.check-text')?.textContent.trim() || '';
        return { stage, stageId, text, checkId: box.dataset.checkId, principle: box.dataset.principle };
    }).filter(item => item.text);
}

function resetDuaChecklist(onChecklistChange = () => {}) {
    document.querySelectorAll('.DUA-checkbox').forEach(box => {
        box.checked = false;
    });
    localStorage.removeItem('dua-checklist-state-v2');
    updateProgress();
    onChecklistChange();
    document.dispatchEvent(new CustomEvent('uie-dua-change'));
}

document.addEventListener('uie-adecuaciones-change', renderCoverage);

window.UiePlannerDua = {
    getPrincipleCoverage,
    renderDua,
    resetDuaChecklist,
    updateProgress,
    getDuaStageSummary,
    getDuaCoverageLevel,
    getCheckedDuaItems
};

})();
