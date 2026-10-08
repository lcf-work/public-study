/* ===== 浏览器内 PPO 引擎（纯 JS，无依赖；可在 Node 中测试） =====
 * 含：可复现 RNG、两层 MLP（前向/反向 + Adam）、CartPole 环境、PPO 训练器（裁剪目标 + GAE）。
 * 教学取向：代码清晰优先于极致性能；规模足够小，浏览器中实时可跑。
 */
"use strict";
(function (root) {

  /* ---------- 可复现随机数（mulberry32）---------- */
  function makeRNG(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeGauss(rng) {
    let spare = null;
    return function () {
      if (spare !== null) { const v = spare; spare = null; return v; }
      let u = 0, v = 0;
      while (u === 0) u = rng();
      while (v === 0) v = rng();
      const r = Math.sqrt(-2 * Math.log(u));
      spare = r * Math.sin(2 * Math.PI * v);
      return r * Math.cos(2 * Math.PI * v);
    };
  }

  function softmax2(z0, z1) { // 二维 softmax，返回 [p0,p1]
    const m = Math.max(z0, z1);
    const e0 = Math.exp(z0 - m), e1 = Math.exp(z1 - m);
    const s = e0 + e1;
    return [e0 / s, e1 / s];
  }

  /* ---------- 两层 MLP：in → tanh(hidden) → linear(out)，自带 Adam ---------- */
  class MLP {
    constructor(nin, nh, nout, gaussFn, outScale) {
      this.nin = nin; this.nh = nh; this.nout = nout;
      const g = gaussFn;
      const s1 = Math.sqrt(1 / nin);
      this.W1 = new Float64Array(nh * nin); for (let i = 0; i < this.W1.length; i++) this.W1[i] = g() * s1;
      this.b1 = new Float64Array(nh);
      this.W2 = new Float64Array(nout * nh); for (let i = 0; i < this.W2.length; i++) this.W2[i] = g() * (outScale === undefined ? Math.sqrt(1 / nh) : outScale);
      this.b2 = new Float64Array(nout);
      this.params = [this.W1, this.b1, this.W2, this.b2];
      this.grads = this.params.map(p => new Float64Array(p.length));
      this.m = this.params.map(p => new Float64Array(p.length));
      this.v = this.params.map(p => new Float64Array(p.length));
      this.t = 0;
    }
    forward(x) {
      const nh = this.nh, nin = this.nin, nout = this.nout;
      const a1 = new Float64Array(nh);
      for (let h = 0; h < nh; h++) { let z = this.b1[h]; const base = h * nin; for (let i = 0; i < nin; i++) z += this.W1[base + i] * x[i]; a1[h] = Math.tanh(z); }
      const out = new Float64Array(nout);
      for (let o = 0; o < nout; o++) { let z = this.b2[o]; const base = o * nh; for (let h = 0; h < nh; h++) z += this.W2[base + h] * a1[h]; out[o] = z; }
      return { x, a1, out };
    }
    // dout: ∂(标量)/∂out；把梯度累加进 this.grads
    backwardAccum(dout, cache) {
      const nh = this.nh, nin = this.nin, nout = this.nout;
      const x = cache.x, a1 = cache.a1;
      const gW1 = this.grads[0], gb1 = this.grads[1], gW2 = this.grads[2], gb2 = this.grads[3];
      const da1 = new Float64Array(nh);
      for (let o = 0; o < nout; o++) { const d = dout[o]; gb2[o] += d; const base = o * nh; for (let h = 0; h < nh; h++) { gW2[base + h] += d * a1[h]; da1[h] += this.W2[base + h] * d; } }
      for (let h = 0; h < nh; h++) { const dz = da1[h] * (1 - a1[h] * a1[h]); gb1[h] += dz; const base = h * nin; for (let i = 0; i < nin; i++) gW1[base + i] += dz * x[i]; }
    }
    zeroGrad() { for (const g of this.grads) g.fill(0); }
    adamStep(lr, maxNorm) {
      this.t++;
      const b1 = 0.9, b2 = 0.999, eps = 1e-8;
      if (maxNorm) { let s = 0; for (const g of this.grads) for (let i = 0; i < g.length; i++) s += g[i] * g[i]; const nrm = Math.sqrt(s); if (nrm > maxNorm) { const f = maxNorm / nrm; for (const g of this.grads) for (let i = 0; i < g.length; i++) g[i] *= f; } }
      const bc1 = 1 - Math.pow(b1, this.t), bc2 = 1 - Math.pow(b2, this.t);
      for (let k = 0; k < this.params.length; k++) {
        const p = this.params[k], g = this.grads[k], m = this.m[k], v = this.v[k];
        for (let i = 0; i < p.length; i++) { const gi = g[i]; m[i] = b1 * m[i] + (1 - b1) * gi; v[i] = b2 * v[i] + (1 - b2) * gi * gi; p[i] -= lr * (m[i] / bc1) / (Math.sqrt(v[i] / bc2) + eps); }
      }
    }
  }

  /* ---------- CartPole-v1 环境（经典 Gym 动力学）---------- */
  const CP = {
    g: 9.8, mc: 1.0, mp: 0.1, get mt() { return 1.1; }, l: 0.5, get pml() { return 0.05; }, force: 10.0, tau: 0.02,
    xThr: 2.4, thetaThr: 12 * Math.PI / 180, maxSteps: 500,
  };
  class CartPole {
    constructor(rng) { this.rng = rng; this.reset(); }
    reset() {
      const r = () => (this.rng() - 0.5) * 0.1; // U(-0.05,0.05)
      this.s = [r(), r(), r(), r()]; // x, x_dot, theta, theta_dot
      this.steps = 0;
      return this.s.slice();
    }
    step(a) {
      let [x, xd, th, thd] = this.s;
      const force = a === 1 ? CP.force : -CP.force;
      const ct = Math.cos(th), st = Math.sin(th);
      const temp = (force + CP.pml * thd * thd * st) / CP.mt;
      const thacc = (CP.g * st - ct * temp) / (CP.l * (4 / 3 - CP.mp * ct * ct / CP.mt));
      const xacc = temp - CP.pml * thacc * ct / CP.mt;
      x += CP.tau * xd; xd += CP.tau * xacc; th += CP.tau * thd; thd += CP.tau * thacc;
      this.s = [x, xd, th, thd]; this.steps++;
      const failed = x < -CP.xThr || x > CP.xThr || th < -CP.thetaThr || th > CP.thetaThr;
      const truncated = this.steps >= CP.maxSteps;
      return { obs: this.s.slice(), reward: 1.0, done: failed || truncated, failed, truncated };
    }
  }
  const OBS_SCALE = [1 / 2.4, 1 / 2.5, 1 / CP.thetaThr, 1 / 2.5];
  function scaleObs(o) { return [o[0] * OBS_SCALE[0], o[1] * OBS_SCALE[1], o[2] * OBS_SCALE[2], o[3] * OBS_SCALE[3]]; }

  /* ---------- PPO 训练器 ---------- */
  class PPO {
    constructor(opts) {
      const o = opts || {};
      this.seed = o.seed || 1;
      this.rng = makeRNG(this.seed);
      this.gaussFn = makeGauss(this.rng);
      this.env = new CartPole(this.rng);
      this.hidden = o.hidden || 64;
      this.gamma = o.gamma !== undefined ? o.gamma : 0.99;
      this.lam = o.lam !== undefined ? o.lam : 0.95;
      this.clipEps = o.clipEps !== undefined ? o.clipEps : 0.2;
      this.epochs = o.epochs !== undefined ? o.epochs : 10;
      this.mb = o.minibatch || 64;
      this.rollout = o.rollout || 1024;
      this.lrPi = o.lrPi !== undefined ? o.lrPi : 3e-4;
      this.lrV = o.lrV !== undefined ? o.lrV : 1e-3;
      this.entCoef = o.entCoef !== undefined ? o.entCoef : 0.0;
      this.normAdv = o.normAdv !== undefined ? o.normAdv : true;
      this.useClip = o.useClip !== undefined ? o.useClip : true; // 关掉=朴素 IS 目标（展示不稳定）
      this.maxNorm = o.maxNorm !== undefined ? o.maxNorm : 0.5;
      this.pi = new MLP(4, this.hidden, 2, this.gaussFn, 0.01);
      this.vf = new MLP(4, this.hidden, 1, this.gaussFn, 1.0);
      this.iters = 0; this.totalSteps = 0;
      this.epRetHist = []; this.epLenHist = [];
      this._curObs = this.env.reset();
    }
    actDist(obs) { const z = this.pi.forward(scaleObs(obs)).out; return softmax2(z[0], z[1]); }
    value(obs) { return this.vf.forward(scaleObs(obs)).out[0]; }

    collect() {
      const N = this.rollout;
      const obsB = [], actB = new Int8Array(N), logpB = new Float64Array(N), valB = new Float64Array(N), rewB = new Float64Array(N), doneB = new Int8Array(N);
      let epRet = 0, epLen = 0; const finRet = [], finLen = [];
      for (let t = 0; t < N; t++) {
        const obs = this._curObs;
        const p = this.actDist(obs);
        const a = this.rng() < p[0] ? 0 : 1;
        const logp = Math.log(a === 0 ? p[0] : p[1]);
        obsB.push(obs); actB[t] = a; logpB[t] = logp; valB[t] = this.value(obs);
        const r = this.env.step(a);
        rewB[t] = r.reward; doneB[t] = r.done ? 1 : 0;
        epRet += r.reward; epLen++;
        this.totalSteps++;
        if (r.done) { finRet.push(epRet); finLen.push(epLen); epRet = 0; epLen = 0; this._curObs = this.env.reset(); }
        else this._curObs = r.obs;
      }
      const lastDone = doneB[N - 1];
      const lastVal = this.value(this._curObs);
      // GAE
      const adv = new Float64Array(N), ret = new Float64Array(N);
      let gae = 0;
      for (let t = N - 1; t >= 0; t--) {
        const nnt = (t === N - 1) ? (1 - lastDone) : (1 - doneB[t]);
        const nv = (t === N - 1) ? lastVal : valB[t + 1];
        const delta = rewB[t] + this.gamma * nv * nnt - valB[t];
        gae = delta + this.gamma * this.lam * nnt * gae;
        adv[t] = gae; ret[t] = gae + valB[t];
      }
      return { obsB, actB, logpB, advB: adv, retB: ret, valB, finRet, finLen };
    }

    update(batch) {
      const N = this.rollout;
      let adv = Array.from(batch.advB);
      if (this.normAdv) { const mu = adv.reduce((a, b) => a + b, 0) / N; let s = 0; for (const a of adv) s += (a - mu) * (a - mu); const sd = Math.sqrt(s / N) + 1e-8; adv = adv.map(a => (a - mu) / sd); }
      const idx = Array.from({ length: N }, (_, i) => i);
      const eps = this.clipEps;
      let clipFrac = 0, klSum = 0, cnt = 0;
      for (let ep = 0; ep < this.epochs; ep++) {
        // shuffle
        for (let i = N - 1; i > 0; i--) { const j = Math.floor(this.rng() * (i + 1)); const tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp; }
        for (let mbs = 0; mbs < N; mbs += this.mb) {
          const end = Math.min(N, mbs + this.mb), B = end - mbs;
          this.pi.zeroGrad(); this.vf.zeroGrad();
          for (let k = mbs; k < end; k++) {
            const i = idx[k];
            const obs = scaleObs(batch.obsB[i]), a = batch.actB[i], A = adv[i];
            // policy
            const fc = this.pi.forward(obs); const p = softmax2(fc.out[0], fc.out[1]);
            const logp = Math.log(a === 0 ? p[0] : p[1]);
            const ratio = Math.exp(logp - batch.logpB[i]);
            const gradZero = this.useClip && ((A > 0 && ratio >= 1 + eps) || (A < 0 && ratio <= 1 - eps));
            // d(clip目标)/dlogits（最大化）
            const dout = new Float64Array(2);
            const H = -(p[0] * Math.log(p[0] + 1e-12) + p[1] * Math.log(p[1] + 1e-12));
            for (let j = 0; j < 2; j++) {
              const ind = (j === a) ? 1 : 0;
              let gmax = gradZero ? 0 : ratio * A * (ind - p[j]);     // 裁剪目标
              gmax += this.entCoef * (-p[j] * (Math.log(p[j] + 1e-12) + H)); // 熵奖励
              dout[j] = -gmax / B; // 最小化 → 取负，按 batch 求平均
            }
            this.pi.backwardAccum(dout, fc);
            // value（MSE）
            const vc = this.vf.forward(obs); const V = vc.out[0];
            this.vf.backwardAccum([(V - batch.retB[i]) / B], vc);
            // 诊断
            if (ep === 0) { if ((A > 0 && ratio > 1 + eps) || (A < 0 && ratio < 1 - eps)) clipFrac++; klSum += batch.logpB[i] - logp; cnt++; }
          }
          this.pi.adamStep(this.lrPi, this.maxNorm);
          this.vf.adamStep(this.lrV, this.maxNorm);
        }
      }
      return { clipFrac: cnt ? clipFrac / cnt : 0, approxKL: cnt ? klSum / cnt : 0 };
    }

    iterate() {
      const batch = this.collect();
      const diag = this.update(batch);
      this.iters++;
      if (batch.finLen.length) { for (const l of batch.finLen) this.epLenHist.push(l); for (const r of batch.finRet) this.epRetHist.push(r); }
      const recent = this.epLenHist.slice(-20);
      return {
        iters: this.iters, totalSteps: this.totalSteps,
        meanLen: recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0,
        nEp: batch.finLen.length, clipFrac: diag.clipFrac, approxKL: diag.approxKL,
        advStd: Math.sqrt(batch.advB.reduce((a, b) => a + b * b, 0) / this.rollout),
      };
    }

    // 跑一个用于动画展示的回合（随机策略采样），返回状态序列
    rolloutEpisode(maxLen) {
      const env = new CartPole(this.rng);
      let obs = env.reset(); const traj = [obs.slice()];
      const M = maxLen || CP.maxSteps;
      for (let t = 0; t < M; t++) {
        const p = this.actDist(obs); const a = this.rng() < p[0] ? 0 : 1;
        const r = env.step(a); traj.push(r.obs.slice()); obs = r.obs;
        if (r.done) break;
      }
      return traj;
    }
  }

  root.PPOLib = { makeRNG, makeGauss, MLP, CartPole, PPO, scaleObs, softmax2, CP };

})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));

if (typeof module !== "undefined" && module.exports) module.exports = (typeof globalThis !== "undefined" ? globalThis : this).PPOLib;
