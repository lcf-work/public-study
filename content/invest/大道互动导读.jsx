/**
 * 《大道：段永平投资问答录》互动导读
 * ------------------------------------------------------------
 * 单文件 React 组件（默认导出），无第三方依赖，样式内置。
 * 可直接放进 Claude 的 React Artifact、Vite / Next.js 等 React 项目中使用。
 *
 * 说明：
 * - 引文均摘自书中段永平原话，日期为原书标注（同日多组对话按原书段末日期）。
 * - 书中涉及的公司案例，仅用于理解其思想，不构成任何投资建议（原书编者亦有此说明）。
 * - 阅读进度、测验答案、笔记会尝试保存在浏览器本地（不可用时仅保存在本次会话内）。
 */
import React, { useState, useEffect, useRef, useMemo } from "react";

/* =========================================================
 * 样式
 * ========================================================= */
const CSS = `
.dd-root{
  --bg:#F4EFE5;--panel:#FBF8F1;--panel2:#F0E9DB;--ink:#221D17;--ink2:#473F35;--muted:#776C5D;
  --line:#E0D5C1;--line2:#CFC2AB;
  --accent:#A3392B;--accent-ink:#FFFFFF;--accent-soft:#F4E2DB;
  --jade:#2D6A5C;--jade-soft:#DCEBE5;--gold:#94691F;--gold-soft:#F2E6CA;
  --ok:#2C7650;--ok-soft:#DDEFE3;--bad:#AE3F2C;--bad-soft:#F7DFD8;
  --shadow:0 1px 2px rgba(70,50,20,.05),0 8px 24px rgba(70,50,20,.06);
  --serif:"Songti SC","STSong","Noto Serif SC","Source Han Serif SC","Noto Serif CJK SC","SimSun",serif;
  --sans:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC","Segoe UI",sans-serif;
  background:var(--bg);color:var(--ink);font-family:var(--sans);min-height:100vh;line-height:1.75;
  -webkit-font-smoothing:antialiased;font-size:15.5px;
}
@media (prefers-color-scheme: dark){
  .dd-root:not(.theme-light){
    --bg:#14110D;--panel:#1C1814;--panel2:#241F19;--ink:#EDE5D6;--ink2:#D2C8B7;--muted:#A09483;
    --line:#342D24;--line2:#463D31;
    --accent:#E27564;--accent-ink:#1A0E0B;--accent-soft:#3A221C;
    --jade:#74BBA8;--jade-soft:#1A2C27;--gold:#D8B266;--gold-soft:#2F2616;
    --ok:#6DC291;--ok-soft:#17291E;--bad:#E88069;--bad-soft:#36201A;
    --shadow:0 1px 2px rgba(0,0,0,.3);
  }
}
.dd-root.theme-dark{
  --bg:#14110D;--panel:#1C1814;--panel2:#241F19;--ink:#EDE5D6;--ink2:#D2C8B7;--muted:#A09483;
  --line:#342D24;--line2:#463D31;
  --accent:#E27564;--accent-ink:#1A0E0B;--accent-soft:#3A221C;
  --jade:#74BBA8;--jade-soft:#1A2C27;--gold:#D8B266;--gold-soft:#2F2616;
  --ok:#6DC291;--ok-soft:#17291E;--bad:#E88069;--bad-soft:#36201A;
  --shadow:0 1px 2px rgba(0,0,0,.3);
}
.dd-root *{box-sizing:border-box}
.dd-root button{font-family:inherit;font-size:inherit;color:inherit;cursor:pointer}
.dd-root textarea,.dd-root input{font-family:inherit;font-size:inherit;color:inherit}
.dd-root h1,.dd-root h2,.dd-root h3,.dd-root h4{font-family:var(--serif);font-weight:700;line-height:1.35;margin:0;letter-spacing:.01em}
.dd-root p{margin:0}

/* ---------- 布局 ---------- */
.dd-shell{display:grid;grid-template-columns:268px minmax(0,1fr);min-height:100vh}
.dd-side{position:sticky;top:0;height:100vh;overflow-y:auto;border-right:1px solid var(--line);background:var(--panel);padding:22px 16px 18px;display:flex;flex-direction:column;gap:18px}
.dd-brand{display:flex;gap:12px;align-items:center;padding:0 6px}
.dd-brand-seal{width:42px;height:42px;border-radius:8px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-family:var(--serif);font-size:22px;font-weight:700;flex:none}
.dd-brand-t{font-family:var(--serif);font-size:18px;font-weight:700;line-height:1.2}
.dd-brand-s{font-size:12px;color:var(--muted)}
.dd-prog{padding:0 6px}
.dd-prog-row{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:6px}
.dd-bar{height:6px;border-radius:99px;background:var(--panel2);overflow:hidden}
.dd-bar > i{display:block;height:100%;background:var(--accent);border-radius:99px;transition:width .4s}
.dd-nav{display:flex;flex-direction:column;gap:2px}
.dd-nav button{display:flex;align-items:center;gap:10px;text-align:left;border:0;background:transparent;padding:9px 10px;border-radius:10px;color:var(--ink2);line-height:1.35}
.dd-nav button:hover{background:var(--panel2)}
.dd-nav button.on{background:var(--accent-soft);color:var(--ink)}
.dd-nav .no{width:26px;height:26px;border-radius:6px;border:1px solid var(--line2);display:grid;place-items:center;font-family:var(--serif);font-size:13px;flex:none;color:var(--muted)}
.dd-nav button.on .no{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.dd-nav .lab{flex:1;min-width:0}
.dd-nav .lab small{display:block;font-size:11.5px;color:var(--muted)}
.dd-nav .pct{font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
.dd-side-foot{margin-top:auto;display:flex;gap:8px;padding:0 6px;flex-wrap:wrap}
.dd-top{display:none}
.dd-main{min-width:0}
.dd-wrap{max-width:820px;margin:0 auto;padding:36px 28px 80px;scroll-margin-top:140px}

@media (max-width: 920px){
  .dd-shell{grid-template-columns:minmax(0,1fr)}
  .dd-side{display:none}
  .dd-top{display:block;position:sticky;top:0;z-index:20;background:var(--panel);border-bottom:1px solid var(--line)}
  .dd-top-row{display:flex;align-items:center;gap:10px;padding:10px 16px 6px}
  .dd-top-row .dd-brand-seal{width:32px;height:32px;font-size:17px;border-radius:7px}
  .dd-top-t{font-family:var(--serif);font-weight:700;font-size:15px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dd-chips{display:flex;gap:6px;overflow-x:auto;padding:4px 16px 10px;scrollbar-width:none}
  .dd-chips::-webkit-scrollbar{display:none}
  .dd-chips button{flex:none;border:1px solid var(--line);background:var(--bg);border-radius:99px;padding:5px 12px;font-size:13px;white-space:nowrap}
  .dd-chips button.on{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
  .dd-top .dd-bar{height:3px;border-radius:0}
  .dd-wrap{padding:22px 16px 64px}
}

/* ---------- 通用 ---------- */
.dd-eyebrow{font-size:12.5px;letter-spacing:.14em;color:var(--accent);font-weight:600}
.dd-muted{color:var(--muted)}
.dd-small{font-size:13px}
.dd-card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px;box-shadow:var(--shadow)}
.dd-card + .dd-card{margin-top:14px}
.dd-grid2 > .dd-card,.dd-grid3 > .dd-card{margin-top:0}
.dd-stack > * + *{margin-top:14px}
.dd-gap{height:28px}
.dd-h2{font-size:22px;margin-bottom:10px}
.dd-h3{font-size:18px}
.dd-sectitle{display:flex;align-items:baseline;gap:10px;margin:40px 0 14px}
.dd-sectitle h2{font-size:21px}
.dd-sectitle span{font-size:12.5px;color:var(--muted)}
.dd-btn{border:1px solid var(--accent);background:var(--accent);color:var(--accent-ink) !important;border-radius:10px;padding:8px 14px;font-weight:600;line-height:1.3}
.dd-btn:hover{filter:brightness(1.05)}
.dd-btn-ghost{border:1px solid var(--line2);background:transparent;border-radius:10px;padding:7px 12px;line-height:1.3}
.dd-btn-ghost:hover{background:var(--panel2)}
.dd-btn-ghost.on{border-color:var(--accent);background:var(--accent-soft)}
.dd-link{border:0;background:none;padding:0;color:var(--accent);font-weight:600;text-decoration:underline;text-underline-offset:3px}
.dd-tag{display:inline-block;font-size:11.5px;padding:1px 8px;border-radius:99px;background:var(--panel2);color:var(--ink2);border:1px solid var(--line)}
.dd-tag.red{background:var(--accent-soft);border-color:transparent;color:var(--accent)}
.dd-tag.jade{background:var(--jade-soft);border-color:transparent;color:var(--jade)}
.dd-tag.gold{background:var(--gold-soft);border-color:transparent;color:var(--gold)}
.dd-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.dd-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
@media (max-width:720px){.dd-grid2,.dd-grid3{grid-template-columns:minmax(0,1fr)}}

/* ---------- 首页 ---------- */
.dd-hero{padding:6px 0 8px}
.dd-hero h1{font-size:38px;margin:10px 0 12px;line-height:1.2}
.dd-hero h1 em{font-style:normal;color:var(--accent)}
.dd-hero p{font-size:16.5px;color:var(--ink2);max-width:640px}
@media (max-width:720px){.dd-hero h1{font-size:29px}}
.dd-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:22px}
@media (max-width:720px){.dd-three{grid-template-columns:minmax(0,1fr)}}
.dd-three > div{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px 18px 16px;position:relative;overflow:hidden}
.dd-three .n{font-family:var(--serif);font-size:13px;color:var(--muted)}
.dd-three .t{font-family:var(--serif);font-size:21px;font-weight:700;margin:4px 0 6px;line-height:1.35}
.dd-three .d{font-size:13.5px;color:var(--ink2)}
.dd-three > div:nth-child(1){border-top:3px solid var(--accent)}
.dd-three > div:nth-child(2){border-top:3px solid var(--jade)}
.dd-three > div:nth-child(3){border-top:3px solid var(--gold)}

.dd-map{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
@media (max-width:820px){.dd-map{grid-template-columns:minmax(0,1fr)}}
.dd-map-col{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:14px}
.dd-map-head{padding:4px 4px 10px;border-bottom:1px dashed var(--line2);margin-bottom:10px}
.dd-map-head small{font-size:11.5px;letter-spacing:.12em;color:var(--muted)}
.dd-map-head b{display:block;font-family:var(--serif);font-size:17px;margin-top:2px}
.dd-map-node{display:block;width:100%;text-align:left;border:1px solid var(--line);background:var(--bg);border-radius:10px;padding:9px 11px;margin-top:8px;font-size:14px;line-height:1.45;position:relative}
.dd-map-node:hover{border-color:var(--line2)}
.dd-map-node.on{border-color:var(--accent);background:var(--accent-soft)}
.dd-map-detail{margin-top:12px;border-left:3px solid var(--accent);background:var(--panel);border-radius:0 14px 14px 0;padding:14px 18px;border-top:1px solid var(--line);border-right:1px solid var(--line);border-bottom:1px solid var(--line)}
.dd-chcards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
@media (max-width:720px){.dd-chcards{grid-template-columns:minmax(0,1fr)}}
.dd-chcard{text-align:left;border:1px solid var(--line);background:var(--panel);border-radius:16px;padding:16px 18px;display:flex;gap:14px;align-items:flex-start}
.dd-chcard:hover{border-color:var(--line2);box-shadow:var(--shadow)}
.dd-chcard .seal{width:40px;height:40px;border-radius:8px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-family:var(--serif);font-size:20px;font-weight:700;flex:none}
.dd-chcard h3{font-size:17px}
.dd-chcard p{font-size:13.5px;color:var(--ink2);margin-top:4px}

/* ---------- 章节 ---------- */
.dd-chhead{display:flex;gap:16px;align-items:center;margin-bottom:18px}
.dd-seal{width:62px;height:62px;border-radius:12px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-family:var(--serif);font-size:32px;font-weight:700;flex:none;box-shadow:inset 0 0 0 3px rgba(255,255,255,.18)}
.dd-chhead h1{font-size:32px}
@media (max-width:720px){.dd-chhead h1{font-size:26px}.dd-seal{width:52px;height:52px;font-size:27px}}
.dd-question{background:var(--accent-soft);border-radius:16px;padding:18px 20px;font-family:var(--serif);font-size:17.5px;line-height:1.7}
.dd-question small{display:block;font-family:var(--sans);font-size:12px;letter-spacing:.14em;color:var(--accent);font-weight:600;margin-bottom:4px}
.dd-thesis{margin-top:16px;color:var(--ink2)}
.dd-chain{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px;counter-reset:ch}
.dd-chain > div{flex:1 1 200px;min-width:0;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px 12px;position:relative}
.dd-chain > div b{display:flex;align-items:center;gap:6px;font-family:var(--serif);font-size:15px}
.dd-chain > div b::before{counter-increment:ch;content:counter(ch);width:20px;height:20px;border-radius:50%;background:var(--ink);color:var(--bg);font-family:var(--sans);font-size:11px;display:grid;place-items:center}
.dd-chain > div p{font-size:13px;color:var(--ink2);margin-top:4px;line-height:1.6}

.dd-sec{background:var(--panel);border:1px solid var(--line);border-radius:16px;margin-top:14px;overflow:hidden;scroll-margin-top:120px}
.dd-sec.open{box-shadow:var(--shadow);border-color:var(--line2)}
.dd-sec-head{display:flex;gap:12px;align-items:flex-start;width:100%;text-align:left;border:0;background:transparent;padding:18px 20px 6px}
.dd-sec-no{font-family:var(--serif);font-size:13px;color:var(--accent);border:1px solid var(--accent);border-radius:6px;padding:1px 7px;flex:none;margin-top:3px}
.dd-sec-head h3{font-size:19px}
.dd-sec-head .sub{font-size:12.5px;color:var(--muted);margin-top:3px;line-height:1.5}
.dd-sec-head .chk{margin-left:auto;flex:none;font-size:12px;color:var(--ok);white-space:nowrap;margin-top:4px}
.dd-sec-core{padding:4px 20px 14px 20px;font-size:15.5px}
.dd-sec-body{padding:4px 20px 20px;border-top:1px dashed var(--line)}
.dd-sec-foot{padding:0 20px 16px}
.dd-sub{font-size:12.5px;letter-spacing:.12em;color:var(--muted);font-weight:600;margin:18px 0 8px}
.dd-logic{margin:0;padding:0;list-style:none;counter-reset:lg}
.dd-logic li{position:relative;padding-left:30px;margin-top:10px}
.dd-logic li::before{counter-increment:lg;content:counter(lg);position:absolute;left:0;top:3px;width:20px;height:20px;border-radius:6px;background:var(--jade-soft);color:var(--jade);font-size:12px;font-weight:700;display:grid;place-items:center}
.dd-quote{margin:10px 0 0;padding:12px 16px;border-left:3px solid var(--gold);background:var(--gold-soft);border-radius:0 12px 12px 0}
.dd-quote p{font-family:var(--serif);font-size:15.5px;line-height:1.75}
.dd-quote cite{display:block;font-style:normal;font-size:12px;color:var(--muted);margin-top:4px}
.dd-mis{margin-top:14px;border:1px solid var(--line);border-radius:14px;overflow:hidden}
.dd-mis-row{display:flex;gap:10px;padding:12px 14px;align-items:flex-start}
.dd-mis-row .ic{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:700;flex:none;margin-top:2px}
.dd-mis-row.bad{background:var(--bad-soft)}
.dd-mis-row.bad .ic{background:var(--bad);color:var(--bg)}
.dd-mis-row.ok{background:var(--ok-soft)}
.dd-mis-row.ok .ic{background:var(--ok);color:var(--bg)}
.dd-mis-row small{display:block;font-size:11.5px;letter-spacing:.1em;color:var(--muted);font-weight:600}

/* ---------- 测验 ---------- */
.dd-quiz-q{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px 18px;margin-top:12px}
.dd-quiz-q h4{font-family:var(--sans);font-size:15.5px;font-weight:650;line-height:1.6}
.dd-opts{display:grid;gap:8px;margin-top:10px}
.dd-opt{text-align:left;border:1px solid var(--line);background:var(--bg);border-radius:10px;padding:9px 12px;line-height:1.5;display:flex;gap:10px;align-items:flex-start}
.dd-opt:hover:not(:disabled){border-color:var(--line2)}
.dd-opt:disabled{cursor:default}
.dd-opt .k{width:22px;height:22px;border-radius:6px;border:1px solid var(--line2);display:grid;place-items:center;font-size:12px;flex:none;margin-top:1px}
.dd-opt.right{border-color:var(--ok);background:var(--ok-soft)}
.dd-opt.right .k{background:var(--ok);border-color:var(--ok);color:var(--bg)}
.dd-opt.wrong{border-color:var(--bad);background:var(--bad-soft)}
.dd-opt.wrong .k{background:var(--bad);border-color:var(--bad);color:var(--bg)}
.dd-explain{margin-top:10px;font-size:14px;color:var(--ink2);border-top:1px dashed var(--line);padding-top:10px}
.dd-explain b{color:var(--ink)}
.dd-score{display:flex;align-items:center;gap:12px;flex-wrap:wrap}

/* ---------- 工具 ---------- */
.dd-tool{margin-top:18px;border:1px solid var(--line2);border-radius:18px;background:var(--panel);overflow:hidden}
.dd-tool-head{padding:16px 20px 12px;background:linear-gradient(0deg,transparent,var(--panel2));border-bottom:1px solid var(--line)}
.dd-tool-head .dd-eyebrow{color:var(--jade)}
.dd-tool-head h3{font-size:19px;margin-top:2px}
.dd-tool-head p{font-size:13.5px;color:var(--ink2);margin-top:4px}
.dd-tool-body{padding:16px 20px 20px}
.dd-range{display:grid;grid-template-columns:minmax(0,1fr);gap:4px;margin-top:10px}
.dd-range label{display:flex;justify-content:space-between;font-size:13px;color:var(--ink2);gap:8px}
.dd-range label b{font-variant-numeric:tabular-nums;color:var(--ink)}
.dd-range input[type=range]{width:100%;accent-color:var(--accent)}
.dd-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:14px}
@media (max-width:600px){.dd-kpis{grid-template-columns:minmax(0,1fr)}}
.dd-kpi{border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:var(--bg)}
.dd-kpi > small{display:block;font-size:12px;color:var(--muted)}
.dd-kpi > b{display:block;font-size:24px;font-variant-numeric:tabular-nums;font-family:var(--serif);line-height:1.3;margin-top:2px}
.dd-kpi > span{display:block;font-size:12.5px;color:var(--ink2)}
.dd-box{border:1px solid var(--line);border-radius:12px;padding:10px 12px 12px;background:var(--bg)}
.dd-box > small{display:block;font-size:12.5px;font-weight:600;line-height:1.5}
.dd-presets{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px}
.dd-presets button{font-size:13px}
.dd-legend{display:flex;flex-wrap:wrap;gap:14px;font-size:12.5px;color:var(--ink2);margin-top:6px}
.dd-legend i{display:inline-block;width:14px;height:3px;border-radius:2px;vertical-align:middle;margin-right:6px}
.dd-svg{width:100%;height:auto;display:block;margin-top:8px}
.dd-svg .g{stroke:var(--line)}
.dd-svg .t{fill:var(--muted);font-size:11px}
.dd-svg .t2{fill:var(--ink2);font-size:11px}
.dd-svg .base{stroke:var(--ink2)}
.dd-svg .bond{stroke:var(--muted)}
.dd-svg .la{stroke:var(--accent)}
.dd-svg .lb{stroke:var(--jade)}
.dd-svg .da{fill:var(--accent)}
.dd-svg .db{fill:var(--jade)}
@media (max-width:600px){.dd-svg .t,.dd-svg .t2{font-size:19px}.dd-svg .la,.dd-svg .lb{stroke-width:4.5}.dd-svg .bond{stroke-width:3}.dd-svg .da,.dd-svg .db{r:7px}}
.dd-note{font-size:13px;color:var(--muted);margin-top:10px;line-height:1.65}
.dd-verdict{margin-top:14px;border-radius:12px;padding:12px 14px;font-size:14.5px}
.dd-verdict.ok{background:var(--ok-soft)}
.dd-verdict.bad{background:var(--bad-soft)}
.dd-verdict.warn{background:var(--gold-soft)}
.dd-stackbar{display:flex;height:22px;border-radius:6px;overflow:hidden;background:var(--panel2);border:1px solid var(--line)}
.dd-stackbar > i{display:block;height:100%}
.dd-sort{border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:var(--bg)}
.dd-sort h4{font-family:var(--serif);font-size:16px}
.dd-sort .btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.dd-sort .btns button{font-size:13px;padding:5px 10px}
.dd-sort .btns button.ans-right{border-color:var(--ok);background:var(--ok-soft);color:var(--ink)}
.dd-sort .btns button.ans-wrong{border-color:var(--bad);background:var(--bad-soft)}
.dd-sort .btns button:disabled{cursor:default}
.dd-sort .res{margin-top:8px;font-size:13.5px;color:var(--ink2)}
.dd-flip{text-align:left;border:1px solid var(--line);border-radius:12px;background:var(--bg);padding:12px 14px;min-height:92px;display:flex;flex-direction:column;gap:6px}
.dd-flip:hover{border-color:var(--line2)}
.dd-flip.on{background:var(--jade-soft);border-color:transparent}
.dd-flip b{font-family:var(--serif);font-size:16px}
.dd-flip span{font-size:13px;color:var(--ink2);line-height:1.6}
.dd-spec{display:grid;grid-template-columns:minmax(88px,120px) minmax(0,1fr);gap:10px;align-items:center;width:100%;text-align:left;border:0;background:transparent;padding:8px 4px;border-bottom:1px dashed var(--line)}
.dd-spec .nm{font-family:var(--serif);font-weight:700;font-size:15px}
.dd-spec .tr{height:10px;background:var(--panel2);border-radius:99px;overflow:hidden}
.dd-spec .tr i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--gold),var(--accent))}
.dd-spec .tg{font-size:12px;color:var(--muted);margin-top:3px}
.dd-tl{position:relative;margin:4px 0 0 8px;padding-left:22px;border-left:2px solid var(--line2)}
.dd-tl-item{position:relative;padding:6px 0 10px}
.dd-tl-item::before{content:"";position:absolute;left:-29px;top:13px;width:12px;height:12px;border-radius:50%;background:var(--panel);border:2px solid var(--accent)}
.dd-tl-item.key::before{background:var(--accent)}
.dd-tl-item button{border:0;background:transparent;padding:0;text-align:left;width:100%}
.dd-tl-y{font-family:var(--serif);font-weight:700;color:var(--accent);font-size:14px}
.dd-tl-t{font-size:15px;font-weight:600;line-height:1.5}
.dd-tl-d{font-size:13.5px;color:var(--ink2);margin-top:4px}
.dd-check{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 0;border-bottom:1px dashed var(--line)}
.dd-check p{font-size:14.5px;line-height:1.55}
.dd-check small{display:block;font-size:12px;color:var(--muted)}
.dd-seg{display:inline-flex;border:1px solid var(--line2);border-radius:9px;overflow:hidden;flex:none}
.dd-seg button{border:0;background:transparent;padding:5px 10px;font-size:13px;border-left:1px solid var(--line2)}
.dd-seg button:first-child{border-left:0}
.dd-seg button.y{background:var(--ok);color:var(--bg)}
.dd-seg button.n{background:var(--bad);color:var(--bg)}
.dd-seg button.u{background:var(--gold);color:var(--bg)}
@media (max-width:560px){.dd-check{grid-template-columns:minmax(0,1fr)}}
.dd-textarea{width:100%;min-height:120px;border:1px solid var(--line2);border-radius:12px;background:var(--bg);padding:12px 14px;line-height:1.7;resize:vertical}
.dd-textarea:focus,.dd-input:focus{outline:2px solid var(--accent-soft);border-color:var(--accent)}
.dd-input{border:1px solid var(--line2);border-radius:10px;background:var(--bg);padding:7px 12px;width:100%}
.dd-prompts{margin:6px 0 10px;padding-left:18px}
.dd-prompts li{margin-top:6px;color:var(--ink2)}
.dd-take{margin-top:34px;text-align:center;padding:26px 18px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.dd-take p{font-family:var(--serif);font-size:22px;line-height:1.6}
.dd-take cite{display:block;font-style:normal;color:var(--muted);font-size:12.5px;margin-top:8px}
.dd-pager{display:flex;justify-content:space-between;gap:10px;margin-top:26px}
.dd-pager button{flex:1;text-align:left;border:1px solid var(--line);background:var(--panel);border-radius:14px;padding:12px 14px}
.dd-pager button:last-child{text-align:right}
.dd-pager small{display:block;font-size:12px;color:var(--muted)}
.dd-pager b{font-family:var(--serif)}
.dd-rule{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px dashed var(--line)}
.dd-rule .n{font-family:var(--serif);color:var(--accent);font-weight:700;width:24px;flex:none}
.dd-gloss dt{font-weight:700;margin-top:10px}
.dd-gloss dd{margin:2px 0 0;color:var(--ink2);font-size:14px}
`;

/* =========================================================
 * 内容数据
 * ========================================================= */

