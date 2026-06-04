import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";

const COOL = "#15697e";   // 中芯国际 — 冷色（被全球资本"打折"）
const COOL_D = "#0c4a59";
const WARM = "#bd3c10";   // 澜起科技 — 暖色（被全球资本"追逐"）
const WARM_D = "#8f2c08";
const INK = "#1d1a16";
const MUTE = "#6f675a";
const PAPER = "#f6f1e6";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Archivo:wght@400;500;600;700&family=Spline+Sans+Mono:wght@500;600&display=swap');

.wrap *{box-sizing:border-box;margin:0;padding:0}
.wrap{background:${PAPER};color:${INK};font-family:'Archivo',sans-serif;line-height:1.55;
  background-image:radial-gradient(${INK}0a 0.5px,transparent 0.5px);background-size:7px 7px;
  padding:0 0 64px;overflow:hidden}
.inner{max-width:920px;margin:0 auto;padding:0 20px}
.serif{font-family:'Fraunces',serif}
.mono{font-family:'Spline Sans Mono',monospace;font-feature-settings:"tnum"}

/* masthead */
.mast{border-bottom:2.5px solid ${INK};padding:30px 0 16px;margin-bottom:34px}
.kicker{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:${MUTE};
  display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-weight:600}
.h1{font-family:'Fraunces',serif;font-weight:900;font-size:clamp(30px,7vw,52px);
  line-height:1.02;letter-spacing:-.02em;margin:14px 0 10px}
