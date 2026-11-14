(function () {
const { duaStagesData, duaPrinciples } = window.UiePlannerData;
const { bindTabs } = window.UiePlannerTabs;

function renderDua(onChecklistChange = () => {}) {
    const tabs = document.getElementById('dua-tabs');
    const panels = document.getElementById('dua-panels');
    if (!tabs || !panels) return;

    tabs.innerHTML = duaStagesData.map((stage, index) => `
        <button class="tab-link ${index === 0 ? 'active' : ''}" id="tab-${stage.id}" type="button" role="tab" aria-selected="${index === 0}" aria-controls="panel-${stage.id}">
            <span class="tab-num">${index + 1}</span>${stage.label}
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
        </div>
    `).join('');

    bindTabs(tabs, panels);
    bindChecklist(onChecklistChange);
}

function bindChecklist(onChecklistChange) {
    const checkboxes = Array.from(document.querySelectorAll('.DUA-checkbox'));
    const savedState = JSON.parse(localStorage.getItem('dua-checklist-state') || '{}');
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
    localStorage.setItem('dua-checklist-state', JSON.stringify(state));
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
    renderCoverage();
}

function getPrincipleCoverage() {
    const checkboxes = Array.from(document.querySelectorAll('.DUA-checkbox'));
    return ['compromiso', 'representacion', 'accion'].map(key => {
        const boxes = checkboxes.filter(box => box.dataset.principle === key);
        const checked = boxes.filter(box => box.checked).length;
        return { key, label: duaPrinciples[key].label, text: duaPrinciples[key].text, checked, total: boxes.length, status: checked >= 2 ? 'cubierto' : checked === 1 ? 'inicial' : 'pendiente' };
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
    const statusText = { cubierto: 'Cubierto', inicial: 'Inicial', pendiente: 'Sin acciones' };
    const rows = coverage.map(item => `
        <li class="dua-principle is-${item.status}">
            <div class="dua-principle-head"><strong>${item.label}</strong><span class="dua-principle-status">${statusText[item.status]}</span></div>
            <span class="dua-principle-count">${item.checked} de ${item.total} acciones</span>
            <p>${item.text}</p>
        </li>`).join('');
    const repeated = window.UiePlannerAdecuaciones && window.UiePlannerAdecuaciones.getRepeatedSupports ? window.UiePlannerAdecuaciones.getRepeatedSupports() : [];
    const fromSupports = repeated.length ? `
        <div class="dua-from-supports">
            <h4>Desde adecuaciones</h4>
            <p>${repeated.length === 1 ? 'Un apoyo se acordó' : repeated.length + ' apoyos se acordaron'} para dos o más estudiantes. Conviene incorporarlos a la planificación de toda la clase:</p>
            <ul>${repeated.map(r => `<li>${escapeText(r.texto)}</li>`).join('')}</ul>
        </div>` : '';
    box.innerHTML = `
        <h3 id="dua-coverage-title">Cobertura DUA 3.0</h3>
        <p class="dua-coverage-level"><strong>${level.label}.</strong> ${level.text}</p>
        <p class="dua-coverage-count">${checked === 1 ? '1 acción seleccionada' : checked + ' acciones seleccionadas'}</p>
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
            label: 'Base por definir',
            text: 'Marca lo que planificas hacer. La cobertura se mide por principio, no por cantidad.'
        };
    }
    const coverage = getPrincipleCoverage();
    const missing = coverage.filter(item => item.status === 'pendiente').map(item => item.label.toLowerCase());
    const partial = coverage.filter(item => item.status === 'inicial').map(item => item.label.toLowerCase());
    if (missing.length) {
        return {
            label: 'Base parcial',
            text: `Falta ${missing.join(' y ')}. Un principio sin acciones deja barreras sin atender para todo el curso.`
        };
    }
    if (partial.length) {
        return {
            label: 'Base en desarrollo',
            text: `Los tres principios tienen acciones, pero ${partial.join(' y ')} ${partial.length > 1 ? 'tienen' : 'tiene'} solo una.`
        };
    }
    return {
        label: 'Base que cubre los tres principios',
        text: 'Continúa con adecuaciones solo si alguna barrera persiste para un estudiante.'
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
    localStorage.removeItem('dua-checklist-state');
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
