# -*- coding: utf-8 -*-
"""PPO 实践脚本的公共部件：CartPole 环境 + 两层 MLP（含 Adam）。
纯 numpy，无 PyTorch / Gym 依赖。与网页教程里的 JS 引擎算法一致。
"""
import numpy as np


# ============================ CartPole-v1（经典 Gym 动力学）============================
class CartPole:
    g, mc, mp, l, force, tau = 9.8, 1.0, 0.1, 0.5, 10.0, 0.02
    mt = mc + mp          # 1.1
    pml = mp * l          # 0.05
    x_thr = 2.4
    theta_thr = 12 * np.pi / 180
    max_steps = 500

    def __init__(self, rng=None):
        self.rng = rng or np.random.default_rng()
        self.reset()

    def reset(self):
        self.s = self.rng.uniform(-0.05, 0.05, size=4).astype(np.float64)
        self.steps = 0
        return self.s.copy()

    def step(self, a):
        x, xd, th, thd = self.s
        force = self.force if a == 1 else -self.force
        ct, st = np.cos(th), np.sin(th)
        temp = (force + self.pml * thd * thd * st) / self.mt
        thacc = (self.g * st - ct * temp) / (self.l * (4 / 3 - self.mp * ct * ct / self.mt))
        xacc = temp - self.pml * thacc * ct / self.mt
        x += self.tau * xd; xd += self.tau * xacc
        th += self.tau * thd; thd += self.tau * thacc
        self.s = np.array([x, xd, th, thd]); self.steps += 1
        failed = bool(x < -self.x_thr or x > self.x_thr or th < -self.theta_thr or th > self.theta_thr)
        truncated = self.steps >= self.max_steps
        return self.s.copy(), 1.0, (failed or truncated), {"failed": failed, "truncated": truncated}


OBS_SCALE = np.array([1 / 2.4, 1 / 2.5, 1 / (12 * np.pi / 180), 1 / 2.5])
def scale_obs(o):
    return o * OBS_SCALE


# ============================ 两层 MLP：in → tanh(hidden) → linear(out) ============================
class MLP:
    """前向/反向都按 batch 向量化；自带 Adam。"""
    def __init__(self, nin, nh, nout, out_scale=None, seed=0):
        rng = np.random.default_rng(seed)
        self.W1 = rng.standard_normal((nin, nh)) * np.sqrt(1 / nin)
        self.b1 = np.zeros(nh)
        os = out_scale if out_scale is not None else np.sqrt(1 / nh)
        self.W2 = rng.standard_normal((nh, nout)) * os
        self.b2 = np.zeros(nout)
        self.params = ["W1", "b1", "W2", "b2"]
        self._m = {k: np.zeros_like(getattr(self, k)) for k in self.params}
        self._v = {k: np.zeros_like(getattr(self, k)) for k in self.params}
        self._t = 0

    def forward(self, X):
        self._X = X
        self._A1 = np.tanh(X @ self.W1 + self.b1)
        return self._A1 @ self.W2 + self.b2          # (B, nout)

    def backward(self, dout):
        """dout: ∂loss/∂out, 形状 (B, nout)。返回梯度字典。"""
        gW2 = self._A1.T @ dout
        gb2 = dout.sum(0)
        dA1 = dout @ self.W2.T
        dZ1 = dA1 * (1 - self._A1 ** 2)
        gW1 = self._X.T @ dZ1
        gb1 = dZ1.sum(0)
        return {"W1": gW1, "b1": gb1, "W2": gW2, "b2": gb2}

    def adam(self, grads, lr, max_norm=0.5, b1=0.9, b2=0.999, eps=1e-8):
        if max_norm:
            tot = np.sqrt(sum((grads[k] ** 2).sum() for k in self.params))
            if tot > max_norm:
                f = max_norm / (tot + 1e-12)
                grads = {k: grads[k] * f for k in self.params}
        self._t += 1
        for k in self.params:
            g = grads[k]
            self._m[k] = b1 * self._m[k] + (1 - b1) * g
            self._v[k] = b2 * self._v[k] + (1 - b2) * g * g
            mh = self._m[k] / (1 - b1 ** self._t)
            vh = self._v[k] / (1 - b2 ** self._t)
            setattr(self, k, getattr(self, k) - lr * mh / (np.sqrt(vh) + eps))


def softmax(logits):
    z = logits - logits.max(axis=-1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=-1, keepdims=True)


def discount_cumsum(x, discount):
    """从后往前的折扣累加：out[t] = x[t] + discount*out[t+1]。"""
    out = np.zeros_like(x, dtype=np.float64)
    run = 0.0
    for t in range(len(x) - 1, -1, -1):
        run = x[t] + discount * run
        out[t] = run
    return out
