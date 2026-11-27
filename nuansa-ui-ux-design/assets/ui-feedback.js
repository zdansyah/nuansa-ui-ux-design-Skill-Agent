/*!
 * ui-feedback.js — dependency-free replacement for alert(), confirm() and prompt().
 *
 *   UI.toast('Data tersimpan', { type: 'success' })
 *   await UI.alert('Sesi Anda berakhir.')
 *   if (await UI.confirm({ title: 'Hapus pengguna?', message: 'Tidak bisa dibatalkan.', variant: 'danger' })) { ... }
 *   const name = await UI.prompt({ title: 'Ganti nama', label: 'Nama', defaultValue: 'Budi' }) // null on cancel
 *
 * Declarative confirmation (no JS changes needed in server-rendered apps):
 *   <a href="/users/5/delete" data-confirm="Hapus pengguna ini?">Hapus</a>
 *   <form method="post" action="/users/5" data-confirm="Hapus pengguna ini?" data-confirm-variant="danger">…</form>
 *   <button type="submit" name="action" value="archive" data-confirm="Arsipkan?">Arsipkan</button>
 * Optional attributes: data-confirm-title, data-confirm-ok, data-confirm-cancel, data-confirm-variant (danger|primary).
 *
 * Pair with ui-feedback.css. Uses design tokens (--color-primary, etc.) with fallbacks.
 * All text is inserted with textContent, so messages are never interpreted as HTML.
 */
