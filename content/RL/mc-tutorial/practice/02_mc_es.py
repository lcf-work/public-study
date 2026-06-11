# -*- coding: utf-8 -*-
"""第2章实践：MC Exploring Starts（蒙特卡洛控制）

不碰模型，从随机策略出发，靠「探索性出发 + 采样平均估 Q + 贪婪改进」
学出最优策略。每走一步都付出 STEP_COST 的代价，逼智能体权衡。

改编自 Reinforcement_learning_tutorial_with_demo/monte_carlo_es_demo.ipynb。

用法：python3 02_mc_es.py
"""
import numpy as np
import matplotlib
matplotlib.use('Agg')  # 无图形界面也能保存图片
import matplotlib.pyplot as plt
from grid_world import negative_grid, print_values, print_policy

# ============================ 实验区 ============================
GAMMA = 0.9
EPISODES = 2000
STEP_COST = -0.9         # 每走一步的代价（负奖励）。
                         #   -0.9：急性子世界，宁可冲向 -1 出口也不绕路（早死早超生）
                         #   -0.1：从容世界，愿意绕路去 +1
EXPLORING_STARTS = True  # False = 永远从 (2,0) 出发、首个动作也不随机。
                         #   关掉后跑几次：部分状态的策略明显学错——探索性出发的命门
# ===============================================================

ALL_ACTIONS = ('U', 'D', 'L', 'R')


def max_dict(d):
    """返回字典中 (最大值对应的键, 最大值)。"""
    max_key, max_val = None, float('-inf')
    for k, v in d.items():
        if v > max_val:
            max_key, max_val = k, v
    return max_key, max_val


def play_game(grid, policy):
    """生成一条回合，返回 [(s, a, G), ...]。

    探索性出发：起始状态随机、首个动作随机——保证每个 (s,a) 都可能开局。
    """
    if EXPLORING_STARTS:
        starts = list(grid.actions.keys())
        grid.set_state(starts[np.random.randint(len(starts))])
        s = grid.current_state()
        a = np.random.choice(ALL_ACTIONS)       # 首个动作完全随机
    else:
        grid.set_state((2, 0))                  # 固定出发点
        s = grid.current_state()
        a = policy[s]                           # 首个动作也听策略的

    states_actions_rewards = [(s, a, 0)]
    seen = {s}
    num_steps = 0
    while True:
        r = grid.move(a)
        num_steps += 1
        s = grid.current_state()
        if s in seen:
            # 确定性贪婪策略很容易在两个状态间打转、永不终止。
            # 这里粗暴截断并给一笔大额罚款，让「打转」在 Q 值上显得很糟。
            states_actions_rewards.append((s, None, -10. / num_steps))
            break
        elif grid.game_over():
            states_actions_rewards.append((s, None, r))
            break
        else:
            a = policy[s]
            states_actions_rewards.append((s, a, r))
        seen.add(s)

    # ---- 倒带计算 G ----
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
    print("奖励分布（注意每个普通格子都是 %.1f）：" % STEP_COST)
    print_values(grid.rewards, grid)

    # 随机初始策略 + Q 清零
    policy = {s: np.random.choice(ALL_ACTIONS) for s in grid.actions.keys()}
    print("\n随机初始策略：")
    print_policy(policy, grid)

    Q, returns = {}, {}
    for s in grid.actions.keys():
        Q[s] = {a: 0.0 for a in ALL_ACTIONS}
        for a in ALL_ACTIONS:
            returns[(s, a)] = []

    deltas = []
    for t in range(EPISODES):
        biggest_change = 0
        seen_pairs = set()
        for s, a, G in play_game(grid, policy):     # first-visit 口径
            if (s, a) in seen_pairs:
                continue
            seen_pairs.add((s, a))
            old_q = Q[s][a]
            returns[(s, a)].append(G)
            Q[s][a] = np.mean(returns[(s, a)])
            biggest_change = max(biggest_change, abs(old_q - Q[s][a]))
        deltas.append(biggest_change)
        # 单回合即时改进（广义策略迭代）
        for s in policy.keys():
            policy[s] = max_dict(Q[s])[0]

    print("\n学到的策略（%d 回合，探索性出发=%s）：" % (EPISODES, EXPLORING_STARTS))
    print_policy(policy, grid)
    V = {s: max_dict(Q[s])[1] for s in policy.keys()}
    print("\n对应的 V(s) = max_a Q(s,a)：")
    print_values(V, grid)

    plt.figure(figsize=(7, 3))
    plt.plot(deltas)
    plt.xlabel('episode'); plt.ylabel('max |ΔQ|'); plt.title('MC ES 收敛曲线')
    plt.tight_layout(); plt.savefig('02_deltas.png', dpi=110)
    print("\n收敛曲线已保存：02_deltas.png（毛刺多但整体下行——单回合更新就是这么糙快猛）")
    print("\n>>> 实验建议：① STEP_COST 改成 -0.1 对比策略画风；")
    print(">>> ② EXPLORING_STARTS=False 跑几次，找出学错的状态；③ 对照网页互动 2-C。")


if __name__ == '__main__':
    main()
