import React, { useState } from "react";
import {
  BookOpen, LayoutGrid, ArrowLeftRight, Brain, Layers, Target, Hourglass,
  GraduationCap, FlaskConical, Compass, ArrowLeft, ArrowRight, Sparkles, Check, X, Quote,
} from "lucide-react";

const INK = "#241d12", INK2 = "#6a5d44", LINE = "#d3c6a6", BLUE = "#36567f", BLUE2 = "#4a6b97";
const RED = "#a83d2a", DARK = "#221a10", ONDARK = "#efe7d4", ONDARK2 = "#b8a584", CARD = "#f6f1e2";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=EB+Garamond:wght@400;500;600;700&family=Courier+Prime:wght@400;700&display=swap');
:root{
  --paper:#ece5d2; --paper2:#e2d8bf; --card:#f6f1e2; --ink:#241d12; --ink2:#6a5d44; --line:#d3c6a6;
  --blue:#36567f; --blue2:#4a6b97; --red:#a83d2a; --dark:#221a10; --onDark:#efe7d4; --onDark2:#b8a584;
}
.pc-root{
  --disp:'Libre Caslon Display',Georgia,'Times New Roman',serif;
  --mono:'Courier Prime','Courier New',monospace;
  font-family:'EB Garamond',Georgia,'Times New Roman',serif;
  color:var(--ink); background:var(--paper); font-size:16px;
  background-image:radial-gradient(120% 70% at 50% -8%,rgba(255,255,255,.45),transparent 55%);
  min-height:100%; position:relative; -webkit-font-smoothing:antialiased;
}
.pc-progress{height:3px;background:var(--paper2)}
.pc-progress>i{display:block;height:100%;background:linear-gradient(90deg,var(--blue),var(--red));transition:width .45s ease}
.pc-wrap{max-width:780px;margin:0 auto;padding:16px 18px 124px}
.pc-top{display:flex;align-items:center;gap:8px;color:var(--ink2);font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:14px 2px 8px}
.pc-chips{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 12px;scrollbar-width:none}
.pc-chips::-webkit-scrollbar{display:none}
.pc-chip{flex:0 0 auto;display:flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--card);color:var(--ink2);
  font-family:var(--mono);font-size:11.5px;padding:7px 11px;border-radius:6px;cursor:pointer;white-space:nowrap;transition:.16s}
.pc-chip:hover{border-color:var(--blue)}
.pc-chip.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.pc-tagl{display:inline-flex;align-items:center;gap:7px;font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--blue);margin-bottom:8px}
.pc-h{font-family:var(--disp);font-weight:400;font-size:28px;line-height:1.12;margin:0 0 8px}
.pc-lead{font-size:17px;line-height:1.6;margin:0 0 13px}
.pc-p{font-size:16px;line-height:1.66;color:var(--ink2);margin:0 0 12px}
.pc-mini{font-family:var(--mono);font-size:11px;color:var(--ink2);letter-spacing:.02em;line-height:1.5}
.pc-card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:18px}
.pc-rule{height:1px;background:var(--line);margin:16px 0;border:0}
.pc-anim{animation:pcUp .5s cubic-bezier(.2,.7,.2,1) both}
@keyframes pcUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.pc-btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:13px;border:1px solid var(--ink);
  background:transparent;color:var(--ink);padding:9px 14px;border-radius:6px;cursor:pointer;transition:.16s}
.pc-btn:hover{background:var(--ink);color:var(--paper)}
.pc-btn:disabled{opacity:.32;cursor:not-allowed}.pc-btn:disabled:hover{background:transparent;color:var(--ink)}
.pc-nav{position:sticky;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:10px;
  background:linear-gradient(180deg,rgba(236,229,210,0),var(--paper) 40%);padding:16px 18px;max-width:780px;margin:0 auto}
.pc-pageno{font-family:var(--mono);font-size:12px;color:var(--ink2);letter-spacing:.08em}
/* reality annotation — signature element */
.pc-note{background:rgba(168,61,42,.07);border-left:3px solid var(--red);border-radius:0 10px 10px 0;padding:14px 16px;margin-top:14px}
.pc-notetag{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--red);margin-bottom:7px}
.pc-notep{font-size:15px;line-height:1.6;color:var(--ink);margin:0}
/* cover with lattice */
.pc-cover{background:var(--dark);border-radius:14px;padding:30px 24px 20px;position:relative;overflow:hidden;color:var(--onDark);
  background-image:repeating-linear-gradient(45deg,rgba(184,165,132,.08) 0 1px,transparent 1px 22px),repeating-linear-gradient(-45deg,rgba(184,165,132,.08) 0 1px,transparent 1px 22px)}
.pc-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(184,165,132,.4);color:var(--onDark2);
  font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:5px 11px;border-radius:6px}
