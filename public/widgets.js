// 🧮 Interactive revision widgets for the cheat sheets — "try it", not just reading (idea from the interactive
// digital-textbook video, user 2026-11-05). Each widget is a small, self-contained SVG + sliders, keyed by Edexcel
// 4MA1 syllabus section. window.Y9M_WIDGET(section) returns the HTML (or '' if none); window.Y9M_WIDGET_INIT(box)
// wires up the sliders inside a rendered container. No libraries; works offline.
// 2026-11-06: straight-line widget upgraded — rise/run triangle, plain-language readout (uphill/downhill, steepness,
// x- and y-intercepts), preset buttons, a predict-then-reveal, and a sign/decimal/m=0-safe equation.
(function () {
  const U = 18;              // pixels per unit
  const OX = 130, OY = 130;  // origin in svg coords
  const X2 = x => OX + x * U;
  const Y2 = y => OY - y * U;
  const num = n => (Math.round(n * 100) / 100).toString().replace('-', '−');  // proper minus sign for display

  // ---- a straight-line graph: drag the gradient m and the intercept c, the line and equation update live ----
  function lineGraphHTML() {
    return `<div class="cwdg" data-w="line">
      <div class="cwdg-head">🧮 Try it — move the sliders</div>
      <svg class="cwdg-svg" viewBox="0 0 260 260" role="img" aria-label="Graph of y = m x + c; use the sliders to change m and c">
        <rect x="14" y="14" width="232" height="232" rx="8" class="cwdg-bg"/>
        <g class="cwdg-grid"></g>
        <line class="cwdg-axis" x1="14" y1="130" x2="246" y2="130"/>
        <line class="cwdg-axis" x1="130" y1="14" x2="130" y2="246"/>
        <path class="cwdg-tri" d=""/>
        <text class="cwdg-trilbl" data-t="run" x="0" y="0">1 →</text>
        <text class="cwdg-trilbl" data-t="rise" x="0" y="0"></text>
        <line class="cwdg-line" x1="0" y1="0" x2="0" y2="0"/>
        <circle class="cwdg-yint" r="4"/>
      </svg>
      <p class="cwdg-eq" aria-live="polite"><span data-eq="full">y = x</span></p>
      <div class="cwdg-ctrl">
        <label>Gradient <b>m</b> = <output data-o="m">1</output>
          <input type="range" data-k="m" min="-5" max="5" step="0.5" value="1" aria-label="Gradient m"></label>
        <label>Intercept <b>c</b> = <output data-o="c">0</output>
          <input type="range" data-k="c" min="-6" max="6" step="1" value="0" aria-label="Intercept c"></label>
      </div>
      <div class="cwdg-presets">
        <button type="button" class="cwdg-chip" data-m="0" data-c="4">Flat (m = 0)</button>
        <button type="button" class="cwdg-chip" data-m="3" data-c="1">Steep up</button>
        <button type="button" class="cwdg-chip" data-m="-2" data-c="5">Downhill</button>
        <button type="button" class="cwdg-chip" data-m="1" data-c="0">y = x</button>
      </div>
      <div class="cwdg-read" data-read></div>
      <div class="cwdg-pr">
        <button type="button" class="cwdg-prbtn">🔮 Predict: which is steeper — y = 3x + 1 or y = x + 5?</button>
        <div class="cwdg-prans" hidden><b>y = 3x + 1 is steeper</b> — its gradient is 3 (up 3 for every 1 across), more than 1. But <b>y = x + 5 crosses higher</b>, at +5 instead of +1. The gradient <b>m</b> sets the steepness; the intercept <b>c</b> sets where it cuts the y-axis — they are independent, so set them above to check.</div>
      </div>
    </div>`;
  }

  function fmtEq(m, c) {
    if (m === 0) return 'y = ' + (c < 0 ? '−' + num(Math.abs(c)) : num(c));
    const sign = m < 0 ? '−' : '';
    const coef = Math.abs(m) === 1 ? '' : num(Math.abs(m));
    const cp = c > 0 ? ' + ' + num(c) : c < 0 ? ' − ' + num(Math.abs(c)) : '';
    return 'y = ' + sign + coef + 'x' + cp;
  }

  function initLine(el) {
    const grid = el.querySelector('.cwdg-grid');
    if (grid && !grid.childNodes.length) {       // draw unit gridlines once
      let g = '';
      for (let i = -6; i <= 6; i++) {
        if (i === 0) continue;
        g += `<line class="cwdg-gl" x1="${X2(i)}" y1="14" x2="${X2(i)}" y2="246"/>`;
        g += `<line class="cwdg-gl" x1="14" y1="${Y2(i)}" x2="246" y2="${Y2(i)}"/>`;
      }
      grid.innerHTML = g;
    }
    const line = el.querySelector('.cwdg-line'), dot = el.querySelector('.cwdg-yint'),
          tri = el.querySelector('.cwdg-tri'), runL = el.querySelector('[data-t="run"]'),
          riseL = el.querySelector('[data-t="rise"]'), read = el.querySelector('[data-read]');
    const val = k => parseFloat(el.querySelector(`input[data-k="${k}"]`).value);
    const draw = () => {
      const m = val('m'), c = val('c');
      line.setAttribute('x1', X2(-6)); line.setAttribute('y1', Y2(m * -6 + c));
      line.setAttribute('x2', X2(6));  line.setAttribute('y2', Y2(m * 6 + c));
      dot.setAttribute('cx', X2(0)); dot.setAttribute('cy', Y2(c));
      el.querySelector('[data-o="m"]').textContent = num(m);
      el.querySelector('[data-o="c"]').textContent = num(c);
      el.querySelector('[data-eq="full"]').textContent = fmtEq(m, c);
      // rise/run triangle: 1 right from the intercept, then m up — only when it fits on the grid
      const show = m !== 0 && Math.abs(c) <= 6 && Math.abs(m + c) <= 6;
      if (show) {
        tri.setAttribute('d', `M ${X2(0)} ${Y2(c)} L ${X2(1)} ${Y2(c)} L ${X2(1)} ${Y2(m + c)}`);
        tri.style.opacity = 1;
        runL.setAttribute('x', X2(0.1)); runL.setAttribute('y', Y2(c) + 12); runL.style.opacity = 1;
        riseL.setAttribute('x', X2(1) + 3); riseL.setAttribute('y', Y2(c + m / 2) + 3);
        riseL.textContent = (m > 0 ? '+' : '−') + num(Math.abs(m)); riseL.style.opacity = 1;
      } else { tri.style.opacity = 0; runL.style.opacity = 0; riseL.style.opacity = 0; }
      // plain-language readout
      const f = [];
      if (m === 0) f.push(`<div class="cwdg-fact">Gradient <b>m = 0</b> → the line is <b>flat (horizontal)</b>; y stays ${num(c)} everywhere.</div>`);
      else f.push(`<div class="cwdg-fact">Gradient <b>m = ${num(m)}</b> → the line goes <b>${m > 0 ? 'uphill ↗' : 'downhill ↘'}</b>: ${num(Math.abs(m))} ${m > 0 ? 'up' : 'down'} for every <b>1</b> across. Steeper when |m| is bigger.</div>`);
      f.push(`<div class="cwdg-fact">Intercept <b>c = ${num(c)}</b> → it crosses the y-axis at <b>(0, ${num(c)})</b> — the orange dot.</div>`);
      if (m !== 0) f.push(`<div class="cwdg-fact">It crosses the x-axis (where y = 0) at <b>x = ${num(-c / m)}</b>.</div>`);
      read.innerHTML = f.join('');
    };
    el.querySelectorAll('input[type="range"]').forEach(inp => inp.addEventListener('input', draw));
    el.querySelectorAll('.cwdg-chip').forEach(b => b.addEventListener('click', () => {
      el.querySelector('input[data-k="m"]').value = b.dataset.m;
      el.querySelector('input[data-k="c"]').value = b.dataset.c;
      draw();
    }));
    const pr = el.querySelector('.cwdg-prbtn'), pra = el.querySelector('.cwdg-prans');
    if (pr) pr.addEventListener('click', () => { pra.hidden = !pra.hidden; });
    draw();
  }

  const WIDGETS = { '3.3': lineGraphHTML };   // Straight-line graphs
  window.Y9M_WIDGET = section => (WIDGETS[section] ? WIDGETS[section]() : '');
  window.Y9M_WIDGET_INIT = box => { if (box) box.querySelectorAll('.cwdg[data-w="line"]').forEach(initLine); };

  // styles
  const css = `
  .cwdg{border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:0 0 10px;background:var(--card)}
  .cwdg-head{font-weight:800;font-size:14.5px;margin:0 0 8px;color:var(--brand)}
  .cwdg-svg{display:block;width:100%;max-width:300px;margin:0 auto;height:auto;overflow:hidden}
  .cwdg-bg{fill:color-mix(in srgb,var(--brand) 5%,var(--card));stroke:var(--line)}
  .cwdg-gl{stroke:color-mix(in srgb,var(--ink) 9%,transparent);stroke-width:1}
  .cwdg-axis{stroke:var(--muted);stroke-width:1.5}
  .cwdg-tri{fill:none;stroke:var(--accent);stroke-width:2;stroke-dasharray:4 3;transition:opacity .1s}
  .cwdg-trilbl{fill:var(--accent);font:700 11px system-ui;opacity:0}
  .cwdg-line{stroke:var(--brand);stroke-width:3;stroke-linecap:round}
  .cwdg-yint{fill:var(--warn);stroke:var(--card);stroke-width:2}
  .cwdg-eq{text-align:center;font-size:22px;font-weight:800;color:var(--brand);margin:8px 0 4px}
  .cwdg-ctrl{display:grid;gap:8px;margin:10px 0 4px}
  .cwdg-ctrl label{display:flex;align-items:center;gap:8px;font-size:14px;flex-wrap:wrap}
  .cwdg-ctrl output{font-weight:800;min-width:2.2em;color:var(--brand)}
  .cwdg-ctrl input[type=range]{flex:1;min-width:140px;accent-color:var(--brand)}
  .cwdg-presets{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0 2px}
  .cwdg-chip{border:1px solid var(--line);background:var(--card);color:var(--ink);padding:6px 10px;border-radius:999px;cursor:pointer;font:600 13px system-ui}
  .cwdg-chip:hover{border-color:var(--brand);color:var(--brand)}
  .cwdg-read{display:grid;gap:6px;margin-top:8px}
  .cwdg-fact{padding:7px 10px;border-radius:9px;background:color-mix(in srgb,var(--brand) 9%,var(--card));font-size:13.5px;line-height:1.4}
  .cwdg-fact b{color:var(--brand)}
  .cwdg-pr{margin-top:10px}
  .cwdg-prbtn{border:1px solid var(--brand);background:transparent;color:var(--brand);padding:8px 12px;border-radius:10px;cursor:pointer;font:700 13.5px system-ui;text-align:left;width:100%}
  .cwdg-prans{margin-top:8px;padding:9px 11px;border-radius:9px;background:color-mix(in srgb,var(--brand) 9%,var(--card));font-size:13.5px;line-height:1.45}
  .cwdg-tip{margin:2px 0 0;line-height:1.4}`;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
})();
