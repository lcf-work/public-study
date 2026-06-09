import React, { useState, useEffect, useRef } from "react";

/* ============================================================================
   《战胜华尔街》(Beating the Street) · 互动导读
   彼得·林奇 / 约翰·罗瑟查尔德  著
   一个章节式的深度阅读伴侣 —— 让你透彻理解林奇的选股之道
   ========================================================================== */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,900;1,9..144,400&family=Noto+Serif+SC:wght@300;400;500;600;700;900&family=Space+Mono:wght@400;700&display=swap');

:root{
  --paper:#F2ECDD; --paper2:#EBE3CF; --card:#F7F2E7; --card2:#EFE7D3;
  --ink:#191711; --ink2:#403828; --ink3:#6B6149;
  --line:#CDC2A4; --line2:#DED4B8;
  --green:#1E4D38; --green2:#2F6B4F; --green3:#3F8767;
  --rust:#AF4527; --rust2:#C6643F; --gold:#B0822A; --gold2:#CDA044;
  --up:#2F6B4F; --down:#AF4527;
}
*{box-sizing:border-box;}
.btw-root{
  background:
    radial-gradient(120% 90% at 80% -10%, rgba(47,107,79,0.10), transparent 60%),
    radial-gradient(90% 80% at -10% 110%, rgba(175,69,39,0.08), transparent 55%),
    var(--paper);
  color:var(--ink); min-height:100vh; width:100%;
  font-family:"Noto Serif SC","Fraunces",serif;
  -webkit-font-smoothing:antialiased; position:relative; overflow-x:hidden;
}
.btw-root:before{
  content:""; position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.55;
  background-image:
    linear-gradient(rgba(120,105,70,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120,105,70,0.05) 1px, transparent 1px);
  background-size:34px 34px;
}
.btw-mono{font-family:"Space Mono",monospace;}
.btw-disp{font-family:"Fraunces","Noto Serif SC",serif;}

/* ---- ticker ---- */
.btw-ticker{
  position:relative; z-index:3; border-bottom:1px solid var(--line);
  background:var(--ink); color:var(--paper); overflow:hidden; height:34px;
  display:flex; align-items:center;
}
.btw-ticker-track{display:inline-flex; white-space:nowrap; animation:ticker 46s linear infinite;}
.btw-ticker span{font-family:"Space Mono",monospace; font-size:12px; letter-spacing:0.04em; padding:0 22px; opacity:0.92;}
.btw-ticker b{color:var(--gold2);}
.btw-ticker .up{color:#7FC9A6;} .btw-ticker .dn{color:#E2906F;}
@keyframes ticker{from{transform:translateX(0)} to{transform:translateX(-50%)}}

/* ---- topbar ---- */
.btw-top{position:relative; z-index:3; display:flex; align-items:center; justify-content:space-between;
  padding:14px 20px; border-bottom:1px solid var(--line); background:rgba(242,236,221,0.86); backdrop-filter:blur(6px);}
.btw-top .brand{display:flex; align-items:baseline; gap:12px;}
.btw-top .brand .zh{font-family:"Fraunces","Noto Serif SC",serif; font-weight:900; font-size:19px; letter-spacing:0.01em;}
.btw-top .brand .en{font-family:"Space Mono",monospace; font-size:10.5px; color:var(--ink3); letter-spacing:0.12em; text-transform:uppercase;}
.btw-burger{display:none; cursor:pointer; border:1px solid var(--line); background:var(--card); border-radius:8px; padding:7px 11px; font-family:"Space Mono",monospace; font-size:12px; color:var(--ink);}

/* ---- layout ---- */
.btw-wrap{position:relative; z-index:2; display:flex; gap:0; align-items:flex-start;}
.btw-side{
  width:286px; flex:0 0 286px; position:sticky; top:0; align-self:flex-start;
  height:calc(100vh - 0px); overflow-y:auto; padding:22px 16px 60px 22px;
  border-right:1px solid var(--line); background:rgba(235,227,207,0.5);
}
.btw-side::-webkit-scrollbar{width:8px;} .btw-side::-webkit-scrollbar-thumb{background:var(--line); border-radius:8px;}
.btw-part-h{font-family:"Space Mono",monospace; font-size:10.5px; letter-spacing:0.18em; text-transform:uppercase;
  color:var(--green); margin:22px 0 9px; padding-bottom:6px; border-bottom:1px dashed var(--line); }
.btw-part-h:first-child{margin-top:2px;}
.btw-nav-item{display:flex; gap:10px; align-items:baseline; width:100%; text-align:left; cursor:pointer;
  background:none; border:none; padding:7px 9px; border-radius:8px; color:var(--ink2); font-family:"Noto Serif SC",serif;
  font-size:13.5px; line-height:1.4; transition:all .16s ease; border:1px solid transparent;}
.btw-nav-item:hover{background:var(--card); color:var(--ink); transform:translateX(2px);}
.btw-nav-item.on{background:var(--ink); color:var(--paper); border-color:var(--ink);}
.btw-nav-item.on .num{color:var(--gold2);}
.btw-nav-item .num{font-family:"Space Mono",monospace; font-size:11px; color:var(--rust); min-width:24px; font-weight:700;}

.btw-main{flex:1 1 auto; min-width:0; padding:38px 30px 120px; max-width:none;}
.btw-col{max-width:820px; margin:0 auto;}

/* ---- section header ---- */
.btw-ey{font-family:"Space Mono",monospace; font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:var(--green); margin-bottom:14px; display:flex; align-items:center; gap:10px;}
.btw-ey .rule{height:1px; width:46px; background:var(--green); opacity:.5;}
.btw-secnum{font-family:"Fraunces",serif; font-weight:900; font-size:13px; color:var(--rust); letter-spacing:.04em;}
.btw-h1{font-family:"Fraunces","Noto Serif SC",serif; font-weight:900; font-size:38px; line-height:1.12; letter-spacing:-0.01em; margin:0 0 6px;}
.btw-h1en{font-family:"Space Mono",monospace; font-size:12.5px; color:var(--ink3); letter-spacing:0.08em; margin-bottom:26px;}

/* ---- thesis ---- */
.btw-thesis{position:relative; background:var(--ink); color:var(--paper); border-radius:14px; padding:22px 24px 22px 56px; margin:6px 0 30px; box-shadow:0 18px 40px -26px rgba(25,23,17,0.7);}
.btw-thesis:before{content:"“"; position:absolute; left:16px; top:6px; font-family:"Fraunces",serif; font-size:54px; color:var(--gold2); line-height:1;}
.btw-thesis .lab{font-family:"Space Mono",monospace; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--gold2); margin-bottom:8px;}
.btw-thesis p{margin:0; font-size:18px; line-height:1.7; font-weight:500;}

/* ---- body prose ---- */
.btw-body p{font-size:17px; line-height:1.92; color:var(--ink2); margin:0 0 17px; letter-spacing:0.005em;}
.btw-body p .em{color:var(--rust); font-weight:600;}
.btw-body p .gem{color:var(--green); font-weight:600;}
.btw-lead:first-letter{font-family:"Fraunces",serif; font-weight:900; font-size:58px; float:left; line-height:.82; padding:6px 12px 0 0; color:var(--green);}

/* ---- highlight cards ---- */
.btw-hl{display:grid; grid-template-columns:1fr 1fr; gap:13px; margin:24px 0 28px;}
.btw-hl .c{background:var(--card); border:1px solid var(--line2); border-left:3px solid var(--green2); border-radius:11px; padding:15px 17px;}
.btw-hl .c .l{font-family:"Space Mono",monospace; font-size:10.5px; letter-spacing:0.1em; text-transform:uppercase; color:var(--green); margin-bottom:7px;}
.btw-hl .c .t{font-size:14.5px; line-height:1.62; color:var(--ink2);}
.btw-hl .c .t b{color:var(--ink); font-weight:700;}

/* ---- cases ---- */
.btw-cases{margin:26px 0;}
.btw-cases .ch{font-family:"Space Mono",monospace; font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:var(--rust); margin-bottom:13px; display:flex; gap:9px; align-items:center;}
.btw-cases .ch .rule{height:1px;flex:1;background:var(--line);}
.btw-case{display:flex; gap:14px; padding:13px 0; border-bottom:1px dashed var(--line);}
.btw-case:last-child{border-bottom:none;}
.btw-case .nm{font-family:"Fraunces","Noto Serif SC",serif; font-weight:700; font-size:15.5px; color:var(--ink); flex:0 0 156px;}
.btw-case .nm small{display:block; font-family:"Space Mono",monospace; font-weight:400; font-size:10px; color:var(--ink3); margin-top:3px; letter-spacing:.04em;}
.btw-case .ds{font-size:14px; line-height:1.62; color:var(--ink2); flex:1;}

/* ---- Lynch law ---- */
.btw-law{position:relative; background:linear-gradient(135deg, var(--rust), var(--rust2)); color:#FBF4E6; border-radius:14px; padding:24px 26px; margin:30px 0; overflow:hidden; box-shadow:0 18px 40px -26px rgba(175,69,39,0.8);}
.btw-law:after{content:"§"; position:absolute; right:14px; bottom:-18px; font-family:"Fraunces",serif; font-size:120px; color:rgba(251,244,230,0.13); line-height:1;}
.btw-law .k{font-family:"Space Mono",monospace; font-size:10.5px; letter-spacing:0.2em; text-transform:uppercase; opacity:.9; margin-bottom:9px; display:flex; align-items:center; gap:8px;}
.btw-law .k .n{background:#FBF4E6; color:var(--rust); border-radius:5px; padding:1px 8px; font-weight:700;}
.btw-law p{margin:0; font-family:"Fraunces","Noto Serif SC",serif; font-weight:500; font-size:20px; line-height:1.5; position:relative; z-index:1;}

/* ---- takeaway ---- */
.btw-take{background:var(--card2); border:1px solid var(--line2); border-radius:13px; padding:19px 22px; margin:28px 0 8px; display:flex; gap:15px;}
.btw-take .ic{flex:0 0 38px; height:38px; border-radius:50%; background:var(--green); color:var(--paper); display:flex; align-items:center; justify-content:center; font-family:"Fraunces",serif; font-weight:900; font-size:20px;}
.btw-take .bd .l{font-family:"Space Mono",monospace; font-size:10.5px; letter-spacing:0.14em; text-transform:uppercase; color:var(--green); margin-bottom:6px;}
.btw-take .bd p{margin:0; font-size:15.5px; line-height:1.72; color:var(--ink2);}
.btw-take .bd p b{color:var(--ink); font-weight:700;}

/* ---- viz frame ---- */
.btw-viz{background:var(--card); border:1px solid var(--line2); border-radius:14px; padding:20px 20px 16px; margin:26px 0; box-shadow:0 10px 30px -24px rgba(25,23,17,0.6);}
.btw-viz .vt{font-family:"Fraunces","Noto Serif SC",serif; font-weight:700; font-size:15px; color:var(--ink); margin-bottom:3px;}
.btw-viz .vs{font-family:"Space Mono",monospace; font-size:10.5px; color:var(--ink3); letter-spacing:.04em; margin-bottom:14px;}
.btw-viz svg{display:block; width:100%; height:auto;}
.btw-viz .vnote{font-size:12.5px; line-height:1.6; color:var(--ink3); margin-top:12px; border-top:1px dashed var(--line); padding-top:11px;}

/* ---- footnav ---- */
.btw-fn{display:flex; justify-content:space-between; gap:14px; margin-top:48px; border-top:1px solid var(--line); padding-top:22px;}
.btw-fn button{flex:1; cursor:pointer; background:var(--card); border:1px solid var(--line); border-radius:11px; padding:14px 16px; text-align:left; transition:all .16s ease;}
.btw-fn button:hover{background:var(--ink); color:var(--paper); border-color:var(--ink);}
.btw-fn button:hover .l{color:var(--gold2);}
.btw-fn button.r{text-align:right;}
.btw-fn .l{font-family:"Space Mono",monospace; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--ink3); margin-bottom:5px;}
.btw-fn .t{font-family:"Fraunces","Noto Serif SC",serif; font-weight:700; font-size:14.5px;}
.btw-fn button:disabled{opacity:.35; cursor:default;} .btw-fn button:disabled:hover{background:var(--card); color:var(--ink); border-color:var(--line);}

.fade-in{animation:fadein .5s ease both;}
@keyframes fadein{from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:none}}

