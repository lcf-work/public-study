/* ===== 蒙特卡洛互动教程 共享库 =====
 * 网格世界环境 + 渲染 + 简易图表，无外部依赖。
 * 5×5 网格布局取自赵世钰《强化学习的数学原理》第5章；
 * 3×4 回合制网格取自 Reinforcement_learning_tutorial_with_demo 仓库。
 */
"use strict";

function $(id) { return document.getElementById(id); }
function fmt(v, d) { return (v === undefined || v === null || isNaN(v)) ? "–" : v.toFixed(d === undefined ? 1 : d); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function randInt(n) { return Math.floor(Math.random() * n); }

/* ---------------- 5×5 书式网格（连续任务，含“原地不动”动作） ---------------- */
const BOOK = {
  ROWS: 5, COLS: 5,
  FORBIDDEN: new Set(["1,1", "1,2", "2,2", "3,1", "3,3", "4,1"]),
  TARGET: "3,2",
  // 动作：0上 1右 2下 3左 4原地
  ACT: [[-1, 0], [0, 1], [1, 0], [0, -1], [0, 0]],
  ACT_GLYPH: ["↑", "→", "↓", "←", "○"],
  N: 25, NA: 5,
  sid(r, c) { return r * 5 + c; },
  rc(s) { return [Math.floor(s / 5), s % 5]; },
  isForbidden(s) { const [r, c] = this.rc(s); return this.FORBIDDEN.has(r + "," + c); },
  isTarget(s) { const [r, c] = this.rc(s); return this.TARGET === r + "," + c; },
};

function makeBookEnv(opts) {
  const o = Object.assign({ rBoundary: -1, rForbidden: -10, rTarget: 1, rOther: 0 }, opts);
  return {
    opts: o,
    // 返回 [下一状态, 即时奖励]
    step(s, a) {
      const [r, c] = BOOK.rc(s);
      const nr = r + BOOK.ACT[a][0], nc = c + BOOK.ACT[a][1];
      if (nr < 0 || nr >= 5 || nc < 0 || nc >= 5) return [s, o.rBoundary]; // 撞墙弹回
      const k = nr + "," + nc;
      const rew = BOOK.FORBIDDEN.has(k) ? o.rForbidden : (k === BOOK.TARGET ? o.rTarget : o.rOther);
      return [BOOK.sid(nr, nc), rew];
    },
  };
}

/* 给定确定性策略 pol[s]=a，精确策略评估（迭代贝尔曼期望方程） */
function bookEvalDet(env, pol, gamma, sweeps) {
  let V = new Float64Array(25);
  for (let k = 0; k < (sweeps || 300); k++) {
    const NV = new Float64Array(25);
    for (let s = 0; s < 25; s++) {
      const [s2, r] = env.step(s, pol[s]);
      NV[s] = r + gamma * V[s2];
    }
    V = NV;
  }
  return V;
}

/* 给定随机策略 probs[s] = [p0..p4]，精确策略评估 */
function bookEvalStoch(env, probs, gamma, sweeps) {
  let V = new Float64Array(25);
  for (let k = 0; k < (sweeps || 300); k++) {
    const NV = new Float64Array(25);
    for (let s = 0; s < 25; s++) {
      let v = 0;
      for (let a = 0; a < 5; a++) {
        if (probs[s][a] === 0) continue;
        const [s2, r] = env.step(s, a);
        v += probs[s][a] * (r + gamma * V[s2]);
      }
      NV[s] = v;
    }
    V = NV;
  }
  return V;
}

/* 值迭代 → 最优 V* 与一个最优贪婪策略 */
function bookValueIteration(env, gamma, sweeps) {
  let V = new Float64Array(25);
  for (let k = 0; k < (sweeps || 500); k++) {
    const NV = new Float64Array(25);
    for (let s = 0; s < 25; s++) {
      let best = -Infinity;
      for (let a = 0; a < 5; a++) {
        const [s2, r] = env.step(s, a);
        best = Math.max(best, r + gamma * V[s2]);
      }
      NV[s] = best;
    }
    V = NV;
  }
  const pol = new Int8Array(25), Q = [];
  for (let s = 0; s < 25; s++) {
    let best = -Infinity, ba = 0; const qs = [];
    for (let a = 0; a < 5; a++) {
      const [s2, r] = env.step(s, a);
      const q = r + gamma * V[s2];
      qs.push(q);
      if (q > best + 1e-12) { best = q; ba = a; }
    }
    pol[s] = ba; Q.push(qs);
  }
  return { V, pol, Q };
}

/* ε-greedy 概率分布（书式 5 动作） */
function epsProbs(greedyA, eps) {
  const p = [eps / 5, eps / 5, eps / 5, eps / 5, eps / 5];
  p[greedyA] = 1 - eps + eps / 5;
  return p;
}
function sampleFrom(p) {
  let x = Math.random(), c = 0;
  for (let i = 0; i < p.length; i++) { c += p[i]; if (x < c) return i; }
  return p.length - 1;
}

/* ---------------- 5×5 网格渲染 ---------------- */
/* opts: values(Float64Array25)|null, policy(Int8Array)|null, probs(array25x5)|null,
 *       heat(Float64Array25)|null, trace([[s..]])|null, agent(s)|null,
 *       cell(默认64), vmin/vmax 自动, mark(s)|null */
function drawBookGrid(canvas, opts) {
  const o = opts || {};
  const cell = o.cell || 64, W = 5 * cell, H = 5 * cell;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  // 底色
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const k = r + "," + c;
    ctx.fillStyle = BOOK.FORBIDDEN.has(k) ? "#f6b26b" : (k === BOOK.TARGET ? "#9fe8e8" : "#ffffff");
    ctx.fillRect(c * cell, r * cell, cell, cell);
  }
  // 热力图（访问次数）
  if (o.heat) {
    let mx = 0; for (let s = 0; s < 25; s++) mx = Math.max(mx, o.heat[s]);
    if (mx > 0) for (let s = 0; s < 25; s++) {
      const [r, c] = BOOK.rc(s);
      const t = Math.sqrt(o.heat[s] / mx); // sqrt 拉伸，低频也可见
      ctx.fillStyle = `rgba(124,77,190,${0.75 * t})`;
      ctx.fillRect(c * cell, r * cell, cell, cell);
    }
  }
  // 价值底色
  if (o.values && o.tint !== false) {
    let vmin = o.vmin, vmax = o.vmax;
    if (vmin === undefined) { vmin = Infinity; vmax = -Infinity; for (const v of o.values) { vmin = Math.min(vmin, v); vmax = Math.max(vmax, v); } }
    for (let s = 0; s < 25; s++) {
      const [r, c] = BOOK.rc(s);
      const v = o.values[s];
      let col;
      if (v >= 0) { const t = vmax > 0 ? clamp(v / vmax, 0, 1) : 0; col = `rgba(46,139,87,${0.30 * t})`; }
      else { const t = vmin < 0 ? clamp(v / vmin, 0, 1) : 0; col = `rgba(200,60,40,${0.30 * t})`; }
      ctx.fillStyle = col;
      ctx.fillRect(c * cell, r * cell, cell, cell);
    }
  }
  // 轨迹
  if (o.trace && o.trace.length > 1) {
    ctx.strokeStyle = "rgba(40,160,80,0.30)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const jit = s => { // 给同一格的多次经过加微小抖动，模拟书中"轨迹束"
      const [r, c] = BOOK.rc(s);
      return [c * cell + cell / 2 + (Math.random() - .5) * cell * .35,
              r * cell + cell / 2 + (Math.random() - .5) * cell * .35];
    };
    let p = jit(o.trace[0]);
    ctx.moveTo(p[0], p[1]);
    const step = Math.max(1, Math.floor(o.trace.length / 4000)); // 限制绘制段数
    for (let i = step; i < o.trace.length; i += step) { p = jit(o.trace[i]); ctx.lineTo(p[0], p[1]); }
    ctx.stroke();
    // 起点
    const [r0, c0] = BOOK.rc(o.trace[0]);
    ctx.fillStyle = "#1b4ea0";
    ctx.beginPath(); ctx.arc(c0 * cell + cell / 2, r0 * cell + cell / 2, 5, 0, 7); ctx.fill();
  }
  // 网格线
  ctx.strokeStyle = "#555"; ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(W, i * cell); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, H); ctx.stroke();
  }
  // 数值
  if (o.values) {
    ctx.font = `${Math.round(cell * 0.24)}px "JetBrains Mono", Consolas, monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let s = 0; s < 25; s++) {
      const [r, c] = BOOK.rc(s);
      ctx.fillStyle = "#222";
      const y = (o.policy || o.probs) ? r * cell + cell * 0.24 : r * cell + cell / 2;
      ctx.fillText(fmt(o.values[s], 1), c * cell + cell / 2, y);
    }
  }
  // 确定性策略箭头
  const arrow = (x, y, a, len, col, lw) => {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    if (a === 4) { ctx.beginPath(); ctx.arc(x, y, Math.max(2.5, len * 0.35), 0, 7); ctx.stroke(); return; }
    const [dr, dc] = BOOK.ACT[a];
    const x2 = x + dc * len, y2 = y + dr * len;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
    const ang = Math.atan2(y2 - y, x2 - x), hs = Math.max(4, len * 0.4);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hs * Math.cos(ang - 0.5), y2 - hs * Math.sin(ang - 0.5));
    ctx.lineTo(x2 - hs * Math.cos(ang + 0.5), y2 - hs * Math.sin(ang + 0.5));
    ctx.fill();
  };
  if (o.policy) {
    for (let s = 0; s < 25; s++) {
      const [r, c] = BOOK.rc(s);
      const y = o.values ? r * cell + cell * 0.66 : r * cell + cell / 2;
      arrow(c * cell + cell / 2, y, o.policy[s], cell * 0.22, "#1f7a33", 2);
    }
  }
  // 随机策略：各方向箭头长度 ∝ 概率
  if (o.probs) {
    for (let s = 0; s < 25; s++) {
      const [r, c] = BOOK.rc(s);
      const cx = c * cell + cell / 2, cy = o.values ? r * cell + cell * 0.66 : r * cell + cell / 2;
      for (let a = 0; a < 5; a++) {
        const p = o.probs[s][a];
        if (p < 0.005) continue;
        arrow(cx, cy, a, cell * (0.10 + 0.26 * p), "#1f7a33", p > 0.5 ? 2 : 1.2);
      }
    }
  }
  // 智能体
  if (o.agent !== undefined && o.agent !== null) {
    const [r, c] = BOOK.rc(o.agent);
    ctx.fillStyle = "#1b4ea0";
    ctx.beginPath(); ctx.arc(c * cell + cell / 2, r * cell + cell / 2, cell * 0.16, 0, 7); ctx.fill();
  }
  if (o.mark !== undefined && o.mark !== null) {
    const [r, c] = BOOK.rc(o.mark);
    ctx.strokeStyle = "#e0a020"; ctx.lineWidth = 3;
    ctx.strokeRect(c * cell + 2, r * cell + 2, cell - 4, cell - 4);
  }
}

/* ---------------- 3×4 回合制网格（demo 仓库 standard_grid） ---------------- */
/* 布局：
 *  .  .  .  +1
 *  .  ■  .  -1
 *  S  .  .  .
 * 动作 0上 1下 2左 3右；撞墙/出界原地不动。到达 (0,3)/(1,3) 回合结束。 */
const EPI = {
  ROWS: 3, COLS: 4,
  WALL: "1,1",
  TERM: { "0,3": 1, "1,3": -1 },
  START: [2, 0],
  ACT: [[-1, 0], [1, 0], [0, -1], [0, 1]],
  ACT_GLYPH: ["↑", "↓", "←", "→"],
  ACT_NAME: ["U", "D", "L", "R"],
  states() { // 非终止、非墙状态列表
    const out = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const k = r + "," + c;
      if (k === this.WALL || k in this.TERM) continue;
      out.push([r, c]);
    }
    return out;
  },
  isTerm(r, c) { return (r + "," + c) in this.TERM; },
  step(r, c, a) { // 返回 [nr, nc, reward, done]
    let nr = r + this.ACT[a][0], nc = c + this.ACT[a][1];
    if (nr < 0 || nr >= 3 || nc < 0 || nc >= 4 || (nr + "," + nc) === this.WALL) { nr = r; nc = c; }
    const k = nr + "," + nc;
    if (k in this.TERM) return [nr, nc, this.TERM[k], true];
    return [nr, nc, 0, false];
  },
};

/* 带“风”的动作执行：以 pIntend 概率执行所选动作，否则等概率执行其余 3 个 */
function windyAction(a, pIntend) {
  if (Math.random() < pIntend) return a;
  const others = [0, 1, 2, 3].filter(x => x !== a);
  return others[randInt(3)];
}

/* 在风模型下精确评估确定性策略 pol{"r,c": a} */
function epiEvalExact(pol, gamma, pIntend, sweeps) {
  const V = {};
  for (const [r, c] of EPI.states()) V[r + "," + c] = 0;
  for (let k = 0; k < (sweeps || 400); k++) {
    for (const [r, c] of EPI.states()) {
      const aSel = pol[r + "," + c];
      let v = 0;
      for (let a = 0; a < 4; a++) {
        const p = (a === aSel) ? pIntend : (1 - pIntend) / 3;
        if (p === 0) continue;
        const [nr, nc, rew, done] = EPI.step(r, c, a);
        v += p * (rew + (done ? 0 : gamma * (V[nr + "," + nc] || 0)));
      }
      V[r + "," + c] = v;
    }
  }
  return V;
}

/* 3×4 网格渲染。opts: values{"r,c":v}, policy{"r,c":a}, visits, agent[r,c], path[[r,c]..], cell */
function drawEpiGrid(canvas, opts) {
  const o = opts || {};
  const cell = o.cell || 78, W = 4 * cell, H = 3 * cell;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const k = r + "," + c;
    let col = "#ffffff";
    if (k === EPI.WALL) col = "#8d8d8d";
    else if (EPI.TERM[k] === 1) col = "#bfe8c5";
    else if (EPI.TERM[k] === -1) col = "#f3c0b8";
    ctx.fillStyle = col;
    ctx.fillRect(c * cell, r * cell, cell, cell);
  }
  // 价值底色
  if (o.values && o.tint) {
    let vmax = 0.001, vmin = -0.001;
    for (const k in o.values) { vmax = Math.max(vmax, o.values[k]); vmin = Math.min(vmin, o.values[k]); }
    for (const k in o.values) {
      const [r, c] = k.split(",").map(Number);
      const v = o.values[k];
      ctx.fillStyle = v >= 0 ? `rgba(46,139,87,${0.35 * clamp(v / vmax, 0, 1)})`
                             : `rgba(200,60,40,${0.35 * clamp(v / vmin, 0, 1)})`;
      ctx.fillRect(c * cell, r * cell, cell, cell);
    }
  }
  // 路径
  if (o.path && o.path.length > 1) {
    ctx.strokeStyle = "rgba(27,78,160,0.55)"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(o.path[0][1] * cell + cell / 2, o.path[0][0] * cell + cell / 2);
    for (let i = 1; i < o.path.length; i++)
      ctx.lineTo(o.path[i][1] * cell + cell / 2, o.path[i][0] * cell + cell / 2);
    ctx.stroke();
  }
  // 网格线 + 标注
  ctx.strokeStyle = "#555"; ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(W, i * cell); ctx.stroke(); }
  for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, H); ctx.stroke(); }
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.round(cell * 0.3)}px sans-serif`;
  ctx.fillStyle = "#2e6b45"; ctx.fillText("+1", 3 * cell + cell / 2, 0 * cell + cell / 2);
  ctx.fillStyle = "#b2452f"; ctx.fillText("−1", 3 * cell + cell / 2, 1 * cell + cell / 2);
  ctx.fillStyle = "#666"; ctx.font = `${Math.round(cell * 0.2)}px sans-serif`;
  if (!o.values) ctx.fillText("出发", EPI.START[1] * cell + cell / 2, EPI.START[0] * cell + cell * 0.8);

  if (o.values) {
    ctx.font = `${Math.round(cell * 0.22)}px "JetBrains Mono", Consolas, monospace`;
    for (const k in o.values) {
      const [r, c] = k.split(",").map(Number);
      ctx.fillStyle = "#222";
      ctx.fillText(fmt(o.values[k], 2), c * cell + cell / 2, r * cell + cell * (o.policy ? 0.30 : 0.5));
    }
  }
  if (o.visits) {
    ctx.font = `${Math.round(cell * 0.17)}px "JetBrains Mono", Consolas, monospace`;
    ctx.fillStyle = "#8a7db0"; ctx.textAlign = "right";
    for (const k in o.visits) {
      const [r, c] = k.split(",").map(Number);
      ctx.fillText("×" + o.visits[k], c * cell + cell - 4, r * cell + cell - 10);
    }
    ctx.textAlign = "center";
  }
  if (o.policy) {
    ctx.font = `bold ${Math.round(cell * 0.3)}px sans-serif`;
    ctx.fillStyle = "#1f7a33";
    for (const k in o.policy) {
      const [r, c] = k.split(",").map(Number);
      ctx.fillText(EPI.ACT_GLYPH[o.policy[k]], c * cell + cell / 2, r * cell + cell * (o.values ? 0.68 : 0.5));
    }
  }
  if (o.agent) {
    ctx.fillStyle = "#1b4ea0";
    ctx.beginPath();
    ctx.arc(o.agent[1] * cell + cell / 2, o.agent[0] * cell + cell / 2, cell * 0.15, 0, 7);
    ctx.fill();
  }
  if (o.mark) {
    const [r, c] = o.mark;
    ctx.strokeStyle = "#e0a020"; ctx.lineWidth = 3;
    ctx.strokeRect(c * cell + 2, r * cell + 2, cell - 4, cell - 4);
  }
}

