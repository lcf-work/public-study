/**
 * 《思考，快与慢》互动导读
 * Thinking, Fast and Slow — An Interactive Guide (Chinese)
 *
 * 单文件 React 组件，只依赖 React。默认导出 <ThinkingFastSlowGuide />。
 * 内容依据：丹尼尔·卡尼曼《思考，快与慢》中信出版社中译本通读，
 * 并补充了 2012–2024 年间的重复实验与后续研究（见"批判性阅读"一节的来源）。
 */
import React, { useState, useMemo, useEffect, useRef, useContext, createContext } from "react";

/* ============================================================
   工具函数
   ============================================================ */
const cx = (...a) => a.filter(Boolean).join(" ");
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lin = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
const fmtPct = (v, d = 0) => `${(v * 100).toFixed(d)}%`;
const fmtNum = (v, d = 0) =>
  Number(v).toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d });

/** 可复现的伪随机数（mulberry32） */
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randn(r) {
  let u = 0,
    v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function poisson(r, mean) {
  if (mean > 40) return Math.max(0, Math.round(mean + Math.sqrt(mean) * randn(r)));
  const L = Math.exp(-mean);
  let k = 0,
    p = 1;
  do {
    k++;
    p *= r();
  } while (p > L);
  return k - 1;
}
function mean(a) {
  return a.reduce((s, x) => s + x, 0) / (a.length || 1);
}
function pearson(x, y) {
  const mx = mean(x),
    my = mean(y);
  let sxy = 0,
    sxx = 0,
    syy = 0;
  for (let i = 0; i < x.length; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy || 1);
}
function ranks(arr) {
  const idx = arr.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
  const r = new Array(arr.length);
  idx.forEach(([, i], k) => (r[i] = k + 1));
  return r;
}
function logChoose(n, k) {
  let s = 0;
  for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i);
  return s;
}
/** 前景理论概率权重函数（Tversky & Kahneman 1992） */
const wProb = (p, g) => {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const a = Math.pow(p, g),
    b = Math.pow(1 - p, g);
  return a / Math.pow(a + b, 1 / g);
};
/** 前景理论价值函数 */
const vFun = (x, alpha, lambda) => (x >= 0 ? Math.pow(x, alpha) : -lambda * Math.pow(-x, alpha));

/* ============================================================
   样式（CSS 变量 + 明暗两套主题）
   ============================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700;900&display=swap');
.tfs-root{
  --paper:#f6f2ea; --surface:#fffdf8; --surface-2:#f1ece2; --ink:#1c1a17; --ink-2:#4d4840; --muted:#857f74;
  --line:#e2dbcf; --grid:#e8e2d7; --axis:#c3bcae;
  --s1:#eb6834; --s1-ink:#ad4415; --s1-soft:#fbe7dc;
  --s2:#2a78d6; --s2-ink:#1b5aa8; --s2-soft:#e2edfb;
  --c3:#1baf7a; --c3-ink:#0d7450; --c3-soft:#dcf3ea;
  --bad:#e34948; --bad-ink:#b3282a; --bad-soft:#fbe3e1;
  --good-ink:#0f7a3f; --warn-ink:#9a6500; --warn-soft:#fbf0d6;
  --shadow:0 1px 2px rgba(40,30,15,.05),0 10px 30px rgba(40,30,15,.06);
  --serif:"Noto Serif SC","Source Han Serif SC","Source Han Serif CN","Songti SC","STSong","SimSun",serif;
  --sans:"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC","Noto Sans CJK SC",system-ui,-apple-system,"Segoe UI",sans-serif;
  color-scheme:light;
  background:var(--paper); color:var(--ink); font-family:var(--sans); font-size:16px; line-height:1.78;
  min-height:100vh; -webkit-font-smoothing:antialiased;
}
.tfs-root[data-theme="dark"]{
  --paper:#12110f; --surface:#1b1a17; --surface-2:#24221e; --ink:#f2eee6; --ink-2:#c9c3b8; --muted:#948e82;
  --line:#35322c; --grid:#2d2b27; --axis:#4d4941;
  --s1:#d95926; --s1-ink:#f39a6f; --s1-soft:#3b2317;
  --s2:#3987e5; --s2-ink:#8ebbf3; --s2-soft:#172b45;
  --c3:#199e70; --c3-ink:#62d4a8; --c3-soft:#12302a;
  --bad:#e66767; --bad-ink:#f39a9a; --bad-soft:#3b1d1d;
  --good-ink:#5fd08e; --warn-ink:#f0c265; --warn-soft:#3a2e14;
  --shadow:0 1px 2px rgba(0,0,0,.3),0 10px 30px rgba(0,0,0,.25);
  color-scheme:dark;
}
.tfs-root *{box-sizing:border-box}
.tfs-root button{font:inherit}
.tfs-top{position:sticky;top:0;z-index:30;background:var(--paper);border-bottom:1px solid var(--line)}
.tfs-top-in{max-width:1260px;margin:0 auto;display:flex;align-items:center;gap:14px;padding:10px 20px}
.tfs-brand{font-family:var(--serif);font-weight:900;font-size:18px;letter-spacing:.02em;white-space:nowrap;cursor:pointer}
.tfs-brand small{font-family:var(--sans);font-weight:400;color:var(--muted);font-size:12px;margin-left:8px;letter-spacing:0}
.tfs-prog{flex:1;height:4px;background:var(--surface-2);border-radius:4px;overflow:hidden;min-width:60px}
.tfs-prog>i{display:block;height:100%;background:linear-gradient(90deg,var(--s1),var(--s2));border-radius:4px;transition:width .4s}
.tfs-progtxt{font-size:12px;color:var(--muted);white-space:nowrap}
.tfs-iconbtn{border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:999px;padding:5px 12px;font-size:13px;cursor:pointer;white-space:nowrap}
.tfs-iconbtn:hover{border-color:var(--axis)}
.tfs-pills{display:none;overflow-x:auto;gap:6px;padding:8px 16px 10px;scrollbar-width:none}
.tfs-pills::-webkit-scrollbar{display:none}
.tfs-pill{flex:none;border:1px solid var(--line);background:var(--surface);color:var(--ink-2);border-radius:999px;padding:4px 12px;font-size:13px;cursor:pointer}
.tfs-pill.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.tfs-shell{max-width:1260px;margin:0 auto;display:grid;grid-template-columns:250px minmax(0,1fr);gap:0}
.tfs-nav{position:sticky;top:53px;align-self:start;height:calc(100vh - 53px);overflow-y:auto;padding:22px 10px 30px 20px;border-right:1px solid var(--line)}
.tfs-navgrp{font-size:11px;color:var(--muted);letter-spacing:.12em;margin:16px 10px 6px}
.tfs-navbtn{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:0;background:transparent;color:var(--ink-2);padding:7px 10px;border-radius:9px;cursor:pointer;font-size:14px;line-height:1.4}
.tfs-navbtn:hover{background:var(--surface-2)}
.tfs-navbtn.on{background:var(--surface);color:var(--ink);box-shadow:var(--shadow);font-weight:600}
.tfs-navbtn .dot{width:8px;height:8px;border-radius:50%;flex:none;border:1.5px solid var(--axis)}
.tfs-navbtn .dot.seen{background:var(--c3);border-color:var(--c3)}
.tfs-navbtn .num{font-family:var(--serif);font-weight:700;color:var(--muted);width:18px;flex:none;font-size:13px}
.tfs-main{min-width:0;padding:34px 28px 90px}
.tfs-content{max-width:800px;margin:0 auto}
.tfs-content.wide{max-width:900px}
@media (max-width:960px){
  .tfs-shell{grid-template-columns:minmax(0,1fr)}
  .tfs-nav{display:none}
  .tfs-pills{display:flex}
  .tfs-main{padding:22px 16px 80px}
  .tfs-top-in{padding:10px 16px}
  .tfs-brand small{display:none}
}
.tfs-kicker{font-size:12px;letter-spacing:.18em;color:var(--muted);text-transform:uppercase;margin-bottom:6px}
.tfs-h1{font-family:var(--serif);font-weight:900;font-size:34px;line-height:1.3;margin:0 0 14px;letter-spacing:.01em}
.tfs-h2{font-family:var(--serif);font-weight:700;font-size:25px;line-height:1.4;margin:46px 0 12px;padding-top:6px}
.tfs-h3{font-family:var(--serif);font-weight:700;font-size:19px;line-height:1.45;margin:26px 0 8px}
.tfs-lead{font-size:18px;color:var(--ink-2);line-height:1.85;margin:0 0 18px}
.tfs-root p{margin:0 0 14px}
.tfs-p2{color:var(--ink-2)}
.tfs-small{font-size:13.5px;color:var(--muted);line-height:1.65}
.tfs-root strong{font-weight:700}
.tfs-root a{color:var(--s2-ink)}
.tfs-hr{border:0;border-top:1px solid var(--line);margin:34px 0}
.s1t{color:var(--s1-ink);font-weight:700}
.s2t{color:var(--s2-ink);font-weight:700}
.c3t{color:var(--c3-ink);font-weight:700}
.badt{color:var(--bad-ink);font-weight:700}
.mark1{background:linear-gradient(transparent 60%,var(--s1-soft) 60%)}
.mark2{background:linear-gradient(transparent 60%,var(--s2-soft) 60%)}
.tfs-card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:20px 22px;margin:18px 0;box-shadow:var(--shadow)}
.tfs-card.flat{box-shadow:none}
.tfs-cardtitle{font-family:var(--serif);font-weight:700;font-size:17.5px;margin:0 0 8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.tfs-tag{display:inline-flex;align-items:center;gap:6px;font-family:var(--sans);font-size:11.5px;font-weight:600;letter-spacing:.06em;padding:2px 9px;border-radius:999px;border:1px solid var(--line);color:var(--ink-2);background:var(--surface-2);white-space:nowrap}
.tfs-tag.lab{background:var(--s2-soft);color:var(--s2-ink);border-color:transparent}
.tfs-tag.s1{background:var(--s1-soft);color:var(--s1-ink);border-color:transparent}
.tfs-tag.c3{background:var(--c3-soft);color:var(--c3-ink);border-color:transparent}
.tfs-tag.warn{background:var(--warn-soft);color:var(--warn-ink);border-color:transparent}
.tfs-tag.bad{background:var(--bad-soft);color:var(--bad-ink);border-color:transparent}
.tfs-callout{border-radius:14px;padding:14px 18px;margin:16px 0;background:var(--surface-2);border:1px solid var(--line)}
.tfs-callout .ct{font-weight:700;font-size:14px;margin-bottom:4px;display:flex;gap:8px;align-items:center}
.tfs-callout.insight{background:var(--s2-soft);border-color:transparent}
.tfs-callout.insight .ct{color:var(--s2-ink)}
.tfs-callout.warn{background:var(--warn-soft);border-color:transparent}
.tfs-callout.warn .ct{color:var(--warn-ink)}
.tfs-callout.s1{background:var(--s1-soft);border-color:transparent}
.tfs-callout.s1 .ct{color:var(--s1-ink)}
.tfs-callout.c3{background:var(--c3-soft);border-color:transparent}
.tfs-callout.c3 .ct{color:var(--c3-ink)}
.tfs-callout p:last-child{margin-bottom:0}
.tfs-quote{font-family:var(--serif);font-size:18px;line-height:1.8;border-left:3px solid var(--s1);padding:4px 0 4px 16px;margin:18px 0;color:var(--ink)}
.tfs-quote cite{display:block;font-family:var(--sans);font-size:13px;color:var(--muted);font-style:normal;margin-top:4px}
.tfs-btn{border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:7px 14px;border-radius:10px;cursor:pointer;font-size:14.5px;line-height:1.5;transition:border-color .15s,background .15s}
.tfs-btn:hover{border-color:var(--axis)}
.tfs-btn:disabled{opacity:.45;cursor:not-allowed}
.tfs-btn.primary{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.tfs-btn.primary:hover{opacity:.9}
.tfs-btn.ghost{background:transparent}
.tfs-btn.sm{padding:4px 10px;font-size:13px;border-radius:8px}
.tfs-opt{display:block;width:100%;text-align:left;border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:10px 14px;border-radius:12px;cursor:pointer;margin:8px 0;font-size:15px;line-height:1.55}
.tfs-opt:hover{border-color:var(--axis)}
.tfs-opt.sel{border-color:var(--s2);background:var(--s2-soft)}
.tfs-opt.right{border-color:var(--c3);background:var(--c3-soft)}
.tfs-opt.wrong{border-color:var(--bad);background:var(--bad-soft)}
.tfs-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.tfs-grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.tfs-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
@media (max-width:640px){.tfs-grid2,.tfs-grid3{grid-template-columns:1fr}.tfs-h1{font-size:28px}.tfs-h2{font-size:22px}.tfs-lead{font-size:16.5px}.tfs-card{padding:16px}}
.tfs-input{font:inherit;font-size:15px;border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:9px;padding:7px 10px;width:120px}
.tfs-input:focus,.tfs-btn:focus-visible,.tfs-opt:focus-visible,.tfs-navbtn:focus-visible{outline:2px solid var(--s2);outline-offset:1px}
.tfs-textarea{font:inherit;font-size:14.5px;border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:10px;padding:10px 12px;width:100%;min-height:90px;resize:vertical}
.tfs-slider{margin:10px 0 4px}
.tfs-slider .lab{display:flex;justify-content:space-between;font-size:13.5px;color:var(--ink-2);gap:10px}
.tfs-slider .lab b{color:var(--ink);font-variant-numeric:tabular-nums}
.tfs-slider input{width:100%;accent-color:var(--s2);margin:4px 0 0}
.tfs-chart{width:100%;height:auto;display:block;overflow:visible}
.tfs-chart text{font-family:var(--sans)}
.tfs-readout{font-size:13.5px;color:var(--ink-2);min-height:22px;font-variant-numeric:tabular-nums}
.tfs-legend{display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--ink-2);margin:6px 0}
.tfs-legend span{display:inline-flex;align-items:center;gap:6px}
.tfs-legend i{display:inline-block;width:12px;height:12px;border-radius:3px}
.tfs-legend i.ln{height:3px;border-radius:2px;width:16px}
.tfs-table{width:100%;border-collapse:collapse;font-size:14px;margin:8px 0}
.tfs-table th,.tfs-table td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}
.tfs-table th{font-weight:600;color:var(--ink-2);font-size:13px;background:var(--surface-2)}
.tfs-table td.num,.tfs-table th.num{text-align:right;font-variant-numeric:tabular-nums}
.tfs-tablewrap{overflow-x:auto;margin:8px 0;border:1px solid var(--line);border-radius:12px}
.tfs-tablewrap .tfs-table{margin:0}
.tfs-tablewrap .tfs-table tr:last-child td{border-bottom:0}
.tfs-stat{background:var(--surface-2);border-radius:12px;padding:12px 14px}
.tfs-stat .v{font-size:26px;font-weight:700;line-height:1.2}
.tfs-stat .l{font-size:12.5px;color:var(--muted);margin-top:2px}
.tfs-chips{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
.tfs-chip{border:1px solid var(--line);background:var(--surface);color:var(--ink-2);border-radius:999px;padding:4px 12px;font-size:13.5px;cursor:pointer;line-height:1.5;transition:all .15s}
.tfs-chip:hover{border-color:var(--axis)}
.tfs-chip.on{background:var(--s1-soft);color:var(--s1-ink);border-color:var(--s1)}
.tfs-chip.dim{opacity:.32}
.tfs-chip.root{font-weight:600}
.tfs-chip.root.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.tfs-flow{display:flex;align-items:stretch;gap:0;flex-wrap:wrap;margin:14px 0}
.tfs-flowbox{flex:1 1 0;min-width:0;border:1.5px solid var(--line);border-radius:12px;padding:10px 9px;background:var(--surface);transition:all .25s;position:relative}
.tfs-flowbox.on{border-color:var(--s1);box-shadow:0 0 0 4px var(--s1-soft)}
.tfs-flowbox.s2.on{border-color:var(--s2);box-shadow:0 0 0 4px var(--s2-soft)}
.tfs-flowbox h5{margin:0 0 4px;font-size:13.5px;font-family:var(--serif);line-height:1.4}
.tfs-flowbox div{font-size:12px;color:var(--ink-2);line-height:1.5}
.tfs-flow{flex-wrap:nowrap}
.tfs-flowarrow{display:flex;align-items:center;justify-content:center;width:16px;flex:none;color:var(--muted);font-size:15px}
@media (max-width:760px){.tfs-flow{flex-direction:column}.tfs-flowbox{flex:none}.tfs-flowarrow{width:auto;height:20px;transform:rotate(90deg)}}
.tfs-steps{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}
.tfs-reveal{margin-top:12px;animation:tfsfade .35s ease}
@keyframes tfsfade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.tfs-wheel{transition:transform 3.2s cubic-bezier(.12,.72,.12,1)}
.tfs-foot{display:flex;justify-content:space-between;gap:12px;margin-top:50px;padding-top:20px;border-top:1px solid var(--line);flex-wrap:wrap}
.tfs-mono{font-variant-numeric:tabular-nums}
.tfs-bigword{font-size:44px;font-weight:800;letter-spacing:.06em;text-align:center;padding:26px 0;user-select:none}
.tfs-chlist{list-style:none;padding:0;margin:0}
.tfs-chlist li{display:grid;grid-template-columns:48px 1fr;gap:10px;padding:9px 0;border-bottom:1px dashed var(--line)}
.tfs-chlist li:last-child{border-bottom:0}
.tfs-chlist .n{font-family:var(--serif);font-weight:700;color:var(--muted);font-size:14px;padding-top:1px}
.tfs-chlist .t{font-weight:600}
.tfs-chlist .d{color:var(--ink-2);font-size:14.5px}
.tfs-partbar{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:16px 0}
@media (max-width:640px){.tfs-partbar{grid-template-columns:1fr 1fr}}
.tfs-partbtn{border:1px solid var(--line);background:var(--surface);border-radius:12px;padding:10px 12px;text-align:left;cursor:pointer;color:var(--ink)}
.tfs-partbtn.on{border-color:var(--ink);box-shadow:var(--shadow)}
.tfs-partbtn b{display:block;font-family:var(--serif);font-size:15px}
.tfs-partbtn span{font-size:12px;color:var(--muted)}
.tfs-quad{position:relative}
.tfs-score{font-size:40px;font-weight:800;line-height:1}
.tfs-kbd{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;background:var(--surface-2);border:1px solid var(--line);border-radius:6px;padding:1px 6px}
`;

/* ============================================================
   共享 UI 组件
   ============================================================ */
const NavCtx = createContext({ go: () => {}, focusRoot: null, setFocusRoot: () => {} });

