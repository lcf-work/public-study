import React, { useState } from "react";

const C = {
  bg: "#16110b",
  bg2: "#1d160e",
  card: "#241b11",
  cardShang: "#26160f",
  gold: "#c9a35e",
  goldBright: "#ecd6a3",
  goldSoft: "#b89466",
  text: "#e9dcc2",
  muted: "#a08a68",
  cinnabar: "#c24b39",
  cinnabarSoft: "#dd9281",
  jade: "#8fb29a",
  line: "#3a2c1c",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600;700;900&display=swap');
* { box-sizing: border-box; }
.zg-root {
  font-family: "Noto Serif SC", "Songti SC", "STSong", "SimSun", serif;
  background:
    radial-gradient(120% 80% at 50% -10%, #2a2014 0%, ${C.bg2} 45%, ${C.bg} 100%);
  color: ${C.text};
  min-height: 100vh;
  padding: 40px 18px 60px;
  -webkit-font-smoothing: antialiased;
  line-height: 1.7;
}
.zg-wrap { max-width: 920px; margin: 0 auto; }
.fade { opacity: 0; transform: translateY(16px); animation: zgUp .9s cubic-bezier(.16,.84,.44,1) forwards; }
@keyframes zgUp { to { opacity: 1; transform: none; } }

.zg-seal {
  width: 64px; height: 64px; border-radius: 8px;
  background: ${C.cinnabar};
  display: flex; align-items: center; justify-content: center;
  color: #f4e7cf; font-size: 34px; font-weight: 900;
  box-shadow: 0 6px 22px rgba(194,75,57,.35), inset 0 0 0 2px rgba(244,231,207,.35);
  margin: 0 auto 22px;
  letter-spacing: -2px;
}
.zg-title { text-align: center; font-size: clamp(34px, 7vw, 54px); font-weight: 900; letter-spacing: 6px; color: ${C.goldBright}; margin: 0; }
.zg-sub { text-align: center; color: ${C.muted}; margin: 10px 0 0; letter-spacing: 2px; font-size: 14px; }
.zg-epi {
  text-align: center; margin: 26px auto 0; max-width: 560px;
  font-size: clamp(18px, 4vw, 24px); color: ${C.gold}; letter-spacing: 3px; font-weight: 600;
}
.zg-epi small { display: block; font-size: 12px; color: ${C.muted}; letter-spacing: 1px; margin-top: 8px; font-weight: 400; }

.zg-rule { display: flex; align-items: center; gap: 16px; margin: 52px 0 26px; }
.zg-rule:before, .zg-rule:after { content: ""; height: 1px; flex: 1; background: linear-gradient(90deg, transparent, ${C.line}, transparent); }
.zg-rule span { color: ${C.goldBright}; font-size: 20px; font-weight: 700; letter-spacing: 4px; white-space: nowrap; }

.zg-note { color: ${C.muted}; font-size: 13.5px; text-align: center; margin: -8px auto 24px; max-width: 640px; }

.zg-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
.zg-group-h { font-size: 14px; letter-spacing: 3px; margin: 24px 0 4px; font-weight: 700; }
.zg-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }

.zg-card {
  background: ${C.card};
  border: 1px solid ${C.line};
  border-radius: 12px; padding: 16px 16px 14px;
  position: relative; transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
}
.zg-card:hover { transform: translateY(-3px); border-color: ${C.goldSoft}; box-shadow: 0 10px 30px rgba(0,0,0,.4); }
.zg-card.shang { background: ${C.cardShang}; }
.zg-card.hero { box-shadow: inset 0 0 0 1px ${C.goldSoft}, 0 8px 26px rgba(201,163,94,.12); border-color: ${C.goldSoft}; }
.zg-name { font-size: 21px; font-weight: 700; color: ${C.goldBright}; }
.zg-name .zi { font-size: 13px; color: ${C.muted}; font-weight: 400; margin-left: 8px; }
.zg-role { font-size: 12.5px; color: ${C.gold}; letter-spacing: 1px; margin: 2px 0 8px; }
.zg-desc { font-size: 13.5px; color: ${C.text}; opacity: .92; }
.zg-badge {
  display: inline-block; margin-top: 11px; font-size: 12px; font-weight: 700;
  padding: 3px 11px; border-radius: 20px; letter-spacing: 1px;
}

.zg-tl { position: relative; margin-top: 8px; padding-left: 8px; }
.zg-tl:before { content: ""; position: absolute; left: 15px; top: 6px; bottom: 6px; width: 2px;
  background: linear-gradient(${C.gold}, ${C.line}); }
.zg-item { position: relative; padding: 0 0 24px 44px; cursor: default; }
.zg-dot { position: absolute; left: 7px; top: 4px; width: 18px; height: 18px; border-radius: 50%;
  border: 3px solid ${C.bg}; box-shadow: 0 0 0 1px rgba(255,255,255,.06); }
.zg-year { font-size: 12.5px; color: ${C.muted}; letter-spacing: 1.5px; }
.zg-h { font-size: 18px; font-weight: 700; color: ${C.goldBright}; margin: 1px 0 5px; }
.zg-b { font-size: 14px; color: ${C.text}; opacity: .9; }

.zg-coffer {
  margin-top: 14px; border-radius: 14px; padding: 24px 22px;
  background: linear-gradient(135deg, #2a1c12, #1f1610);
  border: 1px solid ${C.goldSoft};
  position: relative; overflow: hidden;
}
.zg-coffer h4 { margin: 0 0 4px; color: ${C.goldBright}; font-size: 19px; letter-spacing: 2px; font-weight: 700; }
.zg-coffer .tag { color: ${C.cinnabarSoft}; font-size: 12px; letter-spacing: 2px; }
.zg-coffer p { font-size: 14.5px; margin: 12px 0 0; color: ${C.text}; opacity: .94; }
.zg-coffer .pun { color: ${C.jade}; font-weight: 600; }

.zg-foot { text-align: center; color: ${C.muted}; font-size: 12px; margin-top: 40px; letter-spacing: .5px; line-height: 1.8; }
`;

const zhouCore = [
  { name: "周文王", zi: "姬昌", role: "翦商奠基者", desc: "积累周邦实力、开创伐商大业，但未及伐纣即崩。", fate: "奠基", tone: "gold" },
  { name: "周武王", zi: "姬发", role: "文王之子", desc: "牧野一战克商灭殷；克殷后约二三年病逝。", fate: "克商", tone: "gold" },
  { name: "周公旦", zi: "姬旦", role: "武王之弟 · 本篇主角", desc: "摄政辅幼主、东征平叛、营洛邑、制礼作乐，七年后还政。", fate: "摄政·还政", tone: "hero", hero: true },
  { name: "周成王", zi: "姬诵", role: "武王之子", desc: "继位时年幼，由周公摄政；亲政后开“成康之治”。", fate: "幼主", tone: "gold" },
  { name: "召公奭", zi: "—", role: "宗室重臣", desc: "与周公“分陕而治”，是辅佐成王、稳定政局的另一支柱。", fate: "辅政", tone: "gold" },
];

const sanjian = [
  { name: "管叔鲜", role: "武王之弟 · 三监之一", desc: "散布“周公将不利于孺子（成王）”的流言，联合武庚起兵。", fate: "被诛" },
  { name: "蔡叔度", role: "武王之弟 · 三监之一", desc: "参与叛乱。", fate: "被流放" },
  { name: "霍叔处", role: "武王之弟 · 三监之一", desc: "卷入其中。", fate: "废为庶人" },
];

const shang = [
  { name: "帝辛（纣王）", role: "商之末代王", desc: "牧野兵败，登鹿台自焚而死。", fate: "亡国" },
  { name: "武庚（禄父）", role: "纣王之子", desc: "受封统领殷遗民——是被监管的旧族首领，并非周廷重臣；后举兵反周。", fate: "兵败被杀" },
  { name: "微子启", role: "纣王庶兄 · 贤者", desc: "周公平叛后受封于宋，延续殷商宗祀（宋国由此而来）。", fate: "受封于宋" },
];

const timeline = [
  { year: "约前1046", title: "牧野之战 · 商亡", body: "武王伐纣，商朝覆灭。但此时周只是击溃了商，并未完成对广大东方的实质控制。", color: C.cinnabar },
  { year: "约前1043", title: "武王崩 · 周公摄政", body: "克殷后约二三年，武王病逝。成王年幼，周公旦摄行天子之政。", color: C.goldSoft },
  { year: "约前1042–前1039", title: "三监之乱 · 周公东征", body: "管叔、蔡叔联合武庚及东方夷族起兵；周公东征约三年，诛武庚与管叔、流放蔡叔，真正平定东方。", color: C.cinnabar },
  { year: "平叛之后", title: "封建天下 · 制礼作乐", body: "营建洛邑（成周）为东都、迁殷遗民、大封同姓功臣、封微子于宋续殷祀，并奠定礼乐制度——周至此才成为名副其实的天下共主。", color: C.gold },
  { year: "摄政第七年", title: "还政成王", body: "成王长成，周公将大权交还，重归臣位。这正是他被后世奉为典范的关键一笔。", color: C.jade },
  { year: "其后", title: "周公卒 · 葬于毕", body: "周公病逝。成王不以臣礼相葬，将其葬于毕（近文王、武王陵），“以示不敢臣周公”。", color: C.goldSoft },
];

function badgeStyle(fate) {
  const bad = ["被诛", "被流放", "废为庶人", "兵败被杀", "亡国"];
  if (bad.includes(fate)) return { color: "#3a1410", background: C.cinnabarSoft };
  if (fate.includes("还政")) return { color: "#13251a", background: C.jade };
  if (fate === "受封于宋") return { color: "#13251a", background: C.jade };
  return { color: "#241b11", background: C.gold };
}

function Card({ p, shang: isShang, i }) {
  return (
    <div className={`zg-card fade ${isShang ? "shang" : ""} ${p.hero ? "hero" : ""}`} style={{ animationDelay: `${0.05 * i}s` }}>
      <div className="zg-name">{p.name}{p.zi && p.zi !== "—" ? <span className="zi">{p.zi}</span> : null}</div>
      <div className="zg-role">{p.role}</div>
      <div className="zg-desc">{p.desc}</div>
      <span className="zg-badge" style={badgeStyle(p.fate)}>{p.fate}</span>
    </div>
  );
}

export default function App() {
  return (
    <div className="zg-root">
      <style>{css}</style>
      <div className="zg-wrap">
        <div className="fade">
          <div className="zg-seal">周</div>
          <h1 className="zg-title">周公辅政</h1>
          <p className="zg-sub">武 王 克 殷 · 摄 政 平 叛 · 还 政 成 王</p>
          <p className="zg-epi">
            周公吐哺，天下归心
            <small>—— 曹操《短歌行》借周公以喻求贤之心</small>
          </p>
        </div>

        <div className="zg-rule fade" style={{ animationDelay: ".1s" }}><span>人 物 谱</span></div>
        <p className="zg-note fade" style={{ animationDelay: ".12s" }}>
          关系一览：文王生武王、周公、管叔、蔡叔、霍叔等；武王生成王。武庚则是商纣王之子。
        </p>

        <div className="zg-group-h" style={{ color: C.gold }}>周王室核心</div>
        <div className="zg-cards">
          {zhouCore.map((p, i) => <Card key={p.name} p={p} i={i} />)}
        </div>

        <div className="zg-group-h" style={{ color: C.cinnabarSoft }}>三监 · 后起兵叛乱</div>
        <div className="zg-cards">
          {sanjian.map((p, i) => <Card key={p.name} p={p} i={i} />)}
        </div>

        <div className="zg-group-h" style={{ color: C.cinnabarSoft }}>殷商遗族</div>
        <div className="zg-cards">
          {shang.map((p, i) => <Card key={p.name} p={p} shang i={i} />)}
        </div>

        <div className="zg-rule fade"><span>大 事 年 表</span></div>
        <p className="zg-note">下列年份多采“夏商周断代工程”推定，学界尚有不同说法，仅作大致框架参考。</p>
        <div className="zg-tl">
          {timeline.map((t, i) => (
            <div className="zg-item fade" key={t.title} style={{ animationDelay: `${0.06 * i}s` }}>
              <span className="zg-dot" style={{ background: t.color }} />
              <div className="zg-year">{t.year}</div>
              <div className="zg-h">{t.title}</div>
              <div className="zg-b">{t.body}</div>
            </div>
          ))}
        </div>

        <div className="zg-rule fade"><span>关 键 转 折 · 金 縢</span></div>
        <div className="zg-coffer fade">
          <span className="tag">周公与成王之间</span>
          <h4>启金縢之书，疑忌冰释</h4>
          <p>
            当年武王重病，周公曾向先王祷告、愿以己身代死，祝册被封藏于金縢之匮。摄政期间流言四起，成王一度对周公心生疑忌。后逢天降雷风、禾稼尽偃，成王开启金縢之书，方知周公当年代死之诚，感泣而迎周公归。
          </p>
          <p className="pun">
            ——所以周公与成王之间的权力过渡，最终是以这场和解收场的，并非刀兵相向；真正动用武力的，是平定武庚与管蔡的那场东征。
          </p>
        </div>

        <div className="zg-foot fade">
          主要依据《史记·周本纪》《史记·鲁周公世家》及《尚书》（金縢、大诰、多士等篇）。<br />
          年代为约数，学界存在争议。
        </div>
      </div>
    </div>
  );
}