const BOOK = {
  title: "大道：段永平投资问答录",
  meta: "赵理亚 选 · 芒格书院 编 · 中信出版社 2025",
  span: "收录段永平 2006 年至 2025 年 4 月公开发表的问答与演讲",
};

const THREE = [
  { n: "基石一 · 投资的定义", t: "买股票就是买公司", d: "买公司就是买它整个生命周期里的净现金流（折现）。他说自己对投资的其他理解，都是从这几句话衍生出来的。" },
  { n: "基石二 · 决策的方法", t: "做对的事情，把事情做对", d: "做对的事情 = 不做明知是错的事，发现错了马上改；把事情做对 = 一个必然会犯错的学习过程。" },
  { n: "视角 · 让难题消失", t: "想长远，想本质", d: "“理性就是想长远”。把时间拉到 10–20 年，很多看似复杂的问题（估值、择时、宏观、选人）会自己变简单。" },
];

const MAP = [
  {
    col: "基石一", title: "买股票就是买公司", sub: "投资的定义",
    nodes: [
      { id: "a1", t: "价值 = 未来净现金流折现", d: "公司值多少，只取决于它从现在到结束（包括被卖掉）能产生的全部净现金，按你的机会成本折回今天。所有关于投资的说法——生意模式、护城河、能力圈——都只是在讨论“如何看懂现金流”。", go: ["c1", "c1s1"] },
      { id: "a2", t: "你看得懂吗？→ 能力圈", d: "只有少数生意，你能毛估估它 10 年后至少能赚多少。看不懂的就不碰；知道能力圈的边界，比能力圈有多大重要得多。安全边际首先是理解度，其次才是价格。", go: ["c1", "c1s5"] },
      { id: "a3", t: "现金流从哪来？→ 产品 · 商业模式 · 文化", d: "产品的差异化能长期维持，就是护城河，就是好的商业模式；维持护城河、出错时纠正的，是企业文化。所以他的过滤器顺序是：商业模式和企业文化第一，价格第三。", go: ["c2", "c2s1"] },
      { id: "a4", t: "价格是什么？→ 别人的报价", d: "市场短期是投票器、长期是称重机；真正的买家只有公司自己（用利润回购）。所以波动是朋友，而在决策里“考虑市场”很可能是错的。", go: ["c1", "c1s4"] },
      { id: "a5", t: "什么会让你出局？→ 不做空、不借钱", d: "好公司也经常大跌 40% 以上。做空和杠杆会让你在时间站到你这边之前就出局——“没人希望自己需要富两次”。", go: ["c1", "c1s5"] },
    ],
  },
  {
    col: "基石二", title: "做对的事情，把事情做对", sub: "决策的方法",
    nodes: [
      { id: "b1", t: "做对的事情 = 先不做错的事", d: "你不一定知道什么是对的，但几乎总知道什么是错的。明知是错就不做，发现错了马上改——不管多大代价都是最小的代价。这些积累下来，就是不为清单。", go: ["c4", "c4s1"] },
      { id: "b2", t: "把事情做对 = 学习过程", d: "把事情做对一定会犯错，就像打高尔夫总会偶尔把球打下水。能做的是靠能力圈、“功夫”和每天进步一点，降低犯错的概率。", go: ["c1", "c1s3"] },
      { id: "b3", t: "本分 = 企业里的“做对的事情”", d: "利润之上的追求、用户导向、不赚人便宜。步步高的秘诀不在做了什么，而在那张很长的不为清单。", go: ["c2", "c2s5"] },
      { id: "b4", t: "区分两种错误", d: "做了错的事 → 立刻停，放进不为清单；做事过程中犯的错 → 学习改进。用第二种办法去处理第一种错误，就像小偷被抓后总结“偷技不够好”。", go: ["c4", "c4s1"] },
    ],
  },
  {
    col: "视角", title: "想长远，想本质", sub: "让难题消失的角度",
    nodes: [
      { id: "v1", t: "从 10 年后看回来", d: "看 10 年比看 1–2 年容易得多。大多数公司 10 年后“啥都不是”，一眼就能排除；剩下的少数好公司，一点价格差从 10 年后看并不重要。", go: ["c1", "c1s7"] },
      { id: "v2", t: "平常心 = 回到原点", d: "在诱惑面前排除干扰，回到事物本质，先问对错。他说平常心是后天养成的理性思考习惯。", go: ["c2", "c2s5"] },
      { id: "v3", t: "用在人生：成为本该成为的人", d: "你是你所有选择的加总。胸无“大”志、享受过程、做正直的人——同一套方法用在人生上。", go: ["c4", "c4s4"] },
    ],
  },
];