/* ---- cover ---- */
.btw-cover{position:relative; z-index:2;}
.btw-hero{padding:54px 30px 30px; max-width:980px; margin:0 auto;}
.btw-kicker{font-family:"Space Mono",monospace; font-size:12px; letter-spacing:0.24em; text-transform:uppercase; color:var(--rust); margin-bottom:20px;}
.btw-title{font-family:"Fraunces","Noto Serif SC",serif; font-weight:900; font-size:64px; line-height:1.02; letter-spacing:-0.02em; margin:0 0 10px;}
.btw-title .en{display:block; font-family:"Space Mono",monospace; font-weight:700; font-size:17px; letter-spacing:0.1em; color:var(--green); margin-top:14px;}
.btw-sub{font-size:18px; line-height:1.8; color:var(--ink2); max-width:680px; margin:22px 0 0;}
.btw-byline{font-family:"Space Mono",monospace; font-size:12.5px; color:var(--ink3); margin-top:18px; letter-spacing:.03em;}
.btw-statgrid{display:grid; grid-template-columns:repeat(4,1fr); gap:14px; max-width:980px; margin:40px auto 0; padding:0 30px;}
.btw-stat{background:var(--card); border:1px solid var(--line2); border-top:3px solid var(--green2); border-radius:13px; padding:18px 16px;}
.btw-stat .v{font-family:"Fraunces",serif; font-weight:900; font-size:30px; color:var(--green); line-height:1;}
.btw-stat .v small{font-size:15px; color:var(--ink2);}
.btw-stat .k{font-size:12.5px; line-height:1.5; color:var(--ink2); margin-top:9px;}
.btw-how{max-width:980px; margin:42px auto 0; padding:0 30px;}
.btw-how .hh{font-family:"Space Mono",monospace; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:var(--green); margin-bottom:14px; display:flex; gap:10px; align-items:center;}
.btw-how .hh .rule{height:1px; flex:1; background:var(--line);}
.btw-howg{display:grid; grid-template-columns:repeat(3,1fr); gap:14px;}
.btw-howc{background:var(--card2); border:1px solid var(--line2); border-radius:12px; padding:17px 18px;}
.btw-howc .n{font-family:"Fraunces",serif; font-weight:900; font-size:22px; color:var(--rust);}
.btw-howc .t{font-family:"Noto Serif SC",serif; font-weight:600; font-size:14.5px; margin:6px 0 5px; color:var(--ink);}
.btw-howc .d{font-size:13px; line-height:1.62; color:var(--ink2);}
.btw-start{display:inline-flex; align-items:center; gap:10px; margin:36px auto 10px; cursor:pointer; background:var(--ink); color:var(--paper); border:none; border-radius:40px; padding:15px 28px; font-family:"Fraunces","Noto Serif SC",serif; font-weight:700; font-size:16px; transition:all .18s ease;}
.btw-start:hover{transform:translateY(-2px); box-shadow:0 16px 32px -18px rgba(25,23,17,.8);}
.btw-startwrap{max-width:980px; margin:0 auto; padding:0 30px 70px; text-align:center;}

@media (max-width:900px){
  .btw-side{position:fixed; left:0; top:0; bottom:0; z-index:40; transform:translateX(-104%); transition:transform .26s ease; box-shadow:0 0 60px rgba(0,0,0,.35); width:280px; flex-basis:280px; height:100vh; background:var(--paper);}
  .btw-side.open{transform:translateX(0);}
  .btw-burger{display:inline-block;}
  .btw-main{padding:26px 18px 110px;}
  .btw-h1{font-size:30px;} .btw-title{font-size:42px;}
  .btw-hl{grid-template-columns:1fr;}
  .btw-statgrid{grid-template-columns:1fr 1fr;}
  .btw-howg{grid-template-columns:1fr;}
  .btw-case{flex-direction:column; gap:5px;} .btw-case .nm{flex-basis:auto;}
  .btw-scrim{display:block;}
}
.btw-scrim{display:none; position:fixed; inset:0; background:rgba(20,18,12,.45); z-index:35;}
.btw-scrim.show{display:block;}
`;

/* ----------------------------- helpers ----------------------------- */
const T = ({ children }) => <span dangerouslySetInnerHTML={{ __html: children }} />;

/* ----------------------------- visualizations ----------------------------- */
const C = {
  ink:"#191711", ink2:"#403828", ink3:"#6B6149",
  green:"#1E4D38", green2:"#2F6B4F", green3:"#3F8767",
  rust:"#AF4527", rust2:"#C6643F", gold:"#B0822A", gold2:"#CDA044",
  paper:"#F2ECDD", card:"#F7F2E7", line:"#CDC2A4",
};
const Frame = ({ t, s, note, children }) => (
  <div className="btw-viz">
    <div className="vt">{t}</div>
    <div className="vs">{s}</div>
    {children}
    {note && <div className="vnote">{note}</div>}
  </div>
);

/* 1 — 股票 vs 债券：1000美元的43年 */
function VizStockBond() {
  // log-scaled curve so both visible; endpoints: bonds 1.6M, stocks 25.5M
  const W = 760, H = 300, padL = 54, padR = 110, padB = 36, padT = 18;
  const x = (t) => padL + t * (W - padL - padR);
  const ylog = (v) => {
    const lo = Math.log10(1000), hi = Math.log10(25500000);
    return H - padB - ((Math.log10(v) - lo) / (hi - lo)) * (H - padB - padT);
  };
  const curve = (end) => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const v = 1000 * Math.pow(end / 1000, t);
      pts.push([x(t), ylog(v)]);
    }
    return pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  };
  const gl = [1000, 10000, 100000, 1000000, 25500000];
  const gll = ["$1千", "$1万", "$10万", "$100万", "$2550万"];
  return (
    <Frame t="1000美元，43年 (1926–1969)" s="同一笔钱 · 股票 vs 长期国债 · 对数刻度" note="数据出自本书引言：长期持有股票的复利效应，把债券远远甩在身后。林奇第2法则——“偏爱债券的投资人，可知道不投资股票错过的财富有多大”。">
      <svg viewBox={`0 0 ${W} ${H}`} role="img">
        {gl.map((v, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={ylog(v)} y2={ylog(v)} stroke={C.line} strokeWidth="1" strokeDasharray="2 4" />
            <text x={padL - 8} y={ylog(v) + 4} textAnchor="end" fontFamily="Space Mono" fontSize="10" fill={C.ink3}>{gll[i]}</text>
          </g>
        ))}
        <path d={curve(1600000)} fill="none" stroke={C.ink3} strokeWidth="2.4" />
        <path d={curve(25500000)} fill="none" stroke={C.green} strokeWidth="3.4" />
        {/* endpoints */}
        <circle cx={x(1)} cy={ylog(1600000)} r="4.5" fill={C.ink3} />
        <circle cx={x(1)} cy={ylog(25500000)} r="5.5" fill={C.green} />
        <text x={x(1) + 9} y={ylog(25500000) + 1} fontFamily="Fraunces" fontWeight="900" fontSize="16" fill={C.green}>股票</text>
        <text x={x(1) + 9} y={ylog(25500000) + 17} fontFamily="Space Mono" fontSize="11" fill={C.green2}>$2550万</text>
        <text x={x(1) + 9} y={ylog(1600000) + 1} fontFamily="Fraunces" fontWeight="900" fontSize="15" fill={C.ink2}>债券</text>
        <text x={x(1) + 9} y={ylog(1600000) + 16} fontFamily="Space Mono" fontSize="11" fill={C.ink3}>$160万</text>
        <text x={padL} y={H - 8} fontFamily="Space Mono" fontSize="10" fill={C.ink3}>1926</text>
        <text x={W - padR} y={H - 8} textAnchor="end" fontFamily="Space Mono" fontSize="10" fill={C.ink3}>1969</text>
      </svg>
    </Frame>
  );
}

/* 2 — 圣阿格尼斯 vs 标普500 */
function VizStAgnes() {
  const W = 700, H = 230, base = 178, bw = 120;
  const bar = (xc, pct, color, lab, val) => {
    const max = 80, h = (pct / max) * 150;
    return (
      <g>
        <rect x={xc - bw / 2} y={base - h} width={bw} height={h} rx="6" fill={color} />
        <text x={xc} y={base - h - 12} textAnchor="middle" fontFamily="Fraunces" fontWeight="900" fontSize="26" fill={color}>{pct}%</text>
        <text x={xc} y={base + 22} textAnchor="middle" fontFamily="Noto Serif SC" fontWeight="600" fontSize="14" fill={C.ink}>{lab}</text>
        <text x={xc} y={base + 40} textAnchor="middle" fontFamily="Space Mono" fontSize="10.5" fill={C.ink3}>{val}</text>
      </g>
    );
  };
  return (
    <Frame t="七年级学生 vs 华尔街 (1990–1991 两年累计)" s="圣阿格尼斯教会学校模拟组合 · 战胜 99% 的基金经理" note="孩子们的方法反而更简单有效：只买自己能用蜡笔讲清楚的公司（迪士尼、麦当劳、沃尔玛、Topps 棒球卡……）。这就是林奇第3法则。">
      <svg viewBox={`0 0 ${W} ${H}`} role="img">
        <line x1="60" x2={W - 40} y1={base} y2={base} stroke={C.line} strokeWidth="1.5" />
        {bar(220, 70, C.green, "学生模拟组合", "+70%")}
        {bar(470, 26, C.ink3, "标准普尔500", "+26%")}
        <text x={345} y={50} textAnchor="middle" fontFamily="Space Mono" fontSize="11" fill={C.rust}>差距 ≈ 2.7×</text>
      </svg>
    </Frame>
  );
}

/* 3 — 股市天气：70年 40次下跌 */
function VizWeather() {
  const W = 760, H = 168, y0 = 92;
  const big = new Set([6, 12, 19, 27, 33, 38]); // mark some as >33% crashes
  const bars = [];
  for (let i = 0; i < 40; i++) {
    const xc = 44 + (i / 39) * (W - 90);
    const isBig = big.has(i);
    const h = isBig ? 56 : 20 + Math.abs(Math.sin(i * 1.7)) * 16;
    bars.push(
      <line key={i} x1={xc} x2={xc} y1={y0} y2={y0 + h} stroke={isBig ? C.rust : C.rust2} strokeWidth={isBig ? 3.4 : 2} strokeLinecap="round" opacity={isBig ? 1 : 0.75} />
    );
  }
  return (
    <Frame t="股市的“天气”：70 年里 40 次大跌" s="跌幅 >10% 出现 40 次 · 其中 13 次为 >33% 的暴跌（红色加粗）" note="林奇第16法则：股市大跌就像东北的暴风雪，年年都来。事先有准备的人不会恐慌，反而把它当成低价买入的良机。">
      <svg viewBox={`0 0 ${W} ${H}`} role="img">
        <line x1="40" x2={W - 40} y1={y0} y2={y0} stroke={C.ink} strokeWidth="1.6" />
        {bars}
        <text x="40" y="26" fontFamily="Fraunces" fontWeight="900" fontSize="15" fill={C.ink}>↑ 股市长期向上</text>
        <text x="40" y={H - 8} fontFamily="Space Mono" fontSize="10" fill={C.ink3}>1920s</text>
        <text x={W - 40} y={H - 8} textAnchor="end" fontFamily="Space Mono" fontSize="10" fill={C.ink3}>1990s</text>
        <text x={W / 2} y="26" textAnchor="middle" fontFamily="Space Mono" fontSize="11" fill={C.rust}>↓ 每一次都是必然，而非末日</text>
      </svg>
    </Frame>
  );
}

/* 4 — 基金全明星组合 (6等份) */
function VizFunds() {
  const segs = [
    ["资本增值型", C.green], ["绩优成长型", C.green2], ["新兴小盘成长", C.green3],
    ["价值型", C.gold], ["特殊情况", C.rust2], ["公用事业/混合", C.rust],
  ];
  const cx = 150, cy = 150, r = 110, ir = 56;
  const arc = (i) => {
    const a0 = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / 6) * Math.PI * 2 - Math.PI / 2;
    const p = (a, rad) => [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
    const [x0, y0] = p(a0, r), [x1, y1] = p(a1, r);
    const [x2, y2] = p(a1, ir), [x3, y3] = p(a0, ir);
    return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${ir} ${ir} 0 0 0 ${x3} ${y3} Z`;
  };
  return (
    <Frame t="“基金全明星队”：分散于不同风格" s="把资金等分为 6 份 · 任何风格当红都不会错过" note="林奇的关键点：不要在不同基金间频繁切换。投资 6 只“同一种风格”的基金不叫分散——要覆盖成长、价值、小盘、大盘等不同打法，并长期持有。">
      <svg viewBox="0 0 540 300" role="img">
        {segs.map((s, i) => <path key={i} d={arc(i)} fill={s[1]} stroke={C.card} strokeWidth="3" />)}
        <text x={cx} y={cy - 4} textAnchor="middle" fontFamily="Fraunces" fontWeight="900" fontSize="22" fill={C.ink}>1/6</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontFamily="Space Mono" fontSize="10" fill={C.ink3}>×6</text>
        {segs.map((s, i) => (
          <g key={i} transform={`translate(310, ${44 + i * 34})`}>
            <rect width="16" height="16" rx="3" fill={s[1]} />
            <text x="24" y="13" fontFamily="Noto Serif SC" fontWeight="600" fontSize="14" fill={C.ink}>{s[0]}</text>
          </g>
        ))}
      </svg>
    </Frame>
  );
}

