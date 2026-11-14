(function () {
var seenKey = 'uie-privacy-note-seen';
var lastTrigger = null;

function getDialog() {
    return document.getElementById('privacy-dialog');
}

function hasSeenNote() {
    try {
        return sessionStorage.getItem(seenKey) === 'true';
    } catch (error) {
        return false;
    }
}

function markNoteSeen() {
    try {
        sessionStorage.setItem(seenKey, 'true');
    } catch (error) {}
}

function openPrivacyNote(trigger) {
    var dialog = getDialog();
    if (!dialog || dialog.open) return;
    lastTrigger = trigger || document.activeElement;
    markNoteSeen();
    if (typeof dialog.showModal === 'function') {
        dialog.showModal();
    } else {
        dialog.setAttribute('open', '');
    }
}

function bindPrivacyNote() {
    var dialog = getDialog();
    if (!dialog) return;

    dialog.addEventListener('close', function() {
        var trigger = lastTrigger;
        lastTrigger = null;
        if (!trigger || typeof trigger.focus !== 'function') return;
        window.setTimeout(function() {
            trigger.blur();
            trigger.focus();
            if (typeof trigger.setSelectionRange === 'function' && typeof trigger.value === 'string') {
                try {
                    trigger.setSelectionRange(trigger.value.length, trigger.value.length);
                } catch (error) {}
            }
        }, 0);
    });

    document.addEventListener('click', function(event) {
        var button = event.target.closest('[data-open-privacy]');
        if (!button) return;
        event.preventDefault();
        openPrivacyNote(button);
    });

    document.addEventListener('focusin', function(event) {
        var field = event.target;
        if (!field.classList || !field.classList.contains('student-personal-field')) return;
        if (hasSeenNote()) return;
        openPrivacyNote(field);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindPrivacyNote);
} else {
    bindPrivacyNote();
}
})();
