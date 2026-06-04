import React, { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  BookOpen, Footprints, Scale, TrendingDown, Activity, Coins, PiggyBank,
  ShieldCheck, ArrowLeft, ArrowRight, Sparkles, Mountain, Cloud,
  AlertTriangle, RefreshCw, Repeat, Clock, CircleDollarSign,
} from "lucide-react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

:root{
  --paper:#f4ecdd; --paper-deep:#e9ddc6; --card:#fbf7ee;
  --ink:#22190f; --ink2:#62513c; --line:#d9c7a6;
  --gold:#a9761d; --gold2:#cf9633; --green:#2e6f4e; --red:#a83a28;
  --dark:#1b140c; --dark2:#241a0f; --onDark:#f1e6d2; --onDark2:#cab288;
}
.rw-root{
  --serif:'Playfair Display', Georgia, 'Times New Roman', serif;
  --mono:'IBM Plex Mono','SFMono-Regular',Menlo,Consolas,monospace;
  font-family: Georgia,'Times New Roman',serif;
  color:var(--ink); background:var(--paper);
  background-image: radial-gradient(120% 80% at 50% -10%, rgba(255,255,255,.55), transparent 60%);
  min-height:100%; position:relative; -webkit-font-smoothing:antialiased;
}
.rw-progress{height:3px;background:var(--paper-deep);width:100%}
.rw-progress > i{display:block;height:100%;background:linear-gradient(90deg,var(--gold),var(--gold2));transition:width .45s ease}
.rw-wrap{max-width:780px;margin:0 auto;padding:18px 18px 120px}
.rw-topbar{display:flex;align-items:center;gap:8px;color:var(--ink2);font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;padding:14px 2px 10px}
.rw-chips{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 12px;scrollbar-width:none}
.rw-chips::-webkit-scrollbar{display:none}
.rw-chip{flex:0 0 auto;display:flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--card);color:var(--ink2);
  font-family:var(--mono);font-size:12px;padding:7px 11px;border-radius:999px;cursor:pointer;white-space:nowrap;transition:all .18s ease}
.rw-chip:hover{border-color:var(--gold)}
.rw-chip.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.rw-kicker{font-family:var(--mono);text-transform:uppercase;letter-spacing:.24em;font-size:11px;color:var(--gold);margin-bottom:10px}
.rw-display{font-family:var(--serif);font-weight:800;line-height:1.04;letter-spacing:-.01em;color:var(--ink)}
.rw-h{font-family:var(--serif);font-weight:700;font-size:25px;line-height:1.12;margin:0 0 6px}
.rw-lead{font-size:16px;line-height:1.66;color:var(--ink);margin:0 0 14px}
.rw-p{font-size:15px;line-height:1.7;color:var(--ink2);margin:0 0 12px}
.rw-num{font-family:var(--mono);font-variant-numeric:tabular-nums}
.rw-anim{animation:rwUp .5s cubic-bezier(.2,.7,.2,1) both}
@keyframes rwUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.rw-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px}
.rw-rule{height:1px;background:var(--line);margin:18px 0;border:0}
.rw-grid2{display:grid;grid-template-columns:1fr;gap:14px}
@media(min-width:620px){.rw-grid2{grid-template-columns:1fr 1fr}}
.rw-btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:13px;border:1px solid var(--ink);
  background:transparent;color:var(--ink);padding:9px 14px;border-radius:999px;cursor:pointer;transition:all .18s ease}
.rw-btn:hover{background:var(--ink);color:var(--paper)}
.rw-btn:disabled{opacity:.35;cursor:not-allowed}
.rw-btn:disabled:hover{background:transparent;color:var(--ink)}
.rw-nav{position:sticky;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:10px;
  background:linear-gradient(180deg,rgba(244,236,221,0),var(--paper) 38%);padding:16px 18px;max-width:780px;margin:0 auto}
