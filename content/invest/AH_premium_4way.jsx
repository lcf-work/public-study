import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList, Cell,
} from "recharts";

// 冷 → 暖 光谱：A股溢价 → H股溢价
const C_SMIC = "#15697e";   // 中芯国际 — 极端 A 股溢价
const C_YOFC = "#4e8c6a";   // 长飞光纤 — A 股溢价（收敛中）
const C_VG   = "#d2862a";   // 胜宏科技 — H 股小幅溢价
const C_MON  = "#bd3c10";   // 澜起科技 — H 股大幅溢价
const INK = "#1d1a16";
const MUTE = "#6f675a";
const PAPER = "#f6f1e6";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Archivo:wght@400;500;600;700&family=Spline+Sans+Mono:wght@500;600;700&display=swap');
.w *{box-sizing:border-box;margin:0;padding:0}
.w{background:${PAPER};color:${INK};font-family:'Archivo',sans-serif;line-height:1.55;
  background-image:radial-gradient(${INK}0a .5px,transparent .5px);background-size:7px 7px;padding:0 0 60px;overflow:hidden}
.in{max-width:960px;margin:0 auto;padding:0 20px}
.sf{font-family:'Fraunces',serif}
.mo{font-family:'Spline Sans Mono',monospace;font-feature-settings:"tnum"}

