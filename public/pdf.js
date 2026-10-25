// ⬇ Download PDF: builds a real A4 PDF file in the browser (no outside library, nothing is uploaded).
// Each page is drawn on a canvas (text + the question pictures), saved as a JPEG and wrapped in a small PDF.
// A question picture that fits on one page is never split: it starts on the next page, with its heading (user 2026-10-25,
// screenshots of a diagram cut in half: "can you resolve anything like this"). Only pictures taller than a page are split,
// at a blank gap; the margin strips of the papers ("do not write in this area", "leave blank" columns, side rules) are
// ignored when looking for a gap, because they run down the whole picture and used to hide every gap.
// Y8M_PDF.save(blocks, filename, onProgress). blocks: {t:'title'|'meta'|'head'|'note', text, sub} · {t:'img', src} · {t:'steps', title, items} · {t:'break'}
(function () {
  const W = 1240, H = 1754, M = 74, CW = W - 2 * M, TOP = 70, BOTTOM = H - 80;   // A4 at 150 dpi, 12.5 mm margins
  const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });

  function wrap(g, text, width) {
    const out = [];
    for (const para of String(text).split('\n')) {
      let line = '';
      for (const w of para.split(/\s+/)) {
        const t = line ? line + ' ' + w : w;
        if (g.measureText(t).width > width && line) { out.push(line); line = w; } else line = t;
      }
      out.push(line);
    }
    return out;
  }
  function blankRows(img) {   // which rows of the picture are white (safe places to cut)
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const w = c.width, h = c.height, d = g.getImageData(0, 0, w, h).data, rows = new Uint8Array(h), dark = new Uint32Array(w);
    const isDark = k => d[k] < 200 || d[k + 1] < 200 || d[k + 2] < 200;
    // margin strips: columns near the left or right edge that are dark in a quarter of the rows or more (rules, hatched bands)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if ((x < w * 0.15 || x > w * 0.8) && isDark((y * w + x) * 4)) dark[x]++;
    const skip = new Uint8Array(w);
    for (let x = 0; x < w; x++) if (dark[x] > h * 0.25) for (let k = Math.max(0, x - 3); k <= Math.min(w - 1, x + 3); k++) skip[k] = 1;
    for (let y = 0; y < h; y++) {
      let ok = 1;
      for (let x = Math.floor(w * 0.01); x < w * 0.99; x += 2) { if (skip[x]) continue; if (isDark((y * w + x) * 4)) { ok = 0; break; } }
      rows[y] = ok;
    }
    return rows;
  }

  async function render(blocks, onProgress) {
    const pages = []; let g, y;
    const cache = new Map(), getImg = src => { if (!cache.has(src)) cache.set(src, loadImg(src)); return cache.get(src); };
    const imgH = im => im.naturalHeight * CW / im.naturalWidth;   // height on the page at full width
    const newPage = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.fillStyle = '#111'; g.textBaseline = 'top'; pages.push(c); y = TOP; };
    const room = h => { if (y + h > BOTTOM) newPage(); };
    const text = (s, size, weight, color, gap) => {
      g.font = `${weight} ${size}px ${FONT}`; g.fillStyle = color;
      for (const l of wrap(g, s, CW)) { room(size * 1.35); g.font = `${weight} ${size}px ${FONT}`; g.fillStyle = color; g.fillText(l, M, y); y += size * 1.35; }
      y += gap;
    };
    newPage();
    for (let bi = 0; bi < blocks.length; bi++) {
      const b = blocks[bi];
      if (onProgress) onProgress(bi / blocks.length);
      if (b.t === 'break') { if (y > TOP) newPage(); }
      else if (b.t === 'title') text(b.text, 34, 800, '#111', 6);
      else if (b.t === 'meta') text(b.text, 19, 400, '#444', 4);
      else if (b.t === 'note') text(b.text, 19, 400, '#555', 10);
      else if (b.t === 'head') {   // question heading: keep it with its picture (all of it when the picture fits on one page)
        const nx = blocks[bi + 1], im = nx && nx.t === 'img' && !nx.fit ? await getImg(nx.src) : null;
        g.font = `400 17px ${FONT}`;
        const headH = 50 + (b.sub ? wrap(g, b.sub, CW).length * 22 : 0), ph = im ? imgH(im) : 0;
        if (im && ph <= BOTTOM - TOP - headH) { if (y + headH + ph > BOTTOM && y > TOP) newPage(); }
        else if (im && y > TOP && BOTTOM - y - headH < (BOTTOM - TOP) * 0.6) newPage();   // a very tall question starts high on a page
        else room(200);
        y += 10;
        g.font = `800 25px ${FONT}`; g.fillStyle = '#111'; g.fillText(b.text, M, y); y += 34;
        if (b.sub) { g.font = `400 17px ${FONT}`; g.fillStyle = '#555'; for (const l of wrap(g, b.sub, CW)) { g.fillText(l, M, y); y += 22; } }
        y += 6;
      }
      else if (b.t === 'img') {
        const img = await getImg(b.src);
        if (!img) { text('(picture missing)', 19, 400, '#999', 6); continue; }
        if (b.fit) {   // one whole picture shrunk to fit the space left on this page (the formula sheet)
          if (BOTTOM - y < 600) newPage();
          const s = Math.min(CW / img.naturalWidth, (BOTTOM - y) / img.naturalHeight), w = img.naturalWidth * s, h = img.naturalHeight * s;
          g.drawImage(img, M + (CW - w) / 2, y, w, h); y += h + 14; continue;
        }
        const s = CW / img.naturalWidth, IH = img.naturalHeight;
        if (IH * s <= BOTTOM - TOP) {   // fits on one page: never split, start a new page if needed
          if (y + IH * s > BOTTOM) newPage();
          g.drawImage(img, M, y, CW, IH * s); y += IH * s + 14; continue;
        }
        if (y > TOP && BOTTOM - y < (BOTTOM - TOP) * 0.6) newPage();
        let rows = null, sy = 0;
        while (sy < IH) {
          let avail = Math.floor((BOTTOM - y) / s);
          if (avail < Math.min(IH - sy, 120)) { newPage(); avail = Math.floor((BOTTOM - y) / s); }
          let ey = IH;
          if (IH - sy > avail) {   // does not fit: cut at a blank line
            rows = rows || blankRows(img); ey = sy + avail;
            // cut in the middle of the widest white gap in the lower part of the space (a gap between parts of the question,
            // not the small gaps inside a diagram or between lines)
            let best = -1, bestLen = 0, run = 0;
            for (let k = sy + Math.floor(avail * 0.35); k <= sy + avail; k++) {
              if (rows[k]) run++;
              if (!rows[k] || k === sy + avail) { if (run >= 6 && run >= bestLen) { bestLen = run; best = rows[k] ? k - 2 : k - Math.ceil(run / 2); } if (!rows[k]) run = 0; }
            }
            if (best > sy) ey = best;
          }
          g.drawImage(img, 0, sy, img.naturalWidth, ey - sy, M, y, CW, (ey - sy) * s);
          y += (ey - sy) * s; sy = ey;
          if (sy < IH) newPage();
        }
        y += 14;
      }
      else if (b.t === 'steps') {
        g.font = `400 20px ${FONT}`;
        const lines = b.items.flatMap((it, k) => wrap(g, `${k + 1}. ${it}`, CW - 40));
        const h = 34 + lines.length * 27 + 14;
        room(Math.min(h, 300));
        g.fillStyle = '#16A34A'; g.fillRect(M, y, 5, Math.min(h, BOTTOM - y));
        g.font = `800 20px ${FONT}`; g.fillStyle = '#111'; g.fillText(b.title, M + 20, y + 6); y += 34;
        g.font = `400 20px ${FONT}`;
        for (const l of lines) {
          if (y + 27 > BOTTOM) { newPage(); g.fillStyle = '#16A34A'; g.fillRect(M, y, 5, 27 * 4); g.font = `400 20px ${FONT}`; }
          g.fillStyle = '#111'; g.fillText(l, M + 20, y); y += 27;
        }
        y += 18;
      }
    }
    pages.forEach((c, i) => { const p = c.getContext('2d'); p.font = `400 16px ${FONT}`; p.fillStyle = '#777'; p.textBaseline = 'top'; p.textAlign = 'center'; p.fillText(`Page ${i + 1} of ${pages.length}`, W / 2, H - 50); });
    return pages;
  }

  async function pdf(pages) {   // one JPEG per A4 page
    const enc = new TextEncoder(), parts = [], offs = [];
    let len = 0;
    const put = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
    const obj = (n, body) => { offs[n] = len; put(`${n} 0 obj\n`); body(); put('\nendobj\n'); };
    put('%PDF-1.4\n'); put(new Uint8Array([37, 226, 227, 207, 211, 10]));
    const n = pages.length, kids = pages.map((_, i) => `${3 + 3 * i} 0 R`).join(' ');
    obj(1, () => put('<< /Type /Catalog /Pages 2 0 R >>'));
    obj(2, () => put(`<< /Type /Pages /Kids [${kids}] /Count ${n} >>`));
    for (let i = 0; i < n; i++) {
      const jpg = new Uint8Array(await (await new Promise(r => pages[i].toBlob(r, 'image/jpeg', 0.9))).arrayBuffer());
      const p = 3 + 3 * i, cs = `q 595.28 0 0 841.89 0 0 cm /Im0 Do Q`;
      obj(p, () => put(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R >>`));
      obj(p + 1, () => put(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`));
      obj(p + 2, () => { put(`<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`); put(jpg); put('\nendstream'); });
    }
    const xref = len, total = 3 + 3 * n;
    put(`xref\n0 ${total}\n0000000000 65535 f \n`);
    for (let k = 1; k < total; k++) put(String(offs[k]).padStart(10, '0') + ' 00000 n \n');
    put(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(parts, { type: 'application/pdf' });
  }

  async function save(blocks, filename, onProgress) {
    const blob = await pdf(await render(blocks, onProgress));
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return blob;
  }
  window.Y8M_PDF = { save, render, pdf };
})();
