# 蒙特卡洛方法 · 互动式强化学习教程

一套可在浏览器中直接把玩的强化学习教程（纯静态 HTML/JS，零依赖），
从蒙特卡洛方法开始，共三章，每章配有互动实验与可运行的编程实践脚本。

## 快速开始

```bash
# 打开网页教程（任选其一）
xdg-open index.html
python3 -m http.server 8000   # 然后访问 http://localhost:8000

# 运行编程实践（需要 numpy、matplotlib）
cd practice
python3 01_mc_prediction.py
python3 02_mc_es.py
python3 03_mc_epsilon_greedy.py
```

## 内容结构

| 章节 | 主题 | 互动实验 | 实践脚本 |
|---|---|---|---|
| ch1.html | 蒙特卡洛预测：均值估计、回报倒带、first/every-visit | 抛硬币大数定律 · 轨迹回报计算器 · 在线估计 V(s) | `01_mc_prediction.py` |
| ch2.html | MC Basic 与 MC Exploring Starts（控制） | 回合长度扫描（复现原书图 5.4）· 子回合分解器 · ES 现场训练 | `02_mc_es.py` |
| ch3.html | MC ε-Greedy 与探索-利用权衡 | ε 概率天平 · 探索足迹（复现图 5.8）· ε-greedy 训练器 · 给探索定价（复现图 5.6/5.7） | `03_mc_epsilon_greedy.py` |

## 文件说明

- `index.html` — 目录与使用说明
- `ch1.html / ch2.html / ch3.html` — 三章正文（互动逻辑内嵌于各页）
- `js/lib.js` — 共享库：5×5 书式网格世界、3×4 回合制网格、动态规划裁判（值迭代/策略评估）、Canvas 渲染与图表
- `css/style.css` — 共享样式
- `practice/` — 编程实践脚本；`grid_world.py` 为环境（复制自 demo 仓库的 `gridWorldGame.py`）

## 素材来源

- 赵世钰《强化学习的数学原理》第 5 章（`../Book-Mathematical-Foundation-of-Reinforcement-Learning/`）——主线脉络、5×5 网格世界及其全部关键实验
- `../Reinforcement_learning_tutorial_with_demo/` 的三个 Monte Carlo notebook——实践代码原型
- 《Easy RL：强化学习教程》第 3 章——部分直觉讲法

## 下一步

学完三章后建议进入时序差分（TD）方法：原书第 7 章，
配合 demo 仓库的 `td_prediction.ipynb`、`SARSA_demo.ipynb`、`q_learning_demo.ipynb`。