.rw-pageno{font-family:var(--mono);font-size:12px;color:var(--ink2);letter-spacing:.1em}
.rw-tag{display:inline-flex;align-items:center;gap:7px;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold)}
.rw-quote{font-family:var(--serif);font-style:italic;font-size:18px;line-height:1.5;color:var(--ink);border-left:3px solid var(--gold);padding-left:14px;margin:4px 0 16px}
.rw-slider{display:flex;flex-direction:column;gap:6px}
.rw-slider label{display:flex;justify-content:space-between;font-family:var(--mono);font-size:12px;color:var(--ink2)}
.rw-slider label b{color:var(--ink);font-weight:600}
.rw-range{width:100%;accent-color:var(--gold);height:22px;cursor:pointer}
.rw-stat{font-family:var(--serif);font-weight:800;line-height:1}
.rw-mini{font-family:var(--mono);font-size:11px;color:var(--ink2);letter-spacing:.04em}
.rw-grid-dots{display:grid;grid-template-columns:repeat(10,1fr);gap:4px}
.rw-dot{aspect-ratio:1;border-radius:3px}
.rw-list{margin:0;padding:0;list-style:none}
.rw-li{display:flex;gap:12px;padding:12px 0;border-bottom:1px dashed var(--line)}
.rw-li:last-child{border-bottom:0}
.rw-badge{flex:0 0 auto;width:30px;height:30px;border-radius:8px;display:grid;place-items:center;background:var(--paper-deep);color:var(--gold)}
.rw-tl{position:relative}
.rw-tlrow{display:flex;gap:14px;align-items:center;padding:11px 0;border-bottom:1px dashed var(--line)}
.rw-tlrow:last-child{border-bottom:0}
.rw-spark{flex:0 0 auto;width:96px;height:40px}
.rw-cover{background:var(--dark);background-image:radial-gradient(110% 90% at 70% 10%,rgba(207,150,51,.18),transparent 55%);
  color:var(--onDark);border-radius:18px;padding:30px 24px;position:relative;overflow:hidden}
.rw-cover .rw-display{color:var(--onDark)}
.rw-coverline{position:absolute;left:0;right:0;bottom:14px;opacity:.4}
.rw-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(202,178,136,.4);color:var(--onDark2);
  font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;padding:5px 11px;border-radius:999px}