function Card({ title, tag, tagTone, children, flat, id }) {
  return (
    <div className={cx("tfs-card", flat && "flat")} id={id}>
      {(title || tag) && (
        <div className="tfs-cardtitle">
          {tag && <span className={cx("tfs-tag", tagTone)}>{tag}</span>}
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
function Lab({ title, children, note }) {
  return (
    <Card title={title} tag="实验 · 亲自试一试" tagTone="lab">
      {note && <p className="tfs-small">{note}</p>}
      {children}
    </Card>
  );
}
function Callout({ type = "insight", title, children }) {
  const icon = { insight: "◆", warn: "▲", s1: "●", c3: "✓", plain: "—" }[type] || "◆";
  return (
    <div className={cx("tfs-callout", type)}>
      {title && (
        <div className="ct">
          <span aria-hidden="true">{icon}</span>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
function Quote({ children, cite }) {
  return (
    <blockquote className="tfs-quote">
      {children}
      {cite && <cite>—— {cite}</cite>}
    </blockquote>
  );
}
function Reveal({ label = "揭晓答案", children, onOpen, disabled }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {!open && (
        <button
          className="tfs-btn"
          disabled={disabled}
          onClick={() => {
            setOpen(true);
            onOpen && onOpen();
          }}
        >
          {label} ↓
        </button>
      )}
      {open && <div className="tfs-reveal">{children}</div>}
    </div>
  );
}
function Slider({ label, value, min, max, step = 1, onChange, format = (v) => v }) {
  return (
    <div className="tfs-slider">
      <div className="lab">
        <span>{label}</span>
        <b>{format(value)}</b>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}
function Stat({ v, l, tone }) {
  return (
    <div className="tfs-stat">
      <div className={cx("v", tone)}>{v}</div>
      <div className="l">{l}</div>
    </div>
  );
}
function DataTable({ columns, rows }) {
  return (
    <div className="tfs-tablewrap">
      <table className="tfs-table">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} className={c.num ? "num" : ""}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} className={columns[j] && columns[j].num ? "num" : ""}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function TableToggle({ columns, rows, label = "查看数据表" }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 6 }}>
      <button className="tfs-btn sm ghost" onClick={() => setOpen(!open)}>
        {open ? "收起数据表" : label}
      </button>
      {open && <DataTable columns={columns} rows={rows} />}
    </div>
  );
}
function Choice({ options, value, onChange, reveal, correct }) {
  return (
    <div>
      {options.map((o, i) => {
        const key = o.id ?? i;
        let cls = value === key ? "sel" : "";
        if (reveal && correct !== undefined) {
          if (key === correct) cls = "right";
          else if (value === key) cls = "wrong";
        }
        return (
          <button key={key} className={cx("tfs-opt", cls)} onClick={() => !reveal && onChange(key)}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** 测量容器宽度，使 SVG 的坐标与像素 1:1，窄屏上文字不会被缩小 */
function useWidth(initial = 640) {
  const ref = useRef(null);
  const [w, setW] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const upd = () => {
      const cw = el.clientWidth;
      if (cw) setW(cw);
    };
    upd();
    let ro = null;
    try {
      ro = new ResizeObserver(upd);
      ro.observe(el);
    } catch (e) {
      window.addEventListener("resize", upd);
    }
    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", upd);
    };
  }, []);
  return [ref, w];
}
/** 横向条形图（单序列或指定颜色），带 hover 读数 */
function HBarChart({ data, max, format = (v) => v, color = "var(--s2)", height = 30, labelWidth = 150, unit = "" }) {
  const [wref, cw] = useWidth(640);
  const [hover, setHover] = useState(null);
  const W = Math.max(300, cw),
    pad = 8,
    H = data.length * height + 26;
  const mx = max ?? Math.max(...data.map((d) => d.v)) * 1.1;
  const x = lin(0, mx, labelWidth, W - 60);
  return (
    <div>
      <div ref={wref}><svg className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={data.map((d) => `${d.label} ${format(d.v)}`).join("；")}>
        <line x1={labelWidth} x2={labelWidth} y1={4} y2={H - 20} stroke="var(--axis)" strokeWidth="1" />
        {data.map((d, i) => {
          const y = pad + i * height;
          const bw = Math.max(2, x(d.v) - labelWidth);
          const barH = Math.min(18, height - 10);
          const fill = d.color || color;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: "default" }}>
              <rect x={0} y={y - 2} width={W} height={height} fill={hover === i ? "var(--surface-2)" : "transparent"} />
              <text x={labelWidth - 10} y={y + barH / 2 + 5} textAnchor="end" fontSize="13" fill="var(--ink-2)">
                {d.label}
              </text>
              <path d={hBarPath(labelWidth, y, bw, barH)} fill={fill} opacity={hover === null || hover === i ? 1 : 0.55} />
              <text x={labelWidth + bw + 8} y={y + barH / 2 + 5} fontSize="13" fill="var(--ink)" fontWeight="600">
                {format(d.v)}
                {unit}
              </text>
            </g>
          );
        })}
      </svg></div>
      <div className="tfs-readout">{hover !== null && data[hover].note ? `${data[hover].label}：${data[hover].note}` : " "}</div>
    </div>
  );
}
/** 横向条：基线处方角，数据端 4px 圆角 */
function hBarPath(x, y, w, h) {
  const r = Math.min(4, w / 2, h / 2);
  if (w <= 0) return "";
  return `M${x},${y} h${w - r} a${r},${r} 0 0 1 ${r},${r} v${h - 2 * r} a${r},${r} 0 0 1 -${r},${r} h-${w - r} z`;
}
/** 纵向条：基线处方角，顶部 4px 圆角（y 为顶部坐标） */
function vBarPath(x, y, w, h) {
  const r = Math.min(4, w / 2, h / 2);
  if (h <= 0) return "";
  return `M${x},${y + h} v-${h - r} a${r},${r} 0 0 1 ${r},-${r} h${w - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${h - r} z`;
}
/** 用鼠标 x 坐标换算为 viewBox 坐标 */
function svgX(e, svg, W) {
  const r = svg.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  return ((clientX - r.left) / r.width) * W;
}

/* ============================================================
   数据：底层机制、偏差族谱、章节
   ============================================================ */
const ROOTS = [
  {
    id: "lazy",
    n: "①",
    name: "懒惰的监督者",
    en: "Lazy System 2 / law of least effort",
    short: "系统2 昂贵、容量有限，遵循最省力法则：只要系统1给出的答案“感觉没问题”，它就签字放行。",
    why: "注意力是一份固定预算（第2章的“电表”）。进化让我们把昂贵的检查留给异常情况，于是大部分时候，系统2只是橡皮图章。",
  },
  {
    id: "coherence",
    n: "②",
    name: "连贯即真相（WYSIATI）",
    en: "Associative coherence · What You See Is All There Is",
    short: "系统1 用手头被激活的信息，拼出一个最连贯的故事；自信取决于故事是否顺畅，而不是证据够不够多、够不够好。",
    why: "联想记忆只能调用已被激活的观念，缺失的信息不会“报警”。信息越少，反而越容易拼出没有矛盾的故事。",
  },
  {
    id: "substitution",
    n: "③",
    name: "替代与强度匹配",
    en: "Substitution & intensity matching",
    short: "遇到难题，系统1 悄悄换成一个容易的问题作答；再用“强度匹配”把答案平移到所需的量纲（钱、概率、分数）。",
    why: "系统1 永远有答案——它不停地做“基本评估”（好坏、相似、容易想起），而“心理散弹枪”总会顺带算出这些答案。",
  },
  {
    id: "prototype",
    n: "④",
    name: "原型代替总和",
    en: "Prototypes & averages, not sums",
    short: "系统1 用“典型样本/平均值”表征一个集合，因此对数量、规模、样本量和持续时间几乎不敏感。",
    why: "一眼看出一组线段的平均长度很容易，看出总长度却不可能。凡是需要“加总”的量——概率、价值、痛苦总量——都会被扭曲。",
  },
  {
    id: "causal",
    n: "⑤",
    name: "因果优先于统计",
    en: "Causal thinking over statistical thinking",
    short: "系统1 天生寻找原因与意图，看不见“纯粹的随机”；统计事实只有被编进因果故事，才会被使用。",
    why: "婴儿就能“看见”因果；为狮子是否出现多做一次警觉的祖先更可能活下来。代价是：我们给噪音编故事。",
  },
  {
    id: "reference",
    n: "⑥",
    name: "参照点与损失厌恶",
    en: "Reference dependence · diminishing sensitivity · loss aversion",
    short: "系统1 评估的是相对于参照点的“变化”，而非最终状态；敏感度递减；同等大小的损失分量约为收益的两倍。",
    why: "感官本就如此工作（温水在冷手里是热的）。把威胁看得比机会更紧急的有机体更可能繁衍——坏比好更强。",
  },
];

const PARTS = [
  { id: "p1", n: "一", name: "两个系统", ch: "第1–9章" },
  { id: "p2", n: "二", name: "启发法与偏差", ch: "第10–18章" },
  { id: "p3", n: "三", name: "过度自信", ch: "第19–24章" },
  { id: "p4", n: "四", name: "选择与风险", ch: "第25–34章" },
  { id: "p5", n: "五", name: "两个自我", ch: "第35–38章" },
];

const BIASES = [
  { id: "crt", part: "p1", ch: 3, name: "直觉答案未经检查", en: "Unchecked intuition (bat-and-ball)", roots: ["lazy", "coherence"], d: "“10 美分”来得太顺，系统2 懒得验算——这不是算不对，而是没去算。" },
  { id: "halo", part: "p1", ch: 7, name: "光环效应", en: "Halo effect", roots: ["coherence"], d: "喜欢一个人的某一点，就倾向于喜欢他的全部，包括你根本没观察到的部分。" },
  { id: "confirm", part: "p1", ch: 7, name: "确认偏误", en: "Confirmation bias", roots: ["coherence"], d: "“山姆友好吗？”会让你想起他友好的例子；换个问法，想起的就是另一批证据。" },
  { id: "priming", part: "p1", ch: 4, name: "启动效应", en: "Priming", roots: ["coherence"], d: "被激活的观念会影响随后的判断。概念层面的启动很稳健，行为启动的多项研究未能复制。" },
  { id: "truth", part: "p1", ch: 5, name: "真相错觉", en: "Illusion of truth", roots: ["coherence", "lazy"], d: "重复、清晰、押韵带来“认知放松”，而放松的感觉被误读为“这是真的”。" },
  { id: "affect", part: "p1", ch: 9, name: "情感启发式", en: "Affect heuristic", roots: ["substitution", "coherence"], d: "“我怎么看它？”被换成“我对它什么感觉？”——喜欢的技术就显得收益高、风险低。" },
  { id: "scope", part: "p1", ch: 8, name: "范围不敏感", en: "Scope insensitivity", roots: ["prototype", "substitution"], d: "救 2000、2万、20万只鸟，人们愿意捐 80、78、88 美元——想到的是一只油污的鸟。" },
  { id: "smallnum", part: "p2", ch: 10, name: "小数定律", en: "Law of small numbers", roots: ["causal", "coherence"], d: "以为小样本也能代表总体；把小样本天然的极端值当成需要解释的“规律”。" },
  { id: "anchor", part: "p2", ch: 11, name: "锚定效应", en: "Anchoring", roots: ["coherence", "lazy"], d: "先看到的数字，哪怕是随机转出来的，也会把估计拖向它：调整不足 + 选择性激活。" },
  { id: "avail", part: "p2", ch: 12, name: "可得性偏差", en: "Availability heuristic", roots: ["substitution"], d: "用“想起来有多容易”代替“实际有多常见”。" },
  { id: "cascade", part: "p2", ch: 13, name: "可得性级联", en: "Availability cascade", roots: ["substitution", "coherence"], d: "媒体报道→公众焦虑→更多报道，一个小风险可以自我放大成政策优先事项（中译本作“效用层叠”）。" },
  { id: "baserate", part: "p2", ch: 14, name: "忽视基础比率", en: "Base-rate neglect", roots: ["substitution", "causal", "coherence"], d: "一段生动的个人描述，就足以让人忘掉“农民比图书管理员多 20 倍”。" },
  { id: "conj", part: "p2", ch: 15, name: "合取谬误", en: "Conjunction fallacy (Linda)", roots: ["substitution", "prototype"], d: "“女权主义银行出纳”比“银行出纳”更像琳达，于是被判断为更可能——逻辑上不可能。" },
  { id: "regress", part: "p2", ch: 17, name: "回归谬误", en: "Regression fallacy", roots: ["causal"], d: "表扬后变差、训斥后变好，其实只是回归平均值，却被当成“惩罚有效”。" },
  { id: "extreme", part: "p2", ch: 18, name: "非回归的极端预测", en: "Non-regressive prediction", roots: ["substitution", "coherence"], d: "用对证据的“评价”直接充当对未来的“预测”，预测因此和证据一样极端。" },
  { id: "narrative", part: "p3", ch: 19, name: "叙事谬误", en: "Narrative fallacy", roots: ["coherence", "causal"], d: "把成败讲成才能与决策的故事，删去了运气和那些“没发生的事”。" },
  { id: "hindsight", part: "p3", ch: 19, name: "后见之明 / 结果偏差", en: "Hindsight & outcome bias", roots: ["coherence", "causal"], d: "结果一出，“早知道”就改写了记忆；决策被按结果而非过程评价。" },
  { id: "validity", part: "p3", ch: 20, name: "有效性错觉 / 技能错觉", en: "Illusions of validity & skill", roots: ["coherence"], d: "明知预测无效，仍对每一个具体预测充满信心；把运气游戏当技能游戏。" },
  { id: "algo", part: "p3", ch: 21, name: "偏信临床直觉", en: "Clinical vs. statistical prediction", roots: ["coherence"], d: "在低效度环境中，简单公式通常比专家准，但人们更愿意相信“有温度”的判断。" },
  { id: "planning", part: "p3", ch: 23, name: "规划谬误", en: "Planning fallacy", roots: ["coherence", "substitution"], d: "按最理想情景做计划，只看内部视角，不看同类项目的真实分布。" },
  { id: "overconf", part: "p3", ch: 24, name: "过度自信", en: "Overconfidence", roots: ["coherence", "lazy"], d: "80% 的置信区间，实际只命中三分之一——我们不知道自己不知道多少。" },
  { id: "compneg", part: "p3", ch: 24, name: "竞争忽视 / 高于平均", en: "Competition neglect", roots: ["coherence", "substitution"], d: "只想“我们的电影好不好”，不想“同一个周末还有谁上映”。" },
  { id: "lossav", part: "p4", ch: 26, name: "损失厌恶", en: "Loss aversion", roots: ["reference"], d: "输 100 元的痛，需要赢约 200 元才能抵消。" },
  { id: "endow", part: "p4", ch: 27, name: "禀赋效应", en: "Endowment effect", roots: ["reference"], d: "一旦拥有，放弃它就成了“损失”：卖价约是买价的两倍。" },
  { id: "statusquo", part: "p4", ch: 28, name: "现状偏差", en: "Status quo bias", roots: ["reference"], d: "现状就是参照点，任何改变都有输家，而输家的反对比赢家的支持更强烈。" },
  { id: "fourfold", part: "p4", ch: 29, name: "可能性 / 确定性效应", en: "Possibility & certainty effects", roots: ["reference", "coherence"], d: "0→5% 和 95%→100% 的心理分量远大于 60%→65%：彩票与保险同时存在的原因。" },
  { id: "rare", part: "p4", ch: 30, name: "罕见事件高估 / 分母忽视", en: "Overweighting rare events", roots: ["coherence", "prototype"], d: "“每一千人中有一人”比“0.1%”更吓人：生动的分子遮住了分母。" },
  { id: "narrow", part: "p4", ch: 31, name: "窄框架", en: "Narrow framing", roots: ["lazy", "coherence"], d: "把一连串小赌局一个个单独看，于是次次拒绝长期必赚的机会。" },
  { id: "sunk", part: "p4", ch: 32, name: "沉没成本 / 处置效应", en: "Sunk cost & disposition effect", roots: ["reference", "coherence"], d: "不愿以亏损关闭“心理账户”：继续向失败项目投钱，卖赚钱的股票、留亏钱的。" },
  { id: "regret", part: "p4", ch: 32, name: "后悔厌恶与默认偏好", en: "Regret aversion & defaults", roots: ["reference"], d: "偏离默认选项而失败，比按默认选项失败更让人后悔，也更招人责备。" },
  { id: "reversal", part: "p4", ch: 33, name: "偏好逆转", en: "Preference reversals", roots: ["substitution", "coherence"], d: "单独评价与放在一起比较，会得出相反的偏好（海豚 vs 农场工人）。" },
  { id: "framing", part: "p4", ch: 34, name: "框架效应", en: "Framing effect", roots: ["reference", "coherence", "lazy"], d: "“90% 存活率”和“10% 死亡率”是同一个事实，却让医生做出不同的选择。" },
  { id: "peakend", part: "p5", ch: 35, name: "峰终定律 / 过程忽视", en: "Peak-end rule & duration neglect", roots: ["prototype"], d: "记忆只保存最强烈的一刻和最后一刻，时长几乎不计入。" },
  { id: "story", part: "p5", ch: 36, name: "人生如故事", en: "Life as a story", roots: ["prototype", "coherence"], d: "给幸福的一生再加 5 年“还算幸福”的日子，人们反而觉得这一生更差了。" },
  { id: "mood", part: "p5", ch: 38, name: "用心情回答满意度", en: "Mood heuristic for life satisfaction", roots: ["substitution"], d: "复印机上捡到一枚硬币，就会显著抬高对“整体生活”的满意度评分。" },
  { id: "focus", part: "p5", ch: 38, name: "聚焦错觉", en: "Focusing illusion", roots: ["coherence", "substitution"], d: "当你想着某件事时，生活中没有什么像你想的那么重要。" },
  { id: "miswant", part: "p5", ch: 38, name: "情感预测错误", en: "Affective forecasting errors (miswanting)", roots: ["coherence", "prototype"], d: "高估新车、新城市带来的持久快乐，因为忽视了“适应”和“不再去想它”。" },
];

const CHAPTERS = [
  { p: "p1", n: 1, t: "一张愤怒的脸和一道乘法题", d: "引入两个角色：自动、快速的系统1 与费力、缓慢的系统2；认知错觉像缪勒–莱耶错觉一样，知道了也还是“看得见”。" },
  { p: "p1", n: 2, t: "电影的主角与配角", d: "系统2 自认为主角，其实是配角。注意力是有限预算，瞳孔就是脑力“电表”；高度专注会让人看不见大猩猩。" },
  { p: "p1", n: 3, t: "惰性思维与延迟满足的矛盾", d: "系统2 天性懒惰，遵循最省力法则；自我控制与认真思考争夺同一份脑力。球拍和球：聪明人为什么不验算。" },
  { p: "p1", n: 4, t: "联想的神奇力量", d: "联想激活像涟漪扩散；启动效应让我们在不知情时被影响。（本章行为启动研究多数未能复制，作者 2017 年公开承认。）" },
  { p: "p1", n: 5, t: "你的直觉有可能只是错觉", d: "“认知放松”仪表：重复、清晰、好心情让人觉得熟悉、真实、愉快——真相错觉与曝光效应由此而来。" },
  { p: "p1", n: 6, t: "意料之外与情理之中", d: "系统1 维护一个“常态”模型，自动寻找因果与意图；第二次巧合就不再惊讶，“摩西错觉”无人察觉。" },
  { p: "p1", n: 7, t: "字母“B”与数字“13”", d: "系统1 急于下结论、先信后疑；光环效应；WYSIATI（眼见即为事实）——故事的连贯比证据的多少更决定信心。" },
  { p: "p1", n: 8, t: "我们究竟是如何作出判断的？", d: "系统1 持续做“基本评估”（威胁、相似、平均），能跨维度做强度匹配，还会顺手多算（心理散弹枪）。" },
  { p: "p1", n: 9, t: "目标问题与启发性问题形影不离", d: "全书枢纽：面对难题，系统1 悄悄换成一个简单问题来回答（替代）。情感启发式是最典型的替代。" },
  { p: "p2", n: 10, t: "大数法则与小数定律", d: "小样本更容易出极端值；我们却为随机序列硬找原因（肾癌县、小规模学校、热手）。" },
  { p: "p2", n: 11, t: "锚定效应在生活中随处可见", d: "任何数字都可能成为锚：系统2 的调整不足 + 系统1 的选择性激活；锚定指数常在 30%–55%。" },
  { p: "p2", n: 12, t: "科学地利用可得性启发法", d: "用“想起来有多容易”代替“有多常见”；被要求列出 12 件果断的事，反而觉得自己不果断。" },
  { p: "p2", n: 13, t: "焦虑情绪与风险政策的设计", d: "可得性 + 情感 = 风险感知；可得性级联让小风险膨胀成公共政策。斯洛维克与桑斯坦之争。" },
  { p: "p2", n: 14, t: "猜一下，汤姆的专业是什么？", d: "代表性（中译本作“典型性”）替代概率：忽视基础比率、忽视证据质量。用贝叶斯的两条纪律约束直觉。" },
  { p: "p2", n: 15, t: "琳达问题的社会效应", d: "合取谬误：越具体的故事越可信，却必然越不可能；“少即是多”的餐具实验。" },
  { p: "p2", n: 16, t: "因果关系比统计学信息更具说服力", d: "因果型基础比率会被使用，统计型会被忽略；人们从令人惊讶的个案中学习，却不从统计中学习。" },
  { p: "p2", n: 17, t: "所有表现都会回归平均值", d: "成功 = 天赋 + 运气；极端之后必有回归，却总被编成因果故事（飞行教练的“惩罚有效”）。" },
  { p: "p2", n: 18, t: "如何让直觉性预测更恰当有效？", d: "直觉预测和证据一样极端；四步法把预测拉回均值，拉多少取决于证据与结果的相关度。" },
  { p: "p3", n: 19, t: "“知道”的错觉", d: "叙事谬误与后见之明：以为理解了过去，于是以为能预测未来；结果偏差惩罚好决策、奖励走运者。" },
  { p: "p3", n: 20, t: "未来是不可预测的", d: "有效性错觉与技能错觉：军官测评、理财顾问、政治专家——主观自信不是准确性的指标。" },
  { p: "p3", n: 21, t: "直觉判断与公式运算，孰优孰劣？", d: "米尔：在低效度环境中，简单公式通常胜过专家；阿普加评分；“闭上眼睛”的结构化面试。" },
  { p: "p3", n: 22, t: "什么时候可以相信专家的直觉？", d: "与克莱因的“对抗式合作”：环境足够有规律，且有长期练习与及时反馈，直觉才值得信任。" },
  { p: "p3", n: 23, t: "努力养成采纳外部意见的决策习惯", d: "规划谬误；内部视角 vs 外部视角；参照类预测三步法。一本教材写了 8 年的故事。" },
  { p: "p3", n: 24, t: "乐观主义是一柄双刃剑", d: "乐观推动创业与冒险，也带来竞争忽视与控制错觉；“事前验尸”能部分抵消。" },
  { p: "p4", n: 25, t: "事关风险与财富的抉择", d: "伯努利用“财富状态”定义效用，忽略了参照点；理论诱导的盲区让这个错误存活了两百多年。" },
  { p: "p4", n: 26, t: "更人性化的前景理论", d: "三条原则：参照依赖、敏感度递减、损失厌恶（约 2 倍）；S 形价值函数是前景理论的“旗帜”。" },
  { p: "p4", n: 27, t: "禀赋效应与市场交易", d: "拥有即增值：马克杯的卖价约为买价的两倍；为交换而持有的东西没有禀赋效应。" },
  { p: "p4", n: 28, t: "公平性——经济交易的参照点", d: "坏比好更强；目标就是参照点（高尔夫推杆、出租车司机）；公平感来自既有交易，改革为何这么难。" },
  { p: "p4", n: 29, t: "对结果可能性的权衡", d: "可能性效应与确定性效应；决策权重不等于概率；四重模式与阿莱斯悖论。" },
  { p: "p4", n: 30, t: "被过分关注的罕见事件", d: "罕见事件要么被忽视、要么被高估；生动性与分母忽视放大决策权重；描述式选择 vs 经验式选择。" },
  { p: "p4", n: 31, t: "能带来长远收益的风险政策", d: "窄框架代价高昂；宽框架与“风险政策”（例如：每季度才看一次投资）。" },
  { p: "p4", n: 32, t: "心理账户是如何影响我们的选择的？", d: "心理账户、处置效应、沉没成本；后悔与“作为 vs 不作为”的不对称；禁忌权衡。" },
  { p: "p4", n: 33, t: "评估结果的逆转", d: "单独评估与联合评估给出相反的偏好；类别内一致，跨类别混乱（陪审团、罚款标准）。" },
  { p: "p4", n: 34, t: "善用框架效应，让生活更美好", d: "同一事实换一种说法就改变选择；我们的道德直觉附着于描述而非实质；默认选项与“助推”。" },
  { p: "p5", n: 35, t: "体验效用与决策效用的不一致", d: "峰终定律与过程忽视：结肠镜与冰水实验。记忆自我替体验自我做决定。" },
  { p: "p5", n: 36, t: "人生如戏", d: "我们把人生当故事来评价：结局决定一切，长度几乎不计；很多旅行是在为记忆拍照。" },
  { p: "p5", n: 37, t: "你有多幸福？", d: "测量体验自我：经验取样、昨日重现法与 U 指数；收入对情绪幸福的作用（2023 年有修正）。" },
  { p: "p5", n: 38, t: "思考生活", d: "生活满意度常常是替代出来的答案；聚焦错觉：当你想着它时，没有什么像你想的那样重要。" },
];

const rootById = Object.fromEntries(ROOTS.map((r) => [r.id, r]));
function RootChips({ ids }) {
  const { go, setFocusRoot } = useContext(NavCtx);
  return (
    <div className="tfs-chips" style={{ margin: "6px 0 14px" }}>
      <span className="tfs-small" style={{ alignSelf: "center" }}>底层机制：</span>
      {ids.map((id) => (
        <button
          key={id}
          className="tfs-chip root"
          title={rootById[id].short}
          onClick={() => {
            setFocusRoot(id);
            go("model", "tree");
          }}
        >
          {rootById[id].n} {rootById[id].name}
        </button>
      ))}
    </div>
  );
}
function SectionHead({ kicker, title, lead, roots }) {
  return (
    <header>
      <div className="tfs-kicker">{kicker}</div>
      <h1 className="tfs-h1">{title}</h1>
      {lead && <p className="tfs-lead">{lead}</p>}
      {roots && <RootChips ids={roots} />}
    </header>
  );
}

/* ============================================================
   开篇
   ============================================================ */
function HeroArt() {
  // 抽象的“快与慢”：一条急促的橙色折线（系统1）与一条从容的蓝色弧线（系统2）
  const fast = [];
  const r = makeRng(7);
  for (let i = 0; i <= 40; i++) fast.push([20 + i * 18, 92 + (r() - 0.5) * 64 * (0.6 + 0.4 * Math.abs(Math.sin(i / 2.2)))]);
  const fastD = fast.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg className="tfs-chart" viewBox="0 0 760 230" role="img" aria-label="抽象插图：一条急促的橙色折线代表系统1，一条平缓的蓝色弧线代表系统2">
      <rect x="0" y="0" width="760" height="230" rx="18" fill="var(--surface)" stroke="var(--line)" />
      {[40, 80, 120, 160, 200].map((y) => (
        <line key={y} x1="20" x2="740" y1={y} y2={y} stroke="var(--grid)" strokeWidth="1" />
      ))}
      <path d={fastD} fill="none" stroke="var(--s1)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M20,196 C240,196 330,120 520,130 S700,160 740,158" fill="none" stroke="var(--s2)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="740" cy="158" r="6" fill="var(--s2)" stroke="var(--surface)" strokeWidth="2" />
      <circle cx={fast[40][0]} cy={fast[40][1]} r="6" fill="var(--s1)" stroke="var(--surface)" strokeWidth="2" />
    </svg>
  );
}

function ChapterMap() {
  const [part, setPart] = useState("p1");
  const { go } = useContext(NavCtx);
  const list = CHAPTERS.filter((c) => c.p === part);
  const P = PARTS.find((p) => p.id === part);
  return (
    <Card title="全书地图：38 章，一章一句话" tag="目录">
      <div className="tfs-partbar">
        {PARTS.map((p) => (
          <button key={p.id} className={cx("tfs-partbtn", part === p.id && "on")} onClick={() => setPart(p.id)}>
            <b>第{p.n}部分</b>
            <span>
              {p.name} · {p.ch}
            </span>
          </button>
        ))}
      </div>
      <ul className="tfs-chlist">
        {list.map((c) => (
          <li key={c.n}>
            <span className="n">第{c.n}章</span>
            <div>
              <div className="t">{c.t}</div>
              <div className="d">{c.d}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="tfs-row" style={{ marginTop: 10 }}>
        <button className="tfs-btn primary" onClick={() => go(part)}>
          进入第{P.n}部分导读 →
        </button>
        <span className="tfs-small">书末另有结语（回顾三组区分）与两篇附录：1974 年《科学》论文与 1984 年《选择、价值与框架》。</span>
      </div>
    </Card>
  );
}

function IntroSection() {
  const { go } = useContext(NavCtx);
  return (
    <div className="tfs-content">
      <SectionHead kicker="开篇 · 为什么读、怎么读" title="《思考，快与慢》互动导读" />
      <HeroArt />
      <div className="tfs-row" style={{ marginTop: 8 }}>
        <span className="tfs-tag s1">系统1 · 快 · 自动 · 联想</span>
        <span className="tfs-tag lab">系统2 · 慢 · 费力 · 按规则</span>
      </div>
      <p className="tfs-lead" style={{ marginTop: 18 }}>
        这是一本关于“聪明人为什么会犯<strong>可以预测的</strong>错误”的书。它的作者丹尼尔·卡尼曼（1934–2024）是心理学家，却因与阿莫斯·特沃斯基（1937–1996）的合作研究获得 2002 年诺贝尔经济学奖。
      </p>

      <h2 className="tfs-h2">这本书真正要回答的问题</h2>
      <p>
        在卡尼曼之前，社会科学对人性有两个默认假设：人基本是理性的；人偶尔不理性，是因为恐惧、喜爱、憎恨这类<em>情绪</em>。卡尼曼和特沃斯基的工作挑战了这两点。他们记录下正常人在平静状态下也会犯的<strong>系统性错误</strong>，并论证这些错误来自<strong>认知机制本身的构造</strong>，而不是情绪的干扰。
      </p>
      <Callout type="insight" title="用第一性原理重述全书">
        <p>
          如果你只能带走一个模型，请带走这个：<br />
          <strong>① 注意力是稀缺而昂贵的</strong>，所以大脑把绝大多数判断交给一个又快又省、但只会“联想”的系统（系统1）；<br />
          <strong>② 这个系统从不说“我不知道”</strong>，它总能用手头的信息拼出一个连贯的故事，或把难题换成一个简单问题来回答；<br />
          <strong>③ 负责检查的系统（系统2）很懒</strong>，只要答案“感觉对”，它就放行。
          <br />
          全书几十种偏差，几乎都是这三条的推论。下一节“总纲”会把这个推导完整画出来。
        </p>
      </Callout>

      <h2 className="tfs-h2">三组区分，串起五个部分</h2>
      <p className="tfs-p2">卡尼曼在结语里自己点明：全书建立在三组对照之上。</p>
      <DataTable
        columns={[{ label: "对照" }, { label: "左边" }, { label: "右边" }, { label: "主要章节" }]}
        rows={[
          [<b>两个系统</b>, <span className="s1t">系统1：快、自动、联想</span>, <span className="s2t">系统2：慢、费力、按规则</span>, "第一至三部分"],
          [<b>两个物种</b>, "经济人（Econs）：理性、一致、只看最终状态", "人类（Humans）：依赖参照点、受框架左右", "第四部分"],
          [<b>两个自我</b>, "体验自我：活在每一刻", "记忆自我：记录、讲故事、做决定", "第五部分"],
        ]}
      />

      <ChapterMap />

      <h2 className="tfs-h2">怎样用这份导读</h2>
      <p>
        书中第16章有一个让心理学老师沮丧的发现：学生在听完“大多数人不会去救癫痫发作的陌生人”这一统计结论之后，<strong>对具体个人的预测完全没变</strong>；但当他们亲眼看到两个“看起来很正派”的人也没去救人时，立刻就学会了。人不从统计中学习，只从让自己惊讶的个案中学习。
      </p>
      <Callout type="c3" title="因此，本导读的原则是：先让你亲自掉进坑里，再解释坑是怎么挖的">
        <p>
          每一部分都有标着 <span className="tfs-tag lab">实验 · 亲自试一试</span> 的小实验。请先凭直觉作答，再看解释——你对自己的惊讶，比任何总结都记得牢。
        </p>
      </Callout>
      <div className="tfs-grid3">
        <Card flat title="只有 1 小时">
          <p className="tfs-small" style={{ margin: 0 }}>
            读“总纲”，做第一部分的球拍和球、第二部分的贝叶斯与回归实验、第四部分的价值函数。
          </p>
        </Card>
        <Card flat title="想读原书">
          <p className="tfs-small" style={{ margin: 0 }}>
            核心章节：第1、3、7、9、11、14、17、20、23、26、29、31、35章。第4章的启动效应请配合“批判性阅读”一节。
          </p>
        </Card>
        <Card flat title="想用起来">
          <p className="tfs-small" style={{ margin: 0 }}>直接去“工具箱”：决策前检查单、外部视角计算器、事前验尸、结构化面试打分。</p>
        </Card>
      </div>
      <div className="tfs-row" style={{ marginTop: 18 }}>
        <button className="tfs-btn primary" onClick={() => go("model")}>
          开始：一张图看懂全书 →
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   总纲：第一性原理模型 + 偏差族谱
   ============================================================ */
const FLOW_STEPS = [
  { box: 0, title: "输入", text: "你读到：“球拍和球共 1.10 美元，球拍比球贵 1 美元，球多少钱？”" },
  { box: 1, title: "系统1 自动联想", text: "“1.10”和“1”被自动激活，减法几乎自己完成：0.10。你没有决定去算，它就发生了。" },
  { box: 2, title: "拼出连贯的答案", text: "“10 美分”简单、整齐、与题目的数字完美匹配——一个毫无违和感的故事。" },
  { box: 3, title: "认知放松仪表", text: "没有意外、没有冲突，仪表指向“一切正常”，不会向系统2 报警。" },
  { box: 4, title: "懒惰的系统2", text: "只需几秒就能验算（10 + 110 = 120 ≠ 110），但它默认签字放行。哈佛、MIT、普林斯顿的学生一半以上如此。" },
  { box: 5, title: "输出：自信的错误", text: "“10 美分。”——若系统2 真的接管：x + (x + 1) = 1.10，x = 0.05，即 5 美分。" },
];
function FlowModel() {
  const [step, setStep] = useState(0);
  const cur = FLOW_STEPS[step];
  const boxes = [
    { t: "外部世界", d: "问题、刺激、数字、描述", s2: false },
    { t: "系统1 · 联想", d: "自动激活相关观念，无法关闭", s2: false, roots: "③④⑤⑥" },
    { t: "系统1 · 编故事", d: "用已激活的信息拼出最连贯的解释", s2: false, roots: "②" },
    { t: "认知放松仪表", d: "顺畅 → 放行；意外/冲突 → 报警", s2: false },
    { t: "系统2 · 监督", d: "默认认可；只在报警或被要求时接管", s2: true, roots: "①" },
    { t: "信念与选择", d: "你以为是自己“想清楚”的结论", s2: true },
  ];
  return (
    <Card title="一个判断是怎样诞生的" tag="模型">
      <div className="tfs-flow">
        {boxes.map((b, i) => (
          <React.Fragment key={i}>
            <div className={cx("tfs-flowbox", b.s2 && "s2", cur.box === i && "on")}>
              <h5>{b.t}</h5>
              <div>{b.d}</div>
              {b.roots && <div style={{ marginTop: 6, color: "var(--muted)" }}>偏差入口 {b.roots}</div>}
            </div>
            {i < boxes.length - 1 && <div className="tfs-flowarrow">→</div>}
          </React.Fragment>
        ))}
      </div>
      <div className="tfs-steps">
        {FLOW_STEPS.map((s, i) => (
          <button key={i} className={cx("tfs-btn sm", step === i && "primary")} onClick={() => setStep(i)}>
            {i + 1}. {s.title}
          </button>
        ))}
      </div>
      <p style={{ marginTop: 8 }} key={step} className="tfs-reveal">
        <strong>第 {step + 1} 步：</strong>
        {cur.text}
      </p>
    </Card>
  );
}

function BiasTree() {
  const { focusRoot, setFocusRoot, go } = useContext(NavCtx);
  const [bias, setBias] = useState(null);
  const b = BIASES.find((x) => x.id === bias);
  const activeRoots = b ? b.roots : focusRoot ? [focusRoot] : [];
  const isLit = (x) => (b ? x.id === b.id : focusRoot ? x.roots.includes(focusRoot) : true);
  const counts = Object.fromEntries(ROOTS.map((r) => [r.id, BIASES.filter((x) => x.roots.includes(r.id)).length]));
  return (
    <Card id="tree" title={`偏差族谱：${BIASES.length} 种偏差，6 个根`} tag="交互图">
      <p className="tfs-small">
        点一个<strong>根</strong>，看它长出哪些偏差；点一个<strong>偏差</strong>，看它由哪些根共同造成。数字表示该机制参与的偏差数量。
      </p>
      <div className="tfs-chips">
        {ROOTS.map((r) => (
          <button
            key={r.id}
            className={cx("tfs-chip root", activeRoots.includes(r.id) && "on", activeRoots.length && !activeRoots.includes(r.id) && "dim")}
            onClick={() => {
              setBias(null);
              setFocusRoot(focusRoot === r.id ? null : r.id);
            }}
          >
            {r.n} {r.name} <span style={{ opacity: 0.6 }}>· {counts[r.id]}</span>
          </button>
        ))}
        {(focusRoot || bias) && (
          <button
            className="tfs-btn sm ghost"
            onClick={() => {
              setBias(null);
              setFocusRoot(null);
            }}
          >
            清除
          </button>
        )}
      </div>
      {focusRoot && !b && (
        <Callout type="s1" title={`${rootById[focusRoot].n} ${rootById[focusRoot].name}`}>
          <p style={{ marginBottom: 6 }}>{rootById[focusRoot].short}</p>
          <p className="tfs-small" style={{ margin: 0 }}>
            <b>为什么会这样设计：</b>
            {rootById[focusRoot].why}
          </p>
        </Callout>
      )}
      {PARTS.map((p) => (
        <div key={p.id} style={{ marginTop: 10 }}>
          <div className="tfs-small" style={{ fontWeight: 600 }}>
            第{p.n}部分 · {p.name}
          </div>
          <div className="tfs-chips" style={{ marginTop: 4 }}>
            {BIASES.filter((x) => x.part === p.id).map((x) => (
              <button key={x.id} className={cx("tfs-chip", bias === x.id && "on", !isLit(x) && "dim")} onClick={() => setBias(bias === x.id ? null : x.id)}>
                {x.name}
              </button>
            ))}
          </div>
        </div>
      ))}
      {b && (
        <div className="tfs-reveal">
          <Callout type="insight" title={`${b.name}（${b.en}）· 第${b.ch}章`}>
            <p style={{ marginBottom: 8 }}>{b.d}</p>
            <p className="tfs-small" style={{ marginBottom: 8 }}>
              由这些根共同造成：{b.roots.map((r) => `${rootById[r].n}${rootById[r].name}`).join(" + ")}
            </p>
            <button className="tfs-btn sm" onClick={() => go(b.part)}>
              去读第{PARTS.find((p) => p.id === b.part).n}部分 →
            </button>
          </Callout>
        </div>
      )}
    </Card>
  );
}

function ModelSection() {
  return (
    <div className="tfs-content">
      <SectionHead
        kicker="总纲 · 第一性原理"
        title="一张图看懂全书"
        lead="不要把这本书读成一张“偏差清单”。清单记不住，也用不上。更好的读法是：找到少数几个底层机制，让每个偏差都能从它们推导出来。"
      />
      <h2 className="tfs-h2" style={{ marginTop: 20 }}>
        从两条约束出发
      </h2>
      <p>
        设想你要设计一个大脑。它面临两条硬约束：<strong>第一，注意力极其有限</strong>——卡尼曼用瞳孔测量发现，心算“加3任务”时瞳孔在 5 秒内扩大约 50%，这就是满负荷；<strong>第二，世界要求你随时有答案</strong>——对面那张脸是不是生气了？那辆车会不会冲过来？
      </p>
      <p>
        最经济的方案是：让一个<span className="s1t">廉价、并行、永远在线的联想机器</span>处理几乎所有事情，只在它“报警”时才调用<span className="s2t">昂贵、串行、需要专注的推理机器</span>。这就是系统1 和系统2 的分工。卡尼曼强调，这个分工<strong>通常非常高效</strong>——系统1 在熟悉情境中的模式识别和短期预测大多是准确的。
      </p>
      <Callout type="warn" title="两个系统是“虚构角色”，不是两个脑区">
        <p>卡尼曼明确说：系统1、系统2 只是为了方便思考而设的主语。“系统1 做了某事”是“某事自动发生了”的简写。它们描述的是两类心理过程的特征，而不是大脑里的两个小人。</p>
      </Callout>
      <FlowModel />

      <h2 className="tfs-h2">六个根：偏差从哪里来</h2>
      <p className="tfs-p2">把上面这个流程拆开，错误可以从六个地方进入。它们不是六条互不相干的规律，而是同一个“廉价联想机器 + 懒惰监督者”架构的六个侧面。</p>
      <div className="tfs-grid2">
        {ROOTS.map((r) => (
          <Card key={r.id} flat title={`${r.n} ${r.name}`}>
            <div className="tfs-small" style={{ marginTop: -4, marginBottom: 6 }}>
              {r.en}
            </div>
            <p style={{ fontSize: 15, marginBottom: 8 }}>{r.short}</p>
            <p className="tfs-small" style={{ margin: 0 }}>
              {r.why}
            </p>
          </Card>
        ))}
      </div>

      <BiasTree />

      <h2 className="tfs-h2">偏差不是 bug，而是省钱设计的账单</h2>
      <p>
        每一个根，在它被“设计”出来的环境里都是合理的：在小群体、面对面、以因果为主的世界里，<strong>连贯通常意味着真实</strong>，<strong>容易想起通常意味着常见</strong>，<strong>像通常意味着是</strong>，<strong>威胁通常比机会更要紧</strong>。问题出在现代生活大量提出了系统1 从未“训练过”的问题：概率、样本量、基础比率、长期回报、总量与时长。
      </p>
      <Callout type="insight" title="所以，“统计直觉”为什么这么难？">
        <p>
          卡尼曼在第二部分开头点破：统计要求你<strong>同时</strong>考虑多件事（样本大小、基础比率、证据可靠性），并用“集合”和“总量”来思考；而系统1 一次只处理一个连贯的故事，用“典型”来代表集合。这不是教育不够的问题——连统计学家也会在琳达问题和汤姆问题上中招。
        </p>
      </Callout>

      <h2 className="tfs-h2">那么，能改吗？</h2>
      <p>卡尼曼对个人去偏差的前景相当悲观，他说自己研究了几十年，直觉并没有变得更好。他给出的路线图是：</p>
      <div className="tfs-grid2">
        <Card flat title="1. 接受：系统1 关不掉">
          <p className="tfs-small" style={{ margin: 0 }}>就像量过之后，缪勒–莱耶错觉里的两条线看起来还是一长一短。知道偏差不等于免疫。</p>
        </Card>
        <Card flat title="2. 识别“雷区”情境">
          <p className="tfs-small" style={{ margin: 0 }}>学会在高风险时刻认出典型模式：有锚、有生动故事、有小样本、需要预测、需要比较得失……</p>
        </Card>
        <Card flat title="3. 慢下来，请系统2 出场">
          <p className="tfs-small" style={{ margin: 0 }}>问“基础比率是多少”“换个框架呢”“如果结果相反我会怎么解释”。代价是累，所以只在值得的时候做。</p>
        </Card>
        <Card flat title="4. 把纠错交给组织和词汇">
          <p className="tfs-small" style={{ margin: 0 }}>机构比个人更容易纠错：检查单、参照类预测、事前验尸、独立收集意见——以及共享的“饮水机旁词汇”。</p>
        </Card>
      </div>
      <Quote cite="卡尼曼在序言中的写作目的（意译）">发现别人的错误比发现自己的更容易。这本书想提供一套更精确的词汇，让人们在“饮水机旁”谈论判断与决策时，能说得更准。</Quote>
    </div>
  );
}

/* ============================================================
   第一部分 · 两个系统
   ============================================================ */
function S1S2Table() {
  return (
    <DataTable
      columns={[{ label: "" }, { label: "系统1（快）" }, { label: "系统2（慢）" }]}
      rows={[
        [<b>运作方式</b>, "自动、快速、几乎不费力，没有“我在控制”的感觉", "需要集中注意力，缓慢、费力，伴随“我在选择”的主观体验"],
        [<b>产出</b>, "印象、感觉、倾向、直觉答案", "明确的信念、有意的选择、按规则的推理"],
        [<b>擅长</b>, "识别情绪、2+2、在空旷公路上开车、大师看棋局、理解简单句子", "17×24、在拥挤处停车、填报税表、检验一个逻辑论证"],
        [<b>弱点</b>, "不懂逻辑和统计；会把难题换成易题；无法关闭", "容量有限、容易被占满；懒惰，倾向于直接认可系统1"],
        [<b>关系</b>, "持续向系统2 提供建议", "大多数时候照单全收；遇到意外或冲突时接管，负责自我控制"],
      ]}
    />
  );
}

function CRTLab() {
  const Q = [
    { id: "bat", q: "球拍和球共花 1.10 美元，球拍比球贵 1 美元。球多少钱？", unit: "美分", intuitive: 10, correct: 5, why: "设球 x 美分，球拍 x + 100 美分：2x + 100 = 110，x = 5。" },
    { id: "widget", q: "5 台机器 5 分钟生产 5 个零件。100 台机器生产 100 个零件需要多少分钟？", unit: "分钟", intuitive: 100, correct: 5, why: "每台机器 5 分钟做 1 个；100 台同时开工，5 分钟做 100 个。" },
    { id: "lily", q: "湖中有一片睡莲，面积每天翻一倍，48 天覆盖整个湖面。覆盖一半需要多少天？", unit: "天", intuitive: 24, correct: 47, why: "每天翻倍，意味着覆盖全湖的前一天恰好是一半：47 天。" },
  ];
  const [ans, setAns] = useState({});
  const [done, setDone] = useState(false);
  const score = Q.filter((q) => Number(ans[q.id]) === q.correct).length;
  const intuitiveCount = Q.filter((q) => Number(ans[q.id]) === q.intuitive).length;
  return (
    <Lab title="认知反射测试（CRT）：三道“太简单”的题" note="请不要拿笔，凭第一反应尽快写下答案。">
      {Q.map((q, i) => {
        const a = ans[q.id];
        const ok = Number(a) === q.correct;
        return (
          <div key={q.id} style={{ padding: "10px 0", borderBottom: i < 2 ? "1px dashed var(--line)" : 0 }}>
            <p style={{ marginBottom: 6 }}>
              <b>{i + 1}.</b> {q.q}
            </p>
            <div className="tfs-row">
              <input
                className="tfs-input"
                inputMode="numeric"
                value={a ?? ""}
                disabled={done}
                aria-label={`第${i + 1}题答案`}
                onChange={(e) => setAns({ ...ans, [q.id]: e.target.value.replace(/[^\d.]/g, "") })}
              />
              <span className="tfs-small">{q.unit}</span>
              {done && (
                <span className={ok ? "c3t" : "badt"}>
                  {ok ? "✓ 正确" : Number(a) === q.intuitive ? `✗ 这正是那个“直觉答案”，正确答案是 ${q.correct}` : `✗ 正确答案是 ${q.correct}`}
                </span>
              )}
            </div>
            {done && <p className="tfs-small" style={{ margin: "6px 0 0" }}>{q.why}</p>}
          </div>
        );
      })}
      {!done ? (
        <button className="tfs-btn primary" style={{ marginTop: 12 }} disabled={Q.some((q) => !ans[q.id])} onClick={() => setDone(true)}>
          提交
        </button>
      ) : (
        <div className="tfs-reveal">
          <div className="tfs-grid3" style={{ marginTop: 14 }}>
            <Stat v={`${score} / 3`} l="你的得分" />
            <Stat v={`${intuitiveCount} 次`} l="给出了“直觉答案”" />
            <Stat v="> 50%" l="哈佛、MIT、普林斯顿学生在球拍题上答错" />
          </div>
          <Callout type="insight" title="这测的不是智力，是“愿不愿意检查”">
            <p>
              每道题都有一个<strong>又快又诱人但错误</strong>的答案。答对的人并非没有想到它，而是多花了几秒去检查。卡尼曼的结论是：出错者的问题在于<strong>动机不足</strong>，而不是能力不足——他们的系统2 太懒了。在不那么顶尖的大学里，球拍题答错率超过 80%。
            </p>
            <p className="tfs-small">
              有意思的相关：CRT 低分者中 63% 宁愿这个月拿 3400 美元而不是下个月拿 3800 美元，高分者只有 37%。斯坦诺维奇据此区分了“智力”（算法能力）与“理性”（肯不肯反思）。
            </p>
          </Callout>
        </div>
      )}
    </Lab>
  );
}

const STROOP_COLORS = [
  { name: "红", hex: "#d23c3c" },
  { name: "蓝", hex: "#2a6fd6" },
  { name: "绿", hex: "#199a55" },
  { name: "黄", hex: "#d49a00" },
];
function StroopLab() {
  const N = 16;
  const makeTrials = (seed) => {
    const r = makeRng(seed);
    const t = [];
    for (let i = 0; i < N; i++) {
      const ink = Math.floor(r() * 4);
      const congruent = i % 2 === 0;
      let word = ink;
      if (!congruent) {
        word = (ink + 1 + Math.floor(r() * 3)) % 4;
      }
      t.push({ ink, word, congruent });
    }
    for (let i = t.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [t[i], t[j]] = [t[j], t[i]];
    }
    return t;
  };
  const [seed, setSeed] = useState(11);
  const trials = useMemo(() => makeTrials(seed), [seed]);
  const [phase, setPhase] = useState("idle");
  const [idx, setIdx] = useState(0);
  const [log, setLog] = useState([]);
  const t0 = useRef(0);
  useEffect(() => {
    if (phase === "run") t0.current = performance.now();
  }, [phase, idx]);
  const answer = (c) => {
    const rt = performance.now() - t0.current;
    const tr = trials[idx];
    const next = [...log, { ...tr, rt, ok: c === tr.ink }];
    setLog(next);
    if (idx + 1 >= N) setPhase("done");
    else setIdx(idx + 1);
  };
  const restart = () => {
    setSeed(seed + 1);
    setIdx(0);
    setLog([]);
    setPhase("run");
  };
  const res = useMemo(() => {
    if (phase !== "done") return null;
    const c = log.filter((l) => l.congruent && l.ok).map((l) => l.rt);
    const ic = log.filter((l) => !l.congruent && l.ok).map((l) => l.rt);
    return { c: mean(c), ic: mean(ic), err: log.filter((l) => !l.ok).length, errIc: log.filter((l) => !l.ok && !l.congruent).length };
  }, [phase, log]);
  const tr = trials[idx];
  return (
    <Lab title="冲突与自我控制：说出字的颜色，而不是读出字" note="共 16 题。只按“墨水的颜色”点按钮，越快越好。书中图 2 用的是“左/右、高/低”的版本，原理相同。">
      {phase === "idle" && (
        <button className="tfs-btn primary" onClick={() => setPhase("run")}>
          开始
        </button>
      )}
      {phase === "run" && (
        <div>
          <div className="tfs-small">
            第 {idx + 1} / {N} 题
          </div>
          <div className="tfs-bigword" style={{ color: STROOP_COLORS[tr.ink].hex }} aria-live="polite">
            {STROOP_COLORS[tr.word].name}
          </div>
          <div className="tfs-row" style={{ justifyContent: "center" }}>
            {STROOP_COLORS.map((c, i) => (
              <button key={i} className="tfs-btn" style={{ minWidth: 76 }} onClick={() => answer(i)}>
                <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: c.hex, marginRight: 6, verticalAlign: -1 }} />
                {c.name}色
              </button>
            ))}
          </div>
        </div>
      )}
      {phase === "done" && res && (
        <div className="tfs-reveal">
          <div className="tfs-grid3">
            <Stat v={`${Math.round(res.c)} ms`} l="字义与颜色一致时，平均反应" />
            <Stat v={`${Math.round(res.ic)} ms`} l="字义与颜色冲突时，平均反应" />
            <Stat v={`${res.err} 次`} l={`出错（其中冲突题 ${res.errIc} 次）`} />
          </div>
          <p style={{ marginTop: 12 }}>
            {res.ic > res.c
              ? `冲突时你慢了约 ${Math.round(res.ic - res.c)} 毫秒。`
              : "这一轮你在冲突题上并不更慢——样本只有 16 题，噪音很大（这本身就是第二部分“小数定律”的一课），可以再试一次。"}
          </p>
          <Callout type="insight" title="你刚刚亲身体验了两个系统的冲突">
            <p>
              <strong>读字是系统1 的自动反应，你关不掉它。</strong>说出墨水颜色需要系统2 压住那个自动冒出来的字义——这一压就是额外的时间和努力。卡尼曼说，系统2 的核心职能之一就是<strong>自我控制</strong>：忍住不盯着邻座的怪人、打滑时忍住不踩刹车、忍住不把冒犯的话说出口。
            </p>
          </Callout>
          <button className="tfs-btn sm" onClick={restart}>
            再来一轮
          </button>
        </div>
      )}
    </Lab>
  );
}

function MullerLyer() {
  const [measure, setMeasure] = useState(false);
  const L = 240,
    x0 = 150,
    x1 = x0 + L;
  const fin = 22;
  return (
    <Card title="缪勒–莱耶错觉：知道了，也还是看得见" tag="图示">
      <svg className="tfs-chart" viewBox="0 0 540 200" role="img" aria-label="缪勒–莱耶错觉：两条等长线段，因箭头方向不同看起来不等长">
        {/* 上线：箭头朝内 */}
        <line x1={x0} y1={60} x2={x1} y2={60} stroke="var(--ink)" strokeWidth="2.5" />
        <path d={`M${x0 + fin},${60 - fin} L${x0},60 L${x0 + fin},${60 + fin}`} fill="none" stroke="var(--ink)" strokeWidth="2.5" />
        <path d={`M${x1 - fin},${60 - fin} L${x1},60 L${x1 - fin},${60 + fin}`} fill="none" stroke="var(--ink)" strokeWidth="2.5" />
        {/* 下线：箭头朝外 */}
        <line x1={x0} y1={145} x2={x1} y2={145} stroke="var(--ink)" strokeWidth="2.5" />
        <path d={`M${x0 - fin},${145 - fin} L${x0},145 L${x0 - fin},${145 + fin}`} fill="none" stroke="var(--ink)" strokeWidth="2.5" />
        <path d={`M${x1 + fin},${145 - fin} L${x1},145 L${x1 + fin},${145 + fin}`} fill="none" stroke="var(--ink)" strokeWidth="2.5" />
        {measure && (
          <g>
            <line x1={x0} y1={20} x2={x0} y2={180} stroke="var(--s2)" strokeWidth="1.5" />
            <line x1={x1} y1={20} x2={x1} y2={180} stroke="var(--s2)" strokeWidth="1.5" />
          </g>
        )}
      </svg>
      <div className="tfs-row">
        <button className="tfs-btn" onClick={() => setMeasure(!measure)}>
          {measure ? "收起量尺" : "拿尺子量一量"}
        </button>
        {measure && <span className="s2t">两条线一样长。</span>}
      </div>
      <p style={{ marginTop: 10 }} className="tfs-p2">
        量完之后，你的系统2 有了新信念：“两条线等长”。但你的眼睛（系统1）看到的依然是下面那条更长。<strong>认知错觉也是如此</strong>：知道偏差的存在，并不能让它消失；你唯一能做的，是学会认出“箭头朝不同方向”的那类情境，然后不信任自己的第一印象。
      </p>
    </Card>
  );
}

function AddOneLab() {
  const [k, setK] = useState(1);
  const [phase, setPhase] = useState("idle");
  const [num, setNum] = useState("");
  const [input, setInput] = useState("");
  const [hist, setHist] = useState([]);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const start = () => {
    const n = String(1000 + Math.floor(Math.random() * 9000));
    setNum(n);
    setInput("");
    setPhase("show");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPhase("input"), 2500);
  };
  const target = num
    .split("")
    .map((d) => (Number(d) + k) % 10)
    .join("");
  const submit = () => {
    setHist([...hist, { k, ok: input === target }]);
    setPhase("result");
  };
  return (
    <Lab title="“加1任务”：把系统2 推到极限" note="一个四位数会显示 2.5 秒然后消失。请在脑中把每一位都加上 k（9 加 1 变成 0），再输入结果。不许写下原数字。">
      <div className="tfs-row">
        <span className="tfs-small">难度：</span>
        {[1, 3].map((v) => (
          <button key={v} className={cx("tfs-btn sm", k === v && "primary")} onClick={() => setK(v)} disabled={phase === "show"}>
            加{v}
          </button>
        ))}
      </div>
      <div className="tfs-bigword tfs-mono" aria-live="polite">
        {phase === "show" ? num : phase === "idle" ? "····" : "????"}
      </div>
      {phase === "idle" || phase === "result" ? (
        <div className="tfs-row" style={{ justifyContent: "center" }}>
          <button className="tfs-btn primary" onClick={start}>
            {phase === "idle" ? "开始" : "再来一次"}
          </button>
        </div>
      ) : null}
      {phase === "input" && (
        <div className="tfs-row" style={{ justifyContent: "center" }}>
          <input className="tfs-input tfs-mono" autoFocus value={input} maxLength={4} aria-label="输入变换后的数字" onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && input.length === 4 && submit()} />
          <button className="tfs-btn primary" disabled={input.length !== 4} onClick={submit}>
            提交
          </button>
        </div>
      )}
      {phase === "result" && (
        <p style={{ textAlign: "center" }} className="tfs-reveal">
          原数 <b className="tfs-mono">{num}</b> → 正确答案 <b className="tfs-mono">{target}</b>，你的答案 <b className="tfs-mono">{input}</b>{" "}
          {input === target ? <span className="c3t">✓</span> : <span className="badt">✗</span>}
          <span className="tfs-small">（已做 {hist.length} 次，对 {hist.filter((h) => h.ok).length} 次）</span>
        </p>
      )}
      <Callout type="insight" title="瞳孔是脑力的“电表”">
        <p>
          卡尼曼和比提用这个任务测量瞳孔：做“加3”时，头 5 秒瞳孔就扩大约 50%，心率每分钟增加 7 次——这接近人的极限，再难人就会放弃。关键发现是：<strong>平常聊天时瞳孔几乎不变</strong>。系统2 的日常状态是“散步”，偶尔慢跑，极少冲刺。而当它在冲刺时，你会对眼前的东西视而不见——这正是“看不见的大猩猩”实验：约一半数传球的观众没看到穿过球场的大猩猩，事后还坚信不可能错过。
        </p>
      </Callout>
    </Lab>
  );
}

function CognitiveEase() {
  const causes = ["重复的经历", "清晰的呈现（字体、对比度）", "被启动过的观念", "好心情"];
  const effects = ["感觉熟悉", "感觉真实", "感觉良好", "感觉毫不费力"];
  const [wref, cw] = useWidth(640);
  const narrow = cw < 560;
  return (
    <Card title="认知放松：驾驶舱里的一块仪表" tag="图示 · 书中图5">
      <div ref={wref} />
      {narrow && (
        <div style={{ textAlign: "center" }}>
          <div className="tfs-chips" style={{ justifyContent: "center" }}>
            {causes.map((c) => (
              <span key={c} className="tfs-tag">
                {c}
              </span>
            ))}
          </div>
          <div className="tfs-small">↓</div>
          <span className="tfs-tag s1" style={{ fontSize: 14, padding: "4px 14px" }}>
            认知放松
          </span>
          <div className="tfs-small">↓</div>
          <div className="tfs-chips" style={{ justifyContent: "center" }}>
            {effects.map((c) => (
              <span key={c} className="tfs-tag">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
      {!narrow && <svg className="tfs-chart" viewBox="0 0 640 230" role="img" aria-label="左侧四个原因汇入中间的认知放松，再发散为右侧四种感受">
        {causes.map((c, i) => {
          const y = 30 + i * 52;
          return (
            <g key={c}>
              <rect x="4" y={y - 17} width="190" height="34" rx="10" fill="var(--surface-2)" stroke="var(--line)" />
              <text x="99" y={y + 5} textAnchor="middle" fontSize="13" fill="var(--ink-2)">
                {c}
              </text>
              <path d={`M194,${y} C240,${y} 250,115 282,115`} fill="none" stroke="var(--axis)" strokeWidth="1.5" />
            </g>
          );
        })}
        <circle cx="320" cy="115" r="42" fill="var(--s1-soft)" stroke="var(--s1)" strokeWidth="2" />
        <text x="320" y="111" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--s1-ink)">
          认知
        </text>
        <text x="320" y="129" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--s1-ink)">
          放松
        </text>
        {effects.map((c, i) => {
          const y = 30 + i * 52;
          return (
            <g key={c}>
              <path d={`M362,115 C394,115 400,${y} 446,${y}`} fill="none" stroke="var(--axis)" strokeWidth="1.5" />
              <rect x="446" y={y - 17} width="190" height="34" rx="10" fill="var(--surface-2)" stroke="var(--line)" />
              <text x="541" y={y + 5} textAnchor="middle" fontSize="13" fill="var(--ink-2)">
                {c}
              </text>
            </g>
          );
        })}
      </svg>}
      <p className="tfs-p2" style={{ marginTop: 10 }}>
        系统1 持续在读一块仪表：<strong>事情进展顺利吗？</strong>放松意味着“没问题，不必调动系统2”；紧张意味着“有状况，提高警惕”。麻烦在于，这块仪表<strong>分不清放松的来源</strong>：一句话因为听过很多遍而流畅，和因为它是真的而流畅，感觉一模一样。
      </p>
      <div className="tfs-grid2">
        <Callout type="s1" title="真相错觉的配方（第5章）">
          <p className="tfs-small" style={{ margin: 0 }}>
            重复（“鸡的体温”听多了，随便一个温度都更可信）；清晰的字体与高对比度；押韵（“危难时，敌人团结”比不押韵的版本显得更有见地）；好念的名字（名字好读的股票上市首周表现更好）；避免故弄玄虚的长词。
          </p>
        </Callout>
        <Callout type="plain" title="紧张的一面">
          <p className="tfs-small" style={{ margin: 0 }}>认知紧张让人更警惕、更多疑、更费力，也更少犯错，但直觉与创造力下降。好心情则让系统2 更松懈——“今天心情很好，我得格外小心”。</p>
        </Callout>
      </div>
      <Callout type="warn" title="本章一个著名结果未能复制">
        <p className="tfs-small" style={{ margin: 0 }}>
          书中说：CRT 题目用模糊难读的字体印刷后，普林斯顿学生的出错率从 90% 降到 35%。2015 年 Meyer、Frederick 等人汇总了原研究和 16 次重复实验，<strong>没有发现难读字体提高正确率</strong>。“流畅感影响可信度”这一更大的结论仍被广泛支持，但“故意制造不流畅就能唤醒系统2”站不住。
        </p>
      </Callout>
    </Card>
  );
}

function OrderEffectLab() {
  const [pick, setPick] = useState(null);
  const [mStep, setMStep] = useState(0);
  const alan = ["聪明", "勤奋", "冲动", "爱挑剔", "固执", "忌妒心强"];
  const ben = [...alan].reverse();
  const mindik = ["聪明", "坚强", "腐败", "残忍"];
  return (
    <Lab title="第一印象的力量：光环效应与 WYSIATI">
      <p>凭直觉：你更喜欢谁？</p>
      <div className="tfs-grid2">
        <Card flat title="艾伦">
          <p style={{ margin: 0 }}>{alan.join(" — ")}</p>
        </Card>
        <Card flat title="本">
          <p style={{ margin: 0 }}>{ben.join(" — ")}</p>
        </Card>
      </div>
      <div className="tfs-row">
        {["艾伦", "本", "差不多"].map((o) => (
          <button key={o} className={cx("tfs-btn", pick === o && "primary")} onClick={() => setPick(o)}>
            {o}
          </button>
        ))}
      </div>
      {pick && (
        <div className="tfs-reveal">
          <Callout type="insight" title="再看一遍：两份清单的词完全一样，只是顺序相反">
            <p>
              所罗门·阿希的经典实验中，大多数人更喜欢艾伦。先出现的词改变了后面词的含义：一个“聪明”的人“固执”，是有主见；一个“忌妒心强”的人“固执”，是危险。<strong>第一印象决定了你如何解读后来的、有歧义的信息</strong>——这就是光环效应。
            </p>
          </Callout>
          <p style={{ marginTop: 14 }}>再来一个。“明迪克会是一个出色的领导者吗？她……”</p>
          <div className="tfs-row" style={{ marginBottom: 8 }}>
            {mindik.map((w, i) => (
              <span key={w} className={cx("tfs-tag", i < 2 ? "c3" : "bad")} style={{ opacity: i < mStep + 2 ? 1 : 0.15, fontSize: 14 }}>
                {i < mStep + 2 ? w : "？"}
              </span>
            ))}
            {mStep < 2 && (
              <button className="tfs-btn sm" onClick={() => setMStep(mStep + 1)}>
                显示下一个词
              </button>
            )}
          </div>
          {mStep >= 1 && (
            <p className="tfs-p2 tfs-reveal">
              读到“聪明、坚强”时，你脑中已经有了答案：“当然会”。你并没有先问自己：“判断一个人能否当好领导，我还需要知道什么？”系统1 不等信息收齐就开始编故事，而且<strong>不会因为信息少而感到不安</strong>。卡尼曼把这个倾向命名为 <b>WYSIATI：What You See Is All There Is</b>（眼见即为事实）。
            </p>
          )}
        </div>
      )}
    </Lab>
  );
}

function SubstitutionFlip() {
  const rows = [
    ["你愿意为拯救濒危物种捐多少钱？", "想到垂死的海豚时，我有多难过？"],
    ["你最近对生活满意吗？", "我现在的心情如何？"],
    ["六个月后总统的支持率会怎样？", "总统现在有多受欢迎？"],
    ["欺骗老人的理财顾问该受什么惩罚？", "想到金融骗子，我有多愤怒？"],
    ["这位参选的女士能在政坛走多远？", "她看起来像个政治赢家吗？"],
    ["投资福特股票是否明智？（序言）", "我喜欢福特的汽车吗？"],
  ];
  const [open, setOpen] = useState({});
  return (
    <Card title="替代：你以为回答了这个问题，其实回答的是另一个" tag="互动表 · 第9章">
      <p className="tfs-small">点击左侧的“目标问题”，看看系统1 实际回答的是哪个“启发式问题”。</p>
      <div className="tfs-tablewrap">
        <table className="tfs-table">
          <thead>
            <tr>
              <th>目标问题（你想回答的）</th>
              <th>启发式问题（系统1 实际回答的）</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} onClick={() => setOpen({ ...open, [i]: !open[i] })} style={{ cursor: "pointer" }}>
                <td>{r[0]}</td>
                <td className={open[i] ? "s1t" : "tfs-small"}>{open[i] ? r[1] : "点击揭晓"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 12 }}>
        替代之所以能“无缝”发生，靠两项系统1 的能力：<strong>心理散弹枪</strong>（中译本作“思维的发散性”）——你想算一个量，系统1 会顺手把一堆相关的量都算了；以及<strong>强度匹配</strong>——对海豚的难过程度，可以直接平移成一个捐款数额，就像“如果山姆的身高和他的智力一样出众，他有多高？”这种荒唐的问题，大家也能给出高度一致的答案。
      </p>
      <Callout type="insight" title="最干净的证据：约会与幸福">
        <p>
          德国学生先答“你最近幸福吗”再答“上个月约会几次”，两者几乎不相关；顺序颠倒后，相关度高到心理测量的上限。先想到约会，约会带来的情绪就被当成了“最近幸福吗”的答案。你不会被难题难倒——因为你根本没察觉自己换了题。
        </p>
      </Callout>
    </Card>
  );
}

function CorridorIllusion() {
  const [measure, setMeasure] = useState(false);
  const FH = 74; // 三个人形完全相同的高度
  const fig = (x, y) => (
    <g transform={`translate(${x},${y})`}>
      <circle cx="0" cy={-FH + 9} r="9" fill="var(--ink)" />
      <rect x="-10" y={-FH + 20} width="20" height="31" rx="5" fill="var(--ink)" />
      <rect x="-9" y={-FH + 52} width="7" height="22" rx="3" fill="var(--ink)" />
      <rect x="2" y={-FH + 52} width="7" height="22" rx="3" fill="var(--ink)" />
    </g>
  );
  const bw = { x0: 330, x1: 470, y0: 60, y1: 150 };
  const feet = [0, 0.5, 0.95].map((t) => [200 + (372 - 200) * t, 236 + (152 - 236) * t]);
  return (
    <Card title="立体启发：远处的人看起来更高大" tag="图示 · 书中图9">
      <svg className="tfs-chart" viewBox="0 0 560 250" role="img" aria-label="透视走廊中三个大小完全相同的人形，远处的看起来更大">
        <polygon points={`0,250 560,250 ${bw.x1},${bw.y1} ${bw.x0},${bw.y1}`} fill="var(--surface-2)" />
        <rect x={bw.x0} y={bw.y0} width={bw.x1 - bw.x0} height={bw.y1 - bw.y0} fill="var(--grid)" stroke="var(--axis)" />
        {[
          [0, 250, bw.x0, bw.y1],
          [560, 250, bw.x1, bw.y1],
          [0, 0, bw.x0, bw.y0],
          [560, 0, bw.x1, bw.y0],
        ].map(([a, b, c, d], i) => (
          <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="var(--axis)" strokeWidth="1.2" />
        ))}
        {[0.3, 0.55, 0.75, 0.9].map((t, i) => {
          const y = 250 + (bw.y1 - 250) * t;
          return <line key={i} x1={bw.x0 * t} x2={560 + (bw.x1 - 560) * t} y1={y} y2={y} stroke="var(--axis)" strokeWidth="0.8" opacity="0.7" />;
        })}
        {feet.map(([x, y], i) => (
          <g key={i}>{fig(x, y)}</g>
        ))}
        {measure &&
          feet.map(([x, y], i) => (
            <g key={"m" + i}>
              <line x1={x + 20} x2={x + 20} y1={y - FH} y2={y} stroke="var(--s2)" strokeWidth="2.5" />
              <line x1={x + 15} x2={x + 25} y1={y - FH} y2={y - FH} stroke="var(--s2)" strokeWidth="2" />
              <line x1={x + 15} x2={x + 25} y1={y} y2={y} stroke="var(--s2)" strokeWidth="2" />
            </g>
          ))}
      </svg>
      <div className="tfs-row" style={{ marginTop: 8 }}>
        <button className="tfs-btn" onClick={() => setMeasure(!measure)}>
          {measure ? "收起量尺" : "量一量三个人"}
        </button>
        {measure && <span className="s2t">纸面上三个人一样高。</span>}
      </div>
      <p className="tfs-p2" style={{ marginTop: 10 }}>
        你被问的是“纸上的大小”，却不由自主地回答了“三维世界中的大小”。这就是替代最纯粹的形态：它不是误解了问题，而是另一个问题的答案<strong>自动</strong>浮现并覆盖了原问题。
      </p>
    </Card>
  );
}

function Part1Section() {
  return (
    <div className="tfs-content">
      <SectionHead
        kicker="第一部分 · 第1–9章"
        title="两个系统"
        lead="这一部分搭建全书的“操作系统”：谁在思考，怎样思考，为什么会出错。最重要的三个概念是：懒惰的系统2、WYSIATI（眼见即为事实）和替代。"
        roots={["lazy", "coherence", "substitution"]}
      />
      <h2 className="tfs-h2">两个角色</h2>
      <p>
        看一张愤怒的脸，你<span className="s1t">瞬间</span>知道她在生气，甚至预感她要说难听的话——这是系统1。看到 17×24，你知道这是乘法、答案大概几百，却必须<span className="s2t">刻意地、一步步地</span>去算（答案 408）——这是系统2。
      </p>
      <S1S2Table />
      <StroopLab />
      <MullerLyer />

      <h2 className="tfs-h2">系统2：昂贵、有限、懒惰</h2>
      <p>书中最反直觉的一句话大概是：在“你”这部电影里，自认为是主角的系统2，其实只是配角。它能做系统1 做不到的事——按规则、比较、选择、抑制冲动——但它很贵，而且天生遵循<strong>最省力法则</strong>。</p>
      <AddOneLab />
      <CRTLab />
      <Callout type="warn" title="读第3章时请注意：两个著名证据已经动摇">
        <p className="tfs-small" style={{ margin: 0 }}>
          <b>自我损耗</b>（意志力像肌肉一样会耗尽、喝葡萄糖能恢复）：2016 年 23 个实验室、2141 名被试的预注册重复实验，效应量 d = 0.04，置信区间包含 0。<b>饥饿的法官</b>（假释批准率在饭前降到接近 0）：批评者指出案件并非随机排序——没有律师代理的囚犯通常被排在每段最后，这足以制造同样的曲线。“系统2 忙碌时更容易屈服于诱惑”这个更一般的观点仍有支持，但这两个生动例子不宜再引用。
        </p>
      </Callout>

      <h2 className="tfs-h2">系统1 的工作方式：联想、常态、因果</h2>
      <p>
        读到“香蕉 呕吐”，你的脸会微微皱起，短时间内对香蕉失去兴趣——两个词被自动连成一个因果故事，身体也跟着反应。系统1 的核心是一张巨大的<strong>联想网络</strong>：一个观念被激活，会像涟漪一样激活许多相关观念，而且大部分发生在意识之外。
      </p>
      <p>
        它还维护着一个关于“什么是正常”的模型：第二次在陌生城市偶遇同一个朋友，你反而没第一次惊讶；“摩西带了每种动物各几只上方舟？”很少有人发现应该是诺亚。它也会自动“看见”因果和意图——三个几何图形在屏幕上移动，人人都能看出一个“欺凌与反抗”的故事。
      </p>
      <Callout type="warn" title="第4章（启动效应）需要带着怀疑读">
        <p className="tfs-small" style={{ margin: 0 }}>
          “读了与老人相关的词就走得更慢”（佛罗里达效应）、“想到钱就更自私”、“洗手能洗掉负罪感”等行为启动研究，在后来的大样本重复中多数失败。2017 年，卡尼曼公开承认自己“过于相信样本量不足的研究”。讽刺的是，这恰恰是本书第10章“小数定律”警告过的错误。<b>词汇层面的启动（读过“喝”更容易补出“汤”）是稳健的；从一个词直接影响复杂行为的说法不再可信。</b>
        </p>
      </Callout>
      <CognitiveEase />

      <h2 className="tfs-h2">急于下结论：WYSIATI</h2>
      <p>
        系统1 的判断标准是<strong>连贯</strong>，而不是完整。它只能调用已被激活的信息，而“缺失的信息”不会自己跳出来抗议。于是出现一个悖论：<strong>知道得越少，越容易拼出一个毫无矛盾的故事，也就越自信。</strong>在一项实验里，只听到控辩一方陈述的人，比听到双方陈述的人对自己的判断更有信心。
      </p>
      <OrderEffectLab />
      <Callout type="c3" title="可以立刻用上：让证据保持独立">
        <p>
          卡尼曼改卷子时发现，第一篇文章的分数会给后面的文章镀上光环，于是改为“先改所有人的第一题，再改所有人的第二题”，并把分数写在背面——结果他对自己的评分信心下降了，但评分更准了。<strong>群体智慧只在误差相互独立时才成立</strong>：开会讨论前，先让每个人把自己的意见写下来。
        </p>
      </Callout>
      <p>WYSIATI 能直接解释之后的许多偏差：<b>过度自信</b>（信心取决于故事，不取决于证据）、<b>框架效应</b>（你只看到了呈现给你的那种说法）、<b>忽视基础比率</b>（生动的描述占满了“眼前所见”）。</p>

      <h2 className="tfs-h2">替代：全书的枢纽</h2>
      <p>
        系统1 一直在做“基本评估”：是敌是友？好还是坏？正常吗？一眼能看出一组线段的<strong>平均长度</strong>，却看不出<strong>总长度</strong>。它甚至能从一张 0.1 秒的脸上评估“能力”——托多罗夫发现，大约 70% 的美国参议员、众议员和州长选举，获胜者正是照片上看起来更“有能力”的那位；对信息少、爱看电视的选民，这种影响约是其他人的三倍。
      </p>
      <SubstitutionFlip />
      <CorridorIllusion />
      <Callout type="insight" title="第一部分的核心一句话">
        <p>
          系统1 永远有答案，但那往往是<strong>另一个更容易的问题</strong>的答案；它给出的答案越连贯、越流畅，系统2 越不会去检查。后面四个部分的几乎所有现象，都可以用“替代 + WYSIATI + 懒惰的系统2”来推导。
        </p>
      </Callout>
      <Card flat title="饮水机旁可以这么说" tag="词汇">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>“这是你系统1 的反应。慢一点，让系统2 也说两句。”</li>
          <li>“他们看了一份漂亮的咨询报告就拍板了——根本没意识到手里的信息有多少。”</li>
          <li>“讨论之前，大家先各自写下判断，免得相互带偏。”</li>
          <li>“我们是不是把那个难题换成了一个简单问题？”</li>
        </ul>
      </Card>
    </div>
  );
}

/* ============================================================
   第二部分 · 启发法与偏差
   ============================================================ */
function CountyLab() {
  const [wref, cw] = useWidth(640);
  const N = 320,
    RATE = 0.0005; // 真实发病率处处相同：每万人 5 例
  const pops = useMemo(() => {
    const r = makeRng(2024);
    return Array.from({ length: N }, () => Math.round(Math.pow(10, 3 + r() * 3)));
  }, []);
  const [seed, setSeed] = useState(1);
  const data = useMemo(() => {
    const r = makeRng(seed * 7919 + 13);
    const d = pops.map((p, i) => {
      const cases = poisson(r, p * RATE);
      return { i, p, rate: (cases / p) * 1e4, tie: r() };
    });
    const byHigh = [...d].sort((a, b) => b.rate - a.rate || a.tie - b.tie);
    const byLow = [...d].sort((a, b) => a.rate - b.rate || a.tie - b.tie);
    const hi = new Set(byHigh.slice(0, 10).map((x) => x.i));
    const lo = new Set(byLow.slice(0, 10).map((x) => x.i));
    const med = [...pops].sort((a, b) => a - b)[N / 2];
    return { d, hi, lo, hiPop: mean(byHigh.slice(0, 10).map((x) => x.p)), loPop: mean(byLow.slice(0, 10).map((x) => x.p)), med };
  }, [seed, pops]);
  const W = Math.max(300, cw),
    H = 314,
    L = 50,
    R = 16,
    T = 28,
    B = 40;
  const YMAX = 30;
  const x = lin(3, 6, L, W - R);
  const y = lin(0, YMAX, H - B, T);
  const fmtPop = (v) => (v >= 10000 ? `${fmtNum(v / 10000, 1)} 万` : `${fmtNum(v)}`);
  return (
    <Lab title="肾癌发病率最低的县，都在人口稀少的乡村……最高的也是" note="下面是 320 个模拟的县。它们的真实发病率完全相同（每万人 5 例），唯一的差别是人口多少。">
      <div className="tfs-legend">
        <span>
          <i style={{ background: "var(--s1)", borderRadius: "50%" }} />
          发病率最高的 10 个县
        </span>
        <span>
          <i style={{ background: "var(--s2)", borderRadius: "50%" }} />
          发病率最低的 10 个县
        </span>
        <span>
          <i style={{ background: "var(--axis)", borderRadius: "50%" }} />
          其他
        </span>
      </div>
      <div ref={wref}><svg className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="散点图：横轴为县人口（对数），纵轴为观测到的发病率。极端值都集中在人口少的一端。">
        {[0, 10, 20, 30].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--grid)" />
            <text x={L - 8} y={y(v) + 4} fontSize="11" textAnchor="end" fill="var(--muted)">
              {v}
            </text>
          </g>
        ))}
        <line x1={L} x2={W - R} y1={y(5)} y2={y(5)} stroke="var(--c3)" strokeWidth="1.5" />
        <text x={W - R} y={y(5) - 6} fontSize="11" textAnchor="end" fill="var(--c3-ink)" fontWeight="600">
          真实发病率 5
        </text>
        {[3, 4, 5, 6].map((v) => (
          <text key={v} x={x(v)} y={H - B + 18} fontSize="11" textAnchor="middle" fill="var(--muted)">
            {["1 千", "1 万", "10 万", "100 万"][v - 3]}
          </text>
        ))}
        <text x={(L + W - R) / 2} y={H - 4} fontSize="12" textAnchor="middle" fill="var(--ink-2)">
          县人口（对数刻度）
        </text>
        <text x={12} y={12} fontSize="12" fill="var(--ink-2)">
          每万人发病数
        </text>
        {data.d
          .filter((p) => !data.hi.has(p.i) && !data.lo.has(p.i))
          .map((p) => (
            <circle key={p.i} cx={x(Math.log10(p.p))} cy={y(Math.min(p.rate, YMAX))} r="3" fill="var(--axis)" opacity="0.7" />
          ))}
        {data.d
          .filter((p) => data.hi.has(p.i) || data.lo.has(p.i))
          .map((p) => (
            <circle key={p.i} cx={x(Math.log10(p.p))} cy={y(Math.min(p.rate, YMAX))} r="5" fill={data.hi.has(p.i) ? "var(--s1)" : "var(--s2)"} stroke="var(--surface)" strokeWidth="2" />
          ))}
      </svg></div>
      <div className="tfs-grid3">
        <Stat v={fmtPop(data.hiPop)} l="最高 10 县的平均人口" />
        <Stat v={fmtPop(data.loPop)} l="最低 10 县的平均人口" />
        <Stat v={fmtPop(data.med)} l="所有县的人口中位数" />
      </div>
      <div className="tfs-row" style={{ marginTop: 12 }}>
        <button className="tfs-btn" onClick={() => setSeed(seed + 1)}>
          再观察一年（重新抽样）
        </button>
        <span className="tfs-small">注意：每次“最极端”的县都换了一批——它们并没有什么特别。</span>
      </div>
      <Callout type="insight" title="没有原因需要解释">
        <p>
          人口少的县，几个病例的增减就能让比率大起大落，所以<strong>最高和最低</strong>都出现在小县。“乡村空气好”和“乡村医疗差”这两个听起来都很有道理的解释，同时是错的。系统1 看到差异就要找原因，而这里唯一的“原因”是样本量。
        </p>
      </Callout>
    </Lab>
  );
}

function UrnMini() {
  const [n, setN] = useState(4);
  const p = 2 * Math.pow(0.5, n);
  return (
    <Card flat title="半红半白的罐子：一次抓几颗？" tag="小算一下">
      <Slider label="每次抓出的弹珠数" value={n} min={2} max={12} onChange={setN} />
      <p style={{ marginBottom: 0 }}>
        抓出的弹珠<strong>全部同色</strong>的概率 = 2 × 0.5<sup>{n}</sup> = <b className="s2t">{fmtPct(p, p < 0.01 ? 2 : 1)}</b>。书中杰克每次抓 4 颗（12.5%），吉尔每次抓 7 颗（1.56%）：杰克看到“极端结果”的次数是吉尔的 8 倍。没有任何“原因”，只是算术。
      </p>
    </Card>
  );
}

function SequenceQuiz() {
  const [pick, setPick] = useState(null);
  const opts = [
    { id: "a", label: "男男男女女女" },
    { id: "b", label: "女女女女女女" },
    { id: "c", label: "男女男男女女" },
    { id: "d", label: "三种一样可能" },
  ];
  return (
    <Card flat title="医院里接连出生的 6 个婴儿，哪个性别顺序最可能？" tag="小测">
      <Choice options={opts} value={pick} onChange={setPick} reveal={!!pick} correct="d" />
      {pick && (
        <p className="tfs-reveal tfs-p2" style={{ marginBottom: 0 }}>
          每个具体序列的概率都是 (1/2)<sup>6</sup> = 1/64。我们觉得第三个“更随机”，是因为前两个看起来像有规律，而有规律的东西在系统1 看来就该有原因。二战时伦敦人坚信 V-1 火箭的落点有模式、未被炸的街区住着德国间谍——统计分析显示那正是随机分布的典型样子。
        </p>
      )}
    </Card>
  );
}

function AnchorLab() {
  const [rot, setRot] = useState(0);
  const [val, setVal] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [dir, setDir] = useState(null);
  const [est, setEst] = useState("");
  const tm = useRef(null);
  useEffect(() => () => clearTimeout(tm.current), []);
  const spin = () => {
    const v = Math.random() < 0.5 ? 10 : 65;
    const th = (v / 100) * 360;
    const newRot = rot + 1440 + ((((-th - rot) % 360) + 360) % 360);
    setVal(v);
    setRot(newRot);
    setPhase("spinning");
    clearTimeout(tm.current);
    tm.current = setTimeout(() => setPhase("q1"), 3300);
  };
  const cxy = 110,
    Rr = 92;
  return (
    <Lab title="幸运轮盘：一个明知无关的数字，能把你拖多远？" note="卡尼曼和特沃斯基把轮盘做了手脚，只会停在 10 或 65。请先转动它。">
      <div className="tfs-row" style={{ alignItems: "flex-start", gap: 20 }}>
        <svg viewBox="0 0 220 230" style={{ width: 200, flex: "none" }} role="img" aria-label={`幸运轮盘${val !== null && phase !== "spinning" ? `，停在 ${val}` : ""}`}>
          <polygon points={`${cxy - 9},4 ${cxy + 9},4 ${cxy},22`} fill="var(--s1)" />
          <g className="tfs-wheel" style={{ transform: `rotate(${rot}deg)`, transformOrigin: `${cxy}px ${cxy + 10}px` }}>
            <circle cx={cxy} cy={cxy + 10} r={Rr} fill="var(--surface-2)" stroke="var(--axis)" strokeWidth="1.5" />
            {Array.from({ length: 20 }, (_, i) => {
              const th = (i / 20) * 2 * Math.PI;
              const x1 = cxy + Math.sin(th) * Rr,
                y1 = cxy + 10 - Math.cos(th) * Rr;
              const x2 = cxy + Math.sin(th) * (Rr - (i % 2 === 0 ? 12 : 6)),
                y2 = cxy + 10 - Math.cos(th) * (Rr - (i % 2 === 0 ? 12 : 6));
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--axis)" strokeWidth="1.5" />;
            })}
            {Array.from({ length: 10 }, (_, i) => {
              const th = (i / 10) * 2 * Math.PI;
              return (
                <text key={i} x={cxy + Math.sin(th) * (Rr - 26)} y={cxy + 10 - Math.cos(th) * (Rr - 26) + 4} fontSize="12" textAnchor="middle" fill="var(--ink-2)">
                  {i * 10}
                </text>
              );
            })}
            <circle cx={cxy} cy={cxy + 10} r="6" fill="var(--ink)" />
          </g>
        </svg>
        <div style={{ flex: 1, minWidth: 220 }}>
          {phase === "idle" && (
            <button className="tfs-btn primary" onClick={spin}>
              转动轮盘
            </button>
          )}
          {phase === "spinning" && <p className="tfs-small">转动中……</p>}
          {(phase === "q1" || phase === "q2" || phase === "done") && (
            <div className="tfs-reveal">
              <p>
                轮盘停在 <b className="s1t">{val}</b>。
              </p>
              <p style={{ marginBottom: 6 }}>问题一：非洲国家在联合国会员国中所占的比例，高于还是低于 {val}%？</p>
              <div className="tfs-row">
                {["高于", "低于"].map((d) => (
                  <button
                    key={d}
                    className={cx("tfs-btn sm", dir === d && "primary")}
                    onClick={() => {
                      setDir(d);
                      if (phase === "q1") setPhase("q2");
                    }}
                  >
                    {d} {val}%
                  </button>
                ))}
              </div>
            </div>
          )}
          {(phase === "q2" || phase === "done") && (
            <div className="tfs-reveal" style={{ marginTop: 12 }}>
              <p style={{ marginBottom: 6 }}>问题二：你估计的具体比例是多少？</p>
              <div className="tfs-row">
                <input className="tfs-input" inputMode="numeric" value={est} disabled={phase === "done"} onChange={(e) => setEst(e.target.value.replace(/[^\d.]/g, ""))} aria-label="你的估计百分比" />
                <span>%</span>
                {phase === "q2" && (
                  <button className="tfs-btn primary sm" disabled={!est} onClick={() => setPhase("done")}>
                    确定
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {phase === "done" && (
        <div className="tfs-reveal">
          <div className="tfs-grid3" style={{ marginTop: 14 }}>
            <Stat v="25%" l="看到 10 的学生，平均估计" />
            <Stat v="45%" l="看到 65 的学生，平均估计" />
            <Stat v="≈ 28%" l="真实值：54 / 193 个会员国" />
          </div>
          <p style={{ marginTop: 12 }}>
            你看到的是 <b>{val}</b>，估计是 <b>{est}%</b>。单个人无法证明锚定（你不知道没看到这个数时会怎么答），但群体数据很清楚：一个<strong>明知是随机转出来的</strong>数字，把平均估计拉开了 20 个百分点。
          </p>
        </div>
      )}
    </Lab>
  );
}

function AnchorIndexChart() {
  const data = [
    { label: "红杉树有多高", v: 55, note: "锚 1200 英尺 vs 180 英尺 → 平均估计 844 vs 282（旧金山探索馆游客）" },
    { label: "德国法官量刑", v: 50, note: "掷出被做了手脚的骰子（3 或 9）→ 平均判 5 个月 vs 8 个月" },
    { label: "商学院学生估房价", v: 48, note: "他们承认受到了标价影响" },
    { label: "联合国非洲国家比例", v: 44, note: "幸运轮盘 10 vs 65" },
    { label: "房产经纪人估房价", v: 41, note: "他们坚称标价没有影响自己" },
    { label: "保护海鸟的捐款", v: 30, note: "先问“愿不愿捐 5 美元/400 美元”→ 平均 20 美元 vs 143 美元" },
  ];
  return (
    <Card title="锚定指数：估计被锚拖动了多少" tag="数据">
      <p className="tfs-small">锚定指数 = 两组平均估计之差 ÷ 两个锚之差。100% 表示完全照抄锚，0 表示完全不受影响。把鼠标移到条上看细节。</p>
      <HBarChart data={data} max={100} format={(v) => `${v}%`} labelWidth={160} />
      <TableToggle columns={[{ label: "场景" }, { label: "锚定指数", num: true }, { label: "说明" }]} rows={data.map((d) => [d.label, `${d.v}%`, d.note])} />
    </Card>
  );
}

function DeathQuiz() {
  const pairs = [
    { a: "中风", b: "所有意外事故", ans: "a", fact: "中风致死几乎是所有意外事故总和的 2 倍，但 80% 的受访者选了意外事故。" },
    { a: "龙卷风", b: "哮喘", ans: "b", fact: "哮喘致死是龙卷风的 20 倍，人们却认为龙卷风更致命。" },
    { a: "雷击", b: "肉毒杆菌食物中毒", ans: "a", fact: "雷击致死是肉毒杆菌中毒的 52 倍，却被认为更少见。" },
    { a: "各种疾病", b: "各种意外", ans: "a", fact: "疾病致死是意外的 18 倍，但两者被认为差不多。" },
    { a: "糖尿病", b: "意外事故", ans: "a", fact: "人们判断意外致死是糖尿病的 300 倍；真实比例是 1 : 4（糖尿病更多）。" },
  ];
  const [picks, setPicks] = useState({});
  const done = Object.keys(picks).length === pairs.length;
  const score = pairs.filter((p, i) => picks[i] === p.ans).length;
  return (
    <Lab title="哪一个杀死的人更多？" note="题目来自斯洛维克、利希滕斯坦、费斯科霍夫在 1970 年代的研究，比较对象是当时的美国死亡统计。每组选一个。">
      {pairs.map((p, i) => (
        <div key={i} style={{ padding: "8px 0", borderBottom: i < pairs.length - 1 ? "1px dashed var(--line)" : 0 }}>
          <div className="tfs-row">
            <span style={{ width: 22 }} className="tfs-small">
              {i + 1}.
            </span>
            {["a", "b"].map((k) => {
              let cls = picks[i] === k ? "primary" : "";
              return (
                <button key={k} className={cx("tfs-btn sm", cls)} onClick={() => !done && setPicks({ ...picks, [i]: k })}>
                  {p[k]}
                </button>
              );
            })}
            {done && <span className={picks[i] === p.ans ? "c3t" : "badt"}>{picks[i] === p.ans ? "✓" : "✗"}</span>}
          </div>
          {done && <p className="tfs-small" style={{ margin: "4px 0 0 32px" }}>{p.fact}</p>}
        </div>
      ))}
      {done && (
        <Callout type="insight" title={`你答对了 ${score} / ${pairs.length}`}>
          <p>
            错的方向高度一致：<strong>被报道得多、画面感强、情绪强烈的死因被高估</strong>，安静的慢性病被低估。我们并不是在估计频率，而是在报告“想起一个例子有多容易”——而这取决于媒体与情绪，不取决于统计。
          </p>
        </Callout>
      )}
    </Lab>
  );
}

const BAYES_PRESETS = {
  cab: { name: "出租车问题（第16章）", H: "肇事车是蓝色", E: "证人说是蓝色", p: 0.15, hit: 0.8, fa: 0.2 },
  tom: { name: "汤姆的专业（第14章）", H: "汤姆读计算机", E: "符合那段性格描述", p: 0.03, hit: 0.4, fa: 0.1 },
  steve: { name: "史蒂夫：图书管理员还是农民（序言）", H: "史蒂夫是图书管理员", E: "“腼腆、整洁、注重细节”", p: 1 / 21, hit: 0.4, fa: 0.1 },
  test: { name: "罕见病筛查（延伸）", H: "真的患病", E: "检测呈阳性", p: 0.01, hit: 0.9, fa: 0.09 },
};
function BayesLab() {
  const [key, setKey] = useState("cab");
  const [st, setSt] = useState(BAYES_PRESETS.cab);
  const choose = (k) => {
    setKey(k);
    setSt(BAYES_PRESETS[k]);
  };
  const { p, hit, fa } = st;
  const total = 1000;
  const nH = Math.round(total * p);
  const TP = Math.round(nH * hit);
  const FN = nH - TP;
  const FP = Math.round((total - nH) * fa);
  const TN = total - nH - FP;
  const post = (p * hit) / (p * hit + (1 - p) * fa);
  const cells = [];
  for (let i = 0; i < total; i++) cells.push(i < TP ? "TP" : i < TP + FN ? "FN" : i < TP + FN + FP ? "FP" : "TN");
  const col = { TP: "var(--s2)", FN: "var(--s2-soft)", FP: "var(--s1)", TN: "var(--grid)" };
  const cols = 50,
    sz = 12,
    gap = 1.5;
  return (
    <Lab title="贝叶斯计算器：把证据和基础比率放在一起" note="用“1000 个类似情形”来想，而不是用百分比来想——自然频率是系统1 也能看懂的格式。">
      <div className="tfs-chips">
        {Object.entries(BAYES_PRESETS).map(([k, v]) => (
          <button key={k} className={cx("tfs-chip", key === k && "on")} onClick={() => choose(k)}>
            {v.name}
          </button>
        ))}
      </div>
      <div className="tfs-grid3">
        <Slider label={`基础比率：${st.H}`} value={Math.round(p * 1000) / 10} min={0.5} max={50} step={0.5} format={(v) => `${v}%`} onChange={(v) => setSt({ ...st, p: v / 100 })} />
        <Slider label="命中率 P(证据 | 是)" value={Math.round(hit * 100)} min={5} max={99} format={(v) => `${v}%`} onChange={(v) => setSt({ ...st, hit: v / 100 })} />
        <Slider label="误报率 P(证据 | 不是)" value={Math.round(fa * 100)} min={1} max={60} format={(v) => `${v}%`} onChange={(v) => setSt({ ...st, fa: v / 100 })} />
      </div>
      <div className="tfs-legend" style={{ marginTop: 10 }}>
        <span>
          <i style={{ background: col.TP }} />是，且出现证据（{TP}）
        </span>
        <span>
          <i style={{ background: col.FN, outline: "1px solid var(--s2)" }} />是，但没出现证据（{FN}）
        </span>
        <span>
          <i style={{ background: col.FP }} />不是，却出现了证据（{FP}）
        </span>
        <span>
          <i style={{ background: col.TN, outline: "1px solid var(--axis)" }} />不是，也没出现证据（{TN}）
        </span>
      </div>
      <svg className="tfs-chart" viewBox={`0 0 ${cols * (sz + gap)} ${(total / cols) * (sz + gap)}`} role="img" aria-label={`1000 个格子：${TP} 个真阳性，${FP} 个假阳性`}>
        {cells.map((c, i) => (
          <rect key={i} x={(i % cols) * (sz + gap)} y={Math.floor(i / cols) * (sz + gap)} width={sz} height={sz} rx="2" fill={col[c]} />
        ))}
      </svg>
      <div className="tfs-grid3" style={{ marginTop: 12 }}>
        <Stat v={fmtPct(hit)} l="常见的直觉答案（只看证据的可靠性）" />
        <Stat v={fmtPct(post, 1)} l={`正确答案：看到“${st.E}”时，${st.H}的概率`} />
        <Stat v={`${TP} / ${TP + FP}`} l="出现证据的情形中，真正“是”的比例" />
      </div>
      <p style={{ marginTop: 12 }} className="tfs-p2">
        在 1000 个情形中，{st.H}的有 {nH} 个，其中 {TP} 个出现了证据；不是的有 {total - nH} 个，其中也有 {FP} 个出现了证据。所以当你看到证据时，你面对的是 {TP + FP} 个情形，其中只有 {TP} 个是真的——
        <b>{fmtPct(post, 1)}</b>。橙色格子越多，直觉就错得越离谱，而橙色格子的数量由<strong>基础比率</strong>决定。
      </p>
    </Lab>
  );
}

function LindaLab() {
  const [pick, setPick] = useState(null);
  const [dice, setDice] = useState(null);
  return (
    <Lab title="琳达问题">
      <p className="tfs-quote" style={{ fontSize: 16 }}>
        琳达，31 岁，单身，直率又聪明，主修哲学。学生时代，她非常关心歧视和社会公正问题，还参加过反核示威。
      </p>
      <p>下面哪一种可能性更大？</p>
      <Choice
        options={[
          { id: "a", label: "A. 琳达是银行出纳" },
          { id: "b", label: "B. 琳达是银行出纳，同时积极参与女权运动" },
        ]}
        value={pick}
        onChange={setPick}
        reveal={!!pick}
        correct="a"
      />
      {pick && (
        <div className="tfs-reveal">
          <div className="tfs-row" style={{ alignItems: "center", gap: 18, marginTop: 6 }}>
            <svg viewBox="0 0 260 170" style={{ width: 240, flex: "none" }} role="img" aria-label="维恩图：女权主义银行出纳是银行出纳的一个子集">
              <circle cx="100" cy="85" r="72" fill="var(--s2-soft)" stroke="var(--s2)" strokeWidth="1.5" />
              <circle cx="178" cy="85" r="60" fill="var(--s1-soft)" stroke="var(--s1)" strokeWidth="1.5" opacity="0.85" />
              <clipPath id="lindaClip">
                <circle cx="100" cy="85" r="72" />
              </clipPath>
              <circle cx="178" cy="85" r="60" fill="var(--ink)" opacity="0.18" clipPath="url(#lindaClip)" />
              <text x="62" y="90" fontSize="13" fill="var(--s2-ink)" fontWeight="700" textAnchor="middle">
                银行出纳
              </text>
              <text x="205" y="90" fontSize="12" fill="var(--s1-ink)" fontWeight="700" textAnchor="middle">
                女权主义者
              </text>
              <text x="146" y="152" fontSize="11" fill="var(--ink-2)" textAnchor="middle">
                交集 ⊂ 银行出纳
              </text>
            </svg>
            <div style={{ flex: 1, minWidth: 220 }}>
              <p>
                答案是 A。“女权主义的银行出纳”是“银行出纳”的子集，<strong>子集的概率不可能大于全集</strong>。可是在顶尖大学的本科生中有 85%–90% 选了 B，斯坦福商学院决策科学方向的博士生也有 85% 选 B。
              </p>
            </div>
          </div>
          <Callout type="insight" title="为什么？因为你回答的是“像不像”，不是“可能性多大”">
            <p>
              B 让故事更连贯、更“像”琳达；而系统1 用<strong>代表性</strong>（典型程度）替代了概率。卡尼曼把这叫<b>合取谬误</b>：多加一个细节，故事更可信，事件却更不可能。生物学家古尔德说：“我知道正确答案，可我脑子里有个小人一直在跳着喊：她不可能只是个银行出纳！”
            </p>
            <p className="tfs-small">
              有效的解药是换成频率格式：“100 位被调查者中，有多少人……”这种问法把错误率从 65% 降到了 25%。这也是后来吉仁泽等批评者强调的一点：问题的呈现方式会显著改变结果。
            </p>
          </Callout>
          <p style={{ marginTop: 16 }}>
            <b>非文字版本：</b>一个骰子四面绿（G）、两面红（R），要掷 20 次。你押哪个序列会出现？
          </p>
          <Choice
            options={[
              { id: 1, label: "1. RGRRR" },
              { id: 2, label: "2. GRGRRR" },
              { id: 3, label: "3. GRRRRR" },
            ]}
            value={dice}
            onChange={setDice}
            reveal={dice !== null}
            correct={1}
          />
          {dice !== null && (
            <p className="tfs-p2 tfs-reveal">
              序列 2 就是序列 1 前面多加一个 G——只要 2 出现，1 必然出现，所以 1 的可能性更大。但 2 里有两个 G，“看起来更像”这个绿多红少的骰子，于是约三分之二的人押了 2。
            </p>
          )}
        </div>
      )}
    </Lab>
  );
}

function RegressionLab() {
  const [wref, cw] = useWidth(520);
  const [r, setR] = useState(0.5);
  const [seed, setSeed] = useState(3);
  const [coach, setCoach] = useState(false);
  const N = 300;
  const sim = useMemo(() => {
    const g = makeRng(seed * 31 + 5);
    const pts = [];
    for (let i = 0; i < N; i++) {
      const skill = randn(g),
        l1 = randn(g),
        l2 = randn(g);
      pts.push({ d1: Math.sqrt(r) * skill + Math.sqrt(1 - r) * l1, d2: Math.sqrt(r) * skill + Math.sqrt(1 - r) * l2 });
    }
    const s = [...pts].sort((a, b) => b.d1 - a.d1);
    const top = s.slice(0, 30),
      bot = s.slice(-30);
    return {
      pts,
      topSet: new Set(top),
      botSet: new Set(bot),
      top1: mean(top.map((p) => p.d1)),
      top2: mean(top.map((p) => p.d2)),
      bot1: mean(bot.map((p) => p.d1)),
      bot2: mean(bot.map((p) => p.d2)),
      corr: pearson(pts.map((p) => p.d1), pts.map((p) => p.d2)),
    };
  }, [r, seed]);
  const W = Math.max(300, Math.min(cw, 640)),
    H = Math.round(Math.min(414, W * 0.82)),
    L = 44,
    Rm = 14,
    T = 28,
    B = 40;
  const x = lin(-3.5, 3.5, L, W - Rm),
    y = lin(-3.5, 3.5, H - B, T);
  return (
    <Lab title="回归平均值：技能与运气的混合" note="模拟 300 名选手连续两天的表现（标准分，越高越好）。滑块控制表现中“技能”所占的比例，它恰好等于两天表现的相关系数。">
      <Slider label="技能占比（= 两天表现的相关系数 r）" value={r} min={0} max={1} step={0.05} format={(v) => v.toFixed(2)} onChange={setR} />
      <div className="tfs-row" style={{ margin: "6px 0" }}>
        <button className="tfs-btn sm" onClick={() => setSeed(seed + 1)}>
          重新模拟
        </button>
        <button className={cx("tfs-btn sm", coach && "primary")} onClick={() => setCoach(!coach)}>
          飞行教练视角
        </button>
      </div>
      <div className="tfs-legend">
        <span>
          <i style={{ background: "var(--s1)", borderRadius: "50%" }} />
          {coach ? "第一天表现最好的 10%（被表扬）" : "第一天前 10%"}
        </span>
        <span>
          <i style={{ background: "var(--s2)", borderRadius: "50%" }} />
          {coach ? "第一天表现最差的 10%（被训斥）" : "第一天后 10%"}
        </span>
        <span>
          <i className="ln" style={{ background: "var(--axis)" }} />
          若第二天完全复现第一天（y = x）
        </span>
        <span>
          <i className="ln" style={{ background: "var(--c3)" }} />
          最佳预测（y = r·x）
        </span>
      </div>
      <div ref={wref}><svg className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`散点图：第一天与第二天表现，相关系数约 ${sim.corr.toFixed(2)}`}>
        {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={T} y2={H - B} stroke="var(--grid)" />
            <line x1={L} x2={W - Rm} y1={y(v)} y2={y(v)} stroke="var(--grid)" />
            <text x={x(v)} y={H - B + 16} fontSize="11" textAnchor="middle" fill="var(--muted)">
              {v}
            </text>
            <text x={L - 8} y={y(v) + 4} fontSize="11" textAnchor="end" fill="var(--muted)">
              {v}
            </text>
          </g>
        ))}
        <text x={(L + W) / 2} y={H - 6} fontSize="12" textAnchor="middle" fill="var(--ink-2)">
          第一天表现
        </text>
        <text x={L - 34} y={14} fontSize="12" fill="var(--ink-2)">
          第二天表现
        </text>
        <line x1={x(-3.5)} y1={y(-3.5)} x2={x(3.5)} y2={y(3.5)} stroke="var(--axis)" strokeWidth="1.5" />
        <line x1={x(-3.5)} y1={y(-3.5 * r)} x2={x(3.5)} y2={y(3.5 * r)} stroke="var(--c3)" strokeWidth="2" />
        {sim.pts.map((p, i) => {
          const hi = sim.topSet.has(p),
            lo = sim.botSet.has(p);
          if (hi || lo) return null;
          return <circle key={i} cx={x(clamp(p.d1, -3.5, 3.5))} cy={y(clamp(p.d2, -3.5, 3.5))} r="2.6" fill="var(--axis)" opacity="0.55" />;
        })}
        {sim.pts.map((p, i) => {
          const hi = sim.topSet.has(p),
            lo = sim.botSet.has(p);
          if (!hi && !lo) return null;
          return <circle key={"h" + i} cx={x(clamp(p.d1, -3.5, 3.5))} cy={y(clamp(p.d2, -3.5, 3.5))} r="4" fill={hi ? "var(--s1)" : "var(--s2)"} stroke="var(--surface)" strokeWidth="1.5" />;
        })}
      </svg></div>
      <div className="tfs-grid2">
        <Stat v={`${sim.top1.toFixed(2)} → ${sim.top2.toFixed(2)}`} l={coach ? "被表扬的一组：第一天 → 第二天（变差了）" : "前 10%：第一天 → 第二天"} />
        <Stat v={`${sim.bot1.toFixed(2)} → ${sim.bot2.toFixed(2)}`} l={coach ? "被训斥的一组：第一天 → 第二天（变好了）" : "后 10%：第一天 → 第二天"} />
      </div>
      <Callout type="insight" title={coach ? "教练的观察完全正确，结论完全错误" : "极端的背后，总有一部分是运气"}>
        {coach ? (
          <p>
            以色列空军的老教练说：“我表扬做得好的学员，下次他们总是变差；我吼那些做得差的，下次总是变好。所以别跟我说奖励比惩罚有效。”在这个模拟里<strong>根本没有表扬和训斥</strong>，同样的模式照样出现。卡尼曼的感慨是：由于回归，生活给我们的反馈是反常的——我们因为对别人好而“受罚”，因为对别人凶而“得奖”。
          </p>
        ) : (
          <p>
            <b>成功 = 天赋 + 运气；巨大的成功 = 更多的天赋 + 更多的运气。</b>第一天特别好的人，平均而言运气也特别好，而运气不会延续，所以第二天会回落。r 越小（运气成分越大），回归越猛；r = 1 时完全不回归，r = 0 时第二天与第一天毫无关系。回归不需要任何原因，也就无法用原因来“解释”。
          </p>
        )}
      </Callout>
    </Lab>
  );
}

function PredictionCorrector() {
  const [wref, cw] = useWidth(560);
  const [m, setM] = useState(3.0);
  const [intu, setIntu] = useState(3.8);
  const [r, setR] = useState(0.3);
  const corr = m + r * (intu - m);
  const W = Math.max(300, cw),
    L = 30,
    Rr = 30;
  const x = lin(2, 4, L, W - Rr);
  return (
    <Lab title="四步修正直觉预测：朱莉 4 岁就能流畅阅读，她大学的 GPA 会是多少？" note="你的直觉很可能冒出 3.7 或 3.8——那是把“阅读早慧”的百分位直接平移成了 GPA 的百分位（强度匹配）。">
      <div className="tfs-grid3">
        <Slider label="① 基准：同类学生 GPA 平均" value={m} min={2} max={3.6} step={0.05} format={(v) => v.toFixed(2)} onChange={setM} />
        <Slider label="② 你的直觉匹配值" value={intu} min={2} max={4} step={0.05} format={(v) => v.toFixed(2)} onChange={setIntu} />
        <Slider label="③ 证据与结果的相关度" value={r} min={0} max={1} step={0.05} format={(v) => v.toFixed(2)} onChange={setR} />
      </div>
      <div ref={wref}><svg className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} 118`} role="img" aria-label={`数轴：均值 ${m.toFixed(2)}，修正后 ${corr.toFixed(2)}，直觉 ${intu.toFixed(2)}`}>
        <line x1={L} x2={W - Rr} y1={62} y2={62} stroke="var(--axis)" strokeWidth="1.5" />
        {[2, 2.5, 3, 3.5, 4].map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={57} y2={67} stroke="var(--axis)" />
            <text x={x(v)} y={112} fontSize="11" textAnchor="middle" fill="var(--muted)">
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        <line x1={x(m)} x2={x(corr)} y1={62} y2={62} stroke="var(--c3)" strokeWidth="4" />
        {[
          [m, "var(--axis)", "均值", 90],
          [corr, "var(--c3)", "修正后", 22],
          [intu, "var(--s1)", "直觉", 42],
        ].map(([v, c, t, ly], i) => (
          <g key={i}>
            <line x1={x(v)} x2={x(v)} y1={ly < 62 ? ly + 4 : 70} y2={ly < 62 ? 55 : ly - 12} stroke={c} strokeWidth="1" />
            <circle cx={x(v)} cy={62} r="7" fill={c} stroke="var(--surface)" strokeWidth="2" />
            <text x={clamp(x(v), 60, W - 60)} y={ly} fontSize="12" textAnchor="middle" fill="var(--ink)" fontWeight="600">
              {t} {Number(v).toFixed(2)}
            </text>
          </g>
        ))}
      </svg></div>
      <p>
        ④ 从均值出发，只朝直觉方向走相关度那么远：<b>{m.toFixed(2)} + {r.toFixed(2)} × ({intu.toFixed(2)} − {m.toFixed(2)}) = </b>
        <b className="c3t">{corr.toFixed(2)}</b>。直觉走了 100% 的路，而证据只配得上 {Math.round(r * 100)}%。
      </p>
      <Callout type="plain" title="代价：你将永远不会“预言”到奇迹">
        <p className="tfs-small" style={{ margin: 0 }}>
          无偏的预测意味着你很少预测极端结果，也就很少有“我早就知道他会成功”的快感。卡尼曼承认，在某些场合（风投寻找下一个谷歌），错过一个极端的代价大到值得接受偏差——但那应该是一个<strong>有意识的选择</strong>，而不是被直觉带着走。
        </p>
      </Callout>
    </Lab>
  );
}

function Part2Section() {
  return (
    <div className="tfs-content">
      <SectionHead
        kicker="第二部分 · 第10–18章"
        title="启发法与偏差"
        lead="为什么统计思维这么难？因为统计要求同时考虑好几件事——样本量、基础比率、证据的可靠性、回归——而系统1 一次只讲一个连贯的因果故事。"
        roots={["substitution", "prototype", "causal", "coherence"]}
      />
      <h2 className="tfs-h2">小数定律：我们对样本量毫无感觉</h2>
      <p>
        卡尼曼与特沃斯基合作的起点，是一次关于“人是不是好的直觉统计学家”的争论。他们的答案是：<strong>有条件的否定</strong>——即使是写过统计教材的专家，也会严重高估小样本研究被成功复制的概率。他们半开玩笑地称之为“小数定律”：人们相信大数定律对小数目也成立。
      </p>
      <CountyLab />
      <div className="tfs-grid2">
        <UrnMini />
        <SequenceQuiz />
      </div>
      <p>
        同样的逻辑解释了一笔昂贵的教育投资：研究者发现最成功的学校里小规模学校占比偏高，于是盖茨基金会等机构投入巨资推动“拆大为小”。但如果他们也看看<strong>最差</strong>的学校，会发现那里小学校同样偏多——小，只是意味着波动大。
      </p>
      <Callout type="warn" title="“热手”的反转：统计学家自己也会掉进小数定律">
        <p className="tfs-small" style={{ margin: 0 }}>
          书中说：对上千次投篮的分析显示，篮球里根本没有“手感正热”这回事。2018 年，经济学家 Miller 与 Sanjurjo 证明原研究的计算方法本身存在一个微妙的小样本偏差：在有限序列里“连中之后”的命中率<em>理应</em>略低于平均。纠正后，原始数据反而显示出一定的“热手”效应。这不否定“我们在随机中过度看到模式”这一大结论，却是一个漂亮的提醒：统计直觉很难，连纠正别人直觉的人也会出错。
        </p>
      </Callout>

      <h2 className="tfs-h2">锚定：任何数字都可能成为锚</h2>
      <AnchorLab />
      <p>
        卡尼曼和特沃斯基当年对锚定的机制有分歧，几十年后才发现两人都对：<span className="s2t">系统2 的锚定</span>是“从锚出发、调整、然后在不确定时过早停下”（从纸的下端往上画 2.5 英寸，和从上往下画，停在的位置不同）；<span className="s1t">系统1 的锚定</span>是一种启动——“甘地去世时是否超过 144 岁”，你当然不信，但“一位高寿老人”的形象已被激活，会选择性地调出与锚一致的证据。
      </p>
      <AnchorIndexChart />
      <Callout type="c3" title="怎样抵抗锚">
        <p>
          ① 假设谈判中任何公开出现的数字都在锚定你；② 对方报出离谱的价格时，不要用同样离谱的还价回应，而是明确表示“以这个数为基础无法谈”，甚至起身离开；③ 最有效的办法是主动“往反方向想”——把注意力放在对方的底线、以及锚为什么不合理的理由上，这能削弱甚至消除锚定效应。
        </p>
      </Callout>

      <h2 className="tfs-h2">可得性：想起来容易，就以为常见</h2>
      <DeathQuiz />
      <p>
        可得性最精妙的证据来自施瓦茨：让人列出 <b>6 件</b>自己果断行事的例子，或列出 <b>12 件</b>。列 12 件的人反而觉得自己<strong>更不果断</strong>——因为后几件越想越难，而“难想起”被解读为“不常发生”。可见，起作用的是<strong>提取的流畅感</strong>，而非提取到的内容。有趣的是，当人们被告知“背景音乐会让回忆变难”，这个效应就消失了——系统1 对“意外的困难”很敏感，一旦困难有了解释，就不再用它做推断。
      </p>
      <Callout type="insight" title="一个立刻有用的观察：人人都觉得自己贡献过半">
        <p>夫妻各自估计自己在家务中所占的比例，加起来超过 100%。原因很简单：你记得自己做的事比记得对方做的事容易得多。团队里每个人都觉得自己付出更多、没被看见——意识到这一点，本身就能缓和很多冲突。</p>
      </Callout>
      <p>
        当可得性与情绪、媒体结合，就会产生<b>可得性级联</b>（中译本译作“效用层叠”，是一个误译）：媒体报道 → 公众焦虑 → 更多报道 → 政策反应。卡尼曼介绍了两位朋友的对立观点：斯洛维克认为公众对风险的理解比专家更丰富（在意“怎么死”而不只是“死几个”），桑斯坦认为公众的恐慌扭曲了监管优先级。卡尼曼的立场是两人都对：<strong>恐惧本身就是真实的代价</strong>，政策应当减轻恐惧，但不应被恐惧牵着走。
      </p>

      <h2 className="tfs-h2">代表性与基础比率</h2>
      <p>
        汤姆是一名研究生：“智商很高但缺乏创造力，喜欢整洁有序，文章枯燥偶尔冒出老掉牙的双关语，待人冷淡、缺乏同情心。”他读哪个专业？几乎所有人都把计算机排在第一、人文与教育排在后面——包括 114 位学过多门统计课的心理学研究生。这段描述是故意为<strong>小专业</strong>量身定做的：像，但不大可能。
      </p>
      <BayesLab />
      <div className="tfs-grid2">
        <Callout type="s1" title="代表性的两宗罪">
          <p style={{ margin: 0 }}>
            ① 过度预测低基础比率事件（在纽约地铁上读《纽约时报》的人，更可能没有大学文凭，而不是博士）；② 对证据质量不敏感（明知描述不可靠，它照样占满了你的“眼前所见”）。
          </p>
        </Callout>
        <Callout type="c3" title="贝叶斯的两条纪律（不必会公式）">
          <p style={{ margin: 0 }}>
            ① 先把判断锚定在一个合理的基础比率上；② 质疑你对证据的诊断力。有意思的是，让被试<strong>皱眉</strong>（增加认知紧张）就能让哈佛学生更多地使用基础比率。
          </p>
        </Callout>
      </div>
      <p>
        第16章补上了关键一环：基础比率有两种。<b>统计型</b>（城里 85% 的出租车是绿色的）通常被忽略；<b>因果型</b>（85% 的肇事出租车是绿色的）会立刻被使用——因为它能编进故事：“绿车司机都是疯子”。数学上两题完全相同，人们的答案却截然不同。这也解释了刻板印象为何如此顽固：它们是被因果化了的基础比率。
      </p>
      <Callout type="insight" title="教育心理学的“坏消息”">
        <p>
          学生听完“多数人不会去救癫痫发作的陌生人”，再看两段普通人的采访视频，仍然预测“他们会去救”——统计结论没有改变任何具体判断。但如果直接告诉他们“视频里这两个人都没去”，他们立刻能推断出整体规律。<b>人们不愿从一般推出特殊，却乐于从特殊推出一般。</b>
        </p>
      </Callout>

      <h2 className="tfs-h2">琳达：少即是多</h2>
      <LindaLab />
      <p>
        奚恺元的餐具实验揭示了同一个结构：A 套 40 件（其中 9 件破损），B 套 24 件完好——A 包含了 B 的全部，还多出 7 件完好的。放在一起比，人们愿意为 A 多付钱；分开看时，B 的标价反而更高（33 美元对 23 美元）——系统1 评估的是“平均质量”，而不是“总价值”。概率就像价值，是一个<strong>需要加总的量</strong>，而系统1 只会取平均。
      </p>

      <h2 className="tfs-h2">回归平均值：比万有引力还晚被发现的规律</h2>
      <RegressionLab />
      <p>
        回归无处不在，却几乎总被编成因果故事：登上《体育画报》封面的运动员下个赛季表现变差（“封面诅咒”）；第一跳出色的滑雪选手第二跳失常（“压力太大”）；喝了某种饮料的抑郁儿童三个月后好转——就算抱着猫也会好转，因为极端群体本来就会回归。这正是对照组存在的意义。高尔顿花了很多年才弄明白：<strong>相关与回归不是两个概念，而是同一件事的两个视角</strong>——只要两个量的相关不完美，就一定会回归。
      </p>
      <Callout type="plain" title="一个会在饭桌上引发争论的句子">
        <p style={{ margin: 0 }}>
          “聪明的女性往往嫁给不如自己聪明的男性。”人们会立刻给出各种因果解释。但它在数学上等价于一句无聊的话：“夫妻智商的相关并不完美。”
        </p>
      </Callout>

      <h2 className="tfs-h2">修正直觉预测</h2>
      <PredictionCorrector />
      <p>
        这个方法最有价值的地方，是迫使你问：<strong>我到底知道多少？</strong>招聘时，金面试表现惊艳但几乎没有成果；简成果扎实但面试平平。直觉选金，因为“眼见即为事实”。但关于金的信息样本更小，而小样本更容易出现极端值——对她的预测理应回归得更多。
      </p>
      <Card flat title="饮水机旁可以这么说" tag="词汇">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>“样本太小了，别相信小数定律。”</li>
          <li>“这个行业的创业成功率基础比率很低，我们凭什么认为这家是例外？”</li>
          <li>“她说批评比表扬有用，其实她看到的是回归平均值。”</li>
          <li>“我们的直觉预测很振奋人心，但大概太极端了，往均值拉一拉。”</li>
        </ul>
      </Card>
    </div>
  );
}

/* ============================================================
   第三部分 · 过度自信
   ============================================================ */
function HindsightChart() {
  const data = [
    { label: "只知道事前信息", v: 24, color: "var(--s2)", note: "德卢斯市是否应花钱雇人全天监测桥下的碎石？只看决策当时的材料，24% 的学生认为应该。" },
    { label: "被告知后来发了洪水", v: 56, color: "var(--s1)", note: "即使被明确要求“不要让后见之明影响判断”，仍有 56% 的学生认为应该。" },
  ];
  return (
    <Card title="后见之明：同一个决策，知道结果后变成了“显然该做”" tag="数据">
      <HBarChart data={data} max={100} format={(v) => `${v}%`} labelWidth={170} />
      <p className="tfs-small" style={{ marginBottom: 0 }}>
        费斯科霍夫在尼克松 1972 年访华、访苏前让人预测各种结果的概率，事后再请他们回忆当初的预测：发生了的事，人们记得自己当初给的概率更高；没发生的，记得自己当初就不太信。<strong>我们无法重建“改变看法之前的自己”。</strong>
      </p>
    </Card>
  );
}

function CorrToWin() {
  const [wref, cw] = useWidth(560);
  const [r, setR] = useState(0.3);
  const p = 0.5 + Math.asin(r) / Math.PI;
  const W = Math.max(300, cw),
    L = 20,
    Rr = 20;
  const x = lin(0.5, 1, L, W - Rr);
  const marks = [
    { r: 0, t: "纯运气" },
    { r: 0.3, t: "CEO 素质 vs 公司业绩（估计上限）" },
    { r: 0.6, t: "SAT 与大学 GPA（约）" },
    { r: 1, t: "完全决定" },
  ];
  return (
    <Card title="把“相关系数”翻译成人话：强者胜出的概率" tag="工具">
      <p className="tfs-small">
        假设两家公司情况相近，其中一家的 CEO 更优秀。“更优秀的 CEO 领导着业绩更好的公司”的概率是多少？若 CEO 素质与业绩的相关为 r，这个概率 ≈ 50% + arcsin(r)/π。
      </p>
      <Slider label="相关系数 r" value={r} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} onChange={setR} />
      <div ref={wref}><svg className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} 88`} role="img" aria-label={`相关系数 ${r.toFixed(2)} 对应的胜率约 ${fmtPct(p)}`}>
        <rect x={L} y={30} width={W - L - Rr} height={14} rx="7" fill="var(--surface-2)" />
        <path d={hBarPath(L, 30, Math.max(8, x(p) - L), 14)} fill="var(--s2)" />
        {[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((v) => (
          <text key={v} x={x(v)} y={64} fontSize="11" textAnchor="middle" fill="var(--muted)">
            {Math.round(v * 100)}%
          </text>
        ))}
        <text x={clamp(x(p), 40, W - 40)} y={20} fontSize="13" textAnchor="middle" fill="var(--ink)" fontWeight="700">
          {fmtPct(p, 1)}
        </text>
      </svg></div>
      <div className="tfs-chips">
        {marks.map((m) => (
          <button key={m.r} className={cx("tfs-chip", Math.abs(r - m.r) < 0.005 && "on")} onClick={() => setR(m.r)}>
            r = {m.r}：{m.t}
          </button>
        ))}
      </div>
      <p className="tfs-p2" style={{ marginBottom: 0 }}>
        r = 0.3 只意味着 <b>60% 对 50%</b>——比抛硬币好 10 个百分点。这在商业上已经很有价值，却远远撑不起书店里那些“卓越企业的秘诀”。卡尼曼的建议是：如果你希望这个数字更高，把这种希望当作一个信号——你正在高估世界的可预测性。
      </p>
    </Card>
  );
}

function SkillLuckLab() {
  const [wref, cw] = useWidth(560);
  const [s, setS] = useState(0);
  const [seed, setSeed] = useState(4);
  const NA = 25,
    NY = 8;
  const sim = useMemo(() => {
    const g = makeRng(seed * 101 + 17);
    const skill = Array.from({ length: NA }, () => randn(g));
    const perf = Array.from({ length: NY }, () => skill.map((k) => Math.sqrt(s) * k + Math.sqrt(1 - s) * randn(g)));
    const rk = perf.map((yr) => ranks(yr));
    const cs = [];
    for (let a = 0; a < NY; a++) for (let b = a + 1; b < NY; b++) cs.push(pearson(rk[a], rk[b]));
    return { rk, avg: mean(cs) };
  }, [s, seed]);
  const W = Math.max(300, cw),
    H = 300,
    L = 40,
    Rr = 16,
    T = 12,
    B = 30;
  const x = lin(0, NY - 1, L, W - Rr),
    y = lin(1, NA, T, H - B);
  const hl = [
    { idx: sim.rk[0].indexOf(1), c: "var(--s1)", t: "第1年第 1 名" },
    { idx: sim.rk[0].indexOf(13), c: "var(--c3)", t: "第1年第 13 名" },
    { idx: sim.rk[0].indexOf(25), c: "var(--s2)", t: "第1年第 25 名" },
  ];
  return (
    <Lab title="25 位理财顾问，8 年排名：技能还是运气？" note="卡尼曼拿到一家财富管理公司 25 位顾问连续 8 年的业绩排名，计算了 28 对年份之间的相关，平均值是 0.01。你可以调节“技能占比”，看看真正的技能游戏长什么样。">
      <Slider label="业绩中技能所占比例" value={s} min={0} max={0.9} step={0.05} format={(v) => `${Math.round(v * 100)}%`} onChange={setS} />
      <div className="tfs-legend">
        {hl.map((h) => (
          <span key={h.t}>
            <i className="ln" style={{ background: h.c }} />
            {h.t}
          </span>
        ))}
        <span>
          <i className="ln" style={{ background: "var(--axis)" }} />
          其他顾问
        </span>
      </div>
      <div ref={wref}><svg className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`25 位顾问 8 年排名走势，年际平均相关 ${sim.avg.toFixed(2)}`}>
        {[1, 5, 10, 15, 20, 25].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - Rr} y1={y(v)} y2={y(v)} stroke="var(--grid)" />
            <text x={L - 8} y={y(v) + 4} fontSize="11" textAnchor="end" fill="var(--muted)">
              {v}
            </text>
          </g>
        ))}
        {Array.from({ length: NY }, (_, i) => (
          <text key={i} x={x(i)} y={H - 10} fontSize="11" textAnchor="middle" fill="var(--muted)">
            {W < 480 ? i + 1 : `第${i + 1}年`}
          </text>
        ))}
        {Array.from({ length: NA }, (_, a) => {
          if (hl.some((h) => h.idx === a)) return null;
          const d = sim.rk.map((yr, i) => `${i ? "L" : "M"}${x(i)},${y(yr[a])}`).join(" ");
          return <path key={a} d={d} fill="none" stroke="var(--axis)" strokeWidth="1" opacity="0.6" />;
        })}
        {hl.map((h) => {
          const d = sim.rk.map((yr, i) => `${i ? "L" : "M"}${x(i)},${y(yr[h.idx])}`).join(" ");
          return <path key={h.t} d={d} fill="none" stroke={h.c} strokeWidth="2.5" strokeLinejoin="round" />;
        })}
      </svg></div>
      <div className="tfs-row">
        <Stat v={sim.avg.toFixed(2)} l="模拟中排名的年际平均相关" />
        <Stat v="0.01" l="真实公司的数据" />
        <button className="tfs-btn sm" onClick={() => setSeed(seed + 1)}>
          重新模拟
        </button>
      </div>
      <Callout type="insight" title="他们听完之后，什么都没改变">
        <p>
          卡尼曼把结论告诉这家公司：你们的年终奖是在奖励运气。高管们平静地接受了，然后继续吃饭；送他去机场的主管有点防御地说：“我在这家公司做得非常好，这是谁也否认不了的。”<strong>技能错觉不只是个人的错觉，它深植于一个行业的文化与生计之中。</strong>个人投资者更糟：奥登分析了近 16.3 万笔交易，发现人们卖出的股票在之后一年平均比买入的股票多涨约 3.2 个百分点；交易越频繁，收益越差。
        </p>
      </Callout>
    </Lab>
  );
}