/* reveal / verdict */
.pc-rev{margin-top:12px;border-radius:10px;padding:13px 15px;font-size:15px;line-height:1.55;border:1px solid}
.g-good{background:rgba(54,86,127,.08);border-color:rgba(54,86,127,.34);color:#2b456a}
.g-bad{background:rgba(168,61,42,.08);border-color:rgba(168,61,42,.34);color:#8a3122}
.g-neutral{background:var(--paper2);border-color:var(--line);color:var(--ink2)}
/* grid of disciplines */
.pc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
@media(max-width:520px){.pc-grid{grid-template-columns:repeat(3,1fr)}}
.pc-node{border:1px solid var(--line);background:var(--paper);border-radius:8px;padding:10px 6px;text-align:center;cursor:pointer;transition:.15s;font-family:var(--mono);font-size:12px}
.pc-node:hover{border-color:var(--blue)}
.pc-node.on{background:var(--blue);color:#fff;border-color:var(--blue)}
/* tappable cards */
.pc-tap{border:1px solid var(--line);border-radius:9px;padding:13px 15px;cursor:pointer;transition:.15s;background:var(--card);margin-bottom:9px}
.pc-tap:hover{border-color:var(--blue)}
.pc-tap.open{background:rgba(54,86,127,.04);border-color:var(--blue)}
.pc-taprow{display:flex;justify-content:space-between;align-items:center;gap:10px}
.pc-tapt{font-family:var(--disp);font-size:18px;line-height:1.2}
.pc-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.pc-tab{font-family:var(--mono);font-size:12.5px;border:1px solid var(--line);background:var(--card);color:var(--ink2);padding:8px 12px;border-radius:7px;cursor:pointer;transition:.15s}
.pc-tab:hover{border-color:var(--blue)}
.pc-tab.on{background:var(--blue);color:#fff;border-color:var(--blue)}
.pc-opt{display:flex;gap:10px}
.pc-optbtn{flex:1;font-family:var(--mono);font-size:13px;border:1px solid var(--line);background:var(--paper);color:var(--ink);
  padding:10px;border-radius:8px;cursor:pointer;transition:.15s}
.pc-optbtn:hover{border-color:var(--ink)}
.pc-optbtn.sel{background:rgba(54,86,127,.1);border-color:var(--blue);color:#2b456a}
.pc-li{display:flex;gap:11px;padding:8px 0}
.pc-li:before{content:"—";color:var(--red);font-family:var(--mono)}
.pc-bar{display:flex;height:30px;border-radius:7px;overflow:hidden;border:1px solid var(--line);align-items:center}
.pc-stat{font-family:var(--disp);line-height:1}
.pc-slider{display:flex;flex-direction:column;gap:6px}
.pc-slider label{display:flex;justify-content:space-between;font-family:var(--mono);font-size:12px;color:var(--ink2)}
.pc-slider label b{color:var(--ink);font-weight:700}
.pc-range{width:100%;accent-color:var(--blue);height:22px;cursor:pointer}
.pc-badge{flex:0 0 auto;width:26px;height:26px;border-radius:7px;display:grid;place-items:center;background:var(--paper2);color:var(--blue);font-family:var(--mono);font-size:12px}
`;

const yuan = (n) => "¥" + Math.round(n).toLocaleString("zh-CN");

const DISC = [
  { k: "数学", m: "复利 · 概率与期望值 · 排列组合 · 决策树", ex: "用“期望值”而非“会不会发生”来思考下注；复利是穷人最大的盟友。" },
  { k: "物理学", m: "临界质量 · 均衡 · 正反馈", ex: "有些优势达到临界规模后会自我强化，小优势滚成大优势。" },
  { k: "工程学", m: "冗余备份 · 安全边际 · 关键断点", ex: "留足余量，系统才不会因单点失效而崩溃——这就是投资里的安全边际。" },
  { k: "生物学", m: "进化 · 人是被进化塑造的动物", ex: "许多“非理性”其实是远古适应的副产品；理解人性，要从进化看起。" },
  { k: "心理学", m: "~25 种误判倾向（见后两章）", ex: "激励、社会认同、嫉妒在悄悄左右每个人的决策——包括你。" },
  { k: "经济学", m: "规模优势 · 竞争性毁灭 · 专业化分工", ex: "规模与网络效应造就护城河，但新技术也会无情地摧毁旧优势。" },
  { k: "统计学", m: "正态分布 · 均值回归", ex: "极端的好/坏表现往往回归平均——别把一时的运气当成持久的能力。" },
  { k: "会计", m: "复式记账及其局限", ex: "报表是工具，但利润可被操纵；芒格更信真金白银的现金。" },
];

const INV = [
  { goal: "拥有幸福人生", list: ["服用让你上瘾、改变情绪的东西", "放任嫉妒", "沉溺于怨恨与自怜", "言而无信、不可靠", "只从自己的经验学习，不读书、不借鉴他人", "一遇挫折就一蹶不振"] },
  { goal: "投资取得成功", list: ["频繁交易、追涨杀跌", "加杠杆赌博", "在自己的能力圈之外行动", "追逐最热门的故事", "让情绪替你做决定", "无视估值与激励"] },
  { goal: "把一家公司搞垮", list: ["设计错误的激励，奖励短期与造假", "搞个人崇拜，让无人敢说真话", "盲目扩张到不懂的领域", "压榨客户与长期信任", "用会计手法粉饰、掩盖问题", "“拿着锤子”，凡事只用一种模型"] },
];

const BIAS1 = [
  { t: "激励超级反应", d: "“给我看激励，我就告诉你结果。”", ex: "联邦快递把夜班从按小时改成按“完成一班”计酬，准时难题立刻解决。", def: "警惕任何利益相关者给你的建议；先把激励设计对。" },
  { t: "避免不一致（承诺与一致）", d: "一旦公开承诺或形成习惯，大脑就抗拒改变。", ex: "沉没成本、死扛错误、入会仪式让人更“忠诚”。", def: "乐于公开承认错误；主动“杀死你最心爱的观点”。" },
  { t: "社会认同", d: "不确定时，自动模仿周围人的行为。", ex: "股市追涨杀跌，队越长越想排。", def: "别人越疯狂，越要回到独立判断。" },
  { t: "对比错误反应", d: "靠“对比”而非绝对值来判断。", ex: "先看贵的再看次贵的就觉得便宜（销售套路）；温水煮青蛙。", def: "看绝对标准，警惕“相对便宜/相对划算”的话术。" },
  { t: "可得性错误", d: "容易想起的，就以为更重要、更可能。", ex: "被一条新闻吓到；生动个案压过冷冰冰的统计。", def: "回到数据和基础概率（基率）。" },
  { t: "过度自我评价", d: "高估自己，且对自己拥有的东西敝帚自珍（禀赋效应）。", ex: "以为自己选股总能跑赢市场。", def: "用客观记分；主动寻找反方意见。" },
  { t: "过度乐观", d: "人天生过度乐观，顺境时尤甚。", ex: "低估风险，高估自己的计划能按时完成。", def: "用悲观情形和概率来校准。" },
  { t: "怀疑回避", d: "急于消除疑虑，于是草率拍板。", ex: "被推销话术逼着“现在就定”。", def: "重要决定故意放慢，给怀疑留出时间。" },
];

const BIAS2 = [
  { t: "剥夺超级反应", d: "失去（或“差一点得到”）的痛，远大于从未拥有；即损失厌恶。", ex: "赌徒越输越赌；拍卖中为“不输给对手”而疯狂加价。", def: "别为了避免小损失而做大蠢事。" },
  { t: "嫉妒", d: "“驱动世界的不是贪婪，而是嫉妒。”", ex: "看到同事、邻居发财而心态失衡、乱做决定。", def: "别和别人比；就算比了，也别据此行动。" },
  { t: "权威错误影响", d: "盲目服从权威（米尔格拉姆电击实验）。", ex: "因为“专家”或“领导”这么说，就去做明显错误的事。", def: "对权威也要保留独立判断。" },
  { t: "心理否认", d: "现实太痛苦，就干脆拒绝承认。", ex: "不肯止损；否认至亲的成瘾或重病。", def: "强迫自己直面坏消息，越早越好。" },
  { t: "喜欢/讨厌扭曲", d: "喜欢谁就高估他的一切；讨厌谁则相反。", ex: "因为崇拜创始人，就忽视公司明显的问题。", def: "把“对人”和“对事”分开评估。" },
  { t: "压力影响", d: "压力下要么瘫痪、要么冲动，也会被人利用来“突破”你的防线。", ex: "限时秒杀、最后通牒逼你仓促决定。", def: "重大决定别在情绪或压力的峰值时做。" },
  { t: "用进废退", d: "技能和思维模型，不用就会退化。", ex: "学过的多学科知识久不用，关键时刻调不出来。", def: "持续练习、刻意使用多学科思维。" },
];

const LOLLA = [
  { p: "公开拍卖失控加价", f: ["社会认同", "对比错误反应", "剥夺反应（怕输给对手）", "承诺与一致"] },
  { p: "股市泡沫", f: ["社会认同", "过度乐观", "嫉妒（别人都赚了）", "可得性（满屏暴富故事）", "权威（名嘴背书）"] },
  { p: "传销 / 邪教", f: ["社会认同", "承诺与一致", "权威", "互惠", "喜欢/讨厌"] },
];

const CIRCLE_Q = ["你能用一句话说清这家公司怎么赚钱吗？", "它的护城河到底是什么？", "它最大的风险是什么？", "五年后这个行业大概会变成什么样？"];

const VIRT = [
  { t: "远离强烈的意识形态", d: "“意识形态会让人变蠢。”对任何方法（包括“价值投资”）的教条化，都会蒙蔽你看清事实。" },
  { t: "避免嫉妒、怨恨、自怜", d: "这三样是通往痛苦的高速路。把精力放在自己能控制的事上。" },
  { t: "做可靠的人", d: "可靠本身就是一种巨大的竞争优势。守信、按时、说到做到，机会自会找上门。" },
  { t: "当一台学习机器", d: "“每天上床时，比早上更聪明一点。”芒格说，他认识的聪明人没有一个不每天阅读——一个都没有。" },
  { t: "降低预期", d: "对生活保持合理的低预期，反而更幸福、更抗挫。别把“应得”当默认。" },
  { t: "选对榜样、与可信的人共事", d: "和你敬佩、信任的人在一起；远离会拖你下水的人和交易。" },
  { t: "活在能力圈与收入之内", d: "不懂不做，不超出自己的财务能力——这是长期不出局的根本。" },
];

const COLA = [
  { t: "巴甫洛夫条件反射", r: "把品牌反复与快乐、清凉、青春、美好形象绑定，让人一看到就产生好感。" },
  { t: "操作性条件反射", r: "糖＋咖啡因＋冰凉带来即时的生理奖励，促使人不断重复购买。" },
  { t: "社会认同", r: "让产品无处不在、人人都在喝，从众心理推动更多人加入。" },
  { t: "规模与分销优势", r: "极致的铺货与规模，让对手难以企及，成本更低、触达更广。" },
  { t: "强大品牌（无形资产）", r: "品牌带来信任与定价权，成为最深的护城河。" },
  { t: "抢占心智、持续扩张", r: "尽早、尽快占领全球消费者的心智份额，先发优势自我强化。" },
];

const CHAPTERS = [
  { t: "扉页", icon: BookOpen },
  { t: "思维格栅", icon: LayoutGrid },
  { t: "逆向思考", icon: ArrowLeftRight },
  { t: "误判心理(上)", icon: Brain },
  { t: "误判心理(下)·合流", icon: Layers },
  { t: "能力圈·不犯傻", icon: Target },
  { t: "耐心·好生意", icon: Hourglass },
  { t: "学习与处世", icon: GraduationCap },
  { t: "把模型用起来", icon: FlaskConical },
  { t: "要点·别刻舟求剑", icon: Compass },
];

export default function App() {
  const [ch, setCh] = useState(0);
  const [disc, setDisc] = useState(0);
  const [goal, setGoal] = useState(0);
  const [inv, setInv] = useState(false);
  const [o1, setO1] = useState({});
  const [o2, setO2] = useState({});
  const [lol, setLol] = useState(null);
  const [marks, setMarks] = useState({});
  const [yrs, setYrs] = useState(12);
  const [ov, setOv] = useState({});
  const [oc, setOc] = useState({});

  const A = 10000 * Math.pow(1.15, yrs);
  const B = 12000 * Math.pow(1.07, yrs);
  const mx = Math.max(A, B);
  const knowDone = Object.keys(marks).length === CIRCLE_Q.length;
  const knowN = Object.values(marks).filter(v => v === "y").length;

  const total = CHAPTERS.length;

  const catalog = (arr, st, set) => arr.map((b, i) => (
    <div key={i} className={`pc-tap ${st[i] ? "open" : ""}`} onClick={() => set(a => ({ ...a, [i]: !a[i] }))}>
      <div className="pc-taprow"><span className="pc-tapt">{b.t}</span><span className="pc-mini" style={{ color: BLUE }}>{st[i] ? "收起" : "展开 ▸"}</span></div>
      <div className="pc-mini" style={{ color: "var(--ink2)", fontFamily: "EB Garamond,serif", fontSize: 14.5, marginTop: 4 }}>{b.d}</div>
      {st[i] && (
        <div className="pc-anim" style={{ marginTop: 8, fontSize: 14.5, lineHeight: 1.55 }}>
          <div><b style={{ color: RED, fontFamily: "var(--mono)", fontSize: 11 }}>现实例子 </b>{b.ex}</div>
          <div style={{ marginTop: 4 }}><b style={{ color: BLUE, fontFamily: "var(--mono)", fontSize: 11 }}>怎么防御 </b>{b.def}</div>
        </div>
      )}
    </div>
  ));

  const render = () => {
    switch (ch) {
      case 0:
        return (
          <div className="pc-anim">
            <div className="pc-cover">
              <span className="pc-pill"><Sparkles size={13} /> 智慧合集 · 2005</span>
              <h1 style={{ fontFamily: "var(--disp)", fontWeight: 400, fontSize: 38, margin: "16px 0 4px", color: "var(--onDark)", lineHeight: 1.05 }}>穷查理宝典</h1>
              <p className="pc-mini" style={{ color: "var(--onDark2)", fontSize: 12, margin: 0 }}>Poor Charlie's Almanack</p>
              <p style={{ fontFamily: "var(--disp)", color: "var(--onDark)", marginTop: 14, fontSize: 17, lineHeight: 1.5 }}>
                查理·芒格（Charlie Munger, 1924–2023）的演讲与格言<br />彼得·考夫曼 编 · 致敬富兰克林《穷理查年鉴》
              </p>
              <p style={{ color: "var(--onDark2)", fontSize: 14.5, lineHeight: 1.55, marginTop: 12 }}>
                巴菲特一生的搭档、伯克希尔副主席。他不教你公式，教你<b style={{ color: "var(--onDark)" }}>怎么思考</b>。
              </p>
            </div>
            <div className="pc-card" style={{ marginTop: 16 }}>
              <div className="pc-tagl"><Quote size={13} /> 一句话核心</div>
              <p style={{ fontFamily: "var(--disp)", fontStyle: "italic", fontSize: 19, lineHeight: 1.5, borderLeft: "3px solid var(--red)", paddingLeft: 14, margin: "2px 0 12px" }}>
                把多学科的“大模型”织成一张思维格栅，再用“逆向思考”避开愚蠢——靠“持续地不犯傻”，而非“绝顶聪明”，取得长期的巨大优势。
              </p>
              <p className="pc-p" style={{ marginBottom: 0 }}>
                这本书是芒格演讲的合集，不是线性章节。下面 9 章按他思想的主干来组织，几乎每章都能上手玩一玩。
              </p>
            </div>
            <p className="pc-mini" style={{ textAlign: "center", marginTop: 14 }}>点「下一章」开始，或上方目录任意跳转</p>
          </div>
        );

      case 1:
        return (
          <div className="pc-anim">
            <span className="pc-tagl"><LayoutGrid size={13} /> 第 1 章 · 普世智慧</span>
            <h2 className="pc-h">思维格栅：把多学科的大模型织成一张网</h2>
            <p className="pc-lead">芒格的核心主张：掌握各大学科里<b>真正重要的少数模型</b>，编成一张格栅，把经验和事实挂上去。只懂一门，就像“手里只有锤子的人，看什么都像钉子”。点开每个学科看它的大模型：</p>
            <div className="pc-card">
              <div className="pc-grid">
                {DISC.map((d, i) => <button key={i} className={`pc-node ${disc === i ? "on" : ""}`} onClick={() => setDisc(i)}>{d.k}</button>)}
              </div>
              <div className="pc-rev g-neutral pc-anim" key={disc} style={{ marginTop: 12 }}>
                <div className="pc-mini" style={{ color: BLUE, marginBottom: 4 }}>{DISC[disc].k} · 大模型</div>
                <div style={{ fontFamily: "var(--disp)", fontSize: 17, marginBottom: 6 }}>{DISC[disc].m}</div>
                <div style={{ fontSize: 14.5, lineHeight: 1.55 }}>{DISC[disc].ex}</div>
              </div>
            </div>
            <div className="pc-note">
              <div className="pc-notetag"><Compass size={12} /> 今日提醒 · 别刻舟求剑</div>
              <p className="pc-notep">“多学科”不是收藏知识，而是真去用。也别把模型本身变成新的“锤子”——硬把某个模型套到所有事上，同样是芒格批判的蠢。真正的功夫是：手里有很多工具，且知道该用哪一把。</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="pc-anim">
            <span className="pc-tagl"><ArrowLeftRight size={13} /> 第 2 章 · 逆向思考</span>
            <h2 className="pc-h">反过来想，总是反过来想</h2>
            <p className="pc-lead">数学家雅各比的口头禅：“反过来想。”与其问“怎么成功”，先问“怎么<b>必然失败、必然痛苦</b>”，然后坚决避开。芒格那篇著名的哈佛演讲，就是反着教大家“如何过上痛苦的人生”。</p>
            <div className="pc-card">
              <div className="pc-tabs">
                {INV.map((x, i) => <button key={i} className={`pc-tab ${goal === i ? "on" : ""}`} onClick={() => { setGoal(i); setInv(false); }}>想要：{x.goal}</button>)}
              </div>
              {!inv ? (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <div className="pc-mini" style={{ marginBottom: 12 }}>正着想很难、很容易自欺。试试芒格的办法——</div>
                  <button className="pc-btn" onClick={() => setInv(true)}><ArrowLeftRight size={14} /> 反过来想 ▸</button>
                </div>
              ) : (
                <div className="pc-anim">
                  <div className="pc-mini" style={{ color: RED, marginBottom: 8 }}>保证让你“{INV[goal].goal}”失败的做法（→ 坚决避开它们）：</div>
                  {INV[goal].list.map((x, i) => <div className="pc-li" key={i}><span style={{ fontSize: 15 }}>{x}</span></div>)}
                  <div className="pc-rev g-good" style={{ marginTop: 10 }}>把上面这些<b>反过来</b>，你就得到了通往目标的路。芒格：“我只想知道我将死在哪里，这样我就永远不去那里。”</div>
                </div>
              )}
            </div>
            <div className="pc-note">
              <div className="pc-notetag"><Compass size={12} /> 今日提醒</div>
              <p className="pc-notep">逆向思考今天依然好用：做任何重大决定前，先花十分钟写下“怎样会搞砸”，往往比一堆乐观计划更能救你。</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="pc-anim">
            <span className="pc-tagl"><Brain size={13} /> 第 3 章 · 人类误判心理学（上）</span>
            <h2 className="pc-h">让人犯傻的心理倾向（一）</h2>
            <p className="pc-lead">这是全书最长、也最重要的一篇。芒格列出约 25 种导致误判的心理倾向。先看八种最常见的——点开每张看“现实例子”和“怎么防御”：</p>
            <div>{catalog(BIAS1, o1, setO1)}</div>
            <div className="pc-note">
              <div className="pc-notetag"><Compass size={12} /> 今日提醒</div>
              <p className="pc-notep">看清这些倾向，不是为了嘲笑别人，而是为了防住自己——它们对你和对所有人一样起作用。下一章看更多倾向，以及它们叠加时最危险的“合流效应”。</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="pc-anim">
            <span className="pc-tagl"><Layers size={13} /> 第 4 章 · 人类误判心理学（下）</span>
            <h2 className="pc-h">更多倾向，与最危险的“Lollapalooza”</h2>
            <p className="pc-lead">再看七种倾向：</p>
            <div>{catalog(BIAS2, o2, setO2)}</div>
            <div className="pc-card" style={{ marginTop: 6, borderColor: RED }}>
              <div className="pc-tagl" style={{ color: RED }}><Layers size={13} /> Lollapalooza 效应</div>
              <p className="pc-p" style={{ color: "var(--ink)" }}>当<b>多种心理倾向同时朝一个方向叠加</b>，会产生极端、非线性的失控结果。点一个现象，看是哪些力量在合流：</p>
              <div className="pc-tabs">
                {LOLLA.map((x, i) => <button key={i} className={`pc-tab ${lol === i ? "on" : ""}`} onClick={() => setLol(i)}>{x.p}</button>)}
              </div>
              {lol !== null && (
                <div className="pc-rev g-bad pc-anim" key={lol}>
                  正在合流的力量：{LOLLA[lol].f.join(" ＋ ")}。<br />几股力量同向叠加 → <b>极端、非线性的失控</b>，这就是泡沫、狂热、邪教与拍卖失控的根源。
                </div>
              )}
            </div>
            <div className="pc-note">
              <div className="pc-notetag"><Compass size={12} /> 今日提醒</div>
              <p className="pc-notep">芒格主张“两轨分析”：一轨冷静算真实的利弊，另一轨识别正在操纵你潜意识的心理力量。今天的算法推荐、直播带货、币圈狂热，常常就是被刻意设计来触发 Lollapalooza 的——认得出，才躲得开。</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="pc-anim">
            <span className="pc-tagl"><Target size={13} /> 第 5 章 · 能力圈</span>
            <h2 className="pc-h">能力圈，与“持续地不犯傻”</h2>
            <p className="pc-lead">芒格：“知道自己不知道什么，比聪明更有用。”能力圈<b>多大不重要，知道它的边界才重要</b>。我们靠“持续地不犯傻”，而非“非常聪明”，取得了惊人的长期优势。先自测一只你想买的股票：</p>
            <div className="pc-card">
              {CIRCLE_Q.map((q, i) => (
                <div key={i} style={{ padding: "9px 0", borderBottom: i < CIRCLE_Q.length - 1 ? "1px dashed var(--line)" : "none" }}>
                  <div style={{ fontSize: 15, marginBottom: 8 }}>{i + 1}. {q}</div>
                  <div className="pc-opt">
                    <button className={`pc-optbtn ${marks[i] === "y" ? "sel" : ""}`} onClick={() => setMarks(a => ({ ...a, [i]: "y" }))}>说得清</button>
                    <button className={`pc-optbtn ${marks[i] === "n" ? "sel" : ""}`} onClick={() => setMarks(a => ({ ...a, [i]: "n" }))}>说不清</button>
                  </div>
                </div>
              ))}
              {knowDone && (
                <div className={`pc-rev ${knowN >= 3 ? "g-good" : "g-bad"} pc-anim`} style={{ marginTop: 12 }}>
                  {knowN >= 3
                    ? `四题答对 ${knowN} 题——大致在你的能力圈内，可以继续深入研究。`
                    : `只说清 ${knowN} 题——更可能在圈外。芒格会说：放进“太难”的篮子，跳过。不懂不做，毫不丢人。`}
                </div>
              )}
            </div>
            <div className="pc-note">
              <div className="pc-notetag"><Compass size={12} /> 今日提醒</div>
              <p className="pc-notep">芒格有个“太难”篮子：绝大多数机会都该被扔进去。今天热点轮换更快、看似“都懂一点”，更要诚实划清边界——你不必对每件事都有观点。</p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="pc-anim">
            <span className="pc-tagl"><Hourglass size={13} /> 第 6 章 · 耐心与好生意</span>
            <h2 className="pc-h">大钱在等待里，好生意胜过便宜货</h2>
            <p className="pc-lead">芒格：“大钱不在买进卖出，而在<b>等待</b>。”极度耐心地等，等到机会极度有利时再果断重仓——“天上下金子时，要用桶接，而不是用顶针。”他还把巴菲特从格雷厄姆的“捡烟蒂”，推向<b>“以合理价格买伟大公司”</b>。</p>
            <div className="pc-card">
              <div className="pc-mini" style={{ marginBottom: 10 }}>各投 ¥10000：A＝伟大公司（内在回报约 15%/年），B＝当时更“便宜”的平庸公司（约 7%/年，起步多给你 20% 的账面）。拉动年数看看：</div>
              <div className="pc-slider"><label>持有年数 <b className="pc-num" style={{ fontFamily: "var(--mono)" }}>{yrs} 年</b></label>
                <input className="pc-range" type="range" min="1" max="25" step="1" value={yrs} onChange={e => setYrs(+e.target.value)} /></div>
              <div style={{ marginTop: 14 }}>
                <div className="pc-mini" style={{ display: "flex", justifyContent: "space-between" }}><span>A · 伟大公司</span><b style={{ color: BLUE, fontFamily: "var(--mono)" }}>{yuan(A)}</b></div>
                <div className="pc-bar" style={{ marginTop: 4 }}><div style={{ width: `${A / mx * 100}%`, background: BLUE, height: "100%" }} /></div>
                <div className="pc-mini" style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}><span>B · 便宜的平庸公司</span><b style={{ color: INK2, fontFamily: "var(--mono)" }}>{yuan(B)}</b></div>
                <div className="pc-bar" style={{ marginTop: 4 }}><div style={{ width: `${B / mx * 100}%`, background: "#9c8a66", height: "100%" }} /></div>
              </div>
              <div className={`pc-rev ${A >= B ? "g-good" : "g-neutral"}`} style={{ marginTop: 12 }}>
                {A >= B
                  ? `好生意已反超并领先约 ${yuan(A - B)}。便宜的烂公司起步占点便宜，但伟大公司靠高资本回报，长期把它远远甩开——这正是芒格让巴菲特改变的地方。`
                  : `头几年里，便宜带来的折扣仍占优；但再多等几年，高回报的伟大公司就会反超。`}
              </div>
            </div>
            <div className="pc-note">
              <div className="pc-notetag"><Compass size={12} /> 今日提醒</div>
              <p className="pc-notep">“伟大公司”不是永恒标签——护城河会被技术和时代侵蚀（参见 Dorsey）。耐心也不等于死守：要等的是“被错误定价的好机会”，而不是无脑长期持有任何东西。</p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="pc-anim">
            <span className="pc-tagl"><GraduationCap size={13} /> 第 7 章 · 学习与处世</span>
            <h2 className="pc-h">做一台学习机器，修炼世俗智慧</h2>
            <p className="pc-lead">芒格的人生哲学朴素而有力。点开每条看他的意思：</p>
            <div>{VIRT.map((v, i) => (
              <div key={i} className={`pc-tap ${ov[i] ? "open" : ""}`} onClick={() => setOv(a => ({ ...a, [i]: !a[i] }))}>
                <div className="pc-taprow"><span className="pc-tapt">{v.t}</span><span className="pc-mini" style={{ color: BLUE }}>{ov[i] ? "收起" : "展开 ▸"}</span></div>
                {ov[i] && <div className="pc-anim" style={{ marginTop: 6, fontSize: 15, lineHeight: 1.6 }}>{v.d}</div>}
              </div>
            ))}</div>
            <div className="pc-note">
              <div className="pc-notetag"><Compass size={12} /> 今日提醒</div>
              <p className="pc-notep">“终身阅读、避免意识形态”比任何具体建议都更耐用。但要读得杂、读得新——别只读印证自己观点的东西，那又会把你变回“拿着锤子的人”。</p>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="pc-anim">
            <span className="pc-tagl"><FlaskConical size={13} /> 第 8 章 · 把模型用起来</span>
            <h2 className="pc-h">思想实验：用模型“造出”可口可乐</h2>
            <p className="pc-lead">在《关于现实思维的现实思考？》里，芒格设想：1884 年，投资人 Glotz 只有 200 万美元，却要造出一个未来价值约 2 万亿美元的饮料帝国。他说——只靠组合各学科的“大模型”，就能想清楚怎么做到。点开每张牌看它的作用：</p>
            <div>{COLA.map((c, i) => (
              <div key={i} className={`pc-tap ${oc[i] ? "open" : ""}`} onClick={() => setOc(a => ({ ...a, [i]: !a[i] }))}>
                <div className="pc-taprow"><span className="pc-tapt">{c.t}</span><span className="pc-mini" style={{ color: BLUE }}>{oc[i] ? "收起" : "展开 ▸"}</span></div>
                {oc[i] && <div className="pc-anim" style={{ marginTop: 6, fontSize: 15, lineHeight: 1.6 }}>{c.r}</div>}
              </div>
            ))}</div>
            <div className="pc-note">
              <div className="pc-notetag"><Compass size={12} /> 今日提醒 · 多学科的力量</div>
              <p className="pc-notep">芒格也借此批评学院派经济学的“物理学嫉妒”——只想要像物理一样精确的公式，却无视心理学等其他学科，陷入“拿锤子”综合症。他甚至在 2000 年写了篇《2003 年金融大丑闻》的预言式讽刺，准确预见了财务造假的爆发（安然等随后应验）。这就是多学科思维的远见。</p>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="pc-anim">
            <span className="pc-tagl"><Compass size={13} /> 第 9 章 · 要点与现实提醒</span>
            <h2 className="pc-h">带走什么，又别把什么当圣旨</h2>
            <div className="pc-card" style={{ marginBottom: 14 }}>
              <div className="pc-tagl"><Sparkles size={13} /> 全书主干一句话回顾</div>
              <p className="pc-p" style={{ marginBottom: 0, color: "var(--ink)" }}>
                思维格栅（多学科）→ 逆向思考 → 看清人类误判心理（尤其 Lollapalooza 合流）→ 用对激励 → 守住能力圈、持续不犯傻 → 极度耐心、机会极佳时重仓、买伟大公司 → 终身学习、远离意识形态与嫉妒。
              </p>
            </div>
            <div className="pc-note">
              <div className="pc-notetag"><Compass size={12} /> 现实提醒 · 别刻舟求剑</div>
              <p className="pc-notep" style={{ marginBottom: 10 }}>
                芒格已于 <b>2023 年 11 月辞世，享年 99 岁</b>。这本书是他思想的结晶，但不是教条——
              </p>
              <div className="pc-li" style={{ alignItems: "flex-start" }}><span style={{ fontSize: 15, lineHeight: 1.55 }}>书里的案例（可口可乐、喜诗糖果、上世纪的市场）是时代产物；<b>原理永恒，具体标的与估值环境（利率、科技变迁）要按今天判断</b>。</span></div>
              <div className="pc-li" style={{ alignItems: "flex-start" }}><span style={{ fontSize: 15, lineHeight: 1.55 }}>芒格本人也在<b>进化</b>：早年对科技保守，晚年却通过<b>比亚迪</b>与<b>苹果</b>拥抱了优秀科技企业——这正是“按事实改变看法、绝不刻舟求剑”的示范。</span></div>
              <div className="pc-li" style={{ alignItems: "flex-start" }}><span style={{ fontSize: 15, lineHeight: 1.55 }}>别把那 ~25 条心理清单背成死教条到处硬套，也别把他某句话、某个持仓奉为圣旨。<b>要学的是他思考的方法，而不是答案本身</b>。</span></div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="pc-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pc-progress"><i style={{ width: `${(ch / (total - 1)) * 100}%` }} /></div>
      <div className="pc-wrap">
        <div className="pc-top"><BookOpen size={14} /> 穷查理宝典 · 互动导读</div>
        <div className="pc-chips">
          {CHAPTERS.map((c, i) => { const Ic = c.icon; return (
            <button key={i} className={`pc-chip ${i === ch ? "on" : ""}`} onClick={() => setCh(i)}><Ic size={13} /> {i}. {c.t}</button>
          ); })}
        </div>
        {render()}
      </div>
      <div className="pc-nav">
        <button className="pc-btn" disabled={ch === 0} onClick={() => setCh(c => Math.max(0, c - 1))}><ArrowLeft size={14} /> 上一章</button>
        <span className="pc-pageno">{ch + 1} / {total}</span>
        <button className="pc-btn" disabled={ch === total - 1} onClick={() => setCh(c => Math.min(total - 1, c + 1))}>下一章 <ArrowRight size={14} /></button>
      </div>
    </div>
  );
}
