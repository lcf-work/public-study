# -*- coding: utf-8 -*-
"""第4–5章实践：完整的 PPO（裁剪目标 + GAE）跑 CartPole。从零纯 numpy 实现。

与网页 第5章 互动 5-B 的 JS 引擎算法完全一致，便于逐行研读与魔改。

用法：python3 03_ppo.py
"""
import numpy as np
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from rl_common import CartPole, MLP, softmax, scale_obs

# ============================ 实验区 ============================
GAMMA = 0.99
GAE_LAMBDA = 0.95     # 0=一步TD(低方差高偏差)  1=蒙特卡洛(高方差无自举偏差)
CLIP_EPS = 0.2        # 裁剪幅度 ε（第4章）
N_EPOCHS = 8          # 同一批数据复用几轮（裁剪让这成为可能）
MINIBATCH = 64
STEPS_PER_ITER = 1024 # 每次迭代采集的环境步数
ITERS = 60
LR_PI = 2.5e-3
LR_V = 2.5e-3
ENT_COEF = 0.0
USE_CLIP = True       # False = 退化成朴素重要性采样目标，更容易崩（第3、4章的悬崖）
NORM_ADV = True       # 优势标准化——关掉常常直接学不动（第5章「实现细节即分水岭」）
SEED = 0
# ===============================================================

rng = np.random.default_rng(SEED)
policy = MLP(4, 64, 2, out_scale=0.01, seed=SEED)
value = MLP(4, 64, 1, seed=SEED + 1)


def policy_logp(O, A):
    p = softmax(policy.forward(scale_obs(O)))
    return np.log(p[np.arange(len(A)), A] + 1e-12), p


def collect():
    env = CartPole(rng); o = env.reset()
    O, A, R, D, LOGP, V = [], [], [], [], [], []
    ep_len, lens = 0, []
    for _ in range(STEPS_PER_ITER):
        x = scale_obs(o)[None]
        p = softmax(policy.forward(x)[0])
        a = rng.choice(2, p=p)
        O.append(o); A.append(a); LOGP.append(np.log(p[a] + 1e-12))
        V.append(value.forward(x)[0, 0])
        o, r, done, _ = env.step(a)
        R.append(r); D.append(1.0 if done else 0.0); ep_len += 1
        if done: lens.append(ep_len); ep_len = 0; o = env.reset()
    last_v = value.forward(scale_obs(o)[None])[0, 0]
    O = np.array(O); A = np.array(A, dtype=int)
    R = np.array(R); D = np.array(D); LOGP = np.array(LOGP); V = np.array(V)

    # GAE（第5章式 5.1）
    N = len(R); adv = np.zeros(N); gae = 0.0
    for t in range(N - 1, -1, -1):
        nonterm = 1.0 - D[t]
        nextv = last_v if t == N - 1 else V[t + 1]
        delta = R[t] + GAMMA * nextv * nonterm - V[t]
        gae = delta + GAMMA * GAE_LAMBDA * nonterm * gae
        adv[t] = gae
    ret = adv + V
    return O, A, LOGP, adv, ret, (np.mean(lens) if lens else ep_len)


def update(O, A, LOGP_OLD, ADV, RET):
    if NORM_ADV:
        ADV = (ADV - ADV.mean()) / (ADV.std() + 1e-8)
    N = len(A); idx = np.arange(N)
    clipfrac, kl, nb = 0.0, 0.0, 0
    for _ in range(N_EPOCHS):
        rng.shuffle(idx)
        for s in range(0, N, MINIBATCH):
            mb = idx[s:s + MINIBATCH]; B = len(mb)
            Xs = scale_obs(O[mb])
            # --- 演员：裁剪目标 ---
            logits = policy.forward(Xs); p = softmax(logits)
            logp = np.log(p[np.arange(B), A[mb]] + 1e-12)
            ratio = np.exp(logp - LOGP_OLD[mb])
            adv = ADV[mb]
            if USE_CLIP:
                grad_zero = ((adv > 0) & (ratio >= 1 + CLIP_EPS)) | ((adv < 0) & (ratio <= 1 - CLIP_EPS))
            else:
                grad_zero = np.zeros(B, dtype=bool)
            dlogp = np.where(grad_zero, 0.0, adv * ratio)        # ∂obj/∂logp_new
            dlogits = p.copy(); dlogits[np.arange(B), A[mb]] -= 1.0  # (p − onehot) = ∂(−logp)/∂logits
            dlogits *= (dlogp[:, None] / B)                      # loss=−obj 的梯度，按 batch 平均
            if ENT_COEF:
                H = -(p * np.log(p + 1e-12)).sum(1, keepdims=True)
                dH = -p * (np.log(p + 1e-12) + H)
                dlogits -= ENT_COEF * dH / B
            policy.adam(policy.backward(dlogits), LR_PI)
            # --- 评论员：MSE ---
            V = value.forward(Xs)[:, 0]
            dV = ((V - RET[mb]) / B)[:, None]
            value.adam(value.backward(dV), LR_V)
            # 诊断
            clipfrac += np.mean(((adv > 0) & (ratio > 1 + CLIP_EPS)) | ((adv < 0) & (ratio < 1 - CLIP_EPS)))
            kl += np.mean(LOGP_OLD[mb] - logp); nb += 1
    return clipfrac / nb, kl / nb


def train():
    hist = []
    print(f"PPO on CartPole（满分 500）  clip={USE_CLIP} ε={CLIP_EPS} λ={GAE_LAMBDA} epochs={N_EPOCHS}")
    for it in range(1, ITERS + 1):
        O, A, LOGP, ADV, RET, mlen = collect()
        clipfrac, kl = update(O, A, LOGP, ADV, RET)
        if mlen: hist.append(mlen)
        if it % 5 == 0 or it == 1:
            print(f"iter {it:3d} | 平均回合长度 {np.mean(hist[-10:]) if hist else 0:6.1f} | "
                  f"clipfrac {clipfrac:.3f} | approx_kl {kl:+.4f}")
    return hist


if __name__ == "__main__":
    hist = train()
    plt.figure(figsize=(7, 3))
    plt.plot(hist, alpha=0.4, label="per iteration")
    if len(hist) > 5:
        sm = np.convolve(hist, np.ones(5) / 5, "valid"); plt.plot(range(4, len(hist)), sm, label="moving avg (5)")
    plt.xlabel("iteration"); plt.ylabel("mean episode length"); plt.ylim(0, 510); plt.legend()
    plt.title(f"PPO (clip={USE_CLIP}, ε={CLIP_EPS}, λ={GAE_LAMBDA})")
    plt.tight_layout(); plt.savefig("03_ppo_curve.png", dpi=110)
    print("学习曲线已保存：03_ppo_curve.png")
    print(">>> 实验：① GAE_LAMBDA 0/0.95/1 对比；② USE_CLIP=False 看崩；③ NORM_ADV=False 常学不动。")
