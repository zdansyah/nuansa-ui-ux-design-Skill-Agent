/*!
 * ui-feedback.js — dependency-free replacement for every native browser popup:
 * alert(), confirm(), prompt(), the "Please fill out this field" validation bubble,
 * the "Leave site?" dialog for in-app links, and the yellow title tooltip.
 * Pair with ui-feedback.css (popups) and ui-controls.css (checkbox/select/file/scrollbar).
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
    if (node[PASS]) { node[PASS] = false; e.__uifPassed = true; return; }
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let new-tab clicks through
    // Submit buttons: show validation errors first; only ask for confirmation once the form is valid.
    if (node.form && node.type === 'submit' && !node.form.noValidate && !node.formNoValidate && !node.form.checkValidity()) return;
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

  /* ---------------- Form validation: inline messages instead of browser bubbles ----------------
   * Works on every form automatically, with no markup changes: the browser still validates
   * (required, type=email, minlength, pattern, min/max…) and still blocks the submit, but the
   * native "Please fill out this field" bubble is suppressed and a styled inline message is
   * shown under the field instead. Opt out per form/field with data-native-validation.
   * Custom text per field: data-error-message="…" (or data-error-required / data-error-pattern …).
   */
  var V = isId
    ? { required: 'Wajib diisi.', select: 'Silakan pilih salah satu.', check: 'Centang untuk melanjutkan.', email: 'Format email tidak valid.', url: 'Format URL tidak valid (awali dengan https://).', tooShort: 'Minimal {n} karakter.', tooLong: 'Maksimal {n} karakter.', min: 'Nilai minimal {n}.', max: 'Nilai maksimal {n}.', step: 'Nilai tidak sesuai kelipatan.', pattern: 'Format tidak sesuai.', number: 'Masukkan angka yang valid.', invalid: 'Isian tidak valid.', summary: 'Periksa {n} isian yang ditandai.' }
    : { required: 'This field is required.', select: 'Please choose an option.', check: 'Please tick this box to continue.', email: 'Enter a valid email address.', url: 'Enter a valid URL (starting with https://).', tooShort: 'Use at least {n} characters.', tooLong: 'Use at most {n} characters.', min: 'Value must be at least {n}.', max: 'Value must be at most {n}.', step: 'Value is not a valid step.', pattern: 'Format does not match.', number: 'Enter a valid number.', invalid: 'This value is not valid.', summary: 'Check the {n} highlighted fields.' };

  function fieldMessage(el) {
    var v = el.validity, d = el.dataset || {};
    var pick = function (key, fallback, n) { return (d['error' + key.charAt(0).toUpperCase() + key.slice(1)] || d.errorMessage || fallback).replace('{n}', n); };
    if (v.valueMissing) return pick('required', el.type === 'checkbox' ? V.check : (el.tagName === 'SELECT' || el.type === 'radio') ? V.select : V.required);
    if (v.typeMismatch) return pick('type', el.type === 'email' ? V.email : el.type === 'url' ? V.url : V.invalid);
    if (v.badInput) return pick('type', V.number);
    if (v.tooShort) return pick('length', V.tooShort, el.minLength);
    if (v.tooLong) return pick('length', V.tooLong, el.maxLength);
    if (v.rangeUnderflow) return pick('range', V.min, el.min);
    if (v.rangeOverflow) return pick('range', V.max, el.max);
    if (v.stepMismatch) return pick('range', V.step);
    if (v.patternMismatch) return pick('pattern', el.title || V.pattern);
    if (v.customError) return el.validationMessage;
    return d.errorMessage || V.invalid;
  }

  function errorAnchor(el) {
    // Put the message after the control's wrapper when it lives in one (input groups, custom selects, radio groups).
    if (el.type === 'radio' || el.type === 'checkbox') return el.closest('fieldset, [role=radiogroup], .field, label') || el;
    return el.closest('.input-group, .search, .select-wrap') || el;
  }

  function showFieldError(el, msg) {
    var key = el.id || el.name || ('f' + Math.random().toString(36).slice(2, 7));
    var errId = 'uif-err-' + key.replace(/[^\w-]/g, '_');
    var err = document.getElementById(errId);
    if (!err) {
      err = el.closest('.field') && el.closest('.field').querySelector('.field__error:not([data-uif])');
      if (!err || err.textContent.trim()) {
        err = el2('p', 'field__error uif-field-error');
        err.setAttribute('data-uif', '');
        var anchor = errorAnchor(el);
        anchor.insertAdjacentElement('afterend', err);
      }
      err.id = errId;
    }
    err.textContent = msg;
    err.hidden = false;
    el.setAttribute('aria-invalid', 'true');
    var by = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    if (by.indexOf(errId) === -1) { by.push(errId); el.setAttribute('aria-describedby', by.join(' ')); }
    var field = el.closest('.field'); if (field) field.classList.add('has-error');
  }

  function clearFieldError(el) {
    el.removeAttribute('aria-invalid');
    var key = el.id || el.name;
    var err = key && document.getElementById('uif-err-' + key.replace(/[^\w-]/g, '_'));
    if (err) { err.textContent = ''; err.hidden = true; }
    var field = el.closest('.field'); if (field) field.classList.remove('has-error');
  }
  function el2(tag, cls) { return el(tag, cls); }

  var invalidBatch = [];
  document.addEventListener('invalid', function (e) {
    var f = e.target;
    if (!f || f.closest('[data-native-validation]')) return;
    e.preventDefault(); // suppresses the browser's validation bubble
    showFieldError(f, fieldMessage(f));
    if (invalidBatch.indexOf(f) !== -1) return; // the same field can fire twice (pre-check + browser)
    invalidBatch.push(f);
    if (invalidBatch.length === 1) {
      setTimeout(function () {
        var first = invalidBatch[0], n = invalidBatch.length;
        invalidBatch = [];
        if (first && typeof first.focus === 'function') {
          first.focus({ preventScroll: true });
          first.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        }
        if (n > 1) toast(V.summary.replace('{n}', n), { type: 'error' });
      }, 0);
    }
  }, true);

  function revalidate(e) {
    var f = e.target;
    if (!f || !f.willValidate || f.getAttribute('aria-invalid') !== 'true') return;
    if (f.validity.valid) clearFieldError(f); else showFieldError(f, fieldMessage(f));
    if (f.type === 'radio' && f.form && f.name) {
      Array.prototype.forEach.call(f.form.querySelectorAll('input[type=radio][name="' + f.name + '"]'), function (r) { if (r.validity.valid) clearFieldError(r); });
    }
  }
  document.addEventListener('input', revalidate, true);
  document.addEventListener('change', revalidate, true);

  /* ---------------- Unsaved-changes guard (in-app navigation) ----------------
   * <form data-unsaved-guard> … </form>
   * When the form has been edited and the user clicks a link that leaves the page, a styled
   * UI.confirm appears instead of losing data silently. Closing the tab/reloading can ONLY be
   * guarded by the browser's own beforeunload dialog (browsers forbid custom UI there), so that
   * native prompt is used only as a last resort and only while there are unsaved changes.
   */
  var dirtyForms = new Set();
  document.addEventListener('input', function (e) {
    var form = e.target && e.target.form;
    if (form && form.hasAttribute('data-unsaved-guard')) dirtyForms.add(form);
  }, true);
  document.addEventListener('submit', function (e) { dirtyForms.delete(e.target); }, false);
  function hasUnsaved() {
    dirtyForms.forEach(function (f) { if (!f.isConnected) dirtyForms.delete(f); });
    return dirtyForms.size > 0;
  }
  document.addEventListener('click', function (e) {
    if (!hasUnsaved() || e.defaultPrevented || e.__uifPassed) return; // already confirmed via data-confirm
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a[PASS] || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(javascript|mailto|tel):/i.test(href)) return;
    var inGuarded = false;
    dirtyForms.forEach(function (f) { if (f.contains(a)) inGuarded = true; });
    if (inGuarded) return;
    e.preventDefault();
    confirmDialog({
      title: isId ? 'Tinggalkan halaman?' : 'Leave this page?',
      message: isId ? 'Perubahan yang belum disimpan akan hilang.' : 'Changes you made will be lost.',
      confirmText: isId ? 'Tinggalkan' : 'Leave', cancelText: isId ? 'Tetap di sini' : 'Stay', variant: 'danger'
    }).then(function (ok) { if (ok) { dirtyForms.clear(); location.href = a.href; } });
  }, false);
  global.addEventListener('beforeunload', function (e) {
    if (!hasUnsaved()) return;
    e.preventDefault();
    e.returnValue = ''; // browser-controlled dialog; text cannot be customized
  });

  /* ---------------- Tooltips: replace the native yellow title tooltip ----------------
   * Use data-tooltip="…" on any element (styled in ui-feedback.css), or call
   * UI.upgradeTooltips() once to convert existing title="" attributes on interactive elements.
   */
  function upgradeTooltips(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('a[title], button[title], [role=button][title], .icon-btn[title]'), function (n) {
      var t = n.getAttribute('title');
      if (!t) return;
      n.setAttribute('data-tooltip', t);
      // Icon/emoji-only buttons (no letters or digits) need the tooltip text as their accessible name.
      if (!/[\p{L}\p{N}]/u.test(n.textContent) && !n.getAttribute('aria-label')) n.setAttribute('aria-label', t);
      n.removeAttribute('title');
    });
  }

  global.UI = {
    toast: toast,
    alert: alertDialog,
    confirm: confirmDialog,
    prompt: promptDialog,
    /** Show inline validation messages for a form now (e.g. before a fetch submit). Returns true when valid. */
    validate: function (form) { return form.checkValidity(); },
    /** Mark a guarded form as clean after saving via fetch/AJAX. */
    markSaved: function (form) { if (form) dirtyForms.delete(form); else dirtyForms.clear(); },
    upgradeTooltips: upgradeTooltips,
    /** Override default button labels, e.g. UI.setStrings({ confirm: 'Lanjut' }) */
    setStrings: function (s) { Object.assign(strings, s || {}); },
    /** Change toast defaults, e.g. UI.setToastDefaults({ duration: 6000 }) */
    setToastDefaults: function (d) { Object.assign(toastDefaults, d || {}); }
  };
})(window);
