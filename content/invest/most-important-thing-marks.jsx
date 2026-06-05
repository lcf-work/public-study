import React, { useState } from "react";
import {
  BookOpen, Layers, Scale, ShieldAlert, Gauge, Waves, Users, Thermometer,
  Shield, Compass, ArrowLeft, ArrowRight, Sparkles, Check, X, Quote, Info,
} from "lucide-react";

const INK = "#232a2e", INK2 = "#5e6b6f", LINE = "#cdcbc2", PLUM = "#7a3a57", PLUM2 = "#9a5070";
const AMBER = "#c07a2e", BLUEC = "#3f6079", DARK = "#1e2528", ONDARK = "#e9e8e3", ONDARK2 = "#9aa5a3", CARD = "#f5f3ee";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Spline+Sans+Mono:wght@400;500&display=swap');
:root{
  --paper:#e9e8e3; --paper2:#dedcd3; --card:#f5f3ee; --ink:#232a2e; --ink2:#5e6b6f; --line:#cdcbc2;
  --plum:#7a3a57; --plum2:#9a5070; --amber:#c07a2e; --blue:#3f6079; --dark:#1e2528; --onDark:#e9e8e3; --onDark2:#9aa5a3;
}
.mt-root{
  --disp:'DM Serif Display',Georgia,'Times New Roman',serif;
  --mono:'Spline Sans Mono','SFMono-Regular',Menlo,Consolas,monospace;
  font-family:'Lora',Georgia,'Times New Roman',serif; font-size:16px;
  color:var(--ink); background:var(--paper);
  background-image:radial-gradient(120% 70% at 50% -8%,rgba(255,255,255,.4),transparent 55%);
  min-height:100%; position:relative; -webkit-font-smoothing:antialiased;
}
.mt-progress{height:3px;background:var(--paper2)}
.mt-progress>i{display:block;height:100%;background:linear-gradient(90deg,var(--blue),var(--amber));transition:width .45s ease}
.mt-wrap{max-width:780px;margin:0 auto;padding:16px 18px 124px}
.mt-top{display:flex;align-items:center;gap:8px;color:var(--ink2);font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:14px 2px 8px}
.mt-chips{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 12px;scrollbar-width:none}
.mt-chips::-webkit-scrollbar{display:none}
.mt-chip{flex:0 0 auto;display:flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--card);color:var(--ink2);
  font-family:var(--mono);font-size:11.5px;padding:7px 11px;border-radius:7px;cursor:pointer;white-space:nowrap;transition:.16s}
.mt-chip:hover{border-color:var(--plum)}
.mt-chip.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.mt-tagl{display:inline-flex;align-items:center;gap:7px;font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--plum);margin-bottom:8px}
.mt-h{font-family:var(--disp);font-weight:400;font-size:27px;line-height:1.14;margin:0 0 8px}
.mt-lead{font-size:17px;line-height:1.6;margin:0 0 13px}
.mt-p{font-size:16px;line-height:1.66;color:var(--ink2);margin:0 0 12px}
.mt-mini{font-family:var(--mono);font-size:11px;color:var(--ink2);letter-spacing:.02em;line-height:1.5}
.mt-num{font-family:var(--mono);font-variant-numeric:tabular-nums}
.mt-card{background:var(--card);border:1px solid var(--line);border-radius:11px;padding:18px}
.mt-rule{height:1px;background:var(--line);margin:16px 0;border:0}
.mt-anim{animation:mtUp .5s cubic-bezier(.2,.7,.2,1) both}
@keyframes mtUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.mt-btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:13px;border:1px solid var(--ink);
  background:transparent;color:var(--ink);padding:9px 14px;border-radius:7px;cursor:pointer;transition:.16s}
.mt-btn:hover{background:var(--ink);color:var(--paper)}
.mt-btn:disabled{opacity:.32;cursor:not-allowed}.mt-btn:disabled:hover{background:transparent;color:var(--ink)}
.mt-nav{position:sticky;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:10px;
  background:linear-gradient(180deg,rgba(233,232,227,0),var(--paper) 40%);padding:16px 18px;max-width:780px;margin:0 auto}
