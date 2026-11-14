(function () {
var dialog = null;
var messageEl = null;
var confirmBtn = null;
var cancelBtn = null;
var onConfirm = null;

function buildDialog() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.className = 'report-dialog notice-dialog';
    dialog.setAttribute('aria-labelledby', 'notice-title');
    dialog.setAttribute('aria-describedby', 'notice-message');
    dialog.innerHTML =
        '<form method="dialog" class="report-modal">' +
            '<div class="report-body notice-body">' +
                '<h3 id="notice-title" class="sr-only">Aviso</h3>' +
                '<p id="notice-message" class="notice-message"></p>' +
                '<div class="notice-actions">' +
                    '<button class="btn btn-secondary" type="submit" value="cancel" data-notice-cancel>Cancelar</button>' +
                    '<button class="btn btn-primary" type="submit" value="ok" data-notice-ok>Entendido</button>' +
                '</div>' +
            '</div>' +
        '</form>';
    document.body.appendChild(dialog);
    messageEl = dialog.querySelector('#notice-message');
    confirmBtn = dialog.querySelector('[data-notice-ok]');
    cancelBtn = dialog.querySelector('[data-notice-cancel]');
    dialog.addEventListener('close', function() {
        var callback = onConfirm;
        onConfirm = null;
        if (callback && dialog.returnValue === 'ok') callback();
    });
}

function open(message, options) {
    buildDialog();
    options = options || {};
    messageEl.textContent = message;
    dialog.querySelector('#notice-title').textContent = options.title || 'Aviso';
    confirmBtn.textContent = options.confirmLabel || 'Entendido';
    cancelBtn.hidden = !options.showCancel;
    onConfirm = options.onConfirm || null;
    dialog.returnValue = '';
    if (dialog.open) dialog.close();
    if (typeof dialog.showModal === 'function') {
        dialog.showModal();
        confirmBtn.focus();
    } else if (!options.showCancel) {
        onConfirm = null;
        window.alert(message);
    } else if (window.confirm(message) && onConfirm) {
        var callback = onConfirm;
        onConfirm = null;
        callback();
    }
}

function showNotice(message) {
    open(message, { title: 'Aviso' });
}

function askConfirm(message, onAccept, confirmLabel) {
    open(message, { title: 'Confirmar', showCancel: true, confirmLabel: confirmLabel || 'Aceptar', onConfirm: onAccept });
}

window.UiePlannerNotice = { showNotice: showNotice, askConfirm: askConfirm };
})();
