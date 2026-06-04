import React, { useState } from "react";
import {
  BookOpen, ListChecks, Shield, FileText, Activity, Percent, Scale, Calculator,
  Timer, Building2, AlertTriangle, Check, X, ArrowLeft, ArrowRight, Sparkles,
  TrendingUp, Lightbulb,
} from "lucide-react";

const INK = "#1e2329", INK2 = "#5c6670", LINE = "#d3d7d3", INDIGO = "#33409a", INDIGO2 = "#4a59c0";
const WARN = "#a8324a", WARN2 = "#c14a5f", GOOD = "#1f7a5a", DARK = "#1b2026", ONDARK = "#eef0ee", ONDARK2 = "#9aa4ac", CARD = "#fafbfa";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
:root{
  --paper:#eef0ee; --paper2:#e2e6e2; --card:#fafbfa; --ink:#1e2329; --ink2:#5c6670; --line:#d3d7d3;
  --indigo:#33409a; --indigo2:#4a59c0; --warn:#a8324a; --warn2:#c14a5f; --good:#1f7a5a;
  --dark:#1b2026; --onDark:#eef0ee; --onDark2:#9aa4ac;
}
.fr-root{
  --display:'Bricolage Grotesque','Segoe UI',system-ui,sans-serif;
  --mono:'DM Mono','SFMono-Regular',Menlo,Consolas,monospace;
  font-family:'Hanken Grotesk','Segoe UI',system-ui,sans-serif;
  color:var(--ink); background:var(--paper); min-height:100%; position:relative; -webkit-font-smoothing:antialiased;
}
.fr-progress{height:3px;background:var(--paper2)}
.fr-progress>i{display:block;height:100%;background:linear-gradient(90deg,var(--indigo),var(--indigo2));transition:width .45s ease}
.fr-wrap{max-width:780px;margin:0 auto;padding:16px 18px 124px}
.fr-top{display:flex;align-items:center;gap:8px;color:var(--ink2);font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:14px 2px 8px}
.fr-chips{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 12px;scrollbar-width:none}
.fr-chips::-webkit-scrollbar{display:none}
.fr-chip{flex:0 0 auto;display:flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--card);color:var(--ink2);
  font-family:var(--mono);font-size:11.5px;padding:7px 11px;border-radius:7px;cursor:pointer;white-space:nowrap;transition:.16s}
.fr-chip:hover{border-color:var(--indigo)}
.fr-chip.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.fr-tag{display:inline-flex;align-items:center;gap:7px;font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--indigo);margin-bottom:8px}
.fr-h{font-family:var(--display);font-weight:800;font-size:25px;line-height:1.12;margin:0 0 7px;letter-spacing:-.01em}
.fr-lead{font-size:16px;line-height:1.6;margin:0 0 13px}
.fr-p{font-size:15px;line-height:1.66;color:var(--ink2);margin:0 0 12px}
.fr-mini{font-family:var(--mono);font-size:11px;color:var(--ink2);letter-spacing:.02em}
.fr-num{font-family:var(--mono);font-variant-numeric:tabular-nums}
.fr-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px}
.fr-rule{height:1px;background:var(--line);margin:16px 0;border:0}
.fr-anim{animation:frUp .5s cubic-bezier(.2,.7,.2,1) both}
@keyframes frUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.fr-btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:13px;border:1px solid var(--ink);
  background:transparent;color:var(--ink);padding:9px 14px;border-radius:7px;cursor:pointer;transition:.16s}
.fr-btn:hover{background:var(--ink);color:var(--paper)}
.fr-btn:disabled{opacity:.32;cursor:not-allowed}.fr-btn:disabled:hover{background:transparent;color:var(--ink)}
.fr-nav{position:sticky;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:10px;
  background:linear-gradient(180deg,rgba(238,240,238,0),var(--paper) 40%);padding:16px 18px;max-width:780px;margin:0 auto}
.fr-pageno{font-family:var(--mono);font-size:12px;color:var(--ink2);letter-spacing:.08em}
/* limitation / reality annotation — signature element */
.fr-note{background:rgba(168,50,74,.06);border-left:3px solid var(--warn);border-radius:0 12px 12px 0;padding:14px 16px;margin-top:14px}
.fr-notetag{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--warn);margin-bottom:7px}
.fr-notep{font-size:14px;line-height:1.6;color:var(--ink);margin:0}
/* cover */
.fr-cover{background:var(--dark);border-radius:16px;padding:30px 24px 18px;position:relative;overflow:hidden;color:var(--onDark);
  background-image:linear-gradient(rgba(154,164,172,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(154,164,172,.07) 1px,transparent 1px);
  background-size:26px 26px}
.fr-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(154,164,172,.4);color:var(--onDark2);
  font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:5px 11px;border-radius:7px}