.mt-pageno{font-family:var(--mono);font-size:12px;color:var(--ink2);letter-spacing:.08em}
.mt-note{background:rgba(122,58,87,.06);border-left:3px solid var(--plum);border-radius:0 11px 11px 0;padding:14px 16px;margin-top:14px}
.mt-notetag{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:10px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--plum);margin-bottom:7px}
.mt-notep{font-size:15px;line-height:1.6;color:var(--ink);margin:0}
.mt-cover{background:var(--dark);border-radius:14px;padding:30px 24px 16px;position:relative;overflow:hidden;color:var(--onDark)}
.mt-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(154,165,163,.4);color:var(--onDark2);
  font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:5px 11px;border-radius:7px}
.mt-rev{margin-top:12px;border-radius:11px;padding:13px 15px;font-size:15px;line-height:1.55;border:1px solid}
.g-good{background:rgba(63,96,121,.08);border-color:rgba(63,96,121,.34);color:#324c61}
.g-bad{background:rgba(192,122,46,.1);border-color:rgba(192,122,46,.38);color:#8a5418}
.g-neutral{background:var(--paper2);border-color:var(--line);color:var(--ink2)}
.mt-tap{border:1px solid var(--line);border-radius:9px;padding:13px 15px;cursor:pointer;transition:.15s;background:var(--card);margin-bottom:9px}
.mt-tap:hover{border-color:var(--plum)}
.mt-tap.open{background:rgba(122,58,87,.04);border-color:var(--plum)}
.mt-taprow{display:flex;justify-content:space-between;align-items:center;gap:10px}
.mt-opt{display:flex;gap:10px;flex-wrap:wrap}
.mt-optbtn{flex:1;min-width:120px;font-family:var(--mono);font-size:13px;border:1px solid var(--line);background:var(--paper);color:var(--ink);
  padding:10px;border-radius:8px;cursor:pointer;transition:.15s;line-height:1.4}
.mt-optbtn:hover{border-color:var(--ink)}
.mt-optbtn.sel{background:rgba(122,58,87,.1);border-color:var(--plum);color:#6e3050}
.mt-bar{height:26px;border-radius:7px;overflow:hidden;border:1px solid var(--line);background:var(--paper2)}
.mt-bar>i{display:block;height:100%;transition:width .2s}
.mt-li{display:flex;gap:11px;padding:7px 0}
.mt-li:before{content:"—";color:var(--plum);font-family:var(--mono)}
.mt-slider{display:flex;flex-direction:column;gap:6px}
.mt-slider label{display:flex;justify-content:space-between;font-family:var(--mono);font-size:12px;color:var(--ink2)}
.mt-range{width:100%;accent-color:var(--plum);height:22px;cursor:pointer}
.mt-trow{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px dashed var(--line)}
.mt-trow:last-child{border-bottom:0}
.mt-tk{flex:0 0 92px;font-family:var(--mono);font-size:12px;color:var(--ink)}
.mt-tg{display:flex;gap:6px;flex:1}
.mt-tgb{flex:1;font-family:var(--mono);font-size:11.5px;border:1px solid var(--line);background:var(--paper);color:var(--ink2);padding:7px;border-radius:7px;cursor:pointer;transition:.15s}
.mt-tgb.hot{background:rgba(192,122,46,.14);border-color:var(--amber);color:#8a5418}
.mt-tgb.cold{background:rgba(63,96,121,.12);border-color:var(--blue);color:#324c61}
.mt-mtx{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mt-cell{border:1px solid var(--line);background:var(--card);border-radius:9px;padding:13px;cursor:pointer;transition:.15s;text-align:center}
.mt-cell:hover{border-color:var(--plum)}
.mt-cell.on{background:rgba(122,58,87,.07);border-color:var(--plum)}
.mt-pivot{fill:#9aa5a3}
.mt-pend{transform-box:fill-box;transform-origin:top center;animation:mtSwing 4s cubic-bezier(.37,0,.63,1) infinite}
@keyframes mtSwing{0%,100%{transform:rotate(-32deg)}50%{transform:rotate(32deg)}}
`;

const SLT = [
  { news: "“这是一家人人称赞的好公司。”", l1: "好公司 → 赶紧买。", l2: "它确实好，但这点人人皆知、已反映进价格，甚至被追捧过头——好公司 ≠ 好股票。也许该谨慎，甚至卖出。" },
  { news: "“经济要衰退了，赶紧跑！”", l1: "衰退 → 清仓离场。", l2: "如果人人都已预期衰退、恐慌抛售，坏消息早被计入、价格已极低——共识已反映时，这反而可能是买点。" },
  { news: "“这只股票跌了 60%，太惨了。”", l1: "跌这么多，肯定要完，别碰。", l2: "先问：相对它的内在价值，现在是更便宜还是更危险？共识是否已过度悲观？下跌本身不是结论。" },
  { news: "“这个新赛道太火了，大家都在买。”", l1: "这么火 → 我也要上车。", l2: "越火，价格里塞进的乐观预期越多、安全边际越薄。问：现在的价格，需要多完美的未来才撑得住？" },
];

const CONTRA = [
  { s: "市场极度狂热，人人追高、唯恐错过。", opp: true, w: "在极端的贪婪处，要敢于和人群相反——别人狂买时考虑卖出。" },
  { s: "市场温和上涨，情绪正常、没有明显极端。", opp: false, w: "中间地带，人群多数时候是对的。逆向只在极端处才有效，不是无脑对着干。" },
  { s: "市场极度恐慌，人人割肉、避之不及。", opp: true, w: "在极端的恐惧处，正是别人绝望抛售、价格远低于价值之时——勇敢买入。" },
];

const THERM = [
  { k: "经济", hot: "强劲扩张", cold: "疲软衰退" },
  { k: "放贷机构", hot: "宽松抢着放贷", cold: "谨慎收紧" },
  { k: "资本市场", hot: "火热易融资", cold: "冰封难融资" },
  { k: "投资者情绪", hot: "乐观贪婪", cold: "悲观恐惧" },
  { k: "风险偏好", hot: "追逐风险", cold: "回避风险" },
  { k: "估值水平", hot: "偏高", cold: "偏低" },
];

const MTX = [
  { t: "好决策 · 好结果", d: "应得的成功——过程对，运气也帮忙。最理想，但别误以为全靠自己的本事。", tone: "g-good" },
  { t: "好决策 · 坏结果", d: "倒霉。过程是对的，只是运气差。别因一次坏结果就否定好过程。", tone: "g-neutral" },
  { t: "坏决策 · 好结果", d: "最危险！靠运气赢了，却会让你学到错误的教训、下次变本加厉。", tone: "g-bad" },
  { t: "坏决策 · 坏结果", d: "罪有应得——过程和结果都差。至少这次的教训是真实的。", tone: "g-neutral" },
];

const CHAPTERS = [
  { t: "扉页", icon: BookOpen },
  { t: "第二层思维", icon: Layers },
  { t: "价值与价格", icon: Scale },
  { t: "理解风险", icon: ShieldAlert },
  { t: "识别·控制风险", icon: Gauge },
  { t: "周期与钟摆", icon: Waves },
  { t: "逆向·抵御情绪", icon: Users },
  { t: "量体温·知所处", icon: Thermometer },
  { t: "运气·防御·不对称", icon: Shield },
  { t: "拼起来·提醒", icon: Compass },
];

export default function App() {
  const [ch, setCh] = useState(0);
  const [slt, setSlt] = useState({});
  const [qual, setQual] = useState("hi");
  const [price, setPrice] = useState("fair");
  const [riskPick, setRiskPick] = useState(null);
  const [opt, setOpt] = useState(80);
  const [pend, setPend] = useState(null);
  const [contra, setContra] = useState({});
  const [therm, setTherm] = useState({});
  const [mtx, setMtx] = useState(null);

  const perceived = 100 - opt, real = opt;
  const hotN = Object.values(therm).filter(v => v === "hot").length;
  const thermDone = Object.keys(therm).length === THERM.length;

  let inv2;
  if (price === "exp") inv2 = { t: `${qual === "hi" ? "即便是优质资产" : "平庸资产"}，买得太贵也是糟糕的投资——价格里塞满乐观预期，安全边际几乎为零。`, tone: "g-bad" };
  else if (price === "cheap") inv2 = { t: qual === "hi" ? "又好又便宜——最理想的组合。" : "买得足够便宜，连平庸的资产也可能成为好投资。", tone: "g-good" };
  else inv2 = { t: qual === "hi" ? "合理价位下，优质资产略占优，但安全边际有限——别把“好公司”等同于“好投资”。" : "平庸资产 + 合理价格，乏善可陈，谈不上机会。", tone: "g-neutral" };

  const total = CHAPTERS.length;

  const render = () => {
    switch (ch) {
      case 0:
        return (
          <div className="mt-anim">
            <div className="mt-cover">
              <span className="mt-pill"><Sparkles size={13} /> 投资备忘录精粹 · 2011</span>
              <h1 style={{ fontFamily: "var(--disp)", fontSize: 34, margin: "16px 0 4px", color: "var(--onDark)", lineHeight: 1.08 }}>投资最重要的事</h1>
              <p className="mt-mini" style={{ color: "var(--onDark2)", fontSize: 12, margin: 0 }}>The Most Important Thing</p>
              <p style={{ fontFamily: "var(--disp)", color: "var(--onDark)", marginTop: 14, fontSize: 17, lineHeight: 1.5 }}>
                作者：霍华德·马克斯（Howard Marks）<br />橡树资本（Oaktree）联合创始人 · 脱胎于他著名的“投资备忘录”
              </p>
              <p style={{ color: "var(--onDark2)", fontSize: 14.5, lineHeight: 1.55, marginTop: 12 }}>
                书名是一句反复出现的话——“最重要的事是……”。其实没有<b style={{ color: "var(--onDark)" }}>唯一</b>最重要的事：有很多块，环环相扣，必须一起发挥作用。
              </p>
            </div>
            <div className="mt-card" style={{ marginTop: 16 }}>
              <div className="mt-tagl"><Quote size={13} /> 一句话核心</div>
              <p style={{ fontFamily: "var(--disp)", fontStyle: "italic", fontSize: 19, lineHeight: 1.5, borderLeft: "3px solid var(--plum)", paddingLeft: 14, margin: "2px 0 12px" }}>
                想超越市场，你必须比共识想得既不同、又更对；把风险理解为“永久损失的概率”，看懂周期与人性的钟摆，在极端处逆向，并始终以防御取胜。
              </p>
              <p className="mt-p" style={{ marginBottom: 0 }}>下面 9 章把这些“最重要的事”逐块拆开，几乎每章都能上手玩一玩。</p>
            </div>
            <p className="mt-mini" style={{ textAlign: "center", marginTop: 14 }}>点「下一章」开始，或上方目录任意跳转</p>
          </div>
        );

      case 1:
        return (
          <div className="mt-anim">
            <span className="mt-tagl"><Layers size={13} /> 第 1 章 · 地基</span>
            <h2 className="mt-h">第二层思维：想得不一样，还要更对</h2>
            <p className="mt-lead">第一层思维简单肤浅，人人都会；第二层思维深入复杂，会考虑“别人怎么想、共识是否已反映、概率与赔率”。要持续跑赢，你必须和共识<b>不同</b>，而且<b>更对</b>。点开看两层思维的差别：</p>
            <div>{SLT.map((c, i) => (
              <div key={i} className={`mt-tap ${slt[i] ? "open" : ""}`} onClick={() => setSlt(a => ({ ...a, [i]: !a[i] }))}>
                <div className="mt-taprow"><span style={{ fontFamily: "var(--disp)", fontSize: 17 }}>{c.news}</span><span className="mt-mini" style={{ color: PLUM }}>{slt[i] ? "收起" : "展开 ▸"}</span></div>
                {slt[i] && (
                  <div className="mt-anim" style={{ marginTop: 8, fontSize: 14.5, lineHeight: 1.55 }}>
                    <div><b style={{ color: AMBER, fontFamily: "var(--mono)", fontSize: 11 }}>第一层 </b>{c.l1}</div>
                    <div style={{ marginTop: 5 }}><b style={{ color: BLUEC, fontFamily: "var(--mono)", fontSize: 11 }}>第二层 </b>{c.l2}</div>
                  </div>
                )}
              </div>
            ))}</div>
            <div className="mt-note">
              <div className="mt-notetag"><Info size={12} /> 现实提醒</div>
              <p className="mt-notep">和别人做一样的事，就别指望比别人好。第二层思维很累、常常孤独，而且要承担“看起来错了一阵子”的风险——这正是超额收益的代价。</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="mt-anim">
            <span className="mt-tagl"><Scale size={13} /> 第 2 章 · 价值是锚</span>
            <h2 className="mt-h">好资产，不等于好投资</h2>
            <p className="mt-lead">最可靠的方法是基于<b>内在价值</b>买入。价格与价值的关系才是关键：心理（贪婪与恐惧）不断把价格推离价值。选一选，看结果：</p>
            <div className="mt-card">
              <div className="mt-mini" style={{ marginBottom: 6 }}>资产质量</div>
              <div className="mt-opt" style={{ marginBottom: 14 }}>
                <button className={`mt-optbtn ${qual === "hi" ? "sel" : ""}`} onClick={() => setQual("hi")}>优质资产</button>
                <button className={`mt-optbtn ${qual === "lo" ? "sel" : ""}`} onClick={() => setQual("lo")}>平庸资产</button>
              </div>
              <div className="mt-mini" style={{ marginBottom: 6 }}>你付的价格（相对价值）</div>
              <div className="mt-opt">
                <button className={`mt-optbtn ${price === "cheap" ? "sel" : ""}`} onClick={() => setPrice("cheap")}>明显便宜</button>
                <button className={`mt-optbtn ${price === "fair" ? "sel" : ""}`} onClick={() => setPrice("fair")}>大致合理</button>
                <button className={`mt-optbtn ${price === "exp" ? "sel" : ""}`} onClick={() => setPrice("exp")}>明显昂贵</button>
              </div>
              <div className={`mt-rev ${inv2.tone}`} style={{ marginTop: 14 }}>{inv2.t}</div>
            </div>
            <div className="mt-note">
              <div className="mt-notetag"><Info size={12} /> 现实提醒</div>
              <p className="mt-notep">马克斯的底层信条：最安全、最有力的赚钱方式，是<b>用明显低于价值的价格买入</b>。再好的故事，价格过高都会毁掉回报。决定盈亏的，往往不是“买了什么”，而是“出了什么价”。</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="mt-anim">
            <span className="mt-tagl"><ShieldAlert size={13} /> 第 3 章 · 重新定义风险</span>
            <h2 className="mt-h">风险，到底是什么？</h2>
            <p className="mt-lead">学院派把风险等同于“价格波动率 / beta”。马克斯坚决反对。你觉得哪个更接近真正的风险？</p>
            <div className="mt-card">
              <div className="mt-opt">
                <button className={`mt-optbtn ${riskPick === "a" ? "sel" : ""}`} onClick={() => setRiskPick("a")}>价格波动大、beta 高</button>
                <button className={`mt-optbtn ${riskPick === "b" ? "sel" : ""}`} onClick={() => setRiskPick("b")}>永久损失本金的概率</button>
              </div>
              {riskPick && (
                <div className={`mt-rev ${riskPick === "b" ? "g-good" : "g-bad"} mt-anim`} style={{ marginTop: 14 }}>
                  {riskPick === "b"
                    ? "正是马克斯的答案。真正的风险是“亏掉本金、且回不来”的概率，而不是中途的颠簸。"
                    : "这是学术派的定义，马克斯反对它。波动让你不舒服，但只要你不被迫在低点卖出，波动本身并不等于永久损失。"}
                </div>
              )}
            </div>
            <div className="mt-note">
              <div className="mt-notetag"><Info size={12} /> 现实提醒</div>
              <p className="mt-notep">还有一条反直觉的真相：<b>高风险 ≠ 高收益</b>。风险更高的资产只是必须“看起来”提供更高回报才能吸引买家；可既然是风险，结果就更不确定——有时回报更低，甚至血本无归。</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="mt-anim">
            <span className="mt-tagl"><Gauge size={13} /> 第 4 章 · 风险在高位最大</span>
            <h2 className="mt-h">识别风险：越是无人察觉，越危险</h2>
            <p className="mt-lead">最反直觉的一点：风险在<b>价格高、人人乐观自满</b>时最大，在<b>崩盘后人人恐惧</b>时最小。拖动“市场乐观度”，看“大众感知的风险”与“真实风险”如何背道而驰：</p>
            <div className="mt-card">
              <div className="mt-slider"><label>市场乐观度 <b className="mt-num" style={{ color: opt > 60 ? AMBER : opt < 40 ? BLUEC : INK }}>{opt < 30 ? "恐慌" : opt < 45 ? "悲观" : opt < 60 ? "中性" : opt < 80 ? "乐观" : "狂热"}</b></label>
                <input className="mt-range" type="range" min="0" max="100" step="1" value={opt} onChange={e => setOpt(+e.target.value)} /></div>
              <div style={{ marginTop: 16 }}>
                <div className="mt-mini" style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span>大众“感知”到的风险</span><b style={{ color: BLUEC, fontFamily: "var(--mono)" }}>{perceived}</b></div>
                <div className="mt-bar"><i style={{ width: `${perceived}%`, background: BLUEC }} /></div>
                <div className="mt-mini" style={{ display: "flex", justifyContent: "space-between", margin: "12px 0 4px" }}><span>真实风险（支付的价格越高越大）</span><b style={{ color: AMBER, fontFamily: "var(--mono)" }}>{real}</b></div>
                <div className="mt-bar"><i style={{ width: `${real}%`, background: AMBER }} /></div>
              </div>
              <div className={`mt-rev ${opt > 60 ? "g-bad" : opt < 40 ? "g-good" : "g-neutral"}`} style={{ marginTop: 14 }}>
                {opt > 60 ? "市场越狂热，大众越觉得安全，真实风险却越高——最大的风险，来自支付过高的价格。"
                  : opt < 40 ? "人人恐惧、价格极低时，大众感觉最危险，真实风险其实最小——这往往是机会。"
                  : "情绪中性，风险与感知大致匹配。"}
              </div>
            </div>
            <div className="mt-note">
              <div className="mt-notetag"><Info size={12} /> 现实提醒</div>
              <p className="mt-notep">投资者的工作是<b>控制</b>风险，而非回避风险。风控在顺境里看不见、像白花钱，却在退潮时决定生死——“退潮时，才知道谁在裸泳”。没有亏损，不代表当初没冒险。</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="mt-anim">
            <span className="mt-tagl"><Waves size={13} /> 第 5 章 · 周期与钟摆</span>
            <h2 className="mt-h">钟摆：极少停在“理性的中点”</h2>
            <p className="mt-lead">规则一：多数事物都是<b>周期性</b>的。规则二：当别人忘记规则一时，最大的盈亏机会就出现了。投资者情绪像钟摆，在贪婪与恐惧之间摆荡，很少停在中间。</p>
            <div className="mt-card">
              <svg viewBox="0 0 280 196" width="100%" style={{ maxWidth: 320, display: "block", margin: "0 auto" }}>
                <path d="M70 150 Q140 192 210 150" fill="none" stroke={LINE} strokeWidth="1.4" strokeDasharray="4 5" />
                <line x1="140" y1="150" x2="140" y2="166" stroke={INK2} strokeWidth="1.4" />
                <text x="140" y="182" fontFamily="Spline Sans Mono" fontSize="10" fill={INK2} textAnchor="middle">理性中点</text>
                <text x="58" y="138" fontFamily="Spline Sans Mono" fontSize="11" fill={AMBER} textAnchor="middle">贪婪 · 狂热</text>
                <text x="222" y="138" fontFamily="Spline Sans Mono" fontSize="11" fill={BLUEC} textAnchor="middle">恐惧 · 恐慌</text>
                <g className="mt-pend">
                  <line x1="140" y1="30" x2="140" y2="150" stroke={INK} strokeWidth="2.4" />
                  <circle cx="140" cy="150" r="15" fill={PLUM} />
                </g>
                <circle className="mt-pivot" cx="140" cy="30" r="4.5" />
              </svg>
              <div className="mt-mini" style={{ textAlign: "center", margin: "4px 0 12px" }}>注意：钟摆在两端最“慢”、停留最久，飞速掠过中间——这正是马克斯的观察。</div>
              <div className="mt-opt">
                <button className={`mt-optbtn ${pend === 0 ? "sel" : ""}`} onClick={() => setPend(0)}>贪婪端</button>
                <button className={`mt-optbtn ${pend === 1 ? "sel" : ""}`} onClick={() => setPend(1)}>中点</button>
                <button className={`mt-optbtn ${pend === 2 ? "sel" : ""}`} onClick={() => setPend(2)}>恐惧端</button>
              </div>
              {pend !== null && (
                <div className={`mt-rev ${pend === 0 ? "g-bad" : pend === 2 ? "g-good" : "g-neutral"} mt-anim`} style={{ marginTop: 12 }}>
                  {pend === 0 ? "人人贪婪、追高时——该谨慎、降低风险，甚至逆向卖出。"
                    : pend === 2 ? "人人恐惧、抛售时——往往是最好的买入机会。"
                    : "钟摆极少停在这里，大部分时间都在奔向（或离开）某个极端。"}
                </div>
              )}
            </div>
            <div className="mt-note">
              <div className="mt-notetag"><Info size={12} /> 现实提醒</div>
              <p className="mt-notep">“树不会长到天上去”，极少有东西真的归零。但你<b>无法</b>预测钟摆何时反转——能做的是认出当前大致在哪一端，并相应地增减风险。</p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="mt-anim">
            <span className="mt-tagl"><Users size={13} /> 第 6 章 · 逆向投资</span>
            <h2 className="mt-h">在极端处与人群相反——但不是无脑对着干</h2>
            <p className="mt-lead">“别人贪婪时恐惧，别人恐惧时贪婪。”但逆向只在<b>极端处</b>才有效——中间地带，人群多数时候是对的。试试判断每种局面该怎么做：</p>
            {CONTRA.map((c, i) => {
              const ans = contra[i];
              return (
                <div className="mt-card" key={i} style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 15, lineHeight: 1.5, margin: "0 0 9px" }}>{c.s}</p>
                  {ans === undefined ? (
                    <div className="mt-opt">
                      <button className="mt-optbtn" onClick={() => setContra(a => ({ ...a, [i]: "opp" }))}>和人群相反</button>
                      <button className="mt-optbtn" onClick={() => setContra(a => ({ ...a, [i]: "follow" }))}>不必逆向</button>
                    </div>
                  ) : (
                    <div className={`mt-rev ${(ans === "opp") === c.opp ? "g-good" : "g-bad"} mt-anim`}>
                      {(ans === "opp") === c.opp ? <Check size={13} style={{ verticalAlign: "-2px" }} /> : <X size={13} style={{ verticalAlign: "-2px" }} />} {c.w}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="mt-note">
              <div className="mt-notetag"><Info size={12} /> 现实提醒</div>
              <p className="mt-notep">让你犯错的情绪敌人：贪婪、恐惧、自负、嫉妒、从众，以及在最糟时刻“缴械投降”。逆向很难、很孤独，还常常“看起来错了很久”——所以你不仅要敢逆向，更要<b>判断正确</b>。</p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="mt-anim">
            <span className="mt-tagl"><Thermometer size={13} /> 第 7 章 · 知道我们身处何处</span>
            <h2 className="mt-h">给市场量体温</h2>
            <p className="mt-lead">马克斯属于“我不知道”学派：未来无法预测。但你可以观察当下、判断我们大致处在周期的哪个位置。给每一项打钩，看结论：</p>
            <div className="mt-card">
              {THERM.map((t, i) => (
                <div className="mt-trow" key={i}>
                  <div className="mt-tk">{t.k}</div>
                  <div className="mt-tg">
                    <button className={`mt-tgb ${therm[i] === "hot" ? "hot" : ""}`} onClick={() => setTherm(a => ({ ...a, [i]: "hot" }))}>{t.hot}</button>
                    <button className={`mt-tgb ${therm[i] === "cold" ? "cold" : ""}`} onClick={() => setTherm(a => ({ ...a, [i]: "cold" }))}>{t.cold}</button>
                  </div>
                </div>
              ))}
              {thermDone && (
                <div className={`mt-rev ${hotN >= 4 ? "g-bad" : hotN <= 1 ? "g-good" : "g-neutral"} mt-anim`} style={{ marginTop: 12 }}>
                  {hotN}/6 项偏“热”——{hotN >= 4 ? "市场偏热：危险区。该谨慎、防御、降低风险。" : hotN <= 1 ? "市场偏冷：机会区。可以更积极地进攻。" : "中性区：保持平衡，别走极端。"}
                </div>
              )}
              {!thermDone && <div className="mt-mini" style={{ marginTop: 10 }}>把六项都选完，看市场体温结论。</div>}
            </div>
            <div className="mt-note">
              <div className="mt-notetag"><Info size={12} /> 现实提醒</div>
              <p className="mt-notep">“我们也许永远不知道要去哪，但最好清楚自己现在在哪。”量体温是判断“此刻位置”，不是预测“未来走向”——别把温度计当水晶球。</p>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="mt-anim">
            <span className="mt-tagl"><Shield size={13} /> 第 8 章 · 运气·防御·不对称</span>
            <h2 className="mt-h">用“过程”而非“单次结果”评判</h2>
            <p className="mt-lead">运气在结果里占比惊人。好决策可能有坏结果，坏决策也可能侥幸成功。点开每个格子，看马克斯（与塔勒布）的教训：</p>
            <div className="mt-card">
              <div className="mt-mtx">
                {MTX.map((c, i) => (
                  <button key={i} className={`mt-cell ${mtx === i ? "on" : ""}`} onClick={() => setMtx(i)}>
                    <div style={{ fontFamily: "var(--disp)", fontSize: 15 }}>{c.t}</div>
                  </button>
                ))}
              </div>
              {mtx !== null && <div className={`mt-rev ${MTX[mtx].tone} mt-anim`} style={{ marginTop: 12 }}>{MTX[mtx].d}</div>}
            </div>
            <div className="mt-note">
              <div className="mt-notetag"><Info size={12} /> 现实提醒</div>
              <p className="mt-notep">最优秀的投资者追求<b>不对称</b>：涨时能跟上、跌时损失更小，长期靠“少亏”取胜。马克斯偏好防御——“世上有老投资者，也有胆大的投资者，但没有又老又胆大的投资者。”避开输家，赢家自会照顾好自己。</p>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="mt-anim">
            <span className="mt-tagl"><Compass size={13} /> 第 9 章 · 拼起来</span>
            <h2 className="mt-h">没有唯一“最重要的事”</h2>
            <div className="mt-card" style={{ marginBottom: 14 }}>
              <div className="mt-tagl"><Sparkles size={13} /> 全书主干一句话回顾</div>
              <p className="mt-p" style={{ marginBottom: 0, color: "var(--ink)" }}>
                第二层思维 → 以价值为锚、别为好资产付过高价 → 把风险理解为“永久损失的概率” → 风险在高位最大、控制风险靠防御 → 看懂周期与钟摆 → 在极端处逆向、抵御情绪 → 承认预测的局限但给市场量体温 → 重视运气、追求不对称、以防御取胜。这些“最重要的事”环环相扣，必须一起发挥作用。
              </p>
            </div>
            <div className="mt-note">
              <div className="mt-notetag"><Info size={12} /> 现实提醒</div>
              <p className="mt-notep" style={{ marginBottom: 10 }}>本书 2011 年成书（金融危机刚过），但马克斯的思想来自他几十年持续更新的“投资备忘录”——</p>
              <div className="mt-li" style={{ alignItems: "flex-start" }}><span style={{ fontSize: 15, lineHeight: 1.55 }}>原理（第二层思维、价值、风险=损失、周期、逆向、防御、谦逊）经久不衰；具体的市场判断有时效。比如他 2022 年的备忘录《<b>Sea Change（沧海桑田）</b>》就提醒：长期超低利率的时代已经结束，环境变了，结论也要更新。</span></div>
              <div className="mt-li" style={{ alignItems: "flex-start" }}><span style={{ fontSize: 15, lineHeight: 1.55 }}>逆向不是“无脑对着干”：人群在中间地带多数时候是对的，逆向只在<b>极端处、且你判断正确</b>时才有效——而且你可能“看起来错了很久”。</span></div>
              <div className="mt-li" style={{ alignItems: "flex-start" }}><span style={{ fontSize: 15, lineHeight: 1.55 }}>“量体温”回答的是“我们在哪”，不是“要去哪”。别把温度计当水晶球，也别把任何一条规则当成可以机械套用的公式。</span></div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="mt-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="mt-progress"><i style={{ width: `${(ch / (total - 1)) * 100}%` }} /></div>
      <div className="mt-wrap">
        <div className="mt-top"><BookOpen size={14} /> 投资最重要的事 · 互动导读</div>
        <div className="mt-chips">
          {CHAPTERS.map((c, i) => { const Ic = c.icon; return (
            <button key={i} className={`mt-chip ${i === ch ? "on" : ""}`} onClick={() => setCh(i)}><Ic size={13} /> {i}. {c.t}</button>
          ); })}
        </div>
        {render()}
      </div>
      <div className="mt-nav">
        <button className="mt-btn" disabled={ch === 0} onClick={() => setCh(c => Math.max(0, c - 1))}><ArrowLeft size={14} /> 上一章</button>
        <span className="mt-pageno">{ch + 1} / {total}</span>
        <button className="mt-btn" disabled={ch === total - 1} onClick={() => setCh(c => Math.min(total - 1, c + 1))}>下一章 <ArrowRight size={14} /></button>
      </div>
    </div>
  );
}
