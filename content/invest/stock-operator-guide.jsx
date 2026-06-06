import React, { useState, useMemo } from "react";

/* ============================================================
   《股票作手回忆录》互动导读
   Reminiscences of a Stock Operator — Edwin Lefèvre (1923)
   原型：Jesse Livermore（书中化名 Larry Livingston）
   ============================================================ */

const C = {
  ink: "#16120B", ink2: "#1E1810", card: "#241D13", card2: "#2B2318",
  gold: "#D4AF37", goldSoft: "#C9A227", brass: "#B08D3A",
  cream: "#ECE3CF", creamDim: "#B9AD92", creamFaint: "#8A7F68",
  green: "#8FB05A", greenDeep: "#6E8B3D", red: "#C0533B", redDeep: "#9E3F2C",
  line: "rgba(201,162,39,0.22)", lineSoft: "rgba(237,230,214,0.10)",
  grid: "rgba(237,230,214,0.06)",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,500&family=Spectral:ital,wght@0,400;0,500;0,600;1,400&family=Space+Mono:wght@400;700&display=swap');

:root{
  --ink:${C.ink}; --ink2:${C.ink2}; --card:${C.card}; --card2:${C.card2};
  --gold:${C.gold}; --goldSoft:${C.goldSoft}; --brass:${C.brass};
  --cream:${C.cream}; --creamDim:${C.creamDim}; --creamFaint:${C.creamFaint};
  --green:${C.green}; --red:${C.red};
  --line:${C.line}; --lineSoft:${C.lineSoft};
  --display:'Playfair Display',Georgia,serif;
  --body:'Spectral',Georgia,serif;
  --mono:'Space Mono','SFMono-Regular',monospace;
}
*{box-sizing:border-box}
.soa{
  font-family:var(--body); color:var(--cream); background:var(--ink);
  position:relative; min-height:100%; overflow-x:hidden;
  background-image:
    radial-gradient(1200px 600px at 80% -10%, rgba(212,175,55,0.10), transparent 60%),
    radial-gradient(900px 500px at -10% 110%, rgba(192,83,59,0.07), transparent 60%),
    linear-gradient(180deg,#17130C 0%, #14100A 100%);
}
.soa::before{
  content:""; position:fixed; inset:0; pointer-events:none; opacity:.5;
  background:repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 3px, rgba(0,0,0,0.025) 3px 4px);
  mix-blend-mode:multiply;
}
.soa::after{
  content:""; position:fixed; inset:0; pointer-events:none;
  box-shadow:inset 0 0 240px 40px rgba(0,0,0,0.55);
}
.wrap{max-width:1180px; margin:0 auto; padding:0 22px 80px; position:relative; z-index:1}

/* ticker */
.ticker{overflow:hidden; border-top:1px solid var(--line); border-bottom:1px solid var(--line);
  background:linear-gradient(90deg,rgba(212,175,55,0.04),rgba(212,175,55,0.01)); margin:0 -22px 0}
.tickwrap{max-width:1180px;margin:0 auto}
.tracker{display:flex; width:max-content; animation:tick 46s linear infinite; padding:9px 0}
.tk{font-family:var(--mono); font-size:12.5px; letter-spacing:.04em; color:var(--creamDim);
  padding:0 20px; white-space:nowrap; border-right:1px solid var(--lineSoft)}
.tk .s{color:var(--cream)} .up{color:var(--green)} .dn{color:var(--red)}
@keyframes tick{from{transform:translateX(0)} to{transform:translateX(-50%)}}

/* masthead */
.mast{padding:44px 0 26px; border-bottom:1px solid var(--line); margin-bottom:26px}
.eyebrow{font-family:var(--mono); font-size:11.5px; letter-spacing:.32em; text-transform:uppercase;
  color:var(--goldSoft); margin-bottom:16px}
.title{font-family:var(--display); font-weight:900; font-size:clamp(34px,6.4vw,68px); line-height:.98;
  color:var(--cream); margin:0; letter-spacing:-.01em}
.title .em{color:var(--gold); font-style:italic; font-weight:700}
.subtitle{font-family:var(--display); font-style:italic; font-weight:500; font-size:clamp(15px,2.3vw,21px);
  color:var(--creamDim); margin:14px 0 0}
.meta{display:flex; flex-wrap:wrap; gap:18px 26px; margin-top:20px; font-family:var(--mono); font-size:12px;
  color:var(--creamFaint); letter-spacing:.03em}
.meta b{color:var(--brass); font-weight:700}

/* layout */
.layout{display:grid; grid-template-columns:286px 1fr; gap:38px; align-items:start}
.side{position:sticky; top:14px; align-self:start; max-height:calc(100vh - 28px); overflow:auto;
  padding-right:6px}
.side::-webkit-scrollbar{width:7px} .side::-webkit-scrollbar-thumb{background:rgba(212,175,55,.25);border-radius:4px}
.navItem{display:block; width:100%; text-align:left; background:none; border:none; cursor:pointer;
  font-family:var(--body); color:var(--creamDim); padding:8px 12px; font-size:14.5px; line-height:1.35;
  border-left:2px solid transparent; transition:.18s; border-radius:0 6px 6px 0}
.navItem:hover{color:var(--cream); background:rgba(212,175,55,.05)}
.navItem.on{color:var(--gold); background:rgba(212,175,55,.09); border-left-color:var(--gold)}
.navItem .n{font-family:var(--mono); font-size:11px; color:var(--brass); margin-right:8px}
.navItem.on .n{color:var(--gold)}
.actHead{font-family:var(--mono); font-size:10.5px; letter-spacing:.2em; text-transform:uppercase;
  color:var(--goldSoft); margin:22px 0 7px; padding-left:12px; display:flex; gap:8px; align-items:baseline}
.actHead .rn{color:var(--brass); font-weight:700}
.nav-top{margin-bottom:6px}

/* mobile nav */
.mnav{display:none; margin-bottom:8px}
.mnav select{width:100%; font-family:var(--mono); font-size:13px; color:var(--cream);
  background:var(--card); border:1px solid var(--line); border-radius:10px; padding:13px 14px; appearance:none}
.mnav label{display:block; font-family:var(--mono); font-size:10.5px; letter-spacing:.22em;
  text-transform:uppercase; color:var(--goldSoft); margin-bottom:7px}

/* reader */
.reader{min-width:0}
.fade{animation:fadeUp .5s cubic-bezier(.2,.7,.2,1) both}
@keyframes fadeUp{from{opacity:0; transform:translateY(14px)} to{opacity:1; transform:none}}
.r-eyebrow{font-family:var(--mono); font-size:11px; letter-spacing:.24em; text-transform:uppercase;
  color:var(--goldSoft); margin-bottom:14px; display:flex; gap:12px; align-items:center; flex-wrap:wrap}
.r-eyebrow .prog{color:var(--creamFaint); border-left:1px solid var(--lineSoft); padding-left:12px}
.chnum{font-family:var(--display); font-weight:900; font-size:clamp(46px,11vw,90px); line-height:.85;
  color:var(--gold); opacity:.92; letter-spacing:-.02em}
.chnum small{font-size:.34em; vertical-align:super; color:var(--brass); font-weight:700; margin-left:4px}
.chtitle{font-family:var(--display); font-weight:700; font-size:clamp(26px,4.6vw,42px); line-height:1.06;
  color:var(--cream); margin:6px 0 4px}
.chen{font-family:var(--mono); font-style:italic; font-size:13px; color:var(--creamFaint); letter-spacing:.02em}
.rule{height:1px; background:linear-gradient(90deg,var(--gold),transparent); border:none; margin:24px 0}

.lead{font-family:var(--body); font-size:clamp(16px,2vw,18.5px); line-height:1.85; color:#E4DBC6}
.lead .hl{color:var(--gold); font-weight:600; font-style:italic}
.lead b{color:var(--cream); font-weight:600}

.seclabel{font-family:var(--mono); font-size:11px; letter-spacing:.2em; text-transform:uppercase;
  color:var(--goldSoft); display:flex; align-items:center; gap:12px; margin:34px 0 16px}
.seclabel:after{content:""; flex:1; height:1px; background:var(--lineSoft)}

.lessons{display:flex; flex-direction:column; gap:14px; margin:0}
.lesson{display:flex; gap:15px; background:linear-gradient(180deg,var(--card),var(--ink2));
  border:1px solid var(--lineSoft); border-radius:12px; padding:15px 17px}
.lesson .mk{font-family:var(--display); font-weight:900; font-size:21px; color:var(--gold); line-height:1;
  min-width:26px; text-align:center; padding-top:2px}
.lesson p{margin:0; font-size:15.5px; line-height:1.66; color:#DED4BD}
.lesson p b{color:var(--gold); font-weight:600}

.quote{position:relative; margin:30px 0; padding:26px 28px 24px; border-radius:14px;
  background:radial-gradient(120% 120% at 0% 0%, rgba(212,175,55,0.10), rgba(36,29,19,0.7));
  border:1px solid var(--line); border-left:3px solid var(--gold)}
.quote .mark{position:absolute; top:-6px; left:14px; font-family:var(--display); font-size:74px;
  color:var(--gold); opacity:.22; line-height:1}
.quote .en{font-family:var(--display); font-style:italic; font-weight:500; font-size:clamp(18px,2.6vw,24px);
  line-height:1.4; color:var(--cream); margin:0 0 12px; position:relative}
.quote .zh{font-family:var(--body); font-size:15.5px; line-height:1.7; color:var(--creamDim); margin:0}
.quote .cite{font-family:var(--mono); font-size:11px; letter-spacing:.12em; color:var(--brass); margin-top:14px;
  text-transform:uppercase}

/* viz */
.viz{margin:30px 0; padding:20px 18px 16px; background:linear-gradient(180deg,rgba(30,24,16,.7),rgba(20,16,10,.7));
  border:1px solid var(--lineSoft); border-radius:14px}
.viz svg{display:block; width:100%; height:auto; overflow:visible}
.vcap{font-family:var(--mono); font-size:12px; color:var(--creamDim); line-height:1.6; margin-top:14px;
  border-top:1px dashed var(--lineSoft); padding-top:12px; letter-spacing:.02em}
.vcap b{color:var(--gold)}
.vtitle{font-family:var(--display); font-weight:700; font-size:18px; color:var(--cream); margin:0 0 2px}
.vhead{display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:8px; margin-bottom:8px}
.legend{display:flex; gap:18px; flex-wrap:wrap; font-family:var(--mono); font-size:11.5px; color:var(--creamDim)}
.legend i{display:inline-block; width:14px; height:3px; border-radius:2px; margin-right:7px; vertical-align:middle}

/* toggle */
.toggle{display:flex; gap:8px; margin:4px 0 14px; flex-wrap:wrap}
.tgl{font-family:var(--mono); font-size:12.5px; cursor:pointer; padding:9px 14px; border-radius:9px;
  background:var(--card); border:1px solid var(--line); color:var(--creamDim); transition:.16s; letter-spacing:.02em}
.tgl:hover{color:var(--cream)}
.tgl.on{background:rgba(212,175,55,.14); border-color:var(--gold); color:var(--gold)}
.tgl.danger.on{background:rgba(192,83,59,.16); border-color:var(--red); color:#E78A73}
.outcome{display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:14px}
.ocard{padding:14px 15px; border-radius:11px; border:1px solid var(--lineSoft); background:var(--card)}
.ocard h5{font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; margin:0 0 8px; color:var(--creamFaint)}
.ocard .big{font-family:var(--display); font-weight:900; font-size:23px; line-height:1}
.ocard p{font-family:var(--body); font-size:13px; color:var(--creamDim); margin:9px 0 0; line-height:1.55}
.ocard.good .big{color:var(--green)} .ocard.bad .big{color:var(--red)}
.ocard.live{border-color:var(--gold); box-shadow:0 0 0 1px rgba(212,175,55,.25)}

/* concept diagrams (html) */
.bs{display:grid; grid-template-columns:1fr auto 1fr; gap:14px; align-items:stretch}
.bcol{background:var(--card); border:1px solid var(--lineSoft); border-radius:13px; padding:18px 16px}
.bcol h4{font-family:var(--display); font-weight:700; font-size:17px; margin:0 0 3px; color:var(--cream)}
.bcol .tag{font-family:var(--mono); font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--brass)}
.flow{display:flex; flex-direction:column; gap:7px; margin:15px 0 13px}
.node{font-family:var(--mono); font-size:12.5px; text-align:center; padding:9px 8px; border-radius:8px;
  background:var(--ink2); border:1px solid var(--lineSoft); color:var(--cream)}
.node.h{background:rgba(212,175,55,.12); border-color:var(--line); color:var(--gold)}
.arr{text-align:center; color:var(--brass); font-size:15px; line-height:.6}
.note{font-family:var(--body); font-size:13px; line-height:1.55; color:var(--creamDim); margin:0}
.note b{color:var(--cream)}
.vs{align-self:center; font-family:var(--display); font-style:italic; font-weight:900; font-size:22px; color:var(--gold)}

.psy{display:grid; grid-template-columns:1fr 1fr; gap:14px}
.pcol{border-radius:13px; padding:17px 16px; border:1px solid var(--lineSoft)}
.pcol.bad{background:linear-gradient(180deg,rgba(192,83,59,.10),rgba(36,29,19,.4)); border-color:rgba(192,83,59,.3)}
.pcol.good{background:linear-gradient(180deg,rgba(143,176,90,.10),rgba(36,29,19,.4)); border-color:rgba(143,176,90,.3)}
.pcol h4{font-family:var(--display); font-weight:700; font-size:16px; margin:0 0 12px; color:var(--cream)}
.pstep{font-family:var(--mono); font-size:12px; padding:8px 11px; border-radius:8px; background:rgba(0,0,0,.18);
  color:var(--cream); margin-bottom:6px}
.pstep .k{color:var(--creamFaint)}
.pdown{text-align:center; color:var(--brass); font-size:13px; margin:1px 0}
.pfix{margin-top:11px; padding:11px; border-radius:9px; font-family:var(--body); font-size:13px; line-height:1.5}
.pfix.bad{background:rgba(192,83,59,.14); color:#EBA791} .pfix.good{background:rgba(143,176,90,.16); color:#CBE0A6}
.pfix b{font-weight:700}

/* rules + quotes (synthesis) */
.grid2{display:grid; grid-template-columns:repeat(2,1fr); gap:14px}
.rcard{background:linear-gradient(180deg,var(--card),var(--ink2)); border:1px solid var(--lineSoft);
  border-radius:13px; padding:17px 17px 16px; position:relative; overflow:hidden}
.rcard .rn{font-family:var(--display); font-weight:900; font-size:40px; color:rgba(212,175,55,.16);
  position:absolute; right:12px; top:2px; line-height:1}
.rcard h4{font-family:var(--display); font-weight:700; font-size:17px; color:var(--gold); margin:0 0 7px; position:relative}
.rcard p{font-family:var(--body); font-size:14px; line-height:1.6; color:#D9CFB8; margin:0; position:relative}

.qsmall{margin:14px 0; padding:18px 20px; border-left:3px solid var(--gold); border-radius:0 11px 11px 0;
  background:rgba(212,175,55,.05)}
.qsmall .en{font-family:var(--display); font-style:italic; font-size:18px; line-height:1.4; color:var(--cream); margin:0 0 8px}
.qsmall .zh{font-family:var(--body); font-size:14px; color:var(--creamDim); margin:0; line-height:1.6}
.qsmall .cite{font-family:var(--mono); font-size:10.5px; letter-spacing:.1em; color:var(--brass); margin-top:9px; text-transform:uppercase}

.howto{background:linear-gradient(180deg,rgba(212,175,55,.06),rgba(30,24,16,.5)); border:1px solid var(--line);
  border-radius:14px; padding:18px 20px; margin-top:26px}
.howto h4{font-family:var(--mono); font-size:11px; letter-spacing:.2em; text-transform:uppercase; color:var(--goldSoft); margin:0 0 12px}
.howto ol{margin:0; padding-left:20px; font-family:var(--body); font-size:14.5px; line-height:1.75; color:#D9CFB8}
.howto li{margin-bottom:5px} .howto b{color:var(--gold)}

/* nav buttons */
.navbtns{display:flex; justify-content:space-between; gap:12px; margin-top:42px; padding-top:24px;
  border-top:1px solid var(--line)}
.nbtn{flex:1; cursor:pointer; background:var(--card); border:1px solid var(--line); border-radius:12px;
  padding:14px 16px; text-align:left; transition:.16s; min-width:0}
.nbtn:hover:not(:disabled){background:rgba(212,175,55,.08); border-color:var(--gold)}
.nbtn:disabled{opacity:.32; cursor:not-allowed}
.nbtn .dir{font-family:var(--mono); font-size:10.5px; letter-spacing:.18em; text-transform:uppercase; color:var(--brass)}
.nbtn .nm{font-family:var(--display); font-weight:700; font-size:15px; color:var(--cream); margin-top:4px;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
.nbtn.next{text-align:right}

.svglabel{font-family:var(--mono); font-size:11px; fill:${C.creamDim}}
.svgnum{font-family:var(--mono); font-size:10px; fill:${C.creamFaint}}
.svgtag{font-family:'Spectral',serif; font-size:12.5px; fill:${C.cream}}

@media (max-width:860px){
  .layout{grid-template-columns:1fr; gap:18px}
  .side{display:none}
  .mnav{display:block}
  .grid2{grid-template-columns:1fr}
  .outcome{grid-template-columns:1fr}
  .bs{grid-template-columns:1fr}
  .vs{padding:4px 0}
  .psy{grid-template-columns:1fr}
}
`;

/* ----------------------------- helpers ----------------------------- */
function smoothPath(pts) {
  if (pts.length < 2) return "";
  const d = [`M ${pts[0][0]} ${pts[0][1]}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0]} ${p2[1]}`);
  }
  return d.join(" ");
}
const Defs = ({ id, color }) => (
  <defs>
    <marker id={id} markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill={color} />
    </marker>
  </defs>
);

/* ----------------------------- VISUALS ----------------------------- */

function TickerTape() {
  const items = [
    ["U.P.", "188¾", "up"], ["STEEL", "98⅞", "dn"], ["ANA", "201", "up"],
    ["READING", "152¼", "dn"], ["SUGAR", "133", "up"], ["B.R.T.", "76½", "dn"],
    ["S.P.", "118", "up"], ["COTTON·JUL", "12.04", "dn"], ["WHEAT", "1.21", "up"],
  ];
  const one = items.map((it, i) => (
    <span className="tk" key={i}>
      <span className="s">{it[0]}</span> {it[1]}{" "}
      <span className={it[2]}>{it[2] === "up" ? "▲" : "▼"}</span>
    </span>
  ));
  return (
    <div className="ticker"><div className="tickwrap">
      <div className="tracker">{one}{one}</div>
    </div></div>
  );
}

function CareerArc() {
  const pts = [
    [70, 229.4], [149, 205.4], [228, 179.5], [280.7, 227.6], [307, 246.1],
    [359.7, 201.7], [412.3, 149.9], [438.7, 64.8], [454.5, 133.25], [472.9, 327.5],
    [517.7, 320.1], [596.7, 312.7], [649.3, 244.25], [665.1, 179.5], [702, 133.25],
    [781, 90.7], [860, 75.9],
  ];
  const path = smoothPath(pts);
  const zeroY = 235;
  const ev = [
    [149, 205.4, "对赌行「少年杀手」", "up", "start"],
    [280.7, 227.6, "初闯纽约即亏光", "dn", "mid"],
    [438.7, 64.8, "1907 大恐慌 · 单日盈利数百万", "up", "top"],
    [472.9, 327.5, "棉花惨败 · 听信他人而破产负债", "dn", "bot"],
    [596.7, 312.7, "四年贫瘠期", "dn", "flat"],
    [665.1, 179.5, "1915 伯利恒钢铁 · 东山再起", "up", "mid"],
    [820, 80, "还清百万债务，重归富有", "up", "topright"],
  ];
  return (
    <div className="viz">
      <div className="vhead">
        <div><p className="vtitle">一生的盈亏曲线</p>
          <span className="chen">数次破产、数次重生 —— 全书的情感主线（示意）</span></div>
        <div className="legend">
          <span><i style={{ background: C.green }} />盈利 / 财富</span>
          <span><i style={{ background: C.red }} />亏损 / 负债</span>
        </div>
      </div>
      <svg viewBox="0 0 900 380">
        {/* zero line */}
        <line x1="60" y1={zeroY} x2="868" y2={zeroY} stroke={C.line} strokeDasharray="2 6" />
        <text x="868" y={zeroY - 7} textAnchor="end" className="svgnum">破产线 ZERO</text>
        {/* glow + line */}
        <path d={path} fill="none" stroke={C.gold} strokeOpacity="0.18" strokeWidth="7" />
        <path d={path} fill="none" stroke={C.gold} strokeWidth="2.4" />
        {/* events */}
        {ev.map((e, i) => {
          const above = e[3] === "up";
          const labelY = e[4] === "top" ? e[1] - 16 : e[4] === "bot" ? e[1] + 26
            : e[4] === "flat" ? e[1] + 24 : e[4] === "topright" ? e[1] - 14
            : above ? e[1] - 16 : e[1] + 24;
          const anchor = e[0] > 720 ? "end" : e[0] < 160 ? "start" : "middle";
          return (
            <g key={i}>
              <circle cx={e[0]} cy={e[1]} r="5.5" fill={above ? C.green : C.red}
                stroke={C.ink} strokeWidth="2" />
              <text x={e[0]} y={labelY} textAnchor={anchor} className="svgtag"
                style={{ fill: above ? C.green : "#E08A72", fontSize: "12px" }}>{e[2]}</text>
            </g>
          );
        })}
        {/* axis years */}
        {[["1893", 70], ["1907", 438.7], ["1915", 665.1], ["1923", 860]].map((y, i) => (
          <text key={i} x={y[1]} y={365} textAnchor="middle" className="svgnum">{y[0]}</text>
        ))}
      </svg>
      <p className="vcap">
        从波士顿对赌行的报价板男孩，到1907年恐慌中封神，再到棉花上的彻底崩塌、四年潦倒，最后靠伯利恒钢铁重新站起——
        利弗莫尔的真正考题，<b>从来不是「看不看得对」，而是「能不能管住自己」</b>。这条曲线，就是本书要你读懂的东西。
      </p>
    </div>
  );
}

function SitTightChart() {
  const trend = [[60, 250], [140, 212], [200, 236], [285, 182], [355, 206], [435, 150], [515, 176], [600, 112], [680, 134], [712, 82]];
  const path = smoothPath(trend);
  // amateur in/out (buys high, sells on dips → whipsaw)
  const amBuy = [[140, 212], [355, 206], [600, 112]];
  const amSell = [[200, 236], [435, 150], [680, 134]];
  return (
    <div className="viz">
      <div className="vhead">
        <div><p className="vtitle">为什么大钱在「坐功」里</p>
          <span className="chen">同一段牛市趋势：业余者 vs 老火鸡</span></div>
      </div>
      <svg viewBox="0 0 760 300">
        <Defs id="st" color={C.gold} />
        {[120, 180, 240].map((y, i) => <line key={i} x1="50" y1={y - 0} x2="730" y2={y} stroke={C.grid} />)}
        <path d={path} fill="none" stroke={C.brass} strokeWidth="2.4" />
        {/* amateur markers */}
        {amBuy.map((p, i) => (<g key={"b" + i}><circle cx={p[0]} cy={p[1]} r="6" fill="none" stroke={C.green} strokeWidth="2" /><text x={p[0]} y={p[1] - 11} textAnchor="middle" className="svgnum" style={{ fill: C.green }}>买</text></g>))}
        {amSell.map((p, i) => (<g key={"s" + i}><circle cx={p[0]} cy={p[1]} r="6" fill="none" stroke={C.red} strokeWidth="2" /><text x={p[0]} y={p[1] + 19} textAnchor="middle" className="svgnum" style={{ fill: "#E08A72" }}>卖</text></g>))}
        <text x="150" y="60" className="svgtag" style={{ fill: "#E08A72" }}>业余者：在每次回调里被洗出，反复「买高卖低」</text>
        {/* sit tight */}
        <circle cx="60" cy="250" r="6.5" fill={C.gold} />
        <text x="70" y="276" className="svgtag" style={{ fill: C.gold }}>老火鸡：买入后一路坐到顶</text>
        <line x1="60" y1="265" x2="712" y2="97" stroke={C.gold} strokeWidth="1.6" strokeDasharray="4 4" markerEnd="url(#st)" opacity="0.85" />
        <circle cx="712" cy="82" r="6.5" fill={C.gold} />
        <text x="712" y="68" textAnchor="end" className="svgtag" style={{ fill: C.gold }}>吃下整段主升浪</text>
      </svg>
      <p className="vcap">
        在正确的方向上，频繁进出会被短期波动反复「洗」掉，手续费与情绪两头受损。
        利弗莫尔说：<b>真正赚大钱的，不是我的思考，而是我的「坐功」。</b> 既能看对、又能坐稳的人，凤毛麟角。
      </p>
    </div>
  );
}

function LeastResistance() {
  const consol = [[80, 175], [130, 160], [180, 178], [230, 162], [290, 176], [360, 158]];
  const up = [[360, 158], [430, 128], [520, 102], [620, 80], [700, 66]];
  return (
    <div className="viz">
      <div className="vhead"><div><p className="vtitle">最小阻力线与顺势加仓</p>
        <span className="chen">等价格自己「选边」，再站到它那一边</span></div></div>
      <svg viewBox="0 0 760 290">
        <Defs id="lr" color={C.gold} />
        <rect x="80" y="150" width="280" height="40" fill="rgba(212,175,55,0.05)" stroke={C.lineSoft} />
        <line x1="80" y1="150" x2="360" y2="150" stroke={C.red} strokeWidth="1.4" strokeDasharray="5 4" />
        <text x="84" y="143" className="svgnum" style={{ fill: "#E08A72" }}>阻力 RESISTANCE</text>
        <path d={smoothPath(consol)} fill="none" stroke={C.brass} strokeWidth="2" />
        <text x="130" y="220" className="svgtag" style={{ fill: C.creamDim }}>盘整：方向未明，按兵不动</text>
        <path d={smoothPath(up)} fill="none" stroke={C.gold} strokeWidth="2.6" markerEnd="url(#lr)" />
        <circle cx="368" cy="150" r="6.5" fill={C.gold} />
        <text x="378" y="146" className="svgtag" style={{ fill: C.gold }}>突破 = 行动信号</text>
        {[[430, 128], [520, 102], [620, 80]].map((p, i) => (
          <g key={i}><path d={`M ${p[0]} ${p[1] + 16} L ${p[0] - 6} ${p[1] + 26} L ${p[0] + 6} ${p[1] + 26} Z`} fill={C.green} />
            <text x={p[0]} y={p[1] + 40} textAnchor="middle" className="svgnum" style={{ fill: C.green }}>加仓</text></g>
        ))}
      </svg>
      <p className="vcap">
        利弗莫尔不预测顶底，而是观察价格沿「阻力最小的方向」运动：突破关键价位后才动手，并在<b>已被验证为正确的盈利方向上加码（金字塔）</b>——
        注意，是加在赢的仓位上，绝不是在亏的仓位上摊平。
      </p>
    </div>
  );
}

function Panic1907() {
  const mkt = [[60, 110], [150, 92], [240, 88], [305, 104], [365, 146], [425, 206], [475, 252], [505, 268], [560, 244], [625, 250]];
  const pnl = [[305, 250], [365, 214], [425, 150], [475, 100], [505, 80], [560, 96]];
  return (
    <div className="viz">
      <div className="vhead">
        <div><p className="vtitle">1907：危机即机会</p><span className="chen">市场崩跌，他的空头盈利飙升</span></div>
        <div className="legend">
          <span><i style={{ background: C.red }} />市场指数</span>
          <span><i style={{ background: C.green }} />他的空头盈亏</span>
        </div>
      </div>
      <svg viewBox="0 0 760 300">
        <path d={smoothPath(mkt)} fill="none" stroke={C.red} strokeWidth="2.6" />
        <text x="120" y="78" className="svgtag" style={{ fill: "#E08A72" }}>市场崩溃 ↓</text>
        <path d={smoothPath(pnl)} fill="none" stroke={C.green} strokeWidth="2.2" strokeDasharray="6 4" />
        <text x="430" y="138" className="svgtag" style={{ fill: C.green }}>做空盈利 ↑</text>
        <g>
          <path d="M505,254 l4,12 l12,0 l-9,8 l3,12 l-10,-7 l-10,7 l3,-12 l-9,-8 l12,0 Z" fill={C.gold} transform="translate(0,4)" />
          <text x="505" y="292" textAnchor="middle" className="svgtag" style={{ fill: C.gold }}>他的「封神之日」</text>
        </g>
        <circle cx="535" cy="88" r="5" fill={C.green} />
        <text x="545" y="84" className="svgtag" style={{ fill: C.creamDim, fontSize: "11.5px" }}>摩根请他停止做空 → 平仓反手做多</text>
      </svg>
      <p className="vcap">
        他研判信贷与流动性已绷到极限，重仓做空，在恐慌最深的一天账面盈利数百万——据传 J.P. 摩根派人请他收手以免击穿市场。
        他随即<b>平掉空头、反手做多</b>，既兑现利润又顺应反弹。<b>系统性风险只对早有准备的人是机会。</b>
      </p>
    </div>
  );
}

function CottonInteractive() {
  const [mode, setMode] = useState("average");
  const price = [[80, 70], [180, 96], [280, 122], [380, 150], [480, 184], [580, 218], [680, 250]];
  const path = smoothPath(price);
  const avg = mode === "average";
  // average-down buy points (all of them) vs discipline (1 buy + stop)
  const buys = price.slice(0, 6);
  const bales = ["80k", "160k", "250k", "340k", "410k", "440k"];
  return (
    <div className="viz">
      <div className="vhead"><div><p className="vtitle">致命的一课：向下摊平 vs 截断亏损</p>
        <span className="chen">他被说服「做多」棉花，价格却一路下跌……</span></div></div>
      <div className="toggle">
        <button className={"tgl danger " + (avg ? "on" : "")} onClick={() => setMode("average")}>① 他的实际做法：向下摊平（越跌越买）</button>
        <button className={"tgl " + (!avg ? "on" : "")} onClick={() => setMode("discipline")}>② 应有的纪律：果断止损</button>
      </div>
      <svg viewBox="0 0 760 300">
        <Defs id="ct" color={C.red} />
        <text x="80" y="58" className="svgnum">买入价（高）</text>
        <text x="700" y="244" textAnchor="end" className="svgnum" style={{ fill: "#E08A72" }}>价格持续下跌 →</text>
        <path d={path} fill="none" stroke={C.red} strokeWidth="2.6" />
        {avg ? (
          <g>
            {buys.map((p, i) => (
              <g key={i}>
                <circle cx={p[0]} cy={p[1]} r={5 + i * 0.8} fill="none" stroke={C.green} strokeWidth="2" />
                <text x={p[0]} y={p[1] - 11} textAnchor="middle" className="svgnum" style={{ fill: C.green, fontSize: "9.5px" }}>买</text>
                <text x={p[0]} y={p[1] + 20} textAnchor="middle" className="svgnum" style={{ fill: C.creamFaint, fontSize: "9px" }}>{bales[i]}</text>
              </g>
            ))}
            <text x="300" y="100" className="svgtag" style={{ fill: "#E08A72" }}>「为了托住价格」越买越多 → 累计 440,000 包</text>
            <circle cx="680" cy="250" r="7" fill={C.red} />
            <text x="680" y="276" textAnchor="end" className="svgtag" style={{ fill: C.red }}>被迫割肉，几乎赔光</text>
          </g>
        ) : (
          <g>
            <circle cx="80" cy="70" r="6.5" fill="none" stroke={C.green} strokeWidth="2" />
            <text x="80" y="58" className="svgnum" style={{ fill: C.green }}>买入 1 笔</text>
            <line x1="80" y1="118" x2="380" y2="118" stroke={C.gold} strokeDasharray="5 4" />
            <text x="384" y="122" className="svgnum" style={{ fill: C.gold }}>止损线</text>
            <circle cx="180" cy="96" r="7" fill={C.gold} />
            <text x="190" y="92" className="svgtag" style={{ fill: C.gold }}>触及止损 → 离场</text>
            <line x1="180" y1="96" x2="680" y2="96" stroke={C.lineSoft} strokeDasharray="2 6" />
            <text x="430" y="86" className="svgtag" style={{ fill: C.creamDim }}>之后空仓观望，毫发无伤</text>
          </g>
        )}
      </svg>
      <div className="outcome">
        <div className={"ocard bad " + (avg ? "live" : "")}>
          <h5>① 向下摊平（书中真实）</h5>
          <div className="big">≈ 赔光全部前期利润</div>
          <p>持仓滚雪球到 440,000 包；越跌越买、用钱去「托价」。书中原话：lost nearly all I had made.</p>
        </div>
        <div className={"ocard good " + (!avg ? "live" : "")}>
          <h5>② 果断止损（应有纪律）</h5>
          <div className="big">仅一次小亏损</div>
          <p>承认判断错误、立即离场，损失被锁定在可控范围，本金得以保全，留得青山在。</p>
        </div>
      </div>
      <p className="vcap">
        利弗莫尔自嘲这是「<b>超级傻瓜玩法（supersucker play）</b>」：背叛自己看空的判断去做多，又一路加仓去托价。
        这违背了他自己悟出的铁律——<b>截断亏损，让利润奔跑；只加盈利仓，绝不摊平亏损仓。</b>
      </p>
    </div>
  );
}

function BreakoutPar() {
  const consol = [[60, 200], [140, 188], [220, 176], [300, 162], [360, 150]];
  const up = [[360, 150], [440, 120], [540, 96], [640, 72], [700, 60]];
  return (
    <div className="viz">
      <div className="vhead"><div><p className="vtitle">站上整数关口 100（par）再出手</p>
        <span className="chen">伯利恒钢铁 · 1915 —— 确保「第一战必胜」</span></div></div>
      <svg viewBox="0 0 760 270">
        <Defs id="bp" color={C.gold} />
        <line x1="50" y1="150" x2="730" y2="150" stroke={C.gold} strokeWidth="1.4" strokeDasharray="6 5" />
        <text x="54" y="143" className="svgnum" style={{ fill: C.gold }}>整数关口 100 (PAR)</text>
        <path d={smoothPath(consol)} fill="none" stroke={C.brass} strokeWidth="2.2" />
        <text x="120" y="225" className="svgtag" style={{ fill: C.creamDim }}>关口下方蓄势，强忍不追</text>
        <path d={smoothPath(up)} fill="none" stroke={C.gold} strokeWidth="2.6" markerEnd="url(#bp)" />
        <circle cx="366" cy="150" r="6.5" fill={C.gold} />
        <text x="376" y="146" className="svgtag" style={{ fill: C.gold }}>站上 100 → 买入</text>
        <text x="610" y="60" textAnchor="end" className="svgtag" style={{ fill: C.green }}>动能延续 +30~50 点</text>
      </svg>
      <p className="vcap">
        哪怕逻辑早已清晰，他也强迫自己<b>等到价格首次站上整数关口</b>才进场——因为经验告诉他，一只股票第一次越过 100/200/300，往往会继续上冲。
        耐心地等「确认信号」，是「最小阻力线」的实战运用。
      </p>
    </div>
  );
}

function ManipulationChart() {
  const line = [[60, 210], [160, 206], [280, 200], [360, 168], [460, 124], [520, 104], [580, 100], [640, 120], [700, 142]];
  const vols = [
    [80, 14], [120, 12], [160, 16], [210, 13], [250, 18],
    [310, 30], [350, 42], [400, 52], [450, 60], [500, 64],
    [550, 58], [600, 50], [650, 40], [690, 30],
  ];
  return (
    <div className="viz">
      <div className="vhead"><div><p className="vtitle">操纵的三幕：吸筹 → 拉抬 → 派发</p>
        <span className="chen">如何把巨量筹码卖出去而不打垮价格</span></div></div>
      <svg viewBox="0 0 760 300">
        {/* phase bands */}
        <rect x="50" y="40" width="240" height="200" fill="rgba(143,176,90,0.05)" />
        <rect x="290" y="40" width="240" height="200" fill="rgba(212,175,55,0.06)" />
        <rect x="530" y="40" width="200" height="200" fill="rgba(192,83,59,0.06)" />
        <text x="170" y="58" textAnchor="middle" className="svgtag" style={{ fill: C.green }}>① 吸筹</text>
        <text x="410" y="58" textAnchor="middle" className="svgtag" style={{ fill: C.gold }}>② 拉抬 · 制造活跃</text>
        <text x="630" y="58" textAnchor="middle" className="svgtag" style={{ fill: "#E08A72" }}>③ 派发</text>
        {/* volume */}
        {vols.map((v, i) => <rect key={i} x={v[0] - 8} y={250 - v[1]} width="14" height={v[1]} fill="rgba(212,175,55,0.28)" />)}
        <text x="64" y="248" className="svgnum">成交量</text>
        {/* price */}
        <path d={smoothPath(line)} fill="none" stroke={C.cream} strokeWidth="2.4" />
        <text x="160" y="196" className="svgnum" style={{ fill: C.green }}>悄悄低位吸货</text>
        <text x="410" y="150" textAnchor="middle" className="svgtag" style={{ fill: C.gold, fontSize: "12px" }}>制造赚钱效应，吸引公众</text>
        <text x="620" y="100" textAnchor="middle" className="svgtag" style={{ fill: "#E08A72", fontSize: "12px" }}>把大宗卖给追涨的人</text>
      </svg>
      <p className="vcap">
        在缺乏监管的年代，大资金「做」一只股票的逻辑是工程问题：先<b>清理浮筹、悄悄吸纳供给</b>，再用成交量和上涨制造活跃与赚钱效应吸引公众，
        最后把巨量头寸<b>派发给追涨的接盘者</b>。读懂这一面，你才不会成为别人派发的对手盘。
      </p>
    </div>
  );
}

function PsychologyDiagram() {
  return (
    <div className="viz">
      <div className="vhead"><div><p className="vtitle">散户为何总亏：颠倒的「希望」与「恐惧」</p>
        <span className="chen">业余者的本能，恰好与赚钱之道相反</span></div></div>
      <div className="psy">
        <div className="pcol bad">
          <h4>持有亏损单</h4>
          <div className="pstep"><span className="k">本能 →</span> 抱有「<b style={{ color: C.cream }}>希望</b>」：盼着回本</div>
          <div className="pdown">▼</div>
          <div className="pstep"><span className="k">行为 →</span> 死扛、甚至加码</div>
          <div className="pdown">▼</div>
          <div className="pstep"><span className="k">结果 →</span> 亏损越滚越大</div>
          <div className="pfix bad"><b>✓ 正确：</b>该「恐惧」时就恐惧 —— 果断止损</div>
        </div>
        <div className="pcol good">
          <h4>持有盈利单</h4>
          <div className="pstep"><span className="k">本能 →</span> 陷入「<b style={{ color: C.cream }}>恐惧</b>」：怕利润回吐</div>
          <div className="pdown">▼</div>
          <div className="pstep"><span className="k">行为 →</span> 过早获利了结</div>
          <div className="pdown">▼</div>
          <div className="pstep"><span className="k">结果 →</span> 只赚到一点蝇头小利</div>
          <div className="pfix good"><b>✓ 正确：</b>该「希望」时就希望 —— 让利润奔跑</div>
        </div>
      </div>
      <p className="vcap">
        把情绪用反了，就是亏损的总根源：对亏损单心存侥幸（应恐惧），对盈利单战战兢兢（应抱希望）。
        <b>对亏损要恐惧、果断离场；对盈利要耐心、让它奔跑。</b> 投机者真正的敌人，永远从他内心生长。
      </p>
    </div>
  );
}

const BucketShop = () => (
  <div className="viz">
    <div className="vhead"><div><p className="vtitle">对赌行 vs 正规经纪行：同样的技能，不同的游戏</p>
      <span className="chen">利弗莫尔在纽约亏光的真正原因</span></div></div>
    <div className="bs">
      <div className="bcol">
        <span className="tag">Bucket Shop</span>
        <h4>对赌行</h4>
        <div className="flow">
          <div className="node">你（赌客）</div>
          <div className="arr">↕ 对赌</div>
          <div className="node h">庄家（房子）</div>
        </div>
        <p className="note">没有真实股票易手，你只是和庄家<b>对赌磁带上的报价</b>。成交即时、无延迟、无滑点；但 1% 保证金一被触及就立刻爆仓。</p>
      </div>
      <div className="vs">≠</div>
      <div className="bcol">
        <span className="tag">Real Broker</span>
        <h4>正规经纪行</h4>
        <div className="flow">
          <div className="node">你</div>
          <div className="arr">↓ 下单</div>
          <div className="node">经纪商</div>
          <div className="arr">↓ 送交所撮合</div>
          <div className="node h">交易所</div>
        </div>
        <p className="note">真实下单要排队撮合：<b>执行有延迟、价格有滑点</b>，大单还会<b>冲击价格</b>。这些都是看不见的「摩擦成本」。</p>
      </div>
    </div>
    <p className="vcap">
      在对赌行无往不利的那套打法，到了有真实摩擦的市场就失灵了。<b>把模拟盘/小资金的成功直接外推到真实大资金，是新手最典型的幻觉。</b>
      读盘的能力没错，错的是没意识到「执行环境」已经彻底变了。
    </p>
  </div>
);

const VIZ = {
  tape: TickerTape, bucketshop: BucketShop, sittight: SitTightChart,
  leastresistance: LeastResistance, panic1907: Panic1907, cotton: CottonInteractive,
  comeback: BreakoutPar, manipulation: ManipulationChart, psychology: PsychologyDiagram,
};

/* ----------------------------- CONTENT ----------------------------- */
const ACTS = [
  {
    id: 1, kicker: "第一幕 · ACT I", label: "投机的启蒙：在对赌行里学会读盘",
    chapters: [
      {
        n: 1, title: "报价板上的男孩", en: "The Quotation-Board Boy",
        gist: "十四岁的拉里在波士顿一家券商当报价板小弟，把行情磁带（ticker tape）上跳动的数字抄到黑板上。他对数字有惊人的记忆，开始用本子记录每只股票的「习性」——通常怎么波动、何时反常，并把预测与实际对照。他逐渐悟到一个贯穿一生的信念：今天股市里发生的一切，过去发生过、将来还会再发生。他用极小的本金在对赌行做了第一笔投机，赚了 3.12 美元；很快因赢得太多，被对赌行盯上。",
        lessons: [
          "价格行为本身就是信息。利弗莫尔的起点不是基本面，而是对「价格如何运动」的纯粹观察——这是技术派的源头之一。",
          "历史会重演，因为人性不变。这是他全部方法论的地基：模式之所以反复出现，是因为驱动价格的恐惧与贪婪从未改变。",
          "把预测写下来再与结果核对——最朴素、也最有效的「复盘闭环」。今天你依然该这么做交易日志。",
        ],
        quote: { en: "There is nothing new in Wall Street. There can't be, because speculation is as old as the hills.", zh: "华尔街没有新鲜事。也不可能有——因为投机和山丘一样古老。", cite: "Chapter I" },
        viz: "tape",
      },
      {
        n: 2, title: "当「赢钱机器」撞上真实市场", en: "Beating the Shops, Losing in New York",
        gist: "他横扫波士顿的对赌行，赢到没人肯收他的单。二十一岁带着积蓄闯纽约，在正规交易所的经纪行交易——却几乎亏光。他百思不得其解：同样的判断，为什么在这里失灵？答案藏在「游戏规则」里：对赌行赌的是磁带报价、即时成交、没有摩擦；真实市场里，下单要送交易所撮合，等回报时价格早已移动，大单还会冲击行情。",
        lessons: [
          "先看清你在玩哪一种游戏。同一套技能在不同的市场结构里，结果可以天差地别。",
          "滑点、延迟、流动性、市场冲击，是真实交易的「隐形税」——它们足以吃掉一套在无摩擦环境里稳赢的策略。",
          "工具（读盘）没错，错的是没意识到执行环境变了。这是无数量化/模拟盘选手转实盘翻车的同一个坑。",
        ],
        viz: "bucketshop",
      },
      {
        n: 3, title: "回炉重造：再赚一笔本钱", en: "Going Back to Make a Stake",
        gist: "亏光后他没有沉沦太久，而是回到对赌行重新积累本金——甚至化名、乔装，去那些还肯收他单的店（如圣路易斯的 Teller's），因为他的名声让庄家闻风丧胆。这一段展示了他惊人的韧性，也揭示了一个冷酷现实：本金，是投机者的弹药。",
        lessons: [
          "投机者第一要务是活下来、保住本钱。没有筹码，再好的判断都无从兑现。",
          "把破产当学费，而不是终点——复原力（resilience）是这一行的核心素质。",
          "但要警惕：此时他只是先解决了「钱」的问题，对纽约失败的根因仍未真正参透。教训若不深挖，下一次还会重蹈。",
        ],
      },
    ],
  },
  {
    id: 2, kicker: "第二幕 · ACT II", label: "第一课：光判断对方向，还不够",
    chapters: [
      {
        n: 4, title: "回到原点：看对了，却没赚到钱", en: "Right on the Market, Yet Broke",
        gist: "又一次破产、回到家乡，他开始反思一个刺痛的悖论：自己常常「看对了大方向」，却仍然没赚到钱、甚至亏钱。问题不在判断，而在执行的时机与持有的耐心——他在正确的方向上「赚小钱、亏大钱」，因为频繁进出、过早获利了结，又在反弹里被反复洗出。",
        lessons: [
          "「看对」和「赚钱」是两件事。市场里最贵的，往往不是错误的判断，而是正确判断之下的错误行为。",
          "频繁交易是利润的杀手：手续费、点差，加上被短期波动洗出局的机会成本。",
          "这一章是通往「老火鸡」智慧的心理铺垫——他已经摸到门，只差捅破那层窗户纸。",
        ],
      },
      {
        n: 5, title: "老火鸡：「这可是牛市啊，你懂的」", en: "Old Turkey: \"It's a Bull Market, You Know!\"",
        gist: "全书最著名的一章。经纪行里有位与众不同的老人帕特里奇（被背后唤作「火鸡」）：他从不主动给小道消息，别人怂恿他在反弹里卖出、低位再买回，他总温和地回同一句——「你要知道，这是牛市啊！」利弗莫尔起初不解，后来大彻大悟：老火鸡是在说，大钱不在个股的短期波动里，而在对整个市场大方向的把握与坚守里。卖掉好仓位，就等于「丢掉自己的位置」。",
        lessons: [
          "趋势跟随的本源：判断「牛市还是熊市」这个主方向，比预测每天的涨跌重要一万倍。",
          "「坐功」是最难的修行。既能看对、又能坐稳的人极其罕见——而正是这种人才能赚到大钱。",
          "不要为一次小回调而丢掉一个大趋势的仓位：丢了位置，你常常就再也回不到原点了。",
        ],
        quote: { en: "It was never my thinking that made the big money for me. It always was my sitting. Got that? My sitting tight!", zh: "让我赚到大钱的，从来不是我的思考，而是我的坐功。明白吗？是稳稳地坐着不动！", cite: "Chapter V · Old Turkey" },
        viz: "sittight",
      },
    ],
  },
  {
    id: 3, kicker: "第三幕 · ACT III", label: "读懂大势：两场危机中的封神",
    chapters: [
      {
        n: 6, title: "1906：地震前的做空", en: "1906: Shorting Before the Earthquake",
        gist: "基于对整体形势的判断，他重仓做空联合太平洋（Union Pacific）等铁路股。一开始市场不配合、甚至逆着他走，但他选择相信自己的逻辑、扛住浮亏。随后旧金山大地震重创铁路资产，股价崩跌，他大赚一笔——既靠判断，也带着几分运气。",
        lessons: [
          "当判断基于对「大局/系统性条件」的理解时，要有耐心等市场认账。浮亏不等于判断错——前提是逻辑成立、仓位受控。",
          "他自己也承认这一役有运气成分。别把单次结果当成方法的全部验证——这是难得的诚实。",
          "勇气来自相信自己的判断；但勇气必须配上风控，否则就是莽撞。",
        ],
      },
      {
        n: 7, title: "从个股到大盘：顺势加仓的纪律", en: "Sizing Up the Whole Market",
        gist: "他完成方法论的关键升级：不再盯单只股票，而是先研判整个市场是牛是熊；上升市里只做多、且每一笔都买在比上一笔更高的价位（金字塔加仓），下跌市里只做空，绝不为短期反向波动而频繁掉头。他也描述了「最小阻力线」的雏形——价格会沿阻力最小的方向运动，交易者要做的是识别并跟随它。",
        lessons: [
          "先有「市场观」，再谈「个股操作」——自上而下（top-down）。",
          "顺势加仓：在被验证为正确的盈利方向上加码，而不是在亏损方向上摊平（这正是后面棉花惨案的反面镜子）。",
          "最小阻力线：与其费力预测，不如等价格自己「选边」，然后站到它那一边。",
        ],
        quote: { en: "The big money was not in the individual fluctuations but in the main movements.", zh: "大钱不在个股的零碎波动里，而在主趋势的大波动之中。", cite: "Chapter VII" },
        viz: "leastresistance",
      },
      {
        n: 8, title: "1907：与摩根擦肩的「封神之日」", en: "1907: The Day of Days",
        gist: "通过对资金与信贷紧张的研判，他预见到一场大恐慌，建立了庞大的空头。1907 年 10 月市场崩溃，他在「那一天」账面盈利达数百万美元，一举成为华尔街真正的大人物。市场流动性枯竭到极点时，据传摩根（J.P. Morgan）一方派人请他停止做空，以免击穿整个市场——他选择平掉空头、反手做多，既兑现了利润，也「稳住」了局面。这是他从赌客蜕变为投机大师的分水岭。",
        lessons: [
          "系统性风险（信贷、流动性）的研判，能带来人生级别的机会——但只对早有准备、敢下重注且控制好风险的人。",
          "在极端行情里保持冷静与纪律，比任何时候都值钱。恐慌中能思考的人极少。",
          "顶级玩家懂得「见好就收」：他在恐慌最深处反手做多，顺应了随后的反弹。",
        ],
        quote: { en: "A man must believe in himself and his judgment if he expects to make a living at this game.", zh: "想靠这一行吃饭，一个人必须相信自己、相信自己的判断。", cite: "Chapter VIII" },
        viz: "panic1907",
      },
    ],
  },
  {
    id: 4, kicker: "第四幕 · ACT IV", label: "最惨痛的一课：听信他人，逆着自己",
    chapters: [
      {
        n: 9, title: "佛州海钓与商品市场的试炼", en: "Florida, and the Move into Commodities",
        gist: "1907 后信心爆棚，他把战场扩展到大宗商品（小麦、玉米、棉花）。一次在佛罗里达海钓度假，听说市场大涨，立刻被拉回交易。他卷入与 Stratton 的玉米逼仓（corn corner）博弈，靠机敏腾挪化解；又在七月棉花上漂亮获利。这是他风头最盛、也最容易自满的时刻——为崩塌埋下伏笔。",
        lessons: [
          "成功之后的「自满」，是最危险的市场情绪。",
          "逼仓（corner）等结构性博弈提醒我们：当对手能「挤压」你的资金面时，再正确的方向也可能被拖垮。",
          "度假也戒不掉的「手痒」——这是交易成瘾的早期信号，值得每个交易者警惕。",
        ],
      },
      {
        n: 10, title: "棉花上的得意", en: "Triumph in Cotton",
        gist: "他在棉花上接连得手，「七月棉花」一役比预期更成功，名声大噪。正是这种连胜，让他对自己的判断、以及对「专家权威」的态度都开始松动——他即将遇到那个改变命运的人。",
        lessons: [
          "连胜会侵蚀纪律：人在赢的时候，最容易放下自己的原则。",
          "名声是把双刃剑——它会把「权威」吸引到你面前，诱你偏离自己的系统。",
        ],
      },
      {
        n: 11, title: "棉花大王的崩塌与逼仓余波", en: "Percy Thomas's Collapse",
        gist: "整个棕榈滩都在议论「棉花大王」珀西·托马斯在三月棉花上的惨败。利弗莫尔反而对托马斯的气度心生敬佩（托马斯曾在另一役中连本带息还清百万债务、自己还净赚一百万）。与此同时，他自己也在 Stratton 的逼仓中艰难脱身、平掉玉米。流言与逼仓交织，尽显市场人性。",
        lessons: [
          "流言的失真：一个传闻在二十四小时内就能面目全非——市场里所谓「信息」，往往是噪音。",
          "对「失败的强者」心生敬佩，可能成为你放下戒心的入口——下一章就是代价。",
        ],
      },
      {
        n: 12, title: "珀西·托马斯：用别人的脑子交易", en: "Trading on Another Man's Brain",
        star: true,
        gist: "托马斯登门提议合伙（他出信息、利弗莫尔操盘）。利弗莫尔婉拒，因为他坚持独立、不愿被人依赖、要按自己的想法做。但他坦言自己的致命弱点：会被一个聪明的头脑和雄辩的论证说服。果然，托马斯用一套眩目的分析，把他本来「看空」的棉花，做成了「做多」。更糟的是，为了「托住价格不让它跌」，他竟一路向下加仓，越买越多，累计 440,000 包棉花才惊觉自己在做什么。为时已晚，只能割肉，几乎赔光此前在股票和商品上赚到的全部利润。",
        lessons: [
          "全书最贵的一课：用别人的脑子交易，必败。再权威、再雄辩的他人意见，都不能替代你自己的判断与系统。",
          "「为了托价而向下加仓」是典型的「超级傻瓜玩法」——它彻底违背了「截断亏损、让利润奔跑」的铁律。",
          "看空却做多：一旦背叛了自己的判断，后续的每一步都会越走越错。加仓只能加在被验证正确的盈利仓位上。",
        ],
        quote: { en: "I kept on buying cotton to keep the price from going down. If that isn't a supersucker play, what is?", zh: "我不停买入棉花，只为不让价格下跌。如果这都不算「超级傻瓜玩法」，那什么才算？", cite: "Chapter XII" },
        viz: "cotton",
      },
      {
        n: 13, title: "破产、负债与「心被掏空」的四年", en: "Broke, in Debt, Four Lean Years",
        gist: "他再次破产，背上逾百万美元的债务，身心俱疲、神经紧张、无法冷静思考——他坦言这种「既破产、判断又失灵」的状态最为致命。接着是一段漫长的「无钱可赚」的萧条期，他甚至要靠 Williamson 的关系周转。这一章揭示了交易者的财务状态与心理状态如何相互绞杀。",
        lessons: [
          "心理资本和金钱资本同等重要：没钱时人会恐惧、急躁，从而做出更糟的决策，陷入恶性循环。",
          "不是任何时候都有行情。「四年贫瘠期」提醒我们：市场有不适合交易的阶段，强行出手只会受伤。",
          "债务是心智的枷锁——他后来正是先卸下「负债的心理包袱」，才得以重生（见第 14、16 章）。",
        ],
      },
    ],
  },
  {
    id: 5, kicker: "第五幕 · ACT V", label: "东山再起：纪律的回归",
    chapters: [
      {
        n: 14, title: "伯利恒钢铁：站上整数关口再出手", en: "Bethlehem Steel: Buying After Par",
        star: true,
        gist: "1915 年初，一战让伯利恒钢铁的多头逻辑昭然若揭。他极度渴望重回大舞台，却强迫自己「等待」——等股价首次站上整数关口 100（par）才动手，因为根据他从对赌行时代就总结的经验：一只股票第一次突破 100/200/300，往往会继续上冲 30 到 50 点（如当年的 Anaconda，200 买入、次日 260 卖出）。突破后他买入，伯利恒钢铁一路飙升，他借此重新站起，踏上还债与复兴之路。",
        lessons: [
          "耐心 + 时机：哪怕逻辑已清晰，也要等「确认信号」（突破整数关/创新高）再出手，确保第一战必胜。",
          "整数关口/创新高突破：价格越过重要心理关口后，动能往往延续——这是「最小阻力线」的具体运用。",
          "先卸下心理包袱，再谈赚钱：他特意先处理好「债务的心结」，让自己回到能冷静交易的状态。",
        ],
        quote: { en: "Whenever a stock crosses 100 or 200 or 300 for the first time, it nearly always keeps going.", zh: "每当一只股票第一次越过 100、200 或 300，它几乎总会继续往上走。", cite: "Chapter XIV" },
        viz: "comeback",
      },
      {
        n: 15, title: "防不胜防：投机中的「意外」", en: "The Unexpected You Cannot Guard Against",
        gist: "他冷静地谈到投机中最高级别的风险之一——「意外，乃至不可预料之事」。一个人可以尽力防范他人、读懂市场、避免犯错，若因此而亏，他不必懊恼；但当他一切都做对了，却仍被突发事件击中而亏损，那才最令人痛恨。他也痛陈「小道消息/暗示」之害。",
        lessons: [
          "风险管理的边界：有些风险（黑天鹅）无法消除，只能靠仓位与止损去「限制损失的大小」。",
          "区分「可控」与「不可控」：把精力放在可控的纪律上，对不可控的意外保持敬畏与缓冲。",
          "即使做对一切，也可能亏钱——接受这一点，才能不被偶然的失败击垮心态。",
        ],
      },
      {
        n: 16, title: "还清百万债务：投机者的荣誉", en: "Paying Off the Debts",
        gist: "重新富起来后，他选择把当年那些「在法律上已被免除」的债务连本带息全部还清。这一章是性格的注脚：纪律不仅体现在交易里，也体现在做人上。卸下债务的他，终于能以平静的心态全力交易。",
        lessons: [
          "品格与纪律是一体两面：能管住自己交易行为的人，往往也能扛住做人的责任。",
          "「心安」是高水平发挥的前提——他还债不只是道德选择，也是为自己清空心理负担。",
        ],
      },
    ],
  },
  {
    id: 6, kicker: "第六幕 · ACT VI", label: "操纵的艺术与投机的本质",
    chapters: [
      {
        n: 17, title: "经验之谈：商品、趋势与领头羊", en: "Hard-Won Trading Philosophy",
        gist: "进入全书的「方法论沉淀」部分。他总结：大钱往往在大宗商品的大趋势里；要交易板块中的「龙头股」（leaders），因为强势的领头羊最能反映趋势；不要分散精力去猜每只落后股。",
        lessons: [
          "交易龙头：顺着最强的标的做，而不是去抄「看起来便宜」的落后股。",
          "抓主趋势、抓主要矛盾，忽略零碎噪音——少即是多。",
        ],
      },
      {
        n: 18, title: "投机者的自我修养", en: "The Education Never Ends",
        gist: "他强调投机是一门需要终生学习的「专业」，而非赌博；每一次教训都要内化为规则。他反复回到那个母题：人最大的敌人是自己——是希望、恐惧、贪婪与无知。",
        lessons: [
          "把投机当作一门专业来经营，像医生、工程师一样持续精进。",
          "最大的对手在内心：情绪管理是终身课题，没有「毕业」那一天。",
        ],
      },
      {
        n: 19, title: "操纵的真相", en: "What Manipulation Really Is",
        gist: "他开始系统讲解「操纵」（manipulation）——在那个监管尚不完善的年代，大资金如何「制造」一只股票的行情。他澄清：所谓操纵，本质上是「如何把大量股票卖出去（或买进来）而不把价格打垮（或拉爆）」的工程问题。",
        lessons: [
          "理解市场的另一面：价格不只由「价值」驱动，也由「大资金的进出工程」驱动。",
          "看懂「谁在派发、谁在吸筹」，比单纯看图形更深一层。",
        ],
      },
      {
        n: 20, title: "基恩：操纵大师的范本", en: "James R. Keene, the Master",
        gist: "他以同时代最伟大的操纵者詹姆斯·R·基恩（James R. Keene）为范例——基恩为美国钢铁（U.S. Steel）等做市，手法高明，能在合适的市场条件下精准地拉抬与派发，靠的是经验与胆识。",
        lessons: [
          "大师的操纵建立在「顺应市场条件」之上，而非凭空逆势硬推。",
          "制造「活跃度与赚钱效应」来吸引公众接盘，是派发大宗筹码的核心技巧。",
        ],
      },
      {
        n: 21, title: "我如何入了操纵这行", en: "How I Got Into Manipulation",
        gist: "1915 年靠伯利恒钢铁翻身后，他受人之托替别人「营销股票」（marketing stock），由此亲身进入操纵这一行。他描述第一步：先悄悄吸纳市场上某价位（如 70）挂出的所有卖单，撤掉价格上方的抛压，为后续拉抬创造条件。",
        lessons: [
          "操纵的第一步是「清理浮筹、吸纳供给」，而非急于拉高。",
          "任何操作都要「有理由」——他强调自己从不盲目下注（I never have believed in blind gambling）。",
        ],
        viz: "manipulation",
      },
      {
        n: 22, title: "派发的艺术：把大象卖出去而不惊动市场", en: "The Art of Distribution",
        gist: "他详述如何在不压垮价格的前提下卖出巨量筹码：核心是「制造一个有买盘承接的活跃市场」——通过自身的买卖制造成交量与上涨假象，吸引公众与跟风盘进场，再把自己的大宗头寸悄悄派发给这些需求。",
        lessons: [
          "卖出巨量的唯一方法，是「创造出愿意接盘的需求」。",
          "公众的「追涨」心理，正是大资金派发的对手盘——理解这一点，能帮你避免成为「接盘侠」。",
        ],
      },
      {
        n: 23, title: "小道消息：人人都想要的毒药", en: "Tips: The Poison Everyone Craves",
        gist: "他辛辣地剖析「小道消息」（tips）：人们不仅渴望得到，还热衷于给出。他尤其痛斥媒体刊登「据某不具名高层消息」之类的暗示性内幕，认为这是应被禁止的不道德行为——因为它专门收割轻信的公众。",
        lessons: [
          "远离小道消息：无论来自朋友、内部人还是媒体，依赖消息 = 放弃自己的判断（呼应第 12 章）。",
          "公众之所以长期亏钱，正是因为他们用「别人的消息」代替了「自己的系统」。",
        ],
        quote: { en: "Tips! How people want tips! They crave not only to get them but to give them.", zh: "小道消息！人们多想要小道消息啊！他们不仅渴望得到，还热衷于给出。", cite: "Chapter XXIII" },
      },
      {
        n: 24, title: "投机的本质：与自己人性的永恒博弈", en: "The Nature of Speculation",
        star: true,
        gist: "收束全书。他指出投机真正的战场在人心：业余者总是「该恐惧时怀抱希望、该希望时陷入恐惧」——持有亏损单时盼回本（希望），持有盈利单时怕回吐（恐惧），于是过早卖掉赢家、死扛输家，恰好与赚钱之道相反。他再次重申那句箴言：华尔街没有新鲜事，因为人性永不改变。投机如山岳般古老，它考验的从来都是同一件事——你能否战胜自己的希望、恐惧、贪婪与无知。",
        lessons: [
          "情绪的颠倒，是散户亏损的心理总根源。正确的做法是：对亏损要「恐惧」（果断止损），对盈利要「希望」（让利润奔跑）。",
          "投机者的敌人在内：希望、恐惧、贪婪、无知（the enemies within）。",
          "终极智慧：方法可以学，但能否赚钱，最终取决于你的纪律与自制。",
        ],
        quote: { en: "The speculator's chief enemies are always boring from within. It is inseparable from human nature to hope and to fear.", zh: "投机者的头号敌人，永远是从内部侵蚀他的——希望与恐惧，乃人性所固有，无法剥离。", cite: "Chapter XXIV" },
        viz: "psychology",
      },
    ],
  },
];

const RULES = [
  ["先定牛熊，再做个股", "自上而下：先研判整个市场的主方向，个股操作服从大势。"],
  ["坐得住，让利润奔跑", "「大钱在坐功里」。看对还能坐稳的人极少——而这正是赚大钱的人。"],
  ["截断亏损，绝不摊平", "亏损单果断离场；永远不要向下加仓去「托价」——那是超级傻瓜玩法。"],
  ["只在确认后顺势加仓", "加仓只加在被验证正确的盈利仓位上：突破、创新高、过整数关之后。"],
  ["跟随最小阻力线", "不预测顶底；等价格自己选边，再站到它那一边。"],
  ["独立判断，远离消息", "用别人的脑子交易必败。小道消息是毒药，无论它来自谁。"],
  ["本金即弹药，先求生存", "保住本钱才有下一局。资金管理高于一切单笔机会。"],
  ["敬畏不可控的意外", "黑天鹅无法预防，只能用止损与仓位限制损失的大小。"],
  ["战胜希望与恐惧", "对亏损要恐惧、对盈利要抱希望——把散户颠倒的情绪扳回来。"],
  ["把投机当终身专业", "像医生、工程师一样持续精进；每个教训都内化成规则。"],
];

const FAMOUS = [
  { en: "It was never my thinking that made the big money for me. It always was my sitting.", zh: "让我赚到大钱的，从来不是我的思考，而是我的坐功。", cite: "第 5 章 · 老火鸡" },
  { en: "Markets are never wrong; opinions often are.", zh: "市场永远没错，错的往往是你的看法。", cite: "全书母题" },
  { en: "The big money was not in the individual fluctuations but in the main movements.", zh: "大钱不在个股的零碎波动里，而在主趋势的大波动之中。", cite: "第 7 章" },
  { en: "A man must believe in himself and his judgment if he expects to make a living at this game.", zh: "想靠这一行吃饭，必须相信自己、相信自己的判断。", cite: "第 8 章" },
  { en: "There is nothing new in Wall Street. Speculation is as old as the hills.", zh: "华尔街没有新鲜事。投机和山丘一样古老——因为人性从不改变。", cite: "第 1 / 24 章" },
  { en: "The speculator's chief enemies are always boring from within: to hope and to fear.", zh: "投机者的头号敌人，永远从内部生长——希望，与恐惧。", cite: "第 24 章" },
];

/* ----------------------------- PAGES MODEL ----------------------------- */
function buildPages() {
  const pages = [{ kind: "overview", navLabel: "导论 · 一生的盈亏曲线", short: "导论：盈亏曲线" }];
  ACTS.forEach((act) =>
    act.chapters.forEach((ch) =>
      pages.push({ kind: "chapter", act, ch, navLabel: `${ch.n}. ${ch.title}`, short: `第${ch.n}章` })
    )
  );
  pages.push({ kind: "synthesis", navLabel: "总纲 · 法则与金句", short: "总纲：法则与金句" });
  return pages;
}

/* ----------------------------- APP ----------------------------- */
export default function App() {
  const pages = useMemo(buildPages, []);
  const [i, setI] = useState(0);
  const page = pages[i];
  const go = (idx) => { setI(idx); if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); };

  const totalCh = pages.filter((p) => p.kind === "chapter").length;
  const chIndex = page.kind === "chapter" ? page.ch.n : null;

  return (
    <div className="soa">
      <style>{CSS}</style>
      <TickerTape />
      <div className="wrap">
        <header className="mast">
          <div className="eyebrow">互动导读 · Interactive Reading Guide</div>
          <h1 className="title">股票作手<span className="em">回忆录</span></h1>
          <p className="subtitle">Reminiscences of a Stock Operator —— 一个投机者用破产换来的智慧</p>
          <div className="meta">
            <span>作者 · <b>Edwin Lefèvre</b></span>
            <span>原型 · <b>Jesse Livermore</b>（书中化名 Larry Livingston）</span>
            <span>出版 · <b>1923</b></span>
            <span>篇章 · <b>24 章 / 六幕</b></span>
          </div>
        </header>

        <div className="layout">
          {/* sidebar */}
          <nav className="side">
            <button className={"navItem nav-top " + (page.kind === "overview" ? "on" : "")} onClick={() => go(0)}>
              <span className="n">00</span>导论：一生的盈亏曲线
            </button>
            {ACTS.map((act) => (
              <div key={act.id}>
                <div className="actHead"><span className="rn">{romize(act.id)}</span>{act.label}</div>
                {act.chapters.map((ch) => {
                  const idx = pages.findIndex((p) => p.kind === "chapter" && p.ch.n === ch.n);
                  return (
                    <button key={ch.n} className={"navItem " + (i === idx ? "on" : "")} onClick={() => go(idx)}>
                      <span className="n">{String(ch.n).padStart(2, "0")}</span>{ch.title}{ch.star ? " ★" : ""}
                    </button>
                  );
                })}
              </div>
            ))}
            <div className="actHead"><span className="rn">∎</span>收束</div>
            <button className={"navItem " + (page.kind === "synthesis" ? "on" : "")} onClick={() => go(pages.length - 1)}>
              <span className="n">25</span>总纲：法则与金句
            </button>
          </nav>

          {/* reader */}
          <main className="reader">
            {/* mobile nav */}
            <div className="mnav">
              <label>跳转章节 · Jump to</label>
              <select value={i} onChange={(e) => go(Number(e.target.value))}>
                <option value={0}>00 · 导论：一生的盈亏曲线</option>
                {ACTS.map((act) => (
                  <optgroup key={act.id} label={act.label}>
                    {act.chapters.map((ch) => {
                      const idx = pages.findIndex((p) => p.kind === "chapter" && p.ch.n === ch.n);
                      return <option key={ch.n} value={idx}>{String(ch.n).padStart(2, "0")} · {ch.title}{ch.star ? " ★" : ""}</option>;
                    })}
                  </optgroup>
                ))}
                <option value={pages.length - 1}>25 · 总纲：法则与金句</option>
              </select>
            </div>

            <div className="fade" key={i}>
              {page.kind === "overview" && <Overview />}
              {page.kind === "chapter" && <Chapter act={page.act} ch={page.ch} totalCh={totalCh} />}
              {page.kind === "synthesis" && <Synthesis />}
            </div>

            {/* nav buttons */}
            <div className="navbtns">
              <button className="nbtn" disabled={i === 0} onClick={() => go(i - 1)}>
                <div className="dir">← 上一节</div>
                <div className="nm">{i > 0 ? pages[i - 1].short : "已是开篇"}</div>
              </button>
              <button className="nbtn next" disabled={i === pages.length - 1} onClick={() => go(i + 1)}>
                <div className="dir">下一节 →</div>
                <div className="nm">{i < pages.length - 1 ? pages[i + 1].short : "已是结尾"}</div>
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function romize(n) { return ["", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ"][n] || n; }

function Overview() {
  return (
    <div>
      <div className="r-eyebrow">导论 · INTRODUCTION</div>
      <div className="chnum">序</div>
      <h2 className="chtitle">一本用破产换来的投机圣经</h2>
      <p className="chen">为什么近百年后，交易者仍在反复重读这本书</p>
      <hr className="rule" />
      <p className="lead">
        《股票作手回忆录》以记者 Edwin Lefèvre 之笔，记录了二十世纪初最传奇的投机者
        <b> 杰西·利弗莫尔</b>（书中化名 Larry Livingston）的一生。它不是一本「技术指南」，
        而是一部关于<span className="hl">人性、纪律与自我博弈</span>的寓言。利弗莫尔从波士顿对赌行的报价板男孩起步，
        几度暴富、又几度破产——他赚到的每一桶金，几乎都对应着一次惨痛的教训。
      </p>
      <p className="lead" style={{ marginTop: 16 }}>
        这本书最深刻之处在于：它一次次证明，<b>「看对方向」只是入场券，真正决定输赢的是你能否管住自己。</b>
        下面这条曲线，就是全书的情感主线——读完六幕之后，再回头看它，你会有完全不同的体会。
      </p>
      <CareerArc />
      <div className="howto">
        <h4>如何使用本导读</h4>
        <ol>
          <li>本书 24 章被归入 <b>六幕</b>：从对赌行启蒙，到两场危机封神，再到棉花惨败、东山再起，最后是操纵的艺术与投机的本质。</li>
          <li>用左侧目录（手机端用顶部下拉菜单）<b>按章节</b>逐节阅读；每章包含「梗概 · 核心教训 · 原文金句」。</li>
          <li>标注 <b style={{ color: C.gold }}>★</b> 的是<b>枢纽章节</b>（第 5 / 12 / 14 / 24 章），配有可交互的图解，建议重点体会。</li>
          <li>读到第 12 章的<b>棉花图解</b>时，亲手点一下两种做法的切换，感受「向下摊平」与「果断止损」的天壤之别。</li>
          <li>最后回到 <b>总纲</b>，把散落各章的法则与金句收拢成一张可随时回看的清单。</li>
        </ol>
      </div>
    </div>
  );
}

function Chapter({ act, ch, totalCh }) {
  const Viz = ch.viz ? VIZ[ch.viz] : null;
  return (
    <div>
      <div className="r-eyebrow">
        <span>{act.kicker} · {act.label}</span>
        <span className="prog">第 {ch.n} / {totalCh} 章</span>
      </div>
      <div className="chnum">{String(ch.n).padStart(2, "0")}{ch.star && <small>★</small>}</div>
      <h2 className="chtitle">{ch.title}</h2>
      <p className="chen">{ch.en}</p>
      <hr className="rule" />

      <p className="lead">{ch.gist}</p>

      <div className="seclabel">核心教训 · Key Lessons</div>
      <div className="lessons">
        {ch.lessons.map((l, idx) => (
          <div className="lesson" key={idx}>
            <span className="mk">{idx + 1}</span>
            <p dangerouslySetInnerHTML={{ __html: emph(l) }} />
          </div>
        ))}
      </div>

      {ch.quote && (
        <div className="quote">
          <span className="mark">“</span>
          <p className="en">{ch.quote.en}</p>
          <p className="zh">{ch.quote.zh}</p>
          <div className="cite">— Reminiscences of a Stock Operator · {ch.quote.cite}</div>
        </div>
      )}

      {Viz && <Viz />}
    </div>
  );
}

function Synthesis() {
  return (
    <div>
      <div className="r-eyebrow">收束 · SYNTHESIS</div>
      <div className="chnum">纲</div>
      <h2 className="chtitle">利弗莫尔的交易法则</h2>
      <p className="chen">把散落六幕的智慧，收拢成一张随时回看的清单</p>
      <hr className="rule" />
      <p className="lead">
        这十条法则，没有一条是抽象的口号——每一条背后，都是利弗莫尔用<b>真金白银的破产</b>换来的。
        它们彼此呼应：<span className="hl">先定大势、顺势加仓、截断亏损、独立判断</span>，最终都指向同一件事——
        <b>战胜你自己的希望与恐惧</b>。
      </p>

      <div className="seclabel">十条铁律 · The Ten Laws</div>
      <div className="grid2">
        {RULES.map((r, idx) => (
          <div className="rcard" key={idx}>
            <span className="rn">{String(idx + 1).padStart(2, "0")}</span>
            <h4>{r[0]}</h4>
            <p>{r[1]}</p>
          </div>
        ))}
      </div>

      <div className="seclabel">不朽金句 · In His Own Words</div>
      {FAMOUS.map((q, idx) => (
        <div className="qsmall" key={idx}>
          <p className="en">“{q.en}”</p>
          <p className="zh">{q.zh}</p>
          <div className="cite">{q.cite}</div>
        </div>
      ))}

      <div className="quote" style={{ marginTop: 30 }}>
        <span className="mark">“</span>
        <p className="en">Speculation is as old as the hills. Whatever happens in the stock market today has happened before and will happen again.</p>
        <p className="zh">投机和山丘一样古老。今天股市里发生的一切，过去发生过，将来还会再发生——因为人性，永不改变。这，就是这本书写给每一代投机者的话。</p>
        <div className="cite">— 全书的回响</div>
      </div>
    </div>
  );
}

/* simple **bold** → <b>, 「」 highlight already styled */
function emph(s) {
  return s
    .replace(/「([^」]+)」/g, "「<b>$1</b>」")
    .replace(/（([^）]*?)）/g, '<span style="color:' + C.creamFaint + '">（$1）</span>');
}
