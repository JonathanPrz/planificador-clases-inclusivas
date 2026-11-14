(function () {
var PDF_LIB_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/pdfmake.min.js';
var PDF_FONTS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/vfs_fonts.min.js';

var COLORS = {
    ink: '#111827',
    body: '#1F2937',
    secondary: '#4B5563',
    muted: '#6B7280',
    faint: '#9CA3AF',
    rule: '#E5E7EB',
    panel: '#F5F6F8',
    accent: '#B42318',
    check: '#236A4B'
};

var LEVELS = {
    0: { fill: '#D1D5DB', soft: '#F3F4F6', text: '#374151', label: 'Sin barrera' },
    1: { fill: '#F2B8B1', soft: '#FDEDEB', text: '#7A1F18', label: 'Leve' },
    2: { fill: '#DE6A5E', soft: '#FBE1DE', text: '#7A1F18', label: 'Moderada' },
    3: { fill: '#9B2C24', soft: '#F6D3CF', text: '#6B1A14', label: 'Significativa' }
};

var STYLES = {
    headerOrg: { fontSize: 12, bold: true, color: COLORS.accent },
    headerMeta: { fontSize: 8.5, color: COLORS.muted, lineHeight: 1.25 },
    mainTitle: { fontSize: 20, bold: true, color: COLORS.ink, margin: [0, 18, 0, 6], lineHeight: 1.1 },
    introText: { fontSize: 10.5, color: COLORS.secondary, margin: [0, 0, 0, 14], lineHeight: 1.35 },
    sectionTitle: { fontSize: 13.5, bold: true, color: COLORS.ink, margin: [0, 16, 0, 6] },
    studentSectionTitle: { fontSize: 12, bold: true, color: COLORS.ink, margin: [0, 12, 0, 4] },
    subSectionTitle: { fontSize: 10.5, bold: true, color: COLORS.accent, margin: [0, 10, 0, 4] },
    categoryTitle: { fontSize: 10.5, bold: true, color: COLORS.ink, margin: [0, 10, 0, 4] },
    bodyText: { fontSize: 10, color: COLORS.body, margin: [0, 2, 0, 2], lineHeight: 1.3 },
    noteText: { fontSize: 9.5, color: COLORS.secondary, margin: [0, 0, 0, 8], lineHeight: 1.3 },
    metaText: { fontSize: 8.5, color: COLORS.muted, margin: [0, 1, 0, 2] },
    tableHeader: { fontSize: 8.5, bold: true, color: COLORS.secondary },
    tableCell: { fontSize: 9.5, color: COLORS.body, lineHeight: 1.2 },
    sourceText: { fontSize: 8.5, color: COLORS.faint, margin: [0, 3, 0, 3] },
    footerText: { fontSize: 8.5, color: COLORS.muted, margin: [0, 10, 0, 0], lineHeight: 1.3 }
};

var lastPageCount = 0;

function ensureLibrary(callback, onError) {
    if (window.pdfMake && typeof window.pdfMake.createPdf === 'function') { callback(); return; }
    var loaded = 0;
    var failed = false;
    function done() {
        loaded++;
        if (loaded === 2) callback();
    }
    function fail() {
        if (failed) return;
        failed = true;
        if (onError) onError();
        else window.UiePlannerNotice.showNotice('No se pudo cargar el generador de PDF. Revisa tu conexión a internet e intenta de nuevo.');
    }
    var script = document.createElement('script');
    script.src = PDF_LIB_URL;
    script.onload = function() {
        var fonts = document.createElement('script');
        fonts.src = PDF_FONTS_URL;
        fonts.onload = done;
        fonts.onerror = fail;
        document.head.appendChild(fonts);
        done();
    };
    script.onerror = fail;
    document.head.appendChild(script);
}

function tableLayout(options) {
    options = options || {};
    return {
        hLineWidth: function(i, node) { return i === 0 || i === node.table.body.length ? 0 : 0.6; },
        vLineWidth: function() { return 0; },
        hLineColor: function(i) { return i === 1 ? '#D1D5DB' : COLORS.rule; },
        fillColor: function(rowIndex) {
            if (rowIndex === 0 && !options.noHeader) return COLORS.panel;
            return null;
        },
        paddingLeft: function(i) { return i === 0 ? 6 : 6; },
        paddingRight: function() { return 6; },
        paddingTop: function() { return options.compact ? 3 : 5; },
        paddingBottom: function() { return options.compact ? 3 : 5; }
    };
}

function boxLayout() {
    return {
        hLineWidth: function() { return 0.75; },
        vLineWidth: function() { return 0.75; },
        hLineColor: function() { return '#D1D5DB'; },
        vLineColor: function() { return '#D1D5DB'; },
        paddingLeft: function() { return 8; },
        paddingRight: function() { return 8; },
        paddingTop: function() { return 6; },
        paddingBottom: function() { return 6; }
    };
}

function sectionTitle(number, text) {
    var parts = [];
    if (number !== null && number !== undefined && number !== '') parts.push({ text: number + '  ', color: COLORS.accent });
    parts.push({ text: text });
    return { text: parts, style: 'sectionTitle', headlineLevel: 1 };
}

function checkbox(text, checked) {
    var s = 9;
    var canvas = [{ type: 'rect', x: 0, y: 0, w: s, h: s, r: 1.5, lineWidth: 0.9, lineColor: checked ? COLORS.check : '#9CA3AF', color: checked ? COLORS.check : '#FFFFFF' }];
    if (checked) {
        canvas.push(
            { type: 'line', x1: 2.2, y1: 4.8, x2: 3.9, y2: 6.6, lineWidth: 1.4, lineColor: '#FFFFFF', lineCap: 'round' },
            { type: 'line', x1: 3.9, y1: 6.6, x2: 7, y2: 2.6, lineWidth: 1.4, lineColor: '#FFFFFF', lineCap: 'round' }
        );
    }
    return {
        columns: [
            { canvas: canvas, width: s + 6, margin: [0, 1.5, 0, 0] },
            { text: text, width: '*', style: 'bodyText', margin: [0, 0, 0, 0], color: checked ? COLORS.ink : COLORS.secondary }
        ],
        margin: [0, 2.5, 0, 2.5]
    };
}

function levelTag(level, text) {
    var info = LEVELS[level] || LEVELS[0];
    return {
        columns: [
            { width: 16, canvas: [{ type: 'rect', x: 0, y: 0, w: 10, h: 10, r: 2, color: info.fill }], margin: [0, 1, 0, 0] },
            { width: '*', text: text || info.label, fontSize: 9, bold: true, color: info.text }
        ],
        margin: [0, 7, 0, 3]
    };
}

function bulletList(items, options) {
    options = options || {};
    return {
        ul: items,
        style: 'bodyText',
        markerColor: COLORS.faint,
        margin: [options.indent || 4, 1, 0, 3]
    };
}

function levelLegend() {
    var cols = [];
    [0, 1, 2, 3].forEach(function(level) {
        var info = LEVELS[level];
        cols.push({ width: 'auto', canvas: [{ type: 'rect', x: 0, y: 0, w: 14, h: 6, r: 1.5, color: info.fill }], margin: [0, 2.5, 4, 0] });
        cols.push({ width: 'auto', text: level + ' · ' + info.label, fontSize: 8, color: COLORS.secondary, margin: [0, 0, 12, 0] });
    });
    return { columns: cols, margin: [0, 6, 0, 2] };
}

function levelBarChart(activityLabels, series) {
    var maxBar = series.length > 2 ? 54 : series.length === 2 ? 90 : 170;
    var header = [{ text: 'Actividad', style: 'tableHeader' }];
    series.forEach(function(s) { header.push({ text: s.label, style: 'tableHeader' }); });
    var widths = [series.length > 2 ? 92 : 130];
    series.forEach(function() { widths.push('*'); });
    var body = [header];
    activityLabels.forEach(function(label, ai) {
        var row = [{ text: label, style: 'tableCell', color: COLORS.secondary }];
        series.forEach(function(s) {
            var level = Math.max(0, Math.min(3, Math.round(Number(s.values[ai] || 0))));
            var info = LEVELS[level];
            var w = level > 0 ? Math.max(6, (level / 3) * maxBar) : 0;
            var canvas = [{ type: 'rect', x: 0, y: 1, w: maxBar, h: 8, r: 2, color: '#F3F4F6' }];
            if (w) canvas.push({ type: 'rect', x: 0, y: 1, w: w, h: 8, r: 2, color: info.fill });
            row.push({
                columns: [
                    { width: maxBar + 6, canvas: canvas },
                    { width: '*', text: String(level), fontSize: 8.5, bold: level === 3, color: level ? info.text : COLORS.faint }
                ],
                margin: [0, 1, 0, 0]
            });
        });
        body.push(row);
    });
    return [{
        stack: [
            { table: { headerRows: 1, widths: widths, body: body, dontBreakRows: true }, layout: tableLayout({ compact: true }), margin: [0, 4, 0, 0] },
            levelLegend()
        ],
        unbreakable: true
    }];
}

function firstPageHeader(dateText) {
    var logo = window.LOGO_UIE_BASE64 || '';
    var columns = [];
    if (logo) columns.push({ image: logo, width: 104 });
    columns.push({
        stack: [
            { text: 'Unidad de Inclusión Educativa', style: 'headerOrg' },
            { text: 'Equipo de Inclusión Académica · Duoc UC Campus Arauco', style: 'headerMeta' },
            { text: dateText || '', style: 'headerMeta' }
        ],
        alignment: 'right',
        margin: [0, 6, 0, 0]
    });
    return [
        { columns: columns, columnGap: 12 },
        { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 499, y2: 10, lineWidth: 0.75, lineColor: '#D1D5DB' }] }
    ];
}

