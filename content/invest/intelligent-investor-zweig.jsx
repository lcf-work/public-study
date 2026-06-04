import React, { useState } from "react";
import {
  BookOpen, PencilLine, Flame, Brain, Percent, Building2, History, Lightbulb,
  ArrowLeft, ArrowRight, Sparkles, Check, X, AlertTriangle, Quote, TrendingDown,
} from "lucide-react";

const INK = "#1b2733", INK2 = "#5a6675", LINE = "#d6d4ca", TEAL = "#11696b", TEAL2 = "#1d8f8f";
const CLAY = "#c0533c", HI = "#f3df9a", DARK = "#16222e", ONDARK = "#eef1f2", ONDARK2 = "#9fb0bd", CARD = "#faf9f4";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Spectral:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
:root{
  --paper:#f3f2ec; --paper2:#e8e7df; --card:#faf9f4; --ink:#1b2733; --ink2:#5a6675; --line:#d6d4ca;
  --teal:#11696b; --teal2:#1d8f8f; --clay:#c0533c; --hi:#f3df9a; --dark:#16222e; --onDark:#eef1f2; --onDark2:#9fb0bd;
}
.zw-root{
  --slab:'Zilla Slab',Georgia,'Times New Roman',serif;
  --mono:'Space Mono','SFMono-Regular',Menlo,Consolas,monospace;
  font-family:'Spectral',Georgia,'Times New Roman',serif;
  color:var(--ink); background:var(--paper);
  background-image:radial-gradient(120% 70% at 50% -8%,rgba(255,255,255,.6),transparent 55%);
  min-height:100%; position:relative; -webkit-font-smoothing:antialiased;
}
.zw-progress{height:3px;background:var(--paper2)}
.zw-progress>i{display:block;height:100%;background:linear-gradient(90deg,var(--teal),var(--teal2));transition:width .45s ease}
.zw-wrap{max-width:780px;margin:0 auto;padding:16px 18px 124px}
.zw-top{display:flex;align-items:center;gap:8px;color:var(--ink2);font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:14px 2px 8px}
.zw-chips{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 12px;scrollbar-width:none}
.zw-chips::-webkit-scrollbar{display:none}
.zw-chip{flex:0 0 auto;display:flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--card);color:var(--ink2);
  font-family:var(--mono);font-size:11.5px;padding:7px 11px;border-radius:8px;cursor:pointer;white-space:nowrap;transition:.18s}
.zw-chip:hover{border-color:var(--teal)}
.zw-chip.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.zw-tag{display:inline-flex;align-items:center;gap:7px;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--teal);margin-bottom:8px}
.zw-h{font-family:var(--slab);font-weight:700;font-size:25px;line-height:1.14;margin:0 0 7px}
.zw-lead{font-size:16px;line-height:1.64;margin:0 0 13px}
.zw-p{font-size:15px;line-height:1.7;color:var(--ink2);margin:0 0 12px}
.zw-mini{font-family:var(--mono);font-size:11px;color:var(--ink2);letter-spacing:.02em}
.zw-num{font-family:var(--mono);font-variant-numeric:tabular-nums}
.zw-hi{background:linear-gradient(transparent 56%, var(--hi) 56%);padding:0 1px}
.zw-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px}
.zw-rule{height:1px;background:var(--line);margin:16px 0;border:0}
.zw-anim{animation:zwUp .5s cubic-bezier(.2,.7,.2,1) both}
@keyframes zwUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.zw-btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:13px;border:1px solid var(--ink);
  background:transparent;color:var(--ink);padding:9px 14px;border-radius:8px;cursor:pointer;transition:.18s}
.zw-btn:hover{background:var(--ink);color:var(--paper)}
.zw-btn:disabled{opacity:.32;cursor:not-allowed}.zw-btn:disabled:hover{background:transparent;color:var(--ink)}
.zw-nav{position:sticky;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:10px;
  background:linear-gradient(180deg,rgba(243,242,236,0),var(--paper) 40%);padding:16px 18px;max-width:780px;margin:0 auto}
