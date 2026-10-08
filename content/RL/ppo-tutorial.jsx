import React from "react";
import { BookOpen, Code2, ExternalLink, FlaskConical } from "lucide-react";

const staticBase = import.meta.env.DEV
  ? `${import.meta.env.BASE_URL}content/RL/ppo-tutorial/`
  : `${import.meta.env.BASE_URL}RL/ppo-tutorial/`;

const chapters = [
  {
    title: "第 1 章",
    name: "策略梯度",
    href: "ch1.html",
    desc: "得分函数技巧、策略梯度定理与 REINFORCE，看「好动作被点赞」。",
  },
  {
    title: "第 2 章",
    name: "基线、优势与 Actor-Critic",
    href: "ch2.html",
    desc: "用基线压低方差，用优势函数说清「比平均好多少」，让评论员登场。",
  },
  {
    title: "第 3 章",
    name: "重要性采样与信赖域",
    href: "ch3.html",
    desc: "想重复利用数据，就遇到分布失配；TRPO 用信赖域把步长限住。",
  },
  {
    title: "第 4 章",
    name: "裁剪式目标函数",
    href: "ch4.html",
    desc: "一行 min-clip 近似信赖域。拆开裁剪目标图，看梯度在哪里被掐断。",
  },
  {
    title: "第 5 章",
    name: "GAE 与完整 PPO",
    href: "ch5.html",
    desc: "用 λ 调偏差和方差，再在浏览器里训练 CartPole，并对照关掉裁剪后的崩溃。",
  },
];

const css = `
.rl-ppo-root {
  min-height: calc(100vh - 56px);
  background: #eef0ee;
  color: #1e2329;
  font-family: "Hanken Grotesk", "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
}
.rl-ppo-wrap {
  width: min(1120px, calc(100% - 36px));
  margin: 0 auto;
  padding: 28px 0 44px;
}
.rl-ppo-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
  gap: 22px;
  align-items: stretch;
  margin-bottom: 22px;
}
.rl-ppo-intro {
  background: #fafbfa;
  border: 1px solid #d3d7d3;
  border-radius: 8px;
  padding: 26px;
}
.rl-ppo-kicker {
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
.rl-ppo-title {
  margin: 0;
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.08;
  letter-spacing: 0;
  color: #1b2026;
}
.rl-ppo-lead {
  margin: 14px 0 0;
  max-width: 720px;
  color: #4f5a63;
  font-size: 16px;
  line-height: 1.75;
}
.rl-ppo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}
.rl-ppo-btn {
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
.rl-ppo-btn.primary {
  color: #fff;
  background: #33409a;
  border-color: #33409a;
}
.rl-ppo-btn:hover {
  transform: translateY(-1px);
}
.rl-ppo-side {
  display: grid;
  gap: 10px;
}
.rl-ppo-stat {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fafbfa;
  border: 1px solid #d3d7d3;
  border-radius: 8px;
  padding: 17px;
}
.rl-ppo-stat svg {
  flex: 0 0 auto;
  color: #33409a;
  margin-top: 2px;
}
.rl-ppo-stat b {
  display: block;
  margin-bottom: 3px;
  color: #1b2026;
  font-size: 15px;
}
.rl-ppo-stat span {
  color: #5c6670;
  font-size: 13px;
  line-height: 1.55;
}
.rl-ppo-chapters {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 22px;
}
.rl-ppo-chapter {
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
.rl-ppo-chapter:hover {
  border-color: #33409a;
  transform: translateY(-2px);
}
.rl-ppo-chapter small {
  display: block;
  margin-bottom: 8px;
  color: #33409a;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
}
.rl-ppo-chapter strong {
  display: block;
  margin-bottom: 8px;
  color: #1b2026;
  font-size: 18px;
  line-height: 1.25;
}
.rl-ppo-chapter span {
  color: #5c6670;
  font-size: 13.5px;
  line-height: 1.6;
}
.rl-ppo-frame {
  overflow: hidden;
  background: #fafbfa;
  border: 1px solid #d3d7d3;
  border-radius: 8px;
}
.rl-ppo-frame-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #d3d7d3;
  color: #5c6670;
  font-size: 13px;
}
.rl-ppo-frame-head a {
  color: #33409a;
  font-weight: 700;
  text-decoration: none;
}
.rl-ppo-iframe {
  display: block;
  width: 100%;
  height: min(820px, calc(100vh - 128px));
  min-height: 620px;
  border: 0;
  background: #fff;
}
@media (max-width: 820px) {
  .rl-ppo-wrap {
    width: min(100% - 24px, 1120px);
    padding-top: 18px;
  }
  .rl-ppo-hero,
  .rl-ppo-chapters {
    grid-template-columns: 1fr;
  }
  .rl-ppo-intro {
    padding: 20px;
  }
  .rl-ppo-iframe {
    min-height: 560px;
    height: calc(100vh - 120px);
  }
}
`;

function tutorialUrl(file = "index.html") {
  return `${staticBase}${file}`;
}

export default function PpoTutorial() {
  return (
    <div className="rl-ppo-root">
      <style>{css}</style>
      <div className="rl-ppo-wrap">
        <section className="rl-ppo-hero" aria-labelledby="rl-ppo-title">
          <div className="rl-ppo-intro">
            <div className="rl-ppo-kicker">
              <BookOpen size={16} />
              Reinforcement Learning
            </div>
            <h1 id="rl-ppo-title" className="rl-ppo-title">
              近端策略优化 PPO
            </h1>
            <p className="rl-ppo-lead">
              一套纯静态强化学习教程，共五章，沿着策略梯度、优势
              Actor-Critic、重要性采样、裁剪目标和 GAE 把 PPO
              拼起来。正文内置互动实验，最后可以在浏览器里训练 CartPole。
            </p>
            <div className="rl-ppo-actions">
              <a className="rl-ppo-btn primary" href={tutorialUrl()} target="_blank" rel="noreferrer">
                <ExternalLink size={17} />
                打开完整教程
              </a>
              <a className="rl-ppo-btn" href={tutorialUrl("README.md")} target="_blank" rel="noreferrer">
                <Code2 size={17} />
                查看实践说明
              </a>
            </div>
          </div>

          <div className="rl-ppo-side" aria-label="教程信息">
            <div className="rl-ppo-stat">
              <BookOpen size={22} />
              <div>
                <b>5 个章节</b>
                <span>从 REINFORCE 的方差问题，一步步补到能跑的 PPO。</span>
              </div>
            </div>
            <div className="rl-ppo-stat">
              <FlaskConical size={22} />
              <div>
                <b>浏览器互动实验</b>
                <span>裁剪目标图、GAE 旋钮，以及浏览器内实时训练 CartPole。</span>
              </div>
            </div>
            <div className="rl-ppo-stat">
              <Code2 size={22} />
              <div>
                <b>Python 实践脚本</b>
                <span>纯 numpy 实现 REINFORCE、Actor-Critic 和完整 PPO。</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rl-ppo-chapters" aria-label="章节入口">
          {chapters.map((chapter) => (
            <a
              className="rl-ppo-chapter"
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

        <section className="rl-ppo-frame" aria-label="教程预览">
          <div className="rl-ppo-frame-head">
            <span>内嵌预览：近端策略优化 PPO · 互动式强化学习教程</span>
            <a href={tutorialUrl()} target="_blank" rel="noreferrer">
              新窗口打开
            </a>
          </div>
          <iframe
            className="rl-ppo-iframe"
            title="近端策略优化 PPO 互动教程"
            src={tutorialUrl()}
          />
        </section>
      </div>
    </div>
  );
}