var HEADING_STYLES = { sectionTitle: true, studentSectionTitle: true, categoryTitle: true, subSectionTitle: true };

function isHeading(node) {
    return !!node && (node.keepWithNext === true || (typeof node.style === 'string' && HEADING_STYLES[node.style]));
}

function keepHeadingsWithContent(content) {
    var output = [];
    var i = 0;
    while (i < content.length) {
        var node = content[i];
        if (!isHeading(node)) {
            output.push(node);
            i++;
            continue;
        }
        var group = [];
        while (i < content.length && isHeading(content[i])) {
            group.push(content[i]);
            i++;
            if (i < content.length && content[i] && content[i].style === 'noteText') {
                group.push(content[i]);
                i++;
            }
        }
        if (i < content.length) {
            group.push(content[i]);
            i++;
        }
        output.push(group.length > 1 ? { stack: group, unbreakable: true } : group[0]);
    }
    return output;
}

function finalize(docDef, meta) {
    meta = meta || {};
    var title = meta.title || 'Planificador Inclusivo UIE';
    docDef.styles = Object.assign({}, docDef.styles || {}, STYLES);
    docDef.defaultStyle = { font: 'Roboto', fontSize: 10, color: COLORS.body, lineHeight: 1.25 };
    docDef.pageSize = 'LETTER';
    docDef.pageMargins = [56, 48, 56, 54];
    docDef.info = { title: title, author: 'Unidad de Inclusión Educativa', subject: meta.subject || title, creator: 'Planificador Inclusivo UIE' };
    docDef.footer = function(currentPage, pageCount) {
        lastPageCount = pageCount;
        return {
            columns: [
                { text: 'Planificador Inclusivo UIE · ' + title, alignment: 'left' },
                { text: 'Página ' + currentPage + ' de ' + pageCount, alignment: 'right', width: 'auto' }
            ],
            fontSize: 8,
            color: COLORS.faint,
            margin: [56, 18, 56, 0]
        };
    };
    docDef.content = keepHeadingsWithContent(docDef.content || []);
    return docDef;
}