/* ---------------- 简易折线图 ---------------- */
/* series: [{data:[..], color, label}], opts: {yLabel, xLabel, yZero, hline:{y,label}} */
function lineChart(canvas, series, opts) {
  const o = opts || {};
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth || 420, H = canvas.clientHeight || 200;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const padL = 46, padR = 12, padT = 14, padB = 26;

  let ymin = Infinity, ymax = -Infinity, n = 0;
  for (const s of series) {
    n = Math.max(n, s.data.length);
    for (const v of s.data) { if (!isFinite(v)) continue; ymin = Math.min(ymin, v); ymax = Math.max(ymax, v); }
  }
  if (o.hline) { ymin = Math.min(ymin, o.hline.y); ymax = Math.max(ymax, o.hline.y); }
  if (!isFinite(ymin)) { ymin = 0; ymax = 1; }
  if (o.yZero) ymin = Math.min(ymin, 0);
  if (ymax - ymin < 1e-9) { ymax += 1; ymin -= 1; }
  const pad = (ymax - ymin) * 0.08; ymin -= pad; ymax += pad;

  const X = i => padL + (n <= 1 ? 0 : i / (n - 1) * (W - padL - padR));
  const Y = v => padT + (1 - (v - ymin) / (ymax - ymin)) * (H - padT - padB);

  // 坐标轴与刻度
  ctx.strokeStyle = "#ccc"; ctx.fillStyle = "#888";
  ctx.font = "11px sans-serif"; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const v = ymin + (ymax - ymin) * i / 4, y = Y(v);
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
    ctx.textAlign = "right"; ctx.fillText(Math.abs(v) < 100 ? v.toFixed(2) : v.toFixed(0), padL - 5, y + 3);
  }
  ctx.textAlign = "center";
  if (n > 1) {
    for (let i = 0; i <= 4; i++) {
      const idx = Math.round((n - 1) * i / 4);
      const label = o.xvals ? o.xvals[Math.min(idx, o.xvals.length - 1)] : idx + (o.x0 || 0);
      ctx.fillText(String(label), X(idx), H - 8);
    }
  }
  if (o.xLabel) { ctx.fillText(o.xLabel, (padL + W - padR) / 2, H - 8 + 0); }
  if (o.yLabel) {
    ctx.save(); ctx.translate(11, (padT + H - padB) / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText(o.yLabel, 0, 0); ctx.restore();
  }
  if (o.hline) {
    ctx.strokeStyle = "#b2452f"; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(padL, Y(o.hline.y)); ctx.lineTo(W - padR, Y(o.hline.y)); ctx.stroke();
    ctx.setLineDash([]);
    if (o.hline.label) { ctx.fillStyle = "#b2452f"; ctx.textAlign = "left"; ctx.fillText(o.hline.label, padL + 4, Y(o.hline.y) - 5); }
  }
  // 数据
  for (const s of series) {
    if (s.dots) {
      ctx.fillStyle = s.color || "#e07a30";
      for (let i = 0; i < s.data.length; i++) {
        ctx.beginPath(); ctx.arc(X(i), Y(s.data[i]), 2, 0, 7); ctx.fill();
      }
    } else {
      ctx.strokeStyle = s.color || "#7c4dbe"; ctx.lineWidth = s.width || 2;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < s.data.length; i++) {
        if (!isFinite(s.data[i])) continue;
        if (!started) { ctx.moveTo(X(i), Y(s.data[i])); started = true; }
        else ctx.lineTo(X(i), Y(s.data[i]));
      }
      ctx.stroke();
    }
  }
  // 图例
  let lx = padL + 8;
  ctx.font = "12px sans-serif"; ctx.textAlign = "left";
  for (const s of series) {
    if (!s.label) continue;
    ctx.fillStyle = s.color || "#7c4dbe";
    ctx.fillRect(lx, padT, 14, 3);
    ctx.fillStyle = "#555"; ctx.fillText(s.label, lx + 18, padT + 5);
    lx += 18 + ctx.measureText(s.label).width + 16;
  }
}