const DOMAINS = [
  { n: "国际象棋大师", x: 9.2, y: 9.2, d: "规则固定、局面重复、每一步都有反馈；上万小时的专注练习让大师“读”棋盘像读句子。" },
  { n: "麻醉师", x: 8.2, y: 8.8, d: "药物效果几乎立即显现，反馈快而清晰——“我感觉不对劲”值得全手术室重视。" },
  { n: "消防指挥官", x: 7.6, y: 7.8, d: "克莱因的研究对象：通过大量真实与模拟火场，形成“识别—启动”式决策。" },
  { n: "开车过弯刹车", x: 8.8, y: 9.6, d: "每个弯道都给你即时、明确的反馈，所以人人都能学会。" },
  { n: "扑克 / 桥牌", x: 6.4, y: 7.0, d: "有稳定的统计规律支撑技能，但单局噪音大。" },
  { n: "心理治疗师：当面反应", x: 6.4, y: 7.6, d: "能立刻看到病人对一句话的反应，这部分直觉可以练好。" },
  { n: "心理治疗师：长期疗效", x: 4.4, y: 1.8, d: "长期结果反馈稀少且滞后，经验教不会你哪种疗法更有效。" },
  { n: "放射科医生", x: 7.0, y: 3.0, d: "片子有规律，但很少知道自己的诊断后来对不对、漏诊了什么。" },
  { n: "港口引航员", x: 7.2, y: 3.6, d: "环境有规律，但操作与后果之间延迟很长，单凭经验很难学会。" },
  { n: "风险投资", x: 2.4, y: 2.0, d: "结果多年后才知道，且大量由运气与竞争决定。" },
  { n: "选股 / 基金经理", x: 1.4, y: 3.0, d: "高效市场中价格已包含公开信息，“技能”几乎没有持续性。" },
  { n: "政治与经济长期预测", x: 0.9, y: 1.4, d: "泰特罗克：284 位专家、约 8 万次预测，表现不如“给每种结果相同概率”。" },
];
function IntuitionMap() {
  const [wref, cw] = useWidth(520);
  const [sel, setSel] = useState(0);
  const [hov, setHov] = useState(null);
  const [mx, setMx] = useState(5);
  const [my, setMy] = useState(5);
  const W = Math.max(300, Math.min(cw, 620)),
    H = Math.round(Math.min(400, W * 0.85)),
    L = 50,
    Rr = 14,
    T = 14,
    B = 46;
  const x = lin(0, 10, L, W - Rr),
    y = lin(0, 10, H - B, T);
  const d = DOMAINS[sel];
  const verdict = mx >= 6.5 && my >= 6.5 ? ["可以谨慎信任直觉", "c3t"] : mx < 4 ? ["环境本身不可预测：别信自信", "badt"] : my < 5 ? ["环境有规律，但你学不到：先建立反馈", "s1t"] : ["灰色地带：用检查单和数据校准", "s1t"];
  return (
    <Card title="什么时候可以相信专家的直觉？" tag="交互图 · 第22章">
      <p className="tfs-small">
        卡尼曼与“直觉派”代表克莱因多年“对抗式合作”后的共识：直觉 = 识别。它可信的<strong>前提只有两个</strong>——横轴：环境足够有规律；纵轴：有机会通过长期练习和及时反馈学到这些规律。<b>专家的自信程度不在其中。</b>点击圆点查看说明。
      </p>
      <div ref={wref}><svg className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="二维图：横轴环境规律性，纵轴反馈与练习机会，标出各领域位置">
        <rect x={x(6.5)} y={y(10)} width={x(10) - x(6.5)} height={y(6.5) - y(10)} fill="var(--c3-soft)" />
        <text x={x(10) - 8} y={y(6.5) - 8} fontSize="12" textAnchor="end" fill="var(--c3-ink)" fontWeight="700">
          直觉可信区
        </text>
        {[0, 2, 4, 6, 8, 10].map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={T} y2={H - B} stroke="var(--grid)" />
            <line x1={L} x2={W - Rr} y1={y(v)} y2={y(v)} stroke="var(--grid)" />
          </g>
        ))}
        <text x={(L + W) / 2} y={H - 22} fontSize="12" textAnchor="middle" fill="var(--ink-2)">
          环境的规律性 →
        </text>
        <text x={(L + W) / 2} y={H - 6} fontSize="11" textAnchor="middle" fill="var(--muted)">
          {W < 480 ? "（示意位置）" : "（示意：位置为本导读依据书中论述所作的定性判断）"}
        </text>
        <text transform={`translate(16 ${(T + H - B) / 2}) rotate(-90)`} fontSize="12" textAnchor="middle" fill="var(--ink-2)">
          反馈质量与练习机会 →
        </text>
        {DOMAINS.map((p, i) => (
          <g key={p.n} onClick={() => setSel(i)} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: "pointer" }}>
            <circle cx={x(p.x)} cy={y(p.y)} r="14" fill="transparent" />
            <circle cx={x(p.x)} cy={y(p.y)} r={sel === i ? 7 : 5} fill={sel === i ? "var(--s1)" : "var(--s2)"} stroke="var(--surface)" strokeWidth="2" />
            {(sel === i || hov === i) && (
              <text x={clamp(x(p.x), 70, W - 70)} y={y(p.y) - 12} fontSize="12" textAnchor="middle" fill="var(--ink)" fontWeight="700" style={{ paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 4 }}>
                {p.n}
              </text>
            )}
          </g>
        ))}
        <g>
          <rect x={x(mx) - 7} y={y(my) - 7} width="14" height="14" rx="3" fill="var(--c3)" stroke="var(--surface)" strokeWidth="2" />
          <text x={clamp(x(mx), 40, W - 40)} y={y(my) + 24} fontSize="12" textAnchor="middle" fill="var(--c3-ink)" fontWeight="700">
            你的领域
          </text>
        </g>
      </svg></div>
      <div className="tfs-chips">
        {DOMAINS.map((p, i) => (
          <button key={p.n} className={cx("tfs-chip", sel === i && "on")} onClick={() => setSel(i)}>
            {p.n}
          </button>
        ))}
      </div>
      <Callout type="plain" title={d.n}>
        <p style={{ margin: 0 }}>{d.d}</p>
      </Callout>
      <div className="tfs-grid2">
        <Slider label="你的领域：环境有多规律？" value={mx} min={0} max={10} step={0.5} onChange={setMx} />
        <Slider label="你的领域：反馈有多快、多清楚？" value={my} min={0} max={10} step={0.5} onChange={setMy} />
      </div>
      <p>
        判断：<b className={verdict[1]}>{verdict[0]}</b>
      </p>
    </Card>
  );
}