function buildDialog() {
    var dialog = document.getElementById('pdf-preview-dialog');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'pdf-preview-dialog';
    dialog.className = 'pdf-preview-dialog';
    dialog.setAttribute('aria-labelledby', 'pdf-preview-title');
    dialog.innerHTML =
        '<div class="pdf-preview-shell">' +
            '<header class="pdf-preview-header">' +
                '<div class="pdf-preview-heading">' +
                    '<h2 id="pdf-preview-title">Vista previa del PDF</h2>' +
                    '<p class="pdf-preview-meta" id="pdf-preview-meta" aria-live="polite"></p>' +
                '</div>' +
                '<button class="pdf-preview-close" type="button" data-pdf-close aria-label="Cerrar vista previa">' +
                    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
                '</button>' +
            '</header>' +
            '<div class="pdf-preview-stage" id="pdf-preview-stage"></div>' +
            '<footer class="pdf-preview-footer">' +
                '<p class="pdf-preview-hint">Revisa el contenido antes de descargar. Si necesitas cambiar algo, vuelve y edita las selecciones.</p>' +
                '<div class="pdf-preview-actions">' +
                    '<button class="btn btn-secondary" type="button" data-pdf-close>Volver y editar</button>' +
                    '<a class="btn btn-secondary pdf-preview-open" id="pdf-preview-open" target="_blank" rel="noopener">Abrir en pestaña nueva</a>' +
                    '<button class="btn btn-primary" type="button" id="pdf-preview-download">Descargar PDF</button>' +
                '</div>' +
            '</footer>' +
        '</div>';
    document.body.appendChild(dialog);
    dialog.addEventListener('click', function(event) {
        if (event.target === dialog || event.target.closest('[data-pdf-close]')) closePreview();
    });
    dialog.addEventListener('close', releasePreview);
    return dialog;
}

