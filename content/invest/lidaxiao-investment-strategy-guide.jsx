import { useState, useMemo } from "react";

/* =========================================================================
   《李大霄投资战略》（第三版）· 互动导读
   水墨财经风格 — 红涨绿跌 · 朱砂 / 赤金 / 竹青 · 宋体为骨
   说明：全部导读文字为本人对原著思想的转述与梳理，并非原文摘录；
   书中观点系作者"一家之言"，仅供理解参考，切不可作为操作依据。
   ========================================================================= */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Noto+Serif+SC:wght@400;500;700;900&family=Noto+Sans+SC:wght@400;500;700&display=swap');

:root{
  --paper:#F2EAD8; --paper2:#ECE2CC; --paper3:#E6DBC1;
  --ink:#211B14; --ink-soft:#473F33; --ink-faint:#736959; --ink-ghost:#9C927E;
  --line:#D9CCB2; --line2:#CCBC9C;
  --red:#B4332A; --red-deep:#8C241D; --red-soft:#C56055; --red-wash:#F4E0D6;
  --gold:#A07F2C; --gold-soft:#BFA152; --gold-wash:#F0E6CC;
  --green:#3C6A54; --green-soft:#5E8770; --green-wash:#DEE7DD;
  --panel:#1D1912; --panel2:#272118; --panel-line:#3A3225;
}
*{box-sizing:border-box}
.lx-root{
  font-family:'Noto Serif SC','Songti SC','SimSun',serif;
  color:var(--ink);
  background:
    radial-gradient(120% 80% at 12% -10%, rgba(180,51,42,.06), transparent 55%),
    radial-gradient(100% 90% at 95% 8%, rgba(160,127,44,.07), transparent 50%),
    linear-gradient(180deg,var(--paper),var(--paper2) 60%, var(--paper3));
  min-height:100%;
  position:relative;
  line-height:1.85;
  letter-spacing:.01em;
  -webkit-font-smoothing:antialiased;
}
.lx-root::before{
  content:"";position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/></svg>");
  mix-blend-mode:multiply;opacity:.6;
}
.lx-wrap{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:0 20px 90px}
.dsp{font-family:'Fraunces','Noto Serif SC',serif;font-optical-sizing:auto}
.sans{font-family:'Noto Sans SC','PingFang SC',sans-serif}

/* ---------- masthead ---------- */
.mast{padding:46px 0 18px;position:relative}
.mast .rule{height:2px;background:linear-gradient(90deg,var(--red),var(--gold) 60%,transparent);opacity:.7}
.mast .kicker{font-family:'Noto Sans SC',sans-serif;font-size:12px;letter-spacing:.42em;color:var(--red);font-weight:700;text-transform:uppercase}
.mast h1{font-weight:900;font-size:clamp(38px,8vw,76px);line-height:.98;margin:14px 0 6px;letter-spacing:.04em}
.mast .sub{font-size:clamp(15px,2.6vw,19px);color:var(--ink-soft);max-width:640px}
.mast .byline{font-family:'Noto Sans SC',sans-serif;font-size:13px;color:var(--ink-faint);margin-top:14px;letter-spacing:.05em}

.seal{position:absolute;top:40px;right:0;width:84px;height:84px;border-radius:10px;
  background:linear-gradient(160deg,var(--red),var(--red-deep));
  box-shadow:0 8px 26px rgba(140,36,29,.28), inset 0 0 0 3px rgba(255,255,255,.14), inset 0 0 0 7px var(--red);
  display:flex;align-items:center;justify-content:center;transform:rotate(-6deg);
  color:#F6ECDC;font-weight:900;font-size:40px;font-family:'Noto Serif SC',serif;
}
.seal::after{content:"";position:absolute;inset:0;border-radius:10px;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><filter id='m'><feTurbulence type='turbulence' baseFrequency='0.6' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23m)' opacity='0.5'/></svg>");
  mix-blend-mode:screen;opacity:.18}
@media(max-width:560px){ .seal{width:62px;height:62px;font-size:30px;top:34px} }

/* ---------- nav ---------- */
.nav{position:sticky;top:0;z-index:30;margin-top:8px;padding:10px 0;
  background:linear-gradient(180deg,var(--paper) 60%, rgba(242,234,216,.0));
  backdrop-filter:blur(2px);}
.nav-track{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;scrollbar-width:thin}
.nav-track::-webkit-scrollbar{height:6px}
.nav-track::-webkit-scrollbar-thumb{background:var(--line2);border-radius:8px}
.chip{flex:0 0 auto;border:1.5px solid var(--line2);background:rgba(255,255,255,.32);
  border-radius:999px;padding:7px 15px 7px 11px;cursor:pointer;display:flex;align-items:center;gap:8px;
  font-family:'Noto Sans SC',sans-serif;font-size:13px;color:var(--ink-soft);transition:.18s;white-space:nowrap}
.chip:hover{border-color:var(--red-soft);color:var(--ink)}
.chip .num{font-family:'Fraunces',serif;font-weight:600;font-size:13px;color:var(--ink-faint)}
.chip.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.chip.on .num{color:var(--gold-soft)}

/* ---------- chapter head ---------- */
.chap-head{padding:30px 0 6px}
.chap-head .idx{font-family:'Fraunces',serif;font-size:clamp(48px,12vw,108px);font-weight:600;line-height:.8;color:var(--red);opacity:.92}
.chap-head .ttl{font-weight:900;font-size:clamp(26px,5.4vw,46px);margin:6px 0 0;letter-spacing:.02em}
.epigraph{border-left:3px solid var(--gold);padding:6px 0 6px 16px;margin:18px 0 6px;
  font-size:clamp(15px,2.7vw,18px);color:var(--ink-soft);font-style:italic;max-width:680px}
.epigraph b{color:var(--red);font-style:normal}

/* ---------- prose ---------- */
.lead{font-size:clamp(16px,2.7vw,18px);color:var(--ink);margin:18px 0}
.lead.small{font-size:15.5px;color:var(--ink-soft)}
.kick{font-family:'Noto Sans SC',sans-serif;font-size:12px;letter-spacing:.32em;font-weight:700;
  color:var(--red);text-transform:uppercase;margin:42px 0 10px}
