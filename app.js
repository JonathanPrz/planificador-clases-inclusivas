(function () {
const { glossaryData, vocabularyData } = window.UiePlannerData;
const { initTheme } = window.UiePlannerTheme;
const { renderGlossary, renderReferences, renderVocabulary, filterLanguageContent } = window.UiePlannerContent;
const { renderDua, resetDuaChecklist } = window.UiePlannerDua;
const { renderGoodPractices, renderSupports, initConditionPills } = window.UiePlannerSupports;
const { bindSectionNavigation } = window.UiePlannerNavigation;

function initApp() {
    if (document.body.dataset.appReady === 'true') return;
    document.body.dataset.appReady = 'true';
    initTheme();
    renderDua();
    renderSupports();
    renderGoodPractices();
    renderVocabulary(vocabularyData);
    renderGlossary(glossaryData);
    renderReferences();
    bindGlobalActions();
    bindSectionNavigation();
    initConditionPills();
    window.UiePlannerSupports.initJustificationModal();
    initRadarThemeObserver();
}

function initRadarThemeObserver() {
    if (document.body.dataset.radarObserver === 'true') return;
    document.body.dataset.radarObserver = 'true';
    var renderFn = window.UiePlannerSupports.renderCIFRadarChart;
    if (!renderFn) return;
    var observer = new MutationObserver(function() {
        if (!document.body.classList.contains('theme-dark') && !document.body.classList.contains('theme-light')) return;
        var containers = document.querySelectorAll('[id^="cif-radar-"]');
        containers.forEach(function(container) {
            var prevChart = container.__cifRadarChart;
            if (prevChart) {
                prevChart.destroy();
                container.__cifRadarChart = null;
            }
            var students = container.__radarStudents;
            var options = container.__radarOptions || {};
            if (students && students.length && container.id) {
                renderFn(students, container.id, options);
            }
        });
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

function bindGlobalActions() {
    var reset = document.getElementById('btn-reset-checklist');
    var search = document.getElementById('vocab-search');
    var duaDownload = document.getElementById('btn-download-dua');

    if (reset) {
        reset.addEventListener('click', function() {
            if (confirm('¿Limpiar todas las decisiones DUA seleccionadas?')) {
                resetDuaChecklist();
            }
        });
    }

    if (search) {
        search.addEventListener('input', function() { filterLanguageContent(search.value); });
    }

    if (duaDownload) {
        duaDownload.addEventListener('click', function() {
            if (!window.UiePlannerSupports) {
                alert('Error: El módulo de apoyos no está cargado.');
                return;
            }
            if (typeof window.UiePlannerSupports.downloadDuaChecklist === 'function') {
                try {
                    window.UiePlannerSupports.downloadDuaChecklist();
                } catch (e) {
                    console.error('Error al descargar checklist:', e);
                    alert('Error al generar el PDF: ' + e.message);
                }
            } else {
                alert('El generador de PDF no está disponible.');
            }
        });
    }
}

try {
    initApp();
} catch (error) {
    console.error('No se pudo inicializar el planificador inclusivo.', error);
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
})();