/* 5 — 麦哲伦 AUM 时间线 */
function VizMagellan() {
  const pts = [
    ["1977", "$1800万", "林奇接手 · 已封闭", 18, C.ink3],
    ["1981", "$1亿", "重新开放申购", 100, C.green3],
    ["1983", "$10亿", "里程碑 · 办公室欢呼", 1000, C.green2],
    ["1990", "$140亿", "林奇退休", 14000, C.green],
  ];
  const W = 760, H = 230, padL = 40, padR = 40, y0 = 168;
  const x = (i) => padL + (i / 3) * (W - padL - padR);
  const ylog = (v) => y0 - (Math.log10(v) - Math.log10(18)) / (Math.log10(14000) - Math.log10(18)) * 120;
  const path = pts.map((p, i) => (i ? "L" : "M") + x(i) + " " + ylog(p[3])).join(" ");
  return (
    <Frame t="麦哲伦基金的 13 年 (1977–1990)" s="资产规模 $1800万 → $140亿 · 年均回报约 29%" note="林奇用这段历程反复说明：成功并非来自押注小盘成长股，而来自灵活——银行股、汽车股、反转股、海外股……哪里被低估就去哪里。">
      <svg viewBox={`0 0 ${W} ${H}`} role="img">
        <path d={path} fill="none" stroke={C.green} strokeWidth="3" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={ylog(p[3])} r="6" fill={p[4]} />
            <text x={x(i)} y={ylog(p[3]) - 14} textAnchor="middle" fontFamily="Fraunces" fontWeight="900" fontSize="17" fill={p[4]}>{p[1]}</text>
            <text x={x(i)} y={y0 + 22} textAnchor="middle" fontFamily="Space Mono" fontSize="11" fontWeight="700" fill={C.ink}>{p[0]}</text>
            <text x={x(i)} y={y0 + 40} textAnchor="middle" fontFamily="Noto Serif SC" fontSize="11.5" fill={C.ink3}>{p[2]}</text>
          </g>
        ))}
      </svg>
    </Frame>
  );
}

/* 6 — 股价线 vs 收益线 (核心估值工具) */
function VizPriceEarnings() {
  const W = 760, H = 320, padL = 30, padR = 120, padB = 30, padT = 20;
  const x = (t) => padL + t * (W - padL - padR);
  const y = (v) => H - padB - v * (H - padB - padT); // v in 0..1
  // earnings line: steady rise
  const earn = (t) => 0.22 + t * 0.5;
  // price line: oscillates around earnings, sometimes below (buy), sometimes far above (danger)
  const price = (t) => earn(t) + 0.16 * Math.sin(t * 7.2) + (t > 0.72 ? (t - 0.72) * 0.9 : 0) - 0.05;
  const ePath = [], pPath = [], buyFill = [], dangFill = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    ePath.push((i ? "L" : "M") + x(t).toFixed(1) + " " + y(earn(t)).toFixed(1));
    pPath.push((i ? "L" : "M") + x(t).toFixed(1) + " " + y(price(t)).toFixed(1));
  }
  return (
    <Frame t="股价线 vs 收益线 —— 林奇的估值“尺子”" s="收益线（绿）稳步上行；股价线（黑）围绕它波动" note="本书第7章的核心工具：股价线≈或低于收益线 → 可买（绿区）；股价线远高于收益线 → 危险，等回调（红区）。判断大盘成长股是否“贵”，看这一张图就够了。">
      <svg viewBox={`0 0 ${W} ${H}`} role="img">
        {/* danger band shading near top-right */}
        <defs>
          <linearGradient id="dang" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#AF4527" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#AF4527" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x={x(0.74)} y={padT} width={x(1) - x(0.74)} height={H - padB - padT} fill="url(#dang)" />
        <path d={ePath.join(" ")} fill="none" stroke={C.green} strokeWidth="3.2" />
        <path d={pPath.join(" ")} fill="none" stroke={C.ink} strokeWidth="2.4" />
        {/* labels */}
        <text x={x(1) + 8} y={y(earn(1)) + 4} fontFamily="Noto Serif SC" fontWeight="700" fontSize="13" fill={C.green}>收益线</text>
        <text x={x(1) + 8} y={y(earn(1)) + 22} fontFamily="Space Mono" fontSize="9.5" fill={C.green2}>每股收益</text>
        <text x={x(1) + 8} y={y(price(1)) + 4} fontFamily="Noto Serif SC" fontWeight="700" fontSize="13" fill={C.ink}>股价线</text>
        {/* buy markers where price below earnings */}
        <g>
          <circle cx={x(0.30)} cy={y(price(0.30))} r="6" fill="none" stroke={C.green} strokeWidth="2.5" />
          <text x={x(0.30)} y={y(price(0.30)) + 26} textAnchor="middle" fontFamily="Noto Serif SC" fontWeight="700" fontSize="12" fill={C.green}>买入区</text>
        </g>
        <text x={x(0.88)} y={padT + 4} textAnchor="middle" fontFamily="Noto Serif SC" fontWeight="700" fontSize="12" fill={C.rust}>危险区</text>
        <text x={x(0.88)} y={padT + 22} textAnchor="middle" fontFamily="Space Mono" fontSize="9" fill={C.rust2}>股价跑得太快</text>
      </svg>
    </Frame>
  );
}

/* 7 — 周期股的市盈率悖论 */
function VizCyclical() {
  const W = 740, H = 260, padL = 30, padR = 30, y0 = 130, amp = 78;
  const x = (t) => padL + t * (W - padL - padR);
  const y = (t) => y0 - Math.sin(t * Math.PI * 2 - Math.PI / 2) * amp;
  const pts = [];
  for (let i = 0; i <= 80; i++) { const t = i / 80; pts.push((i ? "L" : "M") + x(t).toFixed(1) + " " + y(t).toFixed(1)); }
  return (
    <Frame t="周期股的“市盈率悖论”" s="与普通股相反：低 P/E 危险，高 P/E 才是机会" note="林奇第15章：周期股（钢铁、铝、汽车、纸业……）收益随景气大起大落。低市盈率往往出现在盈利顶峰、即将转跌之时；高市盈率（甚至亏损）往往出现在谷底、复苏前夜。">
      <svg viewBox={`0 0 ${W} ${H}`} role="img">
        <path d={pts.join(" ")} fill="none" stroke={C.ink2} strokeWidth="3" />
        {/* peak */}
        <circle cx={x(0.25)} cy={y(0.25)} r="7" fill={C.rust} />
        <text x={x(0.25)} y={y(0.25) - 16} textAnchor="middle" fontFamily="Noto Serif SC" fontWeight="700" fontSize="13" fill={C.rust}>盈利顶峰</text>
        <text x={x(0.25)} y={y(0.25) - 32} textAnchor="middle" fontFamily="Space Mono" fontSize="10" fill={C.rust}>低 P/E → 卖出</text>
        {/* trough */}
        <circle cx={x(0.75)} cy={y(0.75)} r="7" fill={C.green} />
        <text x={x(0.75)} y={y(0.75) + 26} textAnchor="middle" fontFamily="Noto Serif SC" fontWeight="700" fontSize="13" fill={C.green}>谷底 / 亏损</text>
        <text x={x(0.75)} y={y(0.75) + 42} textAnchor="middle" fontFamily="Space Mono" fontSize="10" fill={C.green}>高 P/E → 买入</text>
        <text x={padL} y={H - 6} fontFamily="Space Mono" fontSize="10" fill={C.ink3}>景气循环 →</text>
      </svg>
    </Frame>
  );
}

/* 8 — 困境公用事业 4阶段周期 */
function VizUtility() {
  const stages = [
    ["①灾难突降", "股价 1–2 年内跌 40–80%", C.rust],
    ["②危机管理", "削减/取消分红，公司自救", C.rust2],
    ["③财务稳定", "成本受控，前景重新清晰", C.gold],
    ["④恢复元气", "分红恢复，股价反弹 4–5 倍", C.green],
  ];
  const W = 740, H = 250, padL = 40, padR = 40;
  const x = (i) => padL + (i / 3) * (W - padL - padR);
  const ys = [70, 168, 150, 70];
  const path = ys.map((yy, i) => (i ? "L" : "M") + x(i) + " " + yy).join(" ");
  return (
    <Frame t="困境公用事业的 4 个阶段 (CMS 能源)" s="政府监管 = 几乎一定会被救活 → 困境反转的沃土" note="林奇第16章总结的规律：只要人们还需要电，州政府就有动力让电力公司活下去。从灾难到恢复，留给逆向投资者很长的获利窗口。">
      <svg viewBox={`0 0 ${W} ${H}`} role="img">
        <path d={path} fill="none" stroke={C.ink2} strokeWidth="2.6" strokeDasharray="1 0" />
        {stages.map((s, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={ys[i]} r="8" fill={s[2]} />
            <text x={x(i)} y={i === 1 || i === 2 ? ys[i] + 30 : ys[i] - 18} textAnchor="middle" fontFamily="Noto Serif SC" fontWeight="700" fontSize="13.5" fill={s[2]}>{s[0]}</text>
            <text x={x(i)} y={i === 1 || i === 2 ? ys[i] + 47 : ys[i] - 34} textAnchor="middle" fontFamily="Space Mono" fontSize="9.5" fill={C.ink3}>{s[1]}</text>
          </g>
        ))}
      </svg>
    </Frame>
  );
}

const VIZ = {
  stockBond: VizStockBond, stAgnes: VizStAgnes, weather: VizWeather, funds: VizFunds,
  magellan: VizMagellan, priceEarn: VizPriceEarnings, cyclical: VizCyclical, utility: VizUtility,
};

