(function () {
const { glossaryData, principleCards, referencesData, vocabularyData } = window.UiePlannerData;

function renderPrinciples() {
    const container = document.getElementById('principle-grid');
    if (!container) return;
    container.innerHTML = principleCards.map(card => `
        <article class="principle-card">
            <span class="number-token">${card.icon}</span>
            <h3>${card.title}</h3>
            <p>${card.text}</p>
            <span class="source-pill">${card.source}</span>
        </article>
    `).join('');
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

function renderReferences() {
    const container = document.getElementById('references-grid');
    if (!container) return;

    const categoryOrder = ['Duoc UC', 'CAST', 'W3C WAI', 'AENOR', 'Chile', 'SENADIS', 'OIT', 'OMS / OPS', 'Morilla & Álvarez', 'WHO'];
    const categoryLabels = {
        'Duoc UC': 'Documentos Duoc UC',
        'CAST': 'Estándares internacionales DUA',
        'W3C WAI': 'Estándares de accesibilidad web',
        'AENOR': 'Normas UNE',
        'Chile': 'Normativa chilena',
        'SENADIS': 'SENADIS',
        'OIT': 'Organización Internacional del Trabajo',
        'OMS / OPS': 'Clasificación CIF (OMS/OPS)',
        'Morilla & Álvarez': 'Artículos académicos',
        'WHO': 'Clasificación CIF (WHO)'
    };

    function categoryKey(source) {
        var idx = categoryOrder.indexOf(source);
        return idx === -1 ? 99 : idx;
    }

    var groups = {};
    referencesData.forEach(function (item) {
        var key = item.source;
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
    });

    var sortedKeys = Object.keys(groups).sort(function (a, b) { return categoryKey(a) - categoryKey(b); });

    var html = '';
    sortedKeys.forEach(function (key) {
        var label = categoryLabels[key] || key;
        html += '<div class="ref-category"><h3 class="ref-category-title">' + label + '</h3><div class="ref-grid">';
        groups[key].forEach(function (item) {
            var content = '<strong class="ref-code">' + item.code + '</strong><span>' + item.title + '</span><span class="ref-source">' + item.source + '</span>';
            if (item.url) {
                html += '<a class="ref-card" href="' + item.url + '" target="_blank" rel="noopener">' + content + '</a>';
            } else {
                html += '<div class="ref-card">' + content + '</div>';
            }
        });
        html += '</div></div>';
    });
    container.innerHTML = html;
}

function normalize(value) {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function filterLanguageContent(query) {
    const normalized = normalize(query);
    const filteredVocab = vocabularyData.filter(item => normalize(`${item.bad} ${item.good} ${item.why}`).includes(normalized));
    const filteredGlossary = glossaryData.filter(item => normalize(`${item.term} ${item.desc}`).includes(normalized));
    renderVocabulary(filteredVocab);
    renderGlossary(filteredGlossary);
}

window.UiePlannerContent = {
    renderGlossary,
    renderPrinciples,
    renderReferences,
    renderVocabulary,
    filterLanguageContent,
    normalize
};

})();
