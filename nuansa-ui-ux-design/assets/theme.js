/*!
 * theme.js — runtime theming for token-based UIs. Lets the whole site (or each user)
 * pick an accent color, light/dark mode, corner style and density. Every value is
 * written as a CSS custom property on <html>, so any component that uses the tokens
 * from design-tokens.md updates instantly — no rebuild, no per-page CSS.
 *
 *   Theme.apply({ primary: '#d4ff3a' })          // accent; derived tokens are computed
 *   Theme.apply({ mode: 'dark' })                 // 'light' | 'dark' | 'system'
 *   Theme.apply({ radius: 'round' })              // 'sharp' | 'soft' | 'round'
 *   Theme.apply({ density: 'compact' })           // 'comfortable' | 'compact'
 *   Theme.reset()                                 // back to the stylesheet defaults
 *   Theme.mountPicker(document.querySelector('#appearance'))   // ready-made settings panel
 *   document.addEventListener('themechange', e => console.log(e.detail))
 *
 * Derived from `primary` automatically:
 *   --color-primary-hover   darker/lighter shade for hover
 *   --color-primary-soft    tinted background (selected rows, active nav)
 *   --color-on-primary      black or white, whichever is readable on the accent
 *   --color-primary-text    accent usable as TEXT on the surface (darkened for light accents like lime/yellow)
 *   --ring                  focus ring
 *
 * Persistence: localStorage (per browser). For a site-wide brand chosen by an admin,
 * save the same object on the server and pass it to Theme.apply() — see theming.md.
 * To avoid a flash of the default theme, include the inline boot snippet from theming.md in <head>.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'nuansa-theme';
  var root = document.documentElement;
  var mql = global.matchMedia ? global.matchMedia('(prefers-color-scheme: dark)') : null;

  var PRESETS = [
    { name: 'Biru', primary: '#2563eb' },
    { name: 'Indigo', primary: '#4f46e5' },
    { name: 'Hijau', primary: '#16a34a' },
    { name: 'Teal', primary: '#0d9488' },
    { name: 'Oranye', primary: '#f97316' },
    { name: 'Merah', primary: '#e11d48' },
    { name: 'Lime', primary: '#d4ff3a' },
    { name: 'Hitam', primary: '#111111' }
  ];

  var RADIUS = {
    sharp: { '--radius-sm': '4px', '--radius-md': '6px', '--radius-lg': '8px', '--radius-control': '4px' },
    soft:  { '--radius-sm': '6px', '--radius-md': '10px', '--radius-lg': '16px', '--radius-control': '8px' },
    round: { '--radius-sm': '10px', '--radius-md': '20px', '--radius-lg': '28px', '--radius-control': '9999px' }
  };
  var DENSITY = {
    comfortable: { '--control-height': '40px', '--control-height-sm': '32px', '--density': '1' },
    compact:     { '--control-height': '34px', '--control-height-sm': '28px', '--density': '0.8' }
  };

  /* ---------- color math ---------- */
  function parseHex(hex) {
    var h = String(hex || '').trim().replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    if (!/^[0-9a-f]{6}$/i.test(h)) return null;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function toHex(rgb) {
    return '#' + rgb.map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }).join('');
  }
  function mix(a, b, t) { return [0, 1, 2].map(function (i) { return a[i] + (b[i] - a[i]) * t; }); }
  function luminance(rgb) {
    var c = rgb.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) {
    var la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  function readableOn(bg, target) {
    // Shift `bg` toward black (or white on dark surfaces) until it reaches `target` contrast against the surface.
    return function (surface) {
      var toward = luminance(surface) > 0.5 ? [0, 0, 0] : [255, 255, 255];
      for (var t = 0; t <= 1.0001; t += 0.04) {
        var c = mix(bg, toward, t);
        if (contrast(c, surface) >= target) return c;
      }
      return toward;
    };
  }

  function derive(primaryHex, dark) {
    var p = parseHex(primaryHex);
    if (!p) return {};
    var white = [255, 255, 255], black = [0, 0, 0];
    var surface = dark ? parseHex('#111827') : white;
    var onPrimary = contrast(p, white) >= contrast(p, black) ? '#ffffff' : '#0a0a0a';
    var isLight = luminance(p) > 0.4;
    return {
      '--color-primary': toHex(p),
      '--color-primary-hover': toHex(mix(p, isLight ? black : (dark ? white : black), isLight ? 0.08 : 0.14)),
      '--color-primary-soft': dark ? 'rgb(' + p.join(' ') + ' / 0.16)' : toHex(mix(p, white, isLight ? 0.75 : 0.9)),
      '--color-on-primary': onPrimary,
      '--color-primary-text': toHex(readableOn(p, 4.5)(surface)),
      '--ring': '0 0 0 3px rgb(' + (isLight && !dark ? mix(p, black, 0.25) : p).map(Math.round).join(' ') + ' / 0.35)'
    };
  }

  /* ---------- state ---------- */
  var state = load() || {};
  var applied = [];

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }
  function isDark() {
    return state.mode === 'dark' || (state.mode === 'system' && mql && mql.matches);
  }

  function render() {
    applied.forEach(function (k) { root.style.removeProperty(k); });
    applied = [];
    var vars = {};
    if (state.mode === 'light' || state.mode === 'dark') root.setAttribute('data-theme', state.mode);
    else if (state.mode === 'system') root.setAttribute('data-theme', isDark() ? 'dark' : 'light');
    else root.removeAttribute('data-theme');
    if (state.primary) Object.assign(vars, derive(state.primary, isDark()));
    if (state.radius && RADIUS[state.radius]) Object.assign(vars, RADIUS[state.radius]);
    if (state.density && DENSITY[state.density]) Object.assign(vars, DENSITY[state.density]);
    if (state.font) vars['--font-sans'] = state.font;
    Object.keys(vars).forEach(function (k) { root.style.setProperty(k, vars[k]); applied.push(k); });
    root.style.colorScheme = isDark() ? 'dark' : 'light';
    document.dispatchEvent(new CustomEvent('themechange', { detail: Object.assign({}, state) }));
  }

  function apply(partial, opts) {
    Object.keys(partial || {}).forEach(function (k) {
      if (partial[k] == null || partial[k] === '') delete state[k];
      else state[k] = partial[k];
    });
    if (!opts || opts.persist !== false) save();
    render();
    return Object.assign({}, state);
  }

  function reset() {
    state = {};
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    render();
  }

  if (mql) {
    var onScheme = function () { if (state.mode === 'system') render(); };
    if (mql.addEventListener) mql.addEventListener('change', onScheme); else if (mql.addListener) mql.addListener(onScheme);
  }

  /* ---------- picker UI ---------- */
  function seg(name, label, options, current) {
    var wrap = document.createElement('fieldset');
    wrap.className = 'tp-group';
    var legend = document.createElement('legend');
    legend.className = 'tp-label';
    legend.textContent = label;
    wrap.appendChild(legend);
    var row = document.createElement('div');
    row.className = 'tp-seg';
    row.setAttribute('role', 'radiogroup');
    options.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tp-seg__btn';
      b.textContent = o.label;
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(current === o.value));
      b.addEventListener('click', function () {
        var p = {}; p[name] = o.value; apply(p);
        row.querySelectorAll('.tp-seg__btn').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
      });
      row.appendChild(b);
    });
    wrap.appendChild(row);
    return wrap;
  }

  function mountPicker(container, options) {
    if (!container) return;
    var o = Object.assign({ presets: PRESETS, modes: true, radius: true, density: true, labels: {} }, options || {});
    var L = Object.assign({ color: 'Warna utama', custom: 'Warna kustom', mode: 'Mode', light: 'Terang', dark: 'Gelap', system: 'Sistem', radius: 'Sudut', sharp: 'Tegas', soft: 'Lembut', round: 'Bulat', density: 'Kepadatan', comfortable: 'Lega', compact: 'Rapat', reset: 'Atur ulang' }, o.labels);
    container.innerHTML = '';
    container.classList.add('theme-picker');

    var colorGroup = document.createElement('fieldset');
    colorGroup.className = 'tp-group';
    var legend = document.createElement('legend');
    legend.className = 'tp-label';
    legend.textContent = L.color;
    colorGroup.appendChild(legend);
    var swatches = document.createElement('div');
    swatches.className = 'tp-swatches';
    var current = (state.primary || getComputedStyle(root).getPropertyValue('--color-primary') || '').trim().toLowerCase();
    o.presets.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tp-swatch';
      b.style.background = p.primary;
      b.title = p.name;
      b.setAttribute('aria-label', p.name);
      b.setAttribute('aria-pressed', String(current === p.primary.toLowerCase()));
      b.addEventListener('click', function () {
        apply({ primary: p.primary });
        custom.value = p.primary;
        swatches.querySelectorAll('.tp-swatch').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      });
      swatches.appendChild(b);
    });
    var customWrap = document.createElement('label');
    customWrap.className = 'tp-custom';
    customWrap.title = L.custom;
    var custom = document.createElement('input');
    custom.type = 'color';
    custom.setAttribute('aria-label', L.custom);
    custom.value = parseHex(current) ? toHex(parseHex(current)) : '#2563eb';
    custom.addEventListener('input', function () {
      apply({ primary: custom.value });
      swatches.querySelectorAll('.tp-swatch').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
    });
    customWrap.appendChild(custom);
    swatches.appendChild(customWrap);
    colorGroup.appendChild(swatches);
    container.appendChild(colorGroup);

    if (o.modes) container.appendChild(seg('mode', L.mode, [{ value: 'light', label: L.light }, { value: 'dark', label: L.dark }, { value: 'system', label: L.system }], state.mode || 'light'));
    if (o.radius) container.appendChild(seg('radius', L.radius, [{ value: 'sharp', label: L.sharp }, { value: 'soft', label: L.soft }, { value: 'round', label: L.round }], state.radius || 'soft'));
    if (o.density) container.appendChild(seg('density', L.density, [{ value: 'comfortable', label: L.comfortable }, { value: 'compact', label: L.compact }], state.density || 'comfortable'));

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'tp-reset';
    resetBtn.textContent = L.reset;
    resetBtn.addEventListener('click', function () { reset(); mountPicker(container, options); });
    container.appendChild(resetBtn);
  }

  render();

  global.Theme = {
    apply: apply,
    reset: reset,
    get: function () { return Object.assign({}, state); },
    derive: derive,
    contrast: function (a, b) { return contrast(parseHex(a), parseHex(b)); },
    presets: PRESETS,
    mountPicker: mountPicker
  };
})(window);