(function (global) {
  'use strict';

  var isId = /^id\b/i.test((document.documentElement.getAttribute('lang') || navigator.language || ''));
  var strings = isId
    ? { ok: 'OK', confirm: 'Ya, lanjutkan', cancel: 'Batal', close: 'Tutup', confirmTitle: 'Konfirmasi', promptTitle: 'Masukkan nilai', alertTitle: 'Informasi', danger: 'Hapus', required: 'Wajib diisi.' }
    : { ok: 'OK', confirm: 'Continue', cancel: 'Cancel', close: 'Close', confirmTitle: 'Please confirm', promptTitle: 'Enter a value', alertTitle: 'Notice', danger: 'Delete', required: 'This field is required.' };

  var toastDefaults = { type: 'info', duration: 4000, title: '' };
  var MAX_TOASTS = 3;
  var toastRegion = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }

  function normalize(input, fallbackTitle) {
    if (input == null) return { message: '' };
    if (typeof input === 'string' || typeof input === 'number') return { message: String(input), title: fallbackTitle };
    return input;
  }

  /* ---------------- Toast ---------------- */

  function ensureRegion() {
    if (toastRegion && document.body.contains(toastRegion)) return toastRegion;
    toastRegion = el('div', 'uif-toasts');
    toastRegion.setAttribute('aria-live', 'polite');
    toastRegion.setAttribute('aria-relevant', 'additions');
    document.body.appendChild(toastRegion);
    return toastRegion;
  }

  var ICONS = { success: '✓', error: '!', warning: '!', info: 'i' };

  function toast(message, opts) {
    var o = Object.assign({}, toastDefaults, typeof message === 'object' && message !== null ? message : { message: message }, opts || {});
    var region = ensureRegion();

    var t = el('div', 'uif-toast uif-toast--' + o.type);
    t.setAttribute('role', o.type === 'error' ? 'alert' : 'status');
    t.appendChild(el('span', 'uif-toast__icon', ICONS[o.type] || ICONS.info)).setAttribute('aria-hidden', 'true');
    var body = el('div', 'uif-toast__body');
    if (o.title) body.appendChild(el('p', 'uif-toast__title', o.title));
    body.appendChild(el('p', 'uif-toast__msg', o.message));
    t.appendChild(body);
    var close = el('button', 'uif-toast__close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', strings.close);
    t.appendChild(close);

    var timer = null;
    function dismiss() {
      if (!t.isConnected) return;
      clearTimeout(timer);
      t.classList.add('is-leaving');
      setTimeout(function () { t.remove(); }, 180);
    }
    function arm() { if (o.duration > 0) timer = setTimeout(dismiss, o.duration); }
    close.addEventListener('click', dismiss);
    t.addEventListener('mouseenter', function () { clearTimeout(timer); });
    t.addEventListener('mouseleave', arm);

    region.appendChild(t);
    while (region.children.length > MAX_TOASTS) region.firstElementChild.remove();
    arm();
    return { dismiss: dismiss };
  }

  /* ---------------- Dialogs ---------------- */

  function openDialog(cfg) {
    // cfg: { kind: 'alert'|'confirm'|'prompt', title, message, okText, cancelText, variant, label, defaultValue, placeholder, inputType, required }
    return new Promise(function (resolve) {
      var lastFocus = document.activeElement;
      var dlg = el('dialog', 'uif-dialog' + (cfg.variant === 'danger' ? ' uif-dialog--danger' : ''));
      var titleId = 'uif-t-' + Math.random().toString(36).slice(2, 8);
      dlg.setAttribute('aria-labelledby', titleId);
      if (cfg.kind !== 'prompt') dlg.setAttribute('role', 'alertdialog');

      var form = el('form', 'uif-dialog__panel');
      form.method = 'dialog';
      form.noValidate = true;

      var title = el('h2', 'uif-dialog__title', cfg.title);
      title.id = titleId;
      form.appendChild(title);
      if (cfg.message) form.appendChild(el('p', 'uif-dialog__msg', cfg.message));

      var input = null, err = null;
      if (cfg.kind === 'prompt') {
        var field = el('div', 'uif-dialog__field');
        var inputId = titleId + '-in';
        if (cfg.label) {
          var lbl = el('label', 'uif-dialog__label', cfg.label);
          lbl.htmlFor = inputId;
          field.appendChild(lbl);
        }
        input = el(cfg.inputType === 'textarea' ? 'textarea' : 'input', 'uif-dialog__input');
        if (input.tagName === 'INPUT') input.type = cfg.inputType || 'text';
        input.id = inputId;
        input.value = cfg.defaultValue != null ? String(cfg.defaultValue) : '';
        if (cfg.placeholder) input.placeholder = cfg.placeholder;
        if (!cfg.label) input.setAttribute('aria-label', cfg.title);
        field.appendChild(input);
        err = el('p', 'uif-dialog__error');
        err.hidden = true;
        field.appendChild(err);
        form.appendChild(field);
      }

      var actions = el('div', 'uif-dialog__actions');
      var cancelBtn = null;
      if (cfg.kind !== 'alert') {
        cancelBtn = el('button', 'uif-btn uif-btn--secondary', cfg.cancelText || strings.cancel);
        cancelBtn.type = 'button';
        actions.appendChild(cancelBtn);
      }
      var okBtn = el('button', 'uif-btn ' + (cfg.variant === 'danger' ? 'uif-btn--danger' : 'uif-btn--primary'), cfg.okText);
      okBtn.type = 'submit';
      actions.appendChild(okBtn);
      form.appendChild(actions);
      dlg.appendChild(form);
      document.body.appendChild(dlg);

      var settled = false;
      function finish(value) {
        if (settled) return;
        settled = true;
        if (dlg.open) dlg.close();
        dlg.remove();
        if (lastFocus && typeof lastFocus.focus === 'function' && lastFocus.isConnected) lastFocus.focus();
        resolve(value);
      }
      var cancelValue = cfg.kind === 'confirm' ? false : cfg.kind === 'prompt' ? null : undefined;

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (cfg.kind === 'prompt') {
          if (cfg.required && !input.value.trim()) {
            err.textContent = strings.required;
            err.hidden = false;
            input.setAttribute('aria-invalid', 'true');
            input.focus();
            return;
          }
          finish(input.value);
        } else {
          finish(cfg.kind === 'confirm' ? true : undefined);
        }
      });
      if (cancelBtn) cancelBtn.addEventListener('click', function () { finish(cancelValue); });
      dlg.addEventListener('cancel', function (e) { e.preventDefault(); finish(cancelValue); }); // Esc
      dlg.addEventListener('click', function (e) { if (e.target === dlg) finish(cancelValue); }); // backdrop

      dlg.showModal();
      // Focus: input for prompt; the safe choice (cancel) for destructive confirms; otherwise the main button.
      (input || (cfg.variant === 'danger' && cancelBtn) || okBtn).focus();
      if (input && input.select) input.select();
    });
  }

  function alertDialog(input) {
    var o = normalize(input, strings.alertTitle);
    return openDialog({ kind: 'alert', title: o.title || strings.alertTitle, message: o.message, okText: o.okText || strings.ok, variant: o.variant });
  }

  function confirmDialog(input) {
    var o = normalize(input, strings.confirmTitle);
    return openDialog({
      kind: 'confirm', title: o.title || strings.confirmTitle, message: o.message, variant: o.variant,
      okText: o.confirmText || o.okText || (o.variant === 'danger' ? strings.danger : strings.confirm),
      cancelText: o.cancelText
    });
  }

  function promptDialog(input, defaultValue) {
    var o = normalize(input, strings.promptTitle);
    if (typeof input === 'string') { o = { title: input, defaultValue: defaultValue }; }
    return openDialog({
      kind: 'prompt', title: o.title || strings.promptTitle, message: o.message, label: o.label,
      defaultValue: o.defaultValue, placeholder: o.placeholder, inputType: o.inputType, required: o.required,
      okText: o.confirmText || o.okText || strings.ok, cancelText: o.cancelText, variant: o.variant
    });
  }

  /* ---------------- data-confirm ---------------- */

  var PASS = '__uifConfirmed';

  function confirmFromElement(node) {
    return confirmDialog({
      title: node.getAttribute('data-confirm-title') || undefined,
      message: node.getAttribute('data-confirm'),
      confirmText: node.getAttribute('data-confirm-ok') || undefined,
      cancelText: node.getAttribute('data-confirm-cancel') || undefined,
      variant: node.getAttribute('data-confirm-variant') || 'danger'
    });
  }

  // Clicks on links / buttons carrying data-confirm (forms are handled on submit).
  document.addEventListener('click', function (e) {
    var node = e.target.closest && e.target.closest('[data-confirm]');
    if (!node || node.tagName === 'FORM') return;
    if (node[PASS]) { node[PASS] = false; return; }
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let new-tab clicks through
    e.preventDefault();
    e.stopImmediatePropagation();
    confirmFromElement(node).then(function (ok) {
      if (!ok) return;
      node[PASS] = true;
      // A submit button's own data-confirm already covered its form.
      if (node.form && node.form.hasAttribute('data-confirm')) node.form[PASS] = true;
      node.click(); // replays the original action: link navigation, form submit with submitter, or JS handlers
    });
  }, true);

  // Form submissions where the <form> carries data-confirm.
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.hasAttribute || !form.hasAttribute('data-confirm')) return;
    if (form[PASS]) { form[PASS] = false; return; }
    e.preventDefault();
    e.stopImmediatePropagation();
    var submitter = e.submitter || null;
    confirmFromElement(form).then(function (ok) {
      if (!ok) return;
      form[PASS] = true;
      if (typeof form.requestSubmit === 'function') form.requestSubmit(submitter);
      else form.submit();
    });
  }, true);

  global.UI = {
    toast: toast,
    alert: alertDialog,
    confirm: confirmDialog,
    prompt: promptDialog,
    /** Override default button labels, e.g. UI.setStrings({ confirm: 'Lanjut' }) */
    setStrings: function (s) { Object.assign(strings, s || {}); },
    /** Change toast defaults, e.g. UI.setToastDefaults({ duration: 6000 }) */
    setToastDefaults: function (d) { Object.assign(toastDefaults, d || {}); }
  };
})(window);