function PlanningChart() {
  const [wref, cw] = useWidth(560);
  const pts = [
    { t: 1997.5, v: 40, lab: "1997.7 预算上限" },
    { t: 1999.45, v: 109 },
    { t: 2000.3, v: 195 },
    { t: 2001.85, v: 241 },
    { t: 2002.95, v: 294.6 },
    { t: 2003.45, v: 375.8 },
    { t: 2004.5, v: 431, lab: "2004 最终约" },
  ];
  const [hover, setHover] = useState(null);
  const W = Math.max(300, cw),
    H = 260,
    L = 50,
    Rr = 20,
    T = 16,
    B = 30;
  const x = lin(1997, 2005, L, W - Rr),
    y = lin(0, 460, H - B, T);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${x(p.t)},${y(p.v)}`).join(" ");
  return (
    <Card title="苏格兰议会大楼：预算从 4000 万一路涨到 4.31 亿英镑" tag="数据 · 第23章">
      <div ref={wref}><svg className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="苏格兰议会大楼预算从 1997 年的 4000 万英镑涨到 2004 年的约 4.31 亿英镑">
        {[0, 100, 200, 300, 400].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - Rr} y1={y(v)} y2={y(v)} stroke="var(--grid)" />
            <text x={L - 8} y={y(v) + 4} fontSize="11" textAnchor="end" fill="var(--muted)">
              {v}
            </text>
          </g>
        ))}
        {[1997, 1999, 2001, 2003, 2005].map((v) => (
          <text key={v} x={x(v)} y={H - 8} fontSize="11" textAnchor="middle" fill="var(--muted)">
            {v}
          </text>
        ))}
        <text x={L} y={T - 4} fontSize="11" fill="var(--ink-2)">
          百万英镑
        </text>
        <path d={d} fill="none" stroke="var(--s1)" strokeWidth="2" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <circle cx={x(p.t)} cy={y(p.v)} r="12" fill="transparent" />
            <circle cx={x(p.t)} cy={y(p.v)} r={hover === i ? 6 : 4.5} fill="var(--s1)" stroke="var(--surface)" strokeWidth="2" />
          </g>
        ))}
        <text x={x(1997.5) + 8} y={y(40) - 8} fontSize="12" fill="var(--ink)" fontWeight="600">
          4000 万
        </text>
        <text x={x(2004.5) - 8} y={y(431) - 10} fontSize="12" fill="var(--ink)" fontWeight="600" textAnchor="end">
          约 4.31 亿（×10.8）
        </text>
      </svg></div>
      <div className="tfs-readout">{hover !== null ? `${Math.floor(pts[hover].t)} 年：${pts[hover].v} 百万英镑` : " "}</div>
      <div className="tfs-grid3">
        <Stat v=">90%" l="1969–1998 年全球铁路项目高估了客流量" />
        <Stat v="+106% / +45%" l="客流平均被高估 / 成本平均超支" />
        <Stat v="× 2.1" l="美国人厨房改造：实际花费 38,769 美元，约为预算 18,658 美元的两倍" />
      </div>
    </Card>
  );
}

const CALIB = [
  { q: "甘地去世时的年龄（岁）", a: 78 },
  { q: "珠穆朗玛峰海拔（米）", a: 8849 },
  { q: "莫扎特出生年份", a: 1756 },
  { q: "尼罗河长度（公里，约）", a: 6650 },
  { q: "地球到月球的平均距离（万公里）", a: 38.4 },
  { q: "成年人体骨骼数量（块）", a: 206 },
  { q: "联合国会员国数量", a: 193 },
  { q: "光在真空中每秒传播的距离（万公里）", a: 29.98 },
];
function CalibrationQuiz() {
  const [v, setV] = useState({});
  const [done, setDone] = useState(false);
  const filled = CALIB.every((_, i) => v[i + "l"] !== undefined && v[i + "h"] !== undefined && v[i + "l"] !== "" && v[i + "h"] !== "");
  const hits = CALIB.filter((c, i) => Number(v[i + "l"]) <= c.a && c.a <= Number(v[i + "h"])).length;
  return (
    <Lab title="你的 80% 置信区间，真的有 80% 吗？" note="为每个问题给出一个下限和上限，使你有 80% 的把握真实值落在其中（既不要太宽，也不要太窄）。">
      <div className="tfs-tablewrap">
        <table className="tfs-table">
          <thead>
            <tr>
              <th>问题</th>
              <th>下限</th>
              <th>上限</th>
              {done && <th>真实值</th>}
            </tr>
          </thead>
          <tbody>
            {CALIB.map((c, i) => {
              const hit = Number(v[i + "l"]) <= c.a && c.a <= Number(v[i + "h"]);
              return (
                <tr key={i}>
                  <td>{c.q}</td>
                  {["l", "h"].map((k) => (
                    <td key={k}>
                      <input className="tfs-input" style={{ width: 92 }} inputMode="decimal" disabled={done} value={v[i + k] ?? ""} aria-label={`${c.q} ${k === "l" ? "下限" : "上限"}`} onChange={(e) => setV({ ...v, [i + k]: e.target.value.replace(/[^\d.\-]/g, "") })} />
                    </td>
                  ))}
                  {done && <td className={hit ? "c3t" : "badt"}>{c.a} {hit ? "✓" : "✗"}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!done ? (
        <button className="tfs-btn primary" disabled={!filled} onClick={() => setDone(true)}>
          揭晓
        </button>
      ) : (
        <div className="tfs-reveal">
          <div className="tfs-grid3">
            <Stat v={`${hits} / 8`} l="真实值落在你区间内的题数" />
            <Stat v="≈ 6.4 / 8" l="校准良好时的期望命中数（80%）" />
            <Stat v="33%" l="大公司 CFO 的 80% 区间实际命中率" />
          </div>
          <Callout type="insight" title="区间太窄，是“眼见即为事实”的签名">
            <p>
              杜克大学收集了 11600 份 CFO 对下一年标普指数的预测：相关性接近零，而他们的 80% 置信区间实际只包住了约三分之一的结果。要达到 80%，他们每年都该说“明年回报在 −10% 到 +30% 之间”——这个诚实的回答会被同事嘲笑。<strong>社会奖励自信而不是校准</strong>，这正是过度自信长盛不衰的原因。
            </p>
          </Callout>
        </div>
      )}
    </Lab>
  );
}

function ApgarMini() {
  const items = [
    ["心率", ["无", "< 100", "≥ 100"]],
    ["呼吸", ["无", "微弱、不规则", "良好、啼哭"]],
    ["反射", ["无反应", "皱眉", "咳嗽、打喷嚏、哭"]],
    ["肌张力", ["松软", "四肢略屈", "活动有力"]],
    ["肤色", ["青紫或苍白", "躯干粉、四肢紫", "全身粉红"]],
  ];
  const [sc, setSc] = useState([2, 2, 1, 2, 1]);
  const total = sc.reduce((a, b) => a + b, 0);
  return (
    <Card title="阿普加评分：一张清单救了无数新生儿" tag="公式胜过直觉 · 第21章">
      <p className="tfs-small">
        1953 年，麻醉师弗吉尼亚·阿普加被住院医生问到“怎样系统评估新生儿”，当场写下 5 个指标、每项 0–2 分。之前，医生各凭经验、各看各的指标，危险信号常被漏掉。
      </p>
      {items.map(([name, opts], i) => (
        <div key={name} className="tfs-row" style={{ margin: "6px 0" }}>
          <span style={{ width: 64 }}>{name}</span>
          {opts.map((o, k) => (
            <button key={k} className={cx("tfs-btn sm", sc[i] === k && "primary")} onClick={() => setSc(sc.map((s, j) => (j === i ? k : s)))}>
              {k}：{o}
            </button>
          ))}
        </div>
      ))}
      <p style={{ marginTop: 10, marginBottom: 0 }}>
        总分 <b className="tfs-mono">{total}</b> / 10 ——{" "}
        {total >= 8 ? <span className="c3t">状况良好</span> : total >= 4 ? <span className="s1t">需要密切观察</span> : <span className="badt">需要立即救治</span>}
        <span className="tfs-small">（分档依书中描述：8 分以上良好，低于 4 分需立即处理）</span>
      </p>
    </Card>
  );
}

function Part3Section() {
  return (
    <div className="tfs-content">
      <SectionHead
        kicker="第三部分 · 第19–24章"
        title="过度自信"
        lead="我们对自己以为知道的东西深信不疑，却看不见自己的无知有多大，也低估了世界的不确定性。这一部分受塔勒布《黑天鹅》的影响最深。"
        roots={["coherence", "causal", "lazy"]}
      />
      <h2 className="tfs-h2">“知道”的错觉：叙事谬误与后见之明</h2>
      <p>
        两位斯坦福研究生想出了更好的搜索方法，创立谷歌，一连串正确决策，终成巨头——这个故事让你觉得学到了“成功的秘诀”。可它删去了运气，删去了无数<strong>没有发生</strong>的事（据说谷歌早期曾想以不到 100 万美元出售而被嫌贵），也删去了同样聪明却失败的公司。塔勒布称之为<b>叙事谬误</b>。
      </p>
      <p>
        卡尼曼特别反对一个词：“很多人在 2008 年之前就<em>知道</em>危机不可避免。”他们只是<em>认为</em>可能发生；只因为它真的发生了，这个想法才被追认为“知道”。“知道”这个词让世界显得比实际更可知——而<strong>以为理解了过去，就会以为能预测未来</strong>。
      </p>
      <HindsightChart />
      <Callout type="insight" title="结果偏差：好决策可能被惩罚，鲁莽可能被奖励">
        <p>
          后见之明让我们按结果而非过程评价决策者。医生、顾问、CEO、外交官都因此变得官僚和保守（多做检查、少担风险），而几位走运的冒险者则被加冕为“有远见的英雄”。“墙上的字迹”是用隐形墨水写的，只在事后才显形。
        </p>
      </Callout>
      <CorrToWin />
      <p>
        罗森茨威格在《光环效应》中指出，商业畅销书的“卓越企业”在研究结束后，与对照公司的差距很快缩小到几乎为零；《财富》杂志“最受尊敬公司”里排名最差的一批，二十年间股票回报反而更高。你可以编出“成功者自满、落后者发奋”的因果故事——但更简单的解释是：<strong>回归平均值</strong>。
      </p>

      <h2 className="tfs-h2">有效性错觉与技能错觉</h2>
      <p>
        年轻的卡尼曼在以色列军队里评估军官候选人：八个人要合力把一根原木翻过六英尺高的墙。他们对每个人的领导力印象“像天空的颜色一样清晰”，给出的预测也毫不犹豫。反馈却显示：这些预测几乎没有用。然后第二天，新一批士兵来了，他们的信心丝毫未减。卡尼曼把这命名为自己发现的第一个认知错觉——<b>有效性错觉</b>：明知整体上预测无效，仍对每个具体预测充满信心。
      </p>
      <SkillLuckLab />
      <Callout type="plain" title="刺猬与狐狸">
        <p className="tfs-small" style={{ margin: 0 }}>
          泰特罗克发现，专家在自己领域的预测并不比在陌生领域好多少；知识越多的人反而越自信、越不准；越上电视的专家越自信。<b>刺猬</b>知道“一件大事”，用一套理论解释一切，很少承认错误；<b>狐狸</b>承认世界由许多因素和运气交织而成，表现虽然也差，却是最好的。（泰特罗克后来在《超预测》中发现，经过训练的少数人在短期预测上可以显著好于平均——这与卡尼曼“短期可以预测、长期不行”的说法并不矛盾。）
        </p>
      </Callout>

      <h2 className="tfs-h2">直觉 vs 公式</h2>
      <p>
        1954 年，保罗·米尔回顾了 20 项研究：受过训练的咨询师面谈 45 分钟，参考高中成绩、能力测试和个人陈述，预测新生的成绩；一个只用高中成绩和一项测试分数的简单公式，胜过了 14 位咨询师中的 11 位。此后约 200 项对比研究里，约 60% 公式明显更准，其余打平，而公式更便宜。原因有二：专家试图“聪明”，考虑复杂组合，反而降低了效度；人对同一材料的判断前后不一致（放射科医生两次看同一张片子，约 20% 的情况下结论不同）。
      </p>
      <p>
        罗宾·道斯更进一步：<strong>等权重</strong>的简单加总往往和精心拟合的回归模型一样好，甚至更稳。他举的例子是预测婚姻稳定性：做爱的频率减去争吵的频率——你不会希望结果是负数。
      </p>
      <ApgarMini />
      <Callout type="c3" title="“闭上眼睛”：卡尼曼 21 岁时设计的面试法，用了几十年">
        <p>
          他为以色列国防军重新设计面试：选出约 6 个与作战表现相关、彼此独立的特质（责任心、社交能力、“男子气概”等），每个特质用关于<strong>过去事实</strong>的问题打分（1–5 分），逐项打完再进行下一项，以隔绝光环效应。面试官抗议“你把我们变成了机器人”，于是他加了一步：做完之后，闭上眼睛，想象这个人当兵的样子，给一个整体分。结果：新方法远胜旧方法，而且<strong>在结构化收集信息之后</strong>，“闭眼直觉”也同样有效。教训是：不要简单相信直觉，也不要完全抛弃它。（工具箱里有这个打分表。）
        </p>
      </Callout>

      <h2 className="tfs-h2">什么时候可以相信专家？</h2>
      <p>
        直觉并不神秘。赫伯特·西蒙说：“情境提供线索，线索让专家调出记忆中的信息，信息给出答案。直觉不过是识别。”两岁孩子看到狗喊“狗狗”，和象棋大师一眼看出“白方三步杀”，是同一种能力。问题只在于：这种“识别”是在真实的规律上练出来的，还是在噪音上练出来的错觉。
      </p>
      <IntuitionMap />
      <Callout type="warn" title="最重要的一条共识">
        <p style={{ margin: 0 }}>
          <b>主观信心不是准确性的指标。</b>信心来自故事的连贯与流畅，而一个判断即使回答错了问题（替代），也可以非常流畅。所以当有人说“相信我的判断”时——不要相信他，也不要相信你自己；去看环境和反馈。
        </p>
      </Callout>

      <h2 className="tfs-h2">规划谬误与外部视角</h2>
      <p>
        卡尼曼组织一群专家为以色列高中编写决策课程教材。一年后，他让每人私下写下完稿所需时间：估计集中在两年左右。他又问课程专家希莫：你见过的类似团队，最后用了多久？希莫沉默良久，脸红了：大约 40% 从未完成，完成的没有一个少于 7 年，而我们团队的水平“略低于平均”。然后——他们假装什么都没发生，继续干。<b>这本书最终用了 8 年才完成，而那时教育部已经不想用它了。</b>
      </p>
      <PlanningChart />
      <div className="tfs-grid2">
        <Callout type="s1" title="内部视角（默认）">
          <p style={{ margin: 0 }}>盯着自己的计划、已完成的进度和具体情况往外推；看不到“未知的未知”——离婚、生病、审批……每一件单独都不太可能，但“总会出点什么事”的概率很高。</p>
        </Callout>
        <Callout type="c3" title="外部视角：参照类预测三步">
          <p style={{ margin: 0 }}>
            ① 找到合适的参照类（类似的项目）；② 拿到这一类的统计分布，作为基准预测；③ 只有在有具体理由时，才根据本案信息调整。
          </p>
        </Callout>
      </div>

      <h2 className="tfs-h2">乐观：资本主义的引擎，也是它的税</h2>
      <p>
        美国小企业五年存活率约 35%，但创业者估计“像你这样的企业”成功率约 60%；81% 认为自己的成功率在 70% 以上，三分之一认为失败概率为零。在加拿大发明家援助计划中，收到“注定失败”评级的发明者约一半仍然坚持，平均损失翻倍。乐观来自认知而不只是情绪：只关注目标与计划（规划谬误），只关注自己能做什么（<b>竞争忽视</b>：“为什么这么多大片挤在同一个周末上映？因为每家都只想着自己的片子好不好”），把结果归于技能而非运气（控制错觉）。
      </p>
      <CalibrationQuiz />
      <Callout type="c3" title="事前验尸（premortem）：克莱因的方法，卡尼曼认为最有效">
        <p>
          在一个重要决策即将拍板、尚未正式下达时，召集知情者说：“<strong>想象一年后我们执行了这个计划，结果是一场灾难。请用 5–10 分钟写下这场灾难的历史。</strong>”它的妙处在于：把怀疑从“不忠诚”变成了“完成任务”，并把最了解情况的人的想象力引向最需要的方向。（工具箱里有模板。）
        </p>
      </Callout>
      <Card flat title="饮水机旁可以这么说" tag="词汇">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>“这个错误现在看很明显，但那是后见之明，你事前无法知道。”</li>
          <li>“问题不在于这些专家是否训练有素，而在于他们的世界是否可预测。”</li>
          <li>“她对自己的决定很有信心，但主观自信不是准确性的指标。”</li>
          <li>“他在用内部视角。先别管我们的情况，看看同类项目都怎样了？”</li>
          <li>“我们开个事前验尸会吧，也许有人能想到被我们忽略的威胁。”</li>
        </ul>
      </Card>
    </div>
  );
}

/* ============================================================
   第四部分 · 选择与风险（上）
   ============================================================ */
function JackJill() {
  const [wref, cw] = useWidth(560);
  const [mode, setMode] = useState("pt");
  const W = Math.max(300, cw),
    L = 70,
    Rr = 30;
  const x = lin(0, 10, L, W - Rr);
  const rows = [
    { who: "杰克", from: 1, to: 5, mood: "欣喜若狂", c: "var(--s2)" },
    { who: "吉尔", from: 9, to: 5, mood: "沮丧不已", c: "var(--bad)" },
  ];
  return (
    <Card title="杰克和吉尔今天都有 500 万" tag="思想实验 · 第25章">
      <div className="tfs-row" style={{ marginBottom: 6 }}>
        <button className={cx("tfs-btn sm", mode === "b" && "primary")} onClick={() => setMode("b")}>
          伯努利：只看财富状态
        </button>
        <button className={cx("tfs-btn sm", mode === "pt" && "primary")} onClick={() => setMode("pt")}>
          前景理论：看相对参照点的变化
        </button>
      </div>
      <div ref={wref}><svg className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} 150`} role="img" aria-label="杰克从 100 万涨到 500 万，吉尔从 900 万跌到 500 万">
        {[0, 2, 4, 6, 8, 10].map((v) => (
          <text key={v} x={x(v)} y={142} fontSize="11" textAnchor="middle" fill="var(--muted)">
            {v * 100}万
          </text>
        ))}
        {rows.map((r, i) => {
          const yy = 36 + i * 52;
          return (
            <g key={r.who}>
              <text x={L - 12} y={yy + 5} fontSize="14" textAnchor="end" fill="var(--ink)" fontWeight="700">
                {r.who}
              </text>
              <line x1={x(0)} x2={x(10)} y1={yy} y2={yy} stroke="var(--grid)" strokeWidth="1" />
              {mode === "pt" && <line x1={x(r.from)} x2={x(r.to) + (r.to > r.from ? -14 : 14)} y1={yy} y2={yy} stroke={r.c} strokeWidth="3" />}
              {mode === "pt" && (
                <polygon
                  points={r.to > r.from ? `${x(r.to) - 16},${yy - 6} ${x(r.to) - 8},${yy} ${x(r.to) - 16},${yy + 6}` : `${x(r.to) + 16},${yy - 6} ${x(r.to) + 8},${yy} ${x(r.to) + 16},${yy + 6}`}
                  fill={r.c}
                />
              )}
              {mode === "pt" && <circle cx={x(r.from)} cy={yy} r="5" fill="var(--surface)" stroke={r.c} strokeWidth="2" />}
              <circle cx={x(r.to)} cy={yy} r="7" fill={mode === "pt" ? r.c : "var(--ink)"} stroke="var(--surface)" strokeWidth="2" />
              <text x={x(r.to)} y={yy - 12} fontSize="12" textAnchor="middle" fill="var(--ink-2)">
                {mode === "pt" ? r.mood : "效用相同？"}
              </text>
            </g>
          );
        })}
      </svg></div>
      <p className="tfs-p2" style={{ marginBottom: 0 }}>
        {mode === "b"
          ? "在伯努利的理论里，效用只取决于财富状态，所以两人一样快乐。这显然是错的。"
          : "快乐来自相对参照点的变化。安东尼（100 万）和贝蒂（400 万）面对“稳拿 200 万”时也一样：对安东尼是财富翻倍，对贝蒂是损失一半——所以安东尼会规避风险，贝蒂更可能赌一把。"}
      </p>
    </Card>
  );
}

