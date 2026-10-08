# -*- coding: utf-8 -*-
"""第2章实践：优势 Actor-Critic 跑 CartPole。

与 01_reinforce.py 的关键区别：优势用<自举>的 GAE 估计，而非整条蒙特卡洛回报。
GAE_LAMBDA 就是「偏差-方差」旋钮（λ=0 一步TD，λ=1 蒙特卡洛），为第5章预热。纯 numpy。

⚠ 教学提示：这里是「朴素同策略 AC」——每批数据只更新一次、不做信赖域约束。
   它能稳定学到几百分，但<纯在线 AC 难以又快又稳地冲到满分>，这正是后面 PPO（裁剪）要解决的问题。

用法：python3 02_actor_critic.py
"""
import numpy as np
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from rl_common import CartPole, MLP, softmax, scale_obs

# ============================ 实验区 ============================
GAMMA = 0.99
GAE_LAMBDA = 0.95      # 偏差-方差旋钮：0=一步TD(式2.4,低方差高偏差) 1=蒙特卡洛(高方差无自举偏差)
ITERS = 150
STEPS_PER_ITER = 4096  # 大批量 → 梯度方差更低 → 纯在线 AC 更稳
LR_PI = 7e-4
LR_V = 4e-3
ENT_COEF = 0.0
SEED = 0
# ===============================================================

rng = np.random.default_rng(SEED)
policy = MLP(4, 64, 2, out_scale=0.01, seed=SEED)
value = MLP(4, 64, 1, seed=SEED + 1)


def collect():
    env = CartPole(rng); o = env.reset()
    O, A, R, D, V = [], [], [], [], []
    ep_len, lens = 0, []
    for _ in range(STEPS_PER_ITER):
        x = scale_obs(o)[None]
        p = softmax(policy.forward(x)[0])
        a = rng.choice(2, p=p)
        O.append(o); A.append(a); V.append(value.forward(x)[0, 0])
        o, r, done, _ = env.step(a)
        R.append(r); D.append(1.0 if done else 0.0); ep_len += 1
        if done: lens.append(ep_len); ep_len = 0; o = env.reset()
    last_v = value.forward(scale_obs(o)[None])[0, 0]
    O = np.array(O); A = np.array(A, dtype=int); R = np.array(R); D = np.array(D); V = np.array(V)

    # GAE 优势（与第5章一致；λ 控制自举程度）
    N = len(R); adv = np.zeros(N); gae = 0.0
    for t in range(N - 1, -1, -1):
        nonterm = 1.0 - D[t]
        nextv = last_v if t == N - 1 else V[t + 1]
        delta = R[t] + GAMMA * nextv * nonterm - V[t]
        gae = delta + GAMMA * GAE_LAMBDA * nonterm * gae
        adv[t] = gae
    ret = adv + V
    return O, A, adv, ret, (np.mean(lens) if lens else ep_len)


def train():
    hist = []
    for it in range(1, ITERS + 1):
        O, A, adv, ret, mlen = collect()
        advn = (adv - adv.mean()) / (adv.std() + 1e-8)
        Xs = scale_obs(O); B = len(A)

        # 演员：用优势加权的策略梯度（单次更新，纯在线）
        logits = policy.forward(Xs); p = softmax(logits)
        dlogits = p.copy(); dlogits[np.arange(B), A] -= 1.0   # p − onehot
        dlogits *= (advn[:, None] / B)
        if ENT_COEF:
            H = -(p * np.log(p + 1e-12)).sum(1, keepdims=True)
            dH = -p * (np.log(p + 1e-12) + H)
            dlogits -= ENT_COEF * dH / B
        policy.adam(policy.backward(dlogits), LR_PI)

        # 评论员：回归到 GAE 回报目标
        V = value.forward(Xs)[:, 0]
        value.adam(value.backward(((V - ret) / B)[:, None]), LR_V)

        if mlen: hist.append(mlen)
        if it % 10 == 0 or it == 1:
            print(f"iter {it:3d} | 平均回合长度 {np.mean(hist[-10:]) if hist else 0:6.1f} | GAE λ={GAE_LAMBDA}")
    return hist


if __name__ == "__main__":
    print(f"Advantage Actor-Critic on CartPole（满分 500）  GAE λ={GAE_LAMBDA}")
    hist = train()
    plt.figure(figsize=(7, 3))
    plt.plot(hist, alpha=0.4, label="per iteration")
    if len(hist) > 10:
        sm = np.convolve(hist, np.ones(10) / 10, "valid"); plt.plot(range(9, len(hist)), sm, label="moving avg (10)")
    plt.xlabel("iteration"); plt.ylabel("mean episode length"); plt.ylim(0, 510); plt.legend()
    plt.title(f"Actor-Critic (GAE λ={GAE_LAMBDA})")
    plt.tight_layout(); plt.savefig("02_actor_critic_curve.png", dpi=110)
    print("学习曲线已保存：02_actor_critic_curve.png")
    print(">>> 实验：① GAE_LAMBDA 取 0 / 0.95 / 1 对比偏差-方差；② 它能稳到几百分，但难冲满分——对照 03_ppo.py。")