const CHAPTERS = [
  /* ======================= 第一章 ======================= */
  {
    id: "c1", no: "壹", label: "第一章", title: "投资大道", kicker: "买股票就是买公司",
    blurb: "全书地基：一个公理，推出能力圈、不懂不碰、不做空不借钱、波动是朋友、持有=买入。",
    question: "投资到底是什么？如果“买股票就是买公司”只是一句定义，为什么段永平说，他对投资的其他理解都是从这几句话衍生出来的？",
    thesis: "这一章是全书的地基。它只有一个公理：股票是公司的一部分，公司的价值是它整个生命周期里净现金流的折现。其余所有规则，包括能力圈、不懂不碰、不做空、不借钱、波动是朋友、持有=买入、好公司最重要，都是这个公理在不同处境下的推论。所以这一章别当成规则清单来背，每读一条，问问自己：它是怎么从公理推出来的？",
    chain: [
      { h: "定义", t: "股票是公司的一部分 → 买股票就是买公司。这不是观点，是定义。" },
      { h: "价值", t: "公司值多少 = 它从现在到结束（含被卖掉）产生的全部净现金流，折回今天。" },
      { h: "可知", t: "你只能对少数看得懂的生意毛估估这件事 → 能力圈 → 不懂不碰。" },
      { h: "价格", t: "报价只是别人此刻愿意成交的价格，不是价值 → 波动是朋友，不是风险。" },
      { h: "风险", t: "真正的风险是永久亏损或回报不足 → 不做空、不借钱，永远别让自己出局。" },
      { h: "行动", t: "时间放大好公司、惩罚平庸公司 → 好公司最重要，价格合适就好，买了就当不卖。" },
    ],
    sections: [
      {
        title: "买股票就是买公司",
        sub: "投资是什么 · 投资的信仰 · 风险是第一考量 · 看懂生意是基本功",
        core: "段永平说，如果只能留一句话，就是“买股票就是买公司”。这是他从巴菲特那里学到的最重要的一句话，巴菲特则说这是他从格雷厄姆那里学到的最重要的一句话。再往下推一步：买公司就是买它未来的净现金流折现。这里的“未来”指公司的整个生命周期，“折现率”则是你自己的机会成本。",
        logic: [
          "“未来”有多久？到公司结束为止，而“结束”包括被卖掉在内的所有可能。所以只看 3 年、5 年，还算不上在看未来。",
          "折现率就是你的机会成本。最低的机会成本是无风险利率，他习惯拿美国国债做第一参照。所以“投不投”永远是一道比较题：这笔钱放在这里，比放在我能放的最好的地方更好吗？",
          "为什么不用公式？公式里每个变量都是对几十年后的猜测，算得越精确，越容易制造虚假的确定感。他只问两个问题：这家公司能长期获利吗？获得的利润如何给到股东？（2013-04-24）",
          "他说的“信仰”不是玄学，指的是骨子里相信：长期而言股市是称重机，利润和净现金流好的公司，股价早晚会跟上来。有了这份相信，才能忽略短期波动。",
          "风险第一。拿利息绝对无风险，投资却可能血本无归。只有在自己懂的东西上，才看得见风险在哪，这也为第五节的“不懂不碰”埋下了伏笔。",
        ],
        quotes: [
          { t: "我理解的投资归纳起来就是：买股票就是买公司，买公司就是买公司的未来现金流折现，句号！", d: "2012-06-24" },
          { t: "所谓未来现金流折现只是个思维方式，千万不要去套公式，因为没人可以真的确定公式中的变量", d: "2012-04-06" },
          { t: "啥时候当你觉得简单版就足够了的时候，你大概就可以了。", d: "2012-04-06" },
          { t: "先不谈风险的投资能叫投资么？", d: "2012-07-19" },
          { t: "如果你拥有一家公司的话，你就知道什么是你应该重点关注的了。", d: "2011-05-24" },
        ],
        misread: { wrong: "价值投资是众多投资流派中的一种。", right: "在他看来，并不存在“别的”投资方法：“其实投资就是价值投资的意思，不然投资投的是啥？”不买未来现金流的人，本质上是在玩另一种游戏。", src: "2012-06-24" },
      },
      {
        title: "价值投资是唯一的路",
        sub: "最容易的投资方法 · 投资像种田，投机像狩猎 · 见过大道不走小路",
        core: "投资和投机的分界线不在于持有多久，而在于你赚的是谁的钱。投资赚的是公司赚的钱，是正和游戏；投机赚的是其他参与者的钱，是零和游戏，大家彼此互为猎物。所以他说价值投资确实有点难，“是很难亏钱的难”。",
        logic: [
          "看图看线、量化、抄底、追热点，他全部归为投机，因为它们研究的都是“别人现在怎么看”。反问一句就清楚了：如果市场上全是量化，“他们赚谁的钱？”（2024-01-06）",
          "看图看线大约有 50% 的准确率，问题是“人们事先无法肯定哪次是对的”。赌徒的问题从来不是不够聪明，而是赢面天然不到一半。",
          "他说价值投资“最容易”，是真心话。如果你真懂一家公司，有人把 10 块钱的东西 1 块钱卖给你，你需要的不是勇气，只是确认它真的值 10 块。",
          "想走捷径的人会一直找捷径：“只要一个人认为有捷径，他大概就会努力去寻找捷径，一二十年后估计他还在到处问人捷径在哪里。”（2013-09-16）",
          "他不否认投机也能赚钱（比如索罗斯），只是认为那是另一种游戏，“很累且不好学”，而且投机会上瘾，不好改。",
        ],
        quotes: [
          { t: "投资非常像种田，是个结硬寨、打呆仗的过程，所以投资者就像农夫。投机则像狩猎，是个零和游戏，投机者之间互为猎物，非常刺激。", d: "2020-11-20" },
          { t: "10块钱的东西有人非要1块钱卖给你，你为什么会觉得难呢？", d: "2011-05-08" },
          { t: "当你需要问是不是投机的时候，那就是投机", d: "2022-01-04" },
          { t: "其实我也不愿意慢慢地变富，我只是不知道怎么才能快速变富而已。", d: "2019-06-03" },
          { t: "看图看线实际上就是看目前（这个时刻或时段）别人对股票的看法。价值投资者的心中是无图无线的！", d: "2012-08-14" },
        ],
        misread: { wrong: "价值投资者也该在大跌时抄底。", right: "“抄底是投机的概念……抄底是在看别人，而价值投资者只管在足够便宜的时候出手（不管别人怎么看）。”他还说过，自己买万科时恰好抄到了底，结果反而买少了。", src: "2010-02-23" },
      },
      {
        title: "投资简单但不容易",
        sub: "道需悟，术可学 · 投资没有充分条件 · 至少 85% 的人不适合投资 · 快即是慢",
        core: "简单的是原则：不懂不做。不容易的是真正搞懂一门生意。前者是“道”，也就是做对的事情；后者是“术”，也就是把事情做对。道要靠悟，术可以学，而且“先有道然后术才有用哈，不然就是瞎忙”。",
        logic: [
          "投资没有充分条件。好生意、好文化、好管理层、好价钱凑齐了，公司也可能犯致命错误，只是概率低得多、康复能力强得多。所以只能用概率思考，仓位取决于你理解得有多深。",
          "长期看股市一直在涨，为什么 80%–90% 的人还是亏钱？因为他们买不懂的东西、因为涨了而买、用杠杆、频繁交易。对这些人，他的建议很朴素：买标普 500，然后该干嘛干嘛。难处在于，“很少有人会认为自己属于 85% 的”。",
          "Fast is slow 是他竞拍巴菲特午餐时用的 ID，意思是“欲速不达”。它的反命题“慢就是快”并不成立。慢本身不是美德，做对的事情才是。",
          "为什么不该设回报目标？因为目标会逼你在没有好机会的时候也出手。可以有的只是一条“可接受回报率”的底线，也就是国债利率，低于它的就别碰。",
          "手里现金多的时候最容易犯错，他和巴菲特都这么承认。他的办法是：着急的时候尽量不做决策。",
        ],
        quotes: [
          { t: "简单指的是原则——就是不懂不做，不容易指的是理解、搞懂生意不容易。", d: "2013-03-26" },
          { t: "道指的就是做对的事情，或者说不做不对的事情，或者说发现错了马上改——不管多大的代价都是最小的代价。", d: "2013-03-24" },
          { t: "赌一般指的是48%赢面的下注，90%以上赢面的下注我一般称之为投资。", d: "2023-07-21" },
          { t: "最难的就是什么都不做。", d: "2010-03-08" },
          { t: "一旦心里有了要求回报率，动作就可能变形", d: "2024-07-18" },
        ],
        misread: { wrong: "“慢就是快”，所以越慢越好。", right: "他的原话是 Fast is slow（欲速不达），而且专门纠正过：“欲速不达反过来并不是慢就是快，逻辑上并不成立。”要避免的是为了快而去做错的事，不是要崇拜慢。", src: "2025-03-02" },
      },
      {
        title: "考虑市场很可能是错的",
        sub: "价格围绕价值上下波动 · 波动是朋友 · 任何股票都只有一个真正的买家 · 投自己明白的生意，就不容易恐惧和贪婪",
        core: "这个标题很容易被读成“市场常常是错的”。其实他的原句是“任何的考虑市场都很可能是错的”，意思是在决策里掺进对市场的揣测，这个动作本身就很可能是错的。他假设市场绝大多数时候都非常聪明，只是短期像投票器、长期像称重机；而最终决定股价的只有一个买家，就是公司自己。",
        logic: [
          "做个思想实验：假设苹果经营不变，但所有人都要卖出股票，谁来买？用什么钱买？答案是公司自己，用利润回购。他跟库克开过玩笑：如果苹果一直是这个价，十来年后我可能就是唯一的股东了。",
          "所以只要利润是真的，而且会以某种方式回到股东手里，短期价格怎么走，长期都“跑不掉”。“波动是朋友”说的是这个机制，不是一句心灵鸡汤。",
          "恐惧和贪婪不是心理素质问题，而是理解问题。真懂的公司大跌时，你会高兴；不懂的公司，涨了也想卖，跌了也想卖。",
          "他自己也犯过“考虑市场”的错。2024 年他本打算大量买入拼多多和腾讯，又觉得市场悲观、会低迷一阵，想靠卖 put 降低成本，结果没能按计划买到。这就是本节标题的出处。",
          "逆向思维不等于逆向操作：“逆向思维很重要，但逆向操作和随波逐流都是不可取的。最重要的是理性的独立思考能力。”",
        ],
        quotes: [
          { t: "所有的股票都只有一个真正的买家会最终影响到股价，其他人对股价的影响都是浮云。这个真正的买家就是公司自己，买股票的钱来自盈利。", d: "2013-03-02" },
          { t: "我不对抗市场，我尽量不理睬市场而已。", d: "2024-06-16" },
          { t: "恐惧的程度与了解程度成反比。", d: "2011-10-25" },
          { t: "投资不需要勇气，也就是说当你需要勇气时你就危险了。", d: "2010-03-16" },
          { t: "我不管理心态，因为投资是不需要管理心态的，但投机需要。", d: "2020-10-28" },
          { t: "我总是说，任何的考虑市场都很可能是错的，现在就是个具体的例子。", d: "2024-10-01" },
        ],
        misread: { wrong: "市场经常是错的，所以要跟市场反着做。", right: "他的假设正相反：“我总是假设市场绝大多数情况下是非常聪明的，除非我发现市场确实错了。”要戒掉的不是“顺着市场”，而是“考虑市场”：做决策只看生意本身。", src: "2012-04-06 / 2024-10-01" },
      },
      {
        title: "不做空、不借钱、不懂不碰",
        sub: "不懂不碰是铁律 · 投资是个概率事件 · 你懂得，才是你的好生意 · 高手在于错误率低 · 做空是愚蠢的 · 不用 margin",
        core: "这是巴菲特亲口告诉他的“投资中不可以做的事”。他的总结非常坦白：这些年亏掉的数以亿计的美元，每一笔都发生在违背这三条的时候；赚到的大钱，都在自己真正懂的地方。",
        logic: [
          "别把“懂”想得太理想化。它不是水晶球，而是“毛估估懂”：能判断这家公司 10 年后至少能赚多少钱。检验方法有两个：跌了你想全力买、涨了你不想卖；它 10 年不上市，你也睡得着。",
          "安全边际在他这里首先是理解度，不只是价格折扣：“不了解的公司再便宜也可能不便宜。”巴菲特“卡车过桥”的比喻说的也是这件事：越了解，需要的边际越小。",
          "做空为什么愚蠢？做多最多亏 100%，做空的亏损理论上没有上限；你不知道市场能疯狂到什么程度，时间也不站在你这边。他做空百度亏了大约 1.5–2 亿美元，更痛的是耗光了现金储备，错过了金融危机里的机会。",
          "杠杆为什么不行？它把“时间是朋友”变成了“时间是敌人”。好公司也会经常大跌（苹果从高点下跌 40% 以上就有好几次），杠杆会让你在它涨回来之前就出局。懂投资的人不需要杠杆，不懂的人更不应该用。",
          "他的失败档案：航空股 FRNT，油价判断全对，公司却在 2008 年被信用卡公司要求全额现金后申请了破产；天然气 ETF（UNG），研究后发现它和天然气价格并不线性相关，于是亏钱了结，如果不卖，还要多亏近 4 倍。",
          "高手的定义：“高手和其他选手的差别就在错误率低而不是能打出多少好球来。”",
        ],
        quotes: [
          { t: "我问过巴菲特在投资中不可以做的事情是什么，他告诉我说：不做空，不借钱，最重要的是不要做不懂的东西。", d: "2010-02-03" },
          { t: "知道自己的能力圈有多大，往往比自己能力圈有多大要重要得多！", d: "2012-04-06" },
          { t: "我选股不厉害，是业余级的，花的功夫太少。但我犯错的机会的确是大师级的，不懂就是不碰。", d: "2011-11-03" },
          { t: "看懂了一家公司的最简单的标准就是你不会想去问别人“我是不是看懂了这家公司”。", d: "2019-07-24" },
          { t: "反正你借不借钱一生当中都会失去无穷机会的，但借钱可能会让你再也没机会了。", d: "2010-04-11" },
          { t: "没人希望自己需要富两次的。", d: "2020-08-11" },
        ],
        misread: { wrong: "低杠杆（比如 0.3 倍）很安全，可以放大收益。", right: "他的回答只有五个字：“勿以恶小而为之。”他还说过：“用margin的人都不傻，但用margin是会上瘾的，直到掉坑里为止。”", src: "2019-05-20 / 2024-09-03" },
        toolAfter: "leverage",
      },
      {
        title: "估值实际上是“功夫”",
        sub: "定性比定量重要 · 看财报主要用于排除公司 · 不产生现金流的净资产没有价值 · 分红回购 · 每个买家自己“定价” · UHAL、万科",
        core: "“功夫”这个词本来就有“时间”的意思。他说的估值，不是算出一个目标价，而是对企业了解到足以毛估估：用现在的市值买下整家公司，未来 10–20 年它能赚的钱，和我手里其他机会比，哪个更好？了解一家公司要很多年，做决定却可能只要 20 分钟。",
        logic: [
          "为什么定性比定量重要？10 年以上的数字预测注定不准，但这门生意 10 年后还在不在、护城河还宽不宽，可以判断得相当准：“人们可能很容易知道茅台10年后大概能赚多少钱，但无法准确知道10年后的某一年能赚多少，也没必要知道。”（2019-08-23）",
          "定量主要用来判断下行空间，定性分析才是利润的来源。这就是所谓“模糊的正确”。",
          "他在意的财务数字很少：负债、净现金、现金流、开销是否合理、真实利润、扣除商誉后的净资产。时间足够长时，现金流约等于利润；如果现金流长期远小于利润，就要小心。",
          "市盈率是历史数据。他说的 P/E 指的是“相对于未来长期实际利润”的 P/E。愿意给多少倍，取决于你自己的机会成本，和市场无关。",
          "2011 年买苹果的“算术题”：市值约 3000 亿美元，净现金约 1000 亿，年利润不到 200 亿，他判断 5 年左右会涨到 500 亿。相当于用约 2000 亿买一家很快就能一年赚 500 亿的公司。算术很简单，但要得出这个判断，“对我来说至少20年功夫吧”。",
          "反例：UHAL 股价约 5 美元，净资产约 50 美元，他赚到了钱，但现在“不再买这种生意”了。万科市值 100 多亿时，他“随便给了个 500 亿”，后来因为负债太高不再关注，还说“如果时光能够倒流，我大概不会买创维或者万科”。便宜货不等于好投资。",
        ],
        quotes: [
          { t: "我认为估值就是个毛估估的东西、如果要用到计算器才能算出来的便宜就不够便宜了。", d: "2010-04-24" },
          { t: "一般而言，赚到几十倍甚至更多的股票绝不是靠估值估出来的，不然没道理投资人一开始不全盘压上。", d: "2010-04-24" },
          { t: "我看财报主要用于排除公司，也就是说如果看完财报就不喜欢或看不懂的话，就不看了。", d: "2010-03-08" },
          { t: "不能产生现金流的净资产其实没有价值（有时还可能是负价值）。", d: "2010-05-08" },
          { t: "股票是由每个买家自己“定价”的，到你自己觉得便宜的时候才可以买，实际上和市场（别人）无关。", d: "2012-04-14" },
          { t: "如果能判断出来一家公司未来至少能赚多少钱后，其实就是个小学算术题了。所以投资其实就是要搞懂生意，无他。", d: "2024-08-13" },
        ],
        misread: { wrong: "DCF 就是建一个精细的模型，算出目标价。", right: "“其实现金流折现法……就是毛估估的，所以是一个东西。”而且，“任何人只要试图用未来现金流的计算公式去计算公司的内在价值时，就说明其实他还不太懂自己在干什么”。", src: "2010-04-27 / 2011-01-27" },
        toolAfter: "payback",
      },
      {
        title: "好公司最重要",
        sub: "想 10 年 20 年后 · 好公司不怕萧条 · 越懂越集中 · 每次买卖都是独立的 · 合适价钱就好 · 持有 = 买入 · 宏观 · 卖 put",
        core: "把时间拉长到 10–20 年，很多难题会自己消失。大多数公司 10 年后“啥都不是”，一眼就能排除；剩下的少数好公司，120 元买还是 180 元买，从 10 年后看差别并不大。时间是平庸公司的敌人，是伟大公司的朋友。",
        logic: [
          "持有 = 买入，“其实不是一种观点，而是一个事实”，这是巴菲特亲口跟他确认的。你今天不卖，就等于用今天的价格又买了一次。所以“等回本再卖”毫无逻辑，成本是沉没成本（参见他讲的停车场投币器的故事）。",
          "但“持有 = 买入”不等于天天问自己“是不是高估了”，那会让你盯着市场而不是生意。更好的区分是：你是为持有而买（buy to keep），还是为卖出而买（buy to sell）。",
          "什么时候卖？当商业模式或企业文化出现长期不可修复的问题，或者找到了确定更好的机会。唯一不该用的卖出理由是“我已经赚钱了”。",
          "“不择时”的准确含义是：从 10 年后看不贵、手里又正好有钱，就可以买，不必等更便宜的价格。但“不择时不是追高的理由”，真正不择时的人，钱大多早已经在投资上了。",
          "越懂越该集中。巴菲特说最多分散到 6 家，所以真正看懂的公司至少应该占到仓位的 1/6，否则只能叫“观察仓”。",
          "卖 put 在他这里只是一种“让你更便宜地买你原来想买的股票的办法”：“我只为自己想拥有的股票投保。”前提永远是：从 10 年后看，这个价格是便宜的。",
          "宏观：“在根基不变的情况下确实没必要关注太多的宏观变化。”好公司不怕萧条，萧条时优势反而更大。",
        ],
        quotes: [
          { t: "当你迷惘的时候，试试往远处看？看10年往往比看1到2年要容易很多", d: "2022-01-26" },
          { t: "假设一个礼拜后股市就关闭了，10年或20年后的某一天再开，你的决策会是什么？", d: "2019-09-08" },
          { t: "当合适的价钱出现时，除非你知道等什么，不然你在等什么？", d: "2014-07-26" },
          { t: "其实，卖股票和成本无关，买股票和其到过多少价也无关。最重要其实也是唯一重要的是公司本身。", d: "2012-04-26" },
          { t: "我对看懂的定义非常简单，就是敢下重注。", d: "2024-04-21" },
          { t: "伟大的公司要惜卖！", d: "2022-01-31" },
        ],
        misread: { wrong: "“长期投资”就是价值投资，被套了就拿着。", right: "“长期投资并不自动等于价值投资，但价值投资一般都是长期投资。”“没什么比买错股票并长期持有伤害更大的了。”他甚至建议把“长期投资”换个说法，叫“投资长期”。", src: "2012-03-14 / 2011-10-29 / 2024-08-10" },
      },
    ],
    quiz: [
      { q: "你持有的一只股票被套了 30%，心里想着“等它回本就卖”。按本章的逻辑，你最该问自己哪个问题？", o: ["它大概什么时候能回本？", "如果今天手里是同样多的现金，我会按现价买入它吗？", "最近市场情绪是不是太悲观了？", "再补仓多少能把成本摊到现价附近？"], a: 1, e: "持有 = 买入，卖出和买入成本无关。成本是沉没成本，就像为了不浪费投币器里剩下的半小时，特意在停车场多坐半小时。他讲过忠旺的真实故事：同事们被套，他建议“无论亏赚”都换成更好的公司，舍不得换的人后来付出了巨大的机会成本。" },
      { q: "一家公司股价从 60 跌到了 1，你觉得“价值投资者就该在这时候抄底”。段永平会怎么看？", o: ["对，跌得越多，安全边际越大", "抄底本身是在看别人；买不买，只取决于你能不能毛估估它未来的现金流", "等技术面企稳、放量后再买更稳妥", "分三批买入，用时间分散风险"], a: 1, e: "“抄底就是投机，为什么被套牢后就成了价值投资了？巴菲特被套花旗银行了吗？”（2012-01-27）股价跌了多少不是买入理由，就像“它曾经到过多少价”也不是。" },
      { q: "A 公司市盈率 30 倍，你判断它未来 20 年利润平均每年增长 10%；B 公司市盈率 8 倍，但利润每年萎缩 5%。只比较“20 年累计利润 ÷ 买价”，哪家更好？", o: ["B，8 倍便宜太多了", "A，大约 2.1 倍对 1.5 倍", "两家差不多", "没法比，要看市场风格"], a: 1, e: "A：20 年累计利润约为当前年利润的 63 倍，63 ÷ 30 ≈ 2.1；B：约 12.2 倍，12.2 ÷ 8 ≈ 1.5。这正是芒格对巴菲特的提醒：烟蒂型投资的回报，可能不如好的成长型公司。本章的“毛估估计算器”可以自己拨动试试。" },
      { q: "你对一家公司有七八成把握，想用 0.3 倍的低杠杆放大收益。段永平的回答是？", o: ["可以，0.3 倍离爆仓还很远", "勿以恶小而为之", "只要是好公司，杠杆就没问题", "可以用，但要设好止损"], a: 1, e: "原话就是“勿以恶小而为之”（2019-05-20）。好公司也会经常跌 40% 以上；杠杆会让你在它涨回来之前出局。“懂投资的人不需要用margin，不懂投资的人更不应该用margin。”" },
      { q: "以下哪种状态，最能说明你“真的懂了”一家公司？", o: ["能背出它近三年的财报数字", "它大跌时你想全力加仓，大涨时也不想卖", "请教过的三位行业专家都认可你的判断", "买入后每天看新闻，确认逻辑没有变"], a: 1, e: "“没看懂的公司比较容易鉴别，就是股价一掉你就想卖，涨一点点你也想卖的那种。看懂大概就是怎么涨你都不想卖，大掉时你会全力再买进。”（2019-04-06）需要天天看新闻、到处问人的，恰恰是不懂的信号。" },
      { q: "在段永平这里，“安全边际”最接近哪个意思？", o: ["买入价比内在价值低 30% 以上", "你对这家公司（尤其是它 10 年后的样子）的理解程度", "至少分散持有 20 只股票", "账户里始终留 30% 现金"], a: 1, e: "“安全边际应该指的就是你自己的了解度”（2015-01-21）；“不了解的公司再便宜也可能不便宜”（2020-10-15）。价格折扣只有在你懂的前提下才有意义。" },
      { q: "第四节的标题“考虑市场很可能是错的”，最准确的理解是？", o: ["市场大部分时候是错的，所以要反着做", "做决策时掺进“市场接下来会怎么走”的揣测，这件事本身很可能是错的", "市场长期来看也是错的", "市场情绪是可以预测的"], a: 1, e: "他假设市场绝大多数时候很聪明，长期更是“绝顶聪明”。要戒掉的是“考虑市场”这个动作。2024 年他自己就因为想等市场低迷、多卖点 put，结果没能按原计划买入拼多多和腾讯。" },
      { q: "他竞拍巴菲特午餐时用的 ID 是“Fast is slow”。下面哪种理解最贴近原意？", o: ["慢就是快，越慢越好", "欲速不达：为了快去走捷径、做错的事，最后反而更慢", "投资要慢慢建仓", "不要频繁看盘"], a: 1, e: "原意就是“欲速不达”。他专门纠正过：“欲速不达反过来并不是慢就是快，逻辑上并不成立。”（2025-03-02）" },
    ],
    reflect: [
      "用不超过三句话，写下你自己的“投资简单版”。写不出来的话，是哪一环还没想通？",
      "列出你现在持有的每一项资产：如果它 10 年不能交易，你睡得着吗？睡不着的那一项，是因为不懂、因为杠杆，还是因为它本身就是一门苦生意？",
      "写出 3 个你真懂的生意，再写 3 个你“以为懂”的生意。两者的区别在哪？",
    ],
    takeaway: { t: "我理解的投资归纳起来就是：买股票就是买公司，买公司就是买公司的未来现金流折现，句号！", d: "2012-06-24" },
  },

  /* ======================= 第二章 ======================= */
  {
    id: "c2", no: "贰", label: "第二章", title: "商业模式和企业文化", kicker: "什么决定了未来的现金流",
    blurb: "回答第一章留下的问题：现金流从哪来？产品 → 商业模式 → 企业文化 → 人。",
    question: "第一章说，价值就是未来的现金流。那么，是什么决定了一家公司未来几十年能赚多少钱？段永平的回答分三层：产品、商业模式、企业文化。价格只排第三。",
    thesis: "这一章回答第一章留下的问题：未来的现金流从哪里来？最底层是产品，也就是“用户需要但别人没能满足的东西”（差异化）；差异化能长期维持，就是护城河，就是好的商业模式；而能长期维持差异化、出错后能纠正的，是企业文化（利润之上的追求、用户导向、本分）。所以他的过滤器顺序是：商业模式和企业文化第一，价格第三。前两条是必要条件，没有权重之说，过不去就不用往下看了。",
    chain: [
      { h: "产品", t: "生意能不能发展好，关键且只取决于产品。其他因素只影响快慢。" },
      { h: "差异化", t: "用户需要、而别人没能满足的东西；没有差异化，最后就是价格战。" },
      { h: "护城河", t: "能长期维持的差异化 = 定价能力 = 护城河 = 好的商业模式。" },
      { h: "文化", t: "谁来维持护城河？出错时谁来纠正？答案是企业文化，也就是“做对的事情”。" },
      { h: "人", t: "文化靠人传承：正直诚信第一，合适性比合格性重要。" },
      { h: "价格", t: "前两道过滤器都过了，才从 10 年以上的角度去看价格。" },
    ],
    sections: [
      {
        title: "商业模式越好，确定性越高",
        sub: "商业模式和企业文化第一，价格第三 · 再好的车手也难开好一辆烂车 · 好生意非常难得",
        core: "商业模式，简单讲就是公司赚钱的模式。好的商业模式有两个特征：利润和净现金流一直都很好；竞争对手花很长时间也很难抢走。他用刮彩票形容自己的过滤器：看到商业模式不好，就像刮奖刮出一个“谢”字，还要继续往下刮吗？",
        logic: [
          "马和骑师：“商业模式像马，管理层加企业文化像骑师，经营结果就是比赛结果。”再好的骑师也骑不动一匹烂马，所以先看马。",
          "护城河就是能长期维持的差异化；定价能力和护城河“其实是一回事”。看商业模式看三样东西：护城河能不能长期坚固，长期毛利率是否合理（反映产品有多容易被替代），长期净现金流是否让人满意。",
          "苦生意的共同特征：进入门槛低、产品差异化小、靠价格竞争、资产重、需要不断借钱。航空、光伏硅片、船运、彩电、券商、电池储能……“产品同质化程度越高，苦生意的概率越大。”",
          "成本优势不是护城河：“还没见过成本优势可以成护城河的……制造业好像没见过。”资源型公司天然的低成本是例外。",
          "比较商业模式的好坏，“比较的是净现金流，和行业无关”。别用“行业状元”的标准找好生意，很多状元只是昙花一现。活得久也不等于好生意，日本就有存在了上千年、却算不上好生意的老店。",
          "“长长的坡，厚厚的雪”：在他看来，苹果、茅台、网易、腾讯、谷歌都像；亚马逊则是“长长的坡，但上面的雪不太厚”。",
        ],
        quotes: [
          { t: "right business + right people + right price + time = good result", d: "2013-04-19" },
          { t: "好的商业模式很简单，就是利润和净现金流一直都是杠杠的，而且竞争对手哪怕用很长的时间也很难抢。", d: "2020-10-11" },
          { t: "第一，生意模式越好，投资的确定性越高或者叫风险越低；第二，见第一条；第三，见第一条；第四，见第一条。", d: "2013-04-03" },
          { t: "再好的车手也很难开好一辆烂车。", d: "2013-04-22" },
          { t: "你要是想忙一辈子的话，就多买几个这样的企业。", d: "2011-01-05" },
          { t: "这里长长的坡其实不光指的是行业，而是包括企业本身能否长跑，所以企业文化很重要。", d: "2017-03-18" },
        ],
        misread: { wrong: "行业龙头、市占率第一，就是好生意。", right: "“这个世界可能有几十几百个甚至更多的行业和行业状元，但商业模式好的凤毛麟角。用找行业状元的办法就会很容易去投那些商业模式不好的行业状元，那些状元很可能只是昙花一现的辉煌而已。”", src: "2023-07-01" },
        toolAfter: "sorter",
      },
      {
        title: "生意只取决于产品",
        sub: "差异化是用户需要但别人没能满足的东西 · 没有差异化最后就是价格战 · 盲目创新是危险的 · 性价比是借口 · 动作越少越好 · 敢为天下后",
        core: "差异化不是“与众不同”，而是那个“不同”恰好是用户需要、别人又没能满足的东西。它有一个隐含的前提：同行已经满足的基本需求，你一样都不能少。所以真正的差异化几乎都是厚积薄发，苹果做出一个有差异化的产品，可能需要 8 年 10 年。",
        logic: [
          "为什么没有差异化，最后就只剩价格战？航空公司是极致的例子：北京飞广州，各家票价几乎一样；麦片就不同，口味不一样，“买的人不会因为5%的折扣就换口味”。一个问题就能分拣大多数生意：用户会不会因为别家便宜一点就换走？",
          "降价就像核武器，“能不用就别用”；价格战的结果往往是“优不胜”。有人问企业什么时候能用价格战这个大招，他答：“犯病的时候。”",
          "创新必须以用户为导向。步步高的企业文化里不提“创新”，因为“我们也没有提要吃早餐、午餐及晚餐”。为了不同而不同的创新是危险的。",
          "聚焦。单一产品模式可以把资源集中起来：成本更低、渠道库存更小（品种越多，渠道库存呈几何级增长）、质量更一致、出了问题反应更快。诺基亚一年推出约 50 个机种，“岂有不死之理”。",
          "多元化“一般是主业不够强，想靠多元化找出路，结果找了一条岔路”。",
          "敢为天下后：iPod、iPhone、Xbox、PlayStation 都不是同类产品里的第一个。前提是你能提供用户需要、别人给不了的东西，而且长远来看综合实力数倍于对手，也就是“没有金刚钻不揽瓷器活”。",
        ],
        quotes: [
          { t: "生意能不能发展好关键且只取决于公司的产品，无他。其他只是对快慢有影响。", d: "2020-11-05" },
          { t: "产品的差异化不是指所谓的“与众不同”，而是指“与众不同”的东西正好是用户需要而其他人没能够满足的东西。", d: "2011-01-10" },
          { t: "用户买的从来就不是技术，也不是硬件，用户买的是好用的产品。", d: "2011-05-10" },
          { t: "技术的优势从来就很少是护城河，形成技术的文化才是。", d: "2013-08-17" },
          { t: "说追求“性价比”的公司大多是在为自己的低价找借口。", d: "2017-03-25" },
          { t: "“敢为天下后”的整句话是“敢为天下后，后中争先”，没有能力后中争先的地方是绝对不该去的。", d: "2016-03-05" },
        ],
        misread: { wrong: "性价比高 = 价格便宜。", right: "“高性价比的东西不等于便宜……好的车往往也是性价比高的车，而且这些车往往比较贵”他甚至认为 iPhone 很可能是最便宜的手机：按 10–20 年里花在手机上的总钱数算。", src: "2014-08-28 / 2023-11-03" },
      },
      {
        title: "品牌是某种差异化的浓缩",
        sub: "好产品最后会有好印象 · 品牌没有溢价 · 没有靠营销起来并能持久的公司 · 广告只是表达产品 · 出海是伪命题",
        core: "品牌是一家公司过去所有产品在人们心中留下的印象的总和：好印象传得慢，坏印象传得快；建立一个好印象要很多年，毁掉它可能只需要一两件事。所以品牌不是独立于产品的东西，也谈不上“溢价”，贵的品牌往往有贵的道理。",
        logic: [
          "很多人说他是“营销高手”，他坚决否认。营销只是木桶上的一块板：“凡是认为公司好是因为营销好的说法其实就像认为一个能装水的木桶是因为有了一块叫‘营销’的木板一样可笑。”",
          "广告有用，但作用有限：“广告能影响的消费者只有20%左右，其余全靠产品本身。”夸大其词的广告长期必败，因为消费者作为一个群体，长期来看是极聪明的。",
          "“社会信任度越低，品牌的作用越大。”在中国买房、买酒，品牌代表的就是信任。",
          "“牌子”不等于“名字”。假如有人出一万亿只买“茅台”这两个字，茅台换个名字，要不了多久就会和原来一样。价值在酒里，不在那两个字里。",
          "饥饿营销、搭配销售、同样的东西分多个品牌卖，他都认为是生意导向而不是用户导向，是短视的做法。",
          "全球化、出海：“你并不需要去追求它，到了该去的时候，自然就去了。”",
        ],
        quotes: [
          { t: "所谓品牌就是公司过去做过的所有事情（产品）在消费者心中的烙印（印象），好坏大家都会记得的。", d: "2019-08-20" },
          { t: "我个人观点认为品牌是没有溢价的，一般人看到的溢价其实是假象。贵的品牌往往有贵的道理", d: "2010-05-14" },
          { t: "所谓客户忠诚度实际上是客户信任度（了解度），这个是护城河里很重要的一部分。", d: "2010-05-30" },
          { t: "营销很简单，就是把好东西卖出去。", d: "2010-03-18" },
          { t: "没有靠营销起来并能持久的公司，能够让公司长久的唯一办法就是能够不断有好产品。", d: "2019-09-17" },
          { t: "广告不会赋予产品任何东西。广告只是表达产品而已，好的广告表达的效率高。", d: "2010-10-16" },
        ],
        misread: { wrong: "好品牌可以卖出“品牌溢价”。", right: "“品牌溢价我觉得是一种误解。品牌只是物有所值而已。当一个品牌想当然认为其有溢价时，会很容易犯错误。”", src: "2010-06-15" },
      },
      {
        title: "好的企业文化就是做对的事情",
        sub: "文化好的企业活得长些 · 最重要的是什么不可以做 · 听其言观其行 · 格力、UT 斯达康、脸书、双汇、比亚迪",
        core: "企业文化听起来很虚，他却说它“非常实在”：讲的就是什么是对的事情、什么是不对的事情，以及怎样把对的事情做对。规矩管不着的地方，由文化来管。在他的选股里，文化是一道过滤器：选对公司是能力问题，不选错公司是是非问题。",
        logic: [
          "文化由三部分组成：使命（公司为什么存在）、愿景（大家共同的、可以实现的远景）、核心价值观（是非观）。其中最重要的是核心价值观：不符合的事情，就不做。",
          "怎么看？听其言，观其行。为了看懂苹果，他几乎看了苹果所有的发布会，以及库克和乔布斯讲过的能找到的所有东西。只看一次访谈不够，要对照他们过去说过什么、有没有做到。",
          "怎么排除？不好的文化最典型的特征是“经常说瞎话”；还有凡事以利益而不是以是非为准绳、为了取悦华尔街做短期动作、喊“5 年做到 1000 亿市值”这类口号。",
          "为什么“股东第三”的公司反而更好？“股东第一”的公司常常为了季度业绩做短期动作，最后反而伤害了股东。股东利益，指的是企业整个生命周期的净现金流折现。",
          "判例：格力车间的标语是“早上吃好，晚上早睡”，另一家公司是“大战九十天”，他说“这就是企业文化了”；拜访 UT 斯达康之后，他以最快速度卖光了股票；看完扎克伯格在国会的证词，他对 Facebook “粉转路”，随后清仓；关于双汇：“黑天鹅事件在买的时候就应该避开了”",
          "文化是必要条件，不是充分条件。好文化不保证有好的商业模式；但没有好文化，好的商业模式早晚会守不住。",
        ],
        quotes: [
          { t: "企业文化作为过滤器非常有威力，为我避免了很多错误。怎么选对的公司是能力问题，不选错的公司是是非问题。", d: "2019-06-06" },
          { t: "简单讲就是规矩管不着的地方文化管。", d: "2016-07-05" },
          { t: "所谓的企业文化好并不是百战百胜的武器，他只是能让企业少犯原则性错误而已。", d: "2011-02-11" },
          { t: "很难判断一个企业的文化是否好，但看出不好的企业文化要容易得多。", d: "2010-07-10" },
          { t: "我经常会用拟人化的角度去想一家公司。我不想打交道的人我也不想投资他们的公司。", d: "2020-10-11" },
          { t: "我个人投资时比较喜欢这类“股东第三”的公司，最害怕那种“股东第一”的公司。", d: "2012-01-02" },
        ],
        misread: { wrong: "企业文化就是墙上的口号，或者“狼性”。", right: "“企业文化其实非常实在，建议你看看苹果的发布会……从现在往前看10年的发布会，看完你会有体会的。”至于狼性：“狼性文化最终会输给人性文化。”", src: "2020-12-04 / 2017-02-26" },
      },
      {
        title: "利润之上的追求",
        sub: "赚本分钱，你会睡得好 · 决策时首先考虑是非 · 看不见的护城河 · 让利润追着自己跑 · 只有平常心才能本分 · 更健康更长久",
        core: "“利润之上的追求”不是不要利润，而是遇到问题时先问一句：这是对的事情吗？这是应该赚的钱吗？差别很小，20 年后却会很大。他把这种做法叫“本分”（做对的事情，把事情做对），把回到这种思考的心态叫“平常心”。",
        logic: [
          "为什么有利润之上追求的公司，长期反而赚得更多？因为它像一个过滤器，让组织在短期诱惑面前不走偏，于是少犯致命错误、活得更久、享受复利。真正的好企业是“让利润追着自己跑”。",
          "本分首先用来检视自己，不是拿来照别人的照妖镜。他讲过自己早年少付台商 50 台散件钱的事，“反省了很久，终于觉得是自己错了”；也讲过步步高资金紧张时，给供应商开出两个选项：付 1% 的月息，或者把货款转成股份。",
          "平常心，就是在诱惑面前排除外界干扰，回到事物的本源，辨别是非对错。“愤怒一下，然后平常心回归本源，该干嘛干嘛，不要因为愤怒做出任何决定。”",
          "更健康更长久。多数企业死于资金链断裂，但那只是表象。所以扩张时，他主张用“足够的最小发展速度”，核心是安全；放在投资里，就是复利。",
          "守正不出奇：守正不是为了出奇。“其实妙手就是本手，所以其实本无妙手。”弯道超车在他看来是“提高翻车率的有效办法”。",
        ],
        quotes: [
          { t: "利润之上的追求的意思不是利润至上，意思正好相反。", d: "2012-07-24" },
          { t: "多数公司碰到问题时讨论的都是有没有钱赚的问题，而有利润之上追求的公司碰到问题时可能会先问一句：这是对的事情吗？这是应该赚的钱吗？其实差别很小，但20年后差别很大。", d: "2020-07-10" },
          { t: "本分，大概就是该干嘛干嘛，该是谁是谁的意思。", d: "2010-03-23" },
          { t: "如果你赚的是本分钱，你会睡得好。", d: "2010-09-21" },
          { t: "原则问题不应该妥协，这不是代价的问题。", d: "2019-05-24" },
          { t: "利润之上的追求不是术，是道！", d: "2023-09-22" },
        ],
        misread: { wrong: "利润之上的追求，是一种更高级的赚钱技巧，或者就是做公益。", right: "“在有些人的眼里，道就是术，是更高级的术……利润之上的追求不是术，是道！”它的意思是“把消费者需求放在公司短期利益前面”，而不只是做些不赚钱的公益。", src: "2023-09-22 / 2020-07-10" },
      },
      {
        title: "用户导向",
        sub: "自己不喜欢的东西别拿出来卖 · 消费者作为群体是理性的 · 站在用户的立场想问题 · 摩托罗拉、柯达、诺基亚",
        core: "消费者导向最通俗的说法是：自己不喜欢的东西，别拿出来卖。它背后的假设是，长期而言，消费者作为一个群体是理性的。所以不管消费者眼前是否理性，都要把他们当作理性的；否则经营就会滑向投机，甚至滑向不道德。",
        logic: [
          "三种导向：市场导向看“现在好不好卖”；利润导向看“能赚多少”；消费者导向看“产品最后给用户带来什么体验”。消费者只能根据现有的产品表达喜好，所以只做市场导向的公司容易短视。",
          "客户不等于用户。狗粮的客户是狗主人，用户是狗。只讨好客户（包装、渠道、运营商），用户却不满意，东西终究卖不好。",
          "三个反例：摩托罗拉是工程师导向，他等了好几年都没等到手机上加一个时钟，只好换了诺基亚；柯达的出发点是卖胶卷，而不是让大家拍出更好的照片；诺基亚盯着市场份额，一年推出约 50 个机种。",
          "市占率和排名是结果，不是目标：“消费者在买东西时一般并不在乎谁是第一”",
          "售后是销售的延伸，是产品承诺的一部分。小霸王学习机“一年包换”、售后讲究“立等可取”，都来自这个想法。",
        ],
        quotes: [
          { t: "最通俗的说法就是自己不喜欢的东西别拿出来卖。", d: "2012-04-28" },
          { t: "无论消费者眼前是否理性，我们都一定要认为他们是理性的。不然的话，你经营企业就可能会有投机行为，甚至会有不道德行为。", d: "2010-03-26" },
          { t: "发现用户需求的诀窍可能是总是站在用户的立场想问题。", d: "2010-03-30" },
          { t: "市场调研只能够帮你印证你的想法而已，你如果自己没想法，市调是绝对没用的。", d: "2011-02-26" },
          { t: "以客户为中心就是生意导向的意思，和以用户（消费者）导向的意思很不一样。", d: "2024-01-14" },
          { t: "利润导向和消费者导向的差别长期而言就是生与死的差别。", d: "2012-04-28" },
        ],
        misread: { wrong: "“Think different”就是不从众、要与众不同。", right: "“这个说法并不完全对。正确的说法是消费者导向。”苹果因为乔布斯说过不做大屏，大屏手机晚了 3 年多，就是 Think different 离开了用户的例子。", src: "2020-11-26" },
      },
      {
        title: "从更长远的角度看人",
        sub: "正直诚信 · 董事会的作用 · 建立企业文化 · 狼性 vs 人性 · 合适性比合格性重要 · 公平心 · 钱是保健因子",
        core: "文化最终要靠人。他选人的顺序是：先看合适性（价值观是否匹配，几乎改不了），再看合格性（做事的能力，可以培训）。管理者最重要的品质是正直诚信（integrity）；董事会的作用是“不让做不对的事”；钱则是保健因子：给少了留不住人，给多了也不会让人更努力。",
        logic: [
          "时间尺度决定谁更重要：看 5–10 年，CEO 至关重要；看 10–50 年，董事会更重要，因为它能选出好的 CEO；看得更长，企业文化最重要，因为它能维持一个好的董事会。",
          "为什么主要靠校招、少用空降兵？从别处来的人带着别处的文化，认同起来不容易。他坦言，步步高后来为了发展快一点从外面招了不少人，“好像也吃了些苦头”，这就是欲速不达。",
          "要有公平心，但不搞平均主义。公司不分房、不配车；任何人出差都可以坐头等舱，但公司只报销经济舱，包括他自己。奖金是契约，不是老板的赏赐，“应该是公司谢谢大家一年的努力”。",
          "激励因子是“不要让人心委屈了，要让人觉得有意思”。所谓股权激励，他说“实际上是保健计划”。",
          "授权分五步：指示、指导、协商、授权、放权，底线是 never out of control（永远不失控），而只有好的文化才可能做到这一点。关键是能容忍“把事情做对”过程中犯的错。",
          "规矩要简单、有道理、能执行。大家都不遵守的规矩，可能本身就不合理（比如停车线的例子）；定了规矩却不执行，比没有规矩还糟。",
        ],
        quotes: [
          { t: "最重要的是integrity（正直诚信）。", d: "2010-05-20" },
          { t: "董事会的作用是不让做不对的事，不应该建议什么。", d: "2010-08-30" },
          { t: "选人本分诚信比聪明重要，合适性比合格性重要。", d: "2019-09-10" },
          { t: "钱是保健因子，不是激励因子，给多了没用，给少了不行", d: "2019-10-19" },
          { t: "我最怕的就是当老板说什么大家都说“好”。那时公司就危险了。", d: "2010-04-02" },
          { t: "简而言之，不要让重要的事情变成紧急的事情。", d: "2019-03-16" },
        ],
        misread: { wrong: "重赏之下必有勇夫，多发钱就能激励员工。", right: "“如果员工已经很努力在工作了，多发钱并不会让他们更努力，但少发是会留不住人的。所以，发多少其实体现的是公平。”", src: "2011-02-17" },
        toolAfter: "filter",
      },
    ],
    quiz: [
      { q: "一家航空公司管理层口碑极好，连续多年市占率第一，股价也很便宜。按段永平的过滤器，你第一步该看什么？", o: ["管理层的执行力", "商业模式：产品有没有差异化，用户会不会因为便宜一点就换走", "市盈率是否低于历史均值", "未来油价的走势"], a: 1, e: "商业模式是第一道过滤器，没有权重之说。航空是产品几乎无法差异化的极致例子，最后只能拼价格：“再好的车手也很难开好一辆烂车。”他自己买航空股 FRNT，油价判断全对，公司还是破产了。" },
      { q: "以下哪一个最符合他说的“差异化”？", o: ["把手机做成别人没做过的三角形", "做出一个用户确实需要、但现有产品都没有满足的功能", "价格比同行低 20%", "把广告预算翻倍"], a: 1, e: "差异化是“与众不同的东西正好是用户需要而其他人没能够满足的东西”。为了不同而不同是盲目创新；低价和广告都不是差异化。" },
      { q: "一家制造企业说：“我们的成本全行业最低，这就是我们的护城河。”他会怎么看？", o: ["认同，低成本是最强的护城河", "制造业的成本优势很难长期维持，他还没见过能成为护城河的", "要看规模，规模大了就是护城河", "要看有没有政府补贴"], a: 1, e: "“还没见过成本优势可以成护城河的，很少有企业能长期维持低成本的，制造业好像没见过。”（2010-05-24）资源型的天然低成本是例外（2025-04-04）。" },
      { q: "你的产品销量连续下滑。按他的逻辑，最该优先做的是？", o: ["加大促销和广告投放", "请营销高手重做渠道策略", "回到产品本身：它是不是不够好，有没有满足用户的真实需求", "降价，打一场价格战"], a: 2, e: "“销量不好的原因大概率是产品不够好，别的原因可能比较次要。”（2020-12-06）营销只能锦上添花；降价像核武器，能不用就别用。" },
      { q: "做狗粮时，“用户导向”应该以谁为准？", o: ["狗主人喜欢的包装", "经销商的利润空间", "狗到底爱不爱吃", "行业排名"], a: 2, e: "狗主人是客户，狗才是用户。“以客户为中心就是生意导向的意思，和以用户（消费者）导向的意思很不一样。”" },
      { q: "某公司董事长公开宣布：“5 年内市值做到 1000 亿，成为行业第一。”他的第一反应最可能是？", o: ["有野心，值得关注", "凡是说要把市值做到多少的，他都不碰", "要看这家公司过去有没有完成过目标", "说明管理层很重视股东"], a: 1, e: "“凡是说要把市值做到多少钱的我都不碰。”（2012-02-01）排名和市值都是结果，把结果当成方向，公司就会去打价格战、向经销商压货，做各种奇怪的事。" },
      { q: "“钱是保健因子，不是激励因子”指的是？", o: ["钱发得越多，员工越努力", "钱给少了留不住人，给多了也不会让人更努力；关键是公平，以及别让人心委屈", "应该尽量少发钱", "奖金可以由老板看心情发"], a: 1, e: "这是他在中欧 EMBA 学到的。奖金是契约，要按事先说好的规则发，“多发少发其实都会破坏公平”。" },
    ],
    reflect: [
      "选一家你熟悉的公司：如果竞争对手便宜 5%，它的用户会走吗？为什么？",
      "在你所在的公司或团队里，“规矩管不着的地方”实际上是什么在管？",
      "回想你最近一次重要的工作决策：你先问的是“对不对”，还是“赚不赚”？",
    ],
    takeaway: { t: "再好的车手也很难开好一辆烂车。", d: "2013-04-22" },
  },

  /* ======================= 第三章 ======================= */
  {
    id: "c3", no: "叁", label: "第三章", title: "公司点评", kicker: "仓位 = 懂的程度",
    blurb: "判例集：同一套过滤器，为什么对苹果几乎单仓、对腾讯小仓位、对阿里卖出、对英伟达只卖 put？",
    question: "原则要落到具体公司上才算真懂。同一套过滤器，为什么他对苹果几乎单仓，对腾讯只放很小的比例，卖掉了阿里，对英伟达只敢卖点 put？",
    thesis: "这一章是全书的“判例集”。读的时候别只看他买了什么，要看他在每家公司上懂的是什么、没懂的是什么，以及这两者如何直接决定了仓位。你会发现一条贯穿始终的规律：仓位 = 懂的程度。而他的“懂”，几乎总是来自自己的亲身经历（游戏、单一产品、手机、企业文化）。",
    chain: [
      { h: "懂什么", t: "他的理解从哪来？网易来自做游戏机的经历，苹果来自小霸王的单一产品模式和 OPPO。" },
      { h: "商业模式", t: "10 年后还在吗？护城河在哪？利润会不会回到股东手里？" },
      { h: "企业文化", t: "听其言观其行：出了问题时，他们先问对错，还是先问利益？" },
      { h: "仓位", t: "看透了就重仓并拿住；看不透就小仓位、卖 put，或者干脆不碰。" },
      { h: "卖出", t: "只因为商业模式或文化出现长期问题，或者自己发现其实没懂。" },
    ],
    sections: [
      {
        title: "苹果",
        sub: "喜欢苹果的理由 · 生态系统 · 做最好的产品 · iPhone 很可能是最便宜的手机 · 单一产品模式 · 库克 · 现金中性 · 估值",
        core: "他从 2011 年 1 月开始买入苹果，之后十几年几乎单仓持有。他说能看懂苹果，靠的是自己的经历：小霸王的单一产品模式，以及 OPPO 和苹果“很多相同的基因”。他真正想通的是两点：乔布斯是一个恰好也会报时的“造钟人”；库克是一个更理性的 CEO。",
        logic: [
          "商业模式：生态系统加单一产品。单一产品意味着单个产品的开发投入最高、单位开发成本却最低，材料成本低、渠道库存小、质量一致、出了问题反应快。这是他做小霸王时从任天堂学到、又亲手实践过的东西。",
          "文化：把用户导向做到了极致。库克说过：“我们的文化是做最好的产品而不是最多的。”他还提到，库克每天早上大约花 3 个小时处理用户来信。",
          "估值只是一道算术题：市值约 3000 亿美元，净现金约 1000 亿，年利润不到 200 亿，他判断 5 年左右会涨到 500 亿。“得到这个结论非常不容易，对我来说至少20年功夫吧。”",
          "把钱还给股东：苹果维持现金中性，留够运营需要的资金后，其余通过分红和回购还给股东。所以他说：“我不希望苹果股票涨。最好是几年都不涨，这样回购价钱就可以低一些。”",
          "拿住：书中列出的几次大跌是 2012–13 年跌 55%、2015–16 年跌 36%、2018 年跌 40%、2020 年跌 36%。他每次都加仓，而“绝大部分早年跟我买苹果的都早卖掉了”。",
          "错过与反思：2002–03 年他第一次看苹果时（市值约 50 亿美元），受《基业长青》把乔布斯归为“报时人”的影响，直接跳过了。他的反思是“积累不够”。",
          "2018 年，他当面对巴菲特说：苹果的商业模式比可口可乐好。百事便宜一半，巴菲特小时候就喝百事；可真正的苹果用户，谁在乎安卓便宜多少？四年后，巴菲特向芒格和盖茨介绍他时，复述的正是这句话。",
        ],
        quotes: [
          { t: "苹果最厉害的是在苹果的企业文化下建立的生态系统，这是个非常强大的商业模式，非常难以撼动。", d: "2020-11-16" },
          { t: "OPPO和苹果其实有很多相同的基因，这也是我最后能看懂苹果的原因之一。", d: "2011-08-07" },
          { t: "我一直觉得iPhone很可能是最便宜的手机，因为单位时间里（比如10年20年）需要花在买手机上的钱的总额很可能是最少的", d: "2023-11-03" },
          { t: "库克其实就是乔布斯最伟大的发明（发现）之一。", d: "2018-08-07" },
          { t: "是啊，苹果每次大跌的时候我都会加码，每一次！", d: "2020-11-06" },
        ],
        misread: { wrong: "他是“果粉”，所以才重仓苹果。", right: "“我不是所谓的‘果粉’，像我这个年纪和这么理性的人，不大会是任何人或东西的粉丝……实际上我以前一直多少有点不太喜欢苹果”是 iPhone 和 iPad 改变了他的看法。", src: "2011-03-31" },
      },
      {
        title: "贵州茅台",
        sub: "生意模式强大 · 做好酒的文化 · 少喝酒，喝好酒 · 赚到的钱怎么处理 · 打假 · 10 年后看贵不贵",
        core: "在他眼里，茅台是“躺赢”的典型：好喝，库存是宝，几乎没有新牌子能挤进来。他是在 2012 年底到 2013 年初的塑化剂风波中大规模买入的：托朋友把一瓶 30 年的茅台送到美国检测，确认没问题之后才下手。",
        logic: [
          "文化：质量“四服从”（产量、速度、成本、效益都服从质量），出厂酒龄至少 5 年。他甚至认为，国企属性在这里反而是优势：大概没人敢动 53 度飞天的工艺。",
          "不完美的地方：“对赚到的钱的处理方式不尽如人意”现金躺在账上，分红政策受股东以外的因素影响，不像苹果那样清晰；集团推出多个子品牌、定营业额目标，也不太像有利润之上的追求。",
          "最大的增长杠杆是打假。很多人不买茅台，“不是因为贵，而是不知道在哪里可以肯定买到真的”。所以他为 i 茅台鼓掌。",
          "估值还是一道算术题：假设 30 倍市盈率、利润每年增长 10%，10 年累计利润约为买价的 58%（17.5 ÷ 30），20 年约为 2.1 倍（63 ÷ 30），再和你的机会成本比较。长期存款利率很难有 5%，所以他愿意给茅台 20 倍市盈率。",
          "别让“活得久”冒充好生意。他说茅台是“长长的坡，厚厚的雪”，前提是酒好喝、有定价能力、文化能守住质量。",
        ],
        quotes: [
          { t: "茅台这个生意和我们的消费电子比较起来，最大的差别可能就在库存上。我们这个行业的库存几乎就是垃圾，茅台几乎就是个宝。", d: "2013-12-12" },
          { t: "好喝！对喜欢喝茅台的人来说。", d: "2020-11-30" },
          { t: "茅台就是那个53度飞天，谁改谁下台哈。", d: "2018-05-20" },
          { t: "即使递减，喝茅台的人也很难减，因为人们会倾向少喝酒和喝好酒。", d: "2013-04-05" },
          { t: "便宜或贵的说法取决于对公司10年后的状况的认识", d: "2013-06-21" },
        ],
        misread: { wrong: "茅台的价值在于它的“金融属性”和面子。", right: "“‘金融属性’就是伪概念！”还有：“居然有人非说人们买茅台是因为茅台贵，有趣。有点像说iPhone的用户都是为了显摆一样。”", src: "2024-06-17 / 2013-04-23" },
      },
      {
        title: "步步高",
        sub: "创立小霸王 · 创立步步高 · OPPO、vivo、小天才 · 不秘诀 · 产品会说话 · 企业文化是核心竞争力 · 不为清单 · 对上市没兴趣",
        core: "问他最成功的投资是哪一次，他的回答是：“当然是我们自己公司了。”1989 年他接手小霸王的前身时，账上只剩 2000 多元，欠总公司 200 万，连工人在内不到 20 人；后来才有了步步高、OPPO、vivo 和小天才。他说秘诀是公开的：本分加平常心。而本分最具体的形式，就是一张很长的“不为清单”。",
        logic: [
          "不为清单分两类：一类是谁都不该做的事（比如欺骗）；一类是和自己的使命、愿景相违背的事（比如代工）。每一条背后都有故事和道理，可以点开下面的卡片看。",
          "关停也是本分。电子宠物、跳舞毯、小家电、家庭音响、彩电（关过两次）、蓝光 DVD、哲库芯片……第一批 VCD 因为三洋机芯出了问题，他们把卖出去的 20 万台全部召回，“那一次确实难受，但我们还是决定做了”。",
          "2012 年从功能机转向智能机时，现金消耗得特别快。他回去参加了一个“有点悲壮的会”：就算要倒下，也不能倒得太难看，不欠员工的钱，不欠供应商的钱，尽量保护代理商。然后他说：Let's fight now（现在开始战斗吧）。",
          "股权：创立步步高时，他持股 70% 多。后来他用借钱给员工买股份、将来用股份的分红或增值来还的办法，把自己的股份稀释到不到原来的 1/4。“大家能一起分享企业的成长会比较开心”",
          "为什么早早离开一线？“我这个人比较懒散随意，不是一个好的CEO人选。”他找的不是职业经理人，“直接找的就是老板”，也就是陈明永和沈炜。",
          "他对自家商业模式的评价很克制：和苹果比，过去不算好的商业模式，“直到做了智能手机”，手机成了互联网入口，成了平台。",
        ],
        quotes: [
          { t: "我们的秘诀其实就是：本分+平常心。", d: "2016-10-12" },
          { t: "很多人都希望知道把公司做好的秘诀是什么，其实秘诀不是做了什么，而是不做什么。", d: "2016-10-12" },
          { t: "长远看不合适的东西最合适的办法就是现在就停下来！", d: "2023-05-16" },
          { t: "我一直认为我们最大的竞争对手就是我们自己。", d: "2010-06-07" },
          { t: "其实我最高兴的事就是我不在一线公司做得比我在的时候好。", d: "2010-03-27" },
        ],
        misread: { wrong: "步步高和 OPPO 靠的是广告轰炸和渠道。", right: "“人们常说的那些：广告、员工股份分享、经销商入股、网点密布、线下渠道等，都是不对的！我们的秘诀其实就是：本分+平常心。”", src: "2016-10-12" },
        toolAfter: "stoplist",
      },
      {
        title: "网易",
        sub: "就像自己经营的公司 · 好的游戏绝对是好生意 · 丁磊 · 以铜价买金子不需要勇气",
        core: "他在网易上赚了 100 多倍。别人觉得他胆大，他觉得那只是“懂”：做小霸王时积累下的游戏理解，让他确信这个市场非常大（虽然也不知道到底有多大）；而当时网易账上的现金每股约 2 美元，股价却不到 1 美元。",
        logic: [
          "能力圈真实的样子是这样的：“这种理解学校是不会教的，书上也没有，财报里也看不出来。我也曾试图告诉别人我的理解，结果发现好难。”",
          "他的游戏观：“游戏最根本的东西实际上是消费时间同时获得快乐。”好游戏像社区，可以运营十年；ARPU 值太高的游戏，一定不太长寿。",
          "孤独的买家：网易股价跌破 1 美元满 3 个月的那一天，可能被摘牌，他一天就买了近 50 万股。那段时间，每天的成交里大概有一半是他的买单。",
          "持有期间不看成本：持有网易的八九年里，他“可能每天都会被卖价所诱惑”，靠的就是一个道理：卖的时候，不要和买入成本联系起来。",
          "卖出与反思：后来为了换 GE 和雅虎（后来又换成苹果），他卖掉了大部分网易。“如果没卖到现在可能有500倍了。所以不要轻易卖掉好公司”",
          "他说自己对丁磊唯一可能的帮助，是劝他别在约 2 美元一股时把网易卖给新浪，而且“也许我们的对话只是把他的想法从80%肯定到了100%而已”。",
        ],
        quotes: [
          { t: "当有人非要把金子按铜的价钱卖给你的时候，你是不需要勇气的，你只要确认那真的是金就行了", d: "2010-03-05" },
          { t: "我就玩他们的游戏来着。", d: "2010-04-01" },
          { t: "好的游戏绝对是好生意，但一般的游戏未必是。", d: "2018-09-02" },
          { t: "直觉对避免错误和发现目标很重要，但最后的决定要靠理性。", d: "2010-04-02" },
          { t: "孤独有时候确实价值连城。", d: "2012-05-21" },
        ],
        misread: { wrong: "他当年买网易是逆势而为的豪赌。", right: "“我当年‘敢’重仓网易也不是看起来那么容易的”，那是多年游戏理解的积累。在他眼里，“10块钱的东西有人哭着喊着要1块钱卖给你，你要勇气干什么？”", src: "2011-01-08 / 2011-05-08" },
      },
      {
        title: "腾讯与阿里巴巴",
        sub: "流量货币化 · 用户为本，科技向善 · 机会成本 · 从雅虎到苹果 · 强大的企业文化 · 电商的护城河",
        core: "这两家公司展示了他在“懂一点，但不够透”时是怎么做的。腾讯的商业模式非常好，文化也还可以，但“未来现金流看不透”，所以他长期只放很小的比例，用卖 put 的方式慢慢来。阿里则是他曾经为之买入雅虎的公司，后来又因为“二选一”违背了阿里自己的文化而卖出。",
        logic: [
          "他对腾讯的顾虑具体在哪？“未来现金流看不透”；抖音的出现，“让人觉得腾讯的护城河也没那么宽了”；回购多年，股数却没有减少，“我们买的到底是什么很重要”。但腾讯对他来说依然是“非卖品”。",
          "他很喜欢腾讯的新愿景“用户为本，科技向善”：八个字，用户导向和利润之上的追求都在里面了。",
          "买雅虎是一次分部估值：每股净现金约 3 美元，所持雅虎日本和阿里 B2B 上市部分约 6.7 美元，雅虎自身业务约 9.6 美元，合计约 19.3 美元，雅虎持有的约 40% 阿里集团股份等于白送。但“从未来现金流折现的角度看，这公司的未来有点不太靠谱”，最值钱的部分可能被“不懂事会”卖掉。",
          "他曾说阿里的企业文化是“我在中国企业里迄今见到的写得最好的”；卫哲事件时，他称赞马云纠错坚决。后来卖出，是因为“二选一”和“让天下没有难做的生意”相冲突。他反对的不是二选一这个做法本身，而是它违背了阿里自己的文化。",
          "电商的护城河：“电商我老觉得看不透……苹果的东西大家想学但学不会。这个世界学不会的东西其实是很少的。”",
        ],
        quotes: [
          { t: "简单讲，腾讯就是通过建立社交媒体，将流量货币化了。", d: "2020-10-09" },
          { t: "腾讯对我来说确定性确实比苹果小不少，这也是现阶段一直下不了大决心多买的原因。", d: "2022-08-07" },
          { t: "这种回购实际上就是在给员工发奖金哈。", d: "2023-12-26" },
          { t: "当我看到“二选一”这种“让自己的天下没有难做的生意”的企业文化时，我决定卖出了自己的股票。", d: "2019-06-11" },
          { t: "确实，从雅虎到苹果是一个跳跃，从那以后就彻底摆脱了市场的影响了。", d: "2023-01-19" },
        ],
        misread: { wrong: "好公司就应该重仓。", right: "好公司不等于你懂的公司。“我对苹果确实完全不操心，掉多少都不往心里去。腾讯总是觉得懂得不透，下不了重手。”仓位跟着理解走，不跟着名气走。", src: "2022-10-05" },
      },
      {
        title: "拼多多与英伟达",
        sub: "风投 · 黄峥 · 芯片界的苹果 · 看不懂 10 年的护城河",
        core: "这两家是他“有兴趣，但看不懂 10 年”的样本。拼多多他当作风投来做，信任的是“这么一帮人，这样一种文化，这样一个生意模式”；英伟达他承认“非常厉害”，却说不清它的护城河能维持多久：“看不懂10年真的很难下手。”",
        logic: [
          "他说自己“不是太懂拼多多的商业模式”，不是说不知道它做什么，而是不知道两件事：它能不能赚到和价格相匹配的利润；赚到之后有没有护城河。",
          "所以他的做法是“风投”：上市前跟投，后来卖了一些 put，给黄峥 10 年时间。黄峥最初找他投资时，他问能不能赚钱，黄峥说“不知道”；他的回答是：那我就当公益做吧。",
          "英伟达：他知道它的护城河是 CUDA，也知道 CUDA 的生态有点像苹果，但还是会想，“这么多有钱的企业搞个三五年难道还不能搞出点名堂来？”所以他只卖了一点 put，保持近距离关注。",
          "英伟达也是“不能空一个好公司的一个例子”：不懂的时候，不做多，更不做空。",
          "“我在打高尔夫的过程当中错失了不少这类公司了，我在乎吗？我一个满仓主义者，其实我啥都没错过，对吧？”",
        ],
        quotes: [
          { t: "这么一帮人，这样一种文化，这样一个生意模式，如果一直这么发展下去，10年后跟淘宝平分天下还是有可能的吧？", d: "2018-09-02" },
          { t: "黄峥是特别难得一见的一直关注事物本质的人，有悟性，又聪明，未来有任何成就我都不意外。", d: "2019-09-09" },
          { t: "英伟达（NVDA）非常厉害，产品其实有很大的差异化，堪称芯片界的苹果！", d: "2024-03-10" },
          { t: "科技公司很难看懂的原因是他们的产品不是消费品，我没办法直接感受他们的产品。", d: "2024-03-13" },
          { t: "看不懂10年真的很难下手。", d: "2025-02-26" },
        ],
        misread: { wrong: "错过英伟达这样的大牛股，是巨大的损失。", right: "对满仓主义者来说，错过不等于损失：钱一直都在自己懂的好公司里。何况投资可以永远说“我还没想好”，他说这正是投资比高尔夫容易的地方。", src: "2024-03-13 / 2019-03-30" },
        toolAfter: "spectrum",
      },
      {
        title: "GE、Facebook 与日本公司",
        sub: "通用电气 · 脸书 · 松下、索尼、任天堂",
        core: "这组案例专门看“文化如何让他买入，又如何让他卖出”。GE：金融危机中，CEO 站出来认错，他据此重仓；后来在 GE 官网上找不到韦尔奇强调的“正直诚信”，他又全部卖掉。Facebook：看了扎克伯格在国会的证词后“粉转路”。松下：一位社长的一句话，让他慢慢把股票卖光。",
        logic: [
          "买 GE 的逻辑：危机过后，GE 每股利润怎么也有 1.5 美元以上，给 12–15 倍市盈率，就是 20 美元以上的股票；决定性的因素，是在一片破产声中，只有 GE 的 CEO 站出来承认错误、给出对策。他从 9 美元左右一路买到 6 美元，又买到十二三美元。",
          "卖出 GE 与反思：生意太复杂看不懂，盈利“老是刚刚好”，官网上也不再提正直诚信。“简而言之，我觉得当初买GE是欠妥的”，尽管这笔投资赚了钱。赚钱不等于做对了。",
          "Facebook：他自己不用它的任何产品，理解一直不够透彻；看到它面对抖音几乎招架不住，以及扎克伯格在国会上的表现，他觉得它的护城河其实很浅，于是清仓。",
          "松下：2003 年前后，他带着合作做手机的想法去了日本，从科长见到社长，“居然没有一个人问过为什么我们认为自己可以做到前三名”。后来，社长说自己总在想“如果松下老人站在我背后，他会怎么想这件事”，他回来后就慢慢把松下卖了。",
          "索尼：大约从 1997–98 年起，他买到的索尼产品“好像都有一些我觉得不该有的问题”，利润导向让质量关失守了。任天堂则是他单一产品模式的老师，他至今对它怀有“情怀”。",
        ],
        quotes: [
          { t: "伟大公司的错误往往就是千载难逢的投资机会。", d: "2010-03-29" },
          { t: "当时还曾动过用margin的念头，后来觉得不对的事不做的原则不能破，就算了。", d: "2010-03-29" },
          { t: "如果放到今天来看，我大概不会买GE，而是应该那个时候就买苹果。因为回过头来想，我对GE的理解并不是很透", d: "2017-05-22" },
          { t: "我的卖出也符合“对自己不够了解的公司，涨了也想卖跌了也想卖”的情况。", d: "2020-08-04" },
          { t: "当一个社长都在这么想的时候，这个公司的文化肯定都是这样的", d: "2011-10-22" },
        ],
        misread: { wrong: "赚了钱的投资，就是正确的投资。", right: "GE 让他赚了钱，他仍然说“当初买GE是欠妥的”；他在特斯拉上也“赚过不少钱，但最后也因为看不懂而全部放弃了”。评判标准是过程（懂不懂），而不是某一次的结果。", src: "2018-09-21 / 2019-03-13" },
      },
      {
        title: "游戏公司与新东方",
        sub: "完美世界 · 巨人网络 · 金山 · 畅游 · 第九城市 · 新东方",
        core: "作为资深玩家，他看游戏公司的文化有一个独特的视角：玩家体验。周末开 16 倍经验这类短视的运营、把用户逼走的收费设计、交接游戏时让玩家不安，都是利润导向的信号。钱多了就拿去做不相干的投资，也说明管理层对主业没信心。",
        logic: [
          "九城处理魔兽世界交接的方式让他不喜欢：“如果我碰到这种情况，我会全力以赴地把游戏交接好，绝不能让玩家有任何担心。”",
          "巨人：他欣赏史玉柱对游戏的专注，但担心巨人“太把‘华尔街’当回事”；也不理解它为什么在股价低于发行价时选择分红，而不是回购。",
          "新东方：被浑水做空时，他花了 4 个小时，看了网上能找到的俞敏洪的所有采访，结论是“这人不会是空头说的那样”，于是卖了 put；“双减”之后又卖了一些 put，“象征性支持一下”。",
          "但他也清楚，新东方这门生意“是个力气活，不是我特别喜欢的那种”。文化和人可以让他支持，却不足以让他重仓。",
          "“把鸡蛋多放几个篮子其实是有效提高风险的最好办法”是一句调侃，说的是企业多元化：把精力分散到自己不擅长的领域，往往鸡飞蛋打（他推荐可以对照《聚焦》这本书）。",
        ],
        quotes: [
          { t: "金山的游戏很短视，周末16倍经验（也许更多）都出来了，好像以后日子不过了一样", d: "2010-07-09" },
          { t: "这个点评很好，至少说明不要碰完美世界和盛大游戏了。玩家的眼睛是雪亮雪亮滴。", d: "2012-02-10" },
          { t: "钱多（相关业务用不掉）就应该回购或派息，不然就是对自己公司没自信", d: "2011-09-13" },
          { t: "希望你什么时候能明白把鸡蛋多放几个篮子其实是有效提高风险的最好办法", d: "2011-11-24" },
          { t: "好公司根本就不怕人做空！", d: "2011-11-23" },
        ],
        misread: { wrong: "账上现金接近市值的游戏公司，就像当年的网易。", right: "“像吗？现在的诺基亚像以前的苹果吗？猴子像人吗？”当年的网易正处在上升刚刚开始的阶段，而有些公司看起来像是下降的开始，其中还夹着对管理层的不信任。", src: "2012-07-10" },
      },
    ],
    quiz: [
      { q: "他 2011 年开始买苹果时，最关键的判断是？", o: ["新品发布会的市场反响很好", "苹果未来几年盈利会大幅提高，而且会把利润以合适的方式还给股东", "股价在技术面上突破了", "巴菲特已经买了"], a: 1, e: "他的“估值”只有两条：3000 多亿市值、1000 多亿净现金，利润会从不到 200 亿涨到 500 亿甚至更多；苹果会把利润以合适的方式还给股东。巴菲特是 2016 年才开始买苹果的。" },
      { q: "为什么他对腾讯长期只放很小的比例？", o: ["他觉得腾讯商业模式不好", "价格一直太贵", "未来现金流看不透，确定性明显比苹果小", "因为政策风险"], a: 2, e: "他说腾讯商业模式非常不错、文化也还可以，但“未来现金流看不透”，“确定性确实比苹果小不少”。仓位 = 懂的程度。" },
      { q: "他卖出阿里巴巴的直接原因是？", o: ["股价跌破了买入价", "拼多多起来了，他要换仓", "“二选一”违背了阿里“让天下没有难做的生意”的文化", "马云退休了"], a: 2, e: "有人问是不是因为投了拼多多，他答：“不是！是因为失望。”（2019-06-11）他后来还强调，他反对的是在“让天下没有难做的生意”这个文化前提下搞二选一。" },
      { q: "网易股价跌到 1 美元附近时，他为什么说“不需要勇气”？", o: ["因为他钱多，亏得起", "因为有人把金子按铜价卖，你只需要确认那真是金子", "因为有内幕消息", "因为他分散了风险"], a: 1, e: "“当有人非要把金子按铜的价钱卖给你的时候，你是不需要勇气的，你只要确认那真的是金就行了”，确认靠的是多年游戏行业的理解，加上账上现金比市值还高。" },
      { q: "步步高以 30 万元买下“小天才”商标后，又补给原主人 270 万元。这体现的是？", o: ["商标其实值更多，怕被起诉", "不赚人便宜：他们原本就打算出 300 万", "为了公关宣传", "税务筹划"], a: 1, e: "十年前他们出价 300 万被拒；后来对方境况不好，开价 30 万。“因为我们本来就觉得300万是个很好的价钱……实在是不想赚他的便宜。”" },
      { q: "GE 让他赚了钱，他事后怎么评价这笔投资？", o: ["是他最得意的一笔投资", "当初买 GE 是欠妥的：他其实没看懂它复杂的生意", "应该用杠杆多买一点", "应该一直拿到现在"], a: 1, e: "“简而言之，我觉得当初买GE是欠妥的。”“如果放到今天来看，我大概不会买GE，而是应该那个时候就买苹果。”评判看过程，不看某一次的结果。" },
      { q: "对英伟达，他的态度最准确的描述是？", o: ["看空，准备做空", "非常厉害，但看不懂它 10 年的护城河，所以只卖点 put、近距离关注", "已经重仓", "认为它是泡沫"], a: 1, e: "“英伟达……非常厉害……这也是不能空一个好公司的一个例子。”但“看不懂10年真的很难下手”。" },
    ],
    reflect: [
      "挑一家你持有或关注的公司，按本章的格式写四行：我懂的是什么 / 它的商业模式 / 它的企业文化 / 我为什么这样下注。",
      "你的“能力圈”来自哪段经历？就像他从游戏机看懂网易、从单一产品模式看懂苹果那样，找出你自己的“源头”。",
      "你有没有过一笔“赚了钱，但其实做错了”的决定？",
    ],
    takeaway: { t: "我对看懂的定义非常简单，就是敢下重注。", d: "2024-04-21" },
  },

  /* ======================= 第四章 ======================= */
  {
    id: "c4", no: "肆", label: "第四章", title: "人生箴言", kicker: "同一套方法，用在人生上",
    blurb: "不为清单、写给 80 岁的悼词、两种错误、安全感：投资之道的人生版本。",
    question: "为什么一本投资问答录，要用一整章来谈人生？因为在他看来，投资、做企业和过日子，用的是同一套方法：做对的事情，把事情做对；想长远，想本质。",
    thesis: "把这一章和第一章并排读，会看到一一对应的关系：投资里的“不懂不碰”，在人生里是不为清单；投资里的“从 10 年后看回来”，在人生里是给 80 岁的自己写悼词；投资里的“买股票就是买公司”，在人生里是“最终你会成为本该成为的人”，你就是你所有选择的加总。本章最重要的一个工具，是区分两种错误。",
    chain: [
      { h: "北斗星", t: "北斗星就是价值观，也就是你的不为清单。30 年后，差异会非常大。" },
      { h: "两种错误", t: "做了错的事 → 立刻停，放进不为清单；把事情做对时犯的错 → 学习，这是不可避免的。" },
      { h: "想长远", t: "理性就是想长远；平常心是后天养成的思考习惯。" },
      { h: "胸无“大”志", t: "不好大喜功，脚踏实地做自己喜欢的事。" },
      { h: "正直", t: "不作恶，不赚人便宜，至少让人一生坦然。" },
      { h: "小日子", t: "降低预期，陪好家人；给孩子最重要的东西是安全感。" },
    ],
    sections: [
      {
        title: "做对的事情，把事情做对",
        sub: "找到自己的北斗星 · 想长远，想本质",
        core: "他说这是自己“一生受益最大的一句话”：大三时从德鲁克那里读到，大约花了 20 年才真正搞懂。它的关键在于可以操作：你不一定知道什么是对的，但几乎总是知道什么是错的；停止做错的事，就离对的事更近了一步。勤奋和天赋无法选择，做对的事情却可以选择。",
        logic: [
          "为什么强调“不做”？因为错的事情往往有短期诱惑（抽烟、赌博、骗人的生意），人们明知是错还去做。所以“做对的事情”，实际上是通过“不做不对的事情”来实现的。",
          "两种错误必须分清。做了错的事，是原则性错误，要马上停，不管多大代价都是最小的代价，然后把它放进不为清单；在把事情做对的过程中犯的错，是能力问题，不可避免，要靠学习改进。小偷被抓后总结“偷技不够好”，就是用第二种办法去处理第一种错误，只会更糟。",
          "为什么很多聪明人常常原地打转？他们把聪明用在了“把事情做对”上，却没用在“做对的事情”上。就像他打的比方：一个很会开车的人，开着一辆很好的车，上高速时却从反方向的入口开了进去。",
          "他“想长远”的习惯从哪来？本科毕业准备考研时，他在教室墙上的招生简章前看了 3 天，找不到任何一个想考的专业，于是放弃了考研：专业连着职业，考上一个自己不想干的专业又能怎样？",
        ],
        quotes: [
          { t: "做对的事情，大道最早（大三时）看到的是管理大师彼得·德鲁克说的。这是大道一生受益最大的一句话。", d: "2021-08-12" },
          { t: "北斗星指的是价值观，就是要有不为清单。30年后可以看到巨大的差异。", d: "2016-06-01" },
          { t: "勤奋和天赋其实都没那么重要，做对的事情最重要。", d: "2019-09-09" },
          { t: "一般来讲，聪明人知道如何把事情做对，但有智慧指的是要做对的事情。", d: "2015-08-14" },
          { t: "理性就是想长远啊。", d: "2022-03-08" },
          { t: "平常心其实就是理性思考的习惯，应该是后天养成的。", d: "2019-04-22" },
        ],
        misread: { wrong: "“坚持到底”就是永不放弃。", right: "“人们常说的坚持到底，指的是坚持做对的事情，而不是坚持做错的事情！”发现错了，要马上停。", src: "2016-10-12" },
        toolAfter: "errors",
      },
      {
        title: "做胸无“大”志的人",
        sub: "要脚踏实地 · 每天进步一点",
        core: "这里的“大”，是好大喜功的“大”。胸无“大”志不是没有志向，而是不追求“做大”、不追求 500 强，只脚踏实地做自己喜欢的事。他说这和胸有大志“实际上可以说它们是一回事”。他也反复强调自己是普通人：进浙大时，班上 35 人里他的考分排第 18；考人大研究生时，全班 25 人里他排第 25。",
        logic: [
          "为什么“大”是危险的？“要做强先做大”的想法，会诱使企业去打价格战、搞多元化、借债扩张。这些都是把结果当成了方向。",
          "普通人的杠杆是时间。芒格说的“学习机器”，就是每天晚上睡觉时，都比早上起床时多了一点点智慧。前提是方向要对。",
          "“有平常心的人们才更容易赢”：胸无大志是相对于好大喜功说的，和创业者想赢的心并不矛盾。",
          "他说自己“不太有‘尽可能快速’的想法”，这是 Fast is slow 在人生里的版本。",
        ],
        quotes: [
          { t: "胸无“大”字和胸有大志不是矛盾的，实际上可以说它们是一回事。", d: "2019-08-25" },
          { t: "很多所谓厉害的人其实仅仅是因为他们一直在老老实实做他们该做的事情而已。", d: "2018-11-05" },
          { t: "所以大道能有今天绝对不是因为绝顶聪明，而是因为一些其他的因素。比如，理性、想长远、不为清单……", d: "2021-06-28" },
          { t: "在坚持做对的事情的前提下，把事情做对的能力是可以学习的，只要每天进步一点就行。", d: "2012-06-26" },
          { t: "我觉得能做自己喜欢做的事情就应该是一种成功，至于别人怎么看其实没那么重要。", d: "2017-11-07" },
        ],
        misread: { wrong: "胸无大志 = 躺平，没有追求。", right: "“我原话的意思是胸无‘大’字……这里的‘大’是好大喜功的大……我就开始特别强调企业健康最重要，不要在乎‘大’小，要着眼于脚踏实地。”", src: "2019-08-25" },
      },
      {
        title: "做正直的人",
        sub: "不作恶 · 不赚人便宜 · 不圆滑 · 不该帮的忙帮了是没原则",
        core: "他不承诺正直会带来回报，只说它“至少让人一生坦然”。在他这里，正直有非常具体的样子：不作恶；不赚人便宜（这样才可能真正双赢）；不圆滑；不借钱给朋友，但可以送。",
        logic: [
          "为什么“不吃亏”的心态会导向“赚便宜”？因为想确保自己不吃亏，往往就得从对方身上多拿一点。所以步步高提倡“不赚人便宜”。就像有人说的，合理的是 7 分，那就拿 6 分，“确认没赚别人便宜”。",
          "善良要讲逻辑。农夫把快冻死的蛇揣进怀里，“那不叫善良，那叫愚蠢”。",
          "借钱：“我不借钱，但可以给。”他的原则是，遇到急需（疾病、教育）可以给，生意上的事不帮，否则就是个无底洞，也无从鉴别该帮谁。",
          "不圆滑：他喜欢“青涩”的人，不喜欢“谦虚”里那个“虚”字，更喜欢“谦实”。坚持原则有时会得罪人，但“不坚持的话最后是大家都不高兴”。",
          "早年在饭桌上，客户对他说“干了这杯，不然这生意就不做了”，他站起来说：“那你们继续喝，我先走了。”从此再没人逼他喝酒。",
        ],
        quotes: [
          { t: "我不知道做个正直的人会有什么回报，但至少让人一生坦然。", d: "2011-07-25" },
          { t: "善良体现最多的是不作恶。", d: "2010-06-12" },
          { t: "个人认为只有在不赚人便宜的心态下，才有可能做到双赢", d: "2013-02-19" },
          { t: "“有借有还”就是本分，“再借不难”其实是功利。当你不再想着“再借不难”时你就真的本分了。", d: "2013-02-24" },
          { t: "该帮的忙当然要帮，不帮是不厚道。不该帮的忙帮了是没原则，也是不厚道。", d: "2012-03-04" },
        ],
        misread: { wrong: "“吃亏是福”：先舍后得，大舍大得。", right: "“舍不是为了得。”为了得到而舍弃，本质上还是功利。", src: "2010-03-12" },
      },
      {
        title: "享受过程",
        sub: "别让时光溜走 · 尽量去干自己喜欢的事情 · 尽量避开不喜欢的人和事 · 最终你会成为本该成为的自己",
        core: "大三时他悟到：乐趣在过程中。考上大学后他突然失去了目标，这才发现快乐来自奔向目标的路上，所以要不断给自己设定喜欢的小目标（这也是人们爱玩游戏的原因）。他对财务自由的定义也是从过程出发的：不为钱去做自己不愿意做的事。",
        logic: [
          "“本该成为”不是宿命论，恰恰相反：你是你所有选择的加总，这是一个概率问题。10 次二选一，就有 1024 种结果；30 次，就有 10 亿种。",
          "写悼词：他和一帮朋友假设自己在 80 岁那天离开，各自给自己写悼词，“让自己从未来看现在”。这就是投资里“从 10 年后看回来”的人生版本。",
          "Son, don't let it slip away（孩子，别让时光溜走）：1987 年底，父亲去世前曾苦口婆心地叮嘱他，他当时的回答是“爸爸你这么做了这么多年，你觉得好吗？”多年后他说：“很骄傲我顺从了自己的内心，最后找到了自己喜欢的事情”",
          "People never learn（人们从不吸取教训）：他曾想起诉某人，给对方一个教训。律师告诉他，“你想教训一下对方的目的是很难达到的”，他于是放下了。避开不喜欢的人和事，不在做不到的事情上耗费精力。",
          "做着自己不喜欢的事，抱怨却不改变，“应该算是错的吧”。这是“做对的事情”在职业选择上的版本。",
        ],
        quotes: [
          { t: "生活就像打高尔夫球，你可能会打出一些好球，也会打出一些糟糕的球，但无论结果如何，你始终都能享受过程。", d: "2006-11-19" },
          { t: "我自己的定义是：不为钱做自己不愿做的事情的时候，其实就已经拥有了财务自由了。", d: "2013-03-09" },
          { t: "所谓“尽量过好这一生”的意思对我而言就是：尽量避开不喜欢的人和事，尽量去干自己喜欢的事情，结果应该开心的概率比平均大一些。", d: "2024-08-11" },
          { t: "人生的每个选择是站在是非还是利益上，最终会决定你是谁，或者说你会成为那个你本该成为的人。", d: "2022-01-30" },
          { t: "其实每个人的所谓的成功或失败都是其所有选择的最终结果，这就是你最终会成为你本该成为的人的意思。", d: "2023-08-18" },
        ],
        misread: { wrong: "最终你会成为你“想要成为”的人。", right: "“是‘本该成为的人’，你这一改意思就完全变了。成为‘想要成为的人’是非常不容易的事情，多数人做不到的。”", src: "2023-03-12" },
      },
      {
        title: "开放心态",
        sub: "放下自我去学习 · 读书是爱好，思考是习惯",
        core: "他说学习中最重要的是开放，而绝大多数人（包括他自己）都很封闭：不是来学习的，是来让别人证明自己是对的。把别人“封神”，其实是拒绝学习的借口：既然是神，学不会也就正常了。",
        logic: [
          "学的是逻辑，不是结论。再好的球手也有打烂球的时候，对教练说“你也有打坏球的时候”，对你自己毫无帮助。",
          "“老师，我是来去你的糟粕的”：抱着这种心态，你永远只会听见自己想听的东西。",
          "他自称可能有阅读障碍，抱着一本书“大概能坚持五分钟”，主要靠聊天、上网和搜索学习。重要的不是读不读书，而是有没有思考的习惯。",
          "张小龙说乔布斯“1秒钟就能变成傻瓜”，他认同这个说法：发现自己不知道的东西时，乔布斯能立刻放下自我去学。",
        ],
        quotes: [
          { t: "我觉得学习中最重要的是要开放，就是要开放心态的意思，我发现绝大多数人都是非常封闭的，当然这里可能也包括我自己。", d: "2019-04-12" },
          { t: "世界本无神，把别人封神是人们拒绝学习别人的一个借口而已。", d: "2011-12-14" },
          { t: "读书真的是爱好，而思考是习惯。", d: "2023-01-14" },
          { t: "我们要学的是巴菲特思考的逻辑，而巴菲特的错误只是概率上的错误而已。", d: "2010-10-28" },
          { t: "我觉得没人天生有悟性的。我看到的有悟性的人一般都非常肯悟，会习惯想本质及长远。", d: "2020-10-23" },
        ],
        misread: { wrong: "段永平不读书，所以读书不重要。", right: "“就好像读书的人就一定会思考似的……不读书并不是不学习的意思。”读书只是途径之一；他也说过，读书的人悟到道的比例“肯定是要大很多的”。", src: "2023-01-14 / 2023-08-18" },
      },
      {
        title: "陪好家人过好小日子",
        sub: "家庭 · 降低预期 · 无条件的爱 · 安全感 · 孩子的问题基本都是大人的问题 · 游戏 · 成绩 · 钱 · 喜欢的事 · 创业 · 公益",
        core: "他的人生目标很朴素：陪好家人，过好小日子。如果要用一句话说透“过好小日子”的本质，他的答案是：降低预期。关于孩子，他反复讲的其实只有一件事：父母能给孩子最重要的东西是安全感，途径是爱和陪伴；而安全感，恰恰是一个人日后能够理性思考的底座。",
        logic: [
          "无条件的爱，不是“你考第一了，妈妈好爱你”这种有条件的爱。但无条件的爱也不等于溺爱，原则和边界仍然要讲清楚。",
          "尽量不批评，尽量不说“不”（除非有危险），而“尽量不说和完全不说是决然不同的”。任何时候都不应该打孩子；孩子撒谎，一般是大人的错。",
          "游戏：“反对孩子玩游戏的大人们一般很少花时间在孩子身上。”他家的办法是：周末和假期每天一小时，先做完功课、保证足够的运动。",
          "钱：他借用巴菲特的话，留给孩子的钱，要“多到足以让他们做任何事，但又不至于多到可以什么都不做”（good enough to do anything but not enough to do nothing）。他教儿子投资的第一件事，是每天去跑步。",
          "找工作也可以用价值投资的逻辑：找商业模式和企业文化好的公司，找错了就尽快改；一定要有一些利润之上的追求。他当年去中山，一个很重要的原因就是自己喜欢玩游戏。",
          "公益：他不喜欢“慈善”这个词里居高临下的感觉，更愿意说“公益”。他在浙大设立的自立贷学金，让申请人自己决定借不借，“不能让人为了得到帮助而损失自尊”。受教育是自助的最好办法。",
        ],
        quotes: [
          { t: "降低预期很重要。", d: "2020-12-07" },
          { t: "父母能给孩子的最重要的东西就是安全感，途径是父母的爱和陪伴。", d: "2019-02-15" },
          { t: "要理性非常难，心底的安全感对理性思考帮助非常大。", d: "2024-09-24" },
          { t: "所谓言传身教，言传的作用可能只有5%，其他都是身教。", d: "2022-01-26" },
          { t: "孩子叛逆反叛的不是父母，而是父母的权威", d: "2018-10-06" },
          { t: "创业的人是不会问别人是不是该去创业的。", d: "2010-09-06" },
        ],
        misread: { wrong: "对孩子要严格，多批评、多纠正，孩子才能成才。", right: "“孩子‘成才’真的那么重要吗？”“这些年看到太多‘成才’后的小孩过不好他们的人生了。”他希望孩子有安全感，善良、健康、快乐。", src: "2023-10-04 / 2024-09-19" },
      },
    ],
    quiz: [
      { q: "“最终你会成为本该成为的人”，最准确的理解是？", o: ["一切早已注定", "只要足够想要，就能成为想成为的人", "你在是非和利益之间的每一次选择加起来，决定了你是谁", "天赋决定上限"], a: 2, e: "他明确反对宿命论式的解读：“人生的每个选择是站在是非还是利益上，最终会决定你是谁”也明确说过，这不是“你想成为的人”。" },
      { q: "关系不错的朋友想借一笔钱做生意，你并不确定他能不能还上。按他的原则，应该怎么做？", o: ["借，并让他写借条", "不借；如果对方真的值得，可以选择送给他", "借一半", "借，但收利息"], a: 1, e: "“我不借钱，但可以给。如果真是很特别的人，我就宁愿送。”他还说过，急需（疾病、教育）可以给，生意上的忙一般不帮。" },
      { q: "他对“财务自由”的定义是？", o: ["资产超过某个具体数字", "被动收入能覆盖所有开支", "不为钱去做自己不愿意做的事情", "不用上班"], a: 2, e: "所以很多不那么有钱的人可以很自由，而有些很有钱的人，每天还不得不做许多不愿意做的事。他还说过：“时间花在想花的地方叫作财务自由。”" },
      { q: "除了“做对的事情，把事情做对”，他大三时还悟到了什么？", o: ["要尽快赚到第一桶金", "乐趣在过程中，要不断给自己设定喜欢的目标", "一定要考研究生", "要多读书"], a: 1, e: "考上大学后失去了目标，他整天闷闷不乐，后来悟到“人生的乐趣就是在过程当中，需要自己不断地设定目标”。" },
      { q: "孩子开始撒谎了，他会建议家长首先做什么？", o: ["严厉惩罚，让他记住", "先反省大人自己：孩子撒谎一般是大人的错，要了解原因并沟通", "没收手机", "交给老师处理"], a: 1, e: "“一般来说，孩子撒谎都是大人的错，需要特别仔细地反省。”“任何威胁，极度发怒，过度惩罚都是对长期有害的。”" },
      { q: "有大学生问：要不要为了抓住机遇，放弃学业去创业？他的核心建议是？", o: ["创业越早越好", "一定要先把学位读完", "自己想长远、判断什么是对的事情；到处问该不该创业的人，最好别创业", "跟着风口走"], a: 2, e: "“该创业的人根本就不需要你鼓励。”“到处问别人是不是该创业的人最好是别创业，失败的概率更高。”但他也讲过一个反例：有人被比尔·盖茨游说了两个小时仍没去微软。关键是想长远，而不是守着眼前的小利益。" },
    ],
    reflect: [
      "写下给 80 岁的自己的悼词的第一句话。它和你现在每天在做的事情一致吗？",
      "列出你人生里的 3 条不为清单，并在每一条后面写上它背后的“故事”。",
      "最近一件你明知是错、却没有马上停下的事是什么？现在停下的代价是多少？",
    ],
    takeaway: { t: "我不知道做个正直的人会有什么回报，但至少让人一生坦然。", d: "2011-07-25" },
  },

  /* ======================= 第五章 ======================= */
  {
    id: "c5", no: "伍", label: "第五章", title: "演讲与访谈", kicker: "14 年，同样的三件事",
    blurb: "全书的压缩包：2011 毕业典礼、2016 校友访谈、2025 浙大问答。",
    question: "如果把 20 年的问答压缩成三分钟，他会说什么？答案是：14 年里，他在浙大讲的几乎是同样的三件事。",
    thesis: "这一章是全书的“压缩包”。2011 年的毕业典礼上，他只讲了三点：胸无“大”志、有所不为、做正直的人；2025 年回到浙大，开场讲的仍然是这三条。2016 年的长篇访谈则补上了“来路”：这三条是怎样从一个成绩中等的工科生、一次放弃考研、一段不喜欢的工作里长出来的。他评价自己那篇毕业演讲：“这篇演讲是我见过的最好的演讲之一，但懂的人很少。”",
    chain: [
      { h: "2011", t: "毕业典礼三点：胸无“大”志 · 做个有所不为的人 · 做个正直的人。" },
      { h: "2016", t: "校友访谈：乐趣在过程中；做对的事情；错了马上改；要有不为清单。" },
      { h: "2025", t: "浙大问答：还是那三件事；AI 只是工具；投资做得好的人都很慢。" },
    ],
    sections: [
      {
        title: "2011 年浙大毕业典礼：三件事",
        sub: "胸无“大”志 · 有所不为 · 正直",
        core: "为了这两三分钟的讲话，他“费劲想了好多天”，把毕业近 30 年的体会压成了三点。第一，做个胸无“大”志的人：去做自己喜欢的事，也努力去喜欢自己正在做的事；第二，做个有所不为的人：知道是错的事决不做，知道做错了马上改；第三，做个正直的人。",
        logic: [
          "注意第一点的后半句：刚毕业就找到自己喜欢的事“可遇不可求”，所以“努力去喜欢自己在做的事情”同样重要。要么在投入中找到乐趣，要么确认自己真的不喜欢，再做改变。",
          "“不怕犯错误”和“要避免犯错”并不矛盾：做对的事情时，要避免原则性错误；把事情做对的过程中，会犯很多错，要理解并接受。",
          "“永不放弃”也有前提：坚持的是对的事情；如果是错的事情，要立即回头。",
          "这三条的顺序本身就是全书的结构：做事的心态（胸无“大”志）→ 决策的方法（有所不为）→ 做人的底线（正直）。",
        ],
        quotes: [
          { t: "我们要胸无“大”志地去做自己喜欢的事情。同时，还要努力去喜欢自己在做的事情。", d: "2011-06-25" },
          { t: "我们常常注意到要“有所为”，但我要强调的是“有所不为”。", d: "2011-06-25" },
          { t: "知道做错了马上改，不管多大的代价，到最后往往是最小的代价。", d: "2011-06-25" },
          { t: "这篇演讲是我见过的最好的演讲之一，但懂的人很少。", d: "2022-12-15" },
        ],
        misread: { wrong: "这三条太简单了，都是正确的废话。", right: "他自己的评价是“懂的人很少”。简单不等于容易：他说本分是“极其简单但绝不容易，可以一秒钟看‘懂’但绝大多数人一辈子做不到”。", src: "2022-12-15 / 2016-10-12" },
      },
      {
        title: "2016 年校友访谈：一个普通人的来路",
        sub: "选专业 · 大学 · 人生目标 · 放弃考研 · 从星河音响到小霸王 · 捐赠 · 创业",
        core: "想理解他的“来路”，这篇访谈是最好的材料：一个成绩中等、上课会打瞌睡的工科生；大三时悟到乐趣在过程中，并读到了“做对的事情，把事情做对”；毕业时看了 3 天招生简章，放弃了考研；工作几个月发现不对就离开，最终在一台任天堂游戏机前，找到了自己喜欢的事。",
        logic: [
          "黄恭宽老师给他上的一课：做实验时，他想拧得更紧一点，结果把弹簧拧了出来。老师告诉他，用劲到 95% 就可以了，别为了一点好处冒很大的风险。这和不借钱、凡事留余地是同一种思维。",
          "星河音响的故事：一家小民营企业，一年招了 50 个研究生、100 个本科生，他待了几个月就走了；两年后他回去，发现当年都说要走的人，竟然都还没走。“所以错的事情要尽快停止”",
          "不懂不碰，在生活中也一样：不会滑雪，就别从最高的地方往下冲；“不懂的东西你可以去尝试，但不能拿生命去尝试”。",
          "为什么捐给母校？“母校毕竟我待过，对它有感情，觉得给它比较放心。”能为母校做什么，“纯粹属于感情和缘分”。",
          "学习成绩不能太糟：别人会从成绩判断你有没有纪律性；有一项特长，则说明你有毅力。再加上肯学习、会学习，“三五年之后就厉害了”。",
        ],
        quotes: [
          { t: "后来悟到，人生的乐趣就是在过程当中，需要自己不断地设定目标，而不只是达到某个目标。", d: "2016 访谈" },
          { t: "不是所有的事情都要竭尽全力，最好都留一点余地。", d: "2016 访谈" },
          { t: "所以在学校里，最重要的不是你学到的知识，而是你掌握的学习方法和人生感悟", d: "2016 访谈" },
          { t: "所以你需要有一个不为清单，你应该早早地列一个这样的清单，碰到所列的事情就要把它排除掉，这样你才能聚焦在你想做的事情上。", d: "2016 访谈" },
          { t: "我从来没鼓励过在读大学生创业，甚至不鼓励创业。", d: "2016 访谈" },
        ],
        misread: { wrong: "他天生就知道自己要做什么。", right: "“大学前阶段失去了目标，所以有段时间非常迷惘……工作之后依然很长时间没有找到目标，直到开始经营小霸王后才开始觉得又找到自己喜欢做的事情了。”", src: "2022-01-31" },
      },
      {
        title: "2025 年浙大问答：14 年后，还是那三件事",
        sub: "AI 时代 · 投资做得好的人都很慢 · 该创业的人不需要鼓励 · 学习“学习的能力” · 创新从模仿开始 · 不要把重要变成紧急 · 巴菲特与苹果",
        core: "2025 年 1 月回到浙大，他的开场几乎是 2011 年那次演讲的复述：做对的事情，把事情做对；胸无“大”志；做正直的人。无论被问到 AI、创业、压力还是挫折，他的回答最后都会回到同一句话：想长远，想想 5 年、10 年、20 年以后，你的每个决策是不是对的。",
        logic: [
          "他讲过自己上《危机时刻》节目的故事：时速 200 公里，前面 20 米有一堵墙，怎么办？“没什么办法，反正死定了。最重要的是，你不要开那么快呀”安全第一的意思是提早做准备，而不是指望危机来临时有办法。",
          "关于勤奋和乐观：“我要你勤奋，你勤奋得起来吗？”做对的事情可以选择，勤奋和乐观却多半取决于性格。",
          "创新都是从模仿开始的：谷歌、苹果、微软、亚马逊，都是“敢为天下后”。真正的创新，是满足了别人的需要，同时又是别人没做过的事。",
          "乐视的例子：有人在乐视跌到 30 多块时问他怎么办，他说：“三十几块的价钱很好啊，因为将来会是零的嘛，所以你现在什么价格卖都是好价钱”",
          "他对抗压力的办法是建立系统。早年他一天要吃 8 顿饭、去 6 次桑拿，全是在跟客户谈价钱；后来花 3 年建立了一套所有客户同一个价格的销售体系，从根上消除了这种压力。",
          "能力圈怎么培养？“40岁以前，你一定要想办法建立你的能力圈”；能在企业里实践当然最好，“但是巴菲特也没有做过实业”。",
        ],
        quotes: [
          { t: "其实时代一直都在变，工具在变，但是基本的东西还是一样的。", d: "2025-01-05" },
          { t: "其实投资做得好的人都很慢。大家并不在乎失去一些机会，但是，最重要的是你不要去踩雷。", d: "2025-01-05" },
          { t: "不能用你需要的钱去赌你不需要的钱。", d: "2025-01-05" },
          { t: "你不要让重要的事情变成紧急的事情，我觉得这个很重要。", d: "2025-01-05" },
          { t: "除了价值投资，请问还有别的投资办法吗？其实是没有的。", d: "2025-01-05" },
        ],
        misread: { wrong: "价值投资就是长期投资，找到好公司拿着就行。", right: "他在问答里说：“那‘拿着’听见了，‘好公司’就没听见。拿个错公司，不就死得更惨吗？”", src: "2025-01-05" },
        toolAfter: "timeline",
      },
    ],
    quiz: [
      { q: "他在 2011 年毕业典礼上讲的三件事是？", o: ["勤奋、乐观、创新", "胸无“大”志、有所不为、做正直的人", "多读书、早创业、会营销", "集中、长期、低估"], a: 1, e: "2025 年他回到浙大时，讲的仍然是这三条（顺序略有不同）。14 年里，这三条没有变过。" },
      { q: "《危机时刻》节目里被问到“时速 200 公里，前面 20 米有一堵墙，怎么办”，他怎么回答？", o: ["猛打方向盘", "没办法；最重要的是别开那么快，要提早预防", "跳车", "相信运气"], a: 1, e: "安全第一，意思是提早做准备，而不是危机时刻有办法。这和“不要让重要的事情变成紧急的事情”是同一个道理。" },
      { q: "被问到 AI 时代学生该怎么做，他的核心回答是？", o: ["赶紧转学 AI", "工具在变，基本的东西不变：学会学习的方法，想长远，想 5 年、10 年、20 年以后", "尽量少用 AI", "AI 会替代一切，躺平就好"], a: 1, e: "“其实时代一直都在变，工具在变，但是基本的东西还是一样的。”他几乎对每个问题都给出了同一个答案：想长远。" },
      { q: "有人问乐视跌到 30 多块怎么办，他说“现在什么价格卖都是好价钱”，因为？", o: ["他觉得马上会反弹", "他判断这家公司将来会是零，所以现在任何价格卖出都比将来好，和买入成本无关", "他自己想买", "他在开玩笑"], a: 1, e: "发现错了马上改，不管多大的代价都是最小的代价；卖出和买入成本无关。" },
      { q: "他说自己对抗压力的主要办法是？", o: ["冥想", "打高尔夫", "建立系统，从根上消除压力的来源（比如不讨价还价的销售体系）", "喝酒"], a: 2, e: "早年他一天要吃 8 顿饭、去 6 次桑拿，全是在谈价钱。他花 3 年时间建立了所有客户同一个价格的销售体系，从此不用再面对这种压力。" },
    ],
    reflect: [
      "如果你只能给即将毕业的自己讲 3 分钟，你会讲哪三点？",
      "你的生活里，有哪件“重要但不紧急”的事，正在慢慢变成紧急的事？",
    ],
    takeaway: { t: "反正最终你会成为你本该成为的人。", d: "2025-01-05" },
  },
];

