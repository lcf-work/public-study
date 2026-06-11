# -*- coding: utf-8 -*-
"""第3章实践：MC ε-Greedy（无需探索性出发的蒙特卡洛控制）

出发点固定在 (2,0)，探索完全交给 ε-greedy 软性策略：
以 1-ε 的概率听策略的，以 ε 的概率闭眼乱选。

改编自 Reinforcement_learning_tutorial_with_demo/monte_carlo_epsilon_greedy_demo.ipynb。

用法：python3 03_mc_epsilon_greedy.py
"""
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from grid_world import negative_grid, print_values, print_policy

# ============================ 实验区 ============================
GAMMA = 0.9
EPISODES = 5000
STEP_COST = -0.1
EPS = 0.1          # 探索率。0.5：探索充分但轨迹吵闹；0.01：多跑几次，
                   #   偶尔会学出明显错误的策略——探索不足的随机受害者
EPS_DECAY = False  # True：每回合 ε ← max(0.05, 0.999·ε)，先大胆探索后专心利用
# ===============================================================

ALL_ACTIONS = ('U', 'D', 'L', 'R')


def max_dict(d):
    max_key, max_val = None, float('-inf')
    for k, v in d.items():
        if v > max_val:
            max_key, max_val = k, v
    return max_key, max_val


def epsilon_action(a, eps):
    """ε-greedy 抽样：1-ε 听话，ε 乱选（乱选也可能选中 a）。"""
    if np.random.random() < (1 - eps):
        return a
    return np.random.choice(ALL_ACTIONS)


def play_game(grid, policy, eps):
    """从固定起点出发生成一条回合——注意：没有任何探索性出发！"""
    s = (2, 0)
    grid.set_state(s)
    a = epsilon_action(policy[s], eps)

    states_actions_rewards = [(s, a, 0)]
    while True:
        r = grid.move(a)
        s = grid.current_state()
        if grid.game_over():
            states_actions_rewards.append((s, None, r))
            break
        a = epsilon_action(policy[s], eps)   # 软性策略保证回合必然终止
        states_actions_rewards.append((s, a, r))

    G = 0
    out = []
    first = True
    for s, a, r in reversed(states_actions_rewards):
        if first:
            first = False
        else:
            out.append((s, a, G))
        G = r + GAMMA * G
    out.reverse()
    return out


def main():
    grid = negative_grid(step_cost=STEP_COST)
    print("奖励分布：")
    print_values(grid.rewards, grid)

    policy = {s: np.random.choice(ALL_ACTIONS) for s in grid.actions.keys()}
    Q, returns = {}, {}
    for s in grid.actions.keys():
        Q[s] = {a: 0.0 for a in ALL_ACTIONS}
        for a in ALL_ACTIONS:
            returns[(s, a)] = []

    eps = EPS
    deltas = []
    for t in range(EPISODES):
        biggest_change = 0
        seen_pairs = set()
        for s, a, G in play_game(grid, policy, eps):
            if (s, a) in seen_pairs:
                continue
            seen_pairs.add((s, a))
            old_q = Q[s][a]
            returns[(s, a)].append(G)
            Q[s][a] = np.mean(returns[(s, a)])
            biggest_change = max(biggest_change, abs(old_q - Q[s][a]))
        deltas.append(biggest_change)
        for s in policy.keys():
            policy[s] = max_dict(Q[s])[0]   # 「主见」存贪婪动作，行为时再加 ε
        if EPS_DECAY:
            eps = max(0.05, 0.999 * eps)

    print("\n学到的策略（%d 回合，ε=%s%s，固定从 (2,0) 出发）：" %
          (EPISODES, EPS, "→衰减至%.3f" % eps if EPS_DECAY else ""))
    print_policy(policy, grid)
    V = {s: max_dict(Q[s])[1] for s in policy.keys()}
    print("\n对应的 V(s) = max_a Q(s,a)：")
    print_values(V, grid)

    n_min = min(len(v) for v in returns.values())
    s_min = min(returns, key=lambda k: len(returns[k]))
    print("\n样本最少的 (s,a)：%s，只有 %d 个样本——ε 越小这里越饥饿" % (str(s_min), n_min))

    plt.figure(figsize=(7, 3))
    plt.plot(deltas)
    plt.xlabel('episode'); plt.ylabel('max |ΔQ|'); plt.title('MC ε-Greedy 收敛曲线')
    plt.tight_layout(); plt.savefig('03_deltas.png', dpi=110)
    print("收敛曲线已保存：03_deltas.png")
    print("\n>>> 实验建议：① EPS 改 0.5 / 0.01 各跑几次；② 打开 EPS_DECAY 对比；")
    print(">>> ③ 与 02_mc_es.py（EXPLORING_STARTS=False）对照——同样固定出发点，")
    print(">>>   ES 失灵而 ε-greedy 健在，唯一的本质区别是行为策略是否软性。")


if __name__ == '__main__':
    main()