.h2{font-weight:900;font-size:clamp(20px,4vw,28px);margin:8px 0 4px;letter-spacing:.01em}
.pull{margin:26px 0;padding:20px 22px;border-radius:14px;position:relative;
  background:linear-gradient(160deg,var(--gold-wash),#fff8e9);border:1px solid var(--line2);
  font-size:clamp(17px,3vw,21px);font-weight:700;color:var(--ink);line-height:1.5}
.pull .q{position:absolute;top:-12px;left:14px;font-family:'Fraunces',serif;font-size:54px;color:var(--gold-soft);line-height:1}
.note{font-family:'Noto Sans SC',sans-serif;font-size:13px;color:var(--ink-faint);line-height:1.7}

.grid{display:grid;gap:14px}
.g2{grid-template-columns:repeat(2,1fr)}
.g3{grid-template-columns:repeat(3,1fr)}
@media(max-width:760px){.g3{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.g2,.g3{grid-template-columns:1fr}}

.card{background:rgba(255,255,255,.46);border:1px solid var(--line2);border-radius:14px;padding:16px 16px;transition:.18s}
.card h4{margin:0 0 4px;font-weight:700;font-size:16.5px}
.card p{margin:0;font-size:14px;color:var(--ink-soft);line-height:1.7}
.tag{display:inline-block;font-family:'Noto Sans SC',sans-serif;font-size:11.5px;font-weight:700;letter-spacing:.04em;
  padding:3px 9px;border-radius:999px;background:var(--red-wash);color:var(--red-deep);margin:0 6px 6px 0}
.tag.gold{background:var(--gold-wash);color:var(--gold)}
.tag.green{background:var(--green-wash);color:var(--green)}
.tag.ink{background:#E8E0CF;color:var(--ink-soft)}

.btn{font-family:'Noto Sans SC',sans-serif;cursor:pointer;border-radius:999px;border:1.5px solid var(--line2);
  background:rgba(255,255,255,.4);padding:8px 16px;font-size:13.5px;color:var(--ink-soft);transition:.16s}
.btn:hover{border-color:var(--red-soft);color:var(--ink)}
.btn.on{background:var(--red);border-color:var(--red);color:#fff}
.btn.ink.on{background:var(--ink);border-color:var(--ink);color:var(--paper)}

.panel-dark{background:linear-gradient(165deg,var(--panel),var(--panel2));color:#E9E0CF;
  border:1px solid var(--panel-line);border-radius:18px;padding:22px 20px}
.panel-dark h3{color:#fff;margin:0 0 8px;font-weight:900}
.panel-dark p{color:#CFC4AE}

.divider{height:1px;background:linear-gradient(90deg,transparent,var(--line2),transparent);margin:42px 0}

.prevnext{display:flex;justify-content:space-between;gap:12px;margin-top:48px}
.pnbtn{flex:1;border:1px solid var(--line2);background:rgba(255,255,255,.4);border-radius:14px;padding:14px 16px;cursor:pointer;transition:.16s;text-align:left}
.pnbtn:hover{border-color:var(--red-soft);transform:translateY(-1px)}
.pnbtn .l{font-family:'Noto Sans SC',sans-serif;font-size:11px;letter-spacing:.2em;color:var(--ink-faint);text-transform:uppercase}
.pnbtn .t{font-weight:700;font-size:15px;margin-top:2px}
.pnbtn.next{text-align:right}
.pnbtn[disabled]{opacity:.35;cursor:default}

.foot{margin-top:60px;padding-top:22px;border-top:2px solid var(--line2);font-family:'Noto Sans SC',sans-serif;font-size:12.5px;color:var(--ink-faint);line-height:1.8}
.foot b{color:var(--red)}

/* clickable list rows */
.row{border:1px solid var(--line2);border-radius:12px;background:rgba(255,255,255,.42);overflow:hidden;transition:.16s}
.row + .row{margin-top:9px}
.row .rh{display:flex;align-items:center;gap:12px;padding:13px 15px;cursor:pointer}
.row .rn{font-family:'Fraunces',serif;font-weight:600;font-size:18px;color:var(--red);min-width:28px}
.row .rt{font-weight:700;font-size:15.5px;flex:1}
.row .rx{font-family:'Noto Sans SC',sans-serif;color:var(--ink-faint);font-size:18px;transition:.2s}
.row.open .rx{transform:rotate(45deg)}
.row .rb{padding:0 15px 15px 55px;font-size:14px;color:var(--ink-soft);line-height:1.75}
.row.open{border-color:var(--red-soft)}

.statbig{font-family:'Fraunces',serif;font-weight:600;line-height:.9}
svg{display:block;max-width:100%}
.fade{animation:fade .5s ease both}
@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.legend{display:flex;flex-wrap:wrap;gap:14px;font-family:'Noto Sans SC',sans-serif;font-size:12.5px;color:var(--ink-soft);margin-top:10px}
.legend i{width:11px;height:11px;border-radius:3px;display:inline-block;margin-right:6px;vertical-align:-1px}
`;

/* ----------------------------- small helpers ----------------------------- */
function Reveal({ rows }) {
  const [open, setOpen] = useState(-1);
  return (
    <div>
      {rows.map((r, i) => (
        <div key={i} className={"row" + (open === i ? " open" : "")}>
          <div className="rh" onClick={() => setOpen(open === i ? -1 : i)}>
            <span className="rn dsp">{r.n}</span>
            <span className="rt">{r.t}</span>
            <span className="rx">＋</span>
          </div>
          {open === i && <div className="rb fade">{r.b}</div>}
        </div>
      ))}
    </div>
  );
}

/* ============================ INTERACTIVE PIECES ============================ */

/* 1 — 风险收益光谱 */
const SPECTRUM = [
  { k: "极低", risk: "极低风险", ret: "极低收益", c: "var(--green)", items: ["货币型基金", "银行存款"], lev: "无杠杆", note: "本金最稳，跑不赢通胀是它的代价。" },
  { k: "低", risk: "低风险", ret: "低收益", c: "var(--green-soft)", items: ["国家债券", "企业债券", "债券型基金", "保险产品"], lev: "无 / 极低", note: "想"保本+略有盈利"、又赔不起本金者的归宿。" },
  { k: "中", risk: "中风险", ret: "中收益", c: "var(--gold-soft)", items: ["蓝筹股", "股票/指数/混合型基金"], lev: "无杠杆", note: "李大霄反复推崇的"核心资产"主战场。" },
  { k: "高", risk: "高风险", ret: "高收益", c: "var(--red-soft)", items: ["三板", "创业板", "二线股", "三线股"], lev: "无杠杆", note: "故事最动听、波动最大，多数散户在此交学费。" },
  { k: "极高", risk: "极高风险", ret: "极高收益", c: "var(--red-deep)", items: ["期货", "外汇", "权证"], lev: "高杠杆 · 外汇最高 400×", note: "杠杆越高风险越高——这是一条铁律，也是红线。" },
];
function RiskSpectrum() {
  const [i, setI] = useState(2);
  const a = SPECTRUM[i];
  return (
    <div>
      <div style={{ display: "flex", borderRadius: 12, overflow: "hidden", border: "1px solid var(--line2)" }}>
        {SPECTRUM.map((s, idx) => (
          <button key={idx} onClick={() => setI(idx)}
            style={{
              flex: 1, border: "none", cursor: "pointer", padding: "16px 4px",
              background: idx === i ? s.c : "rgba(255,255,255,.4)",
              color: idx === i ? "#fff" : "var(--ink-soft)", transition: ".18s",
              fontFamily: "'Noto Sans SC',sans-serif", fontWeight: 700, fontSize: 13,
              borderRight: idx < 4 ? "1px solid var(--line2)" : "none",
            }}>
            {s.k}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Noto Sans SC',sans-serif", fontSize: 11.5, color: "var(--ink-faint)", marginTop: 6 }}>
        <span>← 越稳，收益越低</span><span>杠杆越高，越危险 →</span>
      </div>
      <div className="card fade" key={i} style={{ marginTop: 14, borderColor: a.c }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <h4 style={{ color: a.c }}>{a.ret} · {a.risk}</h4>
          <span className="tag" style={{ background: "var(--ink)", color: "var(--paper)" }}>{a.lev}</span>
        </div>
        <div style={{ margin: "8px 0 6px" }}>
          {a.items.map((it) => <span key={it} className="tag ink">{it}</span>)}
        </div>
        <p>{a.note}</p>
      </div>
    </div>
  );
}

/* 2 — 财富转移 */
const TRANSFER = [
  { from: "小机构", to: "大机构", c: "var(--red)", why: "大机构资金雄厚、信息与耐力占优，财富多由小流向大。" },
  { from: "新股民", to: "老股民", c: "var(--red)", why: "老股民经验与风险认知更足；新股民"交学费"最多。偶有反例（老股民不敢买而踏空）。" },
  { from: "散户", to: "庄家", c: "var(--red)", why: "坐庄成功，散户向庄家转移；但坐庄失败则反向——巴林银行被散户"瓜分"即是。作者忠告：千万不要坐庄。" },
  { from: "低技巧者", to: "高技巧者", c: "var(--red)", why: "技巧不提高，别人就有向你"进贡"的可能。" },
  { from: "心态坏 / 没耐心", to: "心态好 / 有耐心", c: "var(--red)", why: ""不卖不涨，卖了就涨"——耐心耗尽时交出筹码，正是换手完成、股价启动之时。" },
];
function WealthTransfer() {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="note" style={{ marginBottom: 10 }}>以下五条是<b style={{ color: "var(--red)" }}>投机</b>层面的零和转移——点击查看箭头指向谁的口袋：</div>
      {TRANSFER.map((t, idx) => (
        <div key={idx} onClick={() => setI(idx)} style={{ cursor: "pointer", marginBottom: 8 }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8,
            border: "1px solid " + (idx === i ? "var(--red-soft)" : "var(--line2)"),
            background: idx === i ? "var(--red-wash)" : "rgba(255,255,255,.4)",
            borderRadius: 12, padding: "10px 12px", transition: ".16s",
          }}>
            <div style={{ textAlign: "right", fontFamily: "'Noto Sans SC',sans-serif", fontSize: 14.5, color: "var(--ink-soft)" }}>{t.from}</div>
            <svg width="46" height="16" viewBox="0 0 46 16"><defs><marker id={"ar" + idx} markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={t.c} /></marker></defs><line x1="2" y1="8" x2="40" y2="8" stroke={t.c} strokeWidth="2.4" markerEnd={"url(#ar" + idx + ")"} /></svg>
            <div style={{ fontWeight: 700, fontSize: 15, color: t.c }}>{t.to}</div>
          </div>
        </div>
      ))}
      <div className="card fade" key={i} style={{ marginTop: 4, borderColor: "var(--red-soft)" }}>
        <p style={{ color: "var(--ink)" }}>{TRANSFER[i].why}</p>
      </div>
      <div className="panel-dark" style={{ marginTop: 14 }}>
        <h3>而真正的"投资"不是零和</h3>
        <p>做投资，挣的是<b style={{ color: "var(--gold-soft)" }}>上市公司创造的财富</b>，与好公司共同富裕。但公司分两种：一种<b style={{ color: "#fff" }}>创造财富</b>（持续分红、回报社会），一种<b style={{ color: "var(--red-soft)" }}>毁灭财富</b>（从不分红）。把钱交给前者，财富才会随时间增长——这是跳出"甲赚乙、乙赚丙"猜顶游戏的唯一出路。</p>
      </div>
    </div>
  );
}

/* 3 — 一赚二平七亏 甜甜圈 */
function WinRate() {
  const seg = [
    { p: 70, c: "var(--green)", l: "亏钱 70%" },
    { p: 20, c: "var(--gold-soft)", l: "不亏不赚 20%" },
    { p: 10, c: "var(--red)", l: "赚钱 10%" },
  ];
  let acc = 0; const R = 70, C = 90, sw = 26;
  const arc = (p) => { const a0 = acc / 100 * 2 * Math.PI - Math.PI / 2; acc += p; const a1 = acc / 100 * 2 * Math.PI - Math.PI / 2; const large = p > 50 ? 1 : 0; const x0 = C + R * Math.cos(a0), y0 = C + R * Math.sin(a0), x1 = C + R * Math.cos(a1), y1 = C + R * Math.sin(a1); return `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1}`; };
  return (
    <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        {seg.map((s, i) => <path key={i} d={arc(s.p)} stroke={s.c} strokeWidth={sw} fill="none" strokeLinecap="butt" />)}
        <text x="90" y="84" textAnchor="middle" className="dsp" fontSize="30" fontWeight="600" fill="var(--red)">10%</text>
        <text x="90" y="104" textAnchor="middle" className="sans" fontSize="11" fill="var(--ink-faint)">才能赚钱</text>
      </svg>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div className="legend" style={{ flexDirection: "column", gap: 8 }}>
          {seg.map((s) => <span key={s.l}><i style={{ background: s.c }} />{s.l}</span>)}
        </div>
        <p className="note" style={{ marginTop: 12 }}>股市的概率是 <b style={{ color: "var(--red)" }}>一赚二平七亏</b>。期货市场更残酷——只有约 <b style={{ color: "var(--red)" }}>2%</b> 的人赚钱。</p>
        <p className="note" style={{ marginTop: 6 }}>作者的比喻：要在股市这"班级"里<b style={{ color: "var(--red)" }}>考进前 5 名</b>，才有资格做赢家；要考第一名，才有资格碰期货。门槛看似很低，其实和当医生、工程师一样需要多年专业积累。</p>
      </div>
    </div>
  );
}

/* 4 — 巴菲特三次花钱 + 中石油 */
function Buffett() {
  return (
    <div>
      <div className="grid g3">
        {[{ y: "三不", a: "不贪婪", b: "1969 华尔街疯狂，他冷静清仓" }, { y: "三不", a: "不跟风", b: "2000 不碰网络股，一年后科网股灾" }, { y: "三不", a: "不投机", b: ""指望股票明早就涨是愚蠢的"" }].map((x, i) =>
          <div key={i} className="card"><span className="tag gold">价值投资三句话</span><h4 style={{ color: "var(--red)" }}>{x.a}</h4><p>{x.b}</p></div>)}
      </div>
      <div className="kick">一生只花三次大钱</div>
      <div className="grid g3">
        {["1973", "1982", "2008"].map((y, i) =>
          <div key={i} className="card" style={{ textAlign: "center" }}>
            <div className="statbig dsp" style={{ fontSize: 38, color: "var(--gold)" }}>{y}</div>
            <p style={{ marginTop: 4 }}>{i === 2 ? "百年一遇危机，重金扫货高盛、GE、8 港元的比亚迪" : "市场大跌、价值显现时，毫不犹豫出手"}</p>
          </div>)}
      </div>
      <div className="pull"><span className="q">"</span>判断真伪价值投资者很简单：看他在<b style={{ color: "var(--red)", fontStyle: "normal" }}>高潮时是否抛出</b>、在<b style={{ color: "var(--red)", fontStyle: "normal" }}>低潮时是否买入</b>。</div>
      <div className="panel-dark">
        <h3>案例 · 巴菲特的中石油</h3>
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", marginTop: 6 }}>
          <div><div className="dsp" style={{ fontSize: 40, fontWeight: 600, color: "var(--gold-soft)" }}>8×</div><div className="sans" style={{ fontSize: 12, color: "#CFC4AE" }}>约 5 亿美元 → 35 亿美元</div></div>
          <p style={{ flex: 1, minWidth: 220 }}>2004 年买入（市值约 350 亿美元，他认为值 1000 亿），2007 年卖出（市值已达 3000 亿）。"市场下跌，它就比以前更有吸引力"——功利心极弱，所以能反人性。</p>
        </div>
      </div>
    </div>
  );
}

/* 5 — 四大风向标 */
const VANES = [
  { t: "上市公司增减持时机", d: "公司卖股=股价涨到它满意；公司买股=股价跌到它满意。1664 点附近上市公司大量增持，正是播种的信号。" },
  { t: "中石油", d: "曾以 48.6 元高位上市（远超预期），却在 1664 点开始增持。它的动作，是判断市场冷暖的一把尺。" },
  { t: "汇金公司", d: "被称为"金融国资委"。这个重量级买家一出手，市场处于底部的概率大大增加，且其额度并无限制。" },
  { t: "社保基金", d: ""超级风向标"。6124 点悄然撤退、1664 点重新进入——它退出时，往往就是顶部。历史上几乎没有失手。" },
];
function Weathervanes() {
  const [i, setI] = useState(0);
  return (
    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
      <svg width="190" height="190" viewBox="0 0 190 190" style={{ flex: "0 0 auto" }}>
        <circle cx="95" cy="95" r="82" fill="none" stroke="var(--line2)" strokeWidth="1.5" />
        <circle cx="95" cy="95" r="62" fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" />
        {VANES.map((v, idx) => {
          const ang = (idx / 4) * 2 * Math.PI - Math.PI / 2;
          const x = 95 + 82 * Math.cos(ang), y = 95 + 82 * Math.sin(ang);
          const on = idx === i;
          return <g key={idx} onClick={() => setI(idx)} style={{ cursor: "pointer" }}>
            <circle cx={x} cy={y} r={on ? 16 : 12} fill={on ? "var(--red)" : "rgba(255,255,255,.7)"} stroke={on ? "var(--red-deep)" : "var(--line2)"} strokeWidth="2" />
            <text x={x} y={y + 4} textAnchor="middle" className="dsp" fontSize="13" fontWeight="600" fill={on ? "#fff" : "var(--ink-soft)"}>{idx + 1}</text>
          </g>;
        })}
        {(() => { const ang = (i / 4) * 2 * Math.PI - Math.PI / 2; const x = 95 + 56 * Math.cos(ang), y = 95 + 56 * Math.sin(ang); return <g><line x1="95" y1="95" x2={x} y2={y} stroke="var(--red)" strokeWidth="3" strokeLinecap="round" /><circle cx="95" cy="95" r="6" fill="var(--gold)" /></g>; })()}
        <text x="95" y="178" textAnchor="middle" className="sans" fontSize="11" fill="var(--ink-faint)">点击切换风向标</text>
      </svg>
      <div className="card fade" key={i} style={{ flex: 1, minWidth: 240, borderColor: "var(--red-soft)" }}>
        <span className="tag">第 {i + 1} 个风向标</span>
        <h4 style={{ color: "var(--red)" }}>{VANES[i].t}</h4>
        <p>{VANES[i].d}</p>
      </div>
    </div>
  );
}

/* 6 — 6124 / 1664 / 3000 市场情绪山 (Part 3 centerpiece) */
const ZONES = {
  top: { name: "山顶 · 6124 点", word: "淡泊", c: "var(--gold)", fear: "恐惧踏空", real: "其实最危险", psy: "人人狂热、媒体一片"牛话"，每丢一次筹码都像犯错。此时最该"淡泊"——留一点给别人，不要赚到最后一分。结果：因怕踏空而满仓，套牢成了事实。" },
  mid: { name: "半山 · 3000 点", word: "坚持", c: "var(--red)", fear: "分歧最大", real: "需要耐力", psy: "越往上涨，看好的人越多。3000 点不需要勇气，需要的是"坚持"。机会比 1664 点少，选品种要更严、周期要更长。" },
  bottom: { name: "谷底 · 1664 点", word: "勇气", c: "var(--red-deep)", fear: "恐惧套牢", real: "其实机会最大", psy: "无人问津、舆论看空"一边倒"。此时最该"勇气"——像在合伙人最困难时加盟，成本最低。结果：怕套牢而割肉，希望与筹码一起丢失，踏空成了现实。" },
};
function MarketMountain() {
  const [z, setZ] = useState("bottom");
  const W = 680, H = 300, padX = 30, padB = 46, padT = 30;
  const yOf = (lv) => padT + (1 - lv / 6500) * (H - padT - padB);
  const xOf = (t) => padX + t * (W - padX * 2);
  const pts = [[0, 1664], [0.16, 3000], [0.34, 5300], [0.46, 6124], [0.62, 4400], [0.78, 3000], [1, 1664]];
  const path = "M " + pts.map((p) => `${xOf(p[0]).toFixed(1)},${yOf(p[1]).toFixed(1)}`).join(" L ");
  const marks = [
    { id: "top", t: 0.46, lv: 6124, lab: "6124", side: -1, c: ZONES.top.c },
    { id: "mid", t: 0.16, lv: 3000, lab: "3000", side: -1, c: ZONES.mid.c },
    { id: "bottom", t: 1, lv: 1664, lab: "1664", side: 1, c: ZONES.bottom.c },
  ];
  const cur = ZONES[z];
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ background: "rgba(255,255,255,.35)", borderRadius: 14, border: "1px solid var(--line2)" }}>
        <defs><linearGradient id="mfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--red)" stopOpacity=".18" /><stop offset="1" stopColor="var(--red)" stopOpacity="0" /></linearGradient></defs>
        <path d={path + ` L ${xOf(1)},${yOf(0)} L ${xOf(0)},${yOf(0)} Z`} fill="url(#mfill)" />
        <path d={path} fill="none" stroke="var(--red)" strokeWidth="2.6" strokeLinejoin="round" />
        {marks.map((m) => {
          const x = xOf(m.t), y = yOf(m.lv), on = z === m.id;
          const ly = m.side < 0 ? y - 16 : y + 26;
          return <g key={m.id} onClick={() => setZ(m.id)} style={{ cursor: "pointer" }}>
            <circle cx={x} cy={y} r={on ? 9 : 6.5} fill={m.c} stroke="#fff" strokeWidth="2" />
            {on && <circle cx={x} cy={y} r="15" fill="none" stroke={m.c} strokeWidth="1.5" opacity=".5" />}
            <text x={x} y={ly} textAnchor="middle" className="dsp" fontSize="20" fontWeight="600" fill={m.c}>{m.lab}</text>
            <text x={x} y={ly + (m.side < 0 ? -16 : 17)} textAnchor="middle" className="sans" fontWeight="700" fontSize="13" fill={m.c}>{ZONES[m.id].word}</text>
          </g>;
        })}
      </svg>
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        {Object.keys(ZONES).map((k) => <button key={k} className={"btn" + (z === k ? " on" : "")} style={z === k ? { background: ZONES[k].c, borderColor: ZONES[k].c } : {}} onClick={() => setZ(k)}>{ZONES[k].name}</button>)}
      </div>
      <div className="card fade" key={z} style={{ marginTop: 12, borderColor: cur.c }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <h4 style={{ color: cur.c, fontSize: 22, margin: 0 }}>{cur.word}</h4>
          <span className="tag" style={{ background: "var(--ink)", color: "var(--paper)" }}>大众情绪：{cur.fear}</span>
          <span className="tag gold">{cur.real}</span>
        </div>
        <p style={{ marginTop: 8 }}>{cur.psy}</p>
      </div>
      <div className="note" style={{ marginTop: 12, padding: "12px 14px", border: "1px dashed var(--gold-soft)", borderRadius: 12, background: "var(--gold-wash)" }}>
        <b style={{ color: "var(--red)" }}>核心反转</b>：在山顶你怕"踏空"，结果被"套牢"；在谷底你怕"套牢"，结果"踏空"。多数人把责任推给"喊话的人"，却没归于自己的耳朵。
      </div>
    </div>
  );
}

/* 7 — 牛熊百态 toggle */
const BULLBEAR = [
  { k: "饭局话题", bear: "人人回避"股票"，谁炒股像落伍了；"远离股票，远离毒品"", bull: "人人都聊股票，还没入市就显得落伍" },
  { k: "电话短信", bear: "很少，多是摄影、艺术、人生", bull: "数量激增，内容全是股票" },
  { k: "收益预期", bear: "收益率 2% 的货币基金都在膨胀", bull: ""一年才赚 10%?"会被人不屑一顾" },
  { k: "电视报纸", bear: "证券栏目被砍，报纸开彩票版、教"如何解套"", bull: "媒体争开证券栏目，股票报纸大卖" },
  { k: "股评大会", bear: "开会需要勇气——担心没人来听", bull: "席地而坐、气氛热烈、时间延长" },
  { k: "券商招聘", bear: ""搞金融的"羞于启齿，三分之二券商要重组", bull: ""我在证券公司上班"令人羡慕，招聘铺天盖地" },
];
function BullBear() {
  const [bull, setBull] = useState(false);
  return (
    <div>
      <div style={{ display: "inline-flex", border: "1.5px solid var(--line2)", borderRadius: 999, overflow: "hidden", marginBottom: 14 }}>
        <button className="btn" style={{ border: "none", borderRadius: 0, background: !bull ? "var(--green)" : "transparent", color: !bull ? "#fff" : "var(--ink-soft)" }} onClick={() => setBull(false)}>🐻 熊市</button>
        <button className="btn" style={{ border: "none", borderRadius: 0, background: bull ? "var(--red)" : "transparent", color: bull ? "#fff" : "var(--ink-soft)" }} onClick={() => setBull(true)}>🐂 牛市</button>
      </div>
      <div className="grid g2">
        {BULLBEAR.map((r) => (
          <div key={r.k} className="card fade" style={{ borderColor: bull ? "var(--red-soft)" : "var(--green-soft)" }}>
            <span className="tag ink">{r.k}</span>
            <p style={{ color: "var(--ink)" }}>{bull ? r.bull : r.bear}</p>
          </div>
        ))}
      </div>
      <p className="note" style={{ marginTop: 12 }}>同一群人、同一件事，牛熊两副面孔。<b style={{ color: "var(--red)" }}>从众是本能</b>——牛市的狂热吸引大多数人入场，熊市的绝望又伤害大多数人。不从众的反向操作，才是步入成功的窄门。</p>
    </div>
  );
}

/* 8 — 喊话时间轴 (Part 5 SHOWPIECE) */
const CURVE = [
  [2000, 2000], [2001.5, 2245], [2002.4, 1550], [2003.5, 1450], [2004.4, 1700], [2005.45, 998],
  [2006.3, 1700], [2007.05, 2700], [2007.8, 6124], [2008.3, 3500], [2008.8, 1664], [2009.6, 3478],
  [2010.2, 2900], [2011, 2500], [2012, 2150], [2013.45, 1849], [2014.05, 2050], [2014.6, 2150],
  [2015.45, 5178], [2015.65, 2850], [2016.05, 2638], [2017, 3250], [2018.05, 3587], [2019.05, 2440],
  [2019.3, 3288], [2020.2, 2660], [2021.1, 3731], [2021.95, 3640], [2022.3, 2863], [2022.85, 2885],
  [2023.4, 3400], [2024.1, 2635], [2024.4, 3150], [2024.72, 2689], [2024.82, 3674], [2024.98, 3300],
];
const CALLS = [
  { t: 2001.4, lv: 2245, type: "top", short: "摘荔枝", date: "2000–2001 · 约 2245 点", body: "股指上冲、一片乐观时提出"摘荔枝"——荔枝熟了必须马上摘，否则就烂，意指泡沫将很快破灭。" },
  { t: 2007.7, lv: 5600, type: "top", short: "摘熟苹果", date: "2007 年中 · 约 6000 点", body: "两年牛市从 998 冲破 6000，提出摘"熟苹果"——苹果比荔枝大、可慢慢收获，泡沫渐成但不会立刻破，最终于 2007 年 10 月（6124 点）破灭。" },
  { t: 2008.8, lv: 1664, type: "bottom", short: "1664 需勇气", date: "2008 年 10 月 · 1664 点", body: "百年一遇金融危机底部，上市公司、中石油、社保基金纷纷增持。提出"1664 点需要勇气"，称这是"融冰之旅"的起点。" },
  { t: 2012.0, lv: 2150, type: "bottom", short: "钻石底", date: "2012 年 · 市场悲观期", body: "全球垫底、一片悲观时提出"钻石底"，弘扬蓝筹龙头的历史性低估。" },
  { t: 2013.45, lv: 1849, type: "bottom", short: "1849 历史底", date: "2013 年 6 月 · 1849 点", body: "以"五大理由"论证 1849 是 A 股历史重要底部：稳增长、资金紧张高峰已过、机构救市、三大指标（最低估值+最长 IPO 暂停+最高流通占比）、政策呵护。" },
  { t: 2015.45, lv: 5178, type: "top", short: "地球顶", date: "2015 年 6 月 15 日 · 5178 点", body: ""5178.19 地球顶，用烙铁烙定了。"五大逻辑：估值极高（主板 PE 中位约 86×）、注册制序幕、双向工具完善、产业资本大量减持、强力去杠杆。这是其最著名的一次喊顶。" },
  { t: 2015.65, lv: 2850, type: "bottom", short: "婴儿底", date: "2015 年 8 月 27 日 · 2850 点", body: "股灾后 53 天暴跌 45%，提出"婴儿底"五理由：蓝筹估值到位、杠杆回归正常、做空机制暂停、限制减持暂停 IPO、救市渐显效。" },
  { t: 2019.05, lv: 2440, type: "bottom", short: "2440 第五大底", date: "2019 年 1 月 · 2440 点", body: "降准+政策底+市场底叠加，上证 50 仅 8.3×PE、股息率 3.44%，称 2440 有望成为 A 股第五个历史大底、第五轮牛市起点。" },
  { t: 2021.1, lv: 3650, type: "warn", short: "美股第四顶", date: "2021 年 10 月 · 风险预警", body: "用"十个迹象"论证美股或现百年第四个历史高位（继 1929、2000、2007），巴菲特指数超 208%。提醒 A 股"从进攻变为防御"。" },
  { t: 2022.85, lv: 2885, type: "bottom", short: "核心资产率先牛", date: "2022 年 10 月 · 约 2885 点", body: "提出"中国最优质核心资产率先进入牛市"十大原因，并呼吁"异常珍惜 3000 点之下的美好时光"。" },
  { t: 2024.1, lv: 2635, type: "bottom", short: "稳市·内资潜伏", date: "2024 年 2 月 · 2635 点", body: "千股跌停之际呼吁"稳定市场刻不容缓"，称内资大主力或已在低估核心资产中潜伏，并提出长远健康发展"九个建议"（核心：保护散户）。" },
  { t: 2024.42, lv: 3150, type: "bull", short: "高息牛·大国牛", date: "2024 年 5 月 · 约 3150 点", body: "宣告"技术性牛市"，提出"高息牛""大国牛"——资产荒下高股息核心资产扬眉吐气，"耐心资本来了"，先救港股后救 A 股的策略奏效。" },
  { t: 2024.85, lv: 3500, type: "bull", short: "地平线·核心资产牛", date: "2024 年 9 月 · 收复 3000 点", body: ""9·24"行情：央行创设互换便利与再贷款，9 月 26 日上证一举突破 3000 点"地平线"。低位 2689 点估值与历次大底相当，称"中国核心资产牛市或已到来"。" },
];
const TYPE_C = { top: "var(--gold)", bottom: "var(--red)", warn: "#7a5b2e", bull: "var(--red-deep)" };
const TYPE_L = { top: "顶 · 摘", bottom: "底 · 勇气", warn: "海外预警", bull: "转牛" };
function CallTimeline() {
  const [sel, setSel] = useState(5);
  const W = 1000, H = 440, padL = 16, padR = 16, padT = 70, padB = 46;
  const t0 = 2000, t1 = 2025.2, lvMax = 6500;
  const xOf = (t) => padL + (t - t0) / (t1 - t0) * (W - padL - padR);
  const yOf = (lv) => padT + (1 - lv / lvMax) * (H - padT - padB);
  const linePts = CURVE.map((p) => [xOf(p[0]), yOf(p[1])]);
  const smooth = useMemo(() => {
    const p = linePts; if (p.length < 2) return "";
    let d = `M ${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  }, []);
  const yearTicks = [2005, 2010, 2015, 2020, 2024];
  const c = CALLS[sel];
  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 720, background: "linear-gradient(180deg,#1d1912,#272118)", borderRadius: 16 }}>
          <defs>
            <linearGradient id="tl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c8554a" stopOpacity=".28" /><stop offset="1" stopColor="#c8554a" stopOpacity="0" /></linearGradient>
          </defs>
          {[1000, 2000, 3000, 4000, 5000, 6000].map((g) => (
            <g key={g}><line x1={padL} y1={yOf(g)} x2={W - padR} y2={yOf(g)} stroke="#3A3225" strokeWidth="1" /><text x={padL + 2} y={yOf(g) - 4} className="dsp" fontSize="11" fill="#6f6450">{g}</text></g>
          ))}
          {yearTicks.map((y) => <text key={y} x={xOf(y)} y={H - 16} textAnchor="middle" className="dsp" fontSize="13" fill="#8a7d63">{y}</text>)}
          <path d={smooth + ` L ${xOf(2024.98)},${yOf(0)} L ${xOf(2000)},${yOf(0)} Z`} fill="url(#tl)" />
          <path d={smooth} fill="none" stroke="#d9685c" strokeWidth="2.4" />
          <text x={W / 2} y="26" textAnchor="middle" className="sans" fontSize="13" fontWeight="700" fill="#d6cab2" letterSpacing="2">上证指数（示意） × 李大霄的著名"喊话"</text>
          <text x={W / 2} y="44" textAnchor="middle" className="sans" fontSize="10.5" fill="#7d715a">曲线为大致走势示意，非精确数据 · 点击标记查看</text>
          {CALLS.map((m, i) => {
            const x = xOf(m.t), y = yOf(m.lv), on = i === sel, col = TYPE_C[m.type];
            const up = m.type === "top" || m.type === "warn" || m.type === "bull";
            const stemY = up ? y - (on ? 30 : 22) : y + (on ? 30 : 22);
            return <g key={i} onClick={() => setSel(i)} style={{ cursor: "pointer" }}>
              <line x1={x} y1={y} x2={x} y2={stemY} stroke={col} strokeWidth={on ? 2 : 1.2} opacity={on ? 1 : .6} />
              <circle cx={x} cy={y} r={on ? 6.5 : 4.5} fill={col} stroke="#1d1912" strokeWidth="2" />
              <g transform={`translate(${x},${stemY})`}>
                <circle r={on ? 5 : 0} fill={col} opacity=".0" />
                <rect x={-3} y={up ? -16 : 2} width="6" height="6" fill={col} transform="rotate(45)" opacity={on ? 1 : 0} />
                <text x={0} y={up ? -10 : 16} textAnchor="middle" className="sans" fontWeight="700" fontSize={on ? 13 : 11} fill={on ? "#fff" : col}>{m.short}</text>
              </g>
            </g>;
          })}
        </svg>
      </div>
      <div className="legend">
        <span><i style={{ background: "var(--gold)" }} />喊顶（摘荔枝 / 熟苹果 / 地球顶）</span>
        <span><i style={{ background: "var(--red)" }} />喊底（勇气 / 钻石底 / 婴儿底…）</span>
        <span><i style={{ background: "#7a5b2e" }} />海外预警</span>
        <span><i style={{ background: "var(--red-deep)" }} />转牛信号</span>
      </div>
      <div className="card fade" key={sel} style={{ marginTop: 14, borderColor: TYPE_C[c.type], borderWidth: 1.5 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span className="tag" style={{ background: TYPE_C[c.type], color: "#fff" }}>{TYPE_L[c.type]}</span>
          <h4 style={{ margin: 0, color: TYPE_C[c.type], fontSize: 21 }}>{c.short}</h4>
          <span className="note">{c.date}</span>
        </div>
        <p style={{ marginTop: 8, color: "var(--ink)" }}>{c.body}</p>
      </div>
      <p className="note" style={{ marginTop: 12 }}>
        把喊话钉在走势上可见其规律：<b style={{ color: "var(--gold)" }}>"摘"</b>多落在山顶附近，<b style={{ color: "var(--red)" }}>"勇气 / 底"</b>多落在谷底附近。但作者本人反复强调——前瞻必有偏差，<b style={{ color: "var(--red)" }}>短期预测不确定性更高</b>，本书是"一家之言"，绝不能作为操作依据。后视镜里看预言总是容易的。
      </p>
    </div>
  );
}

/* 9 — 高估五类 vs 核心资产 */
function OvervaluedVsCore() {
  return (
    <div className="grid g2">
      <div className="card" style={{ borderColor: "var(--green-soft)", background: "var(--green-wash)" }}>
        <span className="tag green">远离 · 高估五类</span>
        <h4 style={{ color: "var(--green)" }}>高估的 小 · 新 · 差 · 题材 · 伪成长</h4>
        <p style={{ color: "var(--ink-soft)" }}>小盘股、次新股、垃圾差股、题材概念股、伪成长股。故事最动听、波动最大、最容易上当——而它们绝大部分被不明就里的散户持有。注册制下"新股不败"神话破灭，破发只是开始。</p>
      </div>
      <div className="card" style={{ borderColor: "var(--red-soft)", background: "var(--red-wash)" }}>
        <span className="tag">拥抱 · 核心资产</span>
        <h4 style={{ color: "var(--red)" }}>最低估 · 最优质 · 最具竞争力的蓝筹龙头</h4>
        <p style={{ color: "var(--ink-soft)" }}>在悲观中买入它们，叠加资产荒下"熠熠生辉"的<b style={{ color: "var(--red)" }}>高股息</b>——这就是 2024 年提出的"高息牛"。上市公司及股东以约 2.25% 成本融资、回购股息率 3%+ 的蓝筹，形成回购增持套利，抬升其估值。</p>
      </div>
    </div>
  );
}

/* 10 — 股债跷跷板 */
const SEESAW = [
  { k: "历史高位", tilt: -10, hot: "重债轻股 · 到极致", crowd: "大众弃股追债", say: "其实正是配置股票的最佳时机", c: "var(--red)" },
  { k: "中性", tilt: 0, hot: "股债大致均衡", crowd: "—", say: "按自身风险承受力配置即可", c: "var(--ink-soft)" },
  { k: "历史低位", tilt: 10, hot: "重股轻债 · 到极致", crowd: "大众弃债追股", say: "此时弃债追股往往是错的", c: "var(--green)" },
];
function StockBondSeesaw() {
  const [i, setI] = useState(0);
  const s = SEESAW[i];
  return (
    <div>
      <div className="note" style={{ marginBottom: 8 }}>拖动选择 <b style={{ color: "var(--red)" }}>股债差</b> 所处的位置（股票收益率 − 债券收益率）：</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {SEESAW.map((x, idx) => <button key={idx} className={"btn" + (idx === i ? " on" : "")} style={idx === i ? { background: x.c, borderColor: x.c } : {}} onClick={() => setI(idx)}>{x.k}</button>)}
      </div>
      <svg viewBox="0 0 400 150" width="100%" style={{ maxWidth: 460, background: "rgba(255,255,255,.35)", borderRadius: 12, border: "1px solid var(--line2)" }}>
        <polygon points="200,128 182,150 218,150" fill="var(--ink-soft)" />
        <g transform={`rotate(${s.tilt} 200 110)`} style={{ transition: "transform .5s" }}>
          <rect x="40" y="106" width="320" height="9" rx="4" fill="var(--ink)" />
          <g><circle cx="90" cy="92" r="22" fill="var(--green-wash)" stroke="var(--green)" strokeWidth="2" /><text x="90" y="97" textAnchor="middle" className="sans" fontSize="13" fontWeight="700" fill="var(--green)">债</text></g>
          <g><circle cx="310" cy="92" r="22" fill="var(--red-wash)" stroke="var(--red)" strokeWidth="2" /><text x="310" y="97" textAnchor="middle" className="sans" fontSize="13" fontWeight="700" fill="var(--red)">股</text></g>
        </g>
      </svg>
      <div className="card fade" key={i} style={{ marginTop: 12, borderColor: s.c }}>
        <span className="tag ink">{s.hot}</span>
        <p style={{ color: "var(--ink)" }}><b>大众行为：</b>{s.crowd}　·　<b style={{ color: s.c }}>李大霄：</b>{s.say}</p>
      </div>
      <p className="note" style={{ marginTop: 10 }}>历史经验：投资市场中正确的，往往是少部分人。配置股票的最佳时机在股债差的<b style={{ color: "var(--red)" }}>历史高位</b>而非低位——只不过绝大部分人恰恰相反。前提始终是：股票仓位只能用余钱。</p>
    </div>
  );
}

/* 11 — 散户六步阶梯 */
const LADDER = ["货币型基金", "债券型基金", "混合型基金", "指数型基金", "股票型基金", "蓝筹股"];
function Ladder() {
  const W = 640, H = 280, n = LADDER.length, sw = W / (n + 0.6), shY = H / (n + 1);
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 460 }}>
        {LADDER.map((l, i) => {
          const x = i * sw + 6, y = H - (i + 1) * shY - 14;
          return <g key={i}>
            <rect x={x} y={y} width={sw - 12} height={shY - 6} rx="8" fill={i === n - 1 ? "var(--red)" : "rgba(255,255,255,.5)"} stroke={i === n - 1 ? "var(--red-deep)" : "var(--line2)"} strokeWidth="1.5" />
            <text x={x + (sw - 12) / 2} y={y + (shY - 6) / 2 - 4} textAnchor="middle" className="dsp" fontSize="15" fontWeight="600" fill={i === n - 1 ? "#fff" : "var(--gold)"}>{i + 1}</text>
            <text x={x + (sw - 12) / 2} y={y + (shY - 6) / 2 + 13} textAnchor="middle" className="sans" fontSize="11.5" fontWeight="700" fill={i === n - 1 ? "#fff" : "var(--ink-soft)"}>{l}</text>
          </g>;
        })}
        <text x={W - 40} y={20} textAnchor="end" className="sans" fontSize="13" fontWeight="700" fill="var(--red)">↑ 切勿跳级</text>
      </svg>
    </div>
  );
}