/* ============================ 章节内容数据 ============================ */
const SECTIONS = [
  { id:"cover", type:"cover", part:"开始", nav:"封面", num:"" },

  /* ---------- 引言 ---------- */
  {
    id:"intro", part:"开始", nav:"引言 · 买股票吧", num:"引",
    cn:"想多赚钱就买股票吧", en:"PROLOGUE · PUTTING STOCKS FIRST",
    thesis:"想多赚钱，就买股票——哪怕未来几年是大熊市，也应把大部分资产放在股票上。",
    body:[
      "退休的基金经理本该只提提建议、而非著书立说，但林奇看到全美 90% 的钱仍躺在债券、大额存单和货币基金里，忍不住再写一本。1980 年代是现代股市第二好的黄金十年，可美国家庭投资股票的比例却从 60 年代的 40% 一路降到 90 年代的 <span class='em'>17%</span>——道指涨了 4 倍，人们反而在撤离股市。",
      "最有说服力的证据来自《伊博森年鉴》：1926–1989 这六十多年里，<span class='gem'>只有 30 年代债券跑赢股票</span>（70 年代打平），股票拥有约 <span class='em'>6:1</span> 的胜率。1000 美元投长期国债 43 年变成 160 万，同样的钱投标普 500 却变成 <span class='gem'>2550 万</span>。这就引出了林奇的第 2 条法则。",
      "写书的第二个动机，是鼓励业余投资者。林奇坚信：业余者只要花少量时间研究自己熟悉的几家公司，就能打败 95% 的基金经理。圣阿格尼斯学校的七年级学生和上万个投资俱乐部，就是活生生的证据。",
      "但决定成败的，<span class='em'>不是分析的智力，而是持有的勇气</span>。神经脆弱的人，股市一跌就以为世界末日，吓得抛出，再好的股票也拿不住、赚不到钱。",
      "全书地图：第 1–3 章讲投资前的准备；第 4–6 章是他管理麦哲伦的回忆录；第 7–20 章逐一拆解 1992 年向《巴伦》推荐的 21 只股票的选股笔记，覆盖银行、储贷、周期、零售、公用事业等；第 21 章讲每 6 个月一次的定期检查。",
    ],
    hl:[
      { l:"股票 vs 债券", t:"1926–1989：仅 30 年代债券胜出，<b>股票胜率 6:1</b>" },
      { l:"黄金十年的悖论", t:"道指涨 4 倍，家庭投资股票比例却从 40% 降到 <b>17%</b>" },
      { l:"第 2 条林奇法则", t:"偏爱债券的人，错过的财富大到<b>难以想象</b>" },
      { l:"决定命运的", t:"不是分析的<b>智力</b>，而是持有的<b>勇气</b>" },
    ],
    viz:"stockBond",
    law:{ n:2, text:"那些偏爱债券的投资人啊，你们可知道不投资股票错过的财富有多大。" },
    take:"如果你只从这本书学到一句话，那就是：<b>买股票</b>。大盘、小盘、中盘都行——前提是你能理性选择，并在调整时不恐慌全抛。",
  },

  /* ---------- 第1章 ---------- */
  {
    id:"ch1", part:"第一部 · 投资准备", nav:"业余者更强", num:"01",
    cn:"业余投资者比专业投资者业绩更好", en:"CH.1 · THE MIRACLE OF ST. AGNES",
    thesis:"利用业余时间研究自己熟悉的公司，普通人完全可以打败大多数专业投资者。",
    body:[
      "自己做的蛋糕往往比买的好吃，自己选股也往往比专业的更好——林奇对越来越多人放弃自己选股深感困惑。原因之一是财经媒体把基金经理捧成了摇滚明星，让业余者自惭形秽；可事实是 <span class='em'>75% 的基金连大盘都跑不赢</span>。",
      "业余者退场的真正原因是“赔钱赔怕了”：那些在学校、职场很成功的人，常在股市一败涂地，于是转投基金，又拿“私房钱”随便赌一把，态度轻率，恶性循环。",
      "然后是全书最动人的故事。波士顿郊区的圣阿格尼斯教会学校，老师琼·莫里西带七年级学生模拟选股：14 只股票的组合两年涨 <span class='gem'>70%</span>，远超标普 500 的 26%，<span class='em'>打败了 99% 的基金经理</span>。他们的方法朴素得惊人——每只股票必须能向全班讲清业务（蜡笔原则），至少分散 10 家，偏爱自己熟悉的产品：迪士尼、耐克、盖普、百事、Topps 棒球卡、沃尔玛、雄狮食品……唯一的败笔，是模仿大人买了 IBM。",
      "这催生了林奇第 3 法则。孩子们还录了一盘磁带，念出朴素却深刻的格言：好公司常年提高分红；赔钱很快、赚钱很慢；股价跌了不代表不会再跌；务必分散投资……",
      "上万个全美投资者协会俱乐部同样验证了这一点：1980 年代多数俱乐部跑赢标普，而 3/4 的基金落后。秘诀是 <span class='gem'>定期定额 + 集体决策</span>，挡住了个人的恐慌性买卖。富达测算：1940 年起每年定投 1000 美元，52 年后变成 <span class='gem'>355 万</span>；每逢大跌 10% 再追投，更高达 <span class='gem'>629 万</span>。",
    ],
    hl:[
      { l:"蜡笔原则", t:"讲不清的公司不碰——这是孩子也是专业人士该守的铁律" },
      { l:"学生的方法", t:"只买<b>熟悉的产品</b>、至少分散 <b>10 家</b>、必须能讲清业务" },
      { l:"俱乐部的秘诀", t:"<b>定期定额 + 集体决策</b>，挡住了恐慌性交易" },
      { l:"定投的威力", t:"52 年每年 $1000 → <b>$355 万</b>；逢跌加仓 → <b>$629 万</b>" },
    ],
    viz:"stAgnes",
    law:{ n:3, text:"千万不要对任何无法用蜡笔将公司业务描述清楚的股票进行投资。" },
    take:"你的优势不在华尔街，而在你的<b>生活经验</b>。把买入限制在你真正了解的少数公司，并用定期定额对抗自己的情绪。",
  },

  /* ---------- 第2章 ---------- */
  {
    id:"ch2", part:"第一部 · 投资准备", nav:"周末焦虑症", num:"02",
    cn:"周末焦虑症", en:"CH.2 · THE WEEKEND WORRIER",
    thesis:"投资赚钱的关键是别被吓跑。对宏观与大盘的恐慌预测，是最危险的投资陷阱。",
    body:[
      "炒股和减肥一样，决定结果的不是头脑而是毅力。一个根本不看大盘、只定期买入的人，业绩往往胜过天天研究、择时进出的人。",
      "林奇用《巴伦》周刊的年度圆桌会议自嘲：一群掌管数十亿的顶级专家，每年聚在一起对未来忧心忡忡——<span class='em'>1987 年他们最乐观，当年暴跌 1000 点；1988 年最悲观、预言“30 年代式大萧条”，结果 1991 年迎来 20 年最强牛市</span>。如果你听了他们的预测，早就吓跑、错过大涨了。这就是林奇第 4 法则：无法从后视镜里看未来。",
      "所谓“周末焦虑症”：周末空闲读报，全球变暖、银行崩溃、战争……越读越怕，于是周一抛单如潮（历史最大跌幅多在<span class='em'>周一</span>）；年底圣诞长假更升级为“年末焦虑症”。",
      "解药是“大局观”，乃至“更大的大局”：过去 70 年股票年均约 <span class='gem'>11%</span>，是债券的两倍多；其间发生过 40 次 >10% 的下跌、13 次 >33% 的暴跌，包括 1929 大崩盘——但<span class='gem'>每一次股价最终都涨了回来，而且更高</span>。",
      "股市大跌就像明尼苏达的寒冬，是必然而非末日。成功的选股者像当地居民一样早有准备，趁机加仓。而最可靠的纪律，仍是每月定投，让钱在恐慌中继续买入。",
    ],
    hl:[
      { l:"圆桌会议的反讽", t:"专家最乐观的 1987 暴跌千点；最悲观的次年迎来<b>最强牛市</b>" },
      { l:"周末焦虑症", t:"读报 → 恐慌 → 周一抛售，历史最大跌幅<b>多在周一</b>" },
      { l:"更大的大局", t:"70 年股票年均 ~11%，<b>是债券两倍多</b>" },
      { l:"下跌的真相", t:"70 年 40 次大跌、13 次暴跌——<b>每次都涨了回来</b>" },
    ],
    viz:"weather",
    law:{ n:4, text:"你无法从后视镜中看到未来。" },
    take:"别为周末报刊的危言耸听焦虑，也别理会任何对利率、经济与大盘的预测。<b>天塌不下来</b>；除非公司基本面恶化，否则不要恐慌抛出好股票。",
  },

  /* ---------- 第3章 ---------- */
  {
    id:"ch3", part:"第一部 · 投资准备", nav:"基金选择之道", num:"03",
    cn:"基金选择之道", en:"CH.3 · A TOUR OF THE FUND HOUSE",
    thesis:"没时间选股就买基金——但要懂得如何配置股债、如何挑选并长期持有不同风格的好基金。",
    body:[
      "美国基金的数量已超过纽交所 + 美交所的股票总数，挑基金成了新烦恼。林奇受邀帮一家非营利机构重设组合，第一步、也是最重要的一步：<span class='gem'>定股债比例</span>——他强调多数人债券太多、股票太少。",
      "富达数量分析师贝克威特的测算颇为激进：哪怕你需要固定收益，也未必要买债券。把 10 万全投股息率 3% 的股票、每年取 7000 美元生活，20 年后本金反而增到 <span class='gem'>34.9 万</span>；即使开局就跌 25%，20 年后仍约 18.5 万，仍胜过债券。",
      "债券部分：不要买国债基金（白交管理费），要买就直接向财政部买——这就是林奇第 5 法则。被忽视的好东西是可转换债券基金，能“既享成长又抗跌”。",
      "股票基金：75% 跑不赢大盘，指数基金长期占优——这是林奇第 6 法则。但与其在数百只基金里大海捞针，不如组建一支 <span class='gem'>“全明星队”</span>：把钱等分 6 份，覆盖资本增值 / 成长 / 价值 / 小盘成长 / 特殊情况 / 公用事业或混合等不同风格，长期持有，让其中的超级明星弥补平庸者。",
      "比较基金必须<span class='em'>“同类比同类”</span>（价值比价值）；别根据历史业绩追涨杀跌（研究表明追最佳 3/5 年业绩几乎都跑输）；用《福布斯》名人堂的牛熊评级挑选更靠谱。新地平线基金的相对市盈率，是判断小盘股贵贱的晴雨表（接近 2.0 就该回避小盘股）。海外的国家基金则要逆向、要耐心，最佳买点是普遍不被看好、折价 20–25% 时（德国基金就是教训）。",
    ],
    hl:[
      { l:"最深远的决策", t:"股债比例，决定一个家庭未来财富的<b>上限</b>" },
      { l:"不必买国债基金", t:"直接向财政部买，<b>省下管理费</b>，收益更高" },
      { l:"全明星队", t:"等分 <b>6 份</b>，覆盖不同风格，长期持有" },
      { l:"挑基金的尺子", t:"看《福布斯》<b>牛熊评级</b>，别追历史业绩" },
    ],
    viz:"funds",
    law:{ n:6, text:"既然要选择一只基金，就一定要选择一只业绩优秀的好基金。" },
    take:"最大化股票比例；同类比同类；分散于 <b>3–4 种不同风格</b> 的好基金并长期持有。频繁切换基金要交高额成本与税，得不偿失。",
  },

  /* ---------- 第4章 ---------- */
  {
    id:"ch4", part:"第二部 · 麦哲伦回忆录", nav:"麦哲伦 · 初期", num:"04",
    cn:"麦哲伦基金选股回忆录：初期", en:"CH.4 · MANAGING MAGELLAN · THE EARLY YEARS",
    thesis:"灵活，是选股的关键。麦哲伦的成功不靠小盘成长股，而靠在任何角落寻找被低估的好公司。",
    body:[
      "麦哲伦 1963 年由内德·约翰逊创立（原名富达国际投资基金），因肯尼迪对海外投资征税转为国内基金，又因熊市萎缩，1976 年与连年亏损的艾塞克斯基金合并（带来 5000 万美元的税收抵减）。1977 年林奇接手时，规模仅 <span class='em'>1800 万美元</span>、客户流失、且基金封闭无法吸收新客户。",
      "林奇说这段封闭期反而是好事——让他安静学习、犯错而不被围观。他像一只“猎犬”靠嗅觉一家家搜寻，<span class='em'>从没有全盘策略</span>，更关心一个公司“故事”的细节，而非行业配置比例。塔可钟简陋得像车库的总部，让他总结出林奇第 7 法则。",
      "真正赚钱的是反直觉的选择：一只 2000 万的小基金，竟重仓优尼科、皇家荷兰等大型石油反转股，还买过公用事业、丧葬连锁。他强调：<span class='gem'>从未把一半以上资金投在成长股上</span>。",
      "这一时期最肥的矿是地区性银行股——市场误以为银行是低增长的“公用事业”，给了像 NBD、瓦乔维亚、五三银行这样连年 15% 增长的银行<span class='em'>极低的市盈率</span>（林奇发现：名字越难听，越可能被低估）。当一个好公司市盈率只有 3–6 倍时，几乎不可能亏钱。前 4 年净值涨 4 倍、连续跑赢大盘，客户却还在赎回。",
    ],
    hl:[
      { l:"猎犬式选股", t:"不做全盘策略，<b>一家家</b>嗅出被低估的好公司" },
      { l:"第 7 条林奇法则", t:"办公室越<b>简陋</b>，管理层越愿回报股东" },
      { l:"名字越难听", t:"五三银行、瓦乔维亚……<b>越冷门越低估</b>" },
      { l:"安全边际", t:"好公司市盈率只有 <b>3–6 倍</b>时，几乎不会亏" },
    ],
    viz:"magellan",
    law:{ n:7, text:"公司办公室的奢华程度与公司管理层回报股东的意愿成反比。" },
    take:"别把自己锁进一种风格。<b>哪里被低估，就去哪里</b>——周期股、银行股、反转股，常比热门成长股涨得更多。",
  },

  /* ---------- 第5章 ---------- */
  {
    id:"ch5", part:"第二部 · 麦哲伦回忆录", nav:"麦哲伦 · 中期", num:"05",
    cn:"麦哲伦基金选股回忆录：中期", en:"CH.5 · MAGELLAN · THE MIDDLE YEARS",
    thesis:"投资是 99% 的汗水加 1% 的灵感。关注公司，而不是关注股票。",
    body:[
      "林奇的一天从清晨 6:05 开始（搭放射科医生夫妇的顺风车，在后座借小灯读年报）。他自陈在交易上浪费了太多时间——每天一小时，其实 10 分钟就够，省下的时间该多给公司打两个电话。成功的关键是 <span class='gem'>“关注公司，而非股票”</span>，他甚至把不断跳动的报价机关掉，以免分心。",
      "他的研究像记者：大量阅读公开信息 → 从分析师和公司 IR 处找线索 → 直接给公司打电话、实地拜访，并把每次交流记进活页本（公司名、当时股价、一两行摘要）。<span class='em'>“如果你不记下来，过段时间就忘了当初为什么买。”</span>",
      "麦哲伦不是独角戏：从 1981 年起他有一连串能干的助理（后来都成了著名基金经理），充分授权让他“长出三头六臂”。富达的革命性文化是 <span class='gem'>“基金经理自己做研究、自己负责”</span>，与分析师研究形成双重研究，互相推诿无处遁形。",
      "每周投资例会：他用计时器把每人发言压到 <span class='em'>90 秒</span>——“讲清一只股票，要让五年级学生听得懂、又不会听厌”。会上不许互相反驳，以保护发言者的独立判断（克莱斯勒 5 美元被全场嘲笑、后涨到 30 的故事，说明别让别人的批评动摇你的研究）。",
      "1981 年合并塞拉姆基金后重新开放；上路易斯·鲁凯泽的电视节目后申购暴增，1982 年底规模冲到 4.5 亿。一个反直觉的现象贯穿始终：<span class='em'>基金越大，他越偏向买较小的公司</span>。",
    ],
    hl:[
      { l:"时间分配", t:"交易 <b>10 分钟</b>足矣，省下时间多打两个公司电话" },
      { l:"笔记本", t:"记下买入理由，否则<b>很快就忘</b>为何持有" },
      { l:"90 秒法则", t:"讲清一只股票，要<b>五年级学生</b>都能懂" },
      { l:"双重研究", t:"经理研究 + 分析师研究，且<b>自己负全责</b>" },
    ],
    viz:null,
    law:null,
    take:"把精力从盯盘转向<b>理解公司</b>；为每只股票建一个笔记本，写清买入与卖出的理由——这是普通人也能复制的纪律。",
  },

  /* ---------- 第6章 ---------- */
  {
    id:"ch6", part:"第二部 · 麦哲伦回忆录", nav:"麦哲伦 · 晚期", num:"06",
    cn:"麦哲伦基金选股回忆录：晚期", en:"CH.6 · MAGELLAN · THE LATER YEARS",
    thesis:"持股再多，只要每一只都被理解，大基金照样能战胜市场。控制亏损，永不为濒死公司接盘。",
    body:[
      "1983 年麦哲伦持有 900 只股票、后来多达 <span class='em'>1400 只</span>，被讥为“地球上最大的指数基金”。林奇反击：富有想象力的经理能挑出大量“飞离雷达”的与众不同的股票（比如 300 只储贷 + 250 只零售、却一只石油都没有），下跌时反而上涨——这就是林奇第 9 法则。其中 700 只小仓位加起来不到总资产 10%，是“以后看看再说”的观察仓。",
      "一个小仓位常引出大机会：珠宝供应商简·贝尔来访时提到，最大客户是好市多、PACE 等折扣店、订货多到要加班。林奇顺藤摸瓜调研折扣店——华尔街当时无人覆盖——买入<span class='gem'>好市多</span>等，大赚（好市多涨 3 倍）。",
      "这一时期真正让麦哲伦出类拔萃的，不是银行 / 储贷，而是<span class='em'>汽车股</span>：福特、克莱斯勒各赚超 1 亿，沃尔沃赚 7900 万。他偏好“自下而上”精选个股，而非“自上而下”赌行业配置——同样看好汽车，掷飞镖的人可能买了平庸的通用，而错过涨 17 倍的福特和近 50 倍的克莱斯勒。",
      "流动性恐惧被高估：99% 的股票日成交低于 1 万股，担心流动性等于把自己限制在 1% 的股票里。“选股像选伴侣，离婚是否容易，不该是结婚前考虑的因素。”",
      "控制亏损是关键：他赔钱的股票数目比赚钱的还多，但<span class='gem'>绝不增持濒临破产的公司</span>（林奇第 13 法则）。最惨的是得州航空（亏 3300 万）和新英格兰银行——后者的债券从面值 100 跌到 20，是“股票更不值钱”的强烈警示。高科技股则自始至终一直让他赔钱。",
    ],
    hl:[
      { l:"第 9 条林奇法则", t:"并非所有普通股都一样普通——<b>想象力</b>造就超额收益" },
      { l:"小仓位的价值", t:"简·贝尔的一句话，引出<b>好市多</b>等折扣店大牛股" },
      { l:"真正的功臣", t:"<b>福特、克莱斯勒、沃尔沃</b>——而非银行或成长股" },
      { l:"债券是警报", t:"新英格兰银行债券跌到 <b>20% 面值</b>，股票更危险" },
    ],
    viz:null,
    law:{ n:13, text:"当一家公司即将灭亡时，千万不要押宝公司会奇迹般起死回生。" },
    take:"看错不丢人，<b>死扛恶化的基本面才丢人</b>。永不为濒死公司接盘；想买摇摇欲坠的低价股前，先看它的债券价格。",
  },

  /* ---------- 第7章 · 方法论总纲 ---------- */
  {
    id:"ch7", part:"第三部 · 选股方法论", nav:"艺术·科学·调研", num:"07",
    cn:"艺术、科学与调研", en:"CH.7 · ART, SCIENCE, AND LEGWORK",
    thesis:"选股 = 艺术 + 科学 + 调查研究。没有一用就灵的公式；判断贵贱，看股价线与收益线。",
    body:[
      "全书后半占一半篇幅，逐一记录 1992 年向《巴伦》推荐的 21 只股票的选股过程，正是要说明：<span class='em'>选股无法简化为公式</span>。只迷信数量分析的人钻进报表出不来（否则数学家会是世界首富）；只迷信“灵感”的人则在玩火。林奇的方法二十年不变——艺术 + 科学 + 调研。",
      "他批评专业投资者忽视调研：花大钱买各种信息终端、抢看别人的动向，却不肯自己实地研究。<span class='gem'>“相信我，沃伦·巴菲特从来不用这些玩意儿。”</span>",
      "翻石头找虫子：他推荐的股票数量逐年下降（1986 年 100+、1987 年达 226 只，退休后只推 21 只），因为业余者根本不需要找 50–100 只，<span class='em'>十年里找到两三只大牛股就够</span>——在 5 股原则下，只要一只涨 10 倍、其余不涨，组合也能涨 3 倍。",
      "心态：1992 年初大盘狂欢，他却沮丧——牛市里到处是贵货，熊市里到处是便宜货。<span class='gem'>“股价大跌而被严重低估，才是选股者真正的最佳机会。”</span>年底避税抛售 + 一月效应（小盘股 1 月平均涨 6.86% vs 大盘 1.6%）是简单的赚钱窗口。",
      "核心工具：看股价线与收益线<span class='em'>并列</span>的走势图。股价线 ≈ 或低于收益线 → 可买；远高于收益线 → 危险，要么横盘要么回调（他据此判断菲利普莫里斯、雅培、沃尔玛、百时美等大盘成长股已高估，可能跌 30%）。把每家公司当成一部连续的长篇故事，不断核查最新发展——复查 1991 年的 21 只推荐时，他据季报里一行小字（EQK 绿地考虑取消连续提息）果断剔除：连续提息的公司突然为省小钱破例，是危险信号。",
    ],
    hl:[
      { l:"三位一体", t:"艺术 + 科学 + <b>调查研究</b>，缺一不可" },
      { l:"翻石头", t:"十年找到 <b>两三只大牛股</b>就够；5 股原则即可" },
      { l:"最佳时机", t:"<b>大跌而被低估</b>时，才是选股者的良机" },
      { l:"一月效应", t:"小盘股 1 月平均涨 <b>6.86%</b> vs 大盘 1.6%" },
    ],
    viz:"priceEarn",
    law:null,
    take:"判断一只大盘成长股贵不贵，把<b>股价线和收益线</b>放在一起看就够了。把每只股票当成持续更新的故事，定期复查，不带情绪。",
  },

  /* ---------- 第8章 ---------- */
  {
    id:"ch8", part:"第三部 · 21 个案例", nav:"零售业", num:"08",
    cn:"零售业选股之道：边逛街边选股", en:"CH.8 · STALKING THE TENBAGGER · RETAIL",
    thesis:"购物中心是最好的研究室——你喜欢的店，可能就是你该买的股票。",
    body:[
      "林奇直奔伯灵顿购物中心——他灵感最多的“福地”。购物中心是上市公司激烈竞争的战场，<span class='em'>逛一天胜过参加一个月的投资研讨会</span>。1986 年在家得宝、Limited、盖普、沃尔玛这 4 只人人皆知的零售股上投 1 万，5 年变 5 万。",
      "一路上的店勾起他买卖过的零售股回忆：玩具反斗城涨 144 倍；Tandy（Radio Shack）十年涨 100 倍；Chili's 辣餐厅（代码 EAT）他自作聪明地错过了；艾姆斯百货则提醒他——股价能跌到零。",
      "关键不是闲逛，而是把许多有潜力的公司一排排摆在一起逐一调研。普通消费者比华尔街<span class='gem'>更早</span>看到哪家店火、哪家在衰落，这就是信息优势。",
    ],
    hl:[
      { l:"购物中心", t:"逛一天 > 一个月研讨会——<b>最好的调研现场</b>" },
      { l:"消费者优势", t:"你比华尔街<b>更早</b>看到哪家店火" },
    ],
    cases:[
      { nm:"家得宝 / 盖普 / 沃尔玛", sub:"HD · GPS · WMT", ds:"4 只人尽皆知的零售股，5 年涨 5 倍" },
      { nm:"玩具反斗城", sub:"Toys R Us", ds:"从 25 美分涨到 36 美元，约 144 倍" },
      { nm:"Chili's 辣餐厅", sub:"TICKER: EAT", ds:"孩子力荐、却被林奇错过的大牛股" },
    ],
    viz:null,
    law:{ n:14, text:"如果你喜欢一家上市公司的商店，可能你也会喜欢上这家公司的股票。" },
    take:"把你常去、口碑好的店当成选股线索；但喜欢之后仍要<b>研究基本面</b>，再决定买入。",
  },

  /* ---------- 第9章 ---------- */
  {
    id:"ch9", part:"第三部 · 21 个案例", nav:"房地产", num:"09",
    cn:"房地产业选股之道：从利空消息中寻宝", en:"CH.9 · PROSPECTING IN BAD NEWS",
    thesis:"当媒体把“商业地产崩盘”说成“房地产崩盘”，被错杀的优质公司就是金矿。",
    body:[
      "1991 年底人们最怕房地产股。但报纸次要版面一则小消息引起林奇注意：美国中等住宅价格自 1968 年有统计以来<span class='gem'>一直在涨</span>（89、90、91 连涨）。媒体只报商业地产崩盘，却抹掉“商业”二字，让大众误以为整个市场崩了。",
      "那些不引人注意却有力的数据（中等房价、购房能力指数、抵押呆账率）表明：行业没那么糟。屡试不爽的策略是——等媒体把某行业从“不景气”说成“非常不景气”时，大胆买入行业里<span class='em'>竞争力最强</span>的公司。（但要有数据支撑：1984 年赌石油气反转，就赌错了。）",
      "他买入财务稳健的住宅建筑商托尔兄弟（从 12.6 跌到 2.4，一只“下跌 5 倍”的股票），并发掘了 Pier 1、阳光地带园艺等。内部人买入，是个好信号。",
    ],
    hl:[
      { l:"小字里的真相", t:"中等房价<b>一直在涨</b>——媒体却只喊崩盘" },
      { l:"逆向时机", t:"媒体从“不景气”喊到“非常不景气”时<b>买最强者</b>" },
    ],
    cases:[
      { nm:"托尔兄弟", sub:"Toll Brothers", ds:"财务稳健的建筑商，被错杀到 2.4 美元" },
      { nm:"Pier 1 / 阳光地带园艺", sub:"Pier 1 · Sunbelt", ds:"房地产恐慌中挖到的宝" },
    ],
    viz:null,
    law:{ n:15, text:"当你发现公司内部人士买入自家公司股票时，这就是个很好的买入信号。" },
    take:"别被头条吓住。<b>用真实数据</b>穿透情绪，在最恐惧的行业里挑财务最稳、能熬过寒冬的龙头。",
  },

  /* ---------- 第10章 ---------- */
  {
    id:"ch10", part:"第三部 · 21 个案例", nav:"超级剪理发记", num:"10",
    cn:"超级剪理发记", en:"CH.10 · MY CLOSE SHAVE AT SUPERCUTS",
    thesis:"亲身体验一家公司，是最朴素也最可靠的调研。低端服务业里藏着连锁特许的大机会。",
    body:[
      "为调研刚上市的超级剪（代码 CUTS），林奇特意没找老朋友温尼，去波士顿的分店理了次发，边等边读招股说明书——<span class='gem'>“在一家公司的店里研究这家公司，是利用等候时间最有意义的方式。”</span>",
      "行业洞察：理发是个 150–400 亿美元的大市场，却被低效的夫妻店主导，而有执照理发师在减少（纽约 10 年减半），头发却<span class='em'>每月都长</span>——巨大的市场空白，正待规范化的全国连锁去填补。这与他多年前看到的殡葬连锁取代夫妻店如出一辙。",
      "新管理层请来擅长特许扩张的费伯（原电脑天地总裁），已开到 650 家店。一个发型师每小时剪 2.8 人，符合 90 年代“没有拖延、没有废话”的快餐式效率文化。",
    ],
    hl:[
      { l:"亲身调研", t:"在店里<b>边理发边读招股书</b>——最朴素的研究" },
      { l:"市场空白", t:"理发师在减少，头发<b>每月都长</b>——连锁的机会" },
    ],
    cases:[
      { nm:"超级剪", sub:"TICKER: CUTS", ds:"650 家特许连锁，管理层擅长扩张" },
      { nm:"国际服务公司", sub:"SCI", ds:"殡葬连锁取代夫妻店的同类故事" },
    ],
    viz:null,
    law:null,
    take:"好生意常藏在<b>不起眼的低端服务业</b>里；把“用户体验”变成你的第一手研究。",
  },

  /* ---------- 第11章 ---------- */
  {
    id:"ch11", part:"第三部 · 21 个案例", nav:"沙漠之花", num:"11",
    cn:"沙漠之花：低迷行业中的卓越公司", en:"CH.11 · BLOSSOMS IN THE DESERT",
    thesis:"在低迷、无聊、被嫌弃的行业里，寻找高效率、低负债、不断扩大份额的卓越公司。",
    body:[
      "林奇任何时候都更爱低迷行业而非热门行业。热门行业引来太多竞争者，谁也赚不到钱；低迷行业里弱者出局，幸存者份额越滚越大——这就是林奇第 16 法则：竞争不如垄断。",
      "这些“沙漠之花”有共同特征：<span class='gem'>成本极低、管理层吝啬、几乎不借债、没有森严等级、员工持股</span>。它们在大公司忽略的利基市场里形成局部垄断，增长甚至快过热门行业。",
      "案例：俄亥俄阳光电器——中部唯一的大型折扣家电连锁，负债不到 1000 万，年增 25–30%，市盈率仅 15 倍，而对手在苦苦挣扎。总裁电话一拨就通，说明没有官僚体制（这又印证了林奇第 17 法则：选年报彩照最少的那家）。",
    ],
    hl:[
      { l:"第 16 条林奇法则", t:"竞争不如<b>完全垄断</b>——低迷行业的卓越者" },
      { l:"沙漠之花的特征", t:"<b>低成本、低负债、员工持股</b>、局部垄断" },
    ],
    cases:[
      { nm:"阳光电器", sub:"Sun TV & Appliances", ds:"中部唯一大型折扣家电连锁，15 倍市盈率、年增 30%" },
    ],
    viz:null,
    law:{ n:16, text:"在商场上竞争绝对不如完全垄断。" },
    take:"别追热门赛道的拥挤竞争；去<b>没人看的角落</b>，找那家又抠门又高效、悄悄垄断利基的好公司。",
  },

  /* ---------- 第12章 ---------- */
  {
    id:"ch12", part:"第三部 · 21 个案例", nav:"储贷协会", num:"12",
    cn:"储蓄贷款协会选股之道", en:"CH.12 · IT'S A WONDERFUL BUY · S&Ls",
    thesis:"行业被丑闻吓退时，正是机会。要把“坏蛋”“贪婪鬼”和“节俭的老实人”区分开。",
    body:[
      "储贷协会（S&L）是当时谁都不敢碰的股票：5000 亿美元救助、675 家倒闭、丑闻满天飞。但林奇指出——<span class='em'>很多健康的储贷协会经营得非常好</span>，资本充足率甚至高过摩根（全美有 100 多家超过摩根的 5.17%）。",
      "他把储贷协会分三类：① <span class='em'>诈骗犯</span>（用 100 万股本撬动 1900 万存款放贷、贷前扣佣做高账面盈利、循环膨胀，最后行贿、买飞机、进口大象——多为非上市私人公司）；② <span class='em'>贪婪鬼</span>（本来稳健，看别人暴富眼红，盲目扩张把好事弄砸）；③ <span class='gem'>吉米·斯图尔特式的节俭老实人</span>（真正值得投资的那类）。",
      "当一个行业被所有人厌烦、连分析师都懒得看时，正是最佳买点——这就是林奇第 18 法则。",
    ],
    hl:[
      { l:"反差真相", t:"最强储贷的资本充足率<b>高过摩根</b>" },
      { l:"三类公司", t:"诈骗犯 / 贪婪鬼 / <b>节俭老实人</b>——只买第三类" },
    ],
    cases:[
      { nm:"大众储蓄银行 等", sub:"Glacier / People's Heritage…", ds:"资本充足率高达 12.5% 的节俭型典范" },
    ],
    viz:null,
    law:{ n:18, text:"分析师都感厌烦之日，正是最佳买入之时。" },
    take:"丑闻笼罩整个行业时，别一竿子打翻——<b>分清优劣</b>，买进财务最干净、最保守的那一类。",
  },

  /* ---------- 第13章 ---------- */
  {
    id:"ch13", part:"第三部 · 21 个案例", nav:"近观储贷", num:"13",
    cn:"近观储蓄贷款协会", en:"CH.13 · A CLOSER LOOK AT THE S&LS",
    thesis:"打电话给公司，是普通人也能用的信息优势。先建立关系，再问实质问题。",
    body:[
      "这一章是林奇亲自打电话调研 6 家储贷协会的实录。他的选股策略很简单：按标准选 5 家、等额买入、耐心等待——<span class='gem'>假定 1 家超预期、3 家符合预期、1 家稍差，总体仍可能胜过买高估的可口可乐或默克</span>。",
      "他乐于为打电话花钱（电话账单贵些，长远值得），通常找总裁或 CEO。技巧是先聊旅游、高尔夫、地名海拔等闲话建立友善关系，再切入“你们打算收购还是维持规模”“第三季度会怎样”等实质问题。<span class='em'>直接问“明年赚多少”必然碰壁。</span>",
      "他偏爱古朴的公司名（卡利斯佩尔第一联邦），警惕把“bank”改成时髦“Bancorp”的虚张声势。冰河银行从一家储蓄机构借了过多商业贷款——这类不愿看到的消息，不查证绝不买入。",
    ],
    hl:[
      { l:"5 家策略", t:"选 5 家等额买入：1 超预期、3 达标、1 稍差，<b>总体仍赢</b>" },
      { l:"打电话的艺术", t:"<b>先闲聊建立关系</b>，再问实质问题" },
    ],
    cases:[
      { nm:"冰河银行", sub:"Glacier Bancorp", ds:"商业贷款过多——林奇的“不愿看到”信号" },
    ],
    viz:null,
    law:null,
    take:"你也可以拿起电话调研——<b>先做功课、先暖场</b>，问对问题，把二手信息变成一手判断。",
  },

  /* ---------- 第14章 ---------- */
  {
    id:"ch14", part:"第三部 · 21 个案例", nav:"业主有限合伙", num:"14",
    cn:"业主有限合伙公司：做有收益的交易", en:"CH.14 · MASTER LIMITED PARTNERSHIPS",
    thesis:"名字老土、要多填几张税表、被基金经理嫌弃——正因如此，这类高分红公司常有便宜捡。",
    body:[
      "MLP 背着历史包袱（早年的避税合伙骗局），连优秀的也被连累、被基金经理回避，价格因而被压低——林奇说：“如果能让它们更不受欢迎，<span class='em'>我回答梵文问题都愿意</span>。”",
      "它们业务朴实（波士顿凯尔特人、油气管道、家政保洁、汽车零部件、游乐场、购物中心），名字浪漫老派，但组织复杂、要额外书面工作，只有有想象力又有耐心的少数人能拿到奖赏。最大特点是把收入几乎<span class='gem'>全部分给股东</span>，分红率高得罕见。",
      "案例：EQK 绿地（萨达姆股市大挫后跌到 9.75、收益率 13.5%，却比垃圾股安全）、雪松娱乐（游乐场，收益率 11%）、太阳批发、特纳拉等。",
    ],
    hl:[
      { l:"越嫌弃越便宜", t:"基金经理回避 = <b>价格被压低</b>" },
      { l:"高分红", t:"收入<b>几乎全部分给股东</b>，分红率罕见地高" },
    ],
    cases:[
      { nm:"EQK 绿地", sub:"EQK Green Acres", ds:"长岛购物中心，收益率 13.5%" },
      { nm:"雪松娱乐", sub:"Cedar Fair", ds:"游乐场 MLP，收益率约 11%" },
    ],
    viz:null,
    law:null,
    take:"愿意忍受“麻烦”和“老土”的人，常能在被忽视的高分红 MLP 里找到<b>物超所值</b>的标的。",
  },

  /* ---------- 第15章 ---------- */
  {
    id:"ch15", part:"第三部 · 21 个案例", nav:"周期股", num:"15",
    cn:"周期性公司：冬天到了，春天还会远吗", en:"CH.15 · THE CYCLICALS",
    thesis:"周期股要反着读市盈率——低 P/E 往往是顶，高 P/E 往往是底。没有相关行业经验，别轻易碰。",
    body:[
      "钢铁、铝、纸、汽车、化工、航空随经济繁荣萧条起落，像四季一样可靠。诀窍是<span class='em'>在大众行动前先一步</span>重新买入。",
      "关键认知：对普通股低市盈率是好事，对周期股却相反。周期股市盈率很低，往往意味着<span class='em'>盈利接近顶峰、即将转跌</span>，粗心者会被“看起来便宜”诱入而资金腰斩；而高市盈率（甚至亏损），往往出现在<span class='gem'>谷底、复苏前夜</span>。",
      "风险最大的是买太早、受挫后又急着抛出。有相关行业经验更有胜算——“如果你是水暖工、清楚铜管价格，买费尔普斯-道奇的胜算比 MBA 高。”林奇正是问了自家水暖工、确认铜价回升，才买入这只一年原地踏步的铜业股（铜比铝稀缺、是消耗性资产）。这引出林奇第 19 法则：悲观毫无裨益。",
    ],
    hl:[
      { l:"市盈率悖论", t:"周期股：<b>低 P/E 危险，高 P/E 是机会</b>" },
      { l:"经验即优势", t:"懂铜管的水暖工，胜过<b>只看“便宜”</b>的 MBA" },
    ],
    cases:[
      { nm:"费尔普斯-道奇", sub:"Phelps Dodge", ds:"问过水暖工、确认铜价回升后买入" },
    ],
    viz:"cyclical",
    law:{ n:19, text:"除非你是沽空投资者，或者是寻觅富婆的诗人，否则悲观毫无裨益。" },
    take:"买周期股要在<b>谷底、最坏处</b>下手；读懂它的市盈率信号，最好用你熟悉的行业知识踏准节奏。",
  },

  /* ---------- 第16章 ---------- */
  {
    id:"ch16", part:"第三部 · 21 个案例", nav:"核电 · CMS", num:"16",
    cn:"困境中的核电站：CMS 能源公司", en:"CH.16 · NUCLEAR POWER · CMS ENERGY",
    thesis:"受政府监管的困境公用事业，几乎一定会被救活——这是困境反转里风险最低的一类。",
    body:[
      "公用事业曾是优秀成长股，如今主要靠分红，但板块里仍有大赢家（南方公司、费城电力等翻数倍）。林奇常把它当利率周期信号，在降息 + 经济不景气时短暂配置约 10%。",
      "他最成功的是投资“困境中”的公用事业：三里岛事故后的通用公用事业、长岛电力、墨西哥湾诸州、原中南（后改名恩特奇）……这引出林奇第 20 法则：公司改名，要么结婚，要么想让你忘掉一场惨败。",
      "之所以业绩好，因为受政府监管：公司可破产、可停发分红，但<span class='gem'>“只要人们需要电，就必须找到让它继续运行的办法”</span>，州政府有强动力出资救助。分析师总结出清晰的 4 阶段周期（灾难 → 危机 → 稳定 → 恢复），股价从跌 40–80% 到反弹 4–5 倍，留给逆向者很长的获利窗口。",
    ],
    hl:[
      { l:"监管即护城河", t:"只要人们<b>还需要电</b>，公司就有人救" },
      { l:"第 20 条林奇法则", t:"公司改名：要么结婚，<b>要么想让你忘掉惨败</b>" },
    ],
    cases:[
      { nm:"CMS / 通用公用事业", sub:"CMS · GPU", ds:"三里岛之后困境反转，股东大赚" },
    ],
    viz:"utility",
    law:{ n:20, text:"像人一样，公司因为两个原因而更改名称：要么是结婚了，要么是卷入了某个它们希望公众将会忘却的惨败中。" },
    take:"在“公众恐惧 + 政府兜底”的交集里找机会；<b>困境公用事业</b>是反转投资中胜率最高的一类。",
  },

  /* ---------- 第17章 ---------- */
  {
    id:"ch17", part:"第三部 · 21 个案例", nav:"私有化 · 英国女王", num:"17",
    cn:"山姆大叔的旧货出售：联合资本 II 公司", en:"CH.17 · UNCLE SAM'S GARAGE SALE",
    thesis:"政府出售国有资产（私有化）时，定价往往刻意让买家几乎不会亏——见到就买。",
    body:[
      "私有化很奇怪：把公众的东西卖给公众。但对买家通常是好买卖——因为买家就是<span class='em'>选民</span>，政府为了连任，不想让大批投资者亏钱牢骚满腹。英国 1983 年因 BP、阿姆斯罕姆定价过高挨批后吸取教训，此后定价让投资者几乎不可能亏（英国电信一天涨一倍，300 万人抢购）。这就是林奇第 21 法则：不管英国女王卖什么，买！",
      "案例：英国自来水公司——清一色的<span class='gem'>垄断企业</span>，政府先替它们还掉大部分债务、再附送“嫁妆”资金，无债上市；水费太低、提价也没人能反对（总不能不用水）。还能分期付款认购（“部分支付股”：先付 40% 首付，涨上去就翻倍），首年就派股价 8% 的红利。",
      "麦哲伦从英国电信、英国航空的私有化里都赚过大钱。",
    ],
    hl:[
      { l:"买家即选民", t:"政府不想<b>得罪投资者</b>，定价偏向买家" },
      { l:"垄断 + 嫁妆", t:"自来水公司<b>无债上市</b>，政府还附送启动资金" },
    ],
    cases:[
      { nm:"英国电信", sub:"British Telecom", ds:"一天涨一倍，300 万人抢购" },
      { nm:"英国自来水公司", sub:"UK Water", ds:"垄断、无债、可分期、首年派息 8%" },
    ],
    viz:null,
    law:{ n:21, text:"不管英国女王在卖什么，买！" },
    take:"留意各国<b>国企私有化</b>的发行——尤其是带垄断属性、政府已替其减负的公司，初期常是低风险好买卖。",
  },

  /* ---------- 第18章 ---------- */
  {
    id:"ch18", part:"第三部 · 21 个案例", nav:"房利美纪事", num:"18",
    cn:"我的房利美公司纪事", en:"CH.18 · MY FANNIE MAE DIARY",
    thesis:"看懂一家公司“从坏变好”的转型并持之以恒，一只股票就能创造一个基金的传奇收益。",
    body:[
      "林奇连续 6–7 年向《巴伦》推荐房利美。它在麦哲伦最后 3 年是<span class='em'>第一大重仓</span>（市值达 5 亿），仅这一只股票及权证，就为富达及其客户赚了<span class='gem'>超过 10 亿美元</span>——他笑称要去申报吉尼斯纪录。",
      "它的转型不是一眼看穿的：房利美靠“短借长贷”赚利差，利率上升时巨亏（1974 年从 9 美元跌到 2 美元），倒闭谣言四起。1981–82 年公司悄悄完成关键转型（锁定长期固定利差、降低利率敏感度），少数人（如分析师施奈德）注意到“它会变成你乐于带回家见父母的姑娘”。",
      "要点：一个超预期的公司，首先价值必须被<span class='em'>严重低估</span>；当市场比你悲观得多时，你必须不断核实真相、确保自己没有盲目乐观；事物总在变好或变坏，要紧随变化调整。林奇凭 2 亿投资拿到 6 倍收益。",
    ],
    hl:[
      { l:"一只股的传奇", t:"房利美单只股票为富达赚 <b>逾 10 亿美元</b>" },
      { l:"看懂转型", t:"市场只记得旧房利美，<b>看不见崛起的新房利美</b>" },
    ],
    cases:[
      { nm:"房利美", sub:"Fannie Mae", ds:"短借长贷 → 锁定利差，2 亿投资赚 6 倍" },
    ],
    viz:null,
    law:null,
    take:"当一家被低估的公司正在<b>把基本面从坏改好</b>，而市场还沉浸在旧印象里——这就是你该重仓并长期持有的时刻。",
  },

  /* ---------- 第19章 ---------- */
  {
    id:"ch19", part:"第三部 · 21 个案例", nav:"基金公司", num:"19",
    cn:"后院宝藏：共同基金之康联集团", en:"CH.19 · TREASURE IN THE BACKYARD",
    thesis:"淘金热里，卖镐和铲的人比淘金者赚得多——基金大盛时，买基金公司的股票常胜过买它的基金。",
    body:[
      "林奇坦承自己一度“只见森林不见树木”，忽略了华尔街表现最好的群体之一——<span class='em'>基金管理公司</span>（德莱弗斯、弗兰克林、康联、普莱斯、道富、伊顿范斯……）。",
      "道理：利率下降时，资金涌入股债基金，管理公司利润大增；德莱弗斯靠货币基金，利率上升时反而繁荣——不同公司在不同利率环境受益。1987 年崩盘后人们怕基金业崩溃，事后证明杞人忧天，正好给了便宜买入的机会。",
      "他懊恼 1987 和 1991 两次错过（弗兰克林 1991 涨 75%、普莱斯 116%……），自我辩解曾推荐过凯普尔（保险子公司好转带动经纪业务）。<span class='gem'>“淘金热里，卖镐铲的人赚得更多。”</span>",
    ],
    hl:[
      { l:"卖镐铲的人", t:"基金大盛，<b>管理公司</b>比基金本身更赚" },
      { l:"利率分化", t:"降息利好股债基金公司，升息利好<b>货币基金公司</b>" },
    ],
    cases:[
      { nm:"弗兰克林 / 普莱斯 / 康联", sub:"BEN · TROW · CGI", ds:"1991 年分别涨 75% / 116% / 40%" },
    ],
    viz:null,
    law:null,
    take:"顺着一个繁荣趋势往上游看——常常是<b>“卖工具”的公司</b>（平台、管理方）赚得最稳、最多。",
  },

  /* ---------- 第20章 ---------- */
  {
    id:"ch20", part:"第三部 · 21 个案例", nav:"餐饮股", num:"20",
    cn:"餐饮股：把资金投到你的嘴巴所到之处", en:"CH.20 · STOCKS THAT TASTE GOOD",
    thesis:"成长型连锁餐饮可以像伟大成长股一样长期复利——而你天天在吃，比华尔街更早看到。",
    body:[
      "餐饮业自 60 年代随汽车文化崛起，新连锁不断取代旧餐厅。林奇职业生涯第一个关注的公司，就是肯德基（由濒临破产的乡村饭馆转型而来）。",
      "当年华尔街嘲笑“卖甜甜圈汉堡的能比‘漂亮 50’？”——结果 Dunkin' 涨 168 倍、Bob Evans 涨 83 倍、<span class='gem'>麦当劳涨 400 倍</span>（当代回报最高的股票之一）。在这 5 只上各投 1 万，80 年代末身家超 200 万；全押麦当劳超 400 万。",
      "各类餐厅（汉堡、自助、牛排、冰淇淋、比萨、地方 / 国际风味……）几乎都有上市巨头，而消费者最清楚哪家火、哪家有扩张空间。塔可钟 1972 熊市跌到 1 美元后反弹到 40，被百事收购（百事爱收餐饮以带动饮料）。林奇 1992 年没推荐任何餐饮股——“我本该推荐的。”",
    ],
    hl:[
      { l:"长期复利", t:"麦当劳涨 <b>400 倍</b>，Dunkin' 168 倍" },
      { l:"你的优势", t:"你<b>天天在吃</b>，比华尔街更早看到哪家会扩张" },
    ],
    cases:[
      { nm:"麦当劳", sub:"McDonald's", ds:"当代回报最高的股票之一，持续创新 + 海外扩张" },
      { nm:"塔可钟", sub:"Taco Bell", ds:"1972 跌到 1 美元，反弹到 40 后被百事收购" },
    ],
    viz:null,
    law:null,
    take:"成长型连锁（餐饮 / 零售）是普通人最容易看懂的<b>长跑冠军</b>；在它还有大量空白市场时，耐心持有。",
  },

  /* ---------- 第21章 ---------- */
  {
    id:"ch21", part:"第四部 · 收官", nav:"6 个月定期检查", num:"21",
    cn:"6 个月的定期检查", en:"CH.21 · THE SEMIANNUAL CHECKUP",
    thesis:"再好的蓝筹也不能“买了就忘”。每隔约 6 个月，问两个问题：股价相对收益还吸引人吗？盈利靠什么增长？",
    body:[
      "买了就忘（buy-and-forget）既无收益又危险——IBM、西尔斯、柯达的持有者就该为此愧疚。每 6 个月的复查不是看看报价，而是一种<span class='gem'>纪律</span>：跟随行情，回答 ① 股价相对收益是否仍有吸引力？② 是什么在驱动盈利增长？",
      "三种结论：好转 → 加仓；恶化 → 减仓；不变 → 维持，或换一只更好的。1992 年 7 月他复查 1 月推荐的 21 只，组合涨 <span class='em'>19.2%</span> vs 标普 500 仅 1.64%。他读了每家最近季报、给大部分公司打了电话。",
      "复查会动态改主意：美体小铺 1 月偏贵，7 月跌 12% 后（印度部落首领在伦敦被捕的负面消息）变得可买——他愿为 25% 年增长付 20 倍市盈率。记住：<span class='em'>股价比过去低不是买入理由，比过去高也不是卖出理由</span>——一切看基本面。",
    ],
    hl:[
      { l:"两个问题", t:"① 股价相对收益是否吸引人？② <b>盈利靠什么增长？</b>" },
      { l:"动态调整", t:"好转加仓 / 恶化减仓 / <b>不变则维持或换更优</b>" },
    ],
    cases:[
      { nm:"美体小铺", sub:"The Body Shop", ds:"1 月偏贵，7 月跌 12% 后变得可买" },
      { nm:"IBM · 西尔斯 · 柯达", sub:"IBM · S · EK", ds:"“买了就忘”的反面教材" },
    ],
    viz:null,
    law:null,
    take:"把“定期体检”当成铁律；判断买卖<b>只看基本面与估值的关系</b>，而不看你的成本价。",
  },

  /* ---------- 25 条黄金法则 ---------- */
  { id:"rules", type:"rules", part:"第四部 · 收官", nav:"25 条黄金法则", num:"★",
    cn:"25 条股票投资黄金法则", en:"25 GOLDEN RULES",
    thesis:"二十年投资生涯的临别赠语——25 条值得反复念诵的法则。" },

  /* ---------- 林奇法则速查 ---------- */
  { id:"laws", type:"laws", part:"第四部 · 收官", nav:"林奇法则速查", num:"§",
    cn:"全书林奇投资法则速查", en:"PETER'S PRINCIPLES",
    thesis:"散落全书、用黑体标出的“林奇投资法则”——一处看全。" },
];