function ValueFunctionLab() {
  const [wref, cw] = useWidth(540);
  const [alpha, setAlpha] = useState(0.88);
  const [lambda, setLambda] = useState(2.25);
  const [hx, setHx] = useState(null);
  const [bet, setBet] = useState(200);
  const [locked, setLocked] = useState(false);
  const svgRef = useRef(null);
  const W = Math.max(300, Math.min(cw, 640)),
    H = Math.round(Math.min(380, W * 0.78)),
    L = 48,
    Rr = 16,
    T = 16,
    B = 34;
  const norm = vFun(1000, alpha, 1);
  const f = (xx) => vFun(xx, alpha, lambda) / norm;
  const ymin = -Math.max(2.3, lambda) * 1.05;
  const x = lin(-1000, 1000, L, W - Rr),
    y = lin(ymin, 1.2, H - B, T);
  const path = [];
  for (let i = -1000; i <= 1000; i += 10) path.push(`${i === -1000 ? "M" : "L"}${x(i).toFixed(1)},${y(f(i)).toFixed(1)}`);
  const onMove = (e) => {
    const vx = svgX(e, svgRef.current, W);
    const xv = clamp(Math.round(((vx - L) / (W - Rr - L)) * 2000 - 1000), -1000, 1000);
    setHx(xv);
  };
  const lamYou = bet / 100;
  const S = W,
    sl = lin(1, 5, 30, S - 20);
  return (
    <Lab title="前景理论的“旗帜”：价值函数" note="横轴是相对参照点的得失（元），纵轴是心理价值（以“赢 1000 元”的价值为 1）。拖动滑块，把鼠标移到图上读数。">
      <div className="tfs-grid2">
        <Slider label="敏感度递减 α（越小越弯）" value={alpha} min={0.4} max={1} step={0.01} format={(v) => v.toFixed(2)} onChange={setAlpha} />
        <Slider label="损失厌恶系数 λ" value={lambda} min={1} max={3.5} step={0.05} format={(v) => v.toFixed(2)} onChange={setLambda} />
      </div>
      <div className="tfs-legend">
        <span>
          <i className="ln" style={{ background: "var(--s1)" }} />
          前景理论价值函数
        </span>
        <span>
          <i className="ln" style={{ background: "var(--axis)" }} />
          “理性”的线性价值
        </span>
      </div>
      <div ref={wref}><svg ref={svgRef} className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="S 形价值函数：收益段凹、损失段凸且更陡" onMouseMove={onMove} onMouseLeave={() => setHx(null)} onTouchMove={onMove}>
        {[-1000, -500, 0, 500, 1000].map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={T} y2={H - B} stroke="var(--grid)" />
            <text x={x(v)} y={H - B + 16} fontSize="11" textAnchor="middle" fill="var(--muted)">
              {v > 0 ? `+${v}` : v}
            </text>
          </g>
        ))}
        {[-3, -2, -1, 0, 1].filter((v) => v >= ymin).map((v) => (
          <g key={v}>
            <line x1={L} x2={W - Rr} y1={y(v)} y2={y(v)} stroke="var(--grid)" />
            <text x={L - 8} y={y(v) + 4} fontSize="11" textAnchor="end" fill="var(--muted)">
              {v}
            </text>
          </g>
        ))}
        <line x1={x(0)} x2={x(0)} y1={T} y2={H - B} stroke="var(--axis)" strokeWidth="1.5" />
        <line x1={L} x2={W - Rr} y1={y(0)} y2={y(0)} stroke="var(--axis)" strokeWidth="1.5" />
        <line x1={x(-1000)} y1={y(-1)} x2={x(1000)} y2={y(1)} stroke="var(--axis)" strokeWidth="1.5" />
        <path d={path.join(" ")} fill="none" stroke="var(--s1)" strokeWidth="2.5" strokeLinejoin="round" />
        <text x={x(1000)} y={y(0.22)} fontSize="12" fill="var(--ink-2)" textAnchor="end">
          收益：凹 → 规避风险
        </text>
        <text x={x(-450)} y={y(-1.95)} fontSize="12" fill="var(--ink-2)">
          损失：更陡、凸 → 寻求风险
        </text>
        <text x={x(0) + 6} y={T + 12} fontSize="11" fill="var(--muted)">
          参照点
        </text>
        {hx !== null && (
          <g>
            <line x1={x(hx)} x2={x(hx)} y1={T} y2={H - B} stroke="var(--ink-2)" strokeWidth="1" />
            <circle cx={x(hx)} cy={y(f(hx))} r="5" fill="var(--s1)" stroke="var(--surface)" strokeWidth="2" />
          </g>
        )}
      </svg></div>
      <div className="tfs-readout">
        {hx !== null
          ? `${hx >= 0 ? "得到" : "失去"} ${Math.abs(hx)} 元 → 心理价值 ${f(hx).toFixed(2)}（线性价值为 ${(hx / 1000).toFixed(2)}）`
          : `失去 100 元的痛 ÷ 得到 100 元的乐 = ${lambda.toFixed(2)} 倍`}
      </div>
      <div className="tfs-grid3" style={{ marginTop: 8 }}>
        <Card flat title="① 参照依赖">
          <p className="tfs-small" style={{ margin: 0 }}>价值附着在得失上，而非最终财富。参照点通常是现状，也可以是期望、目标或“应得的”。</p>
        </Card>
        <Card flat title="② 敏感度递减">
          <p className="tfs-small" style={{ margin: 0 }}>100→200 元的差别，远比 900→1000 元明显，得失两边都如此。</p>
        </Card>
        <Card flat title="③ 损失厌恶">
          <p className="tfs-small" style={{ margin: 0 }}>曲线在参照点处突然变陡。进化解释：把威胁看得比机会更紧急的生物更可能存活。</p>
        </Card>
      </div>
      <h3 className="tfs-h3">测一测你自己的 λ</h3>
      <p>抛一枚硬币：反面你输 100 元，正面你赢 X 元。X 至少是多少，你才愿意赌？（忽略面子，只问自己的感受。）</p>
      <Slider label="正面赢" value={bet} min={100} max={500} step={10} format={(v) => `${v} 元`} onChange={(v) => { setBet(v); setLocked(false); }} />
      <button className="tfs-btn primary sm" onClick={() => setLocked(true)}>
        这就是我的最低要求
      </button>
      {locked && (
        <div className="tfs-reveal">
          <svg className="tfs-chart" viewBox={`0 0 ${S} 96`} role="img" aria-label={`你的损失厌恶系数约 ${lamYou.toFixed(1)}，元分析均值 1.96`}>
            <line x1={sl(1)} x2={sl(5)} y1={40} y2={40} stroke="var(--axis)" strokeWidth="1.5" />
            {[1, 2, 3, 4, 5].map((v) => (
              <g key={v}>
                <line x1={sl(v)} x2={sl(v)} y1={35} y2={45} stroke="var(--axis)" />
                <text x={sl(v)} y={90} fontSize="11" textAnchor="middle" fill="var(--muted)">
                  {v}
                </text>
              </g>
            ))}
            <rect x={sl(1.82)} y={32} width={sl(2.1) - sl(1.82)} height={16} rx="4" fill="var(--c3-soft)" stroke="var(--c3)" />
            <text x={sl(2.1) + 8} y={68} fontSize="11" fill="var(--c3-ink)" fontWeight="600">
              ↑ 研究均值 1.96（1.82–2.10）
            </text>
            <circle cx={sl(clamp(lamYou, 1, 5))} cy={40} r="7" fill="var(--s1)" stroke="var(--surface)" strokeWidth="2" />
            <text x={clamp(sl(clamp(lamYou, 1, 5)), 40, S - 40)} y={16} fontSize="12" textAnchor="middle" fill="var(--ink)" fontWeight="700">
              你 ≈ {lamYou.toFixed(1)}
            </text>
          </svg>
          <p className="tfs-p2">
            卡尼曼说大多数人的答案在 200 元左右，实验估计的损失厌恶系数通常在 1.5–2.5 之间。2024 年一项汇总 150 篇文献、607 个估计值的元分析给出均值 <b>1.96</b>（95% 可信区间 1.82–2.10）。专业交易者的损失厌恶明显更低——他们不会对每一次波动产生情绪反应。
          </p>
        </div>
      )}
    </Lab>
  );
}

function ChoiceFour() {
  const Q = [
    { id: 1, t: "问题 1", a: "稳拿 900 元", b: "90% 的概率拿 1000 元", maj: "a" },
    { id: 2, t: "问题 2", a: "稳输 900 元", b: "90% 的概率输 1000 元", maj: "b" },
    { id: 3, t: "问题 3：先白送你 1000 元，然后选", a: "稳拿 500 元", b: "50% 的概率再拿 1000 元", maj: "a" },
    { id: 4, t: "问题 4：先白送你 2000 元，然后选", a: "稳输 500 元", b: "50% 的概率输 1000 元", maj: "b" },
  ];
  const [p, setP] = useState({});
  const done = Q.every((q) => p[q.id]);
  return (
    <Lab title="四个选择，一个悖论">
      <div className="tfs-grid2">
        {Q.map((q) => (
          <Card key={q.id} flat title={q.t}>
            {["a", "b"].map((k) => (
              <button key={k} className={cx("tfs-opt", p[q.id] === k && "sel")} onClick={() => !done && setP({ ...p, [q.id]: k })}>
                {q[k]}
              </button>
            ))}
            {done && <p className="tfs-small" style={{ margin: 0 }}>多数人选：{q[q.maj]}{p[q.id] === q.maj ? "（和你一样）" : "（和你不同）"}</p>}
          </Card>
        ))}
      </div>
      {done && (
        <div className="tfs-reveal">
          <Callout type="insight" title="问题 1 与 2：同一个人，收益时规避风险，损失时寻求风险">
            <p>
              稳拿 900 的价值大于“90% 拿 1000”（敏感度递减 + 确定性效应）；稳输 900 的痛苦也大于“90% 输 1000”。<b>面对损失时的冒险</b>是卡尼曼和特沃斯基最早的关键发现之一。
            </p>
          </Callout>
          <Callout type="warn" title="问题 3 与 4：从最终财富看，它们一模一样">
            <p>
              两题的选项都是：“稳拿 1500 元” vs “50% 拿 1000 元、50% 拿 2000 元”。如果效用只取决于财富状态（伯努利），两题应得到相同的选择。但多数人在 3 中选稳妥、在 4 中选赌——因为白送的钱被计入了参照点，一个被看成“赢”，另一个被看成“输”。{p[3] !== p[4] ? "你也做出了不一致的选择。" : "你保持了一致，这并不常见。"}
            </p>
          </Callout>
        </div>
      )}
    </Lab>
  );
}

function WeightingLab() {
  const [wref, cw] = useWidth(520);
  const [g, setG] = useState(0.61);
  const [hp, setHp] = useState(null);
  const svgRef = useRef(null);
  const table = [
    [0.01, 5.5],
    [0.02, 8.1],
    [0.05, 13.2],
    [0.1, 18.6],
    [0.2, 26.1],
    [0.5, 42.1],
    [0.8, 60.1],
    [0.9, 71.2],
    [0.95, 79.3],
    [0.98, 87.1],
    [0.99, 91.2],
  ];
  const W = Math.max(300, Math.min(cw, 620)),
    H = Math.round(Math.min(360, W * 0.75)),
    L = 46,
    Rr = 16,
    T = 14,
    B = 34;
  const x = lin(0, 1, L, W - Rr),
    y = lin(0, 1, H - B, T);
  const path = [];
  for (let i = 0; i <= 200; i++) {
    const p = i / 200;
    path.push(`${i ? "L" : "M"}${x(p).toFixed(1)},${y(wProb(p, g)).toFixed(1)}`);
  }
  const steps = [
    [0, 0.05, "0 → 5%"],
    [0.05, 0.1, "5% → 10%"],
    [0.6, 0.65, "60% → 65%"],
    [0.95, 1, "95% → 100%"],
  ].map(([a, b, t]) => ({ label: t, v: Math.round((wProb(b, g) - wProb(a, g)) * 1000) / 10 }));
  const onMove = (e) => setHp(clamp(Math.round(((svgX(e, svgRef.current, W) - L) / (W - Rr - L)) * 100), 0, 100) / 100);
  return (
    <Lab title="决策权重：你心里的“概率”不是概率" note="橙线是决策权重函数，蓝点是书中第29章列出的实测数据（收益情形），灰线是“权重=概率”的理性标准。">
      <Slider label="曲率 γ（1 = 完全理性）" value={g} min={0.3} max={1} step={0.01} format={(v) => v.toFixed(2)} onChange={setG} />
      <div className="tfs-legend">
        <span>
          <i className="ln" style={{ background: "var(--s1)" }} />
          决策权重函数
        </span>
        <span>
          <i style={{ background: "var(--s2)", borderRadius: "50%" }} />
          书中数据
        </span>
        <span>
          <i className="ln" style={{ background: "var(--axis)" }} />
          权重 = 概率
        </span>
      </div>
      <div ref={wref}><svg ref={svgRef} className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="倒 S 形决策权重曲线：小概率被高估，大概率被低估" onMouseMove={onMove} onMouseLeave={() => setHp(null)} onTouchMove={onMove}>
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={T} y2={H - B} stroke="var(--grid)" />
            <line x1={L} x2={W - Rr} y1={y(v)} y2={y(v)} stroke="var(--grid)" />
            <text x={x(v)} y={H - B + 16} fontSize="11" textAnchor="middle" fill="var(--muted)">
              {Math.round(v * 100)}%
            </text>
            <text x={L - 8} y={y(v) + 4} fontSize="11" textAnchor="end" fill="var(--muted)">
              {Math.round(v * 100)}
            </text>
          </g>
        ))}
        <text x={(L + W) / 2} y={H - 4} fontSize="12" textAnchor="middle" fill="var(--ink-2)">
          客观概率
        </text>
        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke="var(--axis)" strokeWidth="1.5" />
        <path d={path.join(" ")} fill="none" stroke="var(--s1)" strokeWidth="2.5" />
        {table.map(([p, w]) => (
          <circle key={p} cx={x(p)} cy={y(w / 100)} r="4.5" fill="var(--s2)" stroke="var(--surface)" strokeWidth="2" />
        ))}
        <text x={x(0.03)} y={y(0.62)} fontSize="12" fill="var(--ink-2)">
          {W < 520 ? "小概率被高估" : "可能性效应：小概率被高估"}
        </text>
        <text x={x(0.97)} y={y(0.2)} fontSize="12" fill="var(--ink-2)" textAnchor="end">
          {W < 520 ? "“几乎确定”被打折" : "确定性效应：“几乎确定”被打折（曲线在对角线之下）"}
        </text>
        {hp !== null && (
          <g>
            <line x1={x(hp)} x2={x(hp)} y1={T} y2={H - B} stroke="var(--ink-2)" strokeWidth="1" />
            <circle cx={x(hp)} cy={y(wProb(hp, g))} r="5" fill="var(--s1)" stroke="var(--surface)" strokeWidth="2" />
          </g>
        )}
      </svg></div>
      <div className="tfs-readout">{hp !== null ? `概率 ${Math.round(hp * 100)}% → 决策权重 ${(wProb(hp, g) * 100).toFixed(1)}` : " "}</div>
      <p style={{ marginTop: 10 }}>同样是提高 5 个百分点，心理分量却大不相同（理性标准：每一步都是 5）：</p>
      <HBarChart data={steps} max={Math.max(25, ...steps.map((s) => s.v)) * 1.1} format={(v) => v.toFixed(1)} labelWidth={120} color="var(--s1)" />
    </Lab>
  );
}

function AllaisLab() {
  const [a, setA] = useState(null);
  const [b, setB] = useState(null);
  const paradox = a === "L" && b === "R";
  return (
    <Lab title="阿莱斯悖论：1952 年，一屋子经济学大师中招">
      <div className="tfs-grid2">
        <Card flat title="问题 A">
          <button className={cx("tfs-opt", a === "L" && "sel")} onClick={() => setA("L")}>
            61% 的概率赢 52 万美元
          </button>
          <button className={cx("tfs-opt", a === "R" && "sel")} onClick={() => setA("R")}>
            63% 的概率赢 50 万美元
          </button>
        </Card>
        <Card flat title="问题 B">
          <button className={cx("tfs-opt", b === "L" && "sel")} onClick={() => setB("L")}>
            98% 的概率赢 52 万美元
          </button>
          <button className={cx("tfs-opt", b === "R" && "sel")} onClick={() => setB("R")}>
            100% 赢 50 万美元
          </button>
        </Card>
      </div>
      {a && b && (
        <div className="tfs-reveal">
          <Callout type={paradox ? "warn" : "insight"} title={paradox ? "你和萨缪尔森、阿罗、弗里德曼们做了一样的选择" : "你避开了最常见的模式"}>
            <p>
              把它想成从装 100 颗弹珠的罐子里摸奖。问题 B 只是在问题 A 两个罐子的基础上，各把 37 颗白球换成了红球（中奖球）。左边罐子每颗红球值 52 万、右边每颗值 50 万——左边的改进更大。如果你在 A 中偏好左边，在 B 中更应该偏好左边。但大多数人在 A 选左、在 B 选右：<b>98% 到 100% 的 2 个百分点，心理分量远大于 61% 到 63% 的 2 个百分点</b>——确定性效应。阿莱斯拿这个问题当场“抓住”了一群顶尖决策理论家，他们事后才发现自己违反了期望效用理论。
            </p>
          </Callout>
        </div>
      )}
    </Lab>
  );
}

