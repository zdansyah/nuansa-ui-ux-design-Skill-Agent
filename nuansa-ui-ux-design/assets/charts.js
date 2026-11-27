/*!
 * charts.js — tiny dependency-free SVG charts that follow the skill's data rules:
 * one highlighted data point, muted (hatched) rest, quiet axes, dark tooltip,
 * compact locale-aware axis labels, keyboard + hover, theme-aware, accessible table.
 *
 *   Charts.bar(el,  { labels, values, highlight, format, label, height })
 *   Charts.area(el, { labels, values, highlight, format, label, height })
 *   const c = Charts.bar(...); c.update({ values: newValues, highlight: 2 });
 *
 * Colors come from CSS tokens: --chart-accent (falls back to --color-primary),
 * --chart-muted (--color-border-strong), --color-border (grid), --color-text-muted (labels),
 * --color-ink / --color-on-ink (tooltip). Re-renders on resize and on `themechange`.
 * Styles: .chart, .chart__tip, .chart__svg in assets/starter/nuansa.css.
 */
(function (global) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;
  var lang = document.documentElement.getAttribute('lang') || 'id-ID';
  var compact = new Intl.NumberFormat(lang, { notation: 'compact', maximumFractionDigits: 1 });
  var plain = new Intl.NumberFormat(lang);

  function css(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }
  function svgEl(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function niceMax(v) {
    if (!(v > 0)) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }
  function colors() {
    return {
      accent: css('--chart-accent', css('--color-primary', '#6d5efc')),
      muted: css('--chart-muted', css('--color-border-strong', '#d1d5db')),
      mutedBg: css('--color-surface-muted', '#f3f4f6'),
      grid: css('--color-border', '#e5e7eb'),
      text: css('--color-text-muted', '#6b7280'),
      surface: css('--color-surface', '#ffffff'),
    };
  }

  function frame(el, o) {
    el.classList.add('chart');
    el.innerHTML = '';
    // Height: explicit option, else fill the container if a layout gives it height (e.g. flex: 1 in a stretched card), else a default.
    var W = Math.max(el.clientWidth || 300, 200), H = o.height || Math.max(el.clientHeight || 0, W < 480 ? 200 : 240);
    var fmtAxis = o.formatAxis || function (v) { return compact.format(v); };
    var max = niceMax(Math.max.apply(null, o.values.concat([0])) * 1.08);
    var ticks = 4, longest = 0;
    for (var i = 0; i <= ticks; i++) longest = Math.max(longest, fmtAxis(max * i / ticks).length);
    var f = { W: W, H: H, max: max, ticks: ticks, fmtAxis: fmtAxis, padL: longest * 7 + 12, padR: 6, padT: 48, padB: 28 };
    f.cw = W - f.padL - f.padR;
    f.ch = H - f.padT - f.padB;
    var summary = o.label || 'Grafik';
    var hiIdx = o.values.indexOf(Math.max.apply(null, o.values));
    var fmt = o.format || function (v) { return plain.format(v); };
    f.svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, 'class': 'chart__svg', tabindex: '0', role: 'group',
      'aria-label': summary + '. Tertinggi ' + o.labels[hiIdx] + ' ' + fmt(o.values[hiIdx]) + '. Gunakan panah kiri/kanan untuk menelusuri.' }, el);
    var c = colors();
    for (i = 0; i <= ticks; i++) {
      var y = f.padT + f.ch - f.ch * i / ticks;
      svgEl('line', { x1: f.padL, x2: W - f.padR, y1: y, y2: y, stroke: c.grid, 'stroke-width': 1, 'stroke-dasharray': i === 0 ? '' : '3 4' }, f.svg);
      var t = svgEl('text', { x: f.padL - 10, y: y + 4, 'text-anchor': 'end', 'class': 'chart__axis' }, f.svg);
      t.textContent = fmtAxis(max * i / ticks);
    }
    f.tip = document.createElement('div');
    f.tip.className = 'chart__tip';
    f.tip.setAttribute('aria-live', 'polite');
    el.appendChild(f.tip);
    // Screen-reader data table.
    // Tables can't shrink below their content, so the visually-hidden class goes on a wrapper.
    var tableWrap = document.createElement('div');
    tableWrap.className = 'sr-only';
    var table = document.createElement('table');
    tableWrap.appendChild(table);
    var cap = table.createCaption(); cap.textContent = summary;
    o.labels.forEach(function (l, i2) { var r = table.insertRow(); r.insertCell().textContent = l; r.insertCell().textContent = fmt(o.values[i2]); });
    el.appendChild(tableWrap);
    f.fmt = fmt;
    f.colors = c;
    return f;
  }

  function xLabels(f, o, xAt) {
    var every = Math.ceil(o.labels.length / Math.max(2, Math.floor(f.cw / 44)));
    o.labels.forEach(function (l, i) {
      if (i % every !== 0 && i !== o.labels.length - 1) return;
      var t = svgEl('text', { x: xAt(i), y: f.H - 8, 'text-anchor': 'middle', 'class': 'chart__axis' }, f.svg);
      t.textContent = l;
    });
  }

  function showTip(f, o, i, x, y) {
    f.tip.innerHTML = '';
    var a = document.createElement('span'); a.className = 'chart__tip-label'; a.textContent = o.labels[i];
    var b = document.createElement('strong'); b.textContent = f.fmt(o.values[i]);
    f.tip.appendChild(a); f.tip.appendChild(b);
    // Position in pixels of the rendered SVG (it can be scaled), relative to the chart box.
    var sr = f.svg.getBoundingClientRect(), er = f.tip.parentNode.getBoundingClientRect();
    var sx = sr.width / f.W || 1, sy = sr.height / f.H || 1;
    var left = (sr.left - er.left) + x * sx;
    var half = f.tip.offsetWidth / 2 + 4;
    f.tip.style.left = Math.min(Math.max(left, half), er.width - half) + 'px';
    f.tip.style.top = ((sr.top - er.top) + y * sy) + 'px';
  }

  function interact(f, o, count, xAt, setHL) {
    function idxFromEvent(e) {
      var r = f.svg.getBoundingClientRect();
      var x = (e.clientX - r.left) * (f.W / r.width);
      var best = 0, d = Infinity;
      for (var i = 0; i < count; i++) { var dd = Math.abs(xAt(i) - x); if (dd < d) { d = dd; best = i; } }
      return best;
    }
    f.svg.addEventListener('pointermove', function (e) { setHL(idxFromEvent(e)); });
    f.svg.addEventListener('click', function (e) { setHL(idxFromEvent(e)); });
    f.svg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setHL(Math.min(count - 1, Math.max(0, f.current + (e.key === 'ArrowRight' ? 1 : -1))));
      }
    });
  }

  function drawBar(el, o, st) {
    var f = frame(el, o), c = f.colors, n = o.values.length;
    var id = 'chart-hatch-' + (++uid);
    var pat = svgEl('pattern', { id: id, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, svgEl('defs', {}, f.svg));
    svgEl('rect', { width: 6, height: 6, fill: c.mutedBg }, pat);
    svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: c.muted, 'stroke-width': 2 }, pat);
    var step = f.cw / n, bw = Math.max(6, Math.min(44, step * 0.62));
    var xAt = function (i) { return f.padL + step * i + step / 2; };
    var bars = o.values.map(function (v, i) {
      var h = Math.max(2, f.ch * v / f.max), x = xAt(i) - bw / 2, y = f.padT + f.ch - h;
      return svgEl('rect', { x: x, y: y, width: bw, height: h, rx: Math.min(8, bw / 2), fill: 'url(#' + id + ')', 'class': 'chart__bar' }, f.svg);
    });
    xLabels(f, o, xAt);
    function setHL(i) {
      if (f.current != null) bars[f.current].setAttribute('fill', 'url(#' + id + ')');
      f.current = st.highlight = i;
      bars[i].setAttribute('fill', c.accent);
      showTip(f, o, i, xAt(i), Number(bars[i].getAttribute('y')) - 8);
    }
    setHL(Math.min(st.highlight, n - 1));
    interact(f, o, n, xAt, setHL);
  }

  function smoothPath(pts, minY, maxY) {
    if (pts.length < 2) return '';
    var d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = Math.min(maxY, Math.max(minY, p1[1] + (p2[1] - p0[1]) / 6));
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = Math.min(maxY, Math.max(minY, p2[1] - (p3[1] - p1[1]) / 6));
      d += ' C' + c1x + ',' + c1y + ' ' + c2x + ',' + c2y + ' ' + p2[0] + ',' + p2[1];
    }
    return d;
  }

  function drawArea(el, o, st) {
    var f = frame(el, o), c = f.colors, n = o.values.length;
    var line = o.color || c.accent;
    var xAt = function (i) { return f.padL + (n === 1 ? f.cw / 2 : f.cw * i / (n - 1)); };
    var yAt = function (v) { return f.padT + f.ch - f.ch * v / f.max; };
    var pts = o.values.map(function (v, i) { return [xAt(i), yAt(v)]; });
    var base = f.padT + f.ch;
    var gid = 'chart-grad-' + (++uid);
    var grad = svgEl('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, svgEl('defs', {}, f.svg));
    svgEl('stop', { offset: '0%', 'stop-color': line, 'stop-opacity': 0.22 }, grad);
    svgEl('stop', { offset: '100%', 'stop-color': line, 'stop-opacity': 0 }, grad);
    var d = smoothPath(pts, f.padT, base);
    svgEl('path', { d: d + ' L' + xAt(n - 1) + ',' + base + ' L' + xAt(0) + ',' + base + ' Z', fill: 'url(#' + gid + ')' }, f.svg);
    svgEl('path', { d: d, fill: 'none', stroke: line, 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, f.svg);
    var guide = svgEl('line', { y1: f.padT - 4, y2: base, stroke: c.text, 'stroke-width': 1, 'stroke-dasharray': '3 4', opacity: 0.6 }, f.svg);
    var dot = svgEl('circle', { r: 5, fill: c.surface, stroke: line, 'stroke-width': 2.5 }, f.svg);
    xLabels(f, o, xAt);
    function setHL(i) {
      f.current = st.highlight = i;
      guide.setAttribute('x1', pts[i][0]); guide.setAttribute('x2', pts[i][0]);
      dot.setAttribute('cx', pts[i][0]); dot.setAttribute('cy', pts[i][1]);
      showTip(f, o, i, pts[i][0], pts[i][1] - 12);
    }
    setHL(Math.min(st.highlight, n - 1));
    interact(f, o, n, xAt, setHL);
  }

  function mount(el, opts, draw) {
    if (!el) return null;
    var st = { highlight: opts.highlight != null ? opts.highlight : opts.values.length - 1 };
    var render = function () { draw(el, opts, st); };
    render();
    if (global.ResizeObserver) {
      var w = el.clientWidth, h = el.clientHeight;
      // Re-render when the box changes size (e.g. a card stretched by its row after content loads).
      new ResizeObserver(function () {
        if (Math.abs(el.clientWidth - w) > 4 || Math.abs(el.clientHeight - h) > 4) { w = el.clientWidth; h = el.clientHeight; render(); }
      }).observe(el);
    }
    document.addEventListener('themechange', render);
    return { update: function (o) { Object.assign(opts, o); if (o.highlight != null) st.highlight = o.highlight; render(); } };
  }

  global.Charts = {
    bar: function (el, o) { return mount(el, o, drawBar); },
    area: function (el, o) { return mount(el, o, drawArea); },
    format: { compact: compact, number: plain },
  };
})(window);