.lede{font-size:clamp(15px,2.1vw,17px);color:#43403a;max-width:620px}
.lede b{color:${INK}}

/* hero opposition */
.opp{display:grid;grid-template-columns:1fr;gap:14px;margin:30px 0 12px}
@media(min-width:680px){.opp{grid-template-columns:1fr auto 1fr;align-items:stretch}}
.card{border:1.5px solid ${INK};background:#fffdf8;padding:20px 18px;position:relative;overflow:hidden}
.card .tag{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
.card .nm{font-family:'Fraunces',serif;font-weight:700;font-size:22px;margin:2px 0 2px}
.card .code{font-size:11px;color:${MUTE};font-weight:600}
.bignum{font-family:'Fraunces',serif;font-weight:900;font-size:clamp(40px,11vw,62px);line-height:1;margin:14px 0 2px}
.dir{display:flex;align-items:center;gap:8px;font-weight:700;font-size:14px;margin-top:6px}
.arrow{font-size:22px;line-height:1}
.cap{font-size:12.5px;color:${MUTE};margin-top:10px}
.vs{display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;
  font-style:italic;font-weight:600;font-size:20px;color:${MUTE};padding:6px 0}
.swoosh{position:absolute;right:-30px;top:-30px;width:120px;height:120px;border-radius:50%;opacity:.07}

/* section */
.sec{margin-top:52px}
.snum{font-family:'Spline Sans Mono',monospace;font-size:12px;color:${MUTE};font-weight:600;letter-spacing:.1em}
.h2{font-family:'Fraunces',serif;font-weight:700;font-size:clamp(22px,4vw,30px);
  line-height:1.1;letter-spacing:-.01em;margin:4px 0 14px}
.body{font-size:15px;color:#403d37;max-width:680px}
.body b{color:${INK}}

/* premium bars */
.pbar{margin:8px 0 4px}
.pbar .lab{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;font-weight:600;margin-bottom:6px}
.axis{position:relative;height:46px;border-left:2px dashed ${MUTE}8c;margin-left:50%}
.fill{position:absolute;top:7px;height:32px;display:flex;align-items:center;padding:0 10px;
  font-family:'Spline Sans Mono',monospace;font-weight:600;font-size:14px;color:#fff}
.fillR{left:0;border-radius:0 4px 4px 0;justify-content:flex-end}
.fillL{right:0;border-radius:4px 0 0 4px;justify-content:flex-start;transform:translateX(0)}
.zlab{position:absolute;left:50%;transform:translateX(-50%);top:-20px;font-size:10px;color:${MUTE};font-weight:600;letter-spacing:.08em}
.endlab{position:absolute;top:11px;font-size:11px;font-weight:700;white-space:nowrap}

/* compare grid */
.grid2{display:grid;grid-template-columns:1fr;border:1.5px solid ${INK};overflow:hidden}
.grow{display:grid;grid-template-columns:96px 1fr;border-top:1px solid ${INK}1f}
@media(min-width:640px){.grow{grid-template-columns:130px 1fr 1fr}}
.grow:first-child{border-top:none}
.gh{background:${INK};color:${PAPER}}
.gcell{padding:11px 12px;font-size:13.5px}
.glabel{font-weight:700;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:${MUTE};
  display:flex;align-items:center;background:#fffdf8}
.gh .glabel{color:${PAPER}cc}
.gcoolhead{font-family:'Fraunces',serif;font-weight:700;font-size:15px;color:#fff}
.cool-c{border-top:3px solid ${COOL}}
.warm-c{border-top:3px solid ${WARM}}
.gsm{display:none}
@media(min-width:640px){.gsm{display:block}}
.gmob{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:3px}
@media(min-width:640px){.gmob{display:none}}

/* driver cards */
.drivers{display:grid;grid-template-columns:1fr;gap:0;border:1.5px solid ${INK}}
.drow{padding:18px;border-top:1px solid ${INK}1f}
.drow:first-child{border-top:none}
.dhead{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.dnum{font-family:'Fraunces',serif;font-weight:900;font-size:30px;line-height:1;color:${INK}25;min-width:42px}
.dttl{font-family:'Fraunces',serif;font-weight:700;font-size:18px;line-height:1.15}
.dcols{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:600px){.dcols{grid-template-columns:1fr 1fr}}
.dc{padding:12px 14px;font-size:13.5px;border-radius:3px;position:relative}
.dc .dchead{font-weight:700;font-size:12px;letter-spacing:.05em;text-transform:uppercase;margin-bottom:5px;display:flex;align-items:center;gap:7px}
.dot{width:9px;height:9px;border-radius:50%;flex:none}

/* takeaways */
.takes{display:grid;grid-template-columns:1fr;gap:12px;margin-top:6px}
@media(min-width:620px){.takes{grid-template-columns:1fr 1fr}}
.take{border-left:3px solid ${INK};padding:4px 0 4px 16px}
.take .tn{font-family:'Spline Sans Mono',monospace;font-size:12px;color:${MUTE};font-weight:600}
.take .th{font-family:'Fraunces',serif;font-weight:600;font-size:16px;margin:3px 0 5px}
.take .tb{font-size:13.5px;color:#403d37}

.note{font-size:12px;color:${MUTE};margin-top:10px;font-style:italic}
.foot{margin-top:48px;padding-top:18px;border-top:1px solid ${INK}30;font-size:11.5px;color:${MUTE}}
.foot b{color:#403d37}
.legend{display:flex;gap:18px;flex-wrap:wrap;font-size:12px;font-weight:600;margin:18px 0 4px}
.lg{display:flex;align-items:center;gap:7px}

.reveal{opacity:0;transform:translateY(14px);animation:rv .7s cubic-bezier(.2,.7,.3,1) forwards}
@keyframes rv{to{opacity:1;transform:none}}
`;

function PremiumBar({ pct, dir, color, label, value, sub, max = 230 }) {
  const w = Math.min(Math.abs(pct) / max * 50, 50);
  return (
    <div className="pbar">
      <div className="lab"><span>{label}</span><span className="mono" style={{ color }}>{value}</span></div>
      <div className="axis">
        <span className="zlab">同价线 0%</span>
        {dir === "right" ? (
          <div className="fill fillR" style={{ width: w + "%", background: color }} />
        ) : (
          <div className="fill fillL" style={{ width: w + "%", background: color }} />
        )}
        <span className="endlab" style={{
          color, ...(dir === "right" ? { left: `calc(${w}% + 6px)` } : { right: `calc(${w}% + 6px)` })
        }}>{sub}</span>
      </div>
    </div>
  );
}

const marginData = [
  { name: "毛利率", 中芯国际: 21, 澜起科技: 70 },
  { name: "净利率", 中芯国际: 7.5, 澜起科技: 39 },
  { name: "研发占比", 中芯国际: 8.2, 澜起科技: 25 },
];

const rows = [
  ["商业模式", "纯晶圆代工（重资产制造）", "Fabless 芯片设计（轻资产，台积电代工）"],
  ["行业地位", "全球纯代工第二 · 大陆第一", "全球内存接口芯片第一 · 份额约 36.8%"],
  ["2025 营收", "约 673 亿元 / 93 亿美元", "约 55 亿元 / 7.5 亿美元（约为中芯 1/12）"],
  ["2025 净利", "约 50.4 亿元（+36%）", "约 20 亿元（预增 52%–66%）"],
  ["毛利率", "约 21%（资本开支≈营收）", "约 58%–70%（轻资产高毛利）"],
  ["H 股上市", "2004 年（在港 20 余年）", "2026 年 2 月（次新股）"],
  ["H 股流通占比", "盘子大、流动性深、无稀缺性", "仅约 6.2%，筹码极度稀缺"],
  ["地缘约束", "实体清单 + NS-CMIC（美资禁买）", "未被制裁，深度嵌入全球供应链"],
  ["全球可比标的", "有（台积电/联电/格芯等）", "几乎没有，港股是全球唯一配置窗口"],
];

const drivers = [
  {
    n: "01", t: "盈利模式与行业地位",
    cool: "重资产代工：毛利约 21%、净利率仅约 7.5%，资本开支几乎吃掉全部营收，利润被折旧吞噬。",
    warm: "轻资产设计：毛利近 70%、净利率约 39%，全球内存接口芯片绝对龙头，现金流质量行业顶尖。",
  },
  {
    n: "02", t: "投资者结构与估值逻辑",
    cool: "H 股端国际机构主导，对低毛利、被制裁的代工厂给确定性折价；A 股端内资为先进制程稀缺性付'国产替代'溢价。",
    warm: "国际长线资金看重全球壁垒、自由现金流、长期 ROE，对 AI'运力'芯片龙头给出高于内资的成长定价。",
  },
  {
    n: "03", t: "流动性与筹码结构",
    cool: "在港 20 余年，H 股盘子庞大、换手充分，无'抢筹'效应，价格被全球供需充分发现。",
    warm: "H 股流通仅约 6.2%，基石锁仓，可交易股份极少；少量全球资金即可推动股价大幅上行。",
  },
  {
    n: "04", t: "地缘政治与供应链",
    cool: "2020 年入实体清单（推定拒绝），又入 NS-CMIC——美国人禁买其股票（含指数/ETF），直接抽走最大一块国际买盘。",
    warm: "自身不造芯、不被制裁，向三星/海力士供货、由台积电代工，是全球 AI 服务器内存架构的'必经环节'。",
  },
  {
    n: "05", t: "上市时点与稀缺溢价",
    cool: "老牌 A+H，溢价已被市场长期定价；A 强 H 弱的格局相对稳定。",
    warm: "2026 年新股 + AI/存储超级周期 + 海外无对标，叠加次新股情绪，催生'反客为主'的 H 股溢价。",
  },
];

export default function App() {
  return (
    <div className="wrap">
      <style>{css}</style>
      <div className="inner">

        <header className="mast reveal">
          <div className="kicker">
            <span>硬科技 · A+H 双重上市深度解析</span>
            <span>数据截至 2026 年 6 月</span>
          </div>
          <h1 className="h1">同股不同价，<br />方向却截然相反</h1>
          <p className="lede">
            两家中国 AI 硬件龙头，在 A 股与港股之间出现<b>完全相反</b>的溢价：
            <b style={{ color: COOL }}>中芯国际</b>是经典的"A 股贵过 H 股"，
            <b style={{ color: WARM }}>澜起科技</b>却罕见地"H 股贵过 A 股"。
            一冷一热的背后，是定价权正在从本土市场向全球市场转移。
          </p>

          <div className="opp">
            <div className="card cool-c reveal" style={{ animationDelay: ".1s" }}>
              <div className="swoosh" style={{ background: COOL }} />
              <div className="tag" style={{ color: COOL }}>中芯国际 SMIC</div>
              <div className="nm">A 股显著溢价</div>
              <div className="code mono">688981.SH / 00981.HK</div>
              <div className="bignum" style={{ color: COOL }}>+130%<span style={{ fontSize: 22 }}>+</span></div>
              <div className="dir" style={{ color: COOL }}>
                <span className="arrow">▲</span> A 股 高于 H 股
              </div>
              <div className="cap">2025 年中约 130%，年初一度高达 <b>221%</b>。被全球资本"打折"的代工龙头。</div>
            </div>

            <div className="vs">vs</div>

            <div className="card warm-c reveal" style={{ animationDelay: ".2s" }}>
              <div className="swoosh" style={{ background: WARM }} />
              <div className="tag" style={{ color: WARM }}>澜起科技 Montage</div>
              <div className="nm">H 股大幅溢价</div>
              <div className="code mono">688008.SH / 06809.HK</div>
              <div className="bignum" style={{ color: WARM }}>+40%<span style={{ fontSize: 22 }}>~70%</span></div>
              <div className="dir" style={{ color: WARM }}>
                <span className="arrow">▲</span> H 股 高于 A 股
              </div>
              <div className="cap">近期稳居 <b>40% 以上</b>，5 月暴涨中一度逼近 <b>70%</b>。被全球资本"追逐"的设计龙头。</div>
            </div>
          </div>
          <p className="note">注：澜起 H 股 2026 年 2 月上市，上市时 A 股反而较 H 股溢价约 70%；此后 H 股股价大涨，溢价方向"翻转"。溢价随行情波动较大。</p>
        </header>

        {/* SECTION 1 */}
        <section className="sec reveal">
          <div className="snum">01 — 一张图看懂反差</div>
          <h2 className="h2">以"同价线"为轴，两者倒向两边</h2>
          <p className="body" style={{ marginBottom: 22 }}>
            把 A 股与 H 股折算成同一货币比较：竖虚线代表"两地同价"。中芯国际深深倒向左侧（A 比 H 贵），澜起科技倒向右侧（H 比 A 贵）。
          </p>
          <div style={{ border: `1.5px solid ${INK}`, background: "#fffdf8", padding: "26px 18px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: MUTE, marginBottom: 4, letterSpacing: ".08em" }}>
              <span>◀ A 股更贵（H 股折价）</span><span>H 股更贵（A 股折价）▶</span>
            </div>
            <PremiumBar label="中芯国际" value="A 较 H ≈ +130%" sub="◀ 折价区" pct={130} dir="left" color={COOL} />
            <div style={{ height: 14 }} />
            <PremiumBar label="澜起科技" value="H 较 A ≈ +40%~70%" sub="溢价区 ▶" pct={55} dir="right" color={WARM} />
          </div>
          <p className="note">恒生沪深港通 AH 溢价指数已从 2024 年初的约 161 点降至 2026 年 4 月的约 118 点（近 8 年低位）——整体 A 股溢价在收敛，少数硬科技龙头甚至出现 H 股溢价"倒挂"。</p>
        </section>

        {/* SECTION 2 */}
        <section className="sec reveal">
          <div className="snum">02 — 两家公司画像</div>
          <h2 className="h2">几乎是一对"镜像"</h2>
          <p className="body" style={{ marginBottom: 18 }}>
            一个是"造芯"的重资产制造商，一个是"设计芯片"的轻资产龙头；一个被全球资本回避，一个被全球资本争抢。
          </p>
          <div className="grid2">
            <div className="grow gh gsm">
              <div className="gcell glabel">维度</div>
              <div className="gcell"><span className="gcoolhead">中芯国际</span></div>
              <div className="gcell"><span className="gcoolhead" style={{ color: "#ffd9c4" }}>澜起科技</span></div>
            </div>
            {rows.map((r, i) => (
              <div className="grow" key={i}>
                <div className="gcell glabel">{r[0]}</div>
                <div className="gcell" style={{ borderLeft: `3px solid ${COOL}` }}>
                  <span className="gmob" style={{ color: COOL }}>中芯国际</span>{r[1]}
                </div>
                <div className="gcell" style={{ borderLeft: `3px solid ${WARM}` }}>
                  <span className="gmob" style={{ color: WARM }}>澜起科技</span>{r[2]}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3 */}
        <section className="sec reveal">
          <div className="snum">03 — 盈利质量对比</div>
          <h2 className="h2">毛利率：21% vs 近 70%</h2>
          <p className="body" style={{ marginBottom: 14 }}>
            中芯国际营收是澜起的 12 倍，但<b>赚钱效率</b>恰恰相反。这正是国际资金"用脚投票"的核心——他们偏爱高毛利、轻资产、确定性强的生意。
          </p>
          <div style={{ width: "100%", height: 280, background: "#fffdf8", border: `1.5px solid ${INK}`, padding: "18px 10px 6px" }}>
            <ResponsiveContainer>
              <BarChart data={marginData} margin={{ top: 16, right: 12, left: -8, bottom: 0 }} barGap={6}>
                <CartesianGrid vertical={false} stroke={INK + "14"} />
                <XAxis dataKey="name" tick={{ fontFamily: "Archivo", fontSize: 13, fontWeight: 600, fill: INK }} axisLine={{ stroke: INK }} tickLine={false} />
                <YAxis unit="%" tick={{ fontFamily: "Spline Sans Mono", fontSize: 11, fill: MUTE }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: INK + "08" }}
                  contentStyle={{ fontFamily: "Archivo", fontSize: 12, border: `1.5px solid ${INK}`, borderRadius: 0, background: PAPER }}
                  formatter={(v) => v + "%"}
                />
                <Bar dataKey="中芯国际" fill={COOL} radius={[2, 2, 0, 0]}>
                  <LabelList dataKey="中芯国际" position="top" formatter={(v) => v + "%"} style={{ fontFamily: "Spline Sans Mono", fontSize: 11, fontWeight: 600, fill: COOL_D }} />
                </Bar>
                <Bar dataKey="澜起科技" fill={WARM} radius={[2, 2, 0, 0]}>
                  <LabelList dataKey="澜起科技" position="top" formatter={(v) => v + "%"} style={{ fontFamily: "Spline Sans Mono", fontSize: 11, fontWeight: 600, fill: WARM_D }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="legend">
            <span className="lg"><span style={{ width: 14, height: 14, background: COOL, display: "inline-block" }} />中芯国际（代工）</span>
            <span className="lg"><span style={{ width: 14, height: 14, background: WARM, display: "inline-block" }} />澜起科技（设计）</span>
          </div>
          <p className="note">毛利率/净利率取 2025 年报口径，澜起研发占比为约数；数值用于直观对比，非精确财报披露值。</p>
        </section>

        {/* SECTION 4 */}
        <section className="sec reveal">
          <div className="snum">04 — 反差的五重逻辑</div>
          <h2 className="h2">为什么方向会相反？</h2>
          <p className="body" style={{ marginBottom: 18 }}>
            同一现象的五个驱动维度，对两家公司的作用方向恰好相反——叠加起来，就把溢价推向了两个极端。
          </p>
          <div className="drivers">
            {drivers.map((d) => (
              <div className="drow" key={d.n}>
                <div className="dhead">
                  <span className="dnum">{d.n}</span>
                  <span className="dttl">{d.t}</span>
                </div>
                <div className="dcols">
                  <div className="dc" style={{ background: COOL + "12" }}>
                    <div className="dchead" style={{ color: COOL_D }}><span className="dot" style={{ background: COOL }} />中芯国际</div>
                    {d.cool}
                  </div>
                  <div className="dc" style={{ background: WARM + "12" }}>
                    <div className="dchead" style={{ color: WARM_D }}><span className="dot" style={{ background: WARM }} />澜起科技</div>
                    {d.warm}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5 */}
        <section className="sec reveal">
          <div className="snum">05 — 给投资者的启示</div>
          <h2 className="h2">从"折价套利"到"定价权转移"</h2>
          <div className="takes">
            <div className="take">
              <div className="tn">01</div>
              <div className="th">"H 股=打折 A 股"的旧框架正在失效</div>
              <div className="tb">对具备全球壁垒的硬科技龙头，H 股可能是更前瞻、更贵的独立估值平台，而非折价替代品。盲目做多 AH 价差可能踏空。</div>
            </div>
            <div className="take">
              <div className="tn">02</div>
              <div className="th">先看"是谁在定价"，再看贵不贵</div>
              <div className="tb">价差更多反映两地投资者结构与资金偏好，而非绝对便宜或昂贵。中芯的 A 溢价含制裁折价，澜起的 H 溢价含稀缺溢价。</div>
            </div>
            <div className="take">
              <div className="tn">03</div>
              <div className="th">小流通盘是把双刃剑</div>
              <div className="tb">极小的 H 股自由流通（澜起约 6.2%）能放大涨幅，也会放大波动与回撤。基石解禁、情绪退潮时，溢价可能快速收敛。</div>
            </div>
            <div className="take">
              <div className="tn">04</div>
              <div className="th">溢价的"锚"终究是基本面</div>
              <div className="tb">流通盘只在短期放大溢价；能否持续取决于业绩兑现：澜起看 AI 互连芯片放量，中芯看先进制程与产能落地、以及地缘约束的边际变化。</div>
            </div>
          </div>
        </section>

        <footer className="foot">
          <p style={{ marginBottom: 8 }}><b>主要数据来源</b>（2026 年最新）：公司 2025 年报与 2026 一季报；中芯国际、澜起科技交易所公告；新浪财经/财华社、证券时报、21 世纪经济报道、财联社等行情与研报整理；地缘政策部分参考 美国 OFAC（NS-CMIC 清单）、美国商务部 BIS 实体清单规则、CSIS、CFR、美国国会研究服务处（CRS）等公开资料。</p>
          <p><b>免责声明：</b>本页为信息与教育用途的可视化梳理，不构成任何投资建议。市场有风险，溢价方向与幅度随行情快速变化，请以实时行情与公司公告为准，并自行独立判断。</p>
        </footer>

      </div>
    </div>
  );
}