function FourfoldGrid() {
  const [sel, setSel] = useState("hl");
  const cells = {
    hg: { t: "高概率 · 收益", ex: "95% 的概率赢 1 万元", emo: "害怕失望", att: "规避风险", law: "原告胜算很大：接受不利的和解", note: "伯努利早就讨论过的情形：宁可少拿一点，也要确定。" },
    hl: { t: "高概率 · 损失", ex: "95% 的概率输 1 万元", emo: "希望避免损失", att: "寻求风险", law: "被告败局已定：拒绝有利的和解，赌一把", note: "最出人意料的一格。许多人间悲剧都在这里：明知大势已去，仍孤注一掷，把可控的损失变成灾难。" },
    lg: { t: "低概率 · 收益", ex: "5% 的概率赢 1 万元", emo: "希望获得大收益", att: "寻求风险", law: "“无意义诉讼”的原告：拒绝有利的和解", note: "彩票：没有票就没有机会，有了票就有了梦——概率多小并不重要。" },
    ll: { t: "低概率 · 损失", ex: "5% 的概率输 1 万元", emo: "害怕大损失", att: "规避风险", law: "被“无意义诉讼”的被告：接受不利的和解", note: "保险：花比期望损失更多的钱，买一个“心里踏实”。" },
  };
  const c = cells[sel];
  const btn = (k) => (
    <button
      key={k}
      className={cx("tfs-opt", sel === k && "sel")}
      style={{ margin: 0, height: "100%" }}
      onClick={() => setSel(k)}
      aria-pressed={sel === k}
    >
      <div style={{ fontWeight: 700 }}>{cells[k].att}</div>
      <div className="tfs-small">{cells[k].ex}</div>
    </button>
  );
  return (
    <Card title="四重模式：前景理论的核心成果" tag="交互图 · 第29章">
      <div style={{ display: "grid", gridTemplateColumns: "84px 1fr 1fr", gap: 8, alignItems: "stretch" }}>
        <div />
        <div className="tfs-small" style={{ fontWeight: 700, textAlign: "center" }}>
          收益
        </div>
        <div className="tfs-small" style={{ fontWeight: 700, textAlign: "center" }}>
          损失
        </div>
        <div className="tfs-small" style={{ fontWeight: 700, alignSelf: "center" }}>
          高概率
          <br />
          （确定性效应）
        </div>
        {btn("hg")}
        {btn("hl")}
        <div className="tfs-small" style={{ fontWeight: 700, alignSelf: "center" }}>
          低概率
          <br />
          （可能性效应）
        </div>
        {btn("lg")}
        {btn("ll")}
      </div>
      <Callout type="insight" title={c.t}>
        <p style={{ marginBottom: 6 }}>
          情绪：<b>{c.emo}</b> · 行为：<b>{c.att}</b> · 诉讼中：{c.law}
        </p>
        <p style={{ margin: 0 }}>{c.note}</p>
      </Callout>
      <p className="tfs-p2">
        四格中三格是熟悉的，只有“高概率·损失”是新的。两股力量解释了全部：<b>价值函数的形状</b>（收益凹、损失凸）与<b>决策权重的形状</b>（小概率高估、大概率低估）。在上面一行，两者方向一致；在下面一行，对小概率的过度加权压倒了价值函数的曲率。
      </p>
      <Callout type="c3" title="长远看，偏离期望值是要付账的">
        <p style={{ margin: 0 }}>
          假设纽约市每年面对 200 起“无意义诉讼”，每起有 5% 的概率输掉 100 万美元，而每起都能用 10 万美元和解。全部和解：花 2000 万；全部应诉：期望损失 1000 万。对单个案件“买保险”很自然，把它当作一项<b>政策</b>来看，代价就清楚了。
        </p>
      </Callout>
    </Card>
  );
}

/* ============================================================
   第四部分 · 选择与风险（下）
   ============================================================ */
function UrnLab() {
  const [pick, setPick] = useState(null);
  const urn = (n, red, cols) => (
    <svg viewBox={`0 0 ${cols * 14} ${Math.ceil(n / cols) * 14}`} style={{ width: "100%", maxWidth: cols * 14 * 1.4 }} role="img" aria-label={`${n} 个球中有 ${red} 个红球`}>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={(i % cols) * 14 + 7} cy={Math.floor(i / cols) * 14 + 7} r="5.5" fill={i < red ? "var(--bad)" : "var(--grid)"} stroke={i < red ? "none" : "var(--axis)"} strokeWidth="0.8" />
      ))}
    </svg>
  );
  return (
    <Lab title="两个罐子：摸到红球就赢" note="你只能从一个罐子里摸一次。">
      <div className="tfs-grid2">
        <button className={cx("tfs-opt", pick === "A" && "sel")} onClick={() => setPick("A")}>
          <b>罐子 A</b>：10 个球，其中 1 个红球
          <div style={{ marginTop: 8 }}>{urn(10, 1, 5)}</div>
        </button>
        <button className={cx("tfs-opt", pick === "B" && "sel")} onClick={() => setPick("B")}>
          <b>罐子 B</b>：100 个球，其中 8 个红球
          <div style={{ marginTop: 8 }}>{urn(100, 8, 20)}</div>
        </button>
      </div>
      {pick && (
        <div className="tfs-reveal">
          <Callout type={pick === "B" ? "warn" : "insight"} title={pick === "B" ? "你选了胜率更低的罐子（8% < 10%）" : "正确：A 的胜率 10%，高于 B 的 8%"}>
            <p>
              实验中 30%–40% 的学生选了 B。“8 个红球”的画面比“1 个红球”更生动，赢的想象更具体——这就是<b>分母忽视</b>：你盯着分子（能赢的球），看不见分母（不能赢的球）。
            </p>
          </Callout>
          <DataTable
            columns={[{ label: "同一个风险的两种说法" }, { label: "结果" }]}
            rows={[
              ["“每 10,000 人中有 1,286 人死于此病” vs “此病导致 24.14% 的人死亡”", "前者被认为更危险——尽管风险只有后者的一半"],
              ["“类似琼斯的病人，出院后几个月内有 10% 的概率施暴” vs “100 个类似的病人中约有 10 人会施暴”", "同意让他出院的专业人员：看到概率说法的 41%，看到频率说法的只有 21%"],
              ["“DNA 不匹配的概率是 0.1%” vs “每 1000 起死刑案中就有 1 起 DNA 会误配”", "辩护律师应当用后者，检察官偏爱前者"],
            ]}
          />
          <p className="tfs-small">
            注意对照：在“描述式”选择中（明确告诉你概率），罕见事件被高估；在“经验式”选择中（通过反复体验来学习），罕见事件常被低估——因为大多数人从未亲身经历过它。2007 年的银行家大多没有经历过真正的金融危机。
          </p>
        </div>
      )}
    </Lab>
  );
}

function combineLotteries(a, b) {
  const m = new Map();
  a.forEach(([pa, va]) => b.forEach(([pb, vb]) => m.set(va + vb, (m.get(va + vb) || 0) + pa * pb)));
  return [...m.entries()].sort((x, y) => y[0] - x[0]).map(([v, p]) => [p, v]);
}
function NarrowFrameLab() {
  const LOT = { A: [[1, 240]], B: [[0.25, 1000], [0.75, 0]], C: [[1, -750]], D: [[0.75, -1000], [0.25, 0]] };
  const [d1, setD1] = useState(null);
  const [d2, setD2] = useState(null);
  const combos = ["AC", "AD", "BC", "BD"].map((k) => {
    const dist = combineLotteries(LOT[k[0]], LOT[k[1]]);
    return { k, dist, ev: dist.reduce((s, [p, v]) => s + p * v, 0) };
  });
  const mine = d1 && d2 ? d1 + d2 : null;
  const fmtDist = (dist) =>
    dist
      .filter(([p]) => p > 1e-9)
      .map(([p, v]) => `${Math.round(p * 1000) / 10}% ${v >= 0 ? "赢 " + v : "输 " + -v}`)
      .join("，");
  return (
    <Lab title="两个同时摆在你面前的决策" note="请先分别做出两个选择。">
      <div className="tfs-grid2">
        <Card flat title="决策（1）">
          <button className={cx("tfs-opt", d1 === "A" && "sel")} onClick={() => setD1("A")}>
            A. 稳赚 240 元
          </button>
          <button className={cx("tfs-opt", d1 === "B" && "sel")} onClick={() => setD1("B")}>
            B. 25% 的概率赚 1000 元，75% 什么也没有
          </button>
        </Card>
        <Card flat title="决策（2）">
          <button className={cx("tfs-opt", d2 === "C" && "sel")} onClick={() => setD2("C")}>
            C. 稳亏 750 元
          </button>
          <button className={cx("tfs-opt", d2 === "D" && "sel")} onClick={() => setD2("D")}>
            D. 75% 的概率亏 1000 元，25% 没有损失
          </button>
        </Card>
      </div>
      {mine && (
        <div className="tfs-reveal">
          <p>现在把两个决策合在一起看（假设 B 和 D 的抽奖相互独立）：</p>
          <DataTable
            columns={[{ label: "组合" }, { label: "结果分布" }, { label: "期望值", num: true }]}
            rows={combos.map((c) => [
              <b className={c.k === mine ? "s1t" : ""}>
                {c.k}
                {c.k === mine ? "（你的选择）" : ""}
              </b>,
              fmtDist(c.dist),
              `${c.ev >= 0 ? "+" : ""}${Math.round(c.ev)}`,
            ])}
          />
          <Callout type={mine === "AD" ? "warn" : "insight"} title="AD 被 BC 完全压制">
            <p>
              AD = 25% 赢 240、75% 输 760；BC = 25% 赢 250、75% 输 750。BC 在每种情况下都更好，但实验中 <b>73%</b> 的人选了 A 和 D，只有 <b>3%</b> 选了 B 和 C。{mine === "AD" ? "你也是那 73%。" : ""}收益时规避风险、损失时寻求风险，单独看都说得通；合起来看，就是为同一件事付了两次“保险费”。这就是<b>窄框架</b>：把每个决策孤立地做，而不是当作一个整体。
            </p>
          </Callout>
        </div>
      )}
    </Lab>
  );
}

function SamuelsonLab() {
  const [wref, cw] = useWidth(560);
  const opts = [1, 2, 3, 5, 10, 20, 50, 100];
  const [n, setN] = useState(1);
  const [lam, setLam] = useState(2);
  const res = useMemo(() => {
    const bars = [];
    let pLoss = 0,
      val = 0,
      ev = 0;
    for (let k = 0; k <= n; k++) {
      const p = Math.exp(logChoose(n, k) - n * Math.log(2));
      const net = 300 * k - 100 * n;
      bars.push({ k, net, p });
      if (net < 0) pLoss += p;
      ev += p * net;
      val += p * (net >= 0 ? net : lam * net);
    }
    return { bars, pLoss, ev, val };
  }, [n, lam]);
  const W = Math.max(300, cw),
    H = 220,
    L = 16,
    Rr = 16,
    T = 12,
    B = 30;
  const maxP = Math.max(...res.bars.map((b) => b.p));
  const bw = (W - L - Rr) / res.bars.length;
  const y = lin(0, maxP * 1.1, H - B, T);
  return (
    <Lab title="萨缪尔森的硬币：一次不赌，一百次赌不赌？" note="规则：反面输 100 元，正面赢 200 元。萨缪尔森的同事说：“一次我不赌，但如果你让我抛 100 次，我就赌。”">
      <div className="tfs-chips">
        {opts.map((o) => (
          <button key={o} className={cx("tfs-chip", n === o && "on")} onClick={() => setN(o)}>
            抛 {o} 次
          </button>
        ))}
      </div>
      <Slider label="你的损失厌恶系数 λ" value={lam} min={1} max={3} step={0.1} format={(v) => v.toFixed(1)} onChange={setLam} />
      <div className="tfs-legend">
        <span>
          <i style={{ background: "var(--bad)" }} />
          最终亏钱
        </span>
        <span>
          <i style={{ background: "var(--s2)" }} />
          最终赚钱或持平
        </span>
      </div>
      <div ref={wref}><svg className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`抛 ${n} 次的净结果分布，亏钱概率 ${fmtPct(res.pLoss, 1)}`}>
        <line x1={L} x2={W - Rr} y1={H - B} y2={H - B} stroke="var(--axis)" />
        {res.bars.map((b, i) => {
          const h = H - B - y(b.p);
          const gapW = bw > 6 ? 2 : bw > 3 ? 1 : 0;
          return <path key={i} d={vBarPath(L + i * bw + gapW / 2, y(b.p), Math.max(0.8, Math.min(24, bw - gapW)), Math.max(0, h))} fill={b.net < 0 ? "var(--bad)" : "var(--s2)"} />;
        })}
        <text x={L} y={H - 10} fontSize="11" fill="var(--muted)">
          {res.bars[0].net}
        </text>
        <text x={W - Rr} y={H - 10} fontSize="11" fill="var(--muted)" textAnchor="end">
          +{res.bars[res.bars.length - 1].net}
        </text>
        <text x={(L + W - Rr) / 2} y={H - 10} fontSize="11" fill="var(--muted)" textAnchor="middle">
          最终净结果（元）
        </text>
      </svg></div>
      <div className="tfs-grid3">
        <Stat v={`+${fmtNum(res.ev)}`} l="期望收益（元）" />
        <Stat v={fmtPct(res.pLoss, res.pLoss < 0.01 ? 2 : 1)} l="最终亏钱的概率" />
        <Stat v={`${res.val >= 0 ? "+" : ""}${fmtNum(res.val, 1)}`} l={`按 λ=${lam.toFixed(1)} 计算的心理价值`} />
      </div>
      <Callout type="insight" title="损失厌恶没变，变的是框架">
        <p>
          λ = 2 时，抛一次的心理价值恰好为 0（所以拒绝很“合理”）；抛两次就变成 +50，抛五次亏钱概率只剩 18.75%。一百次时，亏钱的概率约为 1/2300。拒绝一次、接受一百次，这个直觉其实是对的——<b>错的是把人生中的每一个小赌局都当作“最后一次”来单独评估</b>。卡尼曼给的咒语是：“有赚有赔。”（适用条件：赌局相互独立、单次损失不会威胁你的整体财富、不是那种每次都极难赢的彩票。）
        </p>
      </Callout>
    </Lab>
  );
}

function MugsChart() {
  const data = [
    { label: "卖家（拿到了杯子）", v: 7.12, color: "var(--s1)", note: "要放弃已经拥有的东西，要价最高" },
    { label: "选择者（可选杯子或钱）", v: 3.12, color: "var(--s2)", note: "面对的选择与卖家完全相同：离开时带走杯子或带走钱" },
    { label: "买家（要自己掏钱）", v: 2.87, color: "var(--s2)", note: "花钱买杯子并不被当作“损失”" },
  ];
  return (
    <Card title="印着校徽的马克杯：拥有它，它就翻了一倍" tag="数据 · 第27章">
      <HBarChart data={data} max={8} format={(v) => `$${v.toFixed(2)}`} labelWidth={190} />
      <p className="tfs-p2">
        “卖家”和“选择者”面对的是<strong>完全相同</strong>的最终选项，唯一的区别是卖家“已经拥有”。约 2 : 1 的比例，与风险选择中的损失厌恶系数几乎一致。代币实验里没有禀赋效应——因为代币只是用来交换的；杯子是用来用的。
      </p>
      <p className="tfs-p2" style={{ marginBottom: 0 }}>
        经验能消除它：李斯特在棒球卡交易会上发现，新手中只有 18% 愿意把随机拿到的杯子换成巧克力（或反之），老练的交易者中这个比例是 48%——接近“毫无偏好”时应有的 50%。老练的交易者会问正确的问题：“与我能换到的东西相比，我真的那么想<em>要</em>这个杯子吗？”
      </p>
    </Card>
  );
}

function FairnessPoll() {
  const [a, setA] = useState(null);
  const [b, setB] = useState(null);
  const opts = ["完全公平", "可以接受", "不公平", "很不公平"];
  const Row = ({ v, set }) => (
    <div className="tfs-row">
      {opts.map((o) => (
        <button key={o} className={cx("tfs-btn sm", v === o && "primary")} onClick={() => set(o)}>
          {o}
        </button>
      ))}
    </div>
  );
  return (
    <Lab title="这样做公平吗？" note="1984 年，卡尼曼、泰勒和尼奇在温哥华用电话调查了大量普通人。">
      <p>
        <b>1.</b> 一家五金店一直以 15 美元出售雪铲。一场大雪后的第二天早上，店主把价格提到 20 美元。
      </p>
      <Row v={a} set={setA} />
      {a && (
        <p className="tfs-reveal tfs-small">
          <b>82%</b> 的受访者认为不公平或很不公平。按标准经济学，这只是用价格回应需求；但公众把“雪前的价格”当作参照点，涨价是店主<strong>利用市场力量把损失强加给顾客</strong>。
        </p>
      )}
      <p style={{ marginTop: 14 }}>
        <b>2.</b> 一家小复印店的员工时薪 9 美元，干了半年。附近工厂倒闭，失业增加，同类店员工的时薪是 7 美元。店主把这位员工的时薪降到 7 美元。
      </p>
      <Row v={b} set={setB} />
      {b && (
        <div className="tfs-reveal">
          <p className="tfs-small">
            <b>83%</b> 认为不公平。但如果是原员工辞职了，店主给<b>新员工</b>开 7 美元，<b>73%</b> 认为可以接受——新员工没有“参照交易”可以被侵犯。公平感的核心是：<strong>既有的工资、价格、租金构成一种“权利”</strong>；企业在自身利益受威胁时转嫁损失被视为公平，为了多赚而强加损失则不公平。
          </p>
          <p className="tfs-small" style={{ margin: 0 }}>这不是空谈：违背公平的雇主会面临生产率下降，定价“不公平”的商家会失去顾客；旁观者甚至愿意自掏腰包去惩罚不公平的人，而这种惩罚会激活大脑的奖赏中枢。</p>
        </div>
      )}
    </Lab>
  );
}

function MentalAccounts() {
  const items = [
    {
      t: "暴风雪之夜",
      q: "两位狂热球迷要开 64 公里去看比赛。一位自己花钱买了票，另一位的票是朋友送的。比赛当晚有暴风雪。谁更可能冒雪前往？",
      opts: ["自己买票的", "朋友送票的", "一样"],
      a: 0,
      why: "多数人认为买票的更会去。他为这场比赛开了一个“心理账户”，不去就意味着以亏损关账——钱花了，比赛也没看成。对经济人来说，票钱已经“沉没”，唯一该问的是：“如果票是送的，我还会冒雪去吗？”",
    },
    {
      t: "丢了票，还是丢了钱",
      q: "一位女士到剧院才发现：情形一，事先买好的两张 80 美元的票丢了；情形二，准备买票的 160 美元现金丢了。哪种情形下她更可能再花钱买票？",
      opts: ["丢了票的", "丢了钱的", "一样"],
      a: 1,
      why: "大多数人认为丢钱的会刷卡买票，丢票的会回家。丢票被记在“看戏”账户上，让这场戏显得要花 320 美元；丢钱被记在“一般收入”账户上。卡尼曼的建议：问“如果我丢的是同样多的现金，我还会买吗？”——更宽的账户通常带来更理性的决定。",
    },
    {
      t: "要给女儿办婚礼，卖哪只股票？",
      q: "你持有两只股票，市值都是 5000 美元：“蓝莓瓷砖”比买入价涨了，“蒂芙尼电机”比买入价跌了。你会卖哪只？",
      opts: ["卖赚钱的蓝莓", "卖亏钱的蒂芙尼"],
      a: 1,
      why: "大多数人卖掉赚钱的股票——以盈利关闭一个账户感觉很好（处置效应）。但理性的选择通常是卖亏损股：在美国卖亏损股可以抵税，而且近期上涨的股票短期内往往还会继续涨一阵。据估算，这样做第二年的税后额外回报约为 3.4%。“开心地关账”，是花钱买来的。",
    },
  ];
  const [tab, setTab] = useState(0);
  const [pk, setPk] = useState({});
  const it = items[tab];
  return (
    <Lab title="心理账户：钱在你脑子里并不是一样的钱">
      <div className="tfs-chips">
        {items.map((x, i) => (
          <button key={i} className={cx("tfs-chip", tab === i && "on")} onClick={() => setTab(i)}>
            {x.t}
          </button>
        ))}
      </div>
      <p>{it.q}</p>
      <div className="tfs-row">
        {it.opts.map((o, i) => (
          <button key={i} className={cx("tfs-btn sm", pk[tab] === i && "primary")} onClick={() => setPk({ ...pk, [tab]: i })}>
            {o}
          </button>
        ))}
      </div>
      {pk[tab] !== undefined && (
        <Callout type="insight" title={tab === 2 ? (pk[tab] === it.a ? "你做了经济人会做的选择" : "你和大多数投资者一样") : "多数人的回答：" + it.opts[it.a]}>
          <p style={{ margin: 0 }}>{it.why}</p>
        </Callout>
      )}
    </Lab>
  );
}

function RegretCard() {
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  return (
    <Lab title="后悔：作为与不作为的不对称">
      <p>
        <b>1.</b> 保罗持有 A 公司股票，去年想换成 B 公司，最后没换；现在得知换了能多赚 1200 美元。乔治原本持有 B 公司股票，去年换成了 A；现在得知不换能多赚 1200 美元。谁更后悔？
      </p>
      <div className="tfs-row">
        {["保罗", "乔治", "一样"].map((o) => (
          <button key={o} className={cx("tfs-btn sm", q1 === o && "primary")} onClick={() => setQ1(o)}>
            {o}
          </button>
        ))}
      </div>
      {q1 && (
        <p className="tfs-reveal tfs-small">
          92% 的人说乔治，只有 8% 说保罗——客观处境完全相同。<b>因行动而导致的坏结果，比因不行动而导致的更让人后悔。</b>更准确地说，关键不在“做与不做”，而在“偏离默认选项”：在 21 点游戏中，不管问的是“要牌吗”还是“停牌吗”，回答“是”而输了都更让人后悔。
        </p>
      )}
      <p style={{ marginTop: 14 }}>
        <b>2.</b> 布朗先生几乎从不让人搭便车，昨天破例让一个人搭车，结果被抢了。史密斯先生经常让人搭便车，昨天也被抢了。谁更后悔？谁更会被别人指责？
      </p>
      <div className="tfs-row">
        {["布朗更后悔", "史密斯更后悔"].map((o) => (
          <button key={o} className={cx("tfs-btn sm", q2 === o && "primary")} onClick={() => setQ2(o)}>
            {o}
          </button>
        ))}
      </div>
      {q2 && (
        <p className="tfs-reveal tfs-small" style={{ marginBottom: 0 }}>
          88% 认为布朗更后悔（偏离了自己的常态）；但 77% 认为史密斯更该被责备（偏离了社会的常态）。后悔与责备参照的是不同的“正常”。这解释了为什么医生、基金经理、消费者都偏爱常规选项：做了非常规的事而失败，既后悔又挨骂。
        </p>
      )}
    </Lab>
  );
}

function JointEval() {
  const [joint, setJoint] = useState(false);
  return (
    <Card title="偏好逆转：单独看 vs 放在一起看" tag="交互 · 第33章">
      <div className="tfs-row" style={{ marginBottom: 8 }}>
        <button className={cx("tfs-btn sm", !joint && "primary")} onClick={() => setJoint(false)}>
          分别评估
        </button>
        <button className={cx("tfs-btn sm", joint && "primary")} onClick={() => setJoint(true)}>
          联合评估
        </button>
      </div>
      <div className="tfs-grid2">
        <Card flat title="海豚保护基金">
          <p className="tfs-small" style={{ margin: 0 }}>许多海豚繁殖地受到污染威胁，海豚数量下降。基金会为海豚提供无污染的繁殖区。</p>
          <p style={{ margin: "8px 0 0" }}>{joint ? <span>捐款<b>较少</b></span> : <span className="s1t">捐款较多</span>}</p>
        </Card>
        <Card flat title="农场工人体检基金">
          <p className="tfs-small" style={{ margin: 0 }}>农场工人长时间暴晒，皮肤癌风险远高于常人；定期体检可以降低风险。</p>
          <p style={{ margin: "8px 0 0" }}>{joint ? <span className="s1t">捐款较多</span> : <span>捐款<b>较少</b></span>}</p>
        </Card>
      </div>
      <p className="tfs-p2">
        {joint
          ? "放在一起时，一个在单独评估中“不相关”的特征突然变得决定性：农场工人是人，海豚不是。"
          : "单独评估时，海豚被放进“濒危动物”这个类别里比较——它比鲤鱼、蜗牛可爱得多；皮肤癌体检被放进“公共卫生问题”里比较——它排名不高。强度匹配把“在本类别中的排名”直接换算成了捐款额。"}
      </p>
      <p className="tfs-p2" style={{ marginBottom: 0 }}>
        同样的逆转出现在陪审团中：单独看时，银行诈骗案（涉及 1000 万美元）得到的惩罚性赔偿比“孩子穿易燃睡衣被烧伤”更高；放在一起看，孩子得到的赔偿翻倍。卡尼曼的结论是：<b>判断在类别内是一致的，跨类别就会混乱</b>；更宽的比较框架通常更理性——但要小心那些故意为你安排比较对象的人（比如销售员）。
      </p>
    </Card>
  );
}

function FramingLab() {
  const frame = useMemo(() => (Math.random() < 0.5 ? "gain" : "loss"), []);
  const [pick, setPick] = useState(null);
  const opts =
    frame === "gain"
      ? [
          { id: "sure", label: "方案 A：200 人会获救" },
          { id: "risk", label: "方案 B：1/3 的概率 600 人全部获救，2/3 的概率无人获救" },
        ]
      : [
          { id: "sure", label: "方案 A′：400 人会死亡" },
          { id: "risk", label: "方案 B′：1/3 的概率无人死亡，2/3 的概率 600 人全部死亡" },
        ];
  return (
    <Lab title="“亚洲疾病问题”" note="美国正在为一种罕见的亚洲疾病做准备，预计会导致 600 人死亡。有两个应对方案，科学估计如下（你看到的是随机分配的一个版本）：">
      <Choice options={opts} value={pick} onChange={setPick} />
      {pick && (
        <div className="tfs-reveal">
          <p>另一组人看到的版本是：</p>
          <div className="tfs-callout">
            {frame === "gain" ? (
              <p style={{ margin: 0 }}>
                A′：400 人会死亡　/　B′：1/3 的概率无人死亡，2/3 的概率 600 人全部死亡
              </p>
            ) : (
              <p style={{ margin: 0 }}>
                A：200 人会获救　/　B：1/3 的概率 600 人全部获救，2/3 的概率无人获救
              </p>
            )}
          </div>
          <Callout type="insight" title="A 与 A′、B 与 B′ 在结果上完全相同">
            <p>
              在特沃斯基和卡尼曼 1981 年的原始研究中，“获救”版本里 <b>72%</b> 选了确定的方案 A；“死亡”版本里 <b>78%</b> 选了冒险的方案 B′。你看到的是“{frame === "gain" ? "获救" : "死亡"}”版本，选了{pick === "sure" ? "确定的方案" : "冒险的方案"}
              {(frame === "gain") === (pick === "sure") ? "——与多数人一致。" : "——与多数人不同。"}
            </p>
            <p style={{ margin: 0 }}>
              最令人不安的一幕：当被问到“你在一个版本里选确定、在另一个版本里选冒险，现在知道它们是同一回事了，你要怎么选？”——回答通常是尴尬的沉默。<b>我们的道德直觉附着在描述上，而不是附着在实质上。</b>公共卫生专家与普通人一样受这个效应影响。
            </p>
          </Callout>
        </div>
      )}
      <div className="tfs-grid2" style={{ marginTop: 10 }}>
        <Stat v="84%" l="看到“术后一个月存活率 90%”的医生选择手术" />
        <Stat v="50%" l="看到“术后一个月死亡率 10%”的医生选择手术" />
      </div>
    </Lab>
  );
}

function MpgCalc() {
  const [a0, setA0] = useState(12);
  const [a1, setA1] = useState(14);
  const [b0, setB0] = useState(30);
  const [b1, setB1] = useState(40);
  const miles = 10000;
  const sa = miles / a0 - miles / a1,
    sb = miles / b0 - miles / b1;
  const toL100 = (mpg) => 235.215 / mpg;
  return (
    <Lab title="每加仑英里数的错觉：谁省的油更多？" note="亚当把一辆耗油车换成了稍好的车；贝丝把一辆省油车换成了更省油的车。两人每年都开 1 万英里。">
      <div className="tfs-grid2">
        <div>
          <Slider label="亚当：换车前（英里/加仑）" value={a0} min={8} max={40} onChange={setA0} />
          <Slider label="亚当：换车后" value={a1} min={a0} max={50} onChange={setA1} />
        </div>
        <div>
          <Slider label="贝丝：换车前（英里/加仑）" value={b0} min={8} max={40} onChange={setB0} />
          <Slider label="贝丝：换车后" value={b1} min={b0} max={60} onChange={setB1} />
        </div>
      </div>
      <div className="tfs-grid2" style={{ marginTop: 8 }}>
        <Stat v={`${Math.round(sa)} 加仑`} l={`亚当每年省油（${a0}→${a1}，即 ${toL100(a0).toFixed(1)}→${toL100(a1).toFixed(1)} 升/百公里）`} />
        <Stat v={`${Math.round(sb)} 加仑`} l={`贝丝每年省油（${b0}→${b1}，即 ${toL100(b0).toFixed(1)}→${toL100(b1).toFixed(1)} 升/百公里）`} />
      </div>
      <p className="tfs-p2" style={{ marginTop: 10, marginBottom: 0 }}>
        直觉会说贝丝省得多（多了 10 英里/加仑，提升三分之一），但按默认数值，亚当省了约 119 加仑，贝丝只省了 83 加仑。“每加仑跑多少英里”是一个误导性的框架，正确的框架是“每英里（或每百公里）耗多少油”——中国常用的“百公里油耗”恰好就是更好的框架。2013 年起，美国新车标签开始加注“每英里耗油量”，这是心理学直接改进公共政策的一例。
      </p>
    </Lab>
  );
}

function OrganChart() {
  const data = [
    { label: "奥地利", v: 99.98, color: "var(--s2)", note: "默认同意，不愿捐献需主动退出" },
    { label: "瑞典", v: 86, color: "var(--s2)", note: "默认同意，不愿捐献需主动退出" },
    { label: "德国", v: 12, color: "var(--s1)", note: "默认不捐，愿意捐献需主动勾选" },
    { label: "丹麦", v: 4, color: "var(--s1)", note: "默认不捐，愿意捐献需主动勾选" },
  ];
  return (
    <Card title="器官捐献：一个勾选框的力量" tag="数据 · 第34章（2003 年研究）">
      <div className="tfs-legend">
        <span>
          <i style={{ background: "var(--s2)" }} />
          默认为捐献者（选择退出制）
        </span>
        <span>
          <i style={{ background: "var(--s1)" }} />
          默认不是捐献者（选择加入制）
        </span>
      </div>
      <HBarChart data={data} max={110} format={(v) => (v > 99 ? "≈100%" : `${v}%`)} labelWidth={80} />
      <p className="tfs-p2" style={{ marginBottom: 0 }}>
        邻近、文化相似的国家，捐献率可以相差二十多倍。预测一个人是否捐献器官的最佳指标，不是性格、宗教或教育，而是<strong>表格的默认选项</strong>。卡尼曼认为这主要是懒惰的系统2 在起作用：没想好的人就停在默认处。这也是泰勒与桑斯坦《助推》的核心工具——“选择架构”。
      </p>
    </Card>
  );
}

function Part4Section() {
  return (
    <div className="tfs-content">
      <SectionHead
        kicker="第四部分 · 第25–34章"
        title="选择与风险"
        lead="这一部分是卡尼曼获得诺贝尔经济学奖的核心：前景理论。它用三个心理物理学原则，替换了经济学中“理性经济人”的假设，并解释了一连串让经济学家头疼的现象。"
        roots={["reference", "coherence", "prototype", "lazy"]}
      />
      <h2 className="tfs-h2">经济人与人类</h2>
      <p>
        一篇经济学论文的第一句话让卡尼曼吃了一惊：“经济理论的主体是理性的、自私的，偏好不会改变。”在心理学家看来，人显然既不完全理性，也不完全自私，偏好更不稳定。理查德·泰勒后来把这两种生物称为<b>经济人（Econs）</b>与<b>人类（Humans）</b>。注意：卡尼曼说的“不理性”，不是“冲动、情绪化”，而是<strong>不符合逻辑一致性</strong>——同一个选择换个说法，答案就变了。
      </p>

      <h2 className="tfs-h2">伯努利的错误与“理论诱导的盲区”</h2>
      <p>
        1738 年，伯努利提出财富的效用是对数函数：100 万对穷人和富人意义不同，所以人们规避风险、穷人买保险、富人卖保险。这个洞见如此成功，以至于接下来两百多年里，几乎没人注意到它漏掉了一个显而易见的东西——<b>参照点</b>。
      </p>
      <JackJill />
      <Callout type="insight" title="卡尼曼对学者思维的自我诊断">
        <p>
          <b>理论诱导的盲区</b>：一旦接受了一个理论并把它当作思考工具，就很难注意到它的缺陷。遇到不符合的例子，你会假设“一定有个合理解释，只是我没想到”。质疑是件苦差事，而系统2 很容易累。——这句话同样适用于前景理论本身：它也无法处理“失望”和“后悔”。
        </p>
      </Callout>

      <h2 className="tfs-h2">前景理论：三条原则，一条曲线</h2>
      <ValueFunctionLab />
      <ChoiceFour />
      <Callout type="plain" title="拉宾定理：期望效用理论在“小赌注”上的死刑判决">
        <p className="tfs-small" style={{ margin: 0 }}>
          经济学家拉宾在 2000 年证明：如果一个人因为财富效用曲线弯曲而拒绝“50% 输 100、50% 赢 200”这种小赌局，那么按照同一条曲线，他也必须拒绝“50% 输 200、50% 赢 20000”——没有正常人会拒绝后者。用财富状态解释对小额损失的厌恶，数学上就走不通；只有“相对参照点的损失厌恶”能解释。
        </p>
      </Callout>

      <h2 className="tfs-h2">禀赋效应：拥有改变了价值</h2>
      <p>
        经济学教科书里的“无差异曲线”也有伯努利式的漏洞：它没有标出你<strong>现在</strong>在哪里。一对双胞胎，一个选了加薪，一个选了多放假，过一段时间后都不愿交换——放弃已有的东西是损失，得到新东西只是收益。泰勒注意到一位经济学教授：他不愿以 100 美元卖掉自己收藏的酒，却从不花超过 35 美元去买一瓶酒。
      </p>
      <MugsChart />

      <h2 className="tfs-h2">坏比好更强：参照点无处不在</h2>
      <p>
        大脑处理威胁比处理机会更快：一张惊恐的眼睛照片即使只闪现 0.02 秒、根本来不及被意识到，也会激活杏仁核。一只蟑螂能毁掉一碗樱桃，一颗樱桃却救不了一碗蟑螂。婚姻研究者戈特曼估计，稳定的关系需要好的互动与坏的互动至少 5 : 1。
      </p>
      <div className="tfs-grid2">
        <Callout type="s1" title="目标就是参照点">
          <p style={{ margin: 0 }}>
            纽约出租车司机为自己设定每日收入目标：雨天生意好，很快达标就收工；晴天生意差，反而跑得更久——与经济逻辑正好相反。职业高尔夫球手推“保标准杆”的球比推“抓小鸟”的球准 3.6 个百分点：没保住标准杆是损失，没抓到小鸟只是没得到。对老虎伍兹来说，这意味着每个赛季少赚约 100 万美元。
          </p>
        </Callout>
        <Callout type="s1" title="改革为什么这么难">
          <p style={{ margin: 0 }}>
            任何改革都有赢家和输家，而输家的痛比赢家的乐更强烈、更有组织。所以改革方案里总有“老人老办法”：只降低未来员工的待遇、靠自然减员而非裁员。损失厌恶是一股强大的保守力量——它也让我们的婚姻、邻里和工作保持稳定。
          </p>
        </Callout>
      </div>
      <FairnessPoll />

      <h2 className="tfs-h2">决策权重：可能性效应与确定性效应</h2>
      <p>
        期望效用理论要求按概率给结果加权。但得到 100 万美元的机会从 0 提高到 5%、从 5% 到 10%、从 60% 到 65%、从 95% 到 100%——你感觉一样吗？从“不可能”到“有可能”，从“几乎确定”到“确定”，都是<strong>质变</strong>；中间的变化只是量变。
      </p>
      <WeightingLab />
      <AllaisLab />
      <FourfoldGrid />

      <h2 className="tfs-h2">罕见事件：要么被忽视，要么被放大</h2>
      <p>
        2001 年 12 月至 2004 年 9 月，以色列共发生 23 起公交车自杀式爆炸，死亡 236 人；而每天乘公交车的人约 130 万。卡尼曼明知风险微乎其微，开车等红灯时还是会避免停在公交车旁边——不是出于理性计算，而是为了不去想那个画面。<b>恐怖主义直接与系统1 对话。</b>中彩票的幻想，是同一种心理机制的愉快版本。
      </p>
      <p>
        罕见事件何时被高估？当它成为<strong>注意的焦点</strong>时：被明确提及、画面生动、用频率来表述（“每 1000 人中有 1 人”）。克雷格·福克斯请篮球迷分别估计 8 支季后赛球队夺冠的概率，加起来是 240%；让他们为每支球队下注，总价 287 美元，而最多只能赢回 160 美元。
      </p>
      <UrnLab />

      <h2 className="tfs-h2">窄框架与风险政策</h2>
      <NarrowFrameLab />
      <SamuelsonLab />
      <Callout type="c3" title="风险政策：把一次次选择变成一条规则">
        <p>
          “买保险总选最高免赔额”“从不买延长保修”“每个季度才看一次投资组合”——这些都是<b>宽框架</b>。频繁查看账户是一种亏本策略：小额亏损的痛苦大于同等频率小额盈利的快乐，于是你越看越想逃。理查德·泰勒问一家大公司的 25 位部门经理是否愿意接受一个“一半可能亏光、一半可能翻倍”的项目，没人愿意；在场的 CEO 却说：“我希望他们全都接受。”他看到的是 25 个赌局的组合。
        </p>
        <p className="tfs-small" style={{ margin: 0 }}>
          外部视角和风险政策是一对：前者纠正规划谬误中的过度乐观，后者纠正损失厌恶中的过度谨慎。两种偏差方向相反，组织应当同时使用这两种工具，而不是指望它们恰好相互抵消。
        </p>
      </Callout>

      <h2 className="tfs-h2">心理账户、沉没成本与后悔</h2>
      <MentalAccounts />
      <p>
        沉没成本在组织里更顽固，因为它和<b>代理问题</b>缠在一起：对公司而言，继续向失败项目砸钱是错的；对“拥有”这个项目的高管而言，关掉它意味着履历上的污点。所以董事会常常换掉 CEO——不是因为新人更能干，而是因为新人没有同样的心理账户。好消息是：研究发现学过经济学与商科的人更可能放弃注定失败的项目。
      </p>
      <RegretCard />
      <Callout type="plain" title="禁忌权衡">
        <p className="tfs-small" style={{ margin: 0 }}>
          父母被问：一种杀虫剂把儿童中毒风险从每万瓶 15 例提高到 16 例，要便宜多少你才会买？超过三分之二的人说“多便宜都不买”。可是保护孩子的时间和金钱是有限的，省下的钱本可以买更安全的儿童座椅。拒绝一切“以风险换钱”的交易，很大程度上是在回避将来的后悔。欧洲监管中的“预防原则”也面临同样的两难。吉尔伯特的研究提醒我们：人们普遍高估将来会感到的后悔，因为低估了自己的“心理免疫系统”。
        </p>
      </Callout>

      <h2 className="tfs-h2">偏好逆转</h2>
      <JointEval />

      <h2 className="tfs-h2">框架效应：现实没变，描述变了</h2>
      <p>
        “意大利队赢了”和“法国队输了”说的是同一场比赛，但它们让你想起的东西不同。经济人的偏好关于现实，人类的偏好关于描述。伦敦大学的脑成像研究发现：选择顺从框架时，与情绪相关的杏仁核更活跃；抵抗框架时，与冲突和自我控制相关的前扣带皮层更活跃；而最不受框架影响的人，前额叶区域（整合情绪与推理）更活跃。
      </p>
      <FramingLab />
      <Callout type="plain" title="谢林的税法难题">
        <p className="tfs-small" style={{ margin: 0 }}>
          “富人每个孩子的免税额，是否应该比穷人的更高？”——学生们强烈反对。“没有孩子的穷人家庭，是否应该和没有孩子的富人家庭多缴一样多的附加税？”——同样强烈反对。可是在逻辑上，你不能同时反对这两者：它们只是选了不同的“默认家庭”作为参照点。我们对贫富的道德直觉，附着在一个任意的参照点上。
        </p>
      </Callout>
      <MpgCalc />
      <OrganChart />
      <Card flat title="饮水机旁可以这么说" tag="词汇">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>“他把损失看得比收益重一倍，这很正常，但让他错过了一个很好的机会。”</li>
          <li>“这次谈判不会有进展：双方都觉得自己的让步是损失，对方的让步只是收益。”</li>
          <li>“他们知道爆炸的风险很小，但还是想把它降到零——这是可能性效应。”</li>
          <li>“告诉她像交易员一样思考：有赚有赔。”</li>
          <li>“我们又追加了投资，因为不想承认失败——这是沉没成本吗？”</li>
          <li>“换个参照点想想：如果我们从没拥有过它，现在愿意花多少钱买？”</li>
        </ul>
      </Card>
    </div>
  );
}