/* =========================================================
 * 工具用数据
 * ========================================================= */

const SORTER = [
  { n: "航空公司", a: "bad", why: "产品几乎无法差异化，消费者关心的主要是从 A 到 B 的价格：“航空公司是极致，就是因为产品差异化小。”", d: "2012-07-11" },
  { n: "光伏硅片", a: "bad", why: "“感觉最没有差异化的产品就是硅片，因为用户最后只会关心每度电的成本”", d: "2012-07-13" },
  { n: "高端白酒（以茅台为例）", a: "good", why: "好喝、有定价能力、库存越放越值钱、很久没有新牌子：“躺赢的典型其实是贵州茅台和喜诗糖果。”", d: "2022-01-04" },
  { n: "券商", a: "bad", why: "“券商的差异化应该比航空公司还要小，转换成本非常低（换交易平台是没有成本的），价格战是难以避免的。”", d: "2024-01-21" },
  { n: "网络游戏", a: "depends", why: "“好的游戏绝对是好生意，但一般的游戏未必是。”好游戏像社区，老玩家很难离开；大部分游戏公司则没有护城河。", d: "2018-09-02" },
  { n: "快递物流", a: "bad", why: "行业很大，但差异化不大、投入巨大：“物流是个苦生意，但也是生意……赚的都是辛苦钱。”", d: "2024-08-20" },
  { n: "动力电池 / 储能", a: "bad", why: "“电池应该很难有差异化，所以最后的结局多是价格和规模的竞争。”", d: "2023-01-15" },
  { n: "智能手机", a: "depends", why: "“手机在苹果手里就是个极好的商业模式，在我们手里也是，但很多做手机的公司都倒下了或者根本做不起来。”", d: "2019-05-30" },
  { n: "船运", a: "bad", why: "需要借很多钱，产品又没有差异化：“很烂的生意模式”；“时间长了后，什么价都不便宜”。", d: "2015-09-09 / 2015-11-30" },
  { n: "银行", a: "depends", why: "他说银行产品的差异化和客户转换成本其实都不低，但本质上是借钱做生意，风险难懂：“银行是用margin的生意，任何时候我都不会重仓的。”", d: "2014-10-31 / 2013-02-03" },
  { n: "餐饮", a: "bad", why: "“餐饮几乎都是苦生意，高标准化的可能还不错，比如麦当劳啥的。”", d: "2024-09-02" },
];
const SORT_LABEL = { good: "好生意", bad: "苦生意", depends: "要看具体公司" };