`;

/* ---------- helpers ---------- */
function genWalk(n = 64, step = 7) {
  const arr = [0];
  for (let i = 1; i < n; i++) arr.push(arr[i - 1] + (Math.random() - 0.5) * 2 * step);
  const min = Math.min(...arr), max = Math.max(...arr), W = 340, H = 130, p = 10;
  const sx = (W - 2 * p) / (n - 1), sy = (H - 2 * p) / Math.max(1e-6, max - min);
  return arr.map((v, i) => `${i === 0 ? "M" : "L"}${(p + i * sx).toFixed(1)} ${(H - p - (v - min) * sy).toFixed(1)}`).join(" ");
}
function seeded(i, k) { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }
function boomBust(i) {
  const n = 26, peak = 12 + (i % 4), W = 96, H = 40, top = 30 + (i % 3) * 3;
  const ys = [];
  for (let k = 0; k < n; k++) {
    let v;
    if (k <= peak) v = 3 + (top - 3) * Math.pow(k / peak, 1.5) + seeded(i, k) * 2.4;
    else v = top * Math.exp(-(k - peak) * 0.55) + 2 + seeded(i, k) * 1.4;
    ys.push(v);
  }
  const sx = W / (n - 1);
  const d = ys.map((v, k) => `${k === 0 ? "M" : "L"}${(k * sx).toFixed(1)} ${(H - 4 - v).toFixed(1)}`).join(" ");
  return { d, px: (peak * sx).toFixed(1), py: (H - 4 - ys[peak]).toFixed(1) };
}
const wan = (v) => (v / 10000);
const fmtWan = (v) => `${wan(v).toLocaleString("zh-CN", { maximumFractionDigits: 0 })} 万`;

/* ---------- data ---------- */
const CHAPTERS = [
  { t: "扉页", icon: BookOpen },
  { t: "随机漫步", icon: Footprints },
  { t: "两种估值理论", icon: Scale },
  { t: "泡沫简史", icon: TrendingDown },
  { t: "有效市场假说", icon: Activity },
  { t: "费率的威力", icon: Coins },
  { t: "生命周期投资", icon: PiggyBank },
  { t: "给新手的要点", icon: ShieldCheck },
];

const BUBBLES = [
  { y: "1637", n: "郁金香狂热", pl: "荷兰", note: "一株稀有球茎一度能换一栋运河别墅" },
  { y: "1720", n: "南海泡沫", pl: "英国", note: "连牛顿都亏到说“我能算出天体运行，算不出人的疯狂”" },
  { y: "1929", n: "大崩盘", pl: "美国", note: "“咆哮的二十年代”戛然而止，引爆大萧条" },
  { y: "1970s", n: "漂亮 50", pl: "美国", note: "“只买不卖”的明星蓝筹神话最终破灭" },
  { y: "1989", n: "日本资产泡沫", pl: "日本", note: "东京地价一度号称“能买下整个美国”" },
  { y: "2000", n: "互联网泡沫", pl: "全球", note: "有故事没利润的 .com 公司集体退潮" },
  { y: "2008", n: "房地产/次贷", pl: "美国", note: "“房价永远涨”的信仰被彻底证伪" },
  { y: "2021", n: "模因股与加密", pl: "全球", note: "社交媒体助推的新一轮投机狂热" },
];

/* ---------- component ---------- */
export default function App() {
  const [ch, setCh] = useState(0);
  const [walks, setWalks] = useState(() => [genWalk(), genWalk(), genWalk()]);
  const [revealed, setRevealed] = useState(false);
  const coverWalk = useMemo(() => genWalk(80, 5), []);
  const sparks = useMemo(() => BUBBLES.map((_, i) => boomBust(i)), []);

  // fee simulator
  const [monthly, setMonthly] = useState(3000);
  const [years, setYears] = useState(30);
  const [gross, setGross] = useState(7);
  const [activeFee, setActiveFee] = useState(1.5);
  const indexFee = 0.1;
  const feeData = useMemo(() => {
    const annual = monthly * 12, ni = (gross - indexFee) / 100, na = (gross - activeFee) / 100;
    let bi = 0, ba = 0; const rows = [{ year: 0, idx: 0, act: 0, principal: 0 }];
    for (let y = 1; y <= years; y++) {
      bi = bi * (1 + ni) + annual; ba = ba * (1 + na) + annual;
      rows.push({ year: y, idx: Math.round(bi), act: Math.round(ba), principal: annual * y });
    }
    return rows;
  }, [monthly, years, gross, activeFee]);
  const endIdx = feeData[feeData.length - 1].idx;
  const endAct = feeData[feeData.length - 1].act;
  const gap = endIdx - endAct;

  // life-cycle
  const [age, setAge] = useState(30);
  const stocks = Math.max(30, Math.min(88, 115 - age));
  const cash = 5;
  const bonds = 100 - stocks - cash;

  const total = CHAPTERS.length;

  const renderChapter = () => {
    switch (ch) {
      /* ---- 0 COVER ---- */
      case 0:
        return (
          <div className="rw-anim">
            <div className="rw-cover">
              <span className="rw-pill"><Sparkles size={13} /> 投资经典 · 1973 年初版</span>
              <h1 className="rw-display" style={{ fontSize: 40, margin: "18px 0 6px" }}>漫步华尔街</h1>
              <p className="rw-num" style={{ color: "var(--onDark2)", fontSize: 13, letterSpacing: ".06em", margin: 0 }}>
                A Random Walk Down Wall Street
              </p>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--onDark)", marginTop: 16, fontSize: 17 }}>
                作者：伯顿·马尔基尔（Burton G. Malkiel）<br />普林斯顿大学经济学教授
              </p>
              <svg className="rw-coverline" viewBox="0 0 340 130" preserveAspectRatio="none" width="100%" height="86">
                <path d={coverWalk} fill="none" stroke="var(--gold2)" strokeWidth="1.4" />
              </svg>
            </div>
            <div className="rw-card" style={{ marginTop: 16 }}>
              <div className="rw-kicker">一句话核心</div>
              <p className="rw-quote">
                既然连专业人士都很难持续战胜市场，普通人最聪明的做法，就是用极低的成本“买下整个市场”，然后长期持有。
              </p>
              <p className="rw-p" style={{ marginBottom: 0 }}>
                这本被无数投资者奉为“入门第一书”的著作，已更新到 50 周年纪念版（第 13 版），半个世纪里反复加印。它不教你选股技巧，
                而是用历史、数据和逻辑，劝你别去做一件大概率会输的事——主动择股、追涨杀跌、相信能跑赢大盘。下面分 7 章带你看完它的主线。
              </p>
            </div>
            <p className="rw-mini" style={{ textAlign: "center", marginTop: 14 }}>点击下方 →「下一章」开始，或上方目录任意跳转</p>
          </div>
        );

      /* ---- 1 RANDOM WALK ---- */
      case 1:
        return (
          <div className="rw-anim">
            <span className="rw-tag"><Footprints size={13} /> 第 1 章 · 核心隐喻</span>
            <h2 className="rw-h">股价的下一步，无法从过去推断</h2>
            <p className="rw-lead">
              “随机漫步”指的是：股价短期的走势，更像是随机的脚步，今天的涨跌几乎不携带“明天会怎样”的可靠信息。
            </p>
            <div className="rw-card">
              <div className="rw-mini" style={{ marginBottom: 10 }}>下面三条都是程序随机生成的“走势”——你能看出哪条是“真股票”吗？</div>
              <svg viewBox="0 0 340 130" width="100%" height="150">
                <path d={walks[0]} fill="none" stroke="var(--ink)" strokeWidth="1.8" />
                <path d={walks[1]} fill="none" stroke="var(--green)" strokeWidth="1.8" opacity=".85" />
                <path d={walks[2]} fill="none" stroke="var(--gold)" strokeWidth="1.8" opacity=".85" />
              </svg>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                <button className="rw-btn" onClick={() => { setWalks([genWalk(), genWalk(), genWalk()]); setRevealed(false); }}>
                  <RefreshCw size={14} /> 再生成一次
                </button>
                <button className="rw-btn" onClick={() => setRevealed(true)}>揭晓答案</button>
              </div>
              {revealed && (
                <p className="rw-p rw-anim" style={{ marginTop: 12, marginBottom: 0, color: "var(--ink)" }}>
                  <b>答案：三条全是抛硬币画出来的随机数。</b> 它们照样会出现“上升趋势”“头肩顶”“支撑位”这些技术分析的招牌形态。
                  马尔基尔当年真让学生用抛硬币的结果作图，结果“技术派”朋友看了大喊“快买！”——这正是他想戳破的幻觉。
                </p>
              )}
            </div>
            <p className="rw-p" style={{ marginTop: 14 }}>
              由此他得出第一个结论：靠看 K 线图找规律的<b>技术分析</b>，长期看并不比“买入持有”更赚钱。我们大脑天生爱在噪声里找模式，
              而市场恰恰把可预测的部分都提前消化掉了。
            </p>
          </div>
        );

      /* ---- 2 TWO THEORIES ---- */
      case 2:
        return (
          <div className="rw-anim">
            <span className="rw-tag"><Scale size={13} /> 第 2 章 · 价值从何而来</span>
            <h2 className="rw-h">两种解释价格的理论，都不完美</h2>
            <p className="rw-lead">书里把人们给资产定价的逻辑归为两派，理解它们能帮你看懂市场为什么会疯。</p>
            <div className="rw-grid2">
              <div className="rw-card">
                <Mountain size={26} color="var(--green)" />
                <h3 className="rw-h" style={{ fontSize: 19, marginTop: 10 }}>磐石理论</h3>
                <div className="rw-mini" style={{ marginBottom: 8 }}>Firm-Foundation Theory</div>
                <p className="rw-p" style={{ marginBottom: 0 }}>
                  每项资产都有一块“内在价值”的磐石——由盈利、分红、增长决定。价格偏离了，迟早会被拉回来。
                  这是价值投资的根基。问题在于：未来的盈利和增长，谁也算不准。
                </p>
              </div>
              <div className="rw-card">
                <Cloud size={26} color="var(--gold)" />
                <h3 className="rw-h" style={{ fontSize: 19, marginTop: 10 }}>空中楼阁理论</h3>
                <div className="rw-mini" style={{ marginBottom: 8 }}>Castle-in-the-Air Theory</div>
                <p className="rw-p" style={{ marginBottom: 0 }}>
                  凯恩斯的视角：价格由群体心理决定。你买入不是因为它值多少，而是赌“会有下一个人出更高价”。
                  泡沫期它威力惊人，但楼阁建在空气上——人群转身，价格就崩。
                </p>
              </div>
            </div>
            <p className="rw-p" style={{ marginTop: 14, marginBottom: 0 }}>
              马尔基尔的态度是：两种力量都真实存在。正因为“空中楼阁”常常压过“磐石”，市场才会一次次走向狂热与崩溃——这就引出了下一章。
            </p>
          </div>
        );

      /* ---- 3 BUBBLES ---- */
      case 3:
        return (
          <div className="rw-anim">
            <span className="rw-tag"><TrendingDown size={13} /> 第 3 章 · 历史不会复制，但会押韵</span>
            <h2 className="rw-h">四百年泡沫简史</h2>
            <p className="rw-lead">书中花大量篇幅复盘历次狂热。它们的剧本惊人相似：新故事 → 价格狂飙 → 全民入场 → 崩盘。</p>
            <div className="rw-card rw-tl">
              {BUBBLES.map((b, i) => (
                <div className="rw-tlrow" key={b.y}>
                  <div style={{ flex: "0 0 52px" }}>
                    <div className="rw-num" style={{ fontSize: 15, color: "var(--gold)", fontWeight: 600 }}>{b.y}</div>
                  </div>
                  <svg className="rw-spark" viewBox="0 0 96 40">
                    <path d={sparks[i].d} fill="none" stroke="var(--green)" strokeWidth="1.6" />
                    <circle cx={sparks[i].px} cy={sparks[i].py} r="2.4" fill="var(--red)" />
                  </svg>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: 15 }}>{b.n}<span className="rw-mini" style={{ marginLeft: 8 }}>{b.pl}</span></div>
                    <div className="rw-mini" style={{ color: "var(--ink2)", marginTop: 2, fontFamily: "Georgia,serif", fontSize: 12.5 }}>{b.note}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="rw-p" style={{ marginTop: 14, marginBottom: 0 }}>
              <AlertTriangle size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} color="var(--red)" />
              结论不是“别投资”，而是：当所有人都在告诉你“这次不一样”、且身边的门外汉都在炒，往往就是该警惕的时候。
            </p>
          </div>
        );

      /* ---- 4 EMH ---- */
      case 4:
        return (
          <div className="rw-anim">
            <span className="rw-tag"><Activity size={13} /> 第 4 章 · 核心证据</span>
            <h2 className="rw-h">连专业人士也很难跑赢市场</h2>
            <p className="rw-lead">
              <b>有效市场假说</b>认为：公开信息已被迅速反映进价格，所以靠信息差“稳定超额获利”非常困难。证据就藏在基金的成绩单里。
            </p>
            <div className="rw-card">
              <div className="rw-mini" style={{ marginBottom: 10 }}>把时间拉长到 15–20 年，约 85–90% 的主动型基金跑不赢对应的指数（长期、跨市场反复出现的规律）：</div>
              <div className="rw-grid-dots">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="rw-dot" style={{ background: i < 88 ? "rgba(168,58,40,.78)" : "var(--green)" }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 18, marginTop: 12, flexWrap: "wrap" }}>
                <span className="rw-mini"><span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(168,58,40,.78)", borderRadius: 2, marginRight: 6, verticalAlign: "-1px" }} />跑输指数 ≈ 88</span>
                <span className="rw-mini"><span style={{ display: "inline-block", width: 10, height: 10, background: "var(--green)", borderRadius: 2, marginRight: 6, verticalAlign: "-1px" }} />跑赢指数 ≈ 12</span>
              </div>
            </div>
            <p className="rw-p" style={{ marginTop: 14, marginBottom: 0 }}>
              更扎心的是：今年跑赢的那一小撮，很难预测明年还在不在里面。既然如此，与其花高价买“可能跑赢”，不如直接、低价地买下整个市场——
              这就是下一章的主角：指数基金。
            </p>
          </div>
        );

      /* ---- 5 FEES ---- */
      case 5:
        return (
          <div className="rw-anim">
            <span className="rw-tag"><Coins size={13} /> 第 5 章 · 全书最实用的一招</span>
            <h2 className="rw-h">看似很小的费率，长期吃掉惊人的财富</h2>
            <p className="rw-lead">这是马尔基尔最坚定的建议：买<b>低成本、宽基指数基金</b>。拖动下面的滑块，亲眼看看费率差几十年后的差距。</p>
            <div className="rw-card">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="rw-slider">
                  <label>每月定投 <b className="rw-num">¥{monthly.toLocaleString()}</b></label>
                  <input className="rw-range" type="range" min="500" max="10000" step="500" value={monthly} onChange={(e) => setMonthly(+e.target.value)} />
                </div>
                <div className="rw-slider">
                  <label>投资年限 <b className="rw-num">{years} 年</b></label>
                  <input className="rw-range" type="range" min="10" max="40" step="1" value={years} onChange={(e) => setYears(+e.target.value)} />
                </div>
                <div className="rw-slider">
                  <label>年化毛收益 <b className="rw-num">{gross}%</b></label>
                  <input className="rw-range" type="range" min="4" max="10" step="0.5" value={gross} onChange={(e) => setGross(+e.target.value)} />
                </div>
                <div className="rw-slider">
                  <label>主动基金年费 <b className="rw-num">{activeFee}%</b></label>
                  <input className="rw-range" type="range" min="0.5" max="2.5" step="0.1" value={activeFee} onChange={(e) => setActiveFee(+e.target.value)} />
                </div>
              </div>
              <div style={{ height: 300, marginTop: 16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={feeData} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--ink2)", fontFamily: "var(--mono)" }} tickLine={false} axisLine={{ stroke: "var(--line)" }} />
                    <YAxis tickFormatter={(v) => `${Math.round(wan(v))}万`} width={46} tick={{ fontSize: 11, fill: "var(--ink2)", fontFamily: "var(--mono)" }} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(v, n) => [fmtWan(v), n]}
                      labelFormatter={(l) => `第 ${l} 年`}
                      contentStyle={{ fontFamily: "var(--mono)", fontSize: 12, borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)" }}
                    />
                    <Line name="指数基金 (费0.1%)" type="monotone" dataKey="idx" stroke="var(--green)" strokeWidth={2.4} dot={false} />
                    <Line name="主动基金" type="monotone" dataKey="act" stroke="var(--red)" strokeWidth={2.4} dot={false} />
                    <Line name="累计本金" type="monotone" dataKey="principal" stroke="var(--ink2)" strokeWidth={1.4} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <hr className="rw-rule" />
              <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div className="rw-stat" style={{ fontSize: 24, color: "var(--green)" }}>{fmtWan(endIdx)}</div>
                  <div className="rw-mini">指数基金终值</div>
                </div>
                <div>
                  <div className="rw-stat" style={{ fontSize: 24, color: "var(--red)" }}>{fmtWan(endAct)}</div>
                  <div className="rw-mini">主动基金终值</div>
                </div>
                <div>
                  <div className="rw-stat" style={{ fontSize: 24, color: "var(--gold)" }}>{fmtWan(gap)}</div>
                  <div className="rw-mini">仅费率差造成的差距</div>
                </div>
              </div>
            </div>
            <p className="rw-p" style={{ marginTop: 14, marginBottom: 0 }}>
              注意：上图里两只基金的<b>毛收益完全一样</b>，差距纯粹来自每年那点管理费。费率是少数你能 100% 掌控、且确定有效的变量——这正是它的分量。
            </p>
          </div>
        );

      /* ---- 6 LIFE CYCLE ---- */
      case 6:
        return (
          <div className="rw-anim">
            <span className="rw-tag"><PiggyBank size={13} /> 第 6 章 · 把策略落到自己身上</span>
            <h2 className="rw-h">生命周期资产配置</h2>
            <p className="rw-lead">书的后半段给出“按年龄调整仓位”的思路：越年轻，越能承受波动，股票比例越高；临近用钱，越偏稳健。</p>
            <div className="rw-card">
              <div className="rw-slider" style={{ marginBottom: 18 }}>
                <label>你的年龄 <b className="rw-num">{age} 岁</b></label>
                <input className="rw-range" type="range" min="22" max="70" step="1" value={age} onChange={(e) => setAge(+e.target.value)} />
              </div>
              <div style={{ display: "flex", height: 46, borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
                <div style={{ width: `${stocks}%`, background: "var(--green)", transition: "width .25s ease" }} />
                <div style={{ width: `${bonds}%`, background: "var(--gold)", transition: "width .25s ease" }} />
                <div style={{ width: `${cash}%`, background: "var(--ink2)", transition: "width .25s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, gap: 8 }}>
                <div><div className="rw-stat" style={{ fontSize: 22, color: "var(--green)" }}>{stocks}%</div><div className="rw-mini">股票 / 股票基金</div></div>
                <div style={{ textAlign: "center" }}><div className="rw-stat" style={{ fontSize: 22, color: "var(--gold)" }}>{bonds}%</div><div className="rw-mini">债券 / 债基</div></div>
                <div style={{ textAlign: "right" }}><div className="rw-stat" style={{ fontSize: 22, color: "var(--ink2)" }}>{cash}%</div><div className="rw-mini">现金 / 货基</div></div>
              </div>
            </div>
            <p className="rw-p" style={{ marginTop: 14, marginBottom: 0 }}>
              这只是书中“110（或100）减去年龄≈股票比例”这类经验法则的<b>示意</b>，并非给你的具体建议。真实配置还要看你的收入稳定性、负债、风险偏好和何时用钱。
            </p>
          </div>
        );

      /* ---- 7 TAKEAWAYS ---- */
      case 7:
        return (
          <div className="rw-anim">
            <span className="rw-tag"><ShieldCheck size={13} /> 第 7 章 · 带走这几条就够了</span>
            <h2 className="rw-h">给新手的行动清单</h2>
            <p className="rw-lead">如果你只记住整本书的几句话，马尔基尔大概会希望是这几条：</p>
            <ul className="rw-list rw-card">
              {[
                [Clock, "尽早开始、持续投入", "时间和复利是普通人最大的盟友，越早越好。"],
                [CircleDollarSign, "优先低成本宽基指数基金", "用极低费率买下“整个市场”，别为“可能跑赢”付高价。"],
                [Repeat, "定期定额、坚持不择时", "固定节奏投入（定投），别想猜顶猜底。"],
                [Scale, "分散，别把鸡蛋放一个篮子", "跨资产、跨地区分散，降低单一风险。"],
                [ShieldCheck, "定期再平衡、管住情绪", "涨多了的卖一点、跌多了的补一点；最大的敌人常是自己。"],
              ].map(([Ic, t, d], i) => (
                <li className="rw-li" key={i}>
                  <div className="rw-badge"><Ic size={16} /></div>
                  <div>
                    <div style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: 15.5 }}>{t}</div>
                    <div className="rw-mini" style={{ color: "var(--ink2)", fontFamily: "Georgia,serif", fontSize: 13, marginTop: 2 }}>{d}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="rw-card" style={{ marginTop: 14, background: "var(--paper-deep)" }}>
              <div className="rw-kicker">也要知道它的争议</div>
              <p className="rw-p" style={{ marginBottom: 0 }}>
                “市场完全有效”是一种<b>理论简化</b>。行为金融学、巴菲特等长期赢家、以及历次泡沫，都说明价格并不总是理性的。
                但即便如此，“低成本指数 + 长期持有”对绝大多数普通人，依然是经得起检验的稳妥起点。
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="rw-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="rw-progress"><i style={{ width: `${(ch / (total - 1)) * 100}%` }} /></div>
      <div className="rw-wrap">
        <div className="rw-topbar"><BookOpen size={14} /> 漫步华尔街 · 互动导读</div>
        <div className="rw-chips">
          {CHAPTERS.map((c, i) => {
            const Ic = c.icon;
            return (
              <button key={i} className={`rw-chip ${i === ch ? "on" : ""}`} onClick={() => setCh(i)}>
                <Ic size={13} /> {i}. {c.t}
              </button>
            );
          })}
        </div>
        {renderChapter()}
      </div>
      <div className="rw-nav">
        <button className="rw-btn" disabled={ch === 0} onClick={() => setCh((c) => Math.max(0, c - 1))}>
          <ArrowLeft size={14} /> 上一章
        </button>
        <span className="rw-pageno">{ch + 1} / {total}</span>
        <button className="rw-btn" disabled={ch === total - 1} onClick={() => setCh((c) => Math.min(total - 1, c + 1))}>
          下一章 <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