/* reveal / verdict */
.fr-rev{margin-top:12px;border-radius:11px;padding:13px 15px;font-size:14px;line-height:1.55;border:1px solid}
.g-good{background:rgba(31,122,90,.08);border-color:rgba(31,122,90,.34);color:#155c43}
.g-bad{background:rgba(168,50,74,.08);border-color:rgba(168,50,74,.34);color:#8a2a3d}
.g-neutral{background:var(--paper2);border-color:var(--line);color:var(--ink2)}
.fr-opt{display:flex;gap:10px}
.fr-optbtn{flex:1;font-family:var(--mono);font-size:13px;border:1px solid var(--line);background:var(--paper);color:var(--ink);
  padding:10px;border-radius:9px;cursor:pointer;transition:.15s;line-height:1.4}
.fr-optbtn:hover{border-color:var(--ink)}
.fr-optbtn.sel{background:rgba(51,64,154,.1);border-color:var(--indigo);color:#28327a}
.fr-opts{display:flex;flex-wrap:wrap;gap:8px}
.fr-ob{font-family:var(--mono);font-size:12px;border:1px solid var(--line);background:var(--paper);color:var(--ink);padding:8px 10px;border-radius:8px;cursor:pointer;transition:.15s}
.fr-ob:hover{border-color:var(--indigo)}
.fr-ob.correct{background:rgba(31,122,90,.12);border-color:var(--good);color:#155c43}
.fr-ob.wrong{background:rgba(168,50,74,.12);border-color:var(--warn);color:#8a2a3d}
.fr-ob.dim{opacity:.45}
.fr-tap{border:1px solid var(--line);border-radius:11px;padding:14px;cursor:pointer;transition:.15s;background:var(--card)}
.fr-tap:hover{border-color:var(--indigo)}
.fr-tap.open{background:rgba(51,64,154,.04);border-color:var(--indigo)}
.fr-li{display:flex;gap:12px;padding:10px 0;border-bottom:1px dashed var(--line)}
.fr-li:last-child{border-bottom:0}
.fr-badge{flex:0 0 auto;width:28px;height:28px;border-radius:8px;display:grid;place-items:center;background:var(--paper2);color:var(--indigo)}
.fr-slider{display:flex;flex-direction:column;gap:6px}
.fr-slider label{display:flex;justify-content:space-between;font-family:var(--mono);font-size:12px;color:var(--ink2)}
.fr-slider label b{color:var(--ink);font-weight:600}
.fr-range{width:100%;accent-color:var(--indigo);height:22px;cursor:pointer}
.fr-bar{display:flex;height:26px;border-radius:7px;overflow:hidden;border:1px solid var(--line)}
.fr-stat{font-family:var(--display);font-weight:800;line-height:1}
.fr-pill2{display:inline-block;font-family:var(--mono);font-size:12px;padding:5px 11px;border-radius:999px;font-weight:500}
.fr-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.fr-tab{font-family:var(--mono);font-size:12.5px;border:1px solid var(--line);background:var(--card);color:var(--ink2);padding:8px 12px;border-radius:8px;cursor:pointer;transition:.15s}
.fr-tab:hover{border-color:var(--indigo)}
.fr-tab.on{background:var(--indigo);color:#fff;border-color:var(--indigo)}
.fr-kv{display:flex;gap:10px;padding:10px 0;border-bottom:1px dashed var(--line)}
.fr-kv:last-child{border-bottom:0}
.fr-kvk{flex:0 0 84px;font-family:var(--mono);font-size:11px;color:var(--indigo);text-transform:uppercase;letter-spacing:.06em;padding-top:2px}
`;

const yuan = (n, d = 2) => "¥" + n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d });

const RULES = [
  ["做功课", "买之前先弄懂这家公司怎么赚钱；看不懂就跳过。"],
  ["找经济护城河", "只买拥有可持续竞争优势、能长期赚超额回报的公司。"],
  ["留足安全边际", "估出价值后，只在价格明显低于价值时才买。"],
  ["长期持有", "减少交易、费用与税负，让护城河和复利发挥作用。"],
  ["知道何时卖出", "为正确的理由卖出，而不是被价格波动吓到。"],
];

const MIS = [
  { b: "“现在大盘要跌，先清仓躲一躲。”", bad: true, n: "择时几乎没人能持续做对——错过少数几个大涨日，长期收益就大打折扣。" },
  { b: "某股从高点跌了很多，“这么便宜，抄底接一手”。", bad: true, n: "下跌往往有基本面原因（接飞刀）。先问“生意是不是真的变差了”，而非只看跌了多少。" },
  { b: "公司利润很漂亮，于是放心买入。", bad: true, n: "会计利润可被操纵。Dorsey 反复强调：盯自由现金流，它更难造假。" },
  { b: "“这是颠覆性新科技，这次不一样！”", bad: true, n: "泡沫里最贵的一句话。再好的故事，也要回到现金流和估值。" },
  { b: "买之前，先弄懂它怎么赚钱、有没有护城河。", bad: false, n: "这正是第一条军规——做功课。" },
  { b: "估出价值后，只在价格明显低于价值时才买。", bad: false, n: "安全边际——第三条军规，给判断和坏运气留缓冲。" },
];

const MOAT_OPTS = ["无形资产(品牌/专利/牌照)", "转换成本", "网络效应", "成本/规模优势", "其实不是护城河"];
const MOAT_Q = [
  { q: "可口可乐的品牌，让它的汽水卖得比白牌贵、还更让人放心。", a: 0, w: "品牌属于无形资产，带来定价权与信任。" },
  { q: "一个社交软件，你所有朋友都在用，换别的几乎没人陪你聊。", a: 2, w: "网络效应——用户越多对每个人越有价值，后来者极难追赶。" },
  { q: "某大企业的核心系统用了某 ERP，迁移要重训全员、停工风险高。", a: 1, w: "转换成本高，客户被“黏”住，轻易不换。" },
  { q: "Costco 靠巨大采购量，把进货成本压到对手难以企及的低位。", a: 3, w: "规模带来的成本优势，能长期低价又赚钱。" },
  { q: "某公司去年推出一款很棒的爆款产品，卖得火热。", a: 4, w: "好产品 ≠ 护城河——会被模仿、被超越，除非背后有可持续优势。" },
  { q: "某公司目前市场份额行业第一。", a: 4, w: "份额大 ≠ 护城河，随时可能被侵蚀；要看“为什么能守住”。" },
];

const SELL = [
  { s: "你买的公司，护城河正被新技术侵蚀，长期前景明显变差。", sell: true, w: "基本面恶化，是卖出的正确理由。" },
  { s: "股价从你买入后跌了 20%，但公司基本面没变、甚至更便宜了。", sell: false, w: "价格下跌本身不是卖的理由——反而可能是加仓机会。" },
  { s: "股价涨到远超你算出的内在价值，市场极度乐观。", sell: true, w: "过度高估时卖出是合理的（落袋或换更好的机会）。" },
  { s: "财经新闻说大盘可能要跌，你想先躲一躲。", sell: false, w: "这是择时——第一章就说了，几乎没人能持续做对。" },
  { s: "你后来发现当初看错了它的生意模式和护城河。", sell: true, w: "承认错误、修正判断，是卖出的正确理由。" },
];

const SECTORS = [
  { name: "银行", moat: "低成本存款、转换成本、规模", watch: "ROE、净息差、资产质量(坏账率)、资本充足/杠杆", risk: "过度放贷、坏账集中爆发、杠杆放大亏损" },
  { name: "软件", moat: "高转换成本、网络效应、订阅式经常性收入", watch: "续费/留存率、毛利率、自由现金流", risk: "被新技术颠覆、增长见顶、估值过高" },
  { name: "消费品/品牌", moat: "品牌(无形资产)带来的定价权", watch: "毛利率、份额稳定性、ROIC", risk: "品牌老化、自有品牌/白牌冲击" },
  { name: "医药", moat: "专利、研发管线、规模", watch: "专利到期(悬崖)、在研管线、研发回报率", risk: "专利到期、临床失败、监管控价" },
  { name: "零售/消费服务", moat: "成本/规模/地段(多数较浅)", watch: "同店销售、库存周转、利润率", risk: "竞争激烈、电商冲击、护城河薄" },
  { name: "公用事业", moat: "受监管的区域垄断、巨大资本壁垒", watch: "监管环境、负债、股息可持续性", risk: "监管不利、利率上行、资本开支沉重" },
];

const CHAPTERS = [
  { t: "扉页", icon: BookOpen },
  { t: "五条军规", icon: ListChecks },
  { t: "经济护城河", icon: Shield },
  { t: "读懂财报", icon: FileText },
  { t: "公司质量·ROIC", icon: Activity },
  { t: "相对估值·P/E", icon: Percent },
  { t: "相对估值·P/B·P/S", icon: Scale },
  { t: "绝对估值·DCF", icon: Calculator },
  { t: "买卖纪律", icon: Timer },
  { t: "分行业·要点", icon: Building2 },
];

export default function App() {
  const [ch, setCh] = useState(0);
  const [mis, setMis] = useState({});
  const [moatA, setMoatA] = useState({});
  const [sellA, setSellA] = useState({});
  const [sec, setSec] = useState(0);
  // fcf
  const [ocf, setOcf] = useState(5), [capex, setCapex] = useState(2);
  const fcf = ocf - capex;
  // dupont
  const [dmar, setDmar] = useState(10), [dturn, setDturn] = useState(1.0), [dlev, setDlev] = useState(2.0);
  const roe = dmar * dturn * dlev;
  // peg
  const [peM, setPeM] = useState(25), [grM, setGrM] = useState(15);
  const peg = grM > 0 ? peM / grM : 0;
  // ps
  const [psv, setPsv] = useState(2.0), [psMar, setPsMar] = useState(8);
  const implPE = psMar > 0 ? psv / (psMar / 100) : 0;
  // dcf
  const [f0, setF0] = useState(2.0), [g1, setG1] = useState(10), [gT, setGT] = useState(3), [rD, setRD] = useState(9);
  const dcfCalc = (r) => {
    const rd = r / 100, g = g1 / 100, gt = gT / 100;
    if (rd <= gt + 0.0001) return null;
    let pvE = 0, f = f0;
    for (let t = 1; t <= 5; t++) { f = f0 * Math.pow(1 + g, t); pvE += f / Math.pow(1 + rd, t); }
    const f5 = f0 * Math.pow(1 + g, 5);
    const term = (f5 * (1 + gt)) / (rd - gt);
    const pvT = term / Math.pow(1 + rd, 5);
    return { val: pvE + pvT, pvE, pvT };
  };
  const dcf = dcfCalc(rD);

  const total = CHAPTERS.length;
  const verdictPill = (txt, cls) => <span className="fr-pill2" style={{ background: cls === "g" ? "rgba(31,122,90,.14)" : cls === "b" ? "rgba(168,50,74,.14)" : "var(--paper2)", color: cls === "g" ? "#155c43" : cls === "b" ? "#8a2a3d" : "var(--ink2)" }}>{txt}</span>;

  const render = () => {
    switch (ch) {
      case 0:
        return (
          <div className="fr-anim">
            <div className="fr-cover">
              <span className="fr-pill"><Sparkles size={13} /> 实战估值手册 · 2004</span>
              <h1 style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 36, margin: "16px 0 4px", color: "var(--onDark)", lineHeight: 1.06 }}>股市真规则</h1>
              <p className="fr-num" style={{ color: "var(--onDark2)", fontSize: 12, letterSpacing: ".02em", margin: 0 }}>The Five Rules for Successful Stock Investing</p>
              <p style={{ fontFamily: "var(--display)", fontWeight: 600, color: "var(--onDark)", marginTop: 14, fontSize: 15.5, lineHeight: 1.5 }}>
                作者：帕特·多尔西（Pat Dorsey）<br />晨星公司（Morningstar）前股票研究主管
              </p>
              <p style={{ color: "var(--onDark2)", fontSize: 13.5, lineHeight: 1.55, marginTop: 12 }}>
                如果说前几本教你“心态”，这一本教你“手艺”：怎么读财报、怎么找护城河，以及 P/E、P/B、P/S、DCF 到底<b style={{ color: "var(--onDark)" }}>怎么用、各自又会在哪儿骗你</b>。
              </p>
            </div>
            <div className="fr-card" style={{ marginTop: 16 }}>
              <div className="fr-tag">全书的脊梁：五条军规</div>
              {RULES.map(([t, d], i) => (
                <div className="fr-li" key={i}>
                  <div className="fr-badge fr-num" style={{ fontWeight: 600 }}>{i + 1}</div>
                  <div><b style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15.5 }}>{t}</b><div className="fr-mini" style={{ color: "var(--ink2)", fontFamily: "Hanken Grotesk,sans-serif", fontSize: 13 }}>{d}</div></div>
                </div>
              ))}
            </div>
            <p className="fr-mini" style={{ textAlign: "center", marginTop: 14 }}>点「下一章」开始，或上方目录任意跳转</p>
          </div>
        );

      case 1:
        return (
          <div className="fr-anim">
            <span className="fr-tag"><ListChecks size={13} /> 第 1 章 · 框架与避坑</span>
            <h2 className="fr-h">五条军规，和它们的反面</h2>
            <p className="fr-lead">五条军规是全书的操作系统（见扉页）。Dorsey 还专门列了投资者最常犯的错——下面这些做法，是对是错？点一下看他的判断。</p>
            <div className="fr-card">
              {MIS.map((m, i) => (
                <div key={i} style={{ padding: "11px 0", borderBottom: i < MIS.length - 1 ? "1px dashed var(--line)" : "none" }}>
                  <div className="fr-tap" style={{ border: "none", padding: 0, background: "none" }} onClick={() => setMis(a => ({ ...a, [i]: !a[i] }))}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <b style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 14.5 }}>{m.b}</b>
                      <span className="fr-mini" style={{ flex: "0 0 auto", color: "var(--indigo)" }}>{mis[i] ? "收起" : "看判断 ▸"}</span>
                    </div>
                  </div>
                  {mis[i] && (
                    <div className={`fr-rev ${m.bad ? "g-bad" : "g-good"} fr-anim`} style={{ marginTop: 8 }}>
                      {m.bad ? <><X size={13} style={{ verticalAlign: "-2px" }} /> 这是常见错误。</> : <><Check size={13} style={{ verticalAlign: "-2px" }} /> 这是正确做法。</>} {m.n}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="fr-note">
              <div className="fr-notetag"><AlertTriangle size={12} /> 现实批注</div>
              <p className="fr-notep">这些“错误”今天依旧高频：散户被割的钱，大多来自择时、追热点、接飞刀、过度交易，而不是来自耐心持有好公司。军规不性感，但管用。</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="fr-anim">
            <span className="fr-tag"><Shield size={13} /> 第 2 章 · 全书的核心</span>
            <h2 className="fr-h">经济护城河：能长期赚超额回报的护栏</h2>
            <p className="fr-lead">护城河 = 可持续的竞争优势，让公司长期维持高资本回报。Dorsey 归纳出五种来源；也提醒你别把“假护城河”当真。先来辨认——下面的优势属于哪一类？</p>
            <div className="fr-card">
              {MOAT_Q.map((c, i) => {
                const chosen = moatA[i];
                return (
                  <div key={i} style={{ padding: "12px 0", borderBottom: i < MOAT_Q.length - 1 ? "1px dashed var(--line)" : "none" }}>
                    <p style={{ fontSize: 14.5, lineHeight: 1.5, margin: "0 0 9px" }}>{i + 1}. {c.q}</p>
                    <div className="fr-opts">
                      {MOAT_OPTS.map((opt, oi) => {
                        let cls = "fr-ob";
                        if (chosen !== undefined) { if (oi === c.a) cls += " correct"; else if (oi === chosen) cls += " wrong"; else cls += " dim"; }
                        return <button key={oi} className={cls} onClick={() => chosen === undefined && setMoatA(a => ({ ...a, [i]: oi }))}>{opt}</button>;
                      })}
                    </div>
                    {chosen !== undefined && (
                      <div className={`fr-rev ${chosen === c.a ? "g-good" : "g-bad"} fr-anim`} style={{ marginTop: 8 }}>
                        正确：{MOAT_OPTS[c.a]}。{c.w}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="fr-note">
              <div className="fr-notetag"><AlertTriangle size={12} /> 现实批注</div>
              <p className="fr-notep">最常见的误判，就是把“好产品、份额大、执行强、明星 CEO”当成护城河——它们能赚一时，但易被模仿。护城河会变窄，要持续盯：回报率（ROIC）是不是还稳稳高于资本成本。</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="fr-anim">
            <span className="fr-tag"><FileText size={13} /> 第 3 章 · 投资的语言</span>
            <h2 className="fr-h">三张表，以及为什么“现金为王”</h2>
            <p className="fr-lead">看懂一家公司，先看三张财务报表——它们各自回答一个不同的问题：</p>
            <div className="fr-card" style={{ marginBottom: 14 }}>
              {[["利润表", "这段时间赚了多少？（收入、成本、利润）"], ["资产负债表", "此刻家底多厚、欠债多少？（资产、负债、净资产）"], ["现金流量表", "真金白银到底进出了多少？（最难造假）"]].map(([k, v], i) => (
                <div className="fr-li" key={i}><div className="fr-badge"><FileText size={14} /></div>
                  <div><b style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15 }}>{k}</b><div className="fr-mini" style={{ color: "var(--ink2)", fontFamily: "Hanken Grotesk,sans-serif", fontSize: 13 }}>{v}</div></div></div>
              ))}
            </div>
            <p className="fr-p">Dorsey 反复强调一个数字：<b>自由现金流 FCF＝经营现金流－资本开支</b>，也就是公司维持运转后“真正能拿走的钱”。利润能靠会计手法美化，现金流难得多。试着调一调：</p>
            <div className="fr-card">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="fr-slider"><label>经营现金流 <b className="fr-num">{yuan(ocf, 1)}/股</b></label><input className="fr-range" type="range" min="0" max="10" step="0.5" value={ocf} onChange={e => setOcf(+e.target.value)} /></div>
                <div className="fr-slider"><label>资本开支 <b className="fr-num">{yuan(capex, 1)}/股</b></label><input className="fr-range" type="range" min="0" max="8" step="0.5" value={capex} onChange={e => setCapex(+e.target.value)} /></div>
              </div>
              <hr className="fr-rule" />
              <div style={{ textAlign: "center" }}>
                <div className="fr-mini">自由现金流 FCF</div>
                <div className="fr-stat" style={{ fontSize: 34, color: fcf >= 0 ? GOOD : WARN, margin: "4px 0" }}>{yuan(fcf, 1)}/股</div>
                <div className="fr-mini">{fcf >= 0 ? "公司能自我造血——好迹象" : "在烧钱：扩张期可接受，但要问钱能否变现"}</div>
              </div>
            </div>
            <div className="fr-note">
              <div className="fr-notetag"><AlertTriangle size={12} /> 现实批注</div>
              <p className="fr-notep">利润漂亮、现金流却很差，常是危险信号（如应收账款暴涨、把费用“资本化”）。但也别走极端：重资产成长期公司短期 FCF 为负很正常——关键看资本开支未来能否带来更多现金。</p>
            </div>
          </div>
        );

      case 4: {
        const levHeavy = dlev >= 3;
        return (
          <div className="fr-anim">
            <span className="fr-tag"><Activity size={13} /> 第 4 章 · 公司质量</span>
            <h2 className="fr-h">护城河的“体检”：ROE 是真本事，还是杠杆撑的？</h2>
            <p className="fr-lead">护城河的证据，是长期的高资本回报（ROE / ROIC）。但高 ROE 可能是真盈利，也可能是借钱堆出来的。用<b>杜邦分解</b>拆开看：ROE ＝ 净利率 × 资产周转率 × 权益乘数(杠杆)。</p>
            <div className="fr-card">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div className="fr-slider"><label style={{ flexDirection: "column", gap: 2, alignItems: "flex-start" }}>净利率<b className="fr-num">{dmar}%</b></label><input className="fr-range" type="range" min="1" max="30" step="1" value={dmar} onChange={e => setDmar(+e.target.value)} /></div>
                <div className="fr-slider"><label style={{ flexDirection: "column", gap: 2, alignItems: "flex-start" }}>周转率<b className="fr-num">{dturn.toFixed(1)}×</b></label><input className="fr-range" type="range" min="0.2" max="3" step="0.1" value={dturn} onChange={e => setDturn(+e.target.value)} /></div>
                <div className="fr-slider"><label style={{ flexDirection: "column", gap: 2, alignItems: "flex-start" }}>杠杆<b className="fr-num">{dlev.toFixed(1)}×</b></label><input className="fr-range" type="range" min="1" max="5" step="0.1" value={dlev} onChange={e => setDlev(+e.target.value)} /></div>
              </div>
              <hr className="fr-rule" />
              <div style={{ textAlign: "center" }}>
                <div className="fr-mini">净资产收益率 ROE</div>
                <div className="fr-stat" style={{ fontSize: 40, color: levHeavy ? WARN : INDIGO, margin: "4px 0" }}>{roe.toFixed(1)}%</div>
                <div className="fr-mini">{dmar}% × {dturn.toFixed(1)} × {dlev.toFixed(1)}</div>
              </div>
              {levHeavy && <div className="fr-rev g-bad" style={{ marginTop: 10 }}>注意：这个 ROE 很大程度靠 <b>{dlev.toFixed(1)}× 的杠杆</b>撑起来——同样的 ROE，靠高利率+低杠杆 ＞ 靠薄利+高杠杆。杠杆放大收益，也放大风险。</div>}
            </div>
            <div className="fr-note">
              <div className="fr-notetag"><AlertTriangle size={12} /> 现实批注</div>
              <p className="fr-notep">看“质量”别只看一个数：还要看回报是否<b>持续多年</b>、是否高于资本成本，再配合财务健康（负债、利息覆盖、流动性）。银行天生高杠杆，要用行业的标尺去衡量。</p>
            </div>
          </div>
        );
      }

      case 5:
        return (
          <div className="fr-anim">
            <span className="fr-tag"><Percent size={13} /> 第 5 章 · 相对估值 ①</span>
            <h2 className="fr-h">市盈率 P/E：最常用，也最容易被误用</h2>
            <p className="fr-lead"><b>P/E ＝ 股价 ÷ 每股收益</b>，即你为公司每 1 元年利润付多少钱。单看高低没意义——高 P/E 可能代表高增长或高质量。所以要<b>配着增长看</b>（PEG ＝ P/E ÷ 增长率）：</p>
            <div className="fr-card">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="fr-slider"><label>市盈率 P/E <b className="fr-num">{peM}×</b></label><input className="fr-range" type="range" min="5" max="50" step="1" value={peM} onChange={e => setPeM(+e.target.value)} /></div>
                <div className="fr-slider"><label>预期年增长 <b className="fr-num">{grM}%</b></label><input className="fr-range" type="range" min="1" max="40" step="1" value={grM} onChange={e => setGrM(+e.target.value)} /></div>
              </div>
              <hr className="fr-rule" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div className="fr-mini">PEG</div><div className="fr-stat" style={{ fontSize: 30, color: peg < 1 ? GOOD : peg > 2 ? WARN : INDIGO }}>{peg.toFixed(2)}</div></div>
                {verdictPill(peg < 1 ? "相对便宜" : peg <= 2 ? "大致合理" : "偏贵", peg < 1 ? "g" : peg <= 2 ? "n" : "b")}
              </div>
              <p className="fr-mini" style={{ marginTop: 10, color: "var(--ink2)", fontFamily: "Hanken Grotesk,sans-serif", fontSize: 13 }}>同样 25 倍 P/E：年增 25% 的公司（PEG≈1）远比年增 5%（PEG=5）的“值”。</p>
            </div>
            <div className="fr-note">
              <div className="fr-notetag"><AlertTriangle size={12} /> P/E 的局限</div>
              <p className="fr-notep">① 分母“利润”可被会计操纵，也可能为负或被一次性损益扭曲；② 周期股在景气顶 P/E 反而低、谷底却很高甚至失真；③ 不反映负债结构；④ PEG 只是粗略尺子，增长预测一旦落空，便宜就是假象。</p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="fr-anim">
            <span className="fr-tag"><Scale size={13} /> 第 6 章 · 相对估值 ②</span>
            <h2 className="fr-h">市净率 P/B 与市销率 P/S：各有专属场景</h2>
            <p className="fr-p"><b>P/B ＝ 股价 ÷ 每股净资产。</b>适合资产“市价≈账面”的行业（银行、保险、重资产）；对轻资产/高无形资产公司几乎无意义。低 P/B 可能是便宜，也可能是烂资产（价值陷阱）。</p>
            <p className="fr-p"><b>P/S ＝ 市值 ÷ 营收。</b>适合暂时不盈利或周期底部的公司，因为营收比利润稳定、难操纵。但它有个致命盲点——完全不看赚钱能力。拖动看看：</p>
            <div className="fr-card">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="fr-slider"><label>市销率 P/S <b className="fr-num">{psv.toFixed(1)}×</b></label><input className="fr-range" type="range" min="0.5" max="8" step="0.1" value={psv} onChange={e => setPsv(+e.target.value)} /></div>
                <div className="fr-slider"><label>净利率 <b className="fr-num">{psMar}%</b></label><input className="fr-range" type="range" min="1" max="30" step="1" value={psMar} onChange={e => setPsMar(+e.target.value)} /></div>
              </div>
              <hr className="fr-rule" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div className="fr-mini">换算出的隐含市盈率（P/S ÷ 净利率）</div><div className="fr-stat" style={{ fontSize: 30, color: implPE > 25 ? WARN : implPE < 12 ? GOOD : INDIGO }}>{implPE.toFixed(1)} 倍</div></div>
                {verdictPill(implPE < 12 ? "其实不贵" : implPE <= 25 ? "中性" : "其实很贵", implPE < 12 ? "g" : implPE <= 25 ? "n" : "b")}
              </div>
              <p className="fr-mini" style={{ marginTop: 10, color: "var(--ink2)", fontFamily: "Hanken Grotesk,sans-serif", fontSize: 13 }}>同样的 P/S，5% 净利率算下来 P/E 极高（贵），20% 净利率却很便宜——这就是 P/S 最大的陷阱。</p>
            </div>
            <div className="fr-note">
              <div className="fr-notetag"><AlertTriangle size={12} /> 局限提醒</div>
              <p className="fr-notep">P/B 对科技/品牌等轻资产公司会虚高甚至因净资产为负而失效；低 P/B 常是“便宜没好货”。P/S 必须搭配净利率与未来能否盈利一起看，否则只是“便宜的幻觉”。两者都只是<b>捷径</b>，不是真相。</p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="fr-anim">
            <span className="fr-tag"><Calculator size={13} /> 第 7 章 · 绝对估值</span>
            <h2 className="fr-h">DCF：把未来现金流折回今天</h2>
            <p className="fr-lead">内在价值 ＝ 公司未来自由现金流的<b>折现</b>之和。四个旋钮：当前 FCF、高增长期增速、永续增速、折现率（你要求的回报/风险）。试着转转看：</p>
            <div className="fr-card">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="fr-slider"><label>当前 FCF <b className="fr-num">{yuan(f0, 1)}/股</b></label><input className="fr-range" type="range" min="0.5" max="20" step="0.5" value={f0} onChange={e => setF0(+e.target.value)} /></div>
                <div className="fr-slider"><label>未来5年增速 <b className="fr-num">{g1}%</b></label><input className="fr-range" type="range" min="0" max="25" step="1" value={g1} onChange={e => setG1(+e.target.value)} /></div>
                <div className="fr-slider"><label>永续增速 <b className="fr-num">{gT}%</b></label><input className="fr-range" type="range" min="0" max="5" step="0.5" value={gT} onChange={e => setGT(+e.target.value)} /></div>
                <div className="fr-slider"><label>折现率 <b className="fr-num">{rD}%</b></label><input className="fr-range" type="range" min="4" max="15" step="0.5" value={rD} onChange={e => setRD(+e.target.value)} /></div>
              </div>
              <hr className="fr-rule" />
              {!dcf ? (
                <div className="fr-rev g-bad">折现率必须大于永续增速，否则模型会“爆炸”（无意义）。这本身就是一课：永续增速不能设得太高。</div>
              ) : (
                <>
                  <div style={{ textAlign: "center" }}>
                    <div className="fr-mini">每股内在价值（估算）</div>
                    <div className="fr-stat" style={{ fontSize: 40, color: INDIGO, margin: "4px 0" }}>{yuan(dcf.val, 1)}</div>
                  </div>
                  <div className="fr-mini" style={{ margin: "12px 0 4px" }}>价值构成：前 5 年现金流 vs 5 年后的“终值”</div>
                  <div className="fr-bar"><div style={{ width: `${dcf.pvE / dcf.val * 100}%`, background: INDIGO }} /><div style={{ width: `${dcf.pvT / dcf.val * 100}%`, background: INDIGO2 }} /></div>
                  <div className="fr-mini" style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span>前5年 {(dcf.pvE / dcf.val * 100).toFixed(0)}%</span><span>终值 {(dcf.pvT / dcf.val * 100).toFixed(0)}%</span></div>
                  <hr className="fr-rule" />
                  <div className="fr-mini" style={{ marginBottom: 6 }}>敏感性：折现率仅 ±1%，价值就大不同 ——</div>
                  <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                    {[rD - 1, rD, rD + 1].map((r, i) => { const v = dcfCalc(r); return (
                      <div key={i}><div className="fr-num" style={{ fontWeight: 600, fontSize: 18, color: i === 1 ? INK : INK2 }}>{v ? yuan(v.val, 0) : "—"}</div><div className="fr-mini">r={r}%</div></div>
                    ); })}
                  </div>
                </>
              )}
            </div>
            <div className="fr-note">
              <div className="fr-notetag"><AlertTriangle size={12} /> DCF 的局限（最关键）</div>
              <p className="fr-notep">输入垃圾，就输出垃圾。终值往往占价值的一大半，而它对增速、折现率极其敏感——上面 ±1% 的折现率就让结果天差地别。所以 DCF 是<b>帮你思考“值不值”的工具，不是精确神谕</b>；用保守假设，并配一个大大的安全边际。</p>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="fr-anim">
            <span className="fr-tag"><Timer size={13} /> 第 8 章 · 买卖纪律</span>
            <h2 className="fr-h">十分钟测试，与“为正确的理由卖出”</h2>
            <p className="fr-p"><b>十分钟测试</b>：在深入研究前，先快速过一遍——多数答“否”就直接跳过，省下时间。</p>
            <div className="fr-card" style={{ marginBottom: 14 }}>
              {["有真实的经营与盈利历史吗？", "有护城河迹象（长期高 ROIC）吗？", "财务健康、不靠堆债吗？", "自由现金流为正吗？", "管理层诚实、善待股东吗？", "这门生意，我看得懂吗？"].map((q, i) => (
                <div className="fr-li" key={i}><div className="fr-badge"><Check size={14} /></div><div style={{ fontSize: 14.5, paddingTop: 3 }}>{q}</div></div>
              ))}
            </div>
            <p className="fr-lead">卖出要为<b>正确的理由</b>，而不是被价格吓到。下面该不该卖？</p>
            {SELL.map((c, i) => {
              const ans = sellA[i];
              return (
                <div className="fr-card" key={i} style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 14.5, lineHeight: 1.5, margin: "0 0 9px" }}>{c.s}</p>
                  {ans === undefined ? (
                    <div className="fr-opt">
                      <button className="fr-optbtn" onClick={() => setSellA(a => ({ ...a, [i]: true }))}>卖出</button>
                      <button className="fr-optbtn" onClick={() => setSellA(a => ({ ...a, [i]: false }))}>继续持有</button>
                    </div>
                  ) : (
                    <div className={`fr-rev ${ans === c.sell ? "g-good" : "g-bad"} fr-anim`}>
                      {ans === c.sell ? <Check size={13} style={{ verticalAlign: "-2px" }} /> : <X size={13} style={{ verticalAlign: "-2px" }} />} Dorsey：应{c.sell ? "卖出" : "继续持有"}。{c.w}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="fr-note">
              <div className="fr-notetag"><AlertTriangle size={12} /> 现实批注</div>
              <p className="fr-notep">五个卖出的正当理由：① 当初看错了；② 基本面/护城河恶化；③ 有明显更好的机会；④ 股价远超内在价值；⑤ 单一持仓过重。注意——“股价跌了”从来不在其中。</p>
            </div>
          </div>
        );

      case 9: {
        const s = SECTORS[sec];
        return (
          <div className="fr-anim">
            <span className="fr-tag"><Building2 size={13} /> 第 9 章 · 分行业 + 全书要点</span>
            <h2 className="fr-h">不同行业，不同的护城河与尺子</h2>
            <p className="fr-lead">本书后半专讲“分行业看公司”。每个行业的护城河来源、要盯的指标、主要风险都不一样。选一个看看：</p>
            <div className="fr-card" style={{ marginBottom: 14 }}>
              <div className="fr-tabs">
                {SECTORS.map((x, i) => <button key={i} className={`fr-tab ${i === sec ? "on" : ""}`} onClick={() => setSec(i)}>{x.name}</button>)}
              </div>
              <div className="fr-anim" key={sec}>
                <div className="fr-kv"><div className="fr-kvk">护城河</div><div style={{ fontSize: 14.5 }}>{s.moat}</div></div>
                <div className="fr-kv"><div className="fr-kvk">重点看</div><div style={{ fontSize: 14.5 }}>{s.watch}</div></div>
                <div className="fr-kv"><div className="fr-kvk" style={{ color: WARN }}>主要风险</div><div style={{ fontSize: 14.5 }}>{s.risk}</div></div>
              </div>
            </div>
            <div className="fr-card">
              <div className="fr-tag" style={{ marginBottom: 6 }}><Lightbulb size={13} /> 全书一句话回顾</div>
              <p className="fr-p" style={{ marginBottom: 0, color: "var(--ink)" }}>做功课 → 找护城河 → 留安全边际 → 长期持有 → 为正确理由卖出。其中“懂生意 + 护城河 + 现金流 + 多角度估值且知其局限”，是这本书给你的真功夫。</p>
            </div>
            <div className="fr-note">
              <div className="fr-notetag"><AlertTriangle size={12} /> 现实批注 · 怎么读这本书</div>
              <p className="fr-notep">本书 2004 年成书、以美国市场为例：部分行业细节、会计口径、利率环境已变。但框架——护城河、现金为王、各类估值“怎么用＋会怎么骗你”、DCF 思考、安全边际、为正确理由买卖——至今是黄金。把它当<b>思维工具箱</b>，数字和案例按今天、按你的市场（如 A 股）灵活校准。这也回应你之前的疑问：真正的护城河是“懂生意 + 独立估值”，而不是套一个公开公式——公式会失效，判断力不会。</p>
            </div>
          </div>
        );
      }

      default: return null;
    }
  };

  return (
    <div className="fr-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="fr-progress"><i style={{ width: `${(ch / (total - 1)) * 100}%` }} /></div>
      <div className="fr-wrap">
        <div className="fr-top"><BookOpen size={14} /> 股市真规则 · 互动导读</div>
        <div className="fr-chips">
          {CHAPTERS.map((c, i) => { const Ic = c.icon; return (
            <button key={i} className={`fr-chip ${i === ch ? "on" : ""}`} onClick={() => setCh(i)}><Ic size={13} /> {i}. {c.t}</button>
          ); })}
        </div>
        {render()}
      </div>
      <div className="fr-nav">
        <button className="fr-btn" disabled={ch === 0} onClick={() => setCh(c => Math.max(0, c - 1))}><ArrowLeft size={14} /> 上一章</button>
        <span className="fr-pageno">{ch + 1} / {total}</span>
        <button className="fr-btn" disabled={ch === total - 1} onClick={() => setCh(c => Math.min(total - 1, c + 1))}>下一章 <ArrowRight size={14} /></button>
      </div>
    </div>
  );
}