/* ============================================================
   第五部分 · 两个自我
   ============================================================ */
const COLON_A = [1, 3, 4, 6, 8, 6, 5, 6, 7];
const COLON_B = [1, 2, 3, 4, 4, 5, 6, 8, 7, 6, 5, 6, 5, 4, 4, 5, 4, 3, 3, 2, 2, 2, 1, 1, 1];
const TAIL = [5, 3, 2];
function auc(arr) {
  let s = 0;
  for (let i = 1; i < arr.length; i++) s += (arr[i] + arr[i - 1]) / 2;
  return s;
}
function ColonoscopyLab() {
  const [wref, cw] = useWidth(560);
  const [tail, setTail] = useState(false);
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);
  const A = tail ? [...COLON_A, ...TAIL] : COLON_A;
  const B = COLON_B;
  const W = Math.max(300, cw),
    H = 300,
    L = 40,
    Rr = 100,
    T = 14,
    Bm = 34;
  const x = lin(0, 24, L, W - Rr),
    y = lin(0, 10, H - Bm, T);
  const line = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const area = (arr) => `${line(arr)} L${x(arr.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const pe = (arr) => (Math.max(...arr) + arr[arr.length - 1]) / 2;
  const onMove = (e) => setHover(clamp(Math.round(((svgX(e, svgRef.current, W) - L) / (W - Rr - L)) * 24), 0, 24));
  return (
    <Lab title="两位结肠镜检查病人：谁更痛苦？" note="病人每 60 秒报告一次疼痛（0 = 不痛，10 = 无法忍受）。下面的曲线依书中图 15 的描述重绘：A 持续 8 分钟，最痛时 8 分，结束前 7 分；B 持续 24 分钟，最痛时同为 8 分，结束前只有 1 分。">
      <div className="tfs-legend">
        <span>
          <i className="ln" style={{ background: "var(--s1)" }} />
          病人 A{tail ? "（加上温和的结尾）" : ""}
        </span>
        <span>
          <i className="ln" style={{ background: "var(--s2)" }} />
          病人 B
        </span>
      </div>
      <div ref={wref}><svg ref={svgRef} className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="两条疼痛随时间变化的曲线" onMouseMove={onMove} onMouseLeave={() => setHover(null)} onTouchMove={onMove}>
        {[0, 2, 4, 6, 8, 10].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - Rr} y1={y(v)} y2={y(v)} stroke="var(--grid)" />
            <text x={L - 8} y={y(v) + 4} fontSize="11" textAnchor="end" fill="var(--muted)">
              {v}
            </text>
          </g>
        ))}
        {[0, 4, 8, 12, 16, 20, 24].map((v) => (
          <text key={v} x={x(v)} y={H - Bm + 16} fontSize="11" textAnchor="middle" fill="var(--muted)">
            {v}
          </text>
        ))}
        <text x={(L + W - Rr) / 2} y={H - 4} fontSize="12" textAnchor="middle" fill="var(--ink-2)">
          时间（分钟）
        </text>
        <path d={area(B)} fill="var(--s2)" opacity="0.1" />
        <path d={area(A)} fill="var(--s1)" opacity="0.12" />
        <path d={line(B)} fill="none" stroke="var(--s2)" strokeWidth="2" strokeLinejoin="round" />
        <path d={line(A)} fill="none" stroke="var(--s1)" strokeWidth="2" strokeLinejoin="round" />
        <circle cx={x(A.length - 1)} cy={y(A[A.length - 1])} r="5" fill="var(--s1)" stroke="var(--surface)" strokeWidth="2" />
        <circle cx={x(B.length - 1)} cy={y(B[B.length - 1])} r="5" fill="var(--s2)" stroke="var(--surface)" strokeWidth="2" />
        {tail ? (
          <text x={x(A.length - 1) + 8} y={y(A[A.length - 1]) + 4} fontSize="12" fill="var(--ink)" fontWeight="600">
            A 结束（2 分）
          </text>
        ) : (
          <g>
            <line x1={x(A.length - 1)} x2={x(A.length - 1)} y1={y(9.2)} y2={y(A[A.length - 1]) - 7} stroke="var(--ink-2)" strokeWidth="1" />
            <text x={x(A.length - 1)} y={y(9.5)} fontSize="12" fill="var(--ink)" fontWeight="600" textAnchor="middle">
              A 在此结束（7 分）
            </text>
          </g>
        )}
        <text x={x(B.length - 1) + 8} y={y(B[B.length - 1]) + 4} fontSize="12" fill="var(--ink)" fontWeight="600">
          B 结束（1 分）
        </text>
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - Bm} stroke="var(--ink-2)" strokeWidth="1" />}
      </svg></div>
      <div className="tfs-readout">
        {hover !== null ? `第 ${hover} 分钟：A ${A[hover] !== undefined ? A[hover] : "（已结束）"}，B ${B[hover] !== undefined ? B[hover] : "（已结束）"}` : " "}
      </div>
      <DataTable
        columns={[{ label: "" }, { label: "病人 A", num: true }, { label: "病人 B", num: true }, { label: "谁更糟？" }]}
        rows={[
          ["持续时间（分钟）", A.length - 1, B.length - 1, "B"],
          [<span>曲线下面积：<b>体验自我</b>承受的总痛苦</span>, auc(A).toFixed(1), auc(B).toFixed(1), <b className="s2t">{auc(A) > auc(B) ? "A" : "B"}</b>],
          [<span>峰终均值：<b>记忆自我</b>记住的痛苦</span>, pe(A).toFixed(1), pe(B).toFixed(1), <b className="s1t">{pe(A) > pe(B) ? "A" : "B"}</b>],
        ]}
      />
      <div className="tfs-row">
        <button className={cx("tfs-btn", tail && "primary")} onClick={() => setTail(!tail)}>
          {tail ? "去掉 A 的温和结尾" : "给 A 多加 3 分钟温和的结尾"}
        </button>
      </div>
      <Callout type="insight" title={tail ? "多受了罪，却记得更好" : "两个自我给出了相反的答案"}>
        {tail ? (
          <p>
            加上一段不那么痛的结尾，A 的<b>总痛苦增加了</b>，但记忆中的痛苦从 7.5 降到 5。后来的一项随机试验（Redelmeier、Katz 与 Kahneman，2003）正是这样做的：检查结束后把镜头多留一会儿，病人对检查的回忆明显更好，也更愿意回来复查。
          </p>
        ) : (
          <p>
            按“曲线下面积”算，B 的痛苦远多于 A；但事后问两人“整体有多痛”，A 的评价更差。154 位病人的数据显示两条规律：<b>峰终定律</b>——回顾评价约等于最痛时刻与最后时刻的平均；<b>过程忽视</b>——持续时间对回顾评价几乎没有影响。
          </p>
        )}
      </Callout>
    </Lab>
  );
}

function ColdHandLab() {
  const [wref, cw] = useWidth(540);
  const [pick, setPick] = useState(null);
  const W = Math.max(300, cw),
    H = 150,
    L = 40,
    Rr = 16;
  const x = lin(0, 90, L, W - Rr),
    y = lin(0, 10, H - 30, 10);
  const shortD = `M${x(0)},${y(0)} L${x(2)},${y(7)} L${x(60)},${y(7.4)} L${x(60)},${y(0)}`;
  const longD = `M${x(0)},${y(0)} L${x(2)},${y(7)} L${x(60)},${y(7.4)} L${x(90)},${y(5.6)} L${x(90)},${y(0)}`;
  return (
    <Lab title="冰水实验：你愿意多痛 30 秒吗？" note="被试把一只手浸入 14°C 的冷水 60 秒；另一只手先同样浸 60 秒，然后水温悄悄升高约 1°C，再持续 30 秒。七分钟后，被试可以选择重复其中一次。（下图为示意）">
      <div className="tfs-legend">
        <span>
          <i className="ln" style={{ background: "var(--s1)" }} />
          短实验：60 秒
        </span>
        <span>
          <i className="ln" style={{ background: "var(--s2)" }} />
          长实验：60 秒 + 30 秒稍暖
        </span>
      </div>
      <div ref={wref}><svg className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="示意：长实验包含短实验的全部痛苦再加 30 秒较轻的痛苦">
        <line x1={L} x2={W - Rr} y1={y(0)} y2={y(0)} stroke="var(--axis)" />
        {[0, 30, 60, 90].map((v) => (
          <text key={v} x={x(v)} y={H - 12} fontSize="11" textAnchor="middle" fill="var(--muted)">
            {v} 秒
          </text>
        ))}
        <path d={longD} fill="var(--s2)" opacity="0.1" stroke="var(--s2)" strokeWidth="2" strokeLinejoin="round" />
        <path d={shortD} fill="none" stroke="var(--s1)" strokeWidth="2" strokeLinejoin="round" />
      </svg></div>
      <p style={{ marginTop: 8 }}>如果必须再做一次，你选哪一个？</p>
      <div className="tfs-row">
        {["短的（60 秒）", "长的（90 秒）"].map((o) => (
          <button key={o} className={cx("tfs-btn", pick === o && "primary")} onClick={() => setPick(o)}>
            {o}
          </button>
        ))}
      </div>
      {pick && (
        <Callout type="insight" title="80% 的人（在感到结尾有所缓解的人中）选择了长的">
          <p style={{ margin: 0 }}>
            长实验包含短实验的<b>全部</b>痛苦，外加 30 秒。从体验自我的角度，这毫无疑问更糟；但记忆自我记住的是“峰值与结尾”，长实验的结尾没那么痛，于是它“记起来更好”。被试并非受虐狂——如果直接问“你想泡 90 秒还是只泡前 60 秒”，他们当然选短的。他们只是按照记忆做了选择，而<strong>记忆自我才是做决定的那个自我</strong>。老鼠实验也显示了同样的“过程忽视”：电击的持续时间对它们的恐惧几乎没有影响。
          </p>
        </Callout>
      )}
    </Lab>
  );
}

function JaneLab() {
  const [wref, cw] = useWidth(560);
  const [base, setBase] = useState(30);
  const [hBase, setHBase] = useState(9);
  const [extra, setExtra] = useState(5);
  const [hExtra, setHExtra] = useState(6);
  const avg0 = hBase,
    avg1 = (base * hBase + extra * hExtra) / (base + extra);
  const tot0 = base * hBase,
    tot1 = base * hBase + extra * hExtra;
  const W = Math.max(300, cw),
    Ls = 20,
    Rs = 20;
  const years = base + 5;
  const xs = lin(0, years, Ls, W - Rs);

  return (
    <Lab title="简的一生：多活 5 年“还算幸福”的日子，是加分还是减分？" note="埃德·迪纳的实验：简一生未婚无子，死于一场没有痛苦的车祸。一个版本里，她一直非常幸福；另一个版本里，她多活了 5 年，这 5 年“还算幸福，但不如从前”。">
      <div className="tfs-grid2">
        <div>
          <div className="tfs-row" style={{ marginBottom: 4 }}>
            <span className="tfs-small">原本寿命：</span>
            {[30, 60].map((v) => (
              <button key={v} className={cx("tfs-btn sm", base === v && "primary")} onClick={() => setBase(v)}>
                {v} 年
              </button>
            ))}
          </div>
          <Slider label="前半生的幸福度" value={hBase} min={5} max={10} step={0.5} onChange={setHBase} />
        </div>
        <div>
          <Slider label="额外多活的年数" value={extra} min={0} max={5} onChange={setExtra} />
          <Slider label="额外年份的幸福度" value={hExtra} min={0} max={10} step={0.5} onChange={setHExtra} />
        </div>
      </div>
      <div ref={wref}><svg className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} 70`} role="img" aria-label="时间条：每一年的颜色深浅表示幸福程度">
        {Array.from({ length: base + extra }, (_, i) => {
          const h = i < base ? hBase : hExtra;
          return <rect key={i} x={xs(i) + 0.5} y={16} width={Math.max(1, xs(1) - xs(0) - 1)} height={26} fill="var(--s2)" opacity={0.12 + h * 0.085} />;
        })}
        <text x={Ls} y={60} fontSize="11" fill="var(--muted)">
          0
        </text>
        <text x={xs(base)} y={60} fontSize="11" fill="var(--muted)" textAnchor="middle">
          {base}
        </text>
        {extra > 0 && (
          <text x={xs(base + extra)} y={10} fontSize="11" fill="var(--ink-2)" textAnchor="end">
            +{extra} 年
          </text>
        )}
      </svg></div>
      <div className="tfs-grid2">
        <Card flat title="平均幸福：记忆自我（和实验被试）的算法">
          <p style={{ margin: 0 }}>
            {avg0.toFixed(2)} → <b className={avg1 < avg0 ? "badt" : "c3t"}>{avg1.toFixed(2)}</b>
            {avg1 < avg0 ? "（下降了）" : ""}
          </p>
        </Card>
        <Card flat title="幸福总量：体验自我的累积">
          <p style={{ margin: 0 }}>
            {fmtNum(tot0)} → <b className="c3t">{fmtNum(tot1)}</b>（多了 {fmtNum(tot1 - tot0)}）
          </p>
        </Card>
      </div>
      <Callout type="insight" title="“少即是多”又出现了">
        <p style={{ margin: 0 }}>
          实验中，把简的寿命从 30 年加倍到 60 年，人们对她一生“有多理想”的评价<b>几乎没变</b>（过程忽视）；而多加 5 年稍逊的幸福，评价<b>明显下降</b>——即便让被试同时看到两个版本也是如此。系统1 用一个“典型时刻”来代表一段人生，就像它用平均来代表一套餐具、用“像不像”来代表概率。卡尼曼在看《茶花女》时意识到：我们在乎薇奥莉塔的恋人能否在最后 10 分钟赶到，却不在乎她活了 27 年还是 28 年。
        </p>
      </Callout>
    </Lab>
  );
}

function UIndexChart() {
  const data = [
    { label: "早晨通勤", v: 29 },
    { label: "工作", v: 27 },
    { label: "照顾孩子", v: 24 },
    { label: "做家务", v: 18 },
    { label: "社交", v: 12 },
    { label: "看电视", v: 12 },
    { label: "性生活", v: 5 },
  ];
  return (
    <Card title="U 指数：一天中处于不愉快状态的时间比例" tag="数据 · 第37章">
      <p className="tfs-small">
        昨日重现法（DRM）：让人把昨天切成像电影一样的片段，逐段回忆做了什么、和谁在一起、各种感受有多强。某个片段中最强的感受若是负面的，就算作“不愉快”。数据来自美国中西部城市约 1000 位女性。（中译本把“早晨通勤”误译成了“晨间交流”。）
      </p>
      <HBarChart data={data} max={35} format={(v) => `${v}%`} labelWidth={96} />
      <div className="tfs-grid3">
        <Stat v="19%" l="美国女性的 U 指数" />
        <Stat v="16%" l="法国女性" />
        <Stat v="14%" l="丹麦女性" />
      </div>
      <p className="tfs-p2" style={{ marginTop: 12, marginBottom: 0 }}>
        U 指数的妙处在于它不依赖评分量表，而是基于<strong>时间</strong>这一客观量。把 1% 的清醒时间从不愉快变成中性，对一个社会而言就是数以百万计的小时。
      </p>
    </Card>
  );
}

function ParaplegicChart() {
  const [wref, cw] = useWidth(520);
  const groups = [
    { g: "事故 1 个月后", a: 75, b: 70 },
    { g: "事故 1 年后", a: 41, b: 68 },
  ];
  const W = Math.max(300, Math.min(cw, 640)),
    H = 240,
    L = 40,
    Rr = 16,
    T = 20,
    B = 40;
  const y = lin(0, 100, H - B, T);
  const gw = (W - L - Rr) / 2;
  const bw = 40;
  return (
    <Card title="估计：一位截瘫者有多少时间处于坏心情？" tag="数据 · 第38章">
      <div className="tfs-legend">
        <span>
          <i style={{ background: "var(--s2)" }} />
          估计者认识截瘫者
        </span>
        <span>
          <i style={{ background: "var(--s1)" }} />
          估计者不认识截瘫者
        </span>
      </div>
      <div ref={wref}><svg className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="一年后，认识截瘫者的人估计 41%，不认识的人估计 68%">
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - Rr} y1={y(v)} y2={y(v)} stroke="var(--grid)" />
            <text x={L - 8} y={y(v) + 4} fontSize="11" textAnchor="end" fill="var(--muted)">
              {v}%
            </text>
          </g>
        ))}
        {groups.map((gr, i) => {
          const cx0 = L + gw * i + gw / 2;
          return (
            <g key={gr.g}>
              <path d={vBarPath(cx0 - bw - 1, y(gr.a), bw, y(0) - y(gr.a))} fill="var(--s2)" />
              <path d={vBarPath(cx0 + 1, y(gr.b), bw, y(0) - y(gr.b))} fill="var(--s1)" />
              <text x={cx0 - bw / 2 - 1} y={y(gr.a) - 6} fontSize="12" textAnchor="middle" fill="var(--ink)" fontWeight="600">
                {gr.a}%
              </text>
              <text x={cx0 + bw / 2 + 1} y={y(gr.b) - 6} fontSize="12" textAnchor="middle" fill="var(--ink)" fontWeight="600">
                {gr.b}%
              </text>
              <text x={cx0} y={H - B + 20} fontSize="12" textAnchor="middle" fill="var(--ink-2)">
                {gr.g}
              </text>
            </g>
          );
        })}
      </svg></div>
      <p className="tfs-p2" style={{ marginBottom: 0 }}>
        认识截瘫者的人看到了<b>适应</b>：随着时间推移，截瘫者的注意力转向工作、阅读、朋友、新闻里的政治，大部分时间心情接近常人。不认识的人只能想象“一个正在想着自己瘫痪的人”——而那正是聚焦错觉。（例外是持续疼痛、持续噪音和严重抑郁：它们会不断把注意力拉回来，所以难以适应。）
      </p>
    </Card>
  );
}

function MarriageSketch() {
  const [wref, cw] = useWidth(540);
  const W = Math.max(300, cw),
    H = 190,
    L = 30,
    Rr = 16,
    T = 16,
    B = 34;
  const x = lin(-4, 4, L, W - Rr),
    y = lin(0, 1, H - B, T);
  const f = (t) => 0.35 + 0.5 * Math.exp(-((t - 0) ** 2) / 1.6);
  const d = [];
  for (let t = -4; t <= 4.001; t += 0.1) d.push(`${d.length ? "L" : "M"}${x(t).toFixed(1)},${y(f(t)).toFixed(1)}`);
  return (
    <Card title="结婚前后的生活满意度" tag="示意 · 书中图16的形状">
      <div ref={wref}><svg className="tfs-chart" style={{ maxWidth: W, margin: "0 auto" }} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="示意曲线：生活满意度在结婚当年前后升到顶峰，随后回落">
        <line x1={L} x2={W - Rr} y1={y(0)} y2={y(0)} stroke="var(--axis)" />
        {[-4, -2, 0, 2, 4].map((v) => (
          <text key={v} x={x(v)} y={H - 14} fontSize="11" textAnchor="middle" fill="var(--muted)">
            {v === 0 ? "结婚当年" : v > 0 ? `+${v} 年` : `${v} 年`}
          </text>
        ))}
        <line x1={x(0)} x2={x(0)} y1={T} y2={y(0)} stroke="var(--grid)" />
        <text x={L} y={12} fontSize="11" fill="var(--muted)">
          生活满意度（示意）
        </text>
        <path d={d.join(" ")} fill="none" stroke="var(--s1)" strokeWidth="2.5" />
      </svg></div>
      <p className="tfs-p2" style={{ marginBottom: 0 }}>
        常见解读是“新婚的快乐很快被适应”。卡尼曼提出另一种读法：被问到“你对生活整体满意吗”，人们并不真的盘点一生，而是用<strong>当下最容易想到的事</strong>来回答。临近婚礼时，想到的自然是婚姻；几年后，它不再是被问到时首先想起的事。这条曲线追踪的，可能更多是“婚姻在脑中的显著程度”，而不是幸福本身。
      </p>
    </Card>
  );
}

function VacationThought() {
  const [a, setA] = useState(null);
  const [b, setB] = useState(null);
  return (
    <Card title="两个思想实验：你是谁的代理人？" tag="自问">
      <p>
        <b>1.</b> 假期结束时，所有照片和视频都会被删除，你还会服下一片药，忘掉这次旅行的全部记忆。这会改变你的度假计划吗？
      </p>
      <div className="tfs-row">
        {["几乎不变", "明显改变，我可能不会去那么远、那么贵的地方"].map((o) => (
          <button key={o} className={cx("tfs-btn sm", a === o && "primary")} onClick={() => setA(o)}>
            {o}
          </button>
        ))}
      </div>
      <p style={{ marginTop: 14 }}>
        <b>2.</b> 你将接受一场痛苦的手术，全程清醒，会痛到尖叫、求医生停下。但术后你会得到一种药，彻底忘掉这段经历。你对这场手术有多在意？
      </p>
      <div className="tfs-row">
        {["非常在意", "不太在意，反正会忘"].map((o) => (
          <button key={o} className={cx("tfs-btn sm", b === o && "primary")} onClick={() => setB(o)}>
            {o}
          </button>
        ))}
      </div>
      {a && b && (
        <Callout type="insight" title="卡尼曼的非正式观察">
          <p style={{ margin: 0 }}>
            许多人说，失去记忆会让旅行的价值大打折扣——很多旅行是为了“收集记忆”；而对于会被遗忘的痛苦，许多人说自己并不在乎。卡尼曼说自己也有同感：“我就是我的记忆自我，而那个真正过日子的体验自我，对我来说像个陌生人。”这正是问题所在——我们通常站在记忆自我一边，替体验自我做决定。
          </p>
        </Callout>
      )}
    </Card>
  );
}

function Part5Section() {
  return (
    <div className="tfs-content">
      <SectionHead
        kicker="第五部分 · 第35–38章"
        title="两个自我"
        lead="谁在享受生活，谁在评价生活，谁在做决定？卡尼曼晚年的研究发现：体验此刻的“体验自我”与记录、讲故事、做选择的“记忆自我”常常意见不一，而后者总是握有决定权。"
        roots={["prototype", "coherence", "substitution"]}
      />
      <h2 className="tfs-h2">两种“效用”</h2>
      <p>
        边沁所说的效用是<b>体验</b>：快乐与痛苦。后来的经济学用同一个词指<b>想要</b>：决策中表现出来的偏好。只要人想要的正是自己会享受的，两者就一致；理性经济人的模型默认它们一致。卡尼曼早年设计过一个小问题：每天打一针很痛的针，从 20 针减到 18 针，与从 6 针减到 4 针，你愿意为哪个付更多？人们愿为后者付更多——可如果每一针一样痛，这两种减少避免的痛苦完全相同。决策效用与体验效用就此分道扬镳。
      </p>

      <h2 className="tfs-h2">峰终定律与过程忽视</h2>
      <ColonoscopyLab />
      <ColdHandLab />
      <Callout type="warn" title="记忆自我的暴政">
        <p>
          一位听众说，他听一张交响乐唱片，结尾有一道刮痕发出刺耳噪音，“毁了整个体验”。卡尼曼的回应是：被毁掉的不是体验——40 分钟的音乐已经享受过了——而是<strong>对体验的记忆</strong>。我们只能通过记忆保存生活，所以在思考人生时，唯一能采用的视角来自记忆自我；而记忆会系统性地扭曲体验：忽视时长、夸大峰值与结尾。
        </p>
      </Callout>

      <h2 className="tfs-h2">人生如故事</h2>
      <JaneLab />
      <p>
        我们关心一个人故事的完整性，有时胜过关心他的感受：一个人至死都相信妻子爱他，后来得知她多年来另有情人、只是为了钱——我们会为他难过，尽管他一生都过得很快乐。度假也一样：度假村卖的是“恢复元气”，旅游业卖的是“故事和记忆”。迪纳让学生在春假中写日记，发现他们是否愿意再来一次这样的假期，<b>完全取决于最终的整体评价</b>，而不取决于日记中记录的体验。
      </p>
      <VacationThought />

      <h2 className="tfs-h2">测量体验自我</h2>
      <p>
        传统的幸福调查问的是“总体而言，你对生活满意吗？”——那是在问记忆自我。卡尼曼转而去测体验自我：经验取样法（手机在随机时刻振动，问你此刻在做什么、感觉如何），以及更便宜的昨日重现法。它们揭示了一些令人不太舒服的事实：美国母亲陪伴孩子时的感受略不如做家务；法国女性陪孩子的时间更少，却更享受；看到老板是比孤独更糟糕的时刻。
      </p>
      <UIndexChart />
      <Callout type="insight" title="注意力是关键">
        <p>
          此刻的心情主要取决于此刻的处境，以及你是否在关注它。法国和美国女性吃饭时间差不多，但法国女性对吃的关注是美国女性的两倍，从中得到的快乐也更多。这给出了最朴素的幸福建议：<strong>重新分配时间</strong>——少花时间在不愉快的活动上，把被动休闲（看电视）换成主动休闲（社交、运动）。
        </p>
      </Callout>
      <Card flat title="钱能买到幸福吗？（含 2023 年的修正）" tag="更新">
        <p>
          书中结论：贫穷使人痛苦（头痛让收入前 2/3 的人中感到悲伤担忧者从 19% 升到 38%，让最穷 10% 的人从 38% 升到 70%）；收入提高生活满意度，但在高消费地区家庭年收入约 <b>7.5 万美元</b>之后，<b>情绪上的幸福不再上升</b>。
        </p>
        <p style={{ margin: 0 }}>
          2021 年，基林斯沃思用 3 万多人的实时体验数据发现，情绪幸福在 7.5 万美元之上仍然随收入上升。2023 年，他与卡尼曼、梅勒斯进行“对抗式合作”，结论是两边都对：对<b>最不快乐的约 20% 的人</b>，情绪幸福在约 10 万美元后趋平——钱能缓解的不幸有限，心碎、丧亲、抑郁买不走；而对其余大多数人，幸福感随收入持续上升。
        </p>
      </Card>

      <h2 className="tfs-h2">思考生活：满意度是一个替代出来的答案</h2>
      <p>
        施瓦茨请被试填写生活满意度问卷前先帮他复印一张纸，一半人会在复印机上“捡到”一枚一角硬币——这点小运气显著提高了他们对<strong>整个人生</strong>的满意度评分。被问到“你对生活满意吗”时，大多数人没有现成答案，于是用当下的心情和最容易想起的几件事来替代。
      </p>
      <MarriageSketch />
      <p>
        目标同样重要。一项追踪研究显示，18 岁时认为“变得富有”很重要的人，20 年后收入确实更高，而且收入对他们满意度的影响也大得多（高低收入者的满意度差距是不看重钱的人的四倍多）。设定难以实现的目标（比如“在表演艺术上功成名就”）的人，后来更不满意。这让卡尼曼修正了自己早先“只看体验自我”的立场：<strong>幸福必须同时考虑两个自我</strong>——忽视人们想要什么的幸福理论站不住，忽视人们实际过得怎样的理论也站不住。
      </p>

      <h2 className="tfs-h2">聚焦错觉</h2>
      <Quote cite="第38章，按英文原句直译（中译本此句有误）">当你想着某件事时，生活中没有什么事情像你想的那样重要。</Quote>
      <p>
        这句话来自一场家庭争论：卡尼曼的妻子认为加州人比东海岸的人更幸福。研究发现，加州学生确实更享受气候，但两地学生的生活满意度<b>没有差别</b>；而两地学生都预测加州人更幸福——他们都在思考时放大了气候。你的车能给你多少快乐？只有在你想到它时。刚搬到加州的人会说自己更快乐，因为被问到时，他们会想到搬家和天气。
      </p>
      <ParaplegicChart />
      <Callout type="c3" title="错误的想要（miswanting）">
        <p style={{ margin: 0 }}>
          吉尔伯特和威尔逊的术语。比较两个决定：买一辆舒适的新车，或加入一个每周聚会的读书会/网球队。起初两者都新鲜刺激，但你很快就不再注意车，而社交活动会不断重新吸引你的注意。聚焦错觉让我们高估那些“一开始很刺激、最终会被适应”的东西，低估那些能长期占据注意力的体验。
        </p>
      </Callout>

      <h2 className="tfs-h2">结语：三组区分再回顾</h2>
      <div className="tfs-grid3">
        <Card flat title="两个自我">
          <p className="tfs-small" style={{ margin: 0 }}>
            记忆自我的判断标准（峰终、忽视时长）不适合做决策，因为时间是有限的资源。幸福政策应同时关注两个自我——社会“痛苦总量”也许某天会像失业率一样进入国家统计。
          </p>
        </Card>
        <Card flat title="经济人与人类">
          <p className="tfs-small" style={{ margin: 0 }}>
            人类不是非理性的，但需要帮助。泰勒与桑斯坦的“自由家长主义”：设计好默认选项，不剥夺选择。“为明天储蓄更多”计划让员工承诺把未来加薪的一部分自动存入养老金——把损失变成“少得的收益”，利用系统2 的惰性，也不强迫任何人。
          </p>
        </Card>
        <Card flat title="两个系统">
          <p className="tfs-small" style={{ margin: 0 }}>
            系统1 是大多数错误的来源，也是我们大多数正确行为的来源。避免错误的原则很简单：认出雷区，慢下来，请系统2 出场。组织比个人更容易做到——因为它们天然更慢，也能建立规则。
          </p>
        </Card>
      </div>
      <Card flat title="饮水机旁可以这么说" tag="词汇">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>“你完全是用记忆自我在评价那段婚姻。结尾难听，不代表整首交响乐都糟糕。”</li>
          <li>“让幸福增加的最简单办法是管理时间：你能多花些时间做喜欢的事吗？”</li>
          <li>“买更大的房子未必让我们一直更快乐——小心聚焦错觉。”</li>
          <li>“他今早车坏了，今天不适合问他对工作满不满意。”</li>
        </ul>
      </Card>
    </div>
  );
}

/* ============================================================
   批判性阅读
   ============================================================ */
