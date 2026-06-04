import React, { useState, useMemo } from "react";
import {
  GraduationCap, Scale, Users, Gauge, ShieldCheck, Calculator, RefreshCw,
  Brain, ArrowLeft, ArrowRight, Sparkles, AlertTriangle, Check, X,
  TrendingUp, TrendingDown, Quote, Target,
} from "lucide-react";

/* palette (hex used in inline SVG) */
const INK = "#16241d", INK2 = "#52604f", LINE = "#cdc5af";
const GREEN = "#1f5d44", OX = "#8a2f2c", BRASS = "#9a7a33", BRASS2 = "#c19a44";
const CARD = "#faf7ee", DARK = "#13231b", ONDARK = "#ece4d0", ONDARK2 = "#b7a575";
const VALUE = 50; // intrinsic value reference used across chapters

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,900&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&family=JetBrains+Mono:wght@400;500;600&display=swap');
:root{
  --paper:#f1ecdf; --paper2:#e7e0cd; --card:#faf7ee; --ink:#16241d; --ink2:#52604f;
  --line:#cdc5af; --green:#1f5d44; --ox:#8a2f2c; --brass:#9a7a33; --brass2:#c19a44;
  --dark:#13231b; --onDark:#ece4d0; --onDark2:#b7a575;
}
.gi-root{
  --serif:'Fraunces',Georgia,'Times New Roman',serif;
  --mono:'JetBrains Mono','SFMono-Regular',Menlo,Consolas,monospace;
  font-family:'Newsreader',Georgia,'Times New Roman',serif;
  color:var(--ink); background:var(--paper);
  background-image:radial-gradient(115% 70% at 50% -8%,rgba(255,255,255,.5),transparent 55%);
  min-height:100%; position:relative; -webkit-font-smoothing:antialiased;
}
.gi-progress{height:3px;background:var(--paper2)}
.gi-progress>i{display:block;height:100%;background:linear-gradient(90deg,var(--green),var(--brass));transition:width .45s ease}
.gi-wrap{max-width:780px;margin:0 auto;padding:16px 18px 124px}
.gi-top{display:flex;align-items:center;gap:8px;color:var(--ink2);font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;padding:14px 2px 8px}
.gi-chips{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 12px;scrollbar-width:none}
.gi-chips::-webkit-scrollbar{display:none}
.gi-chip{flex:0 0 auto;display:flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--card);color:var(--ink2);
  font-family:var(--mono);font-size:12px;padding:7px 11px;border-radius:999px;cursor:pointer;white-space:nowrap;transition:.18s}
.gi-chip:hover{border-color:var(--green)}
.gi-chip.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.gi-tag{display:inline-flex;align-items:center;gap:7px;font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--brass);margin-bottom:8px}
.gi-h{font-family:var(--serif);font-weight:700;font-size:25px;line-height:1.12;margin:0 0 7px;letter-spacing:-.01em}
.gi-lead{font-size:16px;line-height:1.62;margin:0 0 13px}
.gi-p{font-size:15px;line-height:1.7;color:var(--ink2);margin:0 0 12px}
.gi-num{font-family:var(--mono);font-variant-numeric:tabular-nums}
.gi-mini{font-family:var(--mono);font-size:11px;color:var(--ink2);letter-spacing:.03em}
.gi-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px}
.gi-rule{height:1px;background:var(--line);margin:16px 0;border:0}
.gi-anim{animation:giUp .5s cubic-bezier(.2,.7,.2,1) both}
@keyframes giUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.gi-grid2{display:grid;grid-template-columns:1fr;gap:14px}
@media(min-width:620px){.gi-grid2{grid-template-columns:1fr 1fr}}
.gi-btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:13px;border:1px solid var(--ink);
  background:transparent;color:var(--ink);padding:9px 14px;border-radius:999px;cursor:pointer;transition:.18s}
.gi-btn:hover{background:var(--ink);color:var(--paper)}
.gi-btn:disabled{opacity:.32;cursor:not-allowed}.gi-btn:disabled:hover{background:transparent;color:var(--ink)}
.gi-nav{position:sticky;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:10px;
  background:linear-gradient(180deg,rgba(241,236,223,0),var(--paper) 40%);padding:16px 18px;max-width:780px;margin:0 auto}
.gi-pageno{font-family:var(--mono);font-size:12px;color:var(--ink2);letter-spacing:.1em}
.gi-quote{font-family:var(--serif);font-style:italic;font-size:18px;line-height:1.5;border-left:3px solid var(--brass);padding-left:14px;margin:2px 0 14px}
/* cover */
.gi-cover{background:var(--dark);background-image:radial-gradient(110% 90% at 75% 8%,rgba(193,154,68,.16),transparent 55%);
  color:var(--onDark);border-radius:18px;padding:30px 24px 22px;position:relative;overflow:hidden}
.gi-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(183,165,117,.42);color:var(--onDark2);
  font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;padding:5px 11px;border-radius:999px}