const FILTER_Q = [
  { g: "过滤器一 · 商业模式（马）", items: [
    { q: "10 年后，它的利润大概率比今天高？", s: "“想公司，想生意，想10年20年后公司是什么。”（2024-03-14）" },
    { q: "即使对手便宜 5%，它的用户也大多不会换走？", s: "麦片 vs 航空：用户会不会因为一点折扣就换？（2012-05-02）" },
    { q: "竞争对手花很长时间、很多钱，也很难抢走它的生意？", s: "“竞争对手哪怕用很长的时间也很难抢。”（2020-10-11）" },
    { q: "长期看，利润变成了真金白银的净现金流，而不是靠持续借钱或增发来维持？", s: "“长期现金流少于利润不是一件好事”（2010-05-27）" },
  ]},
  { g: "过滤器二 · 企业文化（骑师）", items: [
    { q: "遇到问题时，它先问“这是对的事情吗”，而不是“能赚多少”？（看它过去的做法）", s: "“企业行事是以利益还是以是非为标准。”（2020-10-11）" },
    { q: "管理层过去说过的话，大多都做到了？", s: "“看他的历史、说的和做的。”（2010-11-12）" },
    { q: "它没有喊“市值做到多少”“成为行业第一”这类口号？", s: "“凡是说要把市值做到多少钱的我都不碰。”（2012-02-01）" },
    { q: "如果把这家公司当成一个人，你愿意长期跟他打交道？", s: "“我不想打交道的人我也不想投资他们的公司。”（2020-10-11）" },
  ]},
  { g: "过滤器三 · 价格与你自己", items: [
    { q: "你能毛估估说出它未来 10 年“至少能赚多少钱”？", s: "“如果能判断出来一家公司未来至少能赚多少钱后，其实就是个小学算术题了。”（2024-08-13）" },
    { q: "按现在的市值，你愿意买下整家公司，交给现在这帮人经营？", s: "“如果你有钱，愿意把这家公司按这个市值买下来并继续交给他们经营吗？”（2022-01-04）" },
    { q: "如果它 10 年都不能交易，你依然睡得着？", s: "“拿着10年都不上市你依然能睡好觉，那你大概就懂了。”（2019-05-04）" },
    { q: "你用的是闲钱，没有借钱？", s: "“投资用的是闲钱，不然就是投机了。”（2014-07-20）" },
  ]},
];

