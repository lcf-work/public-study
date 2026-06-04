# studyspace · 读书研习

互动式读书笔记博客。每一篇研习都是一个独立的 React 组件（`.jsx`），自动被发现、
分类、可搜索，并通过 GitHub Actions 一键部署到 GitHub Pages。

An interactive "reading notes" blog. Each study is a self-contained React
component that is auto-discovered, categorised, searchable, and deployed to
GitHub Pages via GitHub Actions.

🔗 **线上地址 / Live site:** https://lcf-work.github.io/public-study/

---

## ✨ 特点 / Features

- **零登记自动发现** —— 把 `.jsx` 丢进 `content/<分类>/`，它就会自动出现在站点上。
  Drop a `.jsx` into `content/<category>/` and it shows up automatically.
- **分类 + 搜索导航** —— 首页可按分类筛选、按书名/作者/主题/标签实时搜索。
- **保留原始交互** —— 你的组件代码原封不动，框架只负责发现、导航与渲染。
  Your component code is never modified — the shell only discovers and renders it.
- **推送即部署** —— `git push` 后 GitHub Actions 自动构建并上线。
- **按需加载** —— 每篇研习单独打包，重依赖（如 recharts）只在打开时才加载。

---

## 📁 目录结构 / Project layout

```
public-study/
├── content/                  ← 你的内容（唯一需要日常改动的地方）
│   ├── invest/               ← 分类「投资」= 一个文件夹
│   │   ├── intelligent-investor.jsx
│   │   ├── intelligent-investor-zweig.jsx
│   │   ├── random-walk-wallstreet.jsx
│   │   └── five-rules-dorsey.jsx
│   └── history/              ← 分类「历史」
│       └── zhougong.jsx
├── src/
│   ├── meta.js               ← 标题/简介/标签/分类名（可选，手动维护）
│   ├── registry.js           ← 自动发现 content/ 下所有 .jsx（一般不用动）
│   ├── pages/Home.jsx        ← 首页：搜索 + 分类 + 卡片
│   ├── pages/Study.jsx       ← 阅读页：渲染单篇研习
│   ├── App.jsx               ← 路由
│   └── styles.css            ← 博客外壳样式（.ss- 前缀，不影响你的内容）
├── .github/workflows/deploy.yml  ← 自动构建并部署到 GitHub Pages
├── vite.config.js            ← base 路径（= 仓库名）
└── package.json
```

---

## 🚀 工作流：新增一篇研习 / Add a new study

这就是你日常会用到的全部流程，**三步**：

1. **放文件** —— 把组件放进对应分类文件夹，例如
   `content/invest/buffett-letters.jsx`。
   文件必须 `export default` 一个 React 组件（见下方[内容约定](#-内容文件约定--content-conventions)）。

2. **（可选）加元数据** —— 在 `src/meta.js` 的 `STUDIES` 里加一条，键是
   `"分类/文件名"`（不含 `.jsx`）：

   ```js
   "invest/buffett-letters": {
     title: "巴菲特致股东的信",
     subtitle: "Berkshire Letters · Warren Buffett",
     description: "复利、能力圈、护城河……年报里的投资课。",
     date: "2026-06-10",
     tags: ["复利", "巴菲特", "护城河"],
   },
   ```

   > 不加也能上线：标题会自动从文件名推导（`buffett-letters` → `Buffett Letters`），
   > 只是没有中文标题和简介。

3. **部署** —— 提交并推送，剩下的交给 GitHub Actions：

   ```bash
   git add .
   git commit -m "add: 巴菲特致股东的信"
   git push
   ```

约 1–2 分钟后刷新线上地址即可看到。在
[Actions 页面](https://github.com/lcf-work/public-study/actions)可查看部署进度。

---

## 🗂 新增一个分类 / Add a new category

1. 在 `content/` 下新建一个文件夹，例如 `content/philosophy/`，放进 `.jsx`。
2. （可选）在 `src/meta.js` 的 `CATEGORIES` 里给它起个展示名和排序：

   ```js
   philosophy: { label: "哲学", en: "Philosophy", desc: "思想与思辨", order: 3 },
   ```

   不配置也能用，导航里会直接显示文件夹名 `philosophy`。
3. `git push` 部署。

---

## 🧩 内容文件约定 / Content conventions

每个 `content/**/*.jsx` 文件：

- 必须有 **默认导出** 的 React 组件：`export default function App() { ... }`
- 可使用的依赖（已安装）：`react`、`lucide-react`（图标）、`recharts`（图表）。
  如需新依赖，先 `npm install <包名>` 再使用。
- 自带样式请用**带前缀的 class**（如本仓库现有文件用 `zg-`/`zw-`/`gi-` 等），
  避免与其他研习或外壳（`ss-`）冲突。同一时刻只渲染一篇，冲突风险很小。

---

## 🛠 常用命令 / Common commands

```bash
# 安装依赖（首次 / 克隆后）
npm install

# 本地开发，带热更新，自动打开 http://localhost:5173/public-study/
npm run dev

# 本地生产构建（产物在 dist/）
npm run build

# 预览构建产物
npm run preview

# —— 部署（推送即自动构建上线）——
git add . && git commit -m "update" && git push
```

---

## ⚙️ 部署原理 / How deployment works

- 推送到 `main` 触发 `.github/workflows/deploy.yml`。
- CI 执行 `npm ci` → `npm run build`，把 `dist/` 作为 Pages 工件上传并发布。
- GitHub Pages 的来源（Source）已设为 **GitHub Actions**，无需 `gh-pages` 分支。

> **改了仓库名怎么办？** GitHub Pages 项目站点的 URL 是
> `https://<用户名>.github.io/<仓库名>/`。如果仓库改名，请同步修改
> `vite.config.js` 里的 `base`（必须是 `/<新仓库名>/`），否则资源会 404。

---

## 📦 技术栈 / Stack

Vite 5 · React 18 · React Router 6（HashRouter）· lucide-react · recharts ·
GitHub Actions → GitHub Pages

> 用 HashRouter（`/#/...`）是因为 GitHub Pages 不支持 SPA 路由回退，
> hash 路由能让深链接直接分享、刷新不 404。