/* ---------------- 直方图（样本回报分布等） ---------------- */
function histChart(canvas, values, opts) {
  const o = opts || {};
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth || 420, H = canvas.clientHeight || 160;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (!values.length) {
    ctx.fillStyle = "#999"; ctx.font = "13px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(o.empty || "暂无样本", W / 2, H / 2);
    return;
  }
  let lo = Math.min(...values), hi = Math.max(...values);
  if (hi - lo < 1e-9) { lo -= 0.5; hi += 0.5; }
  const nb = o.bins || 24, counts = new Array(nb).fill(0);
  for (const v of values) counts[clamp(Math.floor((v - lo) / (hi - lo) * nb), 0, nb - 1)]++;
  const cmax = Math.max(...counts);
  const padB = 22, padT = 8;
  const bw = W / nb;
  ctx.fillStyle = o.color || "rgba(124,77,190,0.65)";
  for (let i = 0; i < nb; i++) {
    const h = counts[i] / cmax * (H - padB - padT);
    ctx.fillRect(i * bw + 1, H - padB - h, bw - 2, h);
  }
  // 均值线
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const mx = (mean - lo) / (hi - lo) * W;
  ctx.strokeStyle = "#b2452f"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(mx, padT); ctx.lineTo(mx, H - padB); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#666"; ctx.font = "11px sans-serif";
  ctx.textAlign = "left"; ctx.fillText(fmt(lo, 2), 2, H - 8);
  ctx.textAlign = "right"; ctx.fillText(fmt(hi, 2), W - 2, H - 8);
  ctx.textAlign = "center"; ctx.fillStyle = "#b2452f";
  ctx.fillText("均值 " + fmt(mean, 3), clamp(mx, 40, W - 40), H - 8);
}