.zw-pageno{font-family:var(--mono);font-size:12px;color:var(--ink2);letter-spacing:.08em}
/* Zweig commentary callout — the signature element */
.zw-note{background:rgba(17,105,107,.06);border-left:3px solid var(--teal);border-radius:0 12px 12px 0;padding:14px 16px;margin-top:14px}
.zw-notetag{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--teal);margin-bottom:7px}
.zw-notep{font-size:14.5px;line-height:1.6;color:var(--ink);margin:0}
/* cover */
.zw-cover{background:var(--dark);background-image:radial-gradient(110% 90% at 78% 6%,rgba(29,143,143,.18),transparent 55%);
  color:var(--onDark);border-radius:16px;padding:30px 24px 18px;position:relative;overflow:hidden}
.zw-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(159,176,189,.4);color:var(--onDark2);
  font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:5px 11px;border-radius:7px}
/* timeline */
.zw-tl{display:flex;gap:8px;overflow-x:auto;padding:6px 2px 4px;scrollbar-width:none}
.zw-tl::-webkit-scrollbar{display:none}
.zw-node{flex:0 0 auto;text-align:center;cursor:pointer;padding:6px 4px;border-radius:8px;transition:.15s;min-width:64px}
.zw-node:hover{background:var(--paper2)}
.zw-dot{width:13px;height:13px;border-radius:50%;margin:0 auto 6px;border:2px solid var(--line);background:var(--card)}
.zw-node.on .zw-dot{background:var(--teal);border-color:var(--teal)}
.zw-node.on{background:rgba(17,105,107,.08)}
.zw-year{font-family:var(--mono);font-size:12px;color:var(--ink)}
/* reveal boxes */
.zw-rev{margin-top:12px;border-radius:12px;padding:13px 15px;font-size:14px;line-height:1.55;border:1px solid}
.r-good{background:rgba(17,105,107,.08);border-color:rgba(17,105,107,.34);color:#0c4d4e}
.r-bad{background:rgba(192,83,60,.08);border-color:rgba(192,83,60,.34);color:#8f3a28}
.r-neutral{background:var(--paper2);border-color:var(--line);color:var(--ink2)}
/* choice buttons */
.zw-opt{display:flex;gap:10px}
.zw-optbtn{flex:1;font-family:var(--mono);font-size:13px;border:1px solid var(--line);background:var(--paper);color:var(--ink);
  padding:10px;border-radius:9px;cursor:pointer;transition:.15s;line-height:1.4}
.zw-optbtn:hover{border-color:var(--ink)}
.zw-optbtn.sel{background:rgba(17,105,107,.1);border-color:var(--teal);color:#0c4d4e}
/* flip / trick cards */
.zw-flip{border:1px solid var(--line);border-radius:11px;padding:14px;cursor:pointer;transition:.15s;background:var(--card)}
.zw-flip:hover{border-color:var(--teal)}
.zw-flip.open{background:rgba(17,105,107,.05);border-color:var(--teal)}
.zw-li{display:flex;gap:12px;padding:11px 0;border-bottom:1px dashed var(--line)}
.zw-li:last-child{border-bottom:0}
.zw-badge{flex:0 0 auto;width:28px;height:28px;border-radius:8px;display:grid;place-items:center;background:var(--paper2);color:var(--teal)}
.zw-slider{display:flex;flex-direction:column;gap:6px}
.zw-slider label{display:flex;justify-content:space-between;font-family:var(--mono);font-size:12px;color:var(--ink2)}
.zw-slider label b{color:var(--ink);font-weight:700}
.zw-range{width:100%;accent-color:var(--teal);height:22px;cursor:pointer}
.zw-bar{display:flex;height:30px;border-radius:8px;overflow:hidden;border:1px solid var(--line)}
.zw-stat{font-family:var(--slab);font-weight:700;line-height:1}
`;

/* crash sparkline: rise to a peak, then collapse */
function crashLine(i, W = 120, H = 46) {
  const n = 24, peak = 10 + (i % 3), topV = (H - 8) + (i % 2 ? -4 : 0);
  const vals = [];
  for (let k = 0; k < n; k++) {
    let v;
    if (k <= peak) v = 5 + (topV - 5) * Math.pow(k / peak, 1.6);
    else v = Math.max(4, topV * Math.exp(-(k - peak) * 0.85));
    vals.push(v);
  }
  const sx = (W - 6) / (n - 1);
  const d = vals.map((v, k) => `${k === 0 ? "M" : "L"}${(3 + k * sx).toFixed(1)} ${(H - 3 - v).toFixed(1)}`).join(" ");
  return { d, px: (3 + peak * sx).toFixed(1), py: (H - 3 - vals[peak]).toFixed(1) };
}

const TL = [
  { y: "1934", t: "《证券分析》出版", d: "格雷厄姆与多德奠定价值投资的理论基石。" },
  { y: "1949", t: "《聪明的投资者》初版", d: "格雷厄姆写给普通投资者的“通俗版”。" },
  { y: "1973", t: "第 4 版 · 格雷厄姆最后修订", d: "本评注版采用的，正是这一版原文。" },
  { y: "1976", t: "格雷厄姆逝世", d: "原著从此定格，但市场仍在不断验证它。" },
  { y: "2000", t: "互联网泡沫见顶并破裂", d: "纳斯达克 3 月冲上约 5048 点后崩盘——格雷厄姆的警告活生生上演。" },
  { y: "2003", t: "茨威格评注版问世", d: "用刚刚发生的泡沫，逐章印证并更新格雷厄姆。" },
];

const DC = [
  { name: "Pets.com", tag: "会做广告，不会赚钱", hook: "当红的袜子木偶吉祥物、铺天盖地的广告，“新经济”宠物电商。2000 年 2 月以每股 $11 上市。", out: "不到 9 个月就破产清算，股价跌到几美分。", lesson: "一家烧钱买流量、却没有盈利模式的公司，情绪退潮时一文不值。" },
  { name: "纳斯达克指数", tag: "“这次不一样”", hook: "“新经济”信仰把科技股整体推上天，人人都怕错过。", out: "2000 年 3 月约 5048 点 → 2002 年 10 月约 1114 点，蒸发约 78%；很多人十多年后才回本。", lesson: "整个市场也会集体狂热——这正是“市场先生”最极端的样子。" },
  { name: "思科 Cisco", tag: "好公司 ≠ 好投资", hook: "互联网时代的“卖铲人”，2000 年一度成为全球市值最高的公司，超 5000 亿美元。", out: "公司没倒、生意照做，但股价此后跌去约八成。", lesson: "再好的公司，以离谱高价买入也是糟糕投资——价格永远重要。" },
];

const BIAS = [
  ["过度自信", "高估自己选股、择时的能力，于是交易过度。"],
  ["近因偏差", "以为最近的涨跌会一直延续，于是追高杀跌。"],
  ["模式错觉", "在本质随机的价格里，看出并不存在的“规律”。"],
  ["从众", "别人都在买，自己也忍不住跟进。"],
  ["事后聪明", "崩盘后觉得“我早就知道”，于是更自信、更敢赌。"],
  ["多巴胺预期", "光是“可能赚钱”的预期就让大脑兴奋——和赌博同一套回路。"],
];

const TRICKS = [
  { claim: "“这只基金去年回报 80%，赶紧买！”", trick: "业绩追逐陷阱", who: "去年的冠军多半靠运气或押对单一风格，常随后回归甚至垫底；你在高位接盘，基金公司稳收管理费。" },
  { claim: "“新股 IPO，上市必涨，打到就赚！”", trick: "IPO = It’s Probably Overpriced", who: "卖方（内部人＋承销商）会挑最有利于自己、最不利于你的时点高价卖出。系统性看，散户买到的 IPO 长期表现常常平庸。" },
  { claim: "“0 佣金，免费交易！”", trick: "没有免费的午餐", who: "成本可能藏在成交价里（如订单流付费）；更关键的是“免费”在鼓励你频繁交易，而频繁本身就在伤你。" },
  { claim: "“我有内幕／名师带你抄底，稳赚不赔！”", trick: "拉高出货 / 骗局", who: "真稳赚没人会分给你。你很可能是被设计好的“退场流动性”——别人高位出货的接盘方。" },
];

const FLIP = [
  { f: "净资产折价股（net-nets）：买价低于每股净流动资产", b: "今天几乎绝迹。市场被翻得太彻底，这种“几乎白送”的便宜货基本消失了。★ 正因公式公开、人人会算，最极端的便宜被抹平。" },
  { f: "市盈率 P/E ≤ 15", b: "是个好锚，但在长期低利率、高估值的年代死守 15 会几乎买不到东西。要结合利率与行业灵活看，核心是“别为成长付过高溢价”，而非一个固定数字。" },
  { f: "近 20 年连续分红", b: "很多最优秀的公司（尤其科技股）不分红或分红史很短，却用回购回报股东。死守这条会误伤好公司。" },
  { f: "流动比率 ≥ 2、长期债务 ≤ 营运资本", b: "软件、制造、银行的资产负债结构天差地别，不能一刀切。看“稳健”，但标准要按行业调整。" },
  { f: "✓ 而这些，不会过时", b: "安全边际、市场先生、别投机、控制情绪、低费用、分散——它们是“原理”，不因公开而失效。", keep: true },
];

const CHAPTERS = [
  { t: "扉页", icon: BookOpen },
  { t: "为什么要评注", icon: PencilLine },
  { t: "互联网泡沫", icon: Flame },
  { t: "你的大脑与金钱", icon: Brain },
  { t: "低成本指数基金", icon: Percent },
  { t: "华尔街的把戏", icon: Building2 },
  { t: "哪些数字过时了", icon: History },
  { t: "不变的内核", icon: Lightbulb },
];

export default function App() {
  const [ch, setCh] = useState(0);
  const [tlSel, setTlSel] = useState(4);
  const [dc, setDc] = useState({});
  const [la1, setLa1] = useState(null);
  const [la2, setLa2] = useState(null);
  const [guess, setGuess] = useState(35);
  const [guessRev, setGuessRev] = useState(false);
  const [tricks, setTricks] = useState({});
  const [flip, setFlip] = useState({});
  const total = CHAPTERS.length;
  const cover = crashLine(1, 320, 90);

  const render = () => {
    switch (ch) {
      case 0:
        return (
          <div className="zw-anim">
            <div className="zw-cover">
              <span className="zw-pill"><Sparkles size={13} /> 评注版 · 2003</span>
              <h1 style={{ fontFamily: "var(--slab)", fontWeight: 700, fontSize: 34, margin: "16px 0 4px", color: "var(--onDark)", lineHeight: 1.08 }}>聪明的投资者<br /><span style={{ fontSize: 17, color: "var(--onDark2)" }}>评注版</span></h1>
              <p className="zw-num" style={{ color: "var(--onDark2)", fontSize: 12.5, letterSpacing: ".03em", margin: "6px 0 0" }}>The Intelligent Investor · Revised Edition</p>
              <p style={{ fontFamily: "var(--slab)", color: "var(--onDark)", marginTop: 14, fontSize: 15.5, lineHeight: 1.5 }}>
                格雷厄姆 1973 原著 ＋ 贾森·茨威格（Jason Zweig）逐章评注 ＋ 巴菲特序言
              </p>
              <svg viewBox="0 0 320 90" preserveAspectRatio="none" width="100%" height="64" style={{ marginTop: 12, opacity: .5 }}>
                <path d={cover.d} fill="none" stroke={TEAL2} strokeWidth="1.6" />
                <circle cx={cover.px} cy={cover.py} r="3" fill="#e0b04a" />
              </svg>
            </div>
            <div className="zw-card" style={{ marginTop: 16 }}>
              <div className="zw-tag">这份导读讲什么</div>
              <p className="zw-p" style={{ color: "var(--ink)" }}>
                茨威格是资深财经记者（《华尔街日报》“聪明的投资者”专栏），尤其钻研<b>行为与神经金融学</b>。
                他给格雷厄姆每一章都写了评注、加了脚注。
              </p>
              <p className="zw-p" style={{ marginBottom: 0 }}>
                核心是这样一句话：<span className="zw-hi">格雷厄姆给了不变的原理，茨威格用刚刚发生的 2000 年互联网泡沫，证明它依然管用</span>，
                并补上格雷厄姆没讲透的一课——<b>你的大脑</b>。下面 7 章只讲他“加了什么、注了什么”，不重复原文。
              </p>
            </div>
            <p className="zw-mini" style={{ textAlign: "center", marginTop: 14 }}>点「下一章」开始，或上方目录任意跳转</p>
          </div>
        );

      case 1:
        return (
          <div className="zw-anim">
            <span className="zw-tag"><PencilLine size={13} /> 第 1 章 · 评注者的角色</span>
            <h2 className="zw-h">原理永恒，但案例和数字老了</h2>
            <p className="zw-lead">格雷厄姆的原文最后修订于 1973 年。道理不过时，可里面的公司、美元金额、市场背景，对今天的读者已经陌生。这正是评注存在的意义。</p>
            <div className="zw-card">
              <div className="zw-mini" style={{ marginBottom: 8 }}>点一下时间轴上的节点：</div>
              <div className="zw-tl">
                {TL.map((n, i) => (
                  <div key={i} className={`zw-node ${tlSel === i ? "on" : ""}`} onClick={() => setTlSel(i)}>
                    <div className="zw-dot" /><div className="zw-year">{n.y}</div>
                  </div>
                ))}
              </div>
              <div className="zw-rev r-neutral zw-anim" key={tlSel} style={{ marginTop: 8 }}>
                <b style={{ fontFamily: "var(--slab)", color: "var(--ink)" }}>{TL[tlSel].t}</b>
                <div style={{ marginTop: 4 }}>{TL[tlSel].d}</div>
              </div>
            </div>
            <p className="zw-p" style={{ marginTop: 14 }}>茨威格做了三件事：① 加脚注，把旧典故、旧公司、旧美元换算讲清楚；② 用现代案例（尤其那场泡沫）更新每一章；③ 补上格雷厄姆时代还不成熟的<b>行为金融学</b>。</p>
            <div className="zw-note">
              <div className="zw-notetag"><PencilLine size={12} /> Zweig 评注</div>
              <p className="zw-notep">这一版的运气在于：出版前夜，1999–2000 的互联网泡沫刚刚膨胀又破裂——一场为格雷厄姆理论量身定做的实盘考试。</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="zw-anim">
            <span className="zw-tag"><Flame size={13} /> 第 2 章 · 预言成真</span>
            <h2 className="zw-h">互联网泡沫：把“市场先生”演给你看</h2>
            <p className="zw-lead">茨威格在评注里反复回放这场泡沫。试试下面三个真实案例——在最狂热的<span className="zw-hi">顶点</span>，你会上车吗？点一下看结局。</p>
            {DC.map((c, i) => {
              const sp = crashLine(i, 120, 46);
              const ans = dc[i];
              return (
                <div className="zw-card" key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <div><b style={{ fontFamily: "var(--slab)", fontSize: 17 }}>{c.name}</b><div className="zw-mini" style={{ color: TEAL }}>{c.tag}</div></div>
                    <svg viewBox="0 0 120 46" width="108" height="42"><path d={sp.d} fill="none" stroke={CLAY} strokeWidth="1.7" /><circle cx={sp.px} cy={sp.py} r="2.6" fill={INK} /></svg>
                  </div>
                  <p className="zw-p" style={{ margin: "10px 0", color: "var(--ink)", fontSize: 14.5 }}>{c.hook}</p>
                  {!ans ? (
                    <div className="zw-opt">
                      <button className="zw-optbtn" onClick={() => setDc(a => ({ ...a, [i]: "buy" }))}>在顶点买入</button>
                      <button className="zw-optbtn" onClick={() => setDc(a => ({ ...a, [i]: "skip" }))}>忍住不买</button>
                    </div>
                  ) : (
                    <div className={`zw-rev ${ans === "skip" ? "r-good" : "r-bad"} zw-anim`}>
                      {ans === "buy" ? "你在最狂热时上了车。" : "你忍住没追高。"}结局：{c.out}<br /><b style={{ display: "inline-block", marginTop: 6 }}>启示：</b>{c.lesson}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="zw-note">
              <div className="zw-notetag"><PencilLine size={12} /> Zweig 评注</div>
              <p className="zw-notep">泡沫里最贵的一句话是“这次不一样”。格雷厄姆几十年前写下的警告，被一字不差地兑现——这就是他要你记住<span className="zw-hi">市场先生</span>与<span className="zw-hi">安全边际</span>的原因。</p>
            </div>
          </div>
        );

      case 3: {
        const both = la1 && la2;
        const typical = la1 === "A" && la2 === "B";
        return (
          <div className="zw-anim">
            <span className="zw-tag"><Brain size={13} /> 第 3 章 · 茨威格的招牌补充</span>
            <h2 className="zw-h">你的大脑，才是真正的对手</h2>
            <p className="zw-lead">格雷厄姆说“投资者最大的敌人是自己”；茨威格（后来专门写了《你的钱与你的脑》）用脑科学解释了为什么。先做个一分钟的小实验：</p>
            <div className="zw-card">
              <div className="zw-mini" style={{ marginBottom: 8 }}>问题一：你更想要哪个？</div>
              <div className="zw-opt">
                <button className={`zw-optbtn ${la1 === "A" ? "sel" : ""}`} onClick={() => setLa1("A")}>确定拿到 ¥800</button>
                <button className={`zw-optbtn ${la1 === "B" ? "sel" : ""}`} onClick={() => setLa1("B")}>85% 拿 ¥1000，15% 啥也没有</button>
              </div>
              <div className="zw-mini" style={{ margin: "14px 0 8px" }}>问题二：你更想要哪个？</div>
              <div className="zw-opt">
                <button className={`zw-optbtn ${la2 === "A" ? "sel" : ""}`} onClick={() => setLa2("A")}>确定亏掉 ¥800</button>
                <button className={`zw-optbtn ${la2 === "B" ? "sel" : ""}`} onClick={() => setLa2("B")}>85% 亏 ¥1000，15% 不亏</button>
              </div>
              {both && (
                <div className="zw-rev r-neutral zw-anim" style={{ marginTop: 14 }}>
                  {typical
                    ? "你和大多数人一样：赚钱时求稳（选确定的 ¥800），亏钱时却愿意赌一把。"
                    : "你的选择和典型模式略有不同，但下面这套机制对多数人成立。"}
                  <br />两题里“赌”的那一边期望值其实都更差（−¥850 vs −¥800 同理）。我们对<b>损失的痛</b>，大约是<b>同等收益快乐的两倍</b>——这就是<span className="zw-hi">损失厌恶</span>。它让人过早卖掉赚钱的股票、却死扛亏钱的股票。
                </div>
              )}
            </div>
            <div className="zw-card" style={{ marginTop: 14 }}>
              <div className="zw-tag" style={{ marginBottom: 4 }}>茨威格常点名的几种本能</div>
              {BIAS.map(([t, d], i) => (
                <div className="zw-li" key={i}><div className="zw-badge"><Brain size={14} /></div>
                  <div><b style={{ fontFamily: "var(--slab)", fontSize: 15 }}>{t}</b><div className="zw-mini" style={{ color: "var(--ink2)", fontFamily: "Spectral,serif", fontSize: 13 }}>{d}</div></div></div>
              ))}
            </div>
            <div className="zw-note">
              <div className="zw-notetag"><PencilLine size={12} /> Zweig 评注</div>
              <p className="zw-notep">你关不掉这些本能，但能用“规则”绕开它们——这正是格雷厄姆要你<b>机械化</b>（定投、再平衡、安全边际）的深层原因。</p>
            </div>
          </div>
        );
      }

      case 4:
        return (
          <div className="zw-anim">
            <span className="zw-tag"><Percent size={13} /> 第 4 章 · 茨威格的强力主张</span>
            <h2 className="zw-h">对多数人，低成本指数基金就是答案</h2>
            <p className="zw-lead">茨威格比格雷厄姆更旗帜鲜明。先猜一猜：拉长到 15–20 年，你觉得有<span className="zw-hi">多少比例</span>的主动型基金能跑赢指数？</p>
            <div className="zw-card">
              <div className="zw-slider"><label>我猜： <b className="zw-num">{guess}%</b> 能跑赢</label>
                <input className="zw-range" type="range" min="0" max="60" step="1" value={guess} onChange={(e) => { setGuess(+e.target.value); setGuessRev(false); }} /></div>
              <button className="zw-btn" style={{ marginTop: 12 }} onClick={() => setGuessRev(true)}>看答案</button>
              {guessRev && (
                <div className="zw-anim" style={{ marginTop: 14 }}>
                  <div className="zw-mini" style={{ marginBottom: 4 }}>你的猜测</div>
                  <div className="zw-bar"><div style={{ width: `${guess}%`, background: INK2 }} /><div style={{ flex: 1, background: "var(--paper2)" }} /></div>
                  <div className="zw-mini" style={{ margin: "12px 0 4px" }}>长期实际（跨市场反复出现）</div>
                  <div className="zw-bar"><div style={{ width: "13%", background: TEAL }} /><div style={{ flex: 1, background: "var(--paper2)" }} /></div>
                  <p className="zw-p" style={{ marginTop: 12, marginBottom: 0, color: "var(--ink)" }}>实际大约只有 <b style={{ color: TEAL }}>10–15%</b>，而且这一小撮很难提前知道是谁。再叠加 1.5% 左右的年费，几十年下来还会吃掉你最终收益的相当一部分。</p>
                </div>
              )}
            </div>
            <div className="zw-note">
              <div className="zw-notetag"><PencilLine size={12} /> Zweig 评注</div>
              <p className="zw-notep">你省下的每一分费用，都是<b>确定</b>属于你的“超额收益”；而“跑赢市场”只是<b>可能</b>。聪明的人先抓确定的那部分。</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="zw-anim">
            <span className="zw-tag"><Building2 size={13} /> 第 5 章 · 直接回应“怎么不被割”</span>
            <h2 className="zw-h">华尔街的把戏：别当“退场流动性”</h2>
            <p className="zw-lead">记者出身的茨威格毫不留情：很多产品和“机会”，是设计来从你的<b>行动</b>里赚钱的——你越频繁、越冲动，他们越赚。点开每张卡，看套路在哪。</p>
            {TRICKS.map((t, i) => (
              <div key={i} className={`zw-flip ${tricks[i] ? "open" : ""}`} style={{ marginBottom: 10 }} onClick={() => setTricks(a => ({ ...a, [i]: !a[i] }))}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <b style={{ fontFamily: "var(--slab)", fontSize: 15.5 }}>{t.claim}</b>
                  <span className="zw-mini" style={{ flex: "0 0 auto", color: TEAL }}>{tricks[i] ? "收起" : "看套路 ▸"}</span>
                </div>
                {tricks[i] && (
                  <div className="zw-anim" style={{ marginTop: 10 }}>
                    <div className="zw-mini" style={{ color: CLAY, marginBottom: 4 }}>套路：{t.trick}</div>
                    <p className="zw-p" style={{ margin: 0, fontSize: 14, color: "var(--ink)" }}>{t.who}</p>
                  </div>
                )}
              </div>
            ))}
            <div className="zw-note">
              <div className="zw-notetag"><PencilLine size={12} /> Zweig 评注</div>
              <p className="zw-notep">散户被“割”的钱，绝大多数不来自格雷厄姆式的耐心持有，而来自这些被情绪和营销诱发的<b>频繁、冲动操作</b>。判断任何建议前，先问一句：<span className="zw-hi">“提建议的人，怎么赚钱？”</span></p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="zw-anim">
            <span className="zw-tag"><History size={13} /> 第 6 章 · 诚实地更新数字</span>
            <h2 className="zw-h">哪些公式过时了？（也回答了你的疑问）</h2>
            <p className="zw-lead">茨威格在脚注里直言：格雷厄姆的某些具体数字，今天很难照搬。点一下每张卡，看他的现代提醒。</p>
            {FLIP.map((c, i) => (
              <div key={i} className={`zw-flip ${flip[i] ? "open" : ""}`} style={{ marginBottom: 10, borderColor: c.keep ? TEAL : undefined }} onClick={() => setFlip(a => ({ ...a, [i]: !a[i] }))}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <b style={{ fontFamily: "var(--slab)", fontSize: 15, color: c.keep ? TEAL : "var(--ink)" }}>{c.f}</b>
                  <span className="zw-mini" style={{ flex: "0 0 auto", color: TEAL }}>{flip[i] ? "收起" : "翻面 ▸"}</span>
                </div>
                {flip[i] && <p className="zw-p zw-anim" style={{ margin: "10px 0 0", fontSize: 14, color: "var(--ink)" }}>{c.b}</p>}
              </div>
            ))}
            <div className="zw-note">
              <div className="zw-notetag"><PencilLine size={12} /> Zweig 评注</div>
              <p className="zw-notep">把书分两层读：<b>“原理”层是钢筋</b>，照搬；<b>“数字”层是装修</b>，会过时。正因公式公开、人人会算，最极端的便宜早被抹平——所以靠死套公式想“躺赢”，恰恰是会被割的那条路。</p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="zw-anim">
            <span className="zw-tag"><Lightbulb size={13} /> 第 7 章 · 不变的内核</span>
            <h2 className="zw-h">带走什么，怎么读这一版</h2>
            <div className="zw-card" style={{ marginBottom: 14 }}>
              <div className="zw-tag" style={{ marginBottom: 6 }}><Quote size={13} /> 巴菲特在序言里说</div>
              <p className="zw-p" style={{ marginBottom: 0, color: "var(--ink)", fontFamily: "var(--slab)", fontStyle: "italic", fontSize: 16 }}>
                投资成功靠的不是超高智商，而是一套健全的决策框架，加上不让情绪腐蚀它的定力。
              </p>
            </div>
            <p className="zw-lead">茨威格这一版到底加了什么，一句话回顾：</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }} className="zw-card">
              {[
                [Flame, "用现代泡沫验证原理", "把 2000 年互联网泡沫当作格雷厄姆理论的实盘检验。"],
                [Brain, "补上“行为金融”这一课", "解释了为什么情绪纪律这么难、又这么值钱。"],
                [Percent, "力荐低成本指数基金", "对多数人，这是最稳妥的默认选择。"],
                [Building2, "拆穿华尔街营销", "教你识别 IPO、业绩追逐、订单流等套路。"],
                [History, "区分永恒原理与过时数字", "原理照搬，数字按时代调整。"],
              ].map(([Ic, t, d], i) => (
                <li className="zw-li" key={i}><div className="zw-badge"><Ic size={14} /></div>
                  <div><b style={{ fontFamily: "var(--slab)", fontSize: 15.5 }}>{t}</b><div className="zw-mini" style={{ color: "var(--ink2)", fontFamily: "Spectral,serif", fontSize: 13 }}>{d}</div></div></li>
              ))}
            </ul>
            <div className="zw-note">
              <div className="zw-notetag"><PencilLine size={12} /> 怎么读这一版</div>
              <p className="zw-notep">
                每章先读格雷厄姆原文、再读茨威格评注；<b>脚注别跳过</b>（它们解释旧典故）。重点是第 8 章（市场先生）、第 20 章（安全边际）及茨威格对它们的评注；附录里还有巴菲特的《格雷厄姆-多德都市的超级投资者》。新手很适合把它当作“读原著”的版本——但仍建议先用互动导读建立直觉。
              </p>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="zw-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="zw-progress"><i style={{ width: `${(ch / (total - 1)) * 100}%` }} /></div>
      <div className="zw-wrap">
        <div className="zw-top"><BookOpen size={14} /> 聪明的投资者 · 评注版导读</div>
        <div className="zw-chips">
          {CHAPTERS.map((c, i) => { const Ic = c.icon; return (
            <button key={i} className={`zw-chip ${i === ch ? "on" : ""}`} onClick={() => setCh(i)}><Ic size={13} /> {i}. {c.t}</button>
          ); })}
        </div>
        {render()}
      </div>
      <div className="zw-nav">
        <button className="zw-btn" disabled={ch === 0} onClick={() => setCh(c => Math.max(0, c - 1))}><ArrowLeft size={14} /> 上一章</button>
        <span className="zw-pageno">{ch + 1} / {total}</span>
        <button className="zw-btn" disabled={ch === total - 1} onClick={() => setCh(c => Math.min(total - 1, c + 1))}>下一章 <ArrowRight size={14} /></button>
      </div>
    </div>
  );
}