/* ---------------------- 25 条黄金法则 ---------------------- */
const GOLDEN = [
  "投资很有趣、很刺激，但如果不下功夫研究基本面，就会很危险。",
  "业余者的优势不在于专业建议，而在于你自身独特的知识与经验。用它投资自己了解的公司，就能打败专家。",
  "市场被机构主宰，反而让业余者更容易取胜——你尽可忽略他们，照样战胜市场。",
  "每只股票背后都是一家公司；你得弄清这家公司到底是如何经营的。",
  "短期内公司业绩与股价常常无关，长期则完全相关。理解这个差别，是赚钱的关键——耐心持有终有回报。",
  "弄清你持股公司的基本面，搞明白持有它的理由。孩子终会长大，但股票并非终会上涨。",
  "想着赌赢就大赚一把而大赌一把，结果往往会大输一把。",
  "把股票当孩子，但别养太多——业余者最多追踪 8–12 只，任何时候不要同时持有超过 5 只。",
  "如果找不到一只值得投资的公司，就把钱存进银行，直到找到为止。",
  "永远不要投资你不了解其财务状况的公司；买入前先查资产负债表，看它有没有破产风险。",
  "避开热门行业的热门股；冷门、无增长行业里的卓越公司，往往才是最赚钱的大牛股。",
  "对小公司，最好躲在一边耐心等待，等它开始真正盈利后再投资也不迟。",
  "要投困境行业，就投有能力熬过难关的公司，并等到行业出现复苏信号；马鞭和电子管这种行业则永无复苏之日。",
  "1000 元最多亏 1000 元，但耐心持有可能赚 1 万、5 万。业余者可集中投资少数优秀公司——只要找到几只大牛股，一辈子的努力就物超所值。",
  "任何行业、任何地方，留心观察的业余者都能比专业者更早发现卓越的高成长公司。",
  "股市大跌就像东北严冬的暴风雪——事先有准备就不会受伤，反而是低价买入的绝佳良机。",
  "人人都有赚钱所需的知识，但并非人人都有所需的胆略。容易在恐慌中被吓得抛光的人，最好别碰股票或股票基金。",
  "总会有事让人担心。别为周末报刊的危言耸听焦虑，也别理会悲观预测——天塌不下来；除非基本面恶化，别恐慌抛出好股票。",
  "没有人能预测利率、宏观经济与大盘走势。别理会这些预测，集中精力关注你投资的公司正在发生什么。",
  "研究 10 家会找到 1 家超预期的好公司，研究 50 家会找到 5 家——惊喜往往是被机构忽视的好公司。",
  "不研究公司基本面就买股票，就像不看牌就打牌，赢面很小。",
  "持有好公司，时间站在你这边，越久赢面越大；持有期权，时间站在你的对立面，越久赢面越小。",
  "有胆没时间研究，就投股票基金，并分散于不同风格——投 6 只同风格基金并不叫分散。频繁换基金代价高昂。",
  "过去 10 年美国股市在全球仅排第 8；可买业绩好的海外基金，分享别国股市的高成长。",
  "长期而言，精心挑选的股票或基金组合远胜债券组合；但胡乱挑选的股票组合，还不如把钱放在床底下安全。",
];

