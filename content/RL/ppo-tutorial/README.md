# 近端策略优化 PPO · 互动式强化学习教程

一套可在浏览器中直接把玩的 PPO 教程（纯静态 HTML/JS，零依赖），沿着「策略梯度 → 基线/优势/AC →
重要性采样/信赖域 → 裁剪目标 → GAE/完整算法」的修补链，共 5 章。最后能<strong>在浏览器里从零训练一个会平衡杆子的智能体</strong>。

## 快速开始

```bash
# 网页教程（任选其一）
xdg-open index.html
python3 -m http.server 8000   # 然后访问 http://localhost:8000

# 编程实践（纯 numpy，无需 PyTorch / Gym）
cd practice
python3 01_reinforce.py       # REINFORCE（可开关 reward-to-go / 基线）
python3 02_actor_critic.py    # 优势 Actor-Critic（GAE λ 旋钮）
python3 03_ppo.py             # 完整 PPO（裁剪 + GAE）
```

## 内容结构

| 章节 | 主题 | 互动实验 | 实践脚本 |
|---|---|---|---|
| ch1 | 策略梯度 / REINFORCE | softmax REINFORCE「点赞」· 连续动作高斯策略「学习瞄准」 | `01_reinforce.py` |
| ch2 | 基线·优势·Actor-Critic | 梯度方差直方图（有无基线）· 优势柱状图 · 学习曲线对比 | `01`/`02` |
| ch3 | 重要性采样·信赖域 | IS 方差爆炸 · 代理目标「画饼」与信赖域刹车（TRPO 视角） | — |
| ch4 | 裁剪式目标函数（核心） | 可拖动的裁剪目标图（含梯度掐断区）· 批量 clip fraction 散点 | `03_ppo.py` |
| ch5 | GAE·完整 PPO | GAE λ 偏差-方差旋钮 · **浏览器内实时训练 CartPole**（含裁剪开关） | `03_ppo.py` |

## 文件说明

- `index.html` · `ch1..ch5.html` — 目录与五章正文（互动逻辑内嵌于各页）
- `js/lib.js` — 共享库：图表（折线/散点/直方图）、softmax/高斯辅助、PPO 裁剪目标数学
- `js/ppo.js` — **浏览器内 PPO 引擎**：可复现 RNG、两层 MLP（前向/反向 + Adam）、CartPole、PPO 训练器（裁剪 + GAE）。
  可在 Node 下测试：`node -e "const {PPO}=require('./js/ppo.js'); const p=new PPO({hidden:32}); for(let i=0;i<20;i++)console.log(p.iterate().meanLen)"`
- `css/style.css` — 共享样式（teal 主题）
- `practice/` — 纯 numpy 实践脚本；`rl_common.py` 为公共部件（CartPole + MLP + Adam），与 JS 引擎算法一致

## 关键超参（CartPole，已验证可学到满分 500）

`hidden=32~64, rollout=1024, minibatch=64, epochs=8, lr=2.5e-3, γ=0.99, GAE λ=0.95, clip ε=0.2`。
关掉裁剪或把 epochs 调到很大，会复现训练崩溃——正是裁剪要防的事。

## 参考

- Schulman et al. 2017, *PPO*；2015 *TRPO*；2016 *GAE*。
- Sutton & Barto, *RL: An Introduction* (2e) 第 13 章。
- OpenAI *Spinning Up*；Huang et al. 2022, *The 37 Implementation Details of PPO*；Lilian Weng, *Policy Gradient Algorithms*。
- 《Easy RL：强化学习教程》第 4、5、9 章（中文术语）。CartPole 动力学取自经典 OpenAI Gym。

## 下一步

连续动作 PPO（高斯策略，见 ch1 互动 1-B 思路）→ 控制机械臂/机器人；
或 RLHF（用 PPO 微调大语言模型，奖励来自奖励模型 + 对参考策略的 KL 惩罚，正是本教程第 3、4 章思想的应用）。
姊妹篇见同目录 [`../mc-tutorial`](../mc-tutorial/index.html)（蒙特卡洛方法）。
