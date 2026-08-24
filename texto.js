// Extraccion de texto del PDF con layout, equivalente a `pdftotext -layout`
// (el mismo comando que alimenta el pipeline local del proyecto).

import * as pdfjsLib from "./pdf.min.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdf.worker.min.mjs";

function reconstruir(items) {
  const norm = items.filter((it) => it.str != null).map((it) => ({ str: it.str, x: it.x, y: it.y, w: it.w || 0 }));
  if (!norm.length) return "";
  const anchos = norm
    .filter((it) => it.str.trim().length > 0 && it.w > 0)
    .map((it) => it.w / it.str.length)
    .filter((n) => n > 0.3 && n < 40)
    .sort((a, b) => a - b);
  const charW = anchos.length ? anchos[Math.floor(anchos.length / 2)] : 5;
  const filas = [];
  const tol = 3;
  norm.sort((a, b) => b.y - a.y);
  for (const it of norm) {
    let f = filas.find((f) => Math.abs(f.y - it.y) <= tol);
    if (!f) { f = { y: it.y, items: [] }; filas.push(f); }
    f.items.push(it);
  }
  filas.sort((a, b) => b.y - a.y);
  const minX = Math.min(...norm.map((it) => it.x));
  return filas
    .map((f) => {
      f.items.sort((a, b) => a.x - b.x);
      let l = "";
      for (const it of f.items) {
        const col = Math.max(0, Math.round((it.x - minX) / charW));
        if (col > l.length) l += " ".repeat(col - l.length);
        l += it.str;
      }
      return l.replace(/\s+$/, "");
    })
    .join("\n");
}

export async function pdfATexto(buf) {
  const doc = await pdfjsLib.getDocument({ data: buf, isEvalSupported: false }).promise;
  let out = "";
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const items = tc.items.map((i) => ({ str: i.str, x: i.transform[4], y: i.transform[5], w: i.width }));
    out += reconstruir(items) + "\n";
  }
  return out;
}