const STOPLIST = [
  { t: "不做代工（OEM）", b: "长远看，自己想建立品牌，就要把所有资源投在自己的产品上；专业代工厂做得比自己好，“既然知道长远会做不过别人，那我们干脆就不做”。他曾在电话里直接拒绝沃尔玛供应商 100 万台 VCD 的订单，连价钱都不谈。", d: "2016-10-12" },
  { t: "不讨价还价", b: "所有客户同一个价，不分大小生熟，没有折扣，没有返利，公司甚至没有销售部门。这套体系他们花了三年才建立起来，因为“建立信任很难”。", d: "2015-06-12 / 2019-09-22" },
  { t: "不贷款", b: "“负债的好处是可以发展快些。不负债的好处是可以活得长些。”他见过太多公司在犯错时借钱，把错误放大到再也回不来。", d: "2010-04-21 / 2021-01-23" },
  { t: "不赊账", b: "收不到钱的生意不做，不管听起来有多好。对方要开不可撤销信用证；给客户的放账额度，一般是这个客户上一年营业额的 3%–5%。", d: "2010-03-26" },
  { t: "不拖欠供应商", b: "压款不能超过 60 天，否则要付利息。当 CEO 时，他在供应商会上公开了自己的手机号：有人不守信，可以直接打电话投诉他。", d: "2019-07-26 / 2010-03-12" },
  { t: "不赚人便宜", b: "“小天才”商标 30 万买下后，又补给原主人 270 万，因为他们本来就觉得 300 万是个好价钱。", d: "2012-03-01" },
  { t: "不攻击竞争对手", b: "据一位老员工讲述，2005 年开发部说了竞争对手的坏话，陈明永认为违背了公司精神，自罚一年薪水。段永平本人事前也不知道这件事。", d: "2010-03-22" },
  { t: "不参加展会", b: "包括 CES 在内，公司的产品不参展：“这种推广的办法对推广品牌事倍功半。”", d: "2013-10-27" },
  { t: "不收购兼并", b: "“我们这种办法短期看来好像慢很多，但从10年20年的角度来看，有可能是最快的。”", d: "2010-03-25" },
  { t: "不为缺钱上市", b: "“我们绝不会因为缺钱上市，30年以后应该也不会。”要是上市了，也会像没上市时那样经营。", d: "2023-05-09" },
  { t: "不用直系亲属", b: "在中国的文化环境下，如果允许直系亲属进公司，“10年8年后重要岗位基本上就都是那谁谁谁的亲属了”。有了这条规矩，大家也省了无数人情债。", d: "2011-02-21" },
  { t: "不追排名，不定营业额目标", b: "“我们好像从来就没有太具体的目标。”排名只是结果；为了排名，公司就会去打价格战、压货。", d: "2013-12-19" },
];

const SPECTRUM = [
  { n: "苹果", p: 96, tag: "十几年几乎单仓", q: "我对苹果确实完全不操心，掉多少都不往心里去。", d: "2022-10-05" },
  { n: "网易（2002 年前后）", p: 92, tag: "“单吊一股”", q: "我一生中单吊一股不是一次两次了，创立公司是，投网易也是。", d: "2023-05-12" },
  { n: "茅台", p: 86, tag: "重仓（人民币资产）", q: "我对茅台的产品文化，尤其是53度飞天的产品文化蛮有信心的。", d: "2019-04-05" },
  { n: "腾讯", p: 56, tag: "小比例，卖 put", q: "腾讯总是觉得懂得不透，下不了重手。", d: "2022-10-05" },
  { n: "拼多多", p: 44, tag: "风投心态", q: "唯一我觉得可以做风投的理由就是，在目前这种成长情况下，我相信他们的好文化最终会有不错的概率会带来好结果。", d: "2018-08-31" },
  { n: "阿里巴巴", p: 32, tag: "卖出后，偶尔象征性卖 put", q: "我觉得我对阿里商业模式的护城河还不是很有底，很难下重注。", d: "2021-12-09" },
  { n: "英伟达", p: 24, tag: "卖点 put，近距离关注", q: "看不懂10年真的很难下手。", d: "2025-02-26" },
  { n: "银行", p: 6, tag: "不懂不碰", q: "无论如何，银行是用margin的生意，任何时候我都不会重仓的。", d: "2013-02-03" },
];

const ERRORS = [
  { s: "做空一只自己认为“有问题”的股票，被逼空后不服输，又加了码。", a: "wrong", why: "做空本身就在不为清单上：“首先，卖空行为是错的……卖空行为是投机行为，吾不该为之。”他在百度上为此亏了大约 1.5–2 亿美元。" },
  { s: "一家以用户体验著称的公司，因为创始人说过不做大屏，比用户的需求晚了 3 年多才推出大屏手机。", a: "learn", why: "方向（做最好的产品）没有错，这是在把事情做对的过程中出现的判断失误，最后“他们还是用不同的办法想通了”。" },
  { s: "新产品上市后，发现供应商提供的机芯有质量问题，公司决定召回已卖出的 20 万台。", a: "learn", why: "质量问题属于把事情做对过程中的错误；而召回，正是“发现错了马上改，不管多大的代价都是最小的代价”。这是步步高第一批 VCD 的真实故事。" },
  { s: "采购员收了供应商的回扣。", a: "wrong", why: "“采购员拿回扣应该开除，给回扣的供应商应该列入禁入对象。”这不是能力问题，是是非问题。" },
  { s: "打高尔夫时，一杆把球打进了水里。", a: "learn", why: "“打高尔夫的人是没有办法避免偶尔把球打下水的，能做的仅仅是学习如何能降低犯错误的概率。”" },
  { s: "明知手里的股票是一家烂公司，但因为已经亏了 20%，决定“等回本再说”。", a: "wrong", why: "明知是错还继续，就是在做错的事。书中一位网友按这个原则亏 20% 卖出，后来那只股票亏到了 60%。段永平的回应是：“不这么做会更不容易的！”" },
  { s: "为了上市，按券商的建议把研发费用占比“做”到“行业合理水平”。", a: "wrong", why: "“为了上市提高费用比例是非常滑稽的事情，目的其实就是要给买股票的人造点假象，本身也是不诚实的行为。”" },
  { s: "一家文化很强的公司高价收购了另一家公司，一年多后发现不合适，果断卖掉。", a: "learn", why: "他举过谷歌收购摩托罗拉的例子：好的经营者也会犯傻，但好的企业文化能让企业在较短时间里改正。" },
  { s: "小偷被抓后认真复盘，总结出“下次要把偷技练得更好”。", a: "wrong", why: "这是他最爱举的反例：小偷犯的是第一种错误（做了错的事），却用第二种办法（提高技能）去“改进”，结果只会更糟。" },
];

const TIMELINE = [
  { y: "1961", t: "出生于江西南昌", d: "父母不打骂孩子。他后来说，自己相对理性、有平常心，很可能和从小心里没有恐惧感有很大关系。" },
  { y: "1978", t: "考入浙江大学无线电系", d: "1977 年第一次高考没考上，1978 年再考，成了当地的“小考区状元”；进浙大后，班上 35 人里考分排第 18。后来因身体原因休学一年，1979 年复学。" },
  { y: "大三", t: "读到“做对的事情，把事情做对”", k: true, d: "他说这是“一生受益最大的一句话”（出自德鲁克），但真正搞明白“或许是20年之后”。同一年，他还悟到乐趣在过程之中。" },
  { y: "本科毕业", t: "放弃考研，分配到北京工作", d: "在招生简章前看了 3 天，找不到一个想考的专业。后来对工作环境不满意，考上了人民大学经济学的研究生，“彻底换了个方向和行业”。" },
  { y: "1988", t: "研究生毕业，南下广东", d: "年初还在读研时，他倒卖过一次章光 101，赚了不到 2000 元，也得出一个经验：“两头在外的生意是无法长期的”。毕业后到广东，在星河音响待了几个月就走了；年底因为一台任天堂游戏机去了中山，“口袋里真的就只剩5块钱了”。" },
  { y: "1989", t: "接手小霸王的前身“日华电子厂”", k: true, d: "账上只剩 2000 多元，欠总公司 200 万，连工人在内不到 20 人。第一单进散件组装，7 天内卖完，赚了 20 万元。“小霸王”这个品牌大约在 1990–91 年推出。" },
  { y: "1995", t: "离开小霸王，创立步步高", d: "8 月离开小霸王，9 月 18 日步步高在东莞长安成立。“步步高”这个名字是征名征来的，有 8 个人都起了这个名字，每人奖励 5000 元。" },
  { y: "2000", t: "开始设计 OPPO 品牌", d: "请欧洲人设计，在全球逐个国家做语音语义测试，花了几年时间才开始做产品。" },
  { y: "2001", t: "退出一线，移居美国", k: true, d: "“我这个人比较懒散随意，不是一个好的CEO人选。”步步高拆分为三家公司，分别由不同的团队独立经营。" },
  { y: "2002 前后", t: "买入网易", k: true, d: "均价约 1 美元，账上现金却有每股约 2 美元；最终赚了 100 多倍。“以铜价买金子不需要勇气”" },
  { y: "2006", t: "拍下巴菲特午餐", d: "竞拍 ID 是 Fast is slow（欲速不达）。从巴菲特那里学到最重要的一点：先看商业模式。这一年起，他开始在网上分享问答。" },
  { y: "2008–09", t: "金融危机中重仓 GE", d: "决定性因素是 GE 的 CEO 出来认错。后来他又反思：“当初买GE是欠妥的。”" },
  { y: "2011", t: "开始买苹果；浙大毕业典礼演讲", k: true, d: "想通了两点：乔布斯是恰好也会报时的造钟人，库克是更理性的 CEO；此后十几年几乎单仓持有。同年在浙大毕业典礼上讲了三件事。" },
  { y: "2012–13", t: "塑化剂风波中大规模买入茅台", d: "托朋友把一瓶 30 年的茅台送到美国检测，确认没问题后下手。同一时期，OPPO 和 vivo 经历了从功能机到智能机的艰难转型。" },
  { y: "2018", t: "买入腾讯；在奥马哈和巴菲特聊苹果", d: "他对巴菲特说：苹果的商业模式比可口可乐好。四年后，巴菲特向芒格、盖茨介绍他时，复述的正是这句话。" },
  { y: "2019–20", t: "卖出阿里巴巴，清仓 Facebook", d: "一个是因为“二选一”违背了阿里自己的文化，一个是因为看了扎克伯格的国会证词后“粉转路”。都是因为文化。" },
  { y: "2025", t: "回到浙大问答；本书出版", k: true, d: "开场讲的还是那三件事：做对的事情，把事情做对；胸无“大”志；做正直的人。" },
];

