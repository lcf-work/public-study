# -*- coding: utf-8 -*-
"""第1–2章实践：REINFORCE（蒙特卡洛策略梯度）跑 CartPole。

对应网页 第1章（策略梯度）与 第2章（基线）。可开关 reward-to-go 与价值基线，
亲手感受「奖励分配」和「基线降方差」。纯 numpy。

用法：python3 01_reinforce.py
"""
import numpy as np
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from rl_common import CartPole, MLP, softmax, scale_obs, discount_cumsum

# ============================ 实验区 ============================
GAMMA = 0.99
ITERS = 200            # 训练迭代数
EP_PER_ITER = 8        # 每次迭代采多少个完整回合
LR_PI = 2e-3
REWARD_TO_GO = True    # False = 整条轨迹用同一个总回报（更慢更抖，见第1章1.3节）
USE_BASELINE = False   # True = 减去学习到的 V(s) 基线（第2章），方差大降
LR_V = 3e-3
SEED = 0
# ===============================================================

rng = np.random.default_rng(SEED)
policy = MLP(4, 64, 2, out_scale=0.01, seed=SEED)       # 演员
value = MLP(4, 64, 1, seed=SEED + 1) if USE_BASELINE else None  # 基线网络


def collect():
    """采集 EP_PER_ITER 个完整回合。返回拼接的 obs/act/weight/ret 与回合长度。"""
    O, A, RET = [], [], []
    lens = []
    for _ in range(EP_PER_ITER):
        env = CartPole(rng); o = env.reset()
        obs, acts, rews = [], [], []
        done = False
        while not done:
            p = softmax(policy.forward(scale_obs(o)[None])[0])
            a = rng.choice(2, p=p)
            obs.append(o); acts.append(a)
            o, r, done, _ = env.step(a); rews.append(r)
        lens.append(len(rews))
        rews = np.array(rews)
        if REWARD_TO_GO:
            ret = discount_cumsum(rews, GAMMA)          # 每步之后的折扣回报
        else:
            total = discount_cumsum(rews, GAMMA)[0]
            ret = np.full(len(rews), total)             # 整条轨迹同一个分数
        O.append(np.array(obs)); A.append(np.array(acts)); RET.append(ret)
    return (np.concatenate(O), np.concatenate(A), np.concatenate(RET), np.mean(lens))


def train():
    hist = []
    for it in range(1, ITERS + 1):
        O, A, RET, mlen = collect()
        Xs = scale_obs(O)
        # 基线
        if USE_BASELINE:
            V = value.forward(Xs)[:, 0]
            weight = RET - V
            # 评论员回归到 RET
            dV = ((V - RET) / len(RET))[:, None]
            value.adam(value.backward(dV), LR_V)
        else:
            weight = RET - RET.mean()                    # 最朴素的常数基线（中心化）
        weight = weight / (weight.std() + 1e-8)          # 标准化，稳一点

        # 策略梯度：loss = -(logp_a * weight).mean()
        logits = policy.forward(Xs)
        p = softmax(logits)
        B = len(A)
        dlogits = p.copy()
        dlogits[np.arange(B), A] -= 1.0                  # p - onehot
        dlogits *= (weight[:, None] / B)                 # 乘权重，对 batch 平均
        policy.adam(policy.backward(dlogits), LR_PI)

        hist.append(mlen)
        if it % 10 == 0 or it == 1:
            print(f"iter {it:3d} | 平均回合长度 {np.mean(hist[-10:]):6.1f} | "
                  f"基线 {'ON' if USE_BASELINE else 'off'} | reward-to-go {REWARD_TO_GO}")
    return hist


if __name__ == "__main__":
    print(f"REINFORCE on CartPole（满分 500）  baseline={USE_BASELINE}  reward_to_go={REWARD_TO_GO}")
    hist = train()
    plt.figure(figsize=(7, 3))
    plt.plot(hist, alpha=0.4, label="per iteration")
    if len(hist) > 10:
        sm = np.convolve(hist, np.ones(10) / 10, "valid"); plt.plot(range(9, len(hist)), sm, label="moving avg (10)")
    plt.xlabel("iteration"); plt.ylabel("mean episode length"); plt.ylim(0, 510); plt.legend()
    plt.title(f"REINFORCE (baseline={USE_BASELINE}, RTG={REWARD_TO_GO})")
    plt.tight_layout(); plt.savefig("01_reinforce_curve.png", dpi=110)
    print("学习曲线已保存：01_reinforce_curve.png")
    print(">>> 实验：① USE_BASELINE=True 对比抖动；② REWARD_TO_GO=False 看奖励分配的重要性。")
