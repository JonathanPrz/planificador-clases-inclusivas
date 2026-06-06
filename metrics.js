(function() {
var config = window.UIE_METRICS_CONFIG || {};
var visitKey = 'uie-metrics-visit-counted';
var heartKey = 'uie-metrics-heart-given';
var placeholderValues = ['CLARITY_PROJECT_ID', 'https://TU-PROYECTO.supabase.co', 'SUPABASE_ANON_KEY', ''];
var currentSection = null;
var currentSectionView = null;
var currentSectionStartedAt = 0;
var minimumSectionSeconds = 2;

function isConfigured(value) {
    return value && placeholderValues.indexOf(value) === -1;
}

function hasSupabaseConfig() {
    return isConfigured(config.supabaseUrl) && isConfigured(config.supabaseAnonKey);
}

function hasClarityConfig() {
    return isConfigured(config.clarityProjectId);
}

function cleanTagValue(value) {
    if (value === undefined || value === null || value === '') return '';
    if (Array.isArray(value)) return value.join(',').slice(0, 120);
    return String(value).slice(0, 80);
}

function setClarityTags(params) {
    if (!window.clarity || !params) return;
    Object.keys(params).forEach(function(key) {
        var value = cleanTagValue(params[key]);
        if (!value) return;
        window.clarity('set', 'uie_' + key, value);
    });
}

function initClarity() {
    if (!hasClarityConfig()) return;
    if (window.clarity && window.clarity.loadedByUie) return;
    (function(c, l, a, r, i, t, y) {
        c[a] = c[a] || function() {
            (c[a].q = c[a].q || []).push(arguments);
        };
        c[a].loadedByUie = true;
        t = l.createElement(r);
        t.async = 1;
        t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', config.clarityProjectId);
}

function trackMetric(eventName, params) {
    if (!eventName || !window.clarity) return;
    setClarityTags(params);
    window.clarity('event', eventName);
}

function flushSectionTime(reason) {
    if (!currentSection || !currentSectionStartedAt) return;
    var durationSeconds = Math.round((Date.now() - currentSectionStartedAt) / 1000);
    if (durationSeconds < minimumSectionSeconds) return;
    trackMetric('section_time', {
        section_id: currentSection,
        view_group: currentSectionView,
        duration_seconds: durationSeconds,
        leave_reason: reason || 'navigation'
    });
}

function trackSectionView(sectionId, view) {
    if (currentSection && currentSection !== sectionId) {
        flushSectionTime('navigation');
    }
    currentSection = sectionId;
    currentSectionView = view;
    currentSectionStartedAt = Date.now();
    trackMetric('section_view', {
        section_id: sectionId,
        view_group: view,
        path: window.location.pathname + window.location.hash
    });
}

function getConditionGroups(conditionKeys) {
    var groups = [];
    var map = {
        fisica: 'fisica',
        tactil: 'fisica',
        vestibular: 'fisica',
        visual: 'sensorial',
        auditiva: 'sensorial',
        sordoceguera: 'sensorial',
        autismo: 'neurodesarrollo',
        intelectual: 'intelectual',
        psiquica: 'psiquica',
        visceral: 'visceral'
    };
    (conditionKeys || []).forEach(function(key) {
        var group = map[key] || 'otra';
        if (groups.indexOf(group) === -1) groups.push(group);
    });
    return groups.sort();
}

function rpc(name) {
    if (!hasSupabaseConfig()) return Promise.reject(new Error('Supabase no configurado'));
    return fetch(config.supabaseUrl.replace(/\/$/, '') + '/rest/v1/rpc/' + name, {
        method: 'POST',
        headers: {
            apikey: config.supabaseAnonKey,
            Authorization: 'Bearer ' + config.supabaseAnonKey,
            'Content-Type': 'application/json'
        },
        body: '{}'
    }).then(function(response) {
        if (!response.ok) throw new Error('Error Supabase ' + response.status);
        return response.json();
    });
}

function normalizeMetrics(data) {
    var value = Array.isArray(data) ? data[0] : data;
    return {
        visits: Number((value && value.visits) || 0),
        hearts: Number((value && value.hearts) || 0)
    };
}

function updateMetricText(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = typeof value === 'number' ? value.toLocaleString('es-CL') : value;
}

function setMetricsNote(text) {
    var note = document.getElementById('metrics-note');
    if (note) note.textContent = text;
}

function loadPublicMetrics() {
    if (!hasSupabaseConfig()) {
        updateMetricText('metric-visits', '-');
        updateMetricText('metric-hearts', '-');
        setMetricsNote('Métricas anónimas del piloto. Configura Supabase para activar el contador.');
        var btn = document.getElementById('btn-site-heart');
        if (btn) btn.disabled = true;
        return Promise.resolve();
    }
    return rpc('get_public_metrics').then(function(data) {
        var metrics = normalizeMetrics(data);
        updateMetricText('metric-visits', metrics.visits);
        updateMetricText('metric-hearts', metrics.hearts);
        setMetricsNote('Métricas anónimas del piloto.');
    }).catch(function(error) {
        console.warn('No se pudieron cargar métricas públicas.', error);
        setMetricsNote('Métricas no disponibles por ahora.');
    });
}

function countVisitOnce() {
    if (!hasSupabaseConfig() || sessionStorage.getItem(visitKey) === 'true') return;
    sessionStorage.setItem(visitKey, 'true');
    rpc('increment_visit').then(loadPublicMetrics).catch(function(error) {
        console.warn('No se pudo registrar visita.', error);
    });
}

function bindHeartButton() {
    var btn = document.getElementById('btn-site-heart');
    if (!btn) return;
    if (localStorage.getItem(heartKey) === 'true') {
        btn.textContent = '♥ Gracias';
        btn.setAttribute('aria-pressed', 'true');
        btn.classList.add('liked');
    }
    btn.addEventListener('click', function() {
        if (!hasSupabaseConfig() || localStorage.getItem(heartKey) === 'true') return;
        btn.disabled = true;
        rpc('increment_heart').then(function() {
            localStorage.setItem(heartKey, 'true');
            btn.textContent = '♥ Gracias';
            btn.setAttribute('aria-pressed', 'true');
            btn.classList.add('liked');
            trackMetric('site_heart_given');
            return loadPublicMetrics();
        }).catch(function(error) {
            console.warn('No se pudo registrar corazón.', error);
        }).finally(function() {
            btn.disabled = false;
        });
    });
}

function bindMetricActions() {
    document.querySelectorAll('[data-metric-action]').forEach(function(el) {
        if (el.dataset.metricBound === 'true') return;
        el.dataset.metricBound = 'true';
        el.addEventListener('click', function() {
            trackMetric(el.getAttribute('data-metric-action'));
        });
    });
}

function initMetrics() {
    initClarity();
    bindMetricActions();
    bindHeartButton();
    loadPublicMetrics().then(countVisitOnce);
    window.addEventListener('pagehide', function() {
        flushSectionTime('pagehide');
    });
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') flushSectionTime('hidden');
    });
}

window.UiePlannerMetrics = {
    initMetrics: initMetrics,
    trackMetric: trackMetric,
    trackSectionView: trackSectionView,
    getConditionGroups: getConditionGroups
};
})();