const REPL = [
  { s: "ok", t: "锚定效应", d: "Many Labs 1（2014，36 个样本）成功复制，效应量大。", ch: 11 },
  { s: "ok", t: "框架效应（亚洲疾病问题）", d: "Many Labs 1 成功复制。", ch: 34 },
  { s: "ok", t: "沉没成本", d: "Many Labs 1 成功复制。", ch: 32 },
  { s: "ok", t: "损失厌恶", d: "2024 年元分析（607 个估计）：λ ≈ 1.96。个别学者质疑其普遍性，但总体估计稳定。", ch: 26 },
  { s: "ok", t: "合取谬误、忽视基础比率", d: "被大量复现；改用频率格式、增加直接比较可显著减弱。", ch: "14–16" },
  { s: "ok", t: "规划谬误、外部视角", d: "弗林夫伯格等人积累了数千个项目的数据，参照类预测已被多国采用。", ch: 23 },
  { s: "ok", t: "小数定律、回归平均值", d: "这是数学事实，不是心理学发现；心理学部分（人们看不见它）同样稳健。", ch: "10, 17" },
  { s: "ok", t: "公式胜过临床直觉", d: "米尔之后的元分析（如 Grove 等，2000）延续了同一结论。", ch: 21 },
  { s: "mid", t: "峰终定律、过程忽视", d: "在多种情境中得到重复，但并非普适——某些任务中时长确实会被计入。", ch: 35 },
  { s: "mid", t: "禀赋效应", d: "效应稳健，但大小受实验程序影响（Plott & Zeiler 2005），交易经验可以消除——书中也提到了后者。", ch: 27 },
  { s: "mid", t: "热手谬误", d: "Miller & Sanjurjo（2018）指出原研究的方法有小样本偏差，纠正后原始数据显示出一定的“热手”。", ch: 10 },
  { s: "mid", t: "饥饿的法官", d: "案件并非随机排序（无律师代理的囚犯常排在每段最后）；模拟显示，合理的日程安排本身就能制造出类似曲线。", ch: 3 },
  { s: "mid", t: "棉花糖实验", d: "Watts 等（2018）的大样本概念复制：控制家庭背景后，与日后成就的关联大幅减弱。", ch: 3 },
  { s: "mid", t: "咬笔微笑（面部反馈）", d: "2016 年 17 个实验室未能复制；2022 年 Many Smiles（3878 人、19 国）：刻意做表情有效，咬笔法不确定。", ch: 4 },
  { s: "mid", t: "诚实盒上的眼睛", d: "对“人造注视”线索的元分析（Northover 等，2017）发现它不能普遍增加慷慨；诚实盒这类现场研究的重复结果不一。", ch: 4 },
  { s: "mid", t: "收入与情绪幸福（7.5 万美元）", d: "2023 年对抗式合作修正：只有最不快乐的约 20% 的人在约 10 万美元后趋平。", ch: 37 },
  { s: "bad", t: "“佛罗里达效应”（行为启动）", d: "Doyen 等（2012）用红外计时重复实验未能复制；只有当实验者知道假设时才出现。", ch: 4 },
  { s: "bad", t: "金钱启动", d: "Many Labs 1 中“货币启动”未能复制，另有多次大样本失败。", ch: 4 },
  { s: "bad", t: "麦克白效应", d: "Earp 等（2014）三次直接重复均失败。", ch: 4 },
  { s: "bad", t: "自我损耗与葡萄糖", d: "23 个实验室、2141 人的预注册重复：d = 0.04，置信区间包含 0。", ch: 3 },
  { s: "bad", t: "难读字体唤醒系统2", d: "Meyer、Frederick 等（2015）汇总 17 项研究：难读字体不提高 CRT 正确率。", ch: 5 },
];
const TRANSLATION_NOTES = [
  ["第1章", "系统1“完全处于自主控制状态”", "原文是 no sense of voluntary control，意思是“没有自主控制感”，恰好相反。"],
  ["第7章", "“有系统2参与时，我们几乎会相信所有事情”", "原意是：当系统2 忙于别的事情时（otherwise engaged），我们几乎什么都会信。"],
  ["第9章等", "“思维的发散性”", "原文 mental shotgun，直译“心理散弹枪”：想算一个量，会顺手算出一堆。"],
  ["第10章", "“他们写这篇文章得到了盖茨基金会17亿美元的赞助”", "原意是盖茨基金会为寻找/推广小规模学校投入了 17 亿美元，并非资助两位统计学家。"],
  ["第13、30章", "“效用层叠”", "原文 availability cascade，应为“可得性级联”，与“效用”无关。"],
  ["第14章起", "“典型性”", "representativeness，学界通常译“代表性（启发式）”。"],
  ["第16章", "“15个受试者中，只有3个人立刻作出反应”", "原文为 4 人（4 人立即、6 人从未出来、5 人很晚才出来），中译本同章后文也写作 4 人。"],
  ["第20章", "“对冲基金”", "原文 mutual funds，即共同基金。"],
  ["第22章", "“预认知决策模式”", "原文 recognition-primed decision model，通译“识别启动决策模型”。"],
  ["第33章", "偏好逆转“在19世纪70年代被首次提出”", "应为 20 世纪 70 年代（利希滕斯坦与斯洛维克，1971）。"],
  ["第35章编者注", "“作者因这个认知（峰终定律）获得诺贝尔奖”", "不准确。2002 年诺贝尔经济学奖表彰的是把心理学关于不确定条件下判断与决策的研究引入经济学（核心是前景理论与启发式研究）。"],
  ["第37章", "“晨间交流”“工作时交流”的 U 指数", "原文是 morning commute（早晨通勤）与 work（工作）。"],
  ["第38章", "“在你思索某件事时，这件事就不会像你想的那样重要了”", "原句：Nothing in life is as important as you think it is when you are thinking about it——当你想着某件事时，生活中没有什么像你想的那样重要。"],
];
const SOURCES = [
  ["Kahneman 2017 年回应：“I placed too much faith in underpowered studies”（Retraction Watch）", "https://retractionwatch.com/2017/02/20/placed-much-faith-underpowered-studies-nobel-prize-winner-admits-mistakes"],
  ["Schimmack, Heene & Kesavan (2017), Reconstruction of a Train Wreck（第4章引用研究的统计功效分析）", "https://replicationindex.com/2017/02/02/reconstruction-of-a-train-wreck-how-priming-research-went-of-the-rails/"],
  ["Klein et al. (2014), Many Labs 1, Social Psychology", "https://econtent.hogrefe.com/doi/10.1027/1864-9335/a000178"],
  ["Hagger et al. (2016), A Multilab Preregistered Replication of the Ego-Depletion Effect", "https://journals.sagepub.com/doi/10.1177/1745691616652873"],
  ["Doyen et al. (2012), Behavioral Priming: It's All in the Mind, but Whose Mind? PLOS ONE", "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0029081"],
  ["Meyer, Frederick et al. (2015), Disfluent Fonts Don't Help People Solve Math Problems", "https://pubmed.ncbi.nlm.nih.gov/25844628/"],
  ["Miller & Sanjurjo (2018), Surprised by the Hot Hand Fallacy? Econometrica", "https://onlinelibrary.wiley.com/doi/abs/10.3982/ECTA14943"],
  ["Weinshall-Margel & Shapard (2011), Overlooked factors in the analysis of parole decisions, PNAS", "https://www.pnas.org/doi/10.1073/pnas.1110910108"],
  ["Watts, Duncan & Quan (2018), Revisiting the Marshmallow Test, Psychological Science", "https://journals.sagepub.com/doi/abs/10.1177/0956797618761661"],
  ["Coles et al. (2022), A multi-lab test of the facial feedback hypothesis, Nature Human Behaviour", "https://www.nature.com/articles/s41562-022-01458-9"],
  ["Brown, Imai, Vieider & Camerer (2024), Meta-analysis of Empirical Estimates of Loss Aversion, JEL", "https://www.aeaweb.org/articles?id=10.1257/jel.20221698"],
  ["Killingsworth, Kahneman & Mellers (2023), Income and emotional well-being: A conflict resolved, PNAS", "https://www.pnas.org/doi/10.1073/pnas.2208661120"],
];
function CritiqueSection() {
  const [f, setF] = useState("all");
  const lab = { ok: ["稳健", "c3"], mid: ["有争议 / 被修正", "warn"], bad: ["未能复制", "bad"] };
  const rows = REPL.filter((r) => f === "all" || r.s === f);
  return (
    <div className="tfs-content">
      <SectionHead
        kicker="延伸 · 批判性阅读"
        title="十几年后，哪些结论经受住了时间？"
        lead="《思考，快与慢》出版于 2011 年，恰好赶在心理学“重复危机”之前。深刻理解这本书，必须知道它哪些地方站得稳、哪些地方已经塌了——而且，用这本书自己的方法去检验它。"
      />
      <Callout type="insight" title="最有力的批评，来自本书第10章">
        <p>
          卡尼曼和特沃斯基合作的第一篇论文，就是批评心理学家“相信小数定律”：样本太小、统计功效太低，却对结果深信不疑。2017 年，研究者分析了第4章引用的启动研究：12 篇文章中 11 篇的“可重复性指数”低于 50%，31 项研究 100% 显著，平均统计功效却只有约 57%——这在统计上几乎不可能，除非存在发表偏倚。卡尼曼公开回应：“我过于相信样本量不足的研究了……本章观点的实验证据比我以为的弱得多。”
        </p>
        <p style={{ margin: 0 }}>
          这件事本身就是全书最好的注脚：<b>知道偏差并不能让你免疫</b>，一位毕生研究小样本错觉的学者也会栽在同一个坑里。
        </p>
      </Callout>
      <div className="tfs-chips">
        {[
          ["all", "全部"],
          ["ok", "稳健"],
          ["mid", "有争议 / 被修正"],
          ["bad", "未能复制"],
        ].map(([k, t]) => (
          <button key={k} className={cx("tfs-chip", f === k && "on")} onClick={() => setF(k)}>
            {t}
          </button>
        ))}
      </div>
      <DataTable
        columns={[{ label: "状态" }, { label: "结论" }, { label: "证据" }, { label: "章" }]}
        rows={rows.map((r) => [<span className={cx("tfs-tag", lab[r.s][1])}>{lab[r.s][0]}</span>, <b>{r.t}</b>, r.d, r.ch])}
      />
      <h2 className="tfs-h2">一个经验法则：越“离意识远”的效应，越要怀疑</h2>
      <p>
        看看哪些结论站住了：它们大多是<strong>关于判断与选择的结构性现象</strong>（锚定、框架、损失厌恶、基础比率、回归），可以用简单问卷在大样本中反复测量，效应往往很大。塌掉的大多是<strong>“一个微小的无意识刺激改变复杂行为”</strong>类的研究（看到钱就更自私、读到老人就走得慢），效应小、样本小、测量噪音大。这恰好对应了第10章的教训，也对应了卡尼曼自己的建议：用<em>外部视角</em>看待任何一项单独的研究——同类研究的重复成功率是多少？
      </p>
      <h2 className="tfs-h2">另一种批评：偏差，还是适应？</h2>
      <p>
        以吉仁泽为代表的学者认为，“启发式与偏差”研究过于强调人类的错误：许多所谓的偏差在自然环境（尤其是用频率而非概率呈现信息时）中会减弱甚至消失，简单的启发式在不确定的真实世界里往往比复杂计算更好（“生态理性”）。卡尼曼在书中的回应分散在各章：他承认频率格式能减少合取谬误，也承认专家直觉在规律环境中可靠（第22章）；但他坚持，<strong>当直觉与逻辑直接冲突而直觉获胜时</strong>（琳达问题在直接比较时仍有大量错误），这就是一个需要解释的系统性偏差。两种视角其实互补：一个告诉你规则何时有效，一个告诉你规则何时失效。
      </p>
      <Callout type="plain" title="关于“两个系统”这个框架本身">
        <p className="tfs-small" style={{ margin: 0 }}>
          也有学者批评二分法过于简单：心理过程的“自动/受控、快/慢、有意识/无意识”等特征并不总是成对出现。卡尼曼自己在书中反复声明，两个系统是方便思考的“虚构角色”，不是脑区。把它当作一种<b>描述语言</b>而非<b>神经理论</b>，就不会被这个批评困扰。
        </p>
      </Callout>
      <h2 className="tfs-h2">读中译本时的几个坑</h2>
      <p className="tfs-p2">通读中信版译文时，注意到以下几处与原意不符或容易误导的地方（按章节顺序）：</p>
      <DataTable columns={[{ label: "位置" }, { label: "中译本" }, { label: "应理解为" }]} rows={TRANSLATION_NOTES} />
      <h2 className="tfs-h2">延伸阅读</h2>
      <div className="tfs-grid2">
        <Card flat title="《噪声》Noise（2021）">
          <p className="tfs-small" style={{ margin: 0 }}>卡尼曼、西博尼、桑斯坦。本书讲“偏差”（系统性的偏离），它讲“噪声”（同一判断的随机分散），第21章的思想在此展开。</p>
        </Card>
        <Card flat title="《助推》Nudge（2008）">
          <p className="tfs-small" style={{ margin: 0 }}>泰勒、桑斯坦。第四部分与结语的政策延伸：默认选项、选择架构、自由家长主义。</p>
        </Card>
        <Card flat title="《超预测》Superforecasting（2015）">
          <p className="tfs-small" style={{ margin: 0 }}>泰特罗克、加德纳。第20章“专家预测”的续篇：什么样的人、什么样的训练能把预测做得更好。</p>
        </Card>
        <Card flat title="《思维的发现》The Undoing Project（2016）">
          <p className="tfs-small" style={{ margin: 0 }}>迈克尔·刘易斯。卡尼曼与特沃斯基的合作与友谊，读完会更懂序言里那段回忆。</p>
        </Card>
      </div>
      <h3 className="tfs-h3">来源</h3>
      <ul className="tfs-small" style={{ paddingLeft: 18 }}>
        {SOURCES.map(([t, u]) => (
          <li key={u}>
            <a href={u} target="_blank" rel="noreferrer">
              {t}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   工具箱
   ============================================================ */
const CHECK = [
  ["我在回答哪个问题？", ["我是不是把难题换成了一个容易的问题（替代）？", "我的信心来自证据的数量和质量，还是来自故事的连贯？", "如果还缺一条关键信息，最可能是什么？（WYSIATI）"]],
  ["数字与概率", ["这类事情的基础比率 / 参照类是什么？", "眼前哪个数字可能是锚？如果它是相反的数字，我会怎么估？", "样本有多大？这会不会只是运气，或者只是回归平均值？"]],
  ["框架与偏好", ["换一个框架（得↔失、存活↔死亡、按每公里耗油），我的选择会变吗？", "我是在单独看这一次，还是可以把它当作一组重复决策的一部分（宽框架、风险政策）？", "如果我从未拥有它 / 从未投入过，现在还会选它吗？（禀赋、沉没成本）"]],
  ["人与组织", ["每个人的意见是在讨论前独立写下的吗？", "我们做过事前验尸吗？", "事后我会按决策过程、还是按结果来评价这个决定？"]],
];
function DecisionChecklist() {
  const [c, setC] = useState({});
  const total = CHECK.reduce((s, [, xs]) => s + xs.length, 0);
  const done = Object.values(c).filter(Boolean).length;
  return (
    <Card title="决策前检查单：12 个问题" tag="工具 1">
      <p className="tfs-small">不必每次都用。当决策重要、不可逆、或你感觉“非常确定”时，用它请系统2 出场。（已勾选 {done} / {total}）</p>
      {CHECK.map(([g, xs], gi) => (
        <div key={g} style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>{g}</div>
          {xs.map((x, i) => {
            const k = gi + "-" + i;
            return (
              <label key={k} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "5px 0", cursor: "pointer" }}>
                <input type="checkbox" checked={!!c[k]} onChange={() => setC({ ...c, [k]: !c[k] })} style={{ marginTop: 6, accentColor: "var(--s2)" }} />
                <span style={{ textDecoration: c[k] ? "line-through" : "none", color: c[k] ? "var(--muted)" : "var(--ink)" }}>{x}</span>
              </label>
            );
          })}
        </div>
      ))}
    </Card>
  );
}
function OutsideViewCalc() {
  const [est, setEst] = useState(12);
  const [ratio, setRatio] = useState(1.5);
  const [fail, setFail] = useState(20);
  const [adj, setAdj] = useState(0);
  const base = est * ratio;
  const fin = base * (1 + adj / 100);
  return (
    <Card title="外部视角计算器（参照类预测）" tag="工具 2">
      <p className="tfs-small">
        以工期为例（也可以换成预算）。第23章的教材项目：内部估计约 2 年；参照类显示 40% 从未完成，完成的都用了 7–10 年。
      </p>
      <div className="tfs-grid2">
        <Slider label="你的内部估计（月）" value={est} min={1} max={60} onChange={setEst} />
        <Slider label="参照类：实际 ÷ 计划 的典型倍数" value={ratio} min={1} max={4} step={0.1} format={(v) => `× ${v.toFixed(1)}`} onChange={setRatio} />
        <Slider label="参照类：从未完成的比例" value={fail} min={0} max={80} format={(v) => `${v}%`} onChange={setFail} />
        <Slider label="本项目有具体理由比同类更好（−）或更差（+）" value={adj} min={-30} max={30} step={5} format={(v) => `${v > 0 ? "+" : ""}${v}%`} onChange={setAdj} />
      </div>
      <div className="tfs-grid3" style={{ marginTop: 10 }}>
        <Stat v={`${est} 个月`} l="内部视角" />
        <Stat v={`${base.toFixed(1)} 个月`} l="外部视角基准" />
        <Stat v={`${fin.toFixed(1)} 个月`} l={`调整后预测（另有 ${fail}% 可能根本完不成）`} />
      </div>
      <p className="tfs-small" style={{ marginTop: 10, marginBottom: 0 }}>
        提醒：调整幅度要克制，而且只能基于“本项目确实与众不同”的具体证据——“我们团队很强”几乎每个团队都这么想。
      </p>
    </Card>
  );
}
function PremortemTool() {
  const [name, setName] = useState("");
  const [why, setWhy] = useState("");
  const [fix, setFix] = useState("");
  const [copied, setCopied] = useState(false);
  const text = `【事前验尸】${name || "（决策名称）"}\n假设：一年后我们执行了这个计划，结果是一场灾难。\n\n失败的历史：\n${why || "（每人独立写 5–10 分钟）"}\n\n现在就能做的预防：\n${fix || "（针对最可能、最致命的原因）"}`;
  const copy = () => {
    try {
      navigator.clipboard.writeText(text).then(() => setCopied(true), () => setCopied(false));
    } catch (e) {
      setCopied(false);
    }
  };
  return (
    <Card title="事前验尸模板" tag="工具 3">
      <p className="tfs-small">在决策即将拍板、尚未正式下达时使用。关键是<b>先各自独立写</b>，再汇总——这让怀疑成为“完成任务”而不是“不忠诚”。</p>
      <input className="tfs-input" style={{ width: "100%", marginBottom: 10 }} placeholder="决策名称，例如：明年进入东南亚市场" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea className="tfs-textarea" placeholder="想象一年后它彻底失败了。写下这场失败的历史：发生了什么？为什么？" value={why} onChange={(e) => setWhy(e.target.value)} />
      <textarea className="tfs-textarea" style={{ marginTop: 10 }} placeholder="针对最可能、最致命的原因，我们现在能做什么？" value={fix} onChange={(e) => setFix(e.target.value)} />
      <div className="tfs-row" style={{ marginTop: 10 }}>
        <button className="tfs-btn sm" onClick={copy}>
          复制为文本
        </button>
        {copied && <span className="c3t">已复制</span>}
      </div>
    </Card>
  );
}
function InterviewScorer() {
  const [traits, setTraits] = useState(["专业技能", "责任心", "沟通能力", "学习能力", "抗压与稳定", "合作精神"]);
  const [sc, setSc] = useState({});
  const [intu, setIntu] = useState(0);
  const [nm, setNm] = useState("");
  const [list, setList] = useState([]);
  const filled = traits.every((_, i) => sc[i]);
  const traitMean = filled ? mean(traits.map((_, i) => sc[i])) : 0;
  const final = filled && intu ? (traitMean + intu) / 2 : null;
  const save = () => {
    setList([...list, { nm: nm || `候选人 ${list.length + 1}`, traitMean, intu, final }].sort((a, b) => b.final - a.final));
    setSc({});
    setIntu(0);
    setNm("");
  };
  return (
    <Card title="结构化面试打分表（卡尼曼的“闭眼”法）" tag="工具 4">
      <p className="tfs-small">
        规则：① 事先选好约 6 个相互独立的特质（可修改名称）；② 用关于<b>过去事实</b>的问题逐项打分（1–5），打完一项再问下一项，以隔绝光环效应；③ 全部打完后，闭上眼睛给一个整体直觉分；④ 最终分 = 特质均分与直觉分各占一半；⑤ 录用得分最高的人，别给自己制造“断腿”例外。
      </p>
      <input className="tfs-input" style={{ width: 220, marginBottom: 8 }} placeholder="候选人姓名" value={nm} onChange={(e) => setNm(e.target.value)} />
      {traits.map((t, i) => (
        <div key={i} className="tfs-row" style={{ margin: "5px 0" }}>
          <input className="tfs-input" style={{ width: 130 }} value={t} aria-label={`特质 ${i + 1} 名称`} onChange={(e) => setTraits(traits.map((x, j) => (j === i ? e.target.value : x)))} />
          {[1, 2, 3, 4, 5].map((v) => (
            <button key={v} className={cx("tfs-btn sm", sc[i] === v && "primary")} onClick={() => setSc({ ...sc, [i]: v })} disabled={i > 0 && !sc[i - 1] && !sc[i]}>
              {v}
            </button>
          ))}
        </div>
      ))}
      <div className="tfs-row" style={{ margin: "10px 0 5px" }}>
        <span style={{ width: 130, fontWeight: 600 }}>闭眼直觉分</span>
        {[1, 2, 3, 4, 5].map((v) => (
          <button key={v} className={cx("tfs-btn sm", intu === v && "primary")} disabled={!filled} onClick={() => setIntu(v)}>
            {v}
          </button>
        ))}
      </div>
      <p style={{ margin: "8px 0" }}>
        {final ? (
          <span>
            特质均分 <b>{traitMean.toFixed(2)}</b> · 直觉 <b>{intu}</b> · 最终 <b className="s2t">{final.toFixed(2)}</b>
          </span>
        ) : (
          <span className="tfs-small">按顺序完成所有特质后，才能给直觉分。</span>
        )}
      </p>
      <button className="tfs-btn primary sm" disabled={!final} onClick={save}>
        保存并评下一位
      </button>
      {list.length > 0 && (
        <DataTable
          columns={[{ label: "排名" }, { label: "候选人" }, { label: "特质均分", num: true }, { label: "直觉", num: true }, { label: "最终", num: true }]}
          rows={list.map((r, i) => [i + 1, r.nm, r.traitMean.toFixed(2), r.intu, <b>{r.final.toFixed(2)}</b>])}
        />
      )}
    </Card>
  );
}
function ToolkitSection() {
  const { go } = useContext(NavCtx);
  return (
    <div className="tfs-content">
      <SectionHead kicker="延伸 · 工具箱" title="把书变成习惯" lead="卡尼曼说，他研究了几十年，自己的直觉并没有变好多少；进步的是识别“雷区”的能力。这些工具就是雷区旁边的路标——而且大多在组织里比在个人身上更好用。" />
      <DecisionChecklist />
      <OutsideViewCalc />
      <PremortemTool />
      <InterviewScorer />
      <Card flat title="导读中其他可以当工具用的部件" tag="索引">
        <div className="tfs-row">
          <button className="tfs-btn sm" onClick={() => go("p2")}>
            贝叶斯计算器、四步修正预测 →
          </button>
          <button className="tfs-btn sm" onClick={() => go("p3")}>
            相关系数翻译器、直觉可信度地图 →
          </button>
          <button className="tfs-btn sm" onClick={() => go("p4")}>
            价值函数、萨缪尔森硬币 →
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   词汇表
   ============================================================ */
const GLOSSARY = [
  ["系统1", "System 1", "自动、快速、几乎不费力、没有自主控制感的思维过程。", 1, "p1"],
  ["系统2", "System 2", "需要注意力、缓慢、费力、按规则运作的思维过程；负责自我控制。", 1, "p1"],
  ["最省力法则", "law of least effort", "达成同一目标有多条路径时，人会选最省力的那条，认知活动也一样。", 2, "p1"],
  ["认知放松", "cognitive ease", "系统1 监测的“一切顺利”信号；它让人觉得熟悉、真实、愉快，也让人放松警惕。", 5, "p1"],
  ["曝光效应", "mere exposure effect", "反复接触一个无害的刺激，会增加对它的好感（又称多看效应）。", 5, "p1"],
  ["启动效应", "priming", "先前被激活的观念影响随后的认知。词汇层面稳健，行为层面多数未能复制。", 4, "p1"],
  ["联想连贯", "associative coherence", "被激活的观念、情绪与身体反应相互强化，形成一个自洽的整体。", 4, "p1"],
  ["常态理论", "norm theory", "系统1 维护关于“什么是正常”的模型，并据此判断什么是意外。", 6, "p1"],
  ["光环效应", "halo effect", "对一个人（或事物）的整体好恶，扩散到对其所有属性的判断上。", 7, "p1"],
  ["确认偏误", "confirmation bias", "倾向于寻找、回忆与当前假设一致的证据。", 7, "p1"],
  ["眼见即为事实", "WYSIATI", "What You See Is All There Is：只用手头的信息编故事，对缺失的信息不敏感。", 7, "p1"],
  ["基本评估", "basic assessments", "系统1 持续自动进行的评估：威胁、好坏、相似、平均等。", 8, "p1"],
  ["强度匹配", "intensity matching", "把一个维度上的强度直接平移到另一个维度（如把对海豚的难过换算成捐款额）。", 8, "p1"],
  ["心理散弹枪", "mental shotgun", "想计算一个量时，系统1 会顺手算出许多别的量。中译本作“思维的发散性”。", 8, "p1"],
  ["替代", "substitution", "用一个容易问题（启发式问题）的答案回答一个困难问题（目标问题），且通常察觉不到。", 9, "p1"],
  ["情感启发式", "affect heuristic", "用“我对它的感觉”代替“我对它的评价”：喜欢的东西显得收益高、风险低。", 9, "p1"],
  ["小数定律", "law of small numbers", "误以为小样本也能很好地代表总体。", 10, "p2"],
  ["锚定效应", "anchoring effect", "估计被事先接触的数字拉向它，即使那个数字明显无关。", 11, "p2"],
  ["锚定指数", "anchoring index", "两组平均估计之差 ÷ 两个锚之差，衡量锚的影响力。", 11, "p2"],
  ["可得性启发法", "availability heuristic", "用“想起例子有多容易”来判断频率或概率。", 12, "p2"],
  ["可得性级联", "availability cascade", "媒体报道与公众焦虑相互放大的自我强化过程。中译本误作“效用层叠”。", 13, "p2"],
  ["概率忽视", "probability neglect", "对小风险要么完全忽视、要么过度重视，缺少中间地带。", 13, "p2"],
  ["代表性启发法", "representativeness", "用“像不像某类的典型”代替“属于该类的概率”。中译本作“典型性”。", 14, "p2"],
  ["基础比率", "base rate", "某类事件在总体中的比例。统计型基础比率常被忽略，因果型则会被使用。", 14, "p2"],
  ["合取谬误", "conjunction fallacy", "认为两个事件同时发生比其中一个单独发生更可能（琳达问题）。", 15, "p2"],
  ["少即是多", "less is more", "去掉一些有价值的部分，反而让整体评价更高——因为系统1 取平均而非加总。", 15, "p2"],
  ["回归平均值", "regression to the mean", "两个量相关不完美时，一次极端的表现之后通常更接近平均。", 17, "p2"],
  ["叙事谬误", "narrative fallacy", "用简单连贯的因果故事解释过去，忽略运气与未发生的事。", 19, "p3"],
  ["后见之明偏差", "hindsight bias", "知道结果后，高估自己当初对结果的预见程度。", 19, "p3"],
  ["结果偏差", "outcome bias", "按结果而非决策过程的质量来评价决策。", 19, "p3"],
  ["有效性错觉", "illusion of validity", "明知预测方法整体无效，仍对每个具体预测充满信心。", 20, "p3"],
  ["技能错觉", "illusion of skill", "把以运气为主的活动（如选股）当成技能活动。", 20, "p3"],
  ["断腿原则", "broken-leg rule", "只有在出现罕见而决定性的信息时，才推翻公式的结论。", 21, "p3"],
  ["识别启动决策", "recognition-primed decision", "克莱因的模型：专家先“识别”出一个方案，再在脑中模拟检验。中译本作“预认知决策模式”。", 22, "p3"],
  ["规划谬误", "planning fallacy", "计划与预测过于接近最理想情景，且本可通过参考同类案例改进。", 23, "p3"],
  ["内部视角 / 外部视角", "inside / outside view", "从本案细节往外推 vs 从同类案例的统计分布出发。中译本作“内部意见 / 外部意见”。", 23, "p3"],
  ["参照类预测", "reference class forecasting", "找参照类、取其分布作基准、再有限调整的预测方法。", 23, "p3"],
  ["事前验尸", "premortem", "决策前假设它已失败，让每个人写下失败的原因。", 24, "p3"],
  ["竞争忽视", "competition neglect", "只考虑自己的能力与计划，忽视竞争者也在做同样的事。", 24, "p3"],
  ["理论诱导的盲区", "theory-induced blindness", "一旦接受某个理论，就很难注意到它的缺陷。", 25, "p4"],
  ["前景理论", "prospect theory", "以参照点、敏感度递减、损失厌恶和决策权重描述风险选择的理论（1979）。", 26, "p4"],
  ["参照点", "reference point", "评价得失的基准：通常是现状，也可以是期望、目标或“应得的”。", 26, "p4"],
  ["损失厌恶", "loss aversion", "同等大小的损失比收益给人的感受更强，系数约为 2。", 26, "p4"],
  ["禀赋效应", "endowment effect", "拥有一件东西后，对它的估价显著高于拥有之前。", 27, "p4"],
  ["可能性效应", "possibility effect", "从不可能到有可能的变化被过度重视，使小概率被高估。", 29, "p4"],
  ["确定性效应", "certainty effect", "从几乎确定到确定的变化被过度重视，使大概率被打折。", 29, "p4"],
  ["决策权重", "decision weights", "人们在选择中实际赋予各结果的权重，不等于概率。", 29, "p4"],
  ["四重模式", "fourfold pattern", "收益/损失 × 高/低概率，四种情形下风险态度交替变化。", 29, "p4"],
  ["分母忽视", "denominator neglect", "关注“能赢的有几个”，忽视“总共有几个”。", 30, "p4"],
  ["窄框架 / 宽框架", "narrow / broad framing", "把决策逐个孤立地看 vs 把它们当作一个整体组合来看。", 31, "p4"],
  ["风险政策", "risk policy", "把一类反复出现的决策变成一条规则，如“总选最高免赔额”。", 31, "p4"],
  ["心理账户", "mental accounting", "人们在心里把钱分到不同账户，并不愿以亏损“关账”。", 32, "p4"],
  ["处置效应", "disposition effect", "倾向于卖出盈利的资产、继续持有亏损的资产。", 32, "p4"],
  ["沉没成本谬误", "sunk-cost fallacy", "因为已经投入而继续投入，即使有更好的选择。中译本作“沉没成本悖论”。", 32, "p4"],
  ["禁忌权衡", "taboo tradeoff", "拒绝任何以增加风险换取金钱的交易，即使资源有限。", 32, "p4"],
  ["偏好逆转", "preference reversal", "单独评估与联合评估（或选择与定价）得出相反的偏好。", 33, "p4"],
  ["可评估性假设", "evaluability hypothesis", "某些属性单独看时无法评价，只有在比较中才显出意义。", 33, "p4"],
  ["框架效应", "framing effect", "逻辑上等价的不同表述导致不同的选择。", 34, "p4"],
  ["选择架构 / 助推", "choice architecture / nudge", "通过设计选项呈现方式（尤其默认选项）引导选择，而不限制自由。", 34, "p4"],
  ["体验效用 / 决策效用", "experienced / decision utility", "实际感受到的快乐痛苦 vs 选择中表现出的“想要”。", 35, "p5"],
  ["峰终定律", "peak-end rule", "对一段经历的回顾评价约等于最强烈时刻与结束时刻的平均。", 35, "p5"],
  ["过程忽视", "duration neglect", "回顾评价几乎不受经历持续时间的影响。", 35, "p5"],
  ["体验自我 / 记忆自我", "experiencing / remembering self", "活在当下的自我 vs 记录、讲故事、做决定的自我。中译本作“经验自我”。", 35, "p5"],
  ["U 指数", "U-index", "一天中处于不愉快状态的时间比例。", 37, "p5"],
  ["昨日重现法", "Day Reconstruction Method", "回忆并逐段评价前一天各片段的感受，以近似经验取样。", 37, "p5"],
  ["聚焦错觉", "focusing illusion", "当你想着某件事时，会高估它对幸福的影响。", 38, "p5"],
  ["情感预测", "affective forecasting", "预测未来某事会让自己有何感受；常高估强度与持续时间。", 38, "p5"],
  ["错误的想要", "miswanting", "因情感预测错误而想要了不会让自己更幸福的东西。", 38, "p5"],
  ["自由家长主义", "libertarian paternalism", "在保留选择自由的前提下，通过设计默认选项帮助人们做更好的决定。", "结语", "p5"],
];
function GlossarySection() {
  const [q, setQ] = useState("");
  const [p, setP] = useState("all");
  const rows = GLOSSARY.filter((g) => (p === "all" || g[4] === p) && (q === "" || (g[0] + g[1] + g[2]).toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="tfs-content">
      <SectionHead kicker="延伸 · 饮水机旁词汇表" title="一套更精确的语言" lead="卡尼曼写这本书的目的，就是丰富人们谈论判断与决策的词汇。医生能诊断，是因为有疾病的名字；你能识别偏差，也需要先有它的名字。" />
      <div className="tfs-row" style={{ marginBottom: 8 }}>
        <input className="tfs-input" style={{ width: 240 }} placeholder="搜索中文、英文或释义" value={q} onChange={(e) => setQ(e.target.value)} aria-label="搜索词汇" />
        <span className="tfs-small">共 {rows.length} 条</span>
      </div>
      <div className="tfs-chips">
        {[["all", "全部"], ...PARTS.map((x) => [x.id, `第${x.n}部分`])].map(([k, t]) => (
          <button key={k} className={cx("tfs-chip", p === k && "on")} onClick={() => setP(k)}>
            {t}
          </button>
        ))}
      </div>
      <DataTable columns={[{ label: "术语" }, { label: "英文" }, { label: "一句话" }, { label: "章" }]} rows={rows.map((g) => [<b>{g[0]}</b>, <span className="tfs-small">{g[1]}</span>, g[2], g[3]])} />
    </div>
  );
}

/* ============================================================
   结业自测
   ============================================================ */
const QUIZ = [
  { q: "一位基金经理连续三年跑赢大盘，董事会决定把更多资金交给他。最需要警惕的是什么？", o: ["锚定效应", "把运气当技能，忽视回归平均值", "禀赋效应", "峰终定律"], a: 1, e: "基金业绩的年际相关接近零（第20章），连续几年的好成绩很可能主要来自运气，接下来会回归平均。" },
  { q: "谈判中，对方先抛出一个高得离谱的报价。按卡尼曼的建议，你最好怎么做？", o: ["还一个同样离谱的低价", "明确表示以此为基础无法谈下去，并主动思考对方的底线", "按对方报价打个八折", "先接受再说"], a: 1, e: "任何公开出现的数字都会成为锚。用离谱的还价回应会让差距更难弥合；把注意力转向“反方向的理由”能削弱锚定（第11章）。" },
  { q: "同一个手术，“一个月存活率 90%”比“一个月死亡率 10%”让更多医生选择手术。这说明了什么？", o: ["医生不懂统计", "框架效应：偏好附着于描述而非实质", "确定性效应", "禀赋效应"], a: 1, e: "两种说法逻辑等价，却分别激起正面与负面联想（第34章）。医学训练也挡不住。" },
  { q: "看到连续几则空难新闻后，你决定改坐火车。这主要是哪种机制？", o: ["可得性：用“容易想起”代替“有多常见”", "回归平均值", "合取谬误", "心理账户"], a: 0, e: "生动、近期、被大量报道的事件更容易被想起，于是被判断为更常见（第12–13章）。" },
  { q: "一个已经花了 5000 万的项目需要再投 6000 万才能完成，而同样的钱投到新项目回报更高。继续投入最可能是出于？", o: ["外部视角", "沉没成本与不愿以亏损关闭心理账户", "风险政策", "可能性效应"], a: 1, e: "理性决策只看未来的回报；已花的钱是沉没成本。对负责该项目的高管而言，还掺杂着代理问题（第32章）。" },
  { q: "一趟旅行 9 天都很愉快，最后一天航班取消、狼狈不堪。回来后你觉得“这趟旅行挺糟的”。这是？", o: ["峰终定律与过程忽视", "损失厌恶", "代表性启发法", "竞争忽视"], a: 0, e: "记忆自我主要记住峰值与结尾，持续时长几乎不计入（第35–36章）。" },
  { q: "一位创业者说：“我们成功的概率至少 90%。”你首先该问什么？", o: ["你们的产品有多好？", "这个行业类似创业公司的存活率是多少？", "你们团队多努力？", "你的直觉准吗？"], a: 1, e: "先找参照类与基础比率（外部视角），再根据具体信息有限调整（第23–24章）。" },
  { q: "“她是银行职员，并且是环保志愿者”被判断为比“她是银行职员”更可能。这是？", o: ["合取谬误", "锚定效应", "分母忽视", "后见之明"], a: 0, e: "子集的概率不可能大于全集。更具体、更连贯的故事显得更可信，却更不可能（第15章）。" },
  { q: "面试官被候选人开场几分钟的出色表现打动，之后对其模棱两可的回答都往好处想。这是？", o: ["光环效应", "处置效应", "回归平均值", "确定性效应"], a: 0, e: "第一印象决定了对后续歧义信息的解读（第7章）。解决办法是逐项、独立地打分（第21章）。" },
  { q: "投资者需要用钱时，倾向于卖掉赚钱的股票、留下亏钱的股票。这是？", o: ["处置效应", "禀赋效应", "规划谬误", "可得性级联"], a: 0, e: "以盈利关闭一个心理账户感觉很好；但从税收与动量看，卖亏损股通常更优（第32章）。" },
  { q: "某县的某种癌症发病率全国最高，且是个人口很少的小县。最合理的第一反应是？", o: ["赶紧调查当地污染", "小样本天然更容易出现极端值，先看它是否只是波动", "当地人生活方式不健康", "当地人生活方式很健康"], a: 1, e: "发病率最高和最低的县往往都是人口少的县——没有原因需要解释（第10章）。" },
  { q: "根据卡尼曼与克莱因的共识，什么时候可以相信一位专家的直觉？", o: ["当专家非常自信时", "当专家资历很深时", "当环境足够有规律，且专家有长期练习和及时反馈时", "当直觉与数据一致时"], a: 2, e: "主观自信不是准确性的指标；要看环境的规律性与学习机会（第22章）。" },
];
function QuizSection() {
  const [ans, setAns] = useState({});
  const [round, setRound] = useState(0);
  const done = Object.keys(ans).length === QUIZ.length;
  const score = QUIZ.filter((q, i) => ans[i] === q.a).length;
  return (
    <div className="tfs-content">
      <SectionHead kicker="延伸 · 结业自测" title="12 个日常场景，认出其中的机制" lead="每题选一个答案，选完立即看到解析。这些场景都来自书中的例子或它们的日常变体。" />
      {QUIZ.map((q, i) => (
        <Card key={round + "-" + i} flat title={`${i + 1}. ${q.q}`}>
          <Choice options={q.o.map((o, k) => ({ id: k, label: o }))} value={ans[i]} onChange={(k) => setAns({ ...ans, [i]: k })} reveal={ans[i] !== undefined} correct={q.a} />
          {ans[i] !== undefined && (
            <p className="tfs-reveal tfs-p2" style={{ margin: "6px 0 0" }}>
              <b className={ans[i] === q.a ? "c3t" : "badt"}>{ans[i] === q.a ? "答对了。" : "再想想。"}</b> {q.e}
            </p>
          )}
        </Card>
      ))}
      {done && (
        <Card title="你的结果" tag="完成">
          <div className="tfs-row" style={{ alignItems: "center", gap: 20 }}>
            <div className="tfs-score">
              {score}
              <span style={{ fontSize: 20, color: "var(--muted)" }}> / {QUIZ.length}</span>
            </div>
            <p style={{ margin: 0, flex: 1, minWidth: 220 }}>
              {score >= 10 ? "你已经能在“饮水机旁”熟练地给偏差命名了。下一步：在自己的决定里认出它们——这要难得多。" : score >= 7 ? "大部分机制已经掌握。回到做错的题目对应的章节，再做一遍那里的实验。" : "建议回到“总纲”，从六个根重新梳理一遍，再来测试。"}
            </p>
          </div>
          <button
            className="tfs-btn sm"
            style={{ marginTop: 12 }}
            onClick={() => {
              setAns({});
              setRound(round + 1);
            }}
          >
            重新作答
          </button>
        </Card>
      )}
    </div>
  );
}

/* ============================================================
   主组件
   ============================================================ */
const SECTIONS = [
  { id: "intro", n: "序", t: "开篇：为什么读、怎么读", g: "导读", C: IntroSection },
  { id: "model", n: "纲", t: "总纲：一张图看懂全书", g: "导读", C: ModelSection },
  { id: "p1", n: "一", t: "两个系统", g: "五个部分", C: Part1Section },
  { id: "p2", n: "二", t: "启发法与偏差", g: "五个部分", C: Part2Section },
  { id: "p3", n: "三", t: "过度自信", g: "五个部分", C: Part3Section },
  { id: "p4", n: "四", t: "选择与风险", g: "五个部分", C: Part4Section },
  { id: "p5", n: "五", t: "两个自我", g: "五个部分", C: Part5Section },
  { id: "critique", n: "评", t: "批判性阅读", g: "延伸", C: CritiqueSection },
  { id: "toolkit", n: "用", t: "工具箱", g: "延伸", C: ToolkitSection },
  { id: "glossary", n: "词", t: "词汇表", g: "延伸", C: GlossarySection },
  { id: "quiz", n: "测", t: "结业自测", g: "延伸", C: QuizSection },
];

export default function ThinkingFastSlowGuide() {
  const [section, setSection] = useState("intro");
  const [anchor, setAnchor] = useState({ id: null, k: 0 });
  const [seen, setSeen] = useState(() => new Set(["intro"]));
  const [focusRoot, setFocusRoot] = useState(null);
  const [theme, setTheme] = useState(() => {
    try {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  });
  const go = (id, anchorId = null) => {
    setSection(id);
    setAnchor((a) => ({ id: anchorId, k: a.k + 1 }));
    setSeen((s) => {
      const n = new Set(s);
      n.add(id);
      return n;
    });
  };
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (anchor.id) {
          const el = document.getElementById(anchor.id);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "auto" });
        }
      } catch (e) {
        /* 某些嵌入环境不允许滚动，忽略即可 */
      }
    }, 30);
    return () => clearTimeout(t);
  }, [anchor]);
  const idx = SECTIONS.findIndex((s) => s.id === section);
  const cur = SECTIONS[idx];
  const Cur = cur.C;
  const prev = SECTIONS[idx - 1],
    next = SECTIONS[idx + 1];
  const groups = [...new Set(SECTIONS.map((s) => s.g))];
  const ctx = { go, focusRoot, setFocusRoot };
  return (
    <NavCtx.Provider value={ctx}>
      <div className="tfs-root" data-theme={theme}>
        <style>{CSS}</style>
        <div className="tfs-top">
          <div className="tfs-top-in">
            <div className="tfs-brand" onClick={() => go("intro")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && go("intro")}>
              思考，快与慢<small>互动导读</small>
            </div>
            <div className="tfs-prog" aria-hidden="true">
              <i style={{ width: `${(seen.size / SECTIONS.length) * 100}%` }} />
            </div>
            <span className="tfs-progtxt">
              已读 {seen.size}/{SECTIONS.length}
            </span>
            <button className="tfs-iconbtn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="切换明暗主题">
              {theme === "dark" ? "☀ 浅色" : "☾ 深色"}
            </button>
          </div>
          <div className="tfs-pills" role="tablist" aria-label="章节导航">
            {SECTIONS.map((s) => (
              <button key={s.id} className={cx("tfs-pill", s.id === section && "on")} onClick={() => go(s.id)}>
                {s.n} · {s.t.split("：")[0]}
              </button>
            ))}
          </div>
        </div>
        <div className="tfs-shell">
          <nav className="tfs-nav" aria-label="目录">
            {groups.map((g) => (
              <div key={g}>
                <div className="tfs-navgrp">{g}</div>
                {SECTIONS.filter((s) => s.g === g).map((s) => (
                  <button key={s.id} className={cx("tfs-navbtn", s.id === section && "on")} onClick={() => go(s.id)}>
                    <span className="num">{s.n}</span>
                    <span style={{ flex: 1 }}>{s.t}</span>
                    <span className={cx("dot", seen.has(s.id) && "seen")} />
                  </button>
                ))}
              </div>
            ))}
            <p className="tfs-small" style={{ margin: "22px 10px 0" }}>
              丹尼尔·卡尼曼 著<br />
              依据中信出版社中译本通读整理，并补充 2012–2024 年的后续研究。
            </p>
          </nav>
          <main className="tfs-main">
            <Cur key={section} />
            <div className={cx("tfs-content")}>
              <div className="tfs-foot">
                {prev ? (
                  <button className="tfs-btn" onClick={() => go(prev.id)}>
                    ← {prev.t}
                  </button>
                ) : (
                  <span />
                )}
                {next && (
                  <button className="tfs-btn primary" onClick={() => go(next.id)}>
                    {next.t} →
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </NavCtx.Provider>
  );
}