const CHEAT = [
  "买股票就是买公司，买公司就是买它整个生命周期的净现金流折现。",
  "折现率就是你的机会成本，最低是国债利率。投资是一道比较题。",
  "不懂不碰。知道能力圈的边界，比能力圈有多大更重要。",
  "不做空，不借钱：永远别让自己出局。",
  "价格是别人的报价；真正的买家只有公司自己；波动是朋友。",
  "商业模式和企业文化第一，价格第三；前两条是过滤器，没有权重之说。",
  "生意只取决于产品；差异化 = 用户需要、别人又没满足的东西。",
  "持有 = 买入；卖出和成本无关；伟大的公司要惜卖。",
  "做对的事情 = 不做明知是错的事，发现错了马上改（不为清单）。",
  "想长远，想本质：从 10 年后看回来；最终你会成为本该成为的人。",
];

const TESTS = [
  { t: "你不会想去问别人“我是不是看懂了这家公司”。", d: "2019-07-24" },
  { t: "它大跌时你想全力买入，大涨时你也不想卖。", d: "2019-04-06" },
  { t: "它 10 年不上市，你依然能睡好觉。", d: "2019-05-04" },
  { t: "你敢下重注。", d: "2024-04-21" },
];

const GLOSSARY = [
  ["未来现金流折现（DCF）", "把公司未来每年能产生的净现金，按你的机会成本折回今天。在他这里，它是一种思维方式，而不是公式。"],
  ["能力圈", "你能毛估估判断一家公司未来现金流的范围。重要的是知道边界在哪里。"],
  ["护城河", "能长期维持的差异化，让竞争对手很长时间也抢不走生意；和“定价能力”是一回事。"],
  ["安全边际", "在他这里，首先指你对公司的理解程度，其次才是价格折扣。"],
  ["margin（融资 / 保证金）", "向券商借钱买股票，用持仓做抵押；大跌时会被要求追加保证金，或被强制平仓。"],
  ["做空", "借来股票卖出，期待以后用更低的价格买回；亏损理论上没有上限。"],
  ["卖 put（卖看跌期权）", "收取权利金，承诺在约定价格买入股票。他只对自己本来就想以这个价格买入的公司这么做。"],
  ["covered call（备兑看涨期权）", "持有股票的同时卖出看涨期权、收取权利金；股价超过约定价格时，股票会被“call 走”。"],
  ["烟蒂股", "格雷厄姆式的便宜货：价格低于资产价值，但生意一般，像还能免费吸最后一口的烟蒂。"],
  ["本手 / 妙手 / 俗手", "围棋术语：合乎棋理的下法 / 出人意料的妙招 / 看似合理实则受损的下法。他说：“其实妙手就是本手”。"],
  ["保健因子 / 激励因子", "双因素理论：缺了会不满意的是保健因子（比如钱），真正让人投入的是激励因子。"],
  ["13F", "美国机构投资者每季度披露持仓的报告。他提醒：知道别人买了什么，对不懂公司的人没什么帮助。"],
];

/* =========================================================
 * 小组件
 * ========================================================= */

function Quote({ q }) {
  return (
    <blockquote className="dd-quote">
      <p>“{q.t}”</p>
      <cite>{q.who || "段永平"} · {q.d}</cite>
    </blockquote>
  );
}

function Misread({ m }) {
  const [show, setShow] = useState(false);
  return (
    <div className="dd-mis">
      <div className="dd-mis-row bad">
        <span className="ic">✕</span>
        <div>
          <small>常见误读</small>
          <p>{m.wrong}</p>
        </div>
      </div>
      {show ? (
        <div className="dd-mis-row ok">
          <span className="ic">✓</span>
          <div>
            <small>他的原意</small>
            <p>{m.right}</p>
            <p className="dd-small dd-muted" style={{ marginTop: 4 }}>出处：{m.src}</p>
          </div>
        </div>
      ) : (
        <div className="dd-mis-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <span className="dd-small dd-muted">你是不是也这么理解过？</span>
          <button className="dd-btn-ghost" onClick={() => setShow(true)}>看他的原意</button>
        </div>
      )}
    </div>
  );
}

function Section({ s, idx, chNo, open, isRead, onToggle }) {
  return (
    <article id={s.id} className={"dd-sec" + (open ? " open" : "")}>
      <button className="dd-sec-head" onClick={onToggle} aria-expanded={open}>
        <span className="dd-sec-no">{chNo}.{idx + 1}</span>
        <div style={{ minWidth: 0 }}>
          <h3>{s.title}</h3>
          <p className="sub">{s.sub}</p>
        </div>
        {isRead && <span className="chk">✓ 已读</span>}
      </button>
      <p className="dd-sec-core">{s.core}</p>
      {open && (
        <div className="dd-sec-body">
          <div className="dd-sub">拆解 · 为什么是这样</div>
          <ol className="dd-logic">
            {s.logic.map((l, i) => <li key={i}>{l}</li>)}
          </ol>
          <div className="dd-sub">原话</div>
          {s.quotes.map((q, i) => <Quote key={i} q={q} />)}
          {s.misread && (
            <>
              <div className="dd-sub">误读检查</div>
              <Misread m={s.misread} />
            </>
          )}
        </div>
      )}
      <div className="dd-sec-foot">
        <button className="dd-link" onClick={onToggle}>{open ? "收起" : "展开拆解、原话与误读 →"}</button>
      </div>
    </article>
  );
}

