/* ===== PPO 互动教程 共享库 =====
 * 图表 + 数学辅助（softmax/高斯策略、PPO 裁剪目标），无外部依赖。
 */
"use strict";

function $(id) { return document.getElementById(id); }
function fmt(v, d) { if (v === undefined || v === null || isNaN(v)) return "–"; return v.toFixed(d === undefined ? 2 : d); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function randInt(n) { return Math.floor(Math.random() * n); }
function mean(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0; }
function variance(a) { if (a.length < 2) return 0; const m = mean(a); return a.reduce((s, x) => s + (x - m) * (x - m), 0) / a.length; }
function std(a) { return Math.sqrt(variance(a)); }

/* 标准正态采样（Box–Muller） */
let _spare = null;
function gauss() {
  if (_spare !== null) { const v = _spare; _spare = null; return v; }
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const r = Math.sqrt(-2 * Math.log(u));
  _spare = r * Math.sin(2 * Math.PI * v);
  return r * Math.cos(2 * Math.PI * v);
}

/* softmax / 分类分布 */
function softmax(logits) {
  const m = Math.max(...logits);
  const ex = logits.map(z => Math.exp(z - m));
  const s = ex.reduce((a, b) => a + b, 0);
  return ex.map(e => e / s);
}
function sampleCat(probs) {
  let x = Math.random(), c = 0;
  for (let i = 0; i < probs.length; i++) { c += probs[i]; if (x < c) return i; }
  return probs.length - 1;
}
function catEntropy(probs) {
  let h = 0;
  for (const p of probs) if (p > 1e-12) h -= p * Math.log(p);
  return h;
}

/* ---------------- PPO 裁剪目标数学 ----------------
 * 给定比率 r、优势 A、裁剪幅度 eps，返回各项与梯度是否被裁剪。 */
function ppoClip(r, A, eps) {
  const unclipped = r * A;
  const clippedR = clamp(r, 1 - eps, 1 + eps);
  const clipped = clippedR * A;
  const obj = Math.min(unclipped, clipped);
  // 梯度为 0（被裁剪）当且仅当 (A>0 且 r≥1+eps) 或 (A<0 且 r≤1-eps)
  const gradZero = (A > 0 && r >= 1 + eps) || (A < 0 && r <= 1 - eps);
  return { unclipped, clipped, obj, gradZero };
}

/* ============================================================
 *  图表组件
 * ============================================================ */

/* 折线图：series=[{data:[..]|dots, color, label, width}], 以索引为 x
 * opts: {yLabel,xLabel,yZero,hline:{y,label,color},xvals,x0,ymin,ymax,bands:[{y0,y1,color}]} */
function lineChart(canvas, series, opts) {
  const o = opts || {};
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth || 420, H = canvas.clientHeight || 200;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const padL = 50, padR = 14, padT = 16, padB = 28;

  let ymin = Infinity, ymax = -Infinity, n = 0;
  for (const s of series) { n = Math.max(n, s.data.length); for (const v of s.data) { if (!isFinite(v)) continue; ymin = Math.min(ymin, v); ymax = Math.max(ymax, v); } }
  if (o.hline) { ymin = Math.min(ymin, o.hline.y); ymax = Math.max(ymax, o.hline.y); }
  if (!isFinite(ymin)) { ymin = 0; ymax = 1; }
  if (o.yZero) { ymin = Math.min(ymin, 0); ymax = Math.max(ymax, 0); }
  if (o.ymin !== undefined) ymin = o.ymin;
  if (o.ymax !== undefined) ymax = o.ymax;
  if (ymax - ymin < 1e-9) { ymax += 1; ymin -= 1; }
  const padv = (ymax - ymin) * 0.08; ymin -= padv; ymax += padv;

  const X = i => padL + (n <= 1 ? 0 : i / (n - 1) * (W - padL - padR));
  const Y = v => padT + (1 - (v - ymin) / (ymax - ymin)) * (H - padT - padB);

  if (o.bands) for (const b of o.bands) { ctx.fillStyle = b.color; ctx.fillRect(padL, Y(b.y1), W - padL - padR, Y(b.y0) - Y(b.y1)); }

  ctx.strokeStyle = "#dde7e6"; ctx.fillStyle = "#889"; ctx.font = "11px sans-serif"; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const v = ymin + (ymax - ymin) * i / 4, y = Y(v);
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
    ctx.textAlign = "right"; ctx.fillText(Math.abs(v) < 100 ? v.toFixed(2) : v.toFixed(0), padL - 5, y + 3);
  }
  ctx.textAlign = "center";
  if (n > 1) for (let i = 0; i <= 4; i++) {
    const idx = Math.round((n - 1) * i / 4);
    const label = o.xvals ? o.xvals[Math.min(idx, o.xvals.length - 1)] : idx + (o.x0 || 0);
    ctx.fillText(String(label), X(idx), H - 9);
  }
  if (o.xLabel) ctx.fillText(o.xLabel, (padL + W - padR) / 2, H - 0.5);
  if (o.yLabel) { ctx.save(); ctx.translate(12, (padT + H - padB) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(o.yLabel, 0, 0); ctx.restore(); }

  if (o.hline) {
    ctx.strokeStyle = o.hline.color || "#c0392b"; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(padL, Y(o.hline.y)); ctx.lineTo(W - padR, Y(o.hline.y)); ctx.stroke(); ctx.setLineDash([]);
    if (o.hline.label) { ctx.fillStyle = o.hline.color || "#c0392b"; ctx.textAlign = "left"; ctx.fillText(o.hline.label, padL + 4, Y(o.hline.y) - 5); }
  }
  for (const s of series) {
    if (s.dots) { ctx.fillStyle = s.color || "#d9802b"; for (let i = 0; i < s.data.length; i++) { if (!isFinite(s.data[i])) continue; ctx.beginPath(); ctx.arc(X(i), Y(s.data[i]), s.r || 2, 0, 7); ctx.fill(); } }
    else { ctx.strokeStyle = s.color || "#0c7c8c"; ctx.lineWidth = s.width || 2; if (s.dash) ctx.setLineDash(s.dash); ctx.beginPath(); let st = false; for (let i = 0; i < s.data.length; i++) { if (!isFinite(s.data[i])) continue; if (!st) { ctx.moveTo(X(i), Y(s.data[i])); st = true; } else ctx.lineTo(X(i), Y(s.data[i])); } ctx.stroke(); ctx.setLineDash([]); }
  }
  let lx = padL + 8; ctx.font = "12px sans-serif"; ctx.textAlign = "left";
  for (const s of series) { if (!s.label) continue; ctx.fillStyle = s.color || "#0c7c8c"; ctx.fillRect(lx, padT - 2, 14, 3); ctx.fillStyle = "#566"; ctx.fillText(s.label, lx + 18, padT + 3); lx += 18 + ctx.measureText(s.label).width + 16; }
}

/* 任意 x-y 折线图：series=[{pts:[[x,y]..], color, width, dash, label, dots}]
 * opts:{xmin,xmax,ymin,ymax,xLabel,yLabel,vlines:[{x,label,color,dash}],hlines:[..],bands:[{x0,x1,color}|{y0,y1,color}],markers:[{x,y,color,label}]} */
function xyChart(canvas, series, opts) {
  const o = opts || {};
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth || 460, H = canvas.clientHeight || 260;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const padL = 52, padR = 16, padT = 16, padB = 34;

  let xmin = o.xmin, xmax = o.xmax, ymin = o.ymin, ymax = o.ymax;
  // 各边界独立计算：调用方可只指定其中一部分
  let dxmin = Infinity, dxmax = -Infinity, dymin = Infinity, dymax = -Infinity;
  for (const s of series) for (const p of s.pts) {
    if (p[0] < dxmin) dxmin = p[0]; if (p[0] > dxmax) dxmax = p[0];
    if (isFinite(p[1])) { if (p[1] < dymin) dymin = p[1]; if (p[1] > dymax) dymax = p[1]; }
  }
  if (o.markers) for (const m of o.markers) { if (isFinite(m.y)) { if (m.y < dymin) dymin = m.y; if (m.y > dymax) dymax = m.y; } }
  if (xmin === undefined) xmin = dxmin; if (xmax === undefined) xmax = dxmax;
  if (ymin === undefined) ymin = dymin; if (ymax === undefined) ymax = dymax;
  if (!isFinite(xmin) || !isFinite(xmax)) { xmin = 0; xmax = 1; }
  if (!isFinite(ymin) || !isFinite(ymax)) { ymin = -1; ymax = 1; }
  if (ymax - ymin < 1e-9) { ymax += 1; ymin -= 1; }
  const X = x => padL + (x - xmin) / (xmax - xmin) * (W - padL - padR);
  const Y = y => padT + (1 - (y - ymin) / (ymax - ymin)) * (H - padT - padB);

  // 竖直阴影带（按 x）
  if (o.bands) for (const b of o.bands) {
    ctx.fillStyle = b.color;
    if (b.x0 !== undefined) ctx.fillRect(X(b.x0), padT, X(b.x1) - X(b.x0), H - padT - padB);
    else ctx.fillRect(padL, Y(b.y1), W - padL - padR, Y(b.y0) - Y(b.y1));
  }
  // 网格 + 刻度
  ctx.strokeStyle = "#e3eded"; ctx.fillStyle = "#889"; ctx.font = "11px sans-serif"; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const v = ymin + (ymax - ymin) * i / 4, y = Y(v);
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
    ctx.textAlign = "right"; ctx.fillText(v.toFixed(2), padL - 5, y + 3);
  }
  ctx.textAlign = "center";
  for (let i = 0; i <= 5; i++) {
    const v = xmin + (xmax - xmin) * i / 5, x = X(v);
    ctx.strokeStyle = "#eef4f4"; ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, H - padB); ctx.stroke();
    ctx.fillStyle = "#889"; ctx.fillText(v.toFixed(2), x, H - 18);
  }
  // y=0 轴
  if (ymin < 0 && ymax > 0) { ctx.strokeStyle = "#b9c6c5"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(padL, Y(0)); ctx.lineTo(W - padR, Y(0)); ctx.stroke(); }
  // 竖线
  if (o.vlines) for (const vl of o.vlines) {
    ctx.strokeStyle = vl.color || "#888"; ctx.lineWidth = 1.4; if (vl.dash !== null) ctx.setLineDash(vl.dash || [4, 3]);
    ctx.beginPath(); ctx.moveTo(X(vl.x), padT); ctx.lineTo(X(vl.x), H - padB); ctx.stroke(); ctx.setLineDash([]);
    if (vl.label) { ctx.fillStyle = vl.color || "#888"; ctx.textAlign = "center"; ctx.fillText(vl.label, X(vl.x), padT - 4); }
  }
  if (o.xLabel) { ctx.fillStyle = "#566"; ctx.textAlign = "center"; ctx.fillText(o.xLabel, (padL + W - padR) / 2, H - 3); }
  if (o.yLabel) { ctx.save(); ctx.fillStyle = "#566"; ctx.translate(13, (padT + H - padB) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText(o.yLabel, 0, 0); ctx.restore(); }

  for (const s of series) {
    ctx.strokeStyle = s.color || "#0c7c8c"; ctx.fillStyle = s.color || "#0c7c8c"; ctx.lineWidth = s.width || 2;
    if (s.dash) ctx.setLineDash(s.dash);
    if (s.dots) { for (const p of s.pts) { if (!isFinite(p[1])) continue; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), s.r || 2.5, 0, 7); ctx.fill(); } }
    else { ctx.beginPath(); let st = false; for (const p of s.pts) { if (!isFinite(p[1])) continue; if (!st) { ctx.moveTo(X(p[0]), Y(p[1])); st = true; } else ctx.lineTo(X(p[0]), Y(p[1])); } ctx.stroke(); }
    ctx.setLineDash([]);
  }
  if (o.markers) for (const m of o.markers) {
    ctx.fillStyle = m.color || "#c0392b"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(X(m.x), Y(m.y), m.r || 5, 0, 7); ctx.fill(); ctx.stroke();
    if (m.label) { ctx.fillStyle = m.color || "#c0392b"; ctx.textAlign = "left"; ctx.font = "12px sans-serif"; ctx.fillText(m.label, X(m.x) + 8, Y(m.y) - 6); }
  }
  // 图例
  let lx = padL + 8; ctx.font = "12px sans-serif"; ctx.textAlign = "left";
  for (const s of series) { if (!s.label) continue; ctx.fillStyle = s.color || "#0c7c8c"; ctx.fillRect(lx, padT - 2, 14, 3); ctx.fillStyle = "#566"; ctx.fillText(s.label, lx + 18, padT + 3); lx += 18 + ctx.measureText(s.label).width + 16; }
}