/* mr market */
.gi-stage{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.gi-gauge{height:10px;border-radius:999px;background:linear-gradient(90deg,var(--ox),#cdbf8f,var(--brass2));position:relative;margin:6px 0 4px}
.gi-gauge i{position:absolute;top:-4px;width:4px;height:18px;border-radius:3px;background:var(--ink);transform:translateX(-2px);transition:left .35s ease}
.gi-quotebox{flex:1;min-width:180px}
.gi-bigprice{font-family:var(--serif);font-weight:800;font-size:42px;line-height:1}
.gi-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.gi-act{font-family:var(--mono);font-size:13px;border:1px solid var(--line);background:var(--paper);color:var(--ink);
  padding:10px 14px;border-radius:10px;cursor:pointer;transition:.15s}
.gi-act:hover{border-color:var(--ink)}
.gi-verdict{margin-top:14px;border-radius:12px;padding:13px 15px;font-size:14px;line-height:1.55;border:1px solid}
.v-good{background:rgba(31,93,68,.08);border-color:rgba(31,93,68,.35);color:#184c38}
.v-bad{background:rgba(138,47,44,.08);border-color:rgba(138,47,44,.35);color:#7a2926}
.v-neutral{background:var(--paper2);border-color:var(--line);color:var(--ink2)}
/* margin of safety track */
.gi-track{position:relative;height:46px;border-radius:11px;background:var(--paper2);border:1px solid var(--line)}
.gi-zone:first-of-type{border-top-left-radius:11px;border-bottom-left-radius:11px}
.gi-zone{position:absolute;top:0;bottom:0}
.gi-vline{position:absolute;top:0;bottom:0;width:2px;background:var(--ink)}
.gi-vlabel{position:absolute;top:-20px;transform:translateX(-50%);font-family:var(--mono);font-size:10px;color:var(--ink)}
.gi-marker{position:absolute;top:-2px;transform:translateX(-50%);transition:left .12s linear}
.gi-pill2{display:inline-block;font-family:var(--mono);font-size:12px;padding:5px 11px;border-radius:999px;font-weight:600}
/* sliders */
.gi-slider{display:flex;flex-direction:column;gap:6px}
.gi-slider label{display:flex;justify-content:space-between;font-family:var(--mono);font-size:12px;color:var(--ink2)}
.gi-slider label b{color:var(--ink);font-weight:600}
.gi-range{width:100%;accent-color:var(--green);height:22px;cursor:pointer}
/* quiz / lists */
.gi-opt{display:flex;gap:10px}
.gi-optbtn{flex:1;font-family:var(--mono);font-size:13px;border:1px solid var(--line);background:var(--paper);color:var(--ink);
  padding:9px;border-radius:10px;cursor:pointer;transition:.15s}
.gi-optbtn:hover{border-color:var(--ink)}
.gi-optbtn.correct{background:rgba(31,93,68,.12);border-color:var(--green);color:#184c38}
.gi-optbtn.wrong{background:rgba(138,47,44,.12);border-color:var(--ox);color:#7a2926}
.gi-li{display:flex;gap:12px;padding:11px 0;border-bottom:1px dashed var(--line)}
.gi-li:last-child{border-bottom:0}
.gi-badge{flex:0 0 auto;width:28px;height:28px;border-radius:8px;display:grid;place-items:center;background:var(--paper2);color:var(--green)}
.gi-stat{font-family:var(--serif);font-weight:800;line-height:1}
.gi-bar{display:flex;height:34px;border-radius:9px;overflow:hidden;border:1px solid var(--line)}
.gi-note{background:var(--paper2);border-radius:12px;padding:15px;margin-top:13px}
`;

/* ---- Mr. Market face ---- */
function Face({ mood }) {
  const accent = mood > 0.2 ? GREEN : mood < -0.2 ? OX : INK2;
  const my = 50, ctrl = my - mood * 16; // smile when mood>0
  const eyeR = 3 + Math.max(0, mood) * 1.4;
  return (
    <svg viewBox="0 0 80 80" width="92" height="92" aria-hidden>
      <circle cx="40" cy="40" r="31" fill={CARD} stroke={accent} strokeWidth="2.4" />
      <circle cx="30" cy="35" r={eyeR} fill={INK} />
      <circle cx="50" cy="35" r={eyeR} fill={INK} />
      <path d={`M28 ${my} Q40 ${ctrl} 52 ${my}`} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      {mood > 0.55 && <><circle cx="22" cy="46" r="3" fill="rgba(154,122,51,.4)" /><circle cx="58" cy="46" r="3" fill="rgba(154,122,51,.4)" /></>}
      {mood < -0.55 && <path d="M24 60 Q40 56 56 60" fill="none" stroke={OX} strokeWidth="1.6" opacity=".6" />}
    </svg>
  );
}

/* ---- recent quotes vs value ---- */
function Spark({ history, last }) {
  const W = 260, H = 70, p = 8, lo = 18, hi = 84;
  const Y = (v) => H - p - ((v - lo) / (hi - lo)) * (H - 2 * p);
  const X = (i) => p + (i / Math.max(1, history.length - 1)) * (W - 2 * p);
  const d = history.map((v, i) => `${i === 0 ? "M" : "L"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
  const vy = Y(VALUE);
  const lastRatio = last / VALUE;
  const dotColor = lastRatio <= 0.8 ? GREEN : lastRatio >= 1.2 ? OX : INK2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="74">
      <line x1={p} y1={vy} x2={W - p} y2={vy} stroke={GREEN} strokeWidth="1.4" strokeDasharray="4 4" />
      <text x={W - p} y={vy - 5} fontFamily="var(--mono)" fontSize="9" fill={GREEN} textAnchor="end">内在价值 ¥{VALUE}</text>
      <path d={d} fill="none" stroke={INK2} strokeWidth="1.8" />
      <circle cx={X(history.length - 1)} cy={Y(last)} r="3.2" fill={dotColor} />
    </svg>
  );
}

const randMood = () => Math.random() * 2 - 1;
const priceFromMood = (m) => Math.min(84, Math.max(18, Math.round(VALUE * (1 + m * 0.6))));
const moodWord = (m) => m <= -0.55 ? "恐慌" : m <= -0.2 ? "沮丧" : m < 0.2 ? "平静" : m < 0.55 ? "乐观" : "狂热";
const fmt = (n) => "¥" + Math.round(n).toLocaleString("zh-CN");

const CHAPTERS = [
  { t: "扉页", icon: GraduationCap },
  { t: "投资 vs 投机", icon: Scale },
  { t: "你是哪种投资者", icon: Users },
  { t: "市场先生", icon: Gauge },
  { t: "价值与安全边际", icon: ShieldCheck },
  { t: "格雷厄姆数字", icon: Calculator },
  { t: "配置与再平衡", icon: RefreshCw },
  { t: "最大的敌人是自己", icon: Brain },
];

const QUIZ = [
  { s: "在彻底分析一家公司的财务后，以明显低于其内在价值的价格买入，准备长期持有。", a: "投资", why: "符合“经透彻分析、保障本金安全、获得满意回报”三要素。" },
  { s: "听说某只股票最近天天涨、怕错过，第二天开盘立刻追买。", a: "投机", why: "没有分析、没有安全边际，只是赌价格继续涨——典型投机。" },
  { s: "买入一篮子低成本、广泛分散的指数基金，定期定额，长期持有。", a: "投资", why: "对防御型投资者，这是格雷厄姆认可的稳健“投资操作”。" },
  { s: "用杠杆押注某加密代币能在一周内翻倍。", a: "投机", why: "高杠杆、短期、纯赌价格波动，本金毫无保障。" },
];

export default function App() {
  const [ch, setCh] = useState(0);

  // mr market
  const [hist, setHist] = useState(() => Array.from({ length: 8 }, () => priceFromMood(randMood())));
  const [day, setDay] = useState(() => { const m = randMood(); return { m, p: priceFromMood(m) }; });
  const [act, setAct] = useState(null);
  const newDay = () => { const m = randMood(); const p = priceFromMood(m); setDay({ m, p }); setHist(h => [...h, p].slice(-14)); setAct(null); };
  const decide = (type) => {
    const r = day.p / VALUE;
    const cheap = r <= 0.8, pricey = r >= 1.2;
    let kind = "v-neutral", text = "";
    if (type === "buy") {
      if (cheap) { kind = "v-good"; text = `市场先生恐慌，报价 ${fmt(day.p)} 远低于价值。你买入便宜货——正是格雷厄姆要你做的。`; }
      else if (pricey) { kind = "v-bad"; text = `他正狂热，报价 ${fmt(day.p)} 高于价值。此时买入是在为情绪付溢价。`; }
      else { text = `报价 ${fmt(day.p)} 接近价值，买入说不上占便宜，但也不算错。`; }
    } else if (type === "sell") {
      if (pricey) { kind = "v-good"; text = `他狂热，愿出 ${fmt(day.p)} 接盘。把高价卖给他，很聪明。`; }
      else if (cheap) { kind = "v-bad"; text = `他在恐慌、报价 ${fmt(day.p)} 很低，你却把便宜货卖给了他——被情绪牵着走了。`; }
      else { text = `价格合理，卖不卖都行，谈不上占便宜。`; }
    } else {
      if (cheap) { text = `按兵不动也行；不过 ${fmt(day.p)} 是便宜货，若有闲钱，本可考虑买入。`; }
      else if (pricey) { kind = "v-good"; text = `不被 ${fmt(day.p)} 的狂热裹挟，按兵不动——很好。`; }
      else { kind = "v-good"; text = `价格合理、没便宜可占，按兵不动正是明智之举。`; }
    }
    setAct({ kind, text });
  };

  // margin of safety
  const [price, setPrice] = useState(38);
  const disc = ((VALUE - price) / VALUE) * 100;
  let mosLabel, mosCls;
  if (price <= 0.66 * VALUE) { mosLabel = "显著安全边际 · 格雷厄姆式买点"; mosCls = "v-good"; }
  else if (price < 0.9 * VALUE) { mosLabel = "有一定折让"; mosCls = "v-neutral"; }
  else if (price <= 1.1 * VALUE) { mosLabel = "接近合理价值 · 边际不足"; mosCls = "v-neutral"; }
  else { mosLabel = "溢价 · 没有安全边际"; mosCls = "v-bad"; }
  const pMax = 2 * VALUE;
  const pricePct = (price / pMax) * 100, valuePct = 50, buyPct = (0.66 * VALUE / pMax) * 100;

  // graham number
  const [eps, setEps] = useState(3.0);
  const [bvps, setBvps] = useState(25);
  const [gprice, setGprice] = useState(35);
  const gn = eps > 0 && bvps > 0 ? Math.sqrt(22.5 * eps * bvps) : 0;
  const gnOk = gn > 0 && gprice <= gn;

  // allocation / rebalancing
  const BASE = 100000;
  const [target, setTarget] = useState(50);
  const [stock, setStock] = useState(BASE * 0.5);
  const [bond, setBond] = useState(BASE * 0.5);
  const [rbMsg, setRbMsg] = useState("");
  const setTgt = (v) => { setTarget(v); setStock(BASE * v / 100); setBond(BASE * (1 - v / 100)); setRbMsg(""); };
  const totalP = stock + bond;
  const sw = Math.round((stock / totalP) * 100);
  const market = (mult, label) => { setStock(s => s * mult); setRbMsg(`${label} 之后，股票占比变成 ${Math.round((stock * mult) / (stock * mult + bond) * 100)}%，已偏离目标 ${target}%。`); };
  const rebalance = () => {
    const t = stock + bond, ns = t * target / 100, trade = ns - stock;
    setStock(ns); setBond(t - ns);
    setRbMsg(trade > 0
      ? `股票占比偏低，再平衡需买入股票 ${fmt(trade)} —— 等于在相对低位“低买”。`
      : `股票涨得过多，再平衡需卖出股票 ${fmt(-trade)} —— 等于在相对高位“高卖、落袋”。`);
  };

  const total = CHAPTERS.length;

  const render = () => {
    switch (ch) {
      case 0:
        return (
          <div className="gi-anim">
            <div className="gi-cover">
              <span className="gi-pill"><Sparkles size={13} /> 价值投资圣经 · 1949 年初版</span>
              <h1 className="gi-num" style={{ fontFamily: "var(--serif)", fontWeight: 800, fontSize: 40, margin: "16px 0 4px", color: "var(--onDark)" }}>聪明的投资者</h1>
              <p className="gi-num" style={{ color: "var(--onDark2)", fontSize: 13, letterSpacing: ".05em", margin: 0 }}>The Intelligent Investor</p>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--onDark)", marginTop: 14, fontSize: 16, lineHeight: 1.5 }}>
                作者：本杰明·格雷厄姆（Benjamin Graham）<br />“华尔街教父”、巴菲特的老师 · 1973 修订版（含 Zweig 评注）
              </p>
              <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                <Quote size={18} color="var(--brass2)" style={{ flex: "0 0 auto", marginTop: 2 }} />
                <p style={{ color: "var(--onDark2)", fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>
                  巴菲特称它是“有史以来最好的投资书籍”，并特别推崇第 8 章（市场先生）与第 20 章（安全边际）。
                </p>
              </div>
            </div>
            <div className="gi-card" style={{ marginTop: 16 }}>
              <div className="gi-tag">一句话核心</div>
              <p className="gi-quote">投资成功靠的不是智商，而是纪律与情绪控制：用“安全边际”买入，把市场的情绪当工具，而不是主人。</p>
              <p className="gi-p" style={{ marginBottom: 0 }}>
                这本书不教你预测股价，而是塑造你面对市场的“性情”。它区分投资与投机、教你认清自己是哪种投资者，并交给你两件传家宝——
                <b>市场先生</b>和<b>安全边际</b>。下面 7 章，几乎每章都能亲手玩一玩。
              </p>
            </div>
            <p className="gi-mini" style={{ textAlign: "center", marginTop: 14 }}>点击下方「下一章」开始，或上方目录任意跳转</p>
          </div>
        );

      case 1:
        return (
          <div className="gi-anim">
            <span className="gi-tag"><Scale size={13} /> 第 1 章 · 地基</span>
            <h2 className="gi-h">先分清：你在投资，还是在投机？</h2>
            <p className="gi-lead">格雷厄姆给“投资”下了一个著名定义——不满足它的，都是投机。</p>
            <div className="gi-card" style={{ marginBottom: 14 }}>
              <div className="gi-tag" style={{ marginBottom: 6 }}>投资的定义</div>
              <p className="gi-p" style={{ marginBottom: 0, color: "var(--ink)" }}>
                投资操作 = ① 经过<b>透彻分析</b>，② <b>保障本金安全</b>，③ 获得<b>满意（而非暴利）的回报</b>。三者缺一，即为投机。
              </p>
            </div>
            <div className="gi-card">
              <div className="gi-mini" style={{ marginBottom: 10 }}>试着判断下面每种行为——点一下看格雷厄姆怎么说：</div>
              <QuizBlock />
            </div>
            <p className="gi-p" style={{ marginTop: 14, marginBottom: 0 }}>
              他并不反对投机，但要求你<b>分清楚</b>，并只拿小钱、用专门账户去投机，绝不和正经投资混为一谈。
            </p>
          </div>
        );

      case 2:
        return (
          <div className="gi-anim">
            <span className="gi-tag"><Users size={13} /> 第 2 章 · 认识你自己</span>
            <h2 className="gi-h">你是“防御型”还是“进取型”投资者？</h2>
            <p className="gi-lead">格雷厄姆把投资者分成两类。区别不在钱多钱少，而在你愿意付出多少精力、是否扛得住。</p>
            <AssessBlock />
            <p className="gi-p" style={{ marginTop: 14, marginBottom: 0 }}>
              关键提醒：<b>大多数人其实是防御型</b>。“进取”不等于“频繁交易”——真正的进取需要大量功课和纪律，多数自以为积极的人，反而因瞎折腾而亏得更多。
            </p>
          </div>
        );

      case 3:
        return (
          <div className="gi-anim">
            <span className="gi-tag"><Gauge size={13} /> 第 3 章 · 传家宝之一（第 8 章）</span>
            <h2 className="gi-h">市场先生：一个情绪极不稳定的合伙人</h2>
            <p className="gi-lead">
              想象你和一位叫“市场先生”的人合伙开公司。他每天都来报一个价，要么买你的股份、要么把他的卖你。问题是——他喜怒无常。
            </p>
            <div className="gi-card">
              <div className="gi-stage">
                <div style={{ textAlign: "center" }}>
                  <Face mood={day.m} />
                  <div className="gi-mini" style={{ marginTop: 4, color: "var(--ink)" }}>今日心情：<b>{moodWord(day.m)}</b></div>
                </div>
                <div className="gi-quotebox">
                  <div className="gi-mini">市场先生今天的报价</div>
                  <div className="gi-bigprice" style={{ color: day.p / VALUE <= 0.8 ? "var(--green)" : day.p / VALUE >= 1.2 ? "var(--ox)" : "var(--ink)" }}>{fmt(day.p)}</div>
                  <div className="gi-mini" style={{ marginTop: 2 }}>而公司的内在价值 ≈ <b style={{ color: "var(--green)" }}>¥{VALUE}</b>（长期不太变）</div>
                  <div className="gi-gauge"><i style={{ left: `${(day.m + 1) / 2 * 100}%` }} /></div>
                  <div className="gi-mini" style={{ display: "flex", justifyContent: "space-between" }}><span>恐慌</span><span>狂热</span></div>
                </div>
              </div>
              <div style={{ marginTop: 12 }}><Spark history={hist} last={day.p} /></div>
              <div className="gi-actions">
                <button className="gi-act" onClick={() => decide("buy")}>买入</button>
                <button className="gi-act" onClick={() => decide("sell")}>卖出</button>
                <button className="gi-act" onClick={() => decide("hold")}>不理他</button>
                <button className="gi-btn" onClick={newDay}><RefreshCw size={14} /> 新的一天</button>
              </div>
              {act && <div className={`gi-verdict ${act.kind} gi-anim`}>{act.text}</div>}
            </div>
            <p className="gi-p" style={{ marginTop: 14, marginBottom: 0 }}>
              格雷厄姆的教诲：<b>市场先生是来服务你的，不是来指挥你的。</b>他的情绪给你买卖的机会，但绝不该定义价值。多玩几天你会发现——
              聪明的做法很无聊：他恐慌时考虑买、狂热时考虑卖或干脆不理，永远以“价值”而非“报价”为锚。
            </p>
          </div>
        );

      case 4:
        return (
          <div className="gi-anim">
            <span className="gi-tag"><ShieldCheck size={13} /> 第 4 章 · 传家宝之二（第 20 章）</span>
            <h2 className="gi-h">安全边际：用三个字概括稳健投资</h2>
            <p className="gi-lead">
              价值是公司“值多少”，价格是市场“要多少”。<b>安全边际</b>就是两者之间的折让——价格越低于价值，你犯错或遇到坏运气时的缓冲就越厚。
            </p>
            <div className="gi-card">
              <div className="gi-mini" style={{ marginBottom: 22 }}>拖动滑块改变“当前价格”，内在价值固定为 ¥{VALUE}：</div>
              <div className="gi-track">
                <div className="gi-zone" style={{ left: 0, width: `${buyPct}%`, background: "rgba(31,93,68,.18)" }} />
                <div className="gi-zone" style={{ left: `${buyPct}%`, width: `${valuePct - buyPct}%`, background: "rgba(154,122,51,.16)" }} />
                <div className="gi-zone" style={{ left: `${valuePct}%`, width: `${100 - valuePct}%`, background: "rgba(138,47,44,.14)" }} />
                <div className="gi-vline" style={{ left: `${valuePct}%` }} /><div className="gi-vlabel" style={{ left: `${valuePct}%` }}>价值 ¥{VALUE}</div>
                <div className="gi-marker" style={{ left: `${pricePct}%` }}>
                  <svg width="16" height="50" viewBox="0 0 16 50"><polygon points="8,0 14,9 2,9" fill={INK} /><line x1="8" y1="9" x2="8" y2="50" stroke={INK} strokeWidth="2" /></svg>
                </div>
              </div>
              <input className="gi-range" style={{ marginTop: 10 }} type="range" min="20" max="90" step="1" value={price} onChange={(e) => setPrice(+e.target.value)} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span className="gi-num" style={{ fontSize: 15 }}>当前价格 <b style={{ fontFamily: "var(--serif)", fontSize: 22 }}>{fmt(price)}</b></span>
                <span className="gi-pill2" style={{ background: mosCls === "v-good" ? "rgba(31,93,68,.14)" : mosCls === "v-bad" ? "rgba(138,47,44,.14)" : "var(--paper2)", color: mosCls === "v-good" ? "#184c38" : mosCls === "v-bad" ? "#7a2926" : "var(--ink2)" }}>
                  {disc >= 0 ? `折让 ${disc.toFixed(0)}%` : `溢价 ${(-disc).toFixed(0)}%`}
                </span>
              </div>
              <div className={`gi-verdict ${mosCls}`} style={{ marginTop: 12 }}>{mosLabel}</div>
            </div>
            <p className="gi-p" style={{ marginTop: 14, marginBottom: 0 }}>
              为什么它如此重要？因为你对“价值”的估算一定不完美，未来也总有意外。<b>足够的安全边际，让你即使算错一点、运气差一点，依然不至于亏大钱。</b>
              这正是格雷厄姆与单纯“买便宜货”的区别——他要的是“被低估”，更要的是“错了也亏得起”。
            </p>
          </div>
        );

      case 5:
        return (
          <div className="gi-anim">
            <span className="gi-tag"><Calculator size={13} /> 第 5 章 · 把价值算出来</span>
            <h2 className="gi-h">格雷厄姆数字：一道粗略的“别买贵”上限</h2>
            <p className="gi-lead">对防御型投资者，他给出一个简便公式来估算“最高合理价”。拖动滑块输入公司数据试试：</p>
            <div className="gi-card">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="gi-slider"><label>每股收益 EPS <b className="gi-num">¥{eps.toFixed(1)}</b></label>
                  <input className="gi-range" type="range" min="0" max="10" step="0.1" value={eps} onChange={(e) => setEps(+e.target.value)} /></div>
                <div className="gi-slider"><label>每股净资产 BVPS <b className="gi-num">¥{bvps}</b></label>
                  <input className="gi-range" type="range" min="0" max="60" step="1" value={bvps} onChange={(e) => setBvps(+e.target.value)} /></div>
              </div>
              <hr className="gi-rule" />
              <div style={{ textAlign: "center" }}>
                <div className="gi-mini">格雷厄姆数字 ≈ √(22.5 × EPS × 每股净资产)</div>
                <div className="gi-stat" style={{ fontSize: 40, color: "var(--green)", margin: "6px 0" }}>{gn > 0 ? fmt(gn) : "—"}</div>
                <div className="gi-mini">{gn > 0 ? "即合理买入价的粗略上限" : "公司需有正的盈利与净资产"}</div>
              </div>
              <hr className="gi-rule" />
              <div className="gi-slider"><label>当前股价 <b className="gi-num">{fmt(gprice)}</b></label>
                <input className="gi-range" type="range" min="1" max="100" step="1" value={gprice} onChange={(e) => setGprice(+e.target.value)} /></div>
              {gn > 0 && (
                <div className={`gi-verdict ${gnOk ? "v-good" : "v-bad"}`} style={{ marginTop: 10 }}>
                  {gnOk ? `股价 ${fmt(gprice)} ≤ 格雷厄姆数字 ${fmt(gn)} — 符合这条粗略的买入上限。` : `股价 ${fmt(gprice)} > 格雷厄姆数字 ${fmt(gn)} — 偏贵，安全边际不足。`}
                </div>
              )}
            </div>
            <div className="gi-card" style={{ marginTop: 14 }}>
              <div className="gi-tag" style={{ marginBottom: 4 }}>22.5 从哪来 & 防御型选股清单</div>
              <p className="gi-p" style={{ marginBottom: 10 }}>22.5 = 市盈率 ≤ 15 × 市净率 ≤ 1.5。它把“盈利不太贵”和“资产不太贵”合并成一道门槛。完整清单：</p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {[
                  ["足够规模", "避开太小、太脆弱的公司"],
                  ["财务稳健", "流动比率 ≥ 2，长期债务不超过营运资本"],
                  ["盈利稳定", "近 10 年持续盈利，无亏损年"],
                  ["持续分红", "有长期不间断的分红记录"],
                  ["盈利增长", "近 10 年每股收益增长 ≥ 1/3"],
                  ["估值适中", "P/E ≤ 15、P/B ≤ 1.5，且两者相乘 ≤ 22.5"],
                ].map(([t, d], i) => (
                  <li className="gi-li" key={i}>
                    <div className="gi-badge"><Check size={15} /></div>
                    <div><b style={{ fontFamily: "var(--serif)", fontSize: 15 }}>{t}</b><div className="gi-mini" style={{ color: "var(--ink2)", fontFamily: "Newsreader,serif", fontSize: 13 }}>{d}</div></div>
                  </li>
                ))}
              </ul>
            </div>
            <p className="gi-p" style={{ marginTop: 14, marginBottom: 0 }}>
              <AlertTriangle size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} color="var(--ox)" />
              这是<b>粗筛工具</b>，最适合稳定、重资产的传统公司；对高增长、轻资产的科技股常常失灵。它帮你排除明显太贵的，而非选出最好的。
            </p>
          </div>
        );

      case 6:
        return (
          <div className="gi-anim">
            <span className="gi-tag"><RefreshCw size={13} /> 第 6 章 · 简单而强大的纪律</span>
            <h2 className="gi-h">股债配置与再平衡：机械化的“低买高卖”</h2>
            <p className="gi-lead">
              格雷厄姆的建议朴素得惊人：股票仓位<b>始终保持在 25%–75% 之间</b>，拿不准就 50/50，然后靠“再平衡”自动纪律化操作。
            </p>
            <div className="gi-card">
              <div className="gi-slider"><label>目标股票比例（格雷厄姆建议区间 25–75%）<b className="gi-num">{target}% / {100 - target}%</b></label>
                <input className="gi-range" type="range" min="25" max="75" step="5" value={target} onChange={(e) => setTgt(+e.target.value)} /></div>
              <div className="gi-mini" style={{ margin: "12px 0 4px" }}>目标配置</div>
              <div className="gi-bar"><div style={{ width: `${target}%`, background: GREEN }} /><div style={{ width: `${100 - target}%`, background: BRASS }} /></div>
              <div className="gi-mini" style={{ margin: "14px 0 4px" }}>当前组合（受涨跌影响后）— 股票 {sw}% / 债券 {100 - sw}%</div>
              <div className="gi-bar"><div style={{ width: `${sw}%`, background: GREEN, transition: ".25s" }} /><div style={{ width: `${100 - sw}%`, background: BRASS, transition: ".25s" }} /></div>
              <div className="gi-actions">
                <button className="gi-act" onClick={() => market(1.3, "股市大涨 +30%")}><TrendingUp size={14} style={{ verticalAlign: "-2px" }} /> 牛市 +30%</button>
                <button className="gi-act" onClick={() => market(0.7, "股市大跌 −30%")}><TrendingDown size={14} style={{ verticalAlign: "-2px" }} /> 熊市 −30%</button>
                <button className="gi-btn" onClick={rebalance}><Target size={14} /> 一键再平衡</button>
              </div>
              {rbMsg && <div className="gi-verdict v-neutral gi-anim">{rbMsg}</div>}
            </div>
            <p className="gi-p" style={{ marginTop: 14, marginBottom: 0 }}>
              妙处在于：你不需要预测市场。涨多了，股票占比超标，再平衡逼你<b>卖出（高卖）</b>；跌多了，占比不足，再平衡逼你<b>买入（低买）</b>。
              一条机械规则，替你对抗了贪婪与恐惧。
            </p>
          </div>
        );

      case 7:
        return (
          <div className="gi-anim">
            <span className="gi-tag"><Brain size={13} /> 第 7 章 · 全书的灵魂</span>
            <h2 className="gi-h">投资者最大的敌人，往往是自己</h2>
            <p className="gi-lead">格雷厄姆反复强调：决定你成败的，不是市场或智商，而是你能否管住情绪、守住纪律。带走这几条：</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }} className="gi-card">
              {[
                [Scale, "先分清投资与投机", "没有透彻分析与本金保障的，都是投机；要分开对待。"],
                [Users, "诚实评估自己属于哪型", "多数人是防御型；与其勉强“进取”，不如把简单的事做对。"],
                [Gauge, "把市场先生当仆人", "用他的情绪占便宜，永远别让报价定义价值。"],
                [ShieldCheck, "永远留足安全边际", "买在价值之下，给错误和坏运气留缓冲。"],
                [RefreshCw, "用配置与再平衡自律", "守住 25–75% 区间，机械地低买高卖。"],
              ].map(([Ic, t, d], i) => (
                <li className="gi-li" key={i}>
                  <div className="gi-badge"><Ic size={15} /></div>
                  <div><b style={{ fontFamily: "var(--serif)", fontSize: 15.5 }}>{t}</b><div className="gi-mini" style={{ color: "var(--ink2)", fontFamily: "Newsreader,serif", fontSize: 13 }}>{d}</div></div>
                </li>
              ))}
            </ul>
            <div className="gi-note">
              <div className="gi-tag" style={{ marginBottom: 4 }}>读这本书前要知道</div>
              <p className="gi-p" style={{ marginBottom: 0 }}>
                它比《漫步华尔街》更<b>硬核、也更老</b>：成书于上世纪，案例与具体指标偏美国旧市场，部分量化标准（如净资产折价股）在今天很难找到，需要灵活看待。
                强烈建议读<b>含 Zweig 评注的版本</b>，他把格雷厄姆的原理对照了互联网泡沫等现代案例。原理（性情、安全边际、市场先生）至今不过时；死板的数字则要与时俱进。
              </p>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="gi-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gi-progress"><i style={{ width: `${(ch / (total - 1)) * 100}%` }} /></div>
      <div className="gi-wrap">
        <div className="gi-top"><GraduationCap size={14} /> 聪明的投资者 · 互动导读</div>
        <div className="gi-chips">
          {CHAPTERS.map((c, i) => { const Ic = c.icon; return (
            <button key={i} className={`gi-chip ${i === ch ? "on" : ""}`} onClick={() => setCh(i)}><Ic size={13} /> {i}. {c.t}</button>
          ); })}
        </div>
        {render()}
      </div>
      <div className="gi-nav">
        <button className="gi-btn" disabled={ch === 0} onClick={() => setCh(c => Math.max(0, c - 1))}><ArrowLeft size={14} /> 上一章</button>
        <span className="gi-pageno">{ch + 1} / {total}</span>
        <button className="gi-btn" disabled={ch === total - 1} onClick={() => setCh(c => Math.min(total - 1, c + 1))}>下一章 <ArrowRight size={14} /></button>
      </div>
    </div>
  );
}

/* ---- Ch1 quiz ---- */
function QuizBlock() {
  const [ans, setAns] = useState({});
  return (
    <div>
      {QUIZ.map((q, i) => {
        const chosen = ans[i];
        return (
          <div key={i} style={{ padding: "12px 0", borderBottom: i < QUIZ.length - 1 ? "1px dashed var(--line)" : "none" }}>
            <p style={{ fontFamily: "Newsreader,serif", fontSize: 14.5, lineHeight: 1.55, margin: "0 0 9px", color: "var(--ink)" }}>{i + 1}. {q.s}</p>
            <div className="gi-opt">
              {["投资", "投机"].map((opt) => {
                let cls = "gi-optbtn";
                if (chosen) { if (opt === q.a) cls += " correct"; else if (opt === chosen) cls += " wrong"; }
                return <button key={opt} className={cls} onClick={() => !chosen && setAns(a => ({ ...a, [i]: opt }))}>{opt}</button>;
              })}
            </div>
            {chosen && (
              <div className="gi-mini gi-anim" style={{ marginTop: 8, color: chosen === q.a ? "#184c38" : "#7a2926", fontFamily: "Newsreader,serif", fontSize: 13, lineHeight: 1.5 }}>
                {chosen === q.a ? <Check size={13} style={{ verticalAlign: "-2px" }} /> : <X size={13} style={{ verticalAlign: "-2px" }} />} 正确答案：{q.a}。{q.why}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---- Ch2 self-assessment ---- */
const AS_Q = [
  { q: "你每周愿意花在研究投资上的时间？", o: [["几乎没有", "D"], ["愿意投入大量时间", "E"]] },
  { q: "你是否享受钻研财报、做逆向思考？", o: [["不太喜欢", "D"], ["很享受", "E"]] },
  { q: "你的主要目标是？", o: [["省心、拿到市场平均、避免大错", "D"], ["愿担风险，努力超越市场", "E"]] },
];
function AssessBlock() {
  const [pick, setPick] = useState({});
  const done = Object.keys(pick).length === AS_Q.length;
  const eCount = Object.values(pick).filter(v => v === "E").length;
  const type = eCount >= 2 ? "E" : "D";
  return (
    <div className="gi-card">
      {AS_Q.map((q, i) => (
        <div key={i} style={{ padding: "10px 0", borderBottom: i < AS_Q.length - 1 ? "1px dashed var(--line)" : "none" }}>
          <p style={{ fontFamily: "Newsreader,serif", fontSize: 14.5, margin: "0 0 9px", color: "var(--ink)" }}>{i + 1}. {q.q}</p>
          <div className="gi-opt">
            {q.o.map(([label, v]) => (
              <button key={label} className={`gi-optbtn ${pick[i] === v ? "correct" : ""}`} onClick={() => setPick(p => ({ ...p, [i]: v }))}>{label}</button>
            ))}
          </div>
        </div>
      ))}
      {done && (
        <div className={`gi-verdict ${type === "E" ? "v-neutral" : "v-good"} gi-anim`} style={{ marginTop: 14 }}>
          {type === "D" ? (
            <><b>格雷厄姆会把你归为「防御型投资者」。</b><br />推荐路线：高等级债券 + 广泛分散的优质股（或低成本指数基金），定期定额、机械再平衡，几乎不折腾。目标是“避免重大错误”，稳稳拿到令人满意的平均回报。</>
          ) : (
            <><b>你倾向于「进取型投资者」。</b><br />推荐路线：愿投入时间与心力，去寻找被市场低估的“便宜货”，争取超越平均。但务必严守安全边际与纪律——否则“进取”只会变成“瞎忙”。</>
          )}
        </div>
      )}
      {!done && <div className="gi-mini" style={{ marginTop: 12 }}>选完三题即可看到格雷厄姆给你的归类与建议。</div>}
    </div>
  );
}