/* ---------------------- 林奇法则速查 ---------------------- */
const LAWS = [
  { n:2,  topic:"股票 vs 债券", text:"那些偏爱债券的投资人啊，你们可知道不投资股票错过的财富有多大。" },
  { n:3,  topic:"蜡笔原则",     text:"千万不要对任何无法用蜡笔将公司业务描述清楚的股票进行投资。" },
  { n:4,  topic:"别预测大盘",   text:"你无法从后视镜中看到未来。" },
  { n:5,  topic:"别买国债基金", text:"根本没有必要白白花钱请大提琴家马友友来放演奏会录音。" },
  { n:6,  topic:"挑就挑好基金", text:"既然要选择一只基金，就一定要选择一只业绩优秀的好基金。" },
  { n:7,  topic:"看办公室",     text:"公司办公室的奢华程度与公司管理层回报股东的意愿成反比。" },
  { n:9,  topic:"想象力",       text:"并非所有的普通股都一样普通。" },
  { n:11, topic:"已有的好股",   text:"最值得买入的好股票，也许就是你已经持有的那一只。" },
  { n:12, topic:"治幻想",       text:"要治那种觉得自己股票肯定大涨的幻想，最好的药方是股价大跌。" },
  { n:13, topic:"别接刀",       text:"当一家公司即将灭亡时，千万不要押宝公司会奇迹般起死回生。" },
  { n:14, topic:"逛街选股",     text:"如果你喜欢一家上市公司的商店，可能你也会喜欢上这家公司的股票。" },
  { n:15, topic:"内部人买入",   text:"公司内部人士买入自家股票，通常是很好的买入信号。" },
  { n:16, topic:"垄断 > 竞争",  text:"在商场上竞争绝对不如完全垄断。" },
  { n:17, topic:"彩照越少越好", text:"如果其他条件都一样，就选年报中彩色照片最少的那家公司股票。" },
  { n:18, topic:"无人问津时",   text:"分析师都感厌烦之日，正是最佳买入之时。" },
  { n:19, topic:"别悲观",       text:"除非你是沽空投资者，或是寻觅富婆的诗人，否则悲观毫无裨益。" },
  { n:20, topic:"公司改名",     text:"公司改名，要么是结婚了，要么是想让公众忘掉某场惨败。" },
  { n:21, topic:"私有化",       text:"不管英国女王在卖什么，买！" },
];

