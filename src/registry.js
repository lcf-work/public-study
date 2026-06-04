// ============================================================================
// 内容注册表 / Content registry
// ----------------------------------------------------------------------------
// 用 Vite 的 import.meta.glob 自动发现 content/ 下的所有 .jsx。
// 你不需要在这里登记任何东西——丢进文件夹就会自动出现。
// Auto-discovers every .jsx under content/ via Vite's import.meta.glob.
// Drop a file in and it shows up; nothing to register here by hand.
// ============================================================================
import { CATEGORIES, STUDIES as META } from "./meta.js";

// 懒加载：每篇研习单独打包，按需加载（recharts 这类重依赖不拖慢首页）。
// Lazy modules: each study is its own chunk, loaded on demand.
const modules = import.meta.glob("/content/**/*.jsx");

// "intelligent-investor" -> "Intelligent Investor"（无元数据时的兜底标题）
function titleFromSlug(slug) {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function parsePath(path) {
  // path 形如 /content/invest/intelligent-investor.jsx
  const m = path.match(/^\/content\/([^/]+)\/(.+)\.jsx$/);
  if (!m) return null;
  return { category: m[1], slug: m[2] };
}

export const STUDIES = Object.entries(modules)
  .map(([path, loader]) => {
    const parsed = parsePath(path);
    if (!parsed) return null;
    const { category, slug } = parsed;
    const id = `${category}/${slug}`;
    const meta = META[id] || {};
    return {
      id,
      path,
      loader, // () => import(...)  —— 交给 React.lazy
      category,
      slug,
      title: meta.title || titleFromSlug(slug),
      subtitle: meta.subtitle || "",
      description: meta.description || "",
      date: meta.date || "",
      tags: meta.tags || [],
    };
  })
  .filter(Boolean)
  // 新的在前；同日期按标题
  .sort(
    (a, b) =>
      (b.date || "").localeCompare(a.date || "") ||
      a.title.localeCompare(b.title, "zh-Hans-CN")
  );

// 分类列表：以实际存在的文件夹为准，合并 meta 里的展示名与排序。
export const CATEGORY_LIST = [...new Set(STUDIES.map((s) => s.category))]
  .map((key) => {
    const info = CATEGORIES[key] || {};
    return {
      key,
      label: info.label || key,
      en: info.en || "",
      desc: info.desc || "",
      order: info.order ?? 999,
      count: STUDIES.filter((s) => s.category === key).length,
    };
  })
  .sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));

export function findStudy(category, slug) {
  return STUDIES.find((s) => s.category === category && s.slug === slug) || null;
}
