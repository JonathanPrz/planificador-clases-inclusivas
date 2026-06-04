(function () {
const { glossaryData, referencesData, vocabularyData } = window.UiePlannerData;

const typeLabels = {
  web: 'Web', pdf: 'PDF', guide: 'Guía', law: 'Ley',
  standard: 'Norma', manual: 'Manual', article: 'Artículo',
  infographic: 'Infografía', template: 'Plantilla',
  checklist: 'Checklist', report: 'Informe'
};

const typeClasses = {
  web: 'ref-type-web', pdf: 'ref-type-pdf', guide: 'ref-type-guide',
  law: 'ref-type-law', standard: 'ref-type-standard',
  manual: 'ref-type-manual', article: 'ref-type-article',
  infographic: 'ref-type-infographic', template: 'ref-type-template',
  checklist: 'ref-type-checklist', report: 'ref-type-report'
};

function formatAPA(ref) {
  const author = ref.authors || ref.source;
  const year = ref.year ? ` (${ref.year}).` : '';
  const title = ref.title;
  const src = ref.source && ref.source !== (ref.authors || '') ? ` ${ref.source}.` : '.';
  const url = ref.url ? ` ${ref.url}` : '';
  return `${author}.${year} ${title}.${src}${url}`;
}

function renderVocabulary(data) {
    const table = document.getElementById('vocab-table-body');
    if (!table) return;
    table.innerHTML = data.length
        ? data.map(item => `
            <tr>
                <td><span class="term-bad">${item.bad}</span></td>
                <td><span class="term-good">${item.good}</span></td>
                <td>${item.why}</td>
            </tr>
        `).join('')
        : `<tr><td colspan="3" class="empty-cell">No se encontraron términos.</td></tr>`;
}

function renderGlossary(data) {
    const container = document.getElementById('glossary-container');
    if (!container) return;
    container.innerHTML = data.length
        ? data.map(item => `
            <article class="glossary-item">
                <h4>${item.term}</h4>
                <p>${item.desc}</p>
            </article>
        `).join('')
        : `<p class="empty-cell">No se encontraron conceptos en el glosario.</p>`;
}

function showToast(msg) {
    const old = document.querySelector('.ref-toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'ref-toast';
    t.textContent = msg;
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('ref-toast-visible'));
    setTimeout(() => {
        t.classList.remove('ref-toast-visible');
        setTimeout(() => t.remove(), 300);
    }, 2200);
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showToast('¡Cita APA copiada al portapapeles!'));
    } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('¡Cita APA copiada al portapapeles!');
    }
}

function renderReferences() {
    const container = document.getElementById('references-grid');
    if (!container) return;

    const sources = [...new Set(referencesData.map(r => r.source))].sort();
    const types = [...new Set(referencesData.filter(r => r.type).map(r => r.type))].sort();

    container.innerHTML = `
        <div class="ref-controls">
            <input type="search" id="ref-search" class="ref-search-input" placeholder="Buscar por título, autor..." aria-label="Buscar referencias">
            <select id="ref-type-filter" class="ref-filter-select" aria-label="Filtrar por tipo">
                <option value="">Todos los tipos</option>
                ${types.map(t => `<option value="${t}">${typeLabels[t] || t}</option>`).join('')}
            </select>
            <select id="ref-source-filter" class="ref-filter-select" aria-label="Filtrar por fuente">
                <option value="">Todas las fuentes</option>
                ${sources.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
            <span class="ref-count" id="ref-count" aria-live="polite">${referencesData.length} referencias</span>
        </div>
        <div class="ref-table-wrapper">
            <table class="ref-table">
                <thead>
                    <tr>
                        <th scope="col">Año</th>
                        <th scope="col">Referencia</th>
                        <th scope="col">Tipo</th>
                        <th scope="col">Acciones</th>
                    </tr>
                </thead>
                <tbody id="ref-table-body"></tbody>
            </table>
        </div>
    `;

    var tbody = document.getElementById('ref-table-body');
    var searchInput = document.getElementById('ref-search');
    var typeFilter = document.getElementById('ref-type-filter');
    var sourceFilter = document.getElementById('ref-source-filter');
    var countSpan = document.getElementById('ref-count');

    function buildRow(ref) {
        var typeLabel = typeLabels[ref.type] || ref.type || '—';
        var typeClass = typeClasses[ref.type] || '';
        var apa = formatAPA(ref);
        var hasUrl = !!ref.url;

        return '<tr>' +
            '<td><span class="ref-year">' + (ref.year || '—') + '</span></td>' +
            '<td class="ref-reference-cell">' +
                '<strong class="ref-title">' + ref.title + '</strong>' +
                (ref.authors ? '<span class="ref-meta">' + ref.authors + '</span>' : '') +
                '<span class="ref-source-name">' + ref.source + '</span>' +
            '</td>' +
            '<td><span class="ref-type-badge ' + typeClass + '">' + typeLabel + '</span></td>' +
            '<td class="ref-actions-cell"><div class="ref-actions-inner">' +
                (hasUrl ? '<a href="' + ref.url + '" target="_blank" rel="noopener" class="ref-btn ref-btn-link">Abrir</a>' : '') +
                '<button type="button" class="ref-btn ref-btn-copy" data-apa="' + encodeURIComponent(apa) + '">Copiar APA</button>' +
            '</div></td></tr>';
    }

    function filterRows() {
        var q = normalize(searchInput.value);
        var tv = typeFilter.value;
        var sv = sourceFilter.value;

        var filtered = referencesData.filter(function (ref) {
            if (tv && ref.type !== tv) return false;
            if (sv && ref.source !== sv) return false;
            if (q) {
                var haystack = normalize(ref.title + ' ' + (ref.authors || '') + ' ' + ref.source + ' ' + (ref.year || ''));
                if (haystack.indexOf(q) === -1) return false;
            }
            return true;
        }).sort(function (a, b) {
            var ay = a.year || 0;
            var by = b.year || 0;
            if (ay !== by) return by - ay;
            return a.title.localeCompare(b.title);
        });

        tbody.innerHTML = filtered.length
            ? filtered.map(buildRow).join('')
            : '<tr><td colspan="4" class="ref-empty">No se encontraron referencias con los filtros aplicados.</td></tr>';

        countSpan.textContent = filtered.length + ' de ' + referencesData.length + ' referencias';

        var btns = tbody.querySelectorAll('.ref-btn-copy');
        for (var i = 0; i < btns.length; i++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    copyToClipboard(decodeURIComponent(btn.getAttribute('data-apa')));
                });
            })(btns[i]);
        }
    }

    searchInput.addEventListener('input', filterRows);
    typeFilter.addEventListener('change', filterRows);
    sourceFilter.addEventListener('change', filterRows);
    filterRows();
}

function normalize(value) {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function filterLanguageContent(query) {
    const normalized = normalize(query);
    const filteredVocab = vocabularyData.filter(item => normalize(item.bad + ' ' + item.good + ' ' + item.why).includes(normalized));
    const filteredGlossary = glossaryData.filter(item => normalize(item.term + ' ' + item.desc).includes(normalized));
    renderVocabulary(filteredVocab);
    renderGlossary(filteredGlossary);
}

window.UiePlannerContent = {
    renderGlossary: renderGlossary,
    renderReferences: renderReferences,
    renderVocabulary: renderVocabulary,
    filterLanguageContent: filterLanguageContent,
    normalize: normalize
};

})();
