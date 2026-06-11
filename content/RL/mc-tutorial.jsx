import React from "react";
import { BookOpen, Code2, ExternalLink, FlaskConical } from "lucide-react";

const staticBase = import.meta.env.DEV
  ? "/content/RL/mc-tutorial/"
  : `${import.meta.env.BASE_URL}RL/mc-tutorial/`;

const chapters = [
  {
    title: "第 1 章",
    name: "蒙特卡洛预测",
    href: "ch1.html",
    desc: "从均值估计、回报倒推和 first/every-visit 开始，在网格世界里估计 V(s)。",
  },
  {
    title: "第 2 章",
    name: "MC Basic 与 Exploring Starts",
    href: "ch2.html",
    desc: "把策略评估推进到控制，观察回合长度、稀疏奖励和探索性出发的作用。",
  },
  {
    title: "第 3 章",
    name: "MC ε-Greedy",
    href: "ch3.html",
    desc: "去掉探索性出发，用软性策略处理探索与利用，并给探索成本定价。",
  },
];

const css = `
.rl-mc-root {
  min-height: calc(100vh - 56px);
  background: #eef0ee;
  color: #1e2329;
  font-family: "Hanken Grotesk", "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
}
.rl-mc-wrap {
  width: min(1120px, calc(100% - 36px));
  margin: 0 auto;
  padding: 28px 0 44px;
}
.rl-mc-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
  gap: 22px;
  align-items: stretch;
  margin-bottom: 22px;
}
.rl-mc-intro {
  background: #fafbfa;
  border: 1px solid #d3d7d3;
  border-radius: 8px;
  padding: 26px;
}
.rl-mc-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #33409a;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.rl-mc-title {
  margin: 0;
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.08;
  letter-spacing: 0;
  color: #1b2026;
}
.rl-mc-lead {
  margin: 14px 0 0;
  max-width: 720px;
  color: #4f5a63;
  font-size: 16px;
  line-height: 1.75;
}
.rl-mc-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}
.rl-mc-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  border-radius: 7px;
  border: 1px solid #1e2329;
  padding: 9px 14px;
  color: #1e2329;
  background: transparent;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}
.rl-mc-btn.primary {
  color: #fff;
  background: #33409a;
  border-color: #33409a;
}
.rl-mc-btn:hover {
  transform: translateY(-1px);
}
.rl-mc-side {
  display: grid;
  gap: 10px;
}
.rl-mc-stat {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fafbfa;
  border: 1px solid #d3d7d3;
  border-radius: 8px;
  padding: 17px;
}
.rl-mc-stat svg {
  flex: 0 0 auto;
  color: #33409a;
  margin-top: 2px;
}
.rl-mc-stat b {
  display: block;
  margin-bottom: 3px;
  color: #1b2026;
  font-size: 15px;
}
.rl-mc-stat span {
  color: #5c6670;
  font-size: 13px;
  line-height: 1.55;
}
.rl-mc-chapters {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 22px;
}
.rl-mc-chapter {
  display: block;
  min-height: 150px;
  background: #fafbfa;
  border: 1px solid #d3d7d3;
  border-radius: 8px;
  padding: 18px;
  color: inherit;
  text-decoration: none;
  transition: border-color 0.16s, transform 0.16s;
}
.rl-mc-chapter:hover {
  border-color: #33409a;
  transform: translateY(-2px);
}
.rl-mc-chapter small {
  display: block;
  margin-bottom: 8px;
  color: #33409a;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
}
.rl-mc-chapter strong {
  display: block;
  margin-bottom: 8px;
  color: #1b2026;
  font-size: 18px;
  line-height: 1.25;
}
.rl-mc-chapter span {
  color: #5c6670;
  font-size: 13.5px;
  line-height: 1.6;
}
.rl-mc-frame {
  overflow: hidden;
  background: #fafbfa;
  border: 1px solid #d3d7d3;
  border-radius: 8px;
}
.rl-mc-frame-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #d3d7d3;
  color: #5c6670;
  font-size: 13px;
}
.rl-mc-frame-head a {
  color: #33409a;
  font-weight: 700;
  text-decoration: none;
}
.rl-mc-iframe {
  display: block;
  width: 100%;
  height: min(820px, calc(100vh - 128px));
  min-height: 620px;
  border: 0;
  background: #fff;
}
@media (max-width: 820px) {
  .rl-mc-wrap {
    width: min(100% - 24px, 1120px);
    padding-top: 18px;
  }
  .rl-mc-hero,
  .rl-mc-chapters {
    grid-template-columns: 1fr;
  }
  .rl-mc-intro {
    padding: 20px;
  }
  .rl-mc-iframe {
    min-height: 560px;
    height: calc(100vh - 120px);
  }
}
`;

function tutorialUrl(file = "index.html") {
  return `${staticBase}${file}`;
}

export default function MonteCarloTutorial() {
  return (
    <div className="rl-mc-root">
      <style>{css}</style>
      <div className="rl-mc-wrap">
        <section className="rl-mc-hero" aria-labelledby="rl-mc-title">
          <div className="rl-mc-intro">
            <div className="rl-mc-kicker">
              <BookOpen size={16} />
              Reinforcement Learning
            </div>
            <h1 id="rl-mc-title" className="rl-mc-title">
              蒙特卡洛方法：从数据中学习
            </h1>
            <p className="rl-mc-lead">
              一套纯静态强化学习教程，共三章，覆盖 MC 预测、MC
              控制、Exploring Starts 与 ε-Greedy。正文页面内置互动实验，
              下方可直接预览，也可以打开独立页面获得完整阅读空间。
            </p>
            <div className="rl-mc-actions">
              <a className="rl-mc-btn primary" href={tutorialUrl()} target="_blank" rel="noreferrer">
                <ExternalLink size={17} />
                打开完整教程
              </a>
              <a className="rl-mc-btn" href={tutorialUrl("README.md")} target="_blank" rel="noreferrer">
                <Code2 size={17} />
                查看实践说明
              </a>
            </div>
          </div>

          <div className="rl-mc-side" aria-label="教程信息">
            <div className="rl-mc-stat">
              <BookOpen size={22} />
              <div>
                <b>3 个章节</b>
                <span>从采样均值到策略改进，再到软性策略探索。</span>
              </div>
            </div>
            <div className="rl-mc-stat">
              <FlaskConical size={22} />
              <div>
                <b>浏览器互动实验</b>
                <span>网格世界、轨迹回报、覆盖率和收敛曲线都可直接操作。</span>
              </div>
            </div>
            <div className="rl-mc-stat">
              <Code2 size={22} />
              <div>
                <b>Python 实践脚本</b>
                <span>包含 MC prediction、MC ES、MC ε-Greedy 三组练习。</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rl-mc-chapters" aria-label="章节入口">
          {chapters.map((chapter) => (
            <a
              className="rl-mc-chapter"
              href={tutorialUrl(chapter.href)}
              target="_blank"
              rel="noreferrer"
              key={chapter.href}
            >
              <small>{chapter.title}</small>
              <strong>{chapter.name}</strong>
              <span>{chapter.desc}</span>
            </a>
          ))}
        </section>

        <section className="rl-mc-frame" aria-label="教程预览">
          <div className="rl-mc-frame-head">
            <span>内嵌预览：蒙特卡洛方法 · 互动式强化学习教程</span>
            <a href={tutorialUrl()} target="_blank" rel="noreferrer">
              新窗口打开
            </a>
          </div>
          <iframe
            className="rl-mc-iframe"
            title="蒙特卡洛方法互动教程"
            src={tutorialUrl()}
          />
        </section>
      </div>
    </div>
  );
}