function seededOrder(n, seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  const rnd = () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function Quiz({ chId, items, answers, onAnswer, onReset }) {
  const keys = items.map((_, i) => chId + "-" + i);
  const orders = useMemo(() => items.map((it, i) => seededOrder(it.o.length, "dadao-" + chId + "-" + i)), [chId, items]);
  const done = keys.filter((k) => answers[k] !== undefined).length;
  const right = keys.filter((k, i) => answers[k] === items[i].a).length;
  const letters = ["A", "B", "C", "D", "E"];
  return (
    <div>
      <div className="dd-score">
        <span className="dd-tag red">已答 {done}/{items.length}</span>
        <span className="dd-tag jade">答对 {right}</span>
        {done > 0 && <button className="dd-btn-ghost dd-small" onClick={onReset}>重做本章测验</button>}
      </div>
      {items.map((it, i) => {
        const k = keys[i];
        const sel = answers[k];
        const answered = sel !== undefined;
        return (
          <div className="dd-quiz-q" key={k}>
            <h4>{i + 1}. {it.q}</h4>
            <div className="dd-opts">
              {orders[i].map((oi, j) => {
                let cls = "dd-opt";
                if (answered && oi === it.a) cls += " right";
                else if (answered && oi === sel) cls += " wrong";
                return (
                  <button key={oi} className={cls} disabled={answered} onClick={() => onAnswer(k, oi)}>
                    <span className="k">{letters[j]}</span>
                    <span>{it.o[oi]}</span>
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className="dd-explain">
                <b>{sel === it.a ? "答对了。" : "差一点。正确答案是 " + letters[orders[i].indexOf(it.a)] + "。"}</b> {it.e}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ToolFrame({ eyebrow, title, desc, children }) {
  return (
    <section className="dd-tool">
      <div className="dd-tool-head">
        <div className="dd-eyebrow">{eyebrow}</div>
        <h3>{title}</h3>
        {desc && <p>{desc}</p>}
      </div>
      <div className="dd-tool-body">{children}</div>
    </section>
  );
}

function Range({ label, value, min, max, step, unit, onChange }) {
  return (
    <div className="dd-range">
      <label>
        <span>{label}</span>
        <b>{value}{unit}</b>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
    </div>
  );
}

/* =========================================================
 * 工具 1：毛估估计算器
 * ========================================================= */
const PAY_PRESETS = [
  { label: "伟大公司合理价 vs 烟蒂", A: { n: "好公司：30 倍，年增 10%", pe: 30, g: 10 }, B: { n: "烟蒂：8 倍，年减 5%", pe: 8, g: -5 }, N: 20 },
  { label: "同一家好公司：20 倍买 vs 30 倍买", A: { n: "20 倍买入", pe: 20, g: 10 }, B: { n: "30 倍买入（贵了 50%）", pe: 30, g: 10 }, N: 20 },
  { label: "苹果 2011：他的判断", A: { n: "苹果（扣掉净现金约 10 倍，5 年利润到 500 亿 ≈ 年增 20%）", pe: 10, g: 20 }, B: { n: "普通公司：12 倍，不增长", pe: 12, g: 0 }, N: 5 },
  { label: "同样 15 倍：好生意 vs 平庸生意", A: { n: "好生意：年增 8%", pe: 15, g: 8 }, B: { n: "平庸生意：不增长", pe: 15, g: 0 }, N: 20 },
];

function cumEarn(g, n) {
  let c = 0;
  for (let k = 1; k <= n; k++) c += Math.pow(1 + g / 100, k);
  return c;
}
function paybackYear(pe, g) {
  let c = 0;
  for (let k = 1; k <= 100; k++) {
    c += Math.pow(1 + g / 100, k);
    if (c >= pe) return k;
  }
  return null;
}

function PaybackTool() {
  const [preset, setPreset] = useState(0);
  const [A, setA] = useState(PAY_PRESETS[0].A);
  const [B, setB] = useState(PAY_PRESETS[0].B);
  const [N, setN] = useState(20);
  const [r, setR] = useState(4);

  function applyPreset(i) {
    const p = PAY_PRESETS[i];
    setPreset(i); setA(p.A); setB(p.B); setN(p.N);
  }

  const data = useMemo(() => {
    const sa = [0], sb = [0], bond = [0];
    for (let n = 1; n <= N; n++) {
      sa.push(cumEarn(A.g, n) / A.pe);
      sb.push(cumEarn(B.g, n) / B.pe);
      bond.push(Math.pow(1 + r / 100, n) - 1);
    }
    let cross = null;
    if (sa[1] < sb[1]) {
      for (let n = 1; n <= N; n++) if (sa[n] >= sb[n]) { cross = n; break; }
    }
    return { sa, sb, bond, cross };
  }, [A, B, N, r]);

  const W = 600, H = 260, L = 58, R = 16, T = 16, Bt = 34;
  const ymaxRaw = Math.max(1.2, ...data.sa, ...data.sb, ...data.bond);
  const step = ymaxRaw <= 1.6 ? 0.25 : ymaxRaw <= 3 ? 0.5 : ymaxRaw <= 6 ? 1 : ymaxRaw <= 12 ? 2 : 5;
  const ymax = Math.ceil((ymaxRaw * 1.05) / step) * step;
  const x = (n) => L + ((W - L - R) * n) / N;
  const y = (v) => H - Bt - ((H - T - Bt) * v) / ymax;
  const path = (arr) => arr.map((v, n) => (n === 0 ? "M" : "L") + x(n).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
  const ticks = [];
  for (let v = 0; v <= ymax + 1e-9; v += step) ticks.push(Number(v.toFixed(2)));
  const xticks = [];
  const xs = N <= 10 ? 1 : N <= 20 ? 5 : 5;
  for (let n = 0; n <= N; n += xs) xticks.push(n);

  const pbA = paybackYear(A.pe, A.g), pbB = paybackYear(B.pe, B.g);
  const mA = data.sa[N], mB = data.sb[N], mBond = data.bond[N];

  return (
    <ToolFrame
      eyebrow="互动工具 · 毛估估"
      title="你买的，是多少年的利润？"
      desc="用他的方式思考：假装买下整家公司，不管股价，只看它未来能赚多少钱。纵轴是“累计利润 ÷ 买价”，超过 1 就是“用公司赚的钱收回了买价”。">
      <div className="dd-presets">
        {PAY_PRESETS.map((p, i) => (
          <button key={i} className={"dd-btn-ghost" + (preset === i ? " on" : "")} onClick={() => applyPreset(i)}>{p.label}</button>
        ))}
      </div>
      <div className="dd-grid2" style={{ marginTop: 6 }}>
        <div className="dd-box" style={{ borderColor: "var(--accent)" }}>
          <small style={{ color: "var(--accent)" }}>A · {A.n}</small>
          <Range label="买入市盈率" value={A.pe} min={4} max={60} step={1} unit=" 倍" onChange={(v) => { setA({ ...A, pe: v, n: "A 公司" }); setPreset(-1); }} />
          <Range label="利润年增长" value={A.g} min={-10} max={25} step={1} unit="%" onChange={(v) => { setA({ ...A, g: v, n: "A 公司" }); setPreset(-1); }} />
        </div>
        <div className="dd-box" style={{ borderColor: "var(--jade)" }}>
          <small style={{ color: "var(--jade)" }}>B · {B.n}</small>
          <Range label="买入市盈率" value={B.pe} min={4} max={60} step={1} unit=" 倍" onChange={(v) => { setB({ ...B, pe: v, n: "B 公司" }); setPreset(-1); }} />
          <Range label="利润年增长" value={B.g} min={-10} max={25} step={1} unit="%" onChange={(v) => { setB({ ...B, g: v, n: "B 公司" }); setPreset(-1); }} />
        </div>
      </div>
      <div className="dd-grid2">
        <Range label="观察年限" value={N} min={5} max={30} step={1} unit=" 年" onChange={(v) => { setN(v); setPreset(-1); }} />
        <Range label="国债利率（你的最低机会成本）" value={r} min={0} max={8} step={0.5} unit="%" onChange={setR} />
      </div>

      <svg className="dd-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="累计利润与买价之比随年份变化">
        {ticks.map((t) => (
          <g key={t}>
            <line className="g" x1={L} x2={W - R} y1={y(t)} y2={y(t)} strokeWidth="1" />
            <text className="t" x={L - 8} y={y(t) + 4} textAnchor="end">{t}×</text>
          </g>
        ))}
        {xticks.map((n) => (
          <text className="t" key={n} x={x(n)} y={H - 10} textAnchor="middle">{n === 0 ? "今天" : n + "年"}</text>
        ))}
        <line className="base" x1={L} x2={W - R} y1={y(1)} y2={y(1)} strokeWidth="1.2" strokeDasharray="2 4" />
        <text className="t2" x={L + 6} y={y(1) - 6} textAnchor="start">回本线：累计利润 = 买价</text>
        <path className="bond" d={path(data.bond)} fill="none" strokeWidth="2" strokeDasharray="6 5" />
        <path className="lb" d={path(data.sb)} fill="none" strokeWidth="2.6" strokeLinejoin="round" />
        <path className="la" d={path(data.sa)} fill="none" strokeWidth="2.6" strokeLinejoin="round" />
        <circle className="da" cx={x(N)} cy={y(mA)} r="4" />
        <circle className="db" cx={x(N)} cy={y(mB)} r="4" />
      </svg>
      <div className="dd-legend">
        <span><i style={{ background: "var(--accent)" }} />A 累计利润 ÷ 买价</span>
        <span><i style={{ background: "var(--jade)" }} />B 累计利润 ÷ 买价</span>
        <span><i style={{ background: "var(--muted)" }} />同样的钱存国债（利滚利）的累计利息</span>
      </div>

      <div className="dd-kpis">
        <div className="dd-kpi">
          <small>A：{N} 年累计利润 ÷ 买价</small>
          <b style={{ color: "var(--accent)" }}>{mA.toFixed(2)} 倍</b>
          <span>{pbA ? `约第 ${pbA} 年“回本”` : "100 年内回不了本"}</span>
        </div>
        <div className="dd-kpi">
          <small>B：{N} 年累计利润 ÷ 买价</small>
          <b style={{ color: "var(--jade)" }}>{mB.toFixed(2)} 倍</b>
          <span>{pbB ? `约第 ${pbB} 年“回本”` : "100 年内回不了本"}</span>
        </div>
        <div className="dd-kpi">
          <small>国债 {r}%：{N} 年累计利息</small>
          <b>{mBond.toFixed(2)} 倍</b>
          <span>这是最低的及格线</span>
        </div>
      </div>
      <p className="dd-note">
        {data.cross
          ? `A 一开始看起来更“贵”，但到第 ${data.cross} 年，它累计赚的钱（相对买价）就追上了 B。时间是平庸公司的敌人，伟大公司的朋友。`
          : mA >= mB
            ? "在这个设定下，A 从头到尾都不吃亏。"
            : "在这个设定下，B 更好。试着把年限拉长，或者调整增长率，看看结论会不会变。"}
        {" "}注意：这里只算公司赚到的利润，没有算最终卖出的价格，也没有算利润再投资或回购带来的复利，所以对好公司来说是偏保守的。难的从来不是算术，而是判断增长率那一栏：“如果能判断出来一家公司未来至少能赚多少钱后，其实就是个小学算术题了。”
      </p>
    </ToolFrame>
  );
}

/* =========================================================
 * 工具 2：杠杆压力测试
 * ========================================================= */
function LeverageTool() {
  const [Lv, setLv] = useState(2);
  const [D, setD] = useState(40);
  const [m, setM] = useState(25);
  const d = D / 100;
  const assets = Lv * (1 - d);
  const debt = Lv - 1;
  const equity = assets - debt;
  const ratio = assets > 0 ? equity / assets : -1;
  const maxDD = Lv <= 1 ? 1 : Math.max(0, (1 - (m / 100) * Lv) / (Lv * (1 - m / 100)));
  let status = "ok", msg;
  if (Lv > 1 && equity <= 0) { status = "bad"; msg = "本金归零，甚至倒欠券商。即使这家公司后来涨了十倍，也和你没有关系了。"; }
  else if (Lv > 1 && ratio < m / 100) { status = "bad"; msg = `触发追加保证金或强制平仓：你会在最低点被迫卖出，剩下的本金只有约 ${(equity * 100).toFixed(0)}%，而且再也等不到反弹。`; }
  else if (Lv > 1) { status = "warn"; msg = `暂时安全，账面本金剩 ${(equity * 100).toFixed(0)}%。但再多跌一点，或者你忍不住多借一点，就会越线。`; }
  else { status = "ok"; msg = `没有杠杆：账面本金剩 ${(equity * 100).toFixed(0)}%。只要公司没问题，你可以一直等下去，甚至高兴地加仓。`; }
  const recover = d < 1 ? (d / (1 - d)) * 100 : Infinity;
  const scale = 3;
  const pct = (v) => Math.max(0, (v / scale) * 100) + "%";

  const DROPS = [
    { l: "2012–13 年跌 55%", v: 55 },
    { l: "2015–16 年跌 36%", v: 36 },
    { l: "2018 年跌 40%", v: 40 },
    { l: "2020 年跌 36%", v: 36 },
  ];

  return (
    <ToolFrame
      eyebrow="互动工具 · 不借钱"
      title="杠杆压力测试：好公司也会让你出局"
      desc="下面的按钮是书中列出的苹果几次大跌（段永平回应：“是啊，苹果每次大跌的时候我都会加码，每一次！”）。试试如果当年加了杠杆会怎样。">
      <div className="dd-presets">
        {DROPS.map((x) => (
          <button key={x.l} className={"dd-btn-ghost" + (D === x.v ? " on" : "")} onClick={() => setD(x.v)}>苹果 {x.l}</button>
        ))}
      </div>
      <Range label="杠杆倍数（1 = 不借钱）" value={Lv} min={1} max={3} step={0.1} unit=" 倍" onChange={setLv} />
      <Range label="股价从高点回撤" value={D} min={0} max={80} step={1} unit="%" onChange={setD} />
      <div className="dd-range">
        <label><span>维持担保比例（低于它就被要求追加保证金或强平）</span><b>{m}%</b></label>
        <div className="dd-seg" style={{ marginTop: 4 }}>
          {[20, 25, 30, 40].map((v) => (
            <button key={v} className={m === v ? "y" : ""} onClick={() => setM(v)}>{v}%</button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="dd-small dd-muted" style={{ marginBottom: 4 }}>买入时：你的本金 1 + 借来的钱 {debt.toFixed(1)}</div>
        <div className="dd-stackbar">
          <i style={{ width: pct(1), background: "var(--jade)" }} title="本金" />
          <i style={{ width: pct(debt), background: "var(--line2)" }} title="借款" />
        </div>
        <div className="dd-small dd-muted" style={{ margin: "10px 0 4px" }}>回撤 {D}% 后：持仓市值 {assets.toFixed(2)}，欠款仍然是 {debt.toFixed(1)}</div>
        <div className="dd-stackbar">
          <i style={{ width: pct(Math.max(equity, 0)), background: "var(--jade)" }} title="剩余本金" />
          <i style={{ width: pct(Math.min(assets, debt)), background: "var(--line2)" }} title="仍需归还的借款" />
          <i style={{ width: pct(Lv * d), background: "repeating-linear-gradient(45deg,var(--bad) 0 6px,var(--bad-soft) 6px 12px)" }} title="市值蒸发" />
        </div>
        <div className="dd-legend">
          <span><i style={{ background: "var(--jade)" }} />你的本金</span>
          <span><i style={{ background: "var(--line2)" }} />借来的钱</span>
          <span><i style={{ background: "var(--bad)" }} />市值蒸发（全部由你的本金承担）</span>
        </div>
      </div>

      <div className={"dd-verdict " + status}>{msg}</div>
      <div className="dd-kpis">
        <div className="dd-kpi"><small>这个杠杆下，最多能扛住的回撤</small><b>{Lv <= 1 ? "100%" : (maxDD * 100).toFixed(0) + "%"}</b><span>超过就会被强平</span></div>
        <div className="dd-kpi"><small>股价要涨多少才能回到原点</small><b>{isFinite(recover) ? "+" + recover.toFixed(0) + "%" : "∞"}</b><span>{status === "bad" ? "可你已经不在场上了" : "跌 50% 要涨 100%"}</span></div>
        <div className="dd-kpi"><small>剩余本金</small><b>{Math.max(equity * 100, 0).toFixed(0)}%</b><span>{equity < 0 ? "倒欠 " + (-equity * 100).toFixed(0) + "%" : "相对初始本金"}</span></div>
      </div>
      <p className="dd-note">
        你会发现，低杠杆（比如 1.3 倍）在账面上能扛住很大的回撤。他的回答依然是“勿以恶小而为之”：市场的疯狂没有上限，杠杆会上瘾，而你一生只需要碰上一次，就可能被 wiped out（彻底清零）。“反正你借不借钱一生当中都会失去无穷机会的，但借钱可能会让你再也没机会了。”
      </p>
    </ToolFrame>
  );
}

/* =========================================================
 * 工具 3：好生意还是苦生意
 * ========================================================= */
function SorterTool() {
  const [ans, setAns] = useState({});
  const done = Object.keys(ans).length;
  const right = SORTER.filter((it, i) => ans[i] === it.a).length;
  return (
    <ToolFrame
      eyebrow="互动工具 · 商业模式"
      title="好生意，还是苦生意？"
      desc="先凭直觉判断，再看他怎么说。做完后，留意一下是哪一个问题在帮你分拣这些生意。">
      <div className="dd-grid2">
        {SORTER.map((it, i) => {
          const sel = ans[i];
          return (
            <div className="dd-sort" key={it.n}>
              <h4>{it.n}</h4>
              <div className="btns">
                {["good", "bad", "depends"].map((k) => {
                  let cls = "dd-btn-ghost";
                  if (sel !== undefined && k === it.a) cls += " ans-right";
                  else if (sel !== undefined && sel === k) cls += " ans-wrong";
                  return (
                    <button key={k} className={cls} disabled={sel !== undefined}
                      onClick={() => setAns({ ...ans, [i]: k })}>{SORT_LABEL[k]}</button>
                  );
                })}
              </div>
              {sel !== undefined && (
                <p className="res">
                  <b style={{ color: sel === it.a ? "var(--ok)" : "var(--bad)" }}>{sel === it.a ? "一致。" : `他的看法：${SORT_LABEL[it.a]}。`}</b> {it.why} <span className="dd-muted">（{it.d}）</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="dd-verdict warn" style={{ marginTop: 14 }}>
        <b>已判断 {done}/{SORTER.length}，与他一致 {right} 个。</b>{" "}
        {done === SORTER.length
          ? "分拣这些生意，其实只用一个问题：如果别家便宜 5%，用户会不会换走？会换走的，就只剩价格战；不会换走的，才有定价能力，也就是护城河。"
          : "提示：想想“用户会不会因为别家便宜一点就换走”。"}
      </div>
      {done > 0 && <button className="dd-btn-ghost dd-small" style={{ marginTop: 10 }} onClick={() => setAns({})}>重新来一遍</button>}
    </ToolFrame>
  );
}

/* =========================================================
 * 工具 4：三道过滤器
 * ========================================================= */
function FilterTool() {
  const [name, setName] = useState("");
  const [ans, setAns] = useState({});
  const flat = FILTER_Q.flatMap((g, gi) => g.items.map((it, ii) => ({ ...it, key: gi + "-" + ii, gi })));
  const total = flat.length;
  const done = flat.filter((f) => ans[f.key]).length;
  const hasNo = (gi) => flat.some((f) => f.gi === gi && ans[f.key] === "n");
  const anyU = flat.some((f) => ans[f.key] === "u");
  let v = null;
  if (done > 0) {
    if (hasNo(0)) v = { c: "bad", t: "商业模式没过：刮奖刮到“谢”字了，不用再往下刮。“再好的车手也很难开好一辆烂车。”" };
    else if (hasNo(1)) v = { c: "bad", t: "企业文化没过。“怎么选对的公司是能力问题，不选错的公司是是非问题。”好的商业模式没有好文化守护，早晚会守不住。" };
    else if (hasNo(2)) v = { c: "warn", t: "生意和文化也许不错，但价格或者你自己还没准备好：要么等待，要么放下。如果是借了钱，先解决这个问题。" };
    else if (anyU) v = { c: "warn", t: "有“说不清”的地方，就是还不懂。不懂不碰：继续研究，或者干脆放下，“你能看懂的东西就已经能让你足够忙和得到足够回报了”。" };
    else if (done === total) v = { c: "ok", t: "三道过滤器都过了。但记住：投资没有充分条件，这只意味着成功的概率高很多，犯致命错误的概率低很多。" };
    else v = { c: "warn", t: "继续回答剩下的问题。" };
  }
  const opts = [["y", "是"], ["n", "否"], ["u", "说不清"]];
  return (
    <ToolFrame
      eyebrow="互动工具 · 第一章 + 第二章合起来"
      title="买之前的三道过滤器"
      desc="拿一家你正在关注的公司试一试。问题都来自书中他反复问的那些话；过滤器没有权重之说，只要有一个“否”，就不用往下看了。">
      <input className="dd-input" placeholder="公司名（可选）" value={name} onChange={(e) => setName(e.target.value)} />
      {FILTER_Q.map((g, gi) => (
        <div key={gi} style={{ marginTop: 16 }}>
          <div className="dd-sub" style={{ marginTop: 0 }}>{g.g}</div>
          {g.items.map((it, ii) => {
            const k = gi + "-" + ii;
            return (
              <div className="dd-check" key={k}>
                <p>{it.q}<small>{it.s}</small></p>
                <div className="dd-seg">
                  {opts.map(([val, lab]) => (
                    <button key={val} className={ans[k] === val ? val : ""} onClick={() => setAns({ ...ans, [k]: val })}>{lab}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      {v && <div className={"dd-verdict " + v.c}><b>{name ? name + "：" : ""}</b>{v.t}</div>}
      {done > 0 && <button className="dd-btn-ghost dd-small" style={{ marginTop: 10 }} onClick={() => setAns({})}>清空</button>}
    </ToolFrame>
  );
}

/* =========================================================
 * 工具 5：步步高不为清单
 * ========================================================= */
function StopListTool() {
  const [on, setOn] = useState({});
  return (
    <ToolFrame
      eyebrow="互动工具 · 本分"
      title="步步高的不为清单：点开看背后的故事"
      desc="“我们的不做的事情是一个非常长的表，每一个不做的事情都有背后的故事、道理和逻辑的”下面是书中提到的一部分。">
      <div className="dd-grid3">
        {STOPLIST.map((it, i) => (
          <button key={i} className={"dd-flip" + (on[i] ? " on" : "")} onClick={() => setOn({ ...on, [i]: !on[i] })}>
            <b>{it.t}</b>
            {on[i] ? <span>{it.b}<br /><em className="dd-muted" style={{ fontStyle: "normal" }}>（{it.d}）</em></span> : <span className="dd-muted">点击翻开 →</span>}
          </button>
        ))}
      </div>
      <p className="dd-note">
        这些条目可以分成两类：一类是谁都不应该做的（不诚信、赚人便宜）；一类是和自己的使命、愿景相违背的（代工、展会、并购）。你自己的不为清单呢？可以在本章末尾的笔记里写下来。
      </p>
    </ToolFrame>
  );
}

/* =========================================================
 * 工具 6：仓位 = 懂的程度
 * ========================================================= */
function SpectrumTool() {
  const [sel, setSel] = useState(0);
  const it = SPECTRUM[sel];
  return (
    <ToolFrame
      eyebrow="互动工具 · 判例对照"
      title="仓位 = 懂的程度"
      desc="把他点评过的公司按“确定性”排一排，就能看出他下注的方式。条形长度是导读者根据原话做的示意排序，不是他本人打的分。">
      {SPECTRUM.map((s, i) => (
        <button key={s.n} className="dd-spec" onClick={() => setSel(i)} style={sel === i ? { background: "var(--panel2)", borderRadius: 10 } : null}>
          <span className="nm">{s.n}</span>
          <span>
            <span className="tr"><i style={{ width: s.p + "%" }} /></span>
            <span className="tg" style={{ display: "block" }}>{s.tag}</span>
          </span>
        </button>
      ))}
      <div className="dd-map-detail" style={{ marginTop: 14 }}>
        <div className="dd-small dd-muted">{it.n} · {it.tag}</div>
        <p style={{ fontFamily: "var(--serif)", fontSize: 16.5, marginTop: 4 }}>“{it.q}”</p>
        <div className="dd-small dd-muted" style={{ marginTop: 4 }}>{it.d}</div>
      </div>
      <p className="dd-note">“那些买了一点点的不算看懂了，如果真的看懂了却只买了一点点是说不过去的。”（2024-04-21）反过来，没看懂却重仓，就是在赌。</p>
    </ToolFrame>
  );
}

/* =========================================================
 * 工具 7：两种错误
 * ========================================================= */
function ErrorTool() {
  const [ans, setAns] = useState({});
  const done = Object.keys(ans).length;
  const right = ERRORS.filter((e, i) => ans[i] === e.a).length;
  const LAB = { wrong: "做了错的事 → 立刻停", learn: "做事过程中的错 → 学习改进" };
  return (
    <ToolFrame
      eyebrow="互动工具 · 本章最重要的一个区分"
      title="这是哪一种错误？"
      desc="“有很多人分不清楚错的事情和把事情做错，这两个性质是完全不一样的。”分错了类，改进的方向就会完全相反。">
      <div className="dd-stack">
        {ERRORS.map((e, i) => {
          const sel = ans[i];
          return (
            <div className="dd-sort" key={i}>
              <p style={{ fontSize: 15 }}>{i + 1}. {e.s}</p>
              <div className="btns">
                {["wrong", "learn"].map((k) => (
                  <button key={k} className={"dd-btn-ghost" + (sel !== undefined && k === e.a ? " ans-right" : sel !== undefined && sel === k ? " ans-wrong" : "")} disabled={sel !== undefined}
                    onClick={() => setAns({ ...ans, [i]: k })}>{LAB[k]}</button>
                ))}
              </div>
              {sel !== undefined && (
                <p className="res"><b style={{ color: sel === e.a ? "var(--ok)" : "var(--bad)" }}>{sel === e.a ? "对。" : "他会归为：" + LAB[e.a] + "。"}</b> {e.why}</p>
              )}
            </div>
          );
        })}
      </div>
      <div className="dd-verdict warn">
        <b>已判断 {done}/{ERRORS.length}，一致 {right} 个。</b> 第一种错误的处理办法是停下来，把它放进不为清单，“不管多大的代价都是最小的代价”；第二种是学习，它不可避免，也不该因为怕犯这种错就什么都不做。
      </div>
      {done > 0 && <button className="dd-btn-ghost dd-small" style={{ marginTop: 10 }} onClick={() => setAns({})}>重新来一遍</button>}
    </ToolFrame>
  );
}

/* =========================================================
 * 工具 8：时间线
 * ========================================================= */
function TimelineTool() {
  const [open, setOpen] = useState({ 2: true });
  return (
    <ToolFrame
      eyebrow="互动工具 · 一个普通人的来路"
      title="段永平时间线（据书中自述整理）"
      desc="点开每个节点看细节。实心点是转折处。注意这条线上反复出现的动作：发现不对，马上离开。">
      <div className="dd-tl">
        {TIMELINE.map((e, i) => (
          <div key={i} className={"dd-tl-item" + (e.k ? " key" : "")}>
            <button onClick={() => setOpen({ ...open, [i]: !open[i] })} aria-expanded={!!open[i]}>
              <div className="dd-tl-y">{e.y}</div>
              <div className="dd-tl-t">{e.t}</div>
              {open[i] && <div className="dd-tl-d">{e.d}</div>}
            </button>
          </div>
        ))}
      </div>
    </ToolFrame>
  );
}

const TOOLS = {
  payback: PaybackTool,
  leverage: LeverageTool,
  sorter: SorterTool,
  filter: FilterTool,
  stoplist: StopListTool,
  spectrum: SpectrumTool,
  errors: ErrorTool,
  timeline: TimelineTool,
};

/* =========================================================
 * 派生数据
 * ========================================================= */
CHAPTERS.forEach((ch) => ch.sections.forEach((s, i) => { s.id = ch.id + "s" + (i + 1); }));
const ALL_QUOTES = CHAPTERS.flatMap((ch) => ch.sections.flatMap((s) => s.quotes.map((q) => ({ ...q, from: ch.title + " · " + s.title }))));
const TOTAL_SEC = CHAPTERS.reduce((a, c) => a + c.sections.length, 0);
const TOTAL_Q = CHAPTERS.reduce((a, c) => a + c.quiz.length, 0);

function useStored(key, init) {
  const [v, setV] = useState(() => {
    try {
      const s = window.localStorage.getItem(key);
      if (s) return JSON.parse(s);
    } catch (e) { /* 存储不可用时忽略 */ }
    return init;
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* 忽略 */ }
  }, [key, v]);
  return [v, setV];
}

/* =========================================================
 * 首页
 * ========================================================= */
function Home({ go, chPct }) {
  const [node, setNode] = useState("a1");
  const [qi, setQi] = useState(0);
  const nodeObj = MAP.flatMap((c) => c.nodes).find((n) => n.id === node);
  const target = nodeObj && CHAPTERS.find((c) => c.id === nodeObj.go[0]);
  const targetSec = target && target.sections.find((s) => s.id === nodeObj.go[1]);
  const rq = ALL_QUOTES[qi % ALL_QUOTES.length];

  return (
    <div>
      <div className="dd-hero">
        <div className="dd-eyebrow">互动导读 · 5 章 · {TOTAL_SEC} 节 · {TOTAL_Q} 道情境题 · 8 个互动工具</div>
        <h1>一本二十年的碎片问答，<br />底下只有<em>两块基石</em>。</h1>
        <p>《{BOOK.title}》（{BOOK.meta}）{BOOK.span}。它难读的地方不在字面：每句话都一秒能懂，可同一个观点散落在不同年份、不同语境里，很容易记住了金句，却看不见骨架。这份导读按原书章节顺序，把骨架还原出来，再用情境题和小工具检验你是不是真的懂了。</p>
      </div>

      <div className="dd-three">
        {THREE.map((t) => (
          <div key={t.t}>
            <div className="n">{t.n}</div>
            <div className="t">{t.t}</div>
            <div className="d">{t.d}</div>
          </div>
        ))}
      </div>

      <div className="dd-grid2" style={{ marginTop: 14 }}>
        <div className="dd-card">
          <h3 className="dd-h3">这本书难在哪</h3>
          <p className="dd-small" style={{ marginTop: 6, color: "var(--ink2)" }}>
            他自己的说法是“简单但不容易”：原则简单到一秒钟就能看“懂”，可要骨子里相信，得花很多年。“我花20年悟明白的东西也许你需要悟15年，如果你悟的话。”所以只读金句没用，要看这些金句是怎么从同一个起点推出来的。
          </p>
        </div>
        <div className="dd-card">
          <h3 className="dd-h3">这份导读怎么用</h3>
          <ol className="dd-prompts dd-small" style={{ paddingLeft: 18, margin: "6px 0 0" }}>
            <li>先看下面的思想地图，弄清楚三块基石各自推出了什么。</li>
            <li>每章先读“本章要回答的问题”和逻辑链，再逐节展开“拆解、原话与误读”。</li>
            <li>用情境题和工具检验自己；在章末写下自己的答案，进度会自动记录。</li>
          </ol>
        </div>
      </div>

      <div className="dd-sectitle"><h2>思想地图</h2><span>点一个节点，看它从哪来、在哪一章</span></div>
      <div className="dd-map">
        {MAP.map((col) => (
          <div className="dd-map-col" key={col.col}>
            <div className="dd-map-head">
              <small>{col.col} · {col.sub}</small>
              <b>{col.title}</b>
            </div>
            {col.nodes.map((n) => (
              <button key={n.id} className={"dd-map-node" + (node === n.id ? " on" : "")} onClick={() => setNode(n.id)}>{n.t}</button>
            ))}
          </div>
        ))}
      </div>
      {nodeObj && (
        <div className="dd-map-detail">
          <b style={{ fontFamily: "var(--serif)", fontSize: 17 }}>{nodeObj.t}</b>
          <p style={{ marginTop: 6, color: "var(--ink2)" }}>{nodeObj.d}</p>
          {target && (
            <p style={{ marginTop: 8 }}>
              <button className="dd-link" onClick={() => go(target.id, targetSec && targetSec.id)}>
                去读：{target.label} {target.title}{targetSec ? " · " + targetSec.title : ""} →
              </button>
            </p>
          )}
        </div>
      )}
      <p className="dd-note">另外两章的位置：第三章是这些原则在十几家公司上的“判例集”；第五章是他把一切压缩成的三句话。</p>

      <div className="dd-sectitle"><h2>按章节阅读</h2><span>原书五章，顺序不变</span></div>
      <div className="dd-chcards">
        {CHAPTERS.map((c) => (
          <button key={c.id} className="dd-chcard" onClick={() => go(c.id)}>
            <span className="seal">{c.no}</span>
            <span style={{ minWidth: 0 }}>
              <span className="dd-small dd-muted">{c.label} · 进度 {chPct(c)}%</span>
              <h3>{c.title}</h3>
              <p>{c.blurb}</p>
            </span>
          </button>
        ))}
      </div>

      <div className="dd-take">
        <p>“{rq.t}”</p>
        <cite>段永平 · {rq.d} · 见「{rq.from}」</cite>
        <div style={{ marginTop: 12 }}>
          <button className="dd-btn-ghost" onClick={() => setQi(qi + 1 + Math.floor(Math.random() * (ALL_QUOTES.length - 1)))}>换一句</button>{" "}
          <button className="dd-btn" onClick={() => go("c1")}>从第一章开始 →</button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * 章节页
 * ========================================================= */
function Chapter({ ch, idx, open, read, onToggle, answers, onAnswer, onResetQuiz, note, onNote, go }) {
  const prev = idx === 0 ? { id: "home", label: "导读", title: "总纲与思想地图" } : CHAPTERS[idx - 1];
  const next = idx === CHAPTERS.length - 1 ? { id: "end", label: "收尾", title: "读完之后" } : CHAPTERS[idx + 1];
  const chNo = idx + 1;
  return (
    <div>
      <div className="dd-chhead">
        <div className="dd-seal">{ch.no}</div>
        <div>
          <div className="dd-eyebrow">{ch.label} · {ch.kicker}</div>
          <h1>{ch.title}</h1>
        </div>
      </div>

      <div className="dd-question">
        <small>本章要回答的问题</small>
        {ch.question}
      </div>
      <p className="dd-thesis">{ch.thesis}</p>

      <div className="dd-sectitle"><h2>逻辑链</h2><span>先看清骨架，再读细节</span></div>
      <div className="dd-chain">
        {ch.chain.map((c) => (
          <div key={c.h}><b>{c.h}</b><p>{c.t}</p></div>
        ))}
      </div>

      <div className="dd-sectitle"><h2>逐节精读</h2><span>{ch.sections.length} 节 · 点开看拆解、原话与误读</span></div>
      {ch.sections.map((s, i) => {
        const Tool = s.toolAfter ? TOOLS[s.toolAfter] : null;
        return (
          <React.Fragment key={s.id}>
            <Section s={s} idx={i} chNo={chNo} open={!!open[s.id]} isRead={!!read[s.id]} onToggle={() => onToggle(s.id)} />
            {Tool && <Tool />}
          </React.Fragment>
        );
      })}

      <div className="dd-sectitle"><h2>情境检验</h2><span>能用出来，才算懂</span></div>
      <Quiz chId={ch.id} items={ch.quiz} answers={answers} onAnswer={onAnswer} onReset={() => onResetQuiz(ch.id, ch.quiz.length)} />

      <div className="dd-sectitle"><h2>写下来</h2><span>自动保存在这台设备（若浏览器允许）</span></div>
      <div className="dd-card">
        <ul className="dd-prompts">
          {ch.reflect.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
        <textarea className="dd-textarea" placeholder="在这里写你的回答……" value={note || ""} onChange={(e) => onNote(ch.id, e.target.value)} />
      </div>

      <div className="dd-take">
        <p>“{ch.takeaway.t}”</p>
        <cite>段永平 · {ch.takeaway.d} · 本章带走一句话</cite>
      </div>

      <div className="dd-pager">
        <button onClick={() => go(prev.id)}><small>← 上一篇</small><b>{prev.label} {prev.title}</b></button>
        <button onClick={() => go(next.id)}><small>下一篇 →</small><b>{next.label} {next.title}</b></button>
      </div>
    </div>
  );
}

/* =========================================================
 * 收尾页
 * ========================================================= */
function End({ notes, go, pct }) {
  const [copied, setCopied] = useState("");
  const allNotes = CHAPTERS.map((c) => (notes[c.id] ? `【${c.label} ${c.title}】\n${notes[c.id]}` : "")).filter(Boolean).join("\n\n");
  function copy() {
    const text = allNotes || "（还没有笔记）";
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => setCopied("已复制到剪贴板"), () => setCopied("复制失败，请手动选中下方文字复制"));
      } else setCopied("当前环境不支持一键复制，请手动选中下方文字复制");
    } catch (e) { setCopied("复制失败，请手动选中下方文字复制"); }
  }
  return (
    <div>
      <div className="dd-chhead">
        <div className="dd-seal">终</div>
        <div>
          <div className="dd-eyebrow">收尾 · 你的完成度 {pct}%</div>
          <h1>读完之后</h1>
        </div>
      </div>

      <div className="dd-question">
        <small>他自己的检验标准</small>
        “啥时候当你觉得简单版就足够了的时候，你大概就可以了。”（2012-04-06）试着合上导读，用三句话讲出全书。讲得出，就可以了。
      </div>

      <div className="dd-sectitle"><h2>一页纸</h2><span>三块基石推出的十条推论</span></div>
      <div className="dd-card">
        {CHEAT.map((c, i) => (
          <div className="dd-rule" key={i}><span className="n">{i + 1}</span><p>{c}</p></div>
        ))}
      </div>

      <div className="dd-sectitle"><h2>“真懂了”的四个信号</h2><span>全部来自他的原话</span></div>
      <div className="dd-grid2">
        {TESTS.map((t) => (
          <div className="dd-card" key={t.t} style={{ marginTop: 0 }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: 16.5 }}>{t.t}</p>
            <p className="dd-small dd-muted" style={{ marginTop: 4 }}>{t.d}</p>
          </div>
        ))}
      </div>
      <p className="dd-note">把这四条套在你手里的每一项资产、每一个重要决定上，比再读一遍书更有用。</p>

      <div className="dd-sectitle"><h2>术语速查</h2><span>书里频繁出现的词</span></div>
      <div className="dd-card">
        <dl className="dd-gloss" style={{ margin: 0 }}>
          {GLOSSARY.map(([k, v]) => (
            <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>
          ))}
        </dl>
      </div>

      <div className="dd-sectitle"><h2>我的笔记</h2><span>各章“写下来”的汇总</span></div>
      <div className="dd-card">
        <textarea className="dd-textarea" readOnly value={allNotes || "（还没有笔记。每章末尾都有“写下来”。）"} style={{ minHeight: 160 }} />
        <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button className="dd-btn" onClick={copy}>复制全部笔记</button>
          {copied && <span className="dd-small dd-muted">{copied}</span>}
        </div>
      </div>

      <div className="dd-card" style={{ marginTop: 24 }}>
        <h3 className="dd-h3">关于这份导读</h3>
        <p className="dd-small" style={{ marginTop: 6, color: "var(--ink2)" }}>
          引文均摘自书中段永平的原话，日期为原书标注；拆解、结构图、工具和情境题是导读者的整理与推演，帮助理解，但不等于原书。书中提到的公司，只是他在特定时间、为说明理念而举的例子，不构成任何投资建议，这一点原书编者也有专门说明。最后借他的话收尾：“其实巴菲特并没有教我们什么。如果我们本来不懂的话，是没有人可以教会的。”
        </p>
      </div>

      <div className="dd-pager">
        <button onClick={() => go("c5")}><small>← 上一篇</small><b>第五章 演讲与访谈</b></button>
        <button onClick={() => go("home")}><small>回到 →</small><b>导读 · 思想地图</b></button>
      </div>
    </div>
  );
}

/* =========================================================
 * 主组件
 * ========================================================= */
export default function DaDaoGuide() {
  const [view, setView] = useState("home");
  const [open, setOpen] = useState({});
  const [read, setRead] = useStored("dadao-guide-read", {});
  const [answers, setAnswers] = useStored("dadao-guide-quiz", {});
  const [notes, setNotes] = useStored("dadao-guide-notes", {});
  const [theme, setTheme] = useStored("dadao-guide-theme", "auto");
  const pending = useRef(null);
  const topRef = useRef(null);

  const readCount = Object.keys(read).filter((k) => read[k]).length;
  const ansCount = Object.keys(answers).length;
  const pct = Math.min(100, Math.round(((readCount + ansCount) / (TOTAL_SEC + TOTAL_Q)) * 100));

  function chPct(c) {
    const r = c.sections.filter((s) => read[s.id]).length;
    const a = c.quiz.filter((_, i) => answers[c.id + "-" + i] !== undefined).length;
    return Math.round(((r + a) / (c.sections.length + c.quiz.length)) * 100);
  }

  function scrollToId(id) {
    setTimeout(() => {
      try {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (e) { /* 忽略 */ }
    }, 80);
  }

  function go(v, secId) {
    if (secId) {
      setOpen((o) => ({ ...o, [secId]: true }));
      setRead((r) => ({ ...r, [secId]: true }));
      if (v === view) { scrollToId(secId); return; }
      pending.current = secId;
    }
    setView(v);
  }

  useEffect(() => {
    const id = pending.current;
    if (id) { pending.current = null; scrollToId(id); return; }
    try {
      if (topRef.current && topRef.current.scrollIntoView) topRef.current.scrollIntoView({ block: "start" });
      window.scrollTo(0, 0);
    } catch (e) { /* 忽略 */ }
  }, [view]);

  function toggleSec(id) {
    setOpen((o) => ({ ...o, [id]: !o[id] }));
    setRead((r) => (r[id] ? r : { ...r, [id]: true }));
  }
  function answer(k, j) { setAnswers((a) => (a[k] !== undefined ? a : { ...a, [k]: j })); }
  function resetQuiz(chId, n) {
    setAnswers((a) => {
      const b = { ...a };
      for (let i = 0; i < n; i++) delete b[chId + "-" + i];
      return b;
    });
  }
  function setNote(chId, text) { setNotes((n) => ({ ...n, [chId]: text })); }
  function cycleTheme() { setTheme(theme === "auto" ? "light" : theme === "light" ? "dark" : "auto"); }
  const themeLabel = theme === "auto" ? "跟随系统" : theme === "light" ? "浅色" : "深色";

  const navItems = [
    { id: "home", no: "序", t: "导读", s: "总纲 · 思想地图" },
    ...CHAPTERS.map((c) => ({ id: c.id, no: c.no, t: c.title, s: c.label, pct: chPct(c) })),
    { id: "end", no: "终", t: "读完之后", s: "一页纸 · 笔记" },
  ];

  const chIdx = CHAPTERS.findIndex((c) => c.id === view);

  return (
    <div className={"dd-root theme-" + theme}>
      <style>{CSS}</style>
      <div className="dd-shell">
        <aside className="dd-side">
          <div className="dd-brand">
            <div className="dd-brand-seal">道</div>
            <div>
              <div className="dd-brand-t">《大道》互动导读</div>
              <div className="dd-brand-s">段永平投资问答录</div>
            </div>
          </div>
          <div className="dd-prog">
            <div className="dd-prog-row"><span>阅读与测验进度</span><span>{pct}%</span></div>
            <div className="dd-bar"><i style={{ width: pct + "%" }} /></div>
          </div>
          <nav className="dd-nav">
            {navItems.map((n) => (
              <button key={n.id} className={view === n.id ? "on" : ""} onClick={() => go(n.id)}>
                <span className="no">{n.no}</span>
                <span className="lab">{n.t}<small>{n.s}</small></span>
                {n.pct !== undefined && <span className="pct">{n.pct}%</span>}
              </button>
            ))}
          </nav>
          <div className="dd-side-foot">
            <button className="dd-btn-ghost dd-small" onClick={cycleTheme}>主题：{themeLabel}</button>
          </div>
        </aside>

        <main className="dd-main">
          <div className="dd-top">
            <div className="dd-top-row">
              <div className="dd-brand-seal">道</div>
              <div className="dd-top-t">《大道》互动导读 · {pct}%</div>
              <button className="dd-btn-ghost dd-small" onClick={cycleTheme}>{themeLabel}</button>
            </div>
            <div className="dd-chips">
              {navItems.map((n) => (
                <button key={n.id} className={view === n.id ? "on" : ""} onClick={() => go(n.id)}>{n.no} {n.t}</button>
              ))}
            </div>
            <div className="dd-bar"><i style={{ width: pct + "%" }} /></div>
          </div>
          <div className="dd-wrap" ref={topRef}>
            {view === "home" && <Home go={go} chPct={chPct} />}
            {chIdx >= 0 && (
              <Chapter
                key={view}
                ch={CHAPTERS[chIdx]}
                idx={chIdx}
                open={open}
                read={read}
                onToggle={toggleSec}
                answers={answers}
                onAnswer={answer}
                onResetQuiz={resetQuiz}
                note={notes[view]}
                onNote={setNote}
                go={go}
              />
            )}
            {view === "end" && <End notes={notes} go={go} pct={pct} />}
          </div>
        </main>
      </div>
    </div>
  );
}