/* 直方图 */
function histChart(canvas, values, opts) {
  const o = opts || {};
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth || 420, H = canvas.clientHeight || 160;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (!values.length) { ctx.fillStyle = "#9aa"; ctx.font = "13px sans-serif"; ctx.textAlign = "center"; ctx.fillText(o.empty || "暂无样本", W / 2, H / 2); return; }
  let lo = o.lo !== undefined ? o.lo : Math.min(...values), hi = o.hi !== undefined ? o.hi : Math.max(...values);
  if (hi - lo < 1e-9) { lo -= 0.5; hi += 0.5; }
  const nb = o.bins || 30, counts = new Array(nb).fill(0);
  for (const v of values) counts[clamp(Math.floor((v - lo) / (hi - lo) * nb), 0, nb - 1)]++;
  const cmax = Math.max(...counts), padB = 24, padT = 8, bw = W / nb;
  ctx.fillStyle = o.color || "rgba(12,124,140,0.65)";
  for (let i = 0; i < nb; i++) { const h = counts[i] / cmax * (H - padB - padT); ctx.fillRect(i * bw + 1, H - padB - h, bw - 2, h); }
  const m = mean(values), mx = clamp((m - lo) / (hi - lo) * W, 0, W);
  ctx.strokeStyle = "#c0392b"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(mx, padT); ctx.lineTo(mx, H - padB); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "#778"; ctx.font = "11px sans-serif"; ctx.textAlign = "left"; ctx.fillText(fmt(lo, 2), 2, H - 8); ctx.textAlign = "right"; ctx.fillText(fmt(hi, 2), W - 2, H - 8);
  ctx.textAlign = "center"; ctx.fillStyle = "#c0392b"; ctx.fillText((o.meanLabel || "均值 ") + fmt(m, 3), clamp(mx, 46, W - 46), H - 8);
  if (o.title) { ctx.fillStyle = "#566"; ctx.textAlign = "left"; ctx.fillText(o.title, 4, 12); }
}

/* 概率条组（DOM） */
function renderBars(container, items) {
  // items: [{label, p, color, sub, highlight}]
  container.innerHTML = items.map(it =>
    `<div class="barrow"><div class="lab" style="${it.highlight ? 'font-weight:700;color:#0c7c8c' : ''}">${it.label}</div>
     <div class="track"><div class="fill" style="width:${(it.p * 100).toFixed(1)}%;background:${it.color || '#0c7c8c'}"></div>
     <div class="val">${(it.p * 100).toFixed(1)}%${it.sub ? ' &nbsp;<span style="color:#c0392b;font-size:11.5px">' + it.sub + '</span>' : ''}</div></div></div>`
  ).join("");
}