function releasePreview() {
    var dialog = document.getElementById('pdf-preview-dialog');
    if (!dialog) return;
    var url = dialog.dataset.url;
    var stage = document.getElementById('pdf-preview-stage');
    if (stage) stage.innerHTML = '';
    if (url) URL.revokeObjectURL(url);
    dialog.dataset.url = '';
}

function closePreview() {
    var dialog = document.getElementById('pdf-preview-dialog');
    if (dialog && dialog.open) dialog.close();
}

var PDFJS_BASE = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/';
var pdfjsLoading = null;

function isFramed() {
    try {
        return window.self !== window.top;
    } catch (error) {
        return true;
    }
}

function canEmbedPdf() {
    if (isFramed()) return false;
    if (typeof navigator.pdfViewerEnabled === 'boolean') return navigator.pdfViewerEnabled;
    return !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
}

function loadPdfjs() {
    if (!pdfjsLoading) {
        pdfjsLoading = import(PDFJS_BASE + 'pdf.min.mjs').then(function(lib) {
            lib.GlobalWorkerOptions.workerSrc = PDFJS_BASE + 'pdf.worker.min.mjs';
            return lib;
        });
        pdfjsLoading.catch(function() { pdfjsLoading = null; });
    }
    return pdfjsLoading;
}

function renderPages(blob, stage, onError) {
    setStageMessage(stage, 'Dibujando las páginas…', 'Esto toma solo unos segundos.');
    var doc;
    loadPdfjs().then(function(lib) {
        return blob.arrayBuffer().then(function(buffer) {
            return lib.getDocument({ data: new Uint8Array(buffer), isEvalSupported: false }).promise;
        });
    }).then(function(pdf) {
        doc = pdf;
        var pages = document.createElement('div');
        pages.className = 'pdf-preview-pages';
        var width = Math.max(320, Math.min(stage.clientWidth - 32, 860));
        var ratio = Math.min(window.devicePixelRatio || 1, 2);
        var chain = Promise.resolve();
        for (var n = 1; n <= pdf.numPages; n++) {
            (function(number) {
                chain = chain.then(function() {
                    return pdf.getPage(number).then(function(page) {
                        var base = page.getViewport({ scale: 1 });
                        var viewport = page.getViewport({ scale: (width / base.width) * ratio });
                        var canvas = document.createElement('canvas');
                        canvas.className = 'pdf-preview-page';
                        canvas.width = Math.floor(viewport.width);
                        canvas.height = Math.floor(viewport.height);
                        canvas.style.width = Math.floor(viewport.width / ratio) + 'px';
                        canvas.setAttribute('role', 'img');
                        canvas.setAttribute('aria-label', 'Página ' + number + ' de ' + pdf.numPages);
                        pages.appendChild(canvas);
                        return page.render({ canvasContext: canvas.getContext('2d'), canvas: canvas, viewport: viewport }).promise;
                    });
                });
            })(n);
        }
        stage.innerHTML = '';
        stage.appendChild(pages);
        return chain;
    }).then(function() {
        if (doc) doc.destroy();
    }).catch(function() {
        if (doc) doc.destroy();
        onError();
    });
}