/* ============================== CHAPTERS ============================== */

function Intro() {
  const principles = [
    { t: "余钱投资", d: "只用 30–50 年内不动用、且其波动你能承受的闲钱。第一个条件多数人满足，第二个远未满足——大问题就出在这里。" },
    { t: "价值投资", d: "像合伙做生意：选好人、选好公司，在最困难（成本最低）时加盟，长期共享成长。与"趋势投资"分属两个门派，如同少林与武当。" },
    { t: "理性投资", d: "克服贪婪与恐惧。股票是一场"专门针对人性弱点设计的游戏"，不从众的反向操作才是窄门。" },
    { t: "远离杠杆", d: "普通人能管好自己现有的财富已是奇功一件。用杠杆=要管理数倍于自己的财富。这是一条红线。" },
    { t: "拥抱核心资产", d: "在悲观中买入最低估、最优质、最具竞争力的蓝筹龙头；远离"高估五类"（高估的小、新、差、题材、伪成长）。" },
  ];
  return (
    <div className="fade">
      <p className="lead">这是一本由<b>英大证券首席经济学家李大霄</b>写就的投资随笔与市场判断合集。它不是教你"明天买哪只"的技术手册，而是一部关于<b style={{ color: "var(--red)" }}>投资心性</b>的修行书——作者反复强调："衡量一个人的价值，不在于他赚了多少钱，而在于他能帮助多少人。"</p>
      <div className="pull"><span className="q">"</span>投资如做人，品德与技术并重。股票投资其实是浓缩的人生，提前尝尽人间甜酸苦辣。</div>
      <div className="kick">贯穿全书的五条根</div>
      <div className="grid g2">
        {principles.map((p, i) => (
          <div key={i} className="card" style={{ borderColor: i === 4 ? "var(--red-soft)" : "var(--line2)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="statbig dsp" style={{ fontSize: 22, color: "var(--gold)" }}>{String(i + 1).padStart(2, "0")}</span>
              <h4 style={{ color: "var(--red)" }}>{p.t}</h4>
            </div>
            <p style={{ marginTop: 4 }}>{p.d}</p>
          </div>
        ))}
      </div>
      <div className="panel-dark" style={{ marginTop: 18 }}>
        <h3>如何使用这份导读</h3>
        <p>共分八卷，对应原书结构：<b style={{ color: "var(--gold-soft)" }}>开篇 → 自序·导读 → 第一至五部分 → 后记</b>。每卷有"核心导读 + 可交互图示"。<b style={{ color: "#fff" }}>第三部分</b>的"6124/1664/3000 情绪山"与<b style={{ color: "#fff" }}>第五部分</b>的"喊话时间轴"是全书思想的两个高潮，建议重点把玩。</p>
      </div>
    </div>
  );
}

function Preface() {
  const conds = [
    { n: "01", t: "是价值投资者", b: "若不认同价值投资，本书很难与你达成一致——价值投资与趋势投资无法合一。" },
    { n: "02", t: "达到一定年龄", b: "芒格说 40 岁以上才更懂价值投资。年轻人若真懂，那就是超人了。" },
    { n: "03", t: "有阅历、学识与金融知识", b: "要了解各门各派，世事洞明皆学问。" },
    { n: "04", t: "能分辨是非黑白", b: "至少要能分清好人与坏人，这是减少亏损的基本条件。" },
    { n: "05", t: "量力而为，用余钱", b: "看病、上学、养老、买房、结婚的钱拿来投资，注定走不远。" },
    { n: "06", t: "远离杠杆", b: "买房可加杠杆（银行算过你的还款能力），买股票绝不可以。" },
    { n: "07", t: "有稳定收入", b: "想象停止交易 10 年自己也能接受，才可以买股票；连停一天都受不了就别买。" },
    { n: "08", t: "是长期投资者", b: "看到企业未来，并以较低价格进入。" },
    { n: "09", t: "有坚强意志", b: ""地球顶"忍住诱惑、耐住寂寞；"钻石底"别人不敢买时，大胆买入低估好股。" },
    { n: "10", t: "情绪稳定", b: "财不入急门。情绪会渗透在投资的整个过程。" },
    { n: "11", t: "有良好家庭关系", b: "最困难时来自家庭的关爱很关键，这是很多投资者忽视的因素。" },
    { n: "12", t: "立场坚定", b: ""滑头"没有观点、立场摇摆。" },
    { n: "13", t: "有正确世界观", b: "道不同不相为谋。" },
    { n: "14", t: "有感恩之心", b: "感恩祖国、感恩时代给予的机遇。" },
    { n: "15", t: "做好人买好股", b: "现实中"割韭菜"者多、"救人"者少，但总得有人走正道。" },
  ];
  return (
    <div className="fade">
      <p className="lead">自序与导读是全书的"价值观地基"。作者坦言：他选择<b style={{ color: "var(--red)" }}>鲜明的观点</b>（甚至预测点位），不是为了证明自己对，而是因为"模棱两可会浪费别人的生命"。鲜明的观点会错、会挨骂，但前瞻才有价值。</p>
      <div className="kick">成功投资的 15 个条件 · 点击展开</div>
      <Reveal rows={conds} />
      <div className="divider" />
      <div className="kick">散户的投资六步阶梯</div>
      <p className="lead small">作者给散户的明确路径：从最稳的货币基金一路爬到蓝筹股，<b style={{ color: "var(--red)" }}>每一步成功后才能进入下一步，切勿跳级</b>（特别聪明者除外）。多数人亏损的根源，正是不按步骤来。</p>
      <Ladder />
      <p className="note" style={{ marginTop: 8 }}>"交学费"是必经之路——以 10 年为一个阶段，多数人要到第二、三阶段毕业后才开始"收学费"。谦虚才能进步。</p>
    </div>
  );
}

function Part1() {
  return (
    <div className="fade">
      <p className="lead">第一部分谈的是<b style={{ color: "var(--red)" }}>"人"</b>：每个人冲动或沉稳、果断或犹豫，不同的心理素质，给操作带来天差地别的结果。先认识你自己，再谈投资。</p>

      <div className="kick">先认清：你能承受多大风险</div>
      <p className="lead small">投资品种按"杠杆率"排成一条风险光谱——杠杆越高，风险越高。点击任意一档，看清它适合谁。</p>
      <RiskSpectrum />
      <p className="note" style={{ marginTop: 10 }}>2008 金融危机的根源就是杠杆太大：美国 20–30 倍、欧洲 40–50 倍。普通人的本分，是先把"不差钱"想清楚——后续资金是否充足，决定了你的整套策略与心态。</p>

      <div className="kick">财富，到底是怎么转移的？</div>
      <WealthTransfer />

      <div className="divider" />
      <div className="kick">交易的最高境界：少交易</div>
      <p className="lead small">钱少时交易频繁，钱多时频率下降。最高境界是"播种后不交易"——从 6124 跌到 1664，空仓者市值不变、财富却在增长（同样的钱能多买 10 倍）。市场博弈比的是两样：<b style={{ color: "var(--red)" }}>体力</b>（谁有更充裕的思考时间）与<b style={{ color: "var(--red)" }}>智力</b>（谁的知识面更宽：A 股、B 股、H 股、债券、货币、衍生品…）。</p>

      <div className="kick">股市赚钱的概率</div>
      <WinRate />

      <div className="kick">企业与股票的三大规律</div>
      <div className="grid g3">
        <div className="card"><span className="tag gold">规律一</span><h4>做长期持有者</h4><p>但价值投资 ≠ 持有不动。远超价值可抛、跌到位可再买。看好一只股，至少研究它 10 年。</p></div>
        <div className="card"><span className="tag">规律二</span><h4>第一时间认错</h4><p>有客户 100 元买入、一路不卖到 4 元，血本无归。活着最重要——<b style={{ color: "var(--red)" }}>好公司给你更多改错机会</b>。</p></div>
        <div className="card"><span className="tag green">规律三</span><h4>企业有生命周期</h4><p>还记得 BB 机吗？工业产品不断更替。百年老店竞争力领先，而很多企业寿命只有六七年。</p></div>
      </div>

      <div className="kick">我心中的两位榜样</div>
      <Buffett />
      <div className="card" style={{ marginTop: 14, borderColor: "var(--gold-soft)" }}>
        <span className="tag gold">"超人"李嘉诚</span>
        <h4 style={{ color: "var(--gold)" }}>稳健中求发展，发展中不忘稳健</h4>
        <p>"过河前，我要等体重比我重一倍的人先过去，然后我再过。"——看见没人掉下河，他才过，虽晚却稳。少时做茶童练就识人之术。作者更佩服他<b style={{ color: "var(--red)" }}>教育的成功</b>：真正的成功不是赚钱，而是能否培养一个合格的继承人。</p>
      </div>
    </div>
  );
}

function Part2() {
  return (
    <div className="fade">
      <p className="lead">第二部分转向<b style={{ color: "var(--red)" }}>"势"</b>——如何判断大盘的方向。作者给出四个具有中国特色的"风向标"，再把眼光投向更大的世界。</p>
      <div className="kick">股市的四大风向标 · 点击罗盘</div>
      <Weathervanes />

      <div className="kick">把眼光放到其他市场</div>
      <div className="grid g3">
        <div className="card"><span className="tag">货币市场</span><h4>港币</h4><p>成交量远大于股市。港币直接联动 H 股、A 股，是重要的参考指标。</p></div>
        <div className="card"><span className="tag gold">资源市场</span><h4>澳元 / 资源股</h4><p>澳洲资源丰富。资源总有用完的一天，外汇储备多一些实物与股权或更有利。</p></div>
        <div className="card"><span className="tag green">商品价格</span><h4>原油"黑金" · 粮食</h4><p>原油与美元一般反向；上涨慢、下跌快。粮价权重大，太高则让缺粮者陷入困境。</p></div>
      </div>
      <p className="note" style={{ marginTop: 10 }}>此外，<b style={{ color: "var(--red)" }}>政策动向</b>是研判 A 股的关键参考——学习权威社论、读懂当下处于何种时期。作者的方法论：一定要站在国家高度看问题，与国家利益联系到一起，力量就会非常强大。</p>

      <div className="divider" />
      <div className="kick">估值偏高时，要摘"熟苹果"</div>
      <div className="grid g2">
        <div className="card"><span className="tag gold">2000–2001 · 约 2245 点</span><h4 style={{ color: "var(--gold)" }}>摘荔枝 🌸</h4><p>荔枝熟了必须马上摘，否则就烂——意指泡沫将很快破灭。</p></div>
        <div className="card"><span className="tag">2007 年中 · 约 6000 点</span><h4 style={{ color: "var(--red)" }}>摘熟苹果 🍎</h4><p>苹果较大、可慢慢收获——泡沫渐成但不立刻破，最终于当年 10 月（6124）破灭。</p></div>
      </div>
      <p className="note" style={{ marginTop: 10 }}>估值与股价高低<b style={{ color: "var(--red)" }}>不总是一致</b>，这点投资时要特别注意。另一条经验："碰到重大历史事件要有提前量"——奥运会前一年他就判断"没有奥运行情"（收网者已提前 8–12 个月布局）。</p>
    </div>
  );
}

function Part3() {
  return (
    <div className="fade">
      <p className="lead">第三部分是全书的<b style={{ color: "var(--red)" }}>心理学高潮</b>。它把投资浓缩成两个字之间的拉锯：<b style={{ color: "var(--gold)" }}>淡泊</b> 与 <b style={{ color: "var(--red)" }}>勇气</b>。</p>
      <div className="kick">6124 需淡泊 · 1664 需勇气 · 3000 需坚持</div>
      <p className="lead small">点击山的不同位置，看清每个阶段的大众情绪、以及它真正意味着什么。</p>
      <MarketMountain />

      <div className="kick">警惕"舆论一边倒"</div>
      <p className="lead small">人有两种深层需要：<b style={{ color: "var(--red)" }}>安全</b>（群居与从众）与<b style={{ color: "var(--red)" }}>情感</b>（交流与认同）。趋同最安全——不会被批评、不会被穿小鞋。于是市场出现群体性行为。能否超越这一点，决定你能否成功。</p>
      <div className="pull"><span className="q">"</span>当 10 个朋友里有 9–10 个都买了股票，你最好把它卖掉；当大家都不买了，你最好悄悄买一点。</div>
      <div className="grid g3">
        <div className="card"><span className="tag">墨菲定律</span><h4>正确的信息往往不被选择</h4><p>涂黄油的一边总是朝下落地。"1664 需勇气"与"1664 需保存实力"两个声音，多数人选了错的那个。</p></div>
        <div className="card"><span className="tag gold">追涨杀跌</span><h4>英雄落难时雪中送炭</h4><p>跌到最低时给他一碗粥，胜过辉煌时送黄金。当众人杀跌，向需要帮助者伸手，未来或有厚报。</p></div>
        <div className="card"><span className="tag green">乐观者胜出</span><h4>太阳每天都会升起</h4><p>趋势长期向上。只有乐观的投资者才能在股市中胜出——但要在该乐观时乐观、该淡泊时淡泊。</p></div>
      </div>
      <p className="note" style={{ marginTop: 10 }}>关于"经得住折腾"：最难坚持的不是下跌途中，而是<b style={{ color: "var(--red)" }}>长跌后刚开始上扬</b>时——长期煎熬+利益诱惑，让人在黎明前交出筹码。耐心，是高风险投资者的必修课。</p>
    </div>
  );
}

function Part4() {
  const stockComment = [
    { n: "一", t: "游戏规则决定行为", b: "A 股的交易机制决定了"做多才能赢"的思维——这是价格易被推高的根源。" },
    { n: "二", t: "人爱听好话", b: "看多的声音比看空受欢迎，于是看多的评论员永远比看空的多、看多的时间也更长。" },
    { n: "三", t: "商业模式决定取向", b: "管理者不是拥有者、任期短，思维不可能超过其经营时长，只好迎合而非用长期眼光对投资者负责。" },
    { n: "四", t: "独立机构难生存", b: "投资者习惯免费信息，独立研究难以维计——于是边享受免费、边痛骂"黑嘴"，没人愿付合理报酬。" },
    { n: "五", t: "看空不创造效益", b: "看空既对持有者不利、又得罪上市公司、还拿不到信息，所以研究者多不愿树敌。" },
    { n: "六", t: "观点别超过承受力", b: "从众是最少阻力的行动，能承受压力提出不同观点者极少。选一个扛得住压力的评论员甚为重要。" },
    { n: "七", t: "选评论员看"医德"", b: "迎合容易而受欢迎，独立痛苦而不讨好。如同选医生：医术之上更重医德。" },
  ];
  return (
    <div className="fade">
      <p className="lead">第四部分是"股市杂谈"，主题词是：<b style={{ color: "var(--red)" }}>在一片浮躁中保持清醒，在悲观绝望中保持信心</b>。先看一组牛熊对照——同一群人的两副面孔。</p>
      <div className="kick">牛市与熊市的世间百态 · 切换看看</div>
      <BullBear />

      <div className="divider" />
      <div className="kick">怎样正确选择和理解股票评论</div>
      <p className="lead small">为什么看多的声音永远比看空多？作者拆解了七层原因——理解它，你才不会被"喊话"牵着走。</p>
      <Reveal rows={stockComment} />

      <div className="kick">几条点睛之论</div>
      <div className="grid g2">
        <div className="card"><span className="tag">赌经济还是赌政策？</span><p style={{ color: "var(--ink)" }}>就中国实际，不妨把<b style={{ color: "var(--red)" }}>政策的力量看重些</b>——经济困境中政府的逆周期之力，往往是 A 股转势的关键。</p></div>
        <div className="card"><span className="tag gold">加大分红：利好还是利空？</span><p style={{ color: "var(--ink)" }}>作者坚定认为是<b style={{ color: "var(--red)" }}>利好</b>，是 A 股的进步。市场可怕的是连利好利空都分不清。</p></div>
        <div className="card"><span className="tag green">抓大放小</span><p style={{ color: "var(--ink)" }}>先选全球最好，再全国第一、第二——<b style={{ color: "var(--red)" }}>千万不要倒着选</b>。普通人尤其当心小公司风险。</p></div>
        <div className="card"><span className="tag">用血汗钱别做股指期货</span><p style={{ color: "var(--ink)" }}>融资融券、股指期货像"重武器和火药"，是专业人士的专利。这是一条红线。</p></div>
      </div>
      <div className="pull"><span className="q">"</span>恐惧踏空，还是恐惧套牢？6124 点因怕踏空而满仓，结果套牢；1664 点因怕套牢而割肉，结果踏空。</div>
    </div>
  );
}

function Part5() {
  return (
    <div className="fade">
      <p className="lead">第五部分是全书最精彩的<b style={{ color: "var(--red)" }}>实战编年史</b>（2007–2024）：作者把自己十余年来一次次旗帜鲜明的"喊话"，连缀成一条与大盘交织的轨迹。这也是他那些著名"口彩"的来处——地球顶、钻石底、婴儿底、地平线。</p>
      <div className="kick">李大霄的著名喊话 × 上证指数 · 点击标记</div>
      <CallTimeline />

      <div className="kick">他买什么，不买什么</div>
      <OvervaluedVsCore />

      <div className="kick">股债跷跷板：重债轻股的极致</div>
      <p className="lead small">股与债像跷跷板。作者多次指出：2024 年公募基金 28 万亿、股票型基金却仅 2.6 万亿，<b style={{ color: "var(--red)" }}>"重债轻股"已达极致</b>——而这往往出现在股市底部。</p>
      <StockBondSeesaw />

      <div className="kick">2024：三头"牛"与一条"地平线"</div>
      <div className="grid g3">
        <div className="card"><span className="tag">大国牛</span><h4 style={{ color: "var(--red)" }}>核心资产领跑</h4><p>中概股→港股→A 股顺序反攻，"耐心资本来了"，市场从割韭菜模式转向拥抱优质资产。</p></div>
        <div className="card"><span className="tag gold">高息牛</span><h4 style={{ color: "var(--gold)" }}>资产荒下的高股息</h4><p>尘封已久的"宝藏"——长期被压制的最优质资产扬眉吐气，回购增持套利抬升其估值。</p></div>
        <div className="card"><span className="tag green">地平线保卫战</span><h4 style={{ color: "var(--green)" }}>3000 点</h4><p>"9·24"行情中，9 月 26 日上证一举突破 3000 点"地平线"，自 1997 年首破已历 17 年。</p></div>
      </div>
      <p className="note" style={{ marginTop: 12 }}>请始终记得作者的自我提醒：预测会受不可抗力影响而偏差，<b style={{ color: "var(--red)" }}>短期预测尤其不确定</b>。书中所有判断都是"一家之言"，所涉个股仅为举例、并非推荐。</p>
    </div>
  );
}

function Epilogue() {
  const map = [
    { t: "心法", items: ["投资如做人，品德与技术并重", "克服贪婪与恐惧 · 反人性", "承受不被认同的孤独", "乐观者才能胜出"] },
    { t: "纪律", items: ["余钱投资（30–50 年不动用）", "远离杠杆 · 远离衍生品", "第一时间认错 · 活着最重要", "按六步阶梯走 · 切勿跳级"] },
    { t: "选择", items: ["拥抱最低估·最优质·最龙头蓝筹", "远离高估五类（小/新/差/题材/伪成长）", "高股息核心资产 ·"高息牛"", "买好公司，与之共同成长"] },
    { t: "节奏", items: ["顶部需淡泊（6124 / 5178）", "底部需勇气（1664 / 1849 / 2440）", "半山需坚持（3000 地平线）", "重大事件要有提前量"] },
  ];
  return (
    <div className="fade">
      <p className="lead">距第一版已过十四年。2024 年 9 月 18 日上证创下 2689 点低位，核心资产估值处于 2000 年以来最低区域；9 月 26 日，一举突破 3000 点"地平线"。作者期待这是一轮"<b style={{ color: "var(--red)" }}>缓慢而悠长的慢牛</b>"——当然，仅限余钱好股，仅限中国最低估、最核心、最优质的资产。</p>
      <div className="kick">全书思想地图</div>
      <div className="grid g2">
        {map.map((m, i) => (
          <div key={i} className="card" style={{ borderColor: i % 2 ? "var(--gold-soft)" : "var(--red-soft)" }}>
            <h4 style={{ color: i % 2 ? "var(--gold)" : "var(--red)", fontSize: 18 }}>{m.t}</h4>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.9 }}>
              {m.items.map((x, j) => <li key={j}>{x}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="pull" style={{ textAlign: "center", background: "linear-gradient(160deg,var(--red-wash),#fff4ee)" }}>
        <span className="q">"</span>在悲观中拥抱最低估、最优质、最具竞争力的蓝筹龙头，远离高估五类。<br />股票投资一定要量力而为。
      </div>
      <p className="note" style={{ marginTop: 6 }}>作者在书末再次申明：股票投资风险巨大，各门各派、百花齐放，本书仅是一家之言，仅供参考，<b style={{ color: "var(--red)" }}>切不可作为操作依据</b>，操作风险自担。</p>
    </div>
  );
}

/* =============================== APP SHELL =============================== */
const CHAPTERS = [
  { id: "intro", num: "序", label: "开篇", ttl: "关于本书", idx: "—", epi: null, render: Intro },
  { id: "preface", num: "○", label: "自序·导读", ttl: "投资如做人", idx: "0", epi: <>价值投资是一场异常艰难的修行，<b>很难被大部分人接受</b>。</>, render: Preface },
  { id: "p1", num: "一", label: "第一部分", ttl: "有的人冲动，有的人沉稳", idx: "I", epi: <>不同的<b>心理素质</b>，给股票操作带来非常大的影响。</>, render: Part1 },
  { id: "p2", num: "二", label: "第二部分", ttl: "判断大势的风向标", idx: "II", epi: <>四个风向标：上市公司增减持、中石油、<b>汇金公司</b>、社保基金。</>, render: Part2 },
  { id: "p3", num: "三", label: "第三部分", ttl: "有时需淡泊，有时需勇气", idx: "III", epi: <>6124 点需<b>淡泊</b>，1664 点需<b>勇气</b>，3000 点需<b>坚持</b>。</>, render: Part3 },
  { id: "p4", num: "四", label: "第四部分", ttl: "股市杂谈", idx: "IV", epi: <>在一片浮躁中保持清醒，在<b>悲观绝望中保持信心</b>。</>, render: Part4 },
  { id: "p5", num: "五", label: "第五部分", ttl: "我眼中的大势 · 2007–2024", idx: "V", epi: <>涨时不要过于乐观，跌时也别太恐慌，<b>仔细分析，找出原因</b>。</>, render: Part5 },
  { id: "epi", num: "尾", label: "后记", ttl: "思想地图", idx: "末", epi: null, render: Epilogue },
];

export default function App() {
  const [active, setActive] = useState(0);
  const ch = CHAPTERS[active];
  const Body = ch.render;
  const go = (i) => { setActive(i); if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); };
  return (
    <div className="lx-root">
      <style>{css}</style>
      <div className="lx-wrap">
        <header className="mast">
          <div className="rule" />
          <div className="kicker">互动导读 · 第三版</div>
          <h1>李大霄<br /><span style={{ color: "var(--red)" }}>投资战略</span></h1>
          <p className="sub">一部关于投资心性的修行书——从余钱、价值、理性，到地球顶与婴儿底之间的人性拉锯。</p>
          <div className="byline">著 · 李大霄（英大证券首席经济学家）　|　共八卷 · 含可交互图示</div>
          <div className="seal dsp">霄</div>
        </header>

        <nav className="nav">
          <div className="nav-track">
            {CHAPTERS.map((c, i) => (
              <button key={c.id} className={"chip" + (i === active ? " on" : "")} onClick={() => go(i)}>
                <span className="num">{c.num}</span>{c.label}
              </button>
            ))}
          </div>
        </nav>

        <section className="chap-head" key={ch.id}>
          <div className="idx dsp">{ch.idx}</div>
          <h2 className="ttl">{ch.ttl}</h2>
          {ch.epi && <div className="epigraph">{ch.epi}</div>}
        </section>

        <main key={"b" + ch.id}>
          <Body />
        </main>

        <div className="prevnext">
          <button className="pnbtn" disabled={active === 0} onClick={() => active > 0 && go(active - 1)}>
            <div className="l">← 上一卷</div>
            <div className="t">{active > 0 ? CHAPTERS[active - 1].ttl : "已是开篇"}</div>
          </button>
          <button className="pnbtn next" disabled={active === CHAPTERS.length - 1} onClick={() => active < CHAPTERS.length - 1 && go(active + 1)}>
            <div className="l">下一卷 →</div>
            <div className="t">{active < CHAPTERS.length - 1 ? CHAPTERS[active + 1].ttl : "已是尾声"}</div>
          </button>
        </div>

        <footer className="foot">
          <b>风险提示</b>：本导读为对《李大霄投资战略（第三版）》核心思想的转述与图解，所有解读文字均为重新组织、并非原文摘录。书中观点系作者"一家之言"，所涉点位与个股仅为举例、并非任何推荐。<b>股票投资风险巨大，本内容不构成投资建议，切不可作为操作依据，操作风险自担。</b><br />
          投资一定要量力而为 · 余钱投资 · 远离杠杆 · 理性投资 · 价值投资。
        </footer>
      </div>
    </div>
  );
}