.mast{border-bottom:2.5px solid ${INK};padding:30px 0 16px;margin-bottom:30px}
.kick{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:${MUTE};display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-weight:600}
.h1{font-family:'Fraunces',serif;font-weight:900;font-size:clamp(28px,6.4vw,50px);line-height:1.03;letter-spacing:-.02em;margin:14px 0 10px}
.lede{font-size:clamp(15px,2.1vw,17px);color:#43403a;max-width:680px}
.lede b{color:${INK}}

.sec{margin-top:50px}
.snum{font-family:'Spline Sans Mono',monospace;font-size:12px;color:${MUTE};font-weight:600;letter-spacing:.1em}
.h2{font-family:'Fraunces',serif;font-weight:700;font-size:clamp(22px,4vw,30px);line-height:1.1;letter-spacing:-.01em;margin:4px 0 12px}
.body{font-size:15px;color:#403d37;max-width:700px}
.body b{color:${INK}}
.note{font-size:12px;color:${MUTE};margin-top:12px;font-style:italic}

/* spectrum */
.spec{border:1.5px solid ${INK};background:#fffdf8;padding:26px 20px 20px;margin-top:8px}
.zones{display:flex;font-size:11px;font-weight:700;color:${MUTE};letter-spacing:.06em;margin-bottom:30px}
.zoneL{flex:1;text-align:left}.zoneR{flex:1;text-align:right}
.track{position:relative;height:3px;background:linear-gradient(90deg,${C_SMIC},${C_YOFC},${C_VG},${C_MON});margin:0 4px}
.parity{position:absolute;left:50%;top:-26px;bottom:-26px;width:0;border-left:2px dashed ${MUTE}}
.plab{position:absolute;left:50%;transform:translateX(-50%);bottom:-46px;font-size:10px;color:${MUTE};font-weight:700;letter-spacing:.08em;white-space:nowrap}
.pin{position:absolute;top:50%;transform:translate(-50%,-50%);width:15px;height:15px;border-radius:50%;border:3px solid #fffdf8}
.chip{position:absolute;transform:translateX(-50%);width:118px;text-align:center}
.chip .nm{font-family:'Fraunces',serif;font-weight:700;font-size:14px;line-height:1.05}
.chip .pr{font-family:'Spline Sans Mono',monospace;font-weight:700;font-size:12px;margin-top:1px}
.chip .dr{font-size:10px;font-weight:700;color:${MUTE};letter-spacing:.04em}

/* company cards */
.cards{display:grid;grid-template-columns:1fr;gap:14px;margin-top:6px}
@media(min-width:660px){.cards{grid-template-columns:1fr 1fr}}
.cc{border:1.5px solid ${INK};background:#fffdf8;padding:0;overflow:hidden;display:flex;flex-direction:column}
.cc .top{padding:15px 16px 12px}
.cc .row1{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
.cc .nm{font-family:'Fraunces',serif;font-weight:700;font-size:19px;line-height:1.05}
.cc .code{font-family:'Spline Sans Mono',monospace;font-size:10.5px;color:${MUTE};font-weight:600;margin-top:2px}
.badge{font-family:'Spline Sans Mono',monospace;font-size:11px;font-weight:700;padding:4px 8px;border-radius:3px;white-space:nowrap;color:#fff;text-align:center;line-height:1.25}
.badge small{display:block;font-size:9px;opacity:.92;font-weight:600}
.cc .biz{font-size:13px;color:#403d37;margin-top:11px;padding-top:11px;border-top:1px solid ${INK}1a}
.specs{padding:4px 16px 15px}
.sp{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;padding:6px 0;border-top:1px dotted ${INK}24}
.sp:first-child{border-top:none}
.sp .k{color:${MUTE};font-weight:600;flex:none}
.sp .v{text-align:right;font-weight:500}
.sp .v b{font-family:'Spline Sans Mono',monospace}

/* margin chart */
.chartbox{width:100%;height:300px;background:#fffdf8;border:1.5px solid ${INK};padding:18px 12px 6px}
.legend{display:flex;gap:14px;flex-wrap:wrap;font-size:11.5px;font-weight:600;margin:16px 0 4px}
.lg{display:flex;align-items:center;gap:6px}.sw{width:13px;height:13px;display:inline-block}
.insight{border-left:3px solid ${INK};background:#fffdf8;padding:14px 16px;margin-top:18px;font-size:14px}
.insight b{font-family:'Fraunces',serif;font-weight:700}

/* dividers */
.divs{display:grid;grid-template-columns:1fr;gap:0;border:1.5px solid ${INK};margin-top:6px}
.dv{padding:17px 18px;border-top:1px solid ${INK}1f}.dv:first-child{border-top:none}
.dv .dh{display:flex;align-items:baseline;gap:11px;margin-bottom:7px}
.dv .dn{font-family:'Fraunces',serif;font-weight:900;font-size:24px;color:${INK}2a;line-height:1}
.dv .dt{font-family:'Fraunces',serif;font-weight:700;font-size:17px}
.dv .db{font-size:13.5px;color:#403d37}
.dv .db b{color:${INK}}

.takes{display:grid;grid-template-columns:1fr;gap:12px;margin-top:6px}
@media(min-width:620px){.takes{grid-template-columns:1fr 1fr}}
.tk{border-left:3px solid ${INK};padding:3px 0 3px 15px}
.tk .tn{font-family:'Spline Sans Mono',monospace;font-size:12px;color:${MUTE};font-weight:600}
.tk .th{font-family:'Fraunces',serif;font-weight:600;font-size:15.5px;margin:3px 0 5px}
.tk .tb{font-size:13px;color:#403d37}

.foot{margin-top:46px;padding-top:18px;border-top:1px solid ${INK}30;font-size:11.5px;color:${MUTE}}
.foot b{color:#403d37}
.rv{opacity:0;transform:translateY(14px);animation:rv .7s cubic-bezier(.2,.7,.3,1) forwards}
@keyframes rv{to{opacity:1;transform:none}}
`;

const companies = [
  {
    key: "smic", color: C_SMIC, nm: "中芯国际", code: "688981.SH / 00981.HK",
    badge: "A 股溢价", badgeSub: "约 +130%", pos: 8,
    biz: "纯晶圆代工（重资产制造），全球第二、大陆第一",
    specs: [
      ["净利率(25Q1→26Q1)", "约 7.7%"],
      ["H 股上市", "2004 年（老牌）"],
      ["H 股流通", "盘大 · 无稀缺性"],
      ["地缘约束", "实体清单 + 美资禁买"],
      ["AI 关联", "先进制程 / 算力代工"],
    ],
  },
  {
    key: "yofc", color: C_YOFC, nm: "长飞光纤", code: "601869.SH / 06869.HK",
    badge: "A 股溢价", badgeSub: "约 +80~100%", pos: 30,
    biz: "光纤预制棒/光纤/光缆（重资产制造），全球光纤光缆龙头",
    specs: [
      ["净利率(26Q1)", "约 13%（提升中）"],
      ["H 股上市", "2014 年（老牌）"],
      ["H 股流通", "盘大 · 无稀缺性"],
      ["地缘约束", "未被制裁"],
      ["AI 关联", "算力光互连 / 空芯光纤"],
    ],
  },
  {
    key: "vg", color: C_VG, nm: "胜宏科技", code: "300476.SZ / 02476.HK",
    badge: "H 股溢价", badgeSub: "小幅（次新）", pos: 62,
    biz: "AI 算力 PCB（高端制造），英伟达核心 PCB 供应商之一",
    specs: [
      ["净利率(26Q1)", "约 23%"],
      ["H 股上市", "2026 年 4 月（次新）"],
      ["H 股流通", "约 11.2% · 偏小"],
      ["地缘约束", "未被制裁"],
      ["AI 关联", "英伟达 GPU 板卡 PCB"],
    ],
  },
  {
    key: "mon", color: C_MON, nm: "澜起科技", code: "688008.SH / 06809.HK",
    badge: "H 股溢价", badgeSub: "约 +40~70%", pos: 86,
    biz: "芯片设计（Fabless，轻资产，台积电代工），全球内存接口芯片第一",
    specs: [
      ["净利率(26Q1)", "约 38%"],
      ["H 股上市", "2026 年 2 月（次新）"],
      ["H 股流通", "约 6.2% · 极小"],
      ["地缘约束", "未被制裁"],
      ["AI 关联", "AI 服务器内存接口"],
    ],
  },
];

const marginData = [
  { name: "中芯国际", v: 7.7, c: C_SMIC },
  { name: "长飞光纤", v: 13.4, c: C_YOFC },
  { name: "胜宏科技", v: 23.3, c: C_VG },
  { name: "澜起科技", v: 38, c: C_MON },
];

const dividers = [
  {
    n: "01", t: "H 股是不是 2026 年的小盘次新股？",
    b: "这是最强的分水岭。澜起、胜宏都是今年新上市、H 股自由流通极小（约 6.2% / 11.2%）、基石大量锁仓的次新股——在全球资金抢筹下供需失衡，H 股被快速推高而倒挂。中芯、长飞是 2004/2014 年的老牌 A+H，两地盘子都大、价格被充分发现，仍维持传统的 A 股溢价。",
  },
  {
    n: "02", t: "有没有被美国制裁卡住国际买盘？",
    b: "只有中芯被列入实体清单，且进入 NS-CMIC 清单——美国人被禁止买卖其股票（含指数/ETF），最大一块国际买盘被直接抽走，把它的 H 股按到 A 股之下、且溢价格外顽固。其余三家均未被制裁，国际资金可自由配置。",
  },
  {
    n: "03", t: "盈利质量与全球稀缺性有多高？",
    b: "毛利越高、越轻资产、海外越没有对标，全球资金越愿意给溢价。澜起(Fabless 设计、毛利近 70%、全球内存接口第一)最极致；胜宏(AI-PCB、绑定英伟达)次之；中芯(低毛利代工)、长飞(低毛利制造)则是重资产、可比标的多，溢价定价偏保守。",
  },
];

export default function App() {
  return (
    <div className="w">
      <style>{css}</style>
      <div className="in">

        <header className="mast rv">
          <div className="kick"><span>四只 AI 硬件 A+H 股 · 溢价光谱</span><span>数据截至 2026 年 6 月</span></div>
          <h1 className="h1">从 A 股溢价到 H 股溢价，<br />排成一条光谱</h1>
          <p className="lede">
            把四家公司放在一起，会看到一条清晰的连续带：<b style={{ color: C_SMIC }}>中芯国际</b>是被制裁压住的极端 A 股溢价，
            <b style={{ color: C_YOFC }}>长飞光纤</b>是传统 A 股溢价、正在收敛，
            <b style={{ color: C_VG }}>胜宏科技</b>已小幅倒挂成 H 股溢价，
            <b style={{ color: C_MON }}>澜起科技</b>则是最锋利的 H 股大幅溢价。决定你落在光谱哪一端的，主要是三个变量。
          </p>
        </header>

        {/* SPECTRUM */}
        <section className="rv">
          <div className="snum">01 — 一条溢价光谱</div>
          <h2 className="h2">同股不同价，方向连成一线</h2>
          <div className="spec">
            <div className="zones"><span className="zoneL">◀ A 股更贵（H 股折价）</span><span className="zoneR">H 股更贵（A 股折价）▶</span></div>
            <div className="track">
              <div className="parity"><span className="plab">两地同价</span></div>
              {companies.map((c) => (
                <div key={c.key}>
                  <div className="pin" style={{ left: c.pos + "%", background: c.color }} />
                  <div className="chip" style={{
                    left: c.pos + "%",
                    ...(["smic", "vg"].includes(c.key) ? { top: 22 } : { bottom: 22 }),
                  }}>
                    <div className="nm" style={{ color: c.color }}>{c.nm}</div>
                    <div className="pr" style={{ color: c.color }}>{c.badge === "A 股溢价" ? "A 贵 " : "H 贵 "}{c.badgeSub.replace(/[约+]/g, "").trim()}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height: 64 }} />
          </div>
          <p className="note">位置为示意排序；中芯约 +130% 为 2025 年中数据（年初曾达 221%），长飞、胜宏的幅度为近期约数，溢价随行情每日波动较大。澜起"H 贵 40~70%"指 H 股较 A 股的溢价区间。</p>
        </section>

        {/* CARDS */}
        <section className="sec rv">
          <div className="snum">02 — 四家公司画像</div>
          <h2 className="h2">两个"重资产 A 溢价" vs 两个"轻盈 H 溢价"</h2>
          <div className="cards">
            {companies.map((c) => (
              <div className="cc" key={c.key} style={{ borderTop: `4px solid ${c.color}` }}>
                <div className="top">
                  <div className="row1">
                    <div>
                      <div className="nm" style={{ color: c.color }}>{c.nm}</div>
                      <div className="code">{c.code}</div>
                    </div>
                    <div className="badge" style={{ background: c.color }}>
                      {c.badge}<small>{c.badgeSub}</small>
                    </div>
                  </div>
                  <div className="biz">{c.biz}</div>
                </div>
                <div className="specs">
                  {c.specs.map((s, i) => (
                    <div className="sp" key={i}><span className="k">{s[0]}</span><span className="v">{s[1]}</span></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MARGIN CHART */}
        <section className="sec rv">
          <div className="snum">03 — 盈利质量阶梯</div>
          <h2 className="h2">净利率越高，越靠 H 股溢价那一端</h2>
          <p className="body" style={{ marginBottom: 14 }}>
            把四家的净利率从低到高排出来，顺序恰好与溢价光谱一致——这并非巧合，而是全球资金"用真金白银"奖励高毛利、轻资产、不可替代的生意。
          </p>
          <div className="chartbox">
            <ResponsiveContainer>
              <BarChart data={marginData} margin={{ top: 18, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={INK + "14"} />
                <XAxis dataKey="name" tick={{ fontFamily: "Archivo", fontSize: 12.5, fontWeight: 600, fill: INK }} axisLine={{ stroke: INK }} tickLine={false} interval={0} />
                <YAxis unit="%" tick={{ fontFamily: "Spline Sans Mono", fontSize: 11, fill: MUTE }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: INK + "08" }} formatter={(v) => v + "%"} contentStyle={{ fontFamily: "Archivo", fontSize: 12, border: `1.5px solid ${INK}`, borderRadius: 0, background: PAPER }} />
                <Bar dataKey="v" radius={[3, 3, 0, 0]}>
                  {marginData.map((e, i) => <Cell key={i} fill={e.c} />)}
                  <LabelList dataKey="v" position="top" formatter={(v) => v + "%"} style={{ fontFamily: "Spline Sans Mono", fontSize: 12, fontWeight: 700, fill: INK }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="note">净利率取 2026 年一季度口径（澜起为约数）；长飞一季度因 AI 光互连放量净利率跃升，全年中枢通常更低。仅作直观对比。</p>
          <div className="insight">
            <b>耐人寻味的规律：</b>净利率 7.7% → 13% → 23% → 38%，与"A 股溢价 → H 股溢价"的方向完全同序。但要注意，真正的机械推手是<b style={{ fontFamily: "Archivo", fontWeight: 700 }}>流通盘与制裁</b>，盈利质量解释的是"全球资金为什么想要它"。
          </div>
        </section>

        {/* DIVIDERS */}
        <section className="sec rv">
          <div className="snum">04 — 什么决定了方向</div>
          <h2 className="h2">三个分水岭</h2>
          <p className="body" style={{ marginBottom: 16 }}>
            同样是 AI 硬件龙头，为何溢价方向天差地别？把三个问题问下来，基本就能定位它在光谱上的位置。
          </p>
          <div className="divs">
            {dividers.map((d) => (
              <div className="dv" key={d.n}>
                <div className="dh"><span className="dn">{d.n}</span><span className="dt">{d.t}</span></div>
                <div className="db">{d.b}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TAKEAWAYS */}
        <section className="sec rv">
          <div className="snum">05 — 给投资者的启示</div>
          <h2 className="h2">从"一刀切折价"到"分层定价"</h2>
          <div className="takes">
            <div className="tk"><div className="tn">01</div><div className="th">先问"是谁在定价"</div><div className="tb">价差更多反映两地投资者结构与筹码，而非绝对贵贱。中芯的 A 溢价含制裁折价，澜起/胜宏的 H 溢价含次新股稀缺溢价。</div></div>
            <div className="tk"><div className="tn">02</div><div className="th">小流通盘是双刃剑</div><div className="tb">次新股极小的 H 股流通能放大涨幅，也会放大波动；基石解禁、情绪退潮时，H 股溢价可能快速收敛甚至回吐。</div></div>
            <div className="tk"><div className="tn">03</div><div className="th">老 A+H 的"补涨/收敛"逻辑不同</div><div className="tb">长飞这类老牌 A+H 没有次新股稀缺性，A 溢价随全球重估缓慢收敛，而非剧烈倒挂；中芯则被制裁锁死，难走同一路径。</div></div>
            <div className="tk"><div className="tn">04</div><div className="th">锚终究是基本面</div><div className="tb">流通盘只在短期放大溢价。能否持续，取决于 AI 算力/存储/光互连景气能否兑现，以及（对中芯）地缘约束有无松动。</div></div>
          </div>
        </section>

        <footer className="foot">
          <p style={{ marginBottom: 8 }}><b>主要数据来源</b>（2026 年最新）：各公司 2025 年报与 2026 一季报、交易所公告；新浪财经/财华社、证券时报、21 世纪经济报道、财联社、智通财经等行情与研报整理；地缘政策部分参考美国 OFAC（NS-CMIC 清单）、美国商务部 BIS 实体清单规则、CSIS、CFR、美国国会研究服务处（CRS）等公开资料。</p>
          <p><b>免责声明：</b>本页为信息与教育用途的可视化梳理，不构成任何投资建议。AH 溢价方向与幅度随行情快速变化，请以实时行情与公司公告为准，独立判断、自担风险。</p>
        </footer>

      </div>
    </div>
  );
}