function setStageMessage(stage, title, text, isError) {
    stage.innerHTML = '';
    var box = document.createElement('div');
    box.className = 'pdf-preview-message' + (isError ? ' is-error' : '');
    var h = document.createElement('p');
    h.className = 'pdf-preview-message-title';
    h.textContent = title;
    var p = document.createElement('p');
    p.textContent = text;
    box.appendChild(h);
    box.appendChild(p);
    stage.appendChild(box);
}

function preview(docDef, filename, meta) {
    meta = meta || {};
    var dialog = buildDialog();
    var stage = document.getElementById('pdf-preview-stage');
    var metaEl = document.getElementById('pdf-preview-meta');
    var download = document.getElementById('pdf-preview-download');
    var openLink = document.getElementById('pdf-preview-open');
    var title = document.getElementById('pdf-preview-title');

    releasePreview();
    title.textContent = meta.title ? 'Vista previa: ' + meta.title : 'Vista previa del PDF';
    metaEl.textContent = 'Preparando documento…';
    download.disabled = true;
    openLink.hidden = true;
    openLink.removeAttribute('href');
    setStageMessage(stage, 'Preparando vista previa…', 'Esto toma solo unos segundos.');
    if (!dialog.open) dialog.showModal();

    ensureLibrary(function() {
        var doc;
        try {
            doc = window.pdfMake.createPdf(finalize(docDef, meta));
        } catch (error) {
            metaEl.textContent = '';
            setStageMessage(stage, 'No se pudo preparar el PDF.', 'Recarga la página e intenta nuevamente. Si el problema continúa, revisa que haya al menos un apoyo seleccionado.', true);
            return;
        }
        doc.getBlob(function(blob) {
            var url = URL.createObjectURL(blob);
            dialog.dataset.url = url;
            var pages = lastPageCount ? lastPageCount + (lastPageCount === 1 ? ' página' : ' páginas') + ' · ' : '';
            metaEl.textContent = pages + filename;
            download.disabled = false;
            download.onclick = function() {
                var a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
            };
            openLink.href = url;
            openLink.hidden = false;
            stage.innerHTML = '';
            if (canEmbedPdf()) {
                var frame = document.createElement('iframe');
                frame.className = 'pdf-preview-frame';
                frame.title = 'Vista previa de ' + filename;
                frame.src = url + '#view=FitH';
                stage.appendChild(frame);
            } else {
                renderPages(blob, stage, function() {
                    setStageMessage(stage, 'El documento está listo.', 'No se pudo mostrar dentro de la página. Usa «Abrir en pestaña nueva» para revisarlo o descárgalo directamente.');
                });
            }
            download.focus();
        });
    }, function() {
        metaEl.textContent = '';
        setStageMessage(stage, 'No se pudo cargar el generador de PDF.', 'Revisa tu conexión a internet y vuelve a intentarlo.', true);
    });
}

window.UiePlannerPdf = {
    COLORS: COLORS,
    LEVELS: LEVELS,
    ensureLibrary: ensureLibrary,
    tableLayout: tableLayout,
    boxLayout: boxLayout,
    sectionTitle: sectionTitle,
    checkbox: checkbox,
    levelTag: levelTag,
    bulletList: bulletList,
    levelLegend: levelLegend,
    levelBarChart: levelBarChart,
    firstPageHeader: firstPageHeader,
    finalize: finalize,
    preview: preview,
    closePreview: closePreview
};
})();