const TICKER = [
  ["买股票吧 ——", "up"], ["这是你读这本书唯一的收获也值了", ""],
  ["MAGELLAN", "b"], ["$18M → $14B", "up"], ["13Y ≈ +29%/yr", "up"],
  ["蜡笔原则：讲不清的公司不碰", ""], ["ST.AGNES", "b"], ["+70% vs +26%", "up"],
  ["你无法从后视镜中看到未来", ""], ["周末焦虑症 = 投资陷阱", "dn"],
  ["FORD", "b"], ["+17×", "up"], ["CHRYSLER", "b"], ["≈+50×", "up"],
  ["MCDONALD'S", "b"], ["+400×", "up"], ["关注公司，而不是关注股票", ""],
  ["竞争不如完全垄断", ""], ["不管英国女王卖什么，买！", ""],
  ["NEW ENGLAND BANK", "b"], ["bond → 20%", "dn"], ["別接将死公司的刀", "dn"],
];

/* ============================ 主组件 ============================ */
export default function App() {
  const [active, setActive] = useState("cover");
  const [navOpen, setNavOpen] = useState(false);
  const mainRef = useRef(null);

  const idx = SECTIONS.findIndex((s) => s.id === active);
  const sec = SECTIONS[idx] || SECTIONS[0];
  const go = (id) => { setActive(id); setNavOpen(false); if (mainRef.current) mainRef.current.scrollIntoView({ behavior: "smooth", block: "start" }); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // nav groups (preserve order)
  const groups = [];
  SECTIONS.forEach((s) => {
    let g = groups.find((x) => x.title === s.part);
    if (!g) { g = { title: s.part, items: [] }; groups.push(g); }
    g.items.push(s);
  });

  const prev = idx > 0 ? SECTIONS[idx - 1] : null;
  const next = idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : null;

  return (
    <div className="btw-root">
      <style>{CSS}</style>

      {/* ticker */}
      <div className="btw-ticker">
        <div className="btw-ticker-track">
          {[0, 1].map((k) => (
            <React.Fragment key={k}>
              {TICKER.map((t, i) => (
                <span key={k + "-" + i} className={t[1] === "up" ? "up" : t[1] === "dn" ? "dn" : ""}>
                  {t[1] === "b" ? <b>{t[0]}</b> : t[0]}
                </span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* topbar */}
      <div className="btw-top">
        <div className="brand">
          <span className="zh">战胜华尔街</span>
          <span className="en">Beating the Street · 互动导读</span>
        </div>
        <button className="btw-burger" onClick={() => setNavOpen(!navOpen)}>☰ 目录</button>
      </div>

      <div className={"btw-scrim" + (navOpen ? " show" : "")} onClick={() => setNavOpen(false)} />

      <div className="btw-wrap">
        {/* sidebar */}
        <aside className={"btw-side" + (navOpen ? " open" : "")}>
          {groups.map((g) => (
            <div key={g.title}>
              <div className="btw-part-h">{g.title}</div>
              {g.items.map((s) => (
                <button key={s.id} className={"btw-nav-item" + (s.id === active ? " on" : "")} onClick={() => go(s.id)}>
                  <span className="num">{s.num || "·"}</span>
                  <span>{s.nav}</span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* main */}
        <main className="btw-main" ref={mainRef}>
          {sec.type === "cover" ? (
            <Cover go={go} />
          ) : sec.type === "rules" ? (
            <RulesView sec={sec} />
          ) : sec.type === "laws" ? (
            <LawsView sec={sec} />
          ) : (
            <Section key={sec.id} sec={sec} />
          )}

          {sec.type !== "cover" && (
            <div className="btw-col">
              <div className="btw-fn">
                <button disabled={!prev} onClick={() => prev && go(prev.id)}>
                  <div className="l">← 上一节</div>
                  <div className="t">{prev ? prev.nav : "—"}</div>
                </button>
                <button className="r" disabled={!next} onClick={() => next && go(next.id)}>
                  <div className="l">下一节 →</div>
                  <div className="t">{next ? next.nav : "—"}</div>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ----------------------------- Cover ----------------------------- */
function Cover({ go }) {
  const stats = [
    ["≈29%", "", "麦哲伦 13 年 · 年均回报"],
    ["18M→14B", "$", "资产规模 · 1977–1990"],
    ["70:26", "", "学生 vs 标普 · 两年累计 (%)"],
    ["25", "条", "投资黄金法则"],
  ];
  const how = [
    ["01", "按章节顺序读", "左侧目录已按全书结构分为四部，从“引言”一路读到“黄金法则”，循序渐进。"],
    ["02", "看图，更直观", "关键章节配有可视化：股票vs债券、股价线vs收益线、周期股市盈率悖论……"],
    ["03", "记住林奇法则", "散落全书的“林奇投资法则”用红卡标出，末尾还有 25 条黄金法则与速查表。"],
  ];
  return (
    <div className="btw-cover fade-in">
      <div className="btw-hero">
        <div className="btw-kicker">华章经典 · 金融投资 · 章节式深度导读</div>
        <h1 className="btw-title">
          战胜华尔街
          <span className="en">BEATING THE STREET</span>
        </h1>
        <p className="btw-sub">
          彼得·林奇用他执掌富达麦哲伦基金 13 年、年均约 29% 的传奇，写给普通人的选股圣经。
          这份互动导读按全书章节逐一拆解——从“为什么要买股票”，到 21 个真实选股案例，再到 25 条临别法则，
          力求让你<strong>透彻理解</strong>林奇之道。
        </p>
        <div className="btw-byline">彼得·林奇 / 约翰·罗瑟查尔德　著　·　刘建位 等译　·　机械工业出版社</div>
      </div>

      <div className="btw-statgrid">
        {stats.map((s, i) => (
          <div className="btw-stat" key={i}>
            <div className="v">{s[1] && <small>{s[1]}</small>}{s[0]}</div>
            <div className="k">{s[2]}</div>
          </div>
        ))}
      </div>

      <div className="btw-how">
        <div className="hh"><span>如何使用这份导读</span><span className="rule" /></div>
        <div className="btw-howg">
          {how.map((h, i) => (
            <div className="btw-howc" key={i}>
              <div className="n">{h[0]}</div>
              <div className="t">{h[1]}</div>
              <div className="d">{h[2]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="btw-startwrap">
        <button className="btw-start" onClick={() => go("intro")}>翻开第一页 · 引言 →</button>
      </div>
    </div>
  );
}

/* ----------------------------- Section ----------------------------- */
function Section({ sec }) {
  const Viz = sec.viz ? VIZ[sec.viz] : null;
  return (
    <div className="btw-col fade-in">
      <div className="btw-ey"><span className="rule" /><span>{sec.part}</span><span className="btw-secnum">No.{sec.num}</span></div>
      <h1 className="btw-h1">{sec.cn}</h1>
      <div className="btw-h1en">{sec.en}</div>

      <div className="btw-thesis">
        <div className="lab">本章核心</div>
        <p>{sec.thesis}</p>
      </div>

      <div className="btw-body">
        {sec.body.map((p, i) => (
          <p key={i} className={i === 0 ? "btw-lead" : ""} dangerouslySetInnerHTML={{ __html: p }} />
        ))}
      </div>

      {Viz && <Viz />}

      {sec.hl && (
        <div className="btw-hl">
          {sec.hl.map((h, i) => (
            <div className="c" key={i}>
              <div className="l">{h.l}</div>
              <div className="t" dangerouslySetInnerHTML={{ __html: h.t }} />
            </div>
          ))}
        </div>
      )}

      {sec.cases && (
        <div className="btw-cases">
          <div className="ch"><span>代表案例</span><span className="rule" /></div>
          {sec.cases.map((c, i) => (
            <div className="btw-case" key={i}>
              <div className="nm">{c.nm}<small>{c.sub}</small></div>
              <div className="ds">{c.ds}</div>
            </div>
          ))}
        </div>
      )}

      {sec.law && (
        <div className="btw-law">
          <div className="k"><span className="n">林奇第 {sec.law.n} 法则</span></div>
          <p>{sec.law.text}</p>
        </div>
      )}

      <div className="btw-take">
        <div className="ic">↗</div>
        <div className="bd">
          <div className="l">给业余投资者的启示</div>
          <p dangerouslySetInnerHTML={{ __html: sec.take }} />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Rules ----------------------------- */
function RulesView({ sec }) {
  return (
    <div className="btw-col fade-in">
      <div className="btw-ey"><span className="rule" /><span>{sec.part}</span><span className="btw-secnum">★</span></div>
      <h1 className="btw-h1">{sec.cn}</h1>
      <div className="btw-h1en">{sec.en}</div>
      <div className="btw-thesis"><div className="lab">林奇的临别赠语</div><p>{sec.thesis}</p></div>
      <div style={{ marginTop: 8 }}>
        {GOLDEN.map((g, i) => (
          <div key={i} style={{ display: "flex", gap: 16, padding: "15px 0", borderBottom: "1px dashed var(--line)", alignItems: "flex-start" }}>
            <div style={{ flex: "0 0 42px", fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: 26, color: i % 2 ? "var(--rust)" : "var(--green)", lineHeight: 1 }}>{i + 1}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8, color: "var(--ink2)" }}>{g}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Laws ----------------------------- */
function LawsView({ sec }) {
  return (
    <div className="btw-col fade-in">
      <div className="btw-ey"><span className="rule" /><span>{sec.part}</span><span className="btw-secnum">§</span></div>
      <h1 className="btw-h1">{sec.cn}</h1>
      <div className="btw-h1en">{sec.en}</div>
      <div className="btw-thesis"><div className="lab">Peter's Principles</div><p>{sec.thesis}</p></div>
      <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        {LAWS.map((l) => (
          <div key={l.n} style={{ display: "flex", gap: 14, alignItems: "center", background: "var(--card)", border: "1px solid var(--line2)", borderLeft: "3px solid var(--rust)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ flex: "0 0 52px", textAlign: "center" }}>
              <div style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: 24, color: "var(--rust)", lineHeight: 1 }}>{l.n}</div>
              <div style={{ fontFamily: "Space Mono, monospace", fontSize: 8.5, letterSpacing: "0.1em", color: "var(--ink3)", textTransform: "uppercase", marginTop: 3 }}>LAW</div>
            </div>
            <div>
              <div style={{ fontFamily: "Space Mono, monospace", fontSize: 10.5, letterSpacing: "0.08em", color: "var(--green)", marginBottom: 4, textTransform: "uppercase" }}>{l.topic}</div>
              <div style={{ fontFamily: "Fraunces, Noto Serif SC, serif", fontWeight: 500, fontSize: 15.5, lineHeight: 1.55, color: "var(--ink)" }}>{l.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
