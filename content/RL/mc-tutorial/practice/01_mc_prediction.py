# -*- coding: utf-8 -*-
"""第1章实践：蒙特卡洛预测（First-Visit / Every-Visit MC）

给定固定策略 π，在 3×4 网格世界中用「采样 + 平均」估计状态价值 V_π(s)，
并与用模型精确计算的真值对照。

改编自 Reinforcement_learning_tutorial_with_demo/monte_carlo_demo.ipynb。

用法：
    python3 01_mc_prediction.py                  # 完整 MC 预测
    python3 01_mc_prediction.py --show-episode   # 只打印一条轨迹的回报倒带过程
"""
import sys
import numpy as np
from grid_world import standard_grid, print_values, print_policy

# ============================ 实验区 ============================
GAMMA = 0.9          # 折扣因子。试试 0.5：远端奖励的影响被指数压缩
NUM_EPISODES = 5000  # 回合数。试试 50：估计会很糙，且每次运行结果不同
FIRST_VISIT = True   # True=first-visit / False=every-visit
WIND = True          # 是否起风：每步以 30% 概率被吹向随机的其他方向
                     # 改成 False：世界确定，每个状态一个样本就足够精确
# ===============================================================

P_INTEND = 0.7 if WIND else 1.0
ALL_ACTIONS = ('U', 'D', 'L', 'R')

# 固定策略（与网页互动 1-C 相同；注意 (1,2)、(2,3) 会把智能体送向 -1）
POLICY = {
    (2, 0): 'U', (1, 0): 'U', (0, 0): 'R', (0, 1): 'R', (0, 2): 'R',
    (1, 2): 'R', (2, 1): 'R', (2, 2): 'R', (2, 3): 'U',
}


def windy_action(a):
    """以 P_INTEND 概率执行所选动作，否则等概率执行其余 3 个动作。"""
    if np.random.random() < P_INTEND:
        return a
    others = [x for x in ALL_ACTIONS if x != a]
    return others[np.random.randint(3)]


def play_game(grid, policy, start=None, max_steps=200):
    """跑一个回合，返回 [(状态, 即时奖励, G), ...]（按时间顺序）。

    G 用「倒带」技巧从末尾递推：G[t] = r[t+1] + GAMMA * G[t+1]。
    """
    if start is None:
        starts = list(grid.actions.keys())
        start = starts[np.random.randint(len(starts))]
    grid.set_state(start)

    s = grid.current_state()
    states_and_rewards = [(s, 0)]   # (到达的状态, 到达时获得的奖励)
    for _ in range(max_steps):
        if grid.game_over():
            break
        a = windy_action(policy[s])
        r = grid.move(a)            # 非法动作 = 原地不动，奖励 0
        s = grid.current_state()
        states_and_rewards.append((s, r))

    # ---- 倒带：从最后一步往前递推 G ----
    G = 0
    out = []
    first = True
    for s, r in reversed(states_and_rewards):
        if first:
            first = False           # 终止状态本身价值为 0，跳过
        else:
            out.append((s, r_next, G))
        G = r + GAMMA * G
        r_next = r
    out.reverse()
    return out


def exact_values(policy):
    """用模型（转移规律 + 风的分布）精确评估策略——仅作裁判，MC 算法本身不许用。"""
    grid = standard_grid()
    states = [s for s in grid.actions.keys()]
    V = {s: 0.0 for s in states}
    for _ in range(500):
        for s in states:
            v = 0.0
            for a in ALL_ACTIONS:
                p = P_INTEND if a == policy[s] else (1 - P_INTEND) / 3
                if p == 0:
                    continue
                # 模拟一步（不改变全局状态）
                grid.set_state(s)
                r = grid.move(a)
                s2 = grid.current_state()
                v += p * (r + (0.0 if grid.is_terminal(s2) else GAMMA * V[s2]))
            V[s] = v
    return V


def show_one_episode():
    grid = standard_grid()
    ep = play_game(grid, POLICY, start=(2, 0))
    print("一条完整轨迹（从 (2,0) 出发，GAMMA=%.2f，%s）：" % (GAMMA, "有风" if WIND else "无风"))
    print(f"{'t':>3} {'状态':>8} {'下一步奖励r':>10} {'回报G':>10}")
    for t, (s, r, G) in enumerate(ep):
        print(f"{t:>3} {str(s):>8} {r:>10.2f} {G:>10.4f}")
    print("\n验证：每一行都满足 G[t] = r[t+1] + GAMMA * G[t+1]（最后一行 G[t+1]=0）")
    print("把 GAMMA 改小再跑一次，看远端 ±1 对起点 G 的贡献如何缩水。")


def main():
    grid = standard_grid()
    print("奖励分布：")
    print_values(grid.rewards, grid)
    print("\n被评估的固定策略 π：")
    print_policy(POLICY, grid)

    # MC 预测主循环
    returns = {s: [] for s in grid.actions.keys()}
    V = {}
    for _ in range(NUM_EPISODES):
        ep = play_game(grid, POLICY)
        seen = set()
        for s, _r, G in ep:
            if FIRST_VISIT and s in seen:
                continue
            seen.add(s)
            returns[s].append(G)
            V[s] = np.mean(returns[s])

    print("\nMC 估计的 V(s)（%d 回合，%s-visit，%s）：" %
          (NUM_EPISODES, "first" if FIRST_VISIT else "every", "有风" if WIND else "无风"))
    print_values(V, grid)

    V_true = exact_values(POLICY)
    print("\n真值 V_pi(s)（用模型精确计算，仅作对照）：")
    print_values(V_true, grid)

    errs = [abs(V.get(s, 0) - V_true[s]) for s in V_true]
    print("\n平均绝对误差：%.4f    最大误差：%.4f" % (np.mean(errs), np.max(errs)))
    print("样本数最少的状态：", min(returns, key=lambda s: len(returns[s])),
          "（%d 个样本）" % min(len(v) for v in returns.values()))
    print("\n>>> 实验建议：依次改 NUM_EPISODES=50 / WIND=False / FIRST_VISIT=False，")
    print(">>> 各跑几次，对照网页教程互动 1-C 的观察。")


if __name__ == '__main__':
    if '--show-episode' in sys.argv:
        show_one_episode()
    else:
        main()
