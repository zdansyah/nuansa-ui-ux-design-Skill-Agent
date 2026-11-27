/*!
 * theme.js — runtime theming for token-based UIs. Lets the whole site (or each user)
 * pick an accent color, light/dark mode, corner style and density. Every value is
 * written as a CSS custom property on <html>, so any component that uses the tokens
 * from design-tokens.md updates instantly — no rebuild, no per-page CSS.
 *
 *   Theme.apply({ primary: '#d4ff3a' })          // accent; derived tokens are computed
 *   Theme.apply({ palette: 'tonal' })             // 'solid' | 'pastel' | 'tonal' (senada) | 'duo' (dua warna) | 'mono' (hitam-putih + logo)
 *   Theme.apply({ palette: 'duo', secondary: '#f97316' })  // second color for highlights/tints (auto-picked if omitted)
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

  /* ---------- color styles (palette) ---------- */
  function toHsl(rgb) {
    var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, h = 0, s = 0, d = max - min;
    if (d) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }
  function fromHsl(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    if (!s) return [l * 255, l * 255, l * 255];
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    function f(t) { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }
    return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
  }
  function pastelOf(rgb, hueShift) { var hsl = toHsl(rgb); return toHex(fromHsl(hsl[0] + (hueShift || 0), Math.min(0.75, Math.max(0.45, hsl[1])), 0.9)); }
  var TINTS = ['--tint-lime', '--tint-violet', '--tint-orange', '--tint-sky', '--tint-pink', '--tint-mint'];

  // palette: 'solid' | 'pastel' | 'tonal' (senada) | 'duo' (dua warna) | 'mono' (hitam-putih + logo)
  function paletteVars(dark) {
    var css = getComputedStyle(root);
    var pHex = state.primary || css.getPropertyValue('--color-primary').trim();
    var p = parseHex(pHex);
    if (!p) return {};
    var v = derive(toHex(p), dark);
    var white = [255, 255, 255], ink = [17, 18, 20];
    var style = state.palette || 'solid';
    var tints = [];
    if (style === 'solid') {
      v['--color-action'] = v['--color-primary'];
      v['--color-on-action'] = v['--color-on-primary'];
      tints = [0.84, 0.9, 0.88, 0.93, 0.86, 0.91].map(function (t) { return toHex(mix(p, dark ? ink : white, t)); }); // soft brand tints, so tiles match the brand
    } else if (style === 'pastel') {
      v['--color-action'] = v['--color-primary'];
      v['--color-on-action'] = v['--color-on-primary'];
      tints = [0, 40, -40, 160, 80, -80].map(function (h) { return pastelOf(p, h); });
      if (!dark) v['--color-bg'] = toHex(mix(parseHex(pastelOf(p, 0)), white, 0.7));
    } else if (style === 'tonal') {
      v['--color-action'] = v['--color-primary'];
      v['--color-on-action'] = v['--color-on-primary'];
      tints = [0.86, 0.8, 0.9, 0.74, 0.83, 0.93].map(function (t) { return toHex(mix(p, dark ? ink : white, t)); });
      if (!dark) {
        v['--color-bg'] = toHex(mix(p, white, 0.94));
        v['--color-surface-muted'] = toHex(mix(p, white, 0.9));
        v['--color-border'] = toHex(mix(p, white, 0.84));
        v['--color-border-strong'] = toHex(mix(p, white, 0.74));
      }
    } else if (style === 'duo') {
      var s2 = parseHex(state.secondary) || fromHsl(toHsl(p)[0] + 150, Math.max(0.5, toHsl(p)[1]), 0.5);
      v['--color-action'] = v['--color-primary'];
      v['--color-on-action'] = v['--color-on-primary'];
      v['--color-secondary'] = toHex(s2);
      v['--chart-accent'] = v['--color-primary'];
      tints = [0.8, 0.86, 0.84, 0.9, 0.82, 0.88].map(function (t, i) { return toHex(mix(i % 2 ? p : s2, dark ? ink : white, t)); });
    } else if (style === 'mono') {
      // Black-and-white UI; the brand color lives in the logo and the focus ring only.
      v['--color-action'] = dark ? '#f4f5f7' : '#111214';
      v['--color-on-action'] = dark ? '#111214' : '#ffffff';
      v['--color-primary-soft'] = dark ? 'rgb(255 255 255 / 0.08)' : '#ededee';
      v['--color-primary-text'] = dark ? '#f4f5f7' : '#111214';
      v['--chart-accent'] = dark ? '#f4f5f7' : '#111214';
      tints = dark ? ['#1f2125', '#24262a', '#1c1e22', '#26282c', '#212327', '#1a1c20'] : ['#f1f1f2', '#e9e9eb', '#f4f4f5', '#e4e4e7', '#eeeeef', '#f7f7f8'];
    }
    if (dark && (style === 'pastel')) tints = tints.map(function (t) { return 'rgb(' + parseHex(t).join(' ') + ' / 0.16)'; });
    // Tinted surfaces lower the contrast of muted text: darken it until it reads on the tinted surface.
    if (!dark && (style === 'tonal' || style === 'pastel')) {
      var muted = parseHex(css.getPropertyValue('--color-text-muted').trim()) || [106, 111, 120];
      var surf = parseHex(v['--color-surface-muted'] || css.getPropertyValue('--color-surface-muted').trim()) || white;
      var bgc = parseHex(v['--color-bg'] || '') || surf;
      var worst = luminance(surf) < luminance(bgc) ? surf : bgc;
      v['--color-text-muted'] = toHex(readableOn(muted, 4.6)(worst));
    }
    tints.forEach(function (t, i) { v[TINTS[i]] = t; });
    return v;
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
    if (state.primary || state.palette || state.secondary) Object.assign(vars, paletteVars(isDark()));
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
    var L = Object.assign({ palette: 'Gaya warna', solid: 'Solid', pastel: 'Pastel', tonal: 'Senada', duo: 'Dua warna', mono: 'Hitam-putih', secondary: 'Warna kedua', color: 'Warna utama', custom: 'Warna kustom', mode: 'Mode', light: 'Terang', dark: 'Gelap', system: 'Sistem', radius: 'Sudut', sharp: 'Tegas', soft: 'Lembut', round: 'Bulat', density: 'Kepadatan', comfortable: 'Lega', compact: 'Rapat', reset: 'Atur ulang' }, o.labels);
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

    if (o.palette !== false) {
      var palGroup = seg('palette', L.palette, [{ value: 'solid', label: L.solid }, { value: 'pastel', label: L.pastel }, { value: 'tonal', label: L.tonal }, { value: 'duo', label: L.duo }, { value: 'mono', label: L.mono }], state.palette || 'solid');
      var secWrap = document.createElement('label');
      secWrap.className = 'tp-secondary';
      var secInput = document.createElement('input');
      secInput.type = 'color';
      secInput.value = state.secondary || '#f97316';
      secInput.addEventListener('input', function () { apply({ secondary: secInput.value }); });
      secWrap.appendChild(secInput);
      secWrap.appendChild(document.createTextNode(' ' + L.secondary));
      secWrap.hidden = (state.palette || 'solid') !== 'duo';
      palGroup.appendChild(secWrap);
      palGroup.querySelector('.tp-seg').classList.add('tp-seg--wrap');
      // Show the secondary color actually in use (auto-picked when the user hasn't chosen one).
      var syncSecondary = function () {
        secWrap.hidden = state.palette !== 'duo';
        var used = getComputedStyle(root).getPropertyValue('--color-secondary').trim();
        if (!state.secondary && parseHex(used)) secInput.value = toHex(parseHex(used));
      };
      palGroup.addEventListener('click', syncSecondary);
      syncSecondary();
      container.appendChild(palGroup);
    }

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
