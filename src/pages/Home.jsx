import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { STUDIES, CATEGORY_LIST, INVEST_SECTION_LIST } from "../registry.js";

const SITE_TITLE = "studyspace";
const SITE_SUB = "超凡小蜘蛛 读书研习 · 互动式读书笔记与导读";

function matches(study, q) {
  if (!q) return true;
  const hay = [
    study.title,
    study.subtitle,
    study.description,
    study.category,
    study.sectionLabel,
    ...(study.tags || []),
  ]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term));
}

const INVEST_COUNT = STUDIES.filter((s) => s.category === "invest").length;

export default function Home() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [lane, setLane] = useState("all");

  const selectCat = (key) => {
    setCat(key);
    if (key !== "invest") setLane("all");
  };

  const visible = useMemo(
    () =>
      STUDIES.filter((s) => {
        if (cat !== "all" && s.category !== cat) return false;
        if (cat === "invest" && lane !== "all" && s.section !== lane) return false;
        return matches(s, q);
      }),
    [q, cat, lane]
  );

  const showLanes = cat === "invest" && lane === "all";

  return (
    <div className="ss-root">
      <header className="ss-header">
        <div className="ss-header-inner">
          <div className="ss-brand">
            <span className="ss-seal">研</span>
            <div>
              <h1 className="ss-title">{SITE_TITLE}</h1>
              <p className="ss-sub">{SITE_SUB}</p>
            </div>
          </div>

          <div className="ss-search">
            <svg viewBox="0 0 24 24" className="ss-search-ico" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索书名、作者、主题、标签…"
              aria-label="搜索"
            />
            {q && (
              <button className="ss-search-clear" onClick={() => setQ("")} aria-label="清除">
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="ss-main">
        <nav className="ss-cats" aria-label="分类导航">
          <button
            className={`ss-cat ${cat === "all" ? "on" : ""}`}
            onClick={() => selectCat("all")}
          >
            全部 <span className="ss-cat-n">{STUDIES.length}</span>
          </button>
          {CATEGORY_LIST.map((c) => (
            <button
              key={c.key}
              className={`ss-cat ${cat === c.key ? "on" : ""}`}
              onClick={() => selectCat(c.key)}
              title={c.desc}
            >
              {c.label}
              {c.en && <span className="ss-cat-en">{c.en}</span>}
              <span className="ss-cat-n">{c.count}</span>
            </button>
          ))}
        </nav>

        {cat === "invest" && (
          <nav className="ss-subcats" aria-label="投资栏目">
            <span className="ss-subcats-label">栏目</span>
            <button
              className={`ss-subcat ${lane === "all" ? "on" : ""}`}
              onClick={() => setLane("all")}
            >
              全部栏目 <span className="ss-cat-n">{INVEST_COUNT}</span>
            </button>
            {INVEST_SECTION_LIST.map((sec) => (
              <button
                key={sec.key}
                className={`ss-subcat ${lane === sec.key ? "on" : ""}`}
                onClick={() => setLane(sec.key)}
                title={sec.desc}
              >
                {sec.label}
                {sec.en && <span className="ss-cat-en">{sec.en}</span>}
                <span className="ss-cat-n">{sec.count}</span>
              </button>
            ))}
          </nav>
        )}

        {visible.length === 0 ? (
          <p className="ss-empty">没有匹配的内容，换个关键词试试。</p>
        ) : showLanes ? (
          INVEST_SECTION_LIST.map((sec) => {
            const items = visible.filter((s) => s.section === sec.key);
            if (!items.length) return null;
            return (
              <section className="ss-lane" key={sec.key} aria-label={sec.label}>
                <header className="ss-lane-h">
                  <h2>{sec.label}</h2>
                  {sec.en && <span className="ss-lane-en">{sec.en}</span>}
                  {sec.desc && <span className="ss-lane-desc">{sec.desc}</span>}
                  <span className="ss-lane-n">{items.length} 篇</span>
                </header>
                <StudyGrid studies={items} />
              </section>
            );
          })
        ) : (
          <StudyGrid studies={visible} />
        )}
      </main>

      <footer className="ss-footer">
        <p>
          {STUDIES.length} 篇研习 · {CATEGORY_LIST.length} 个分类 · 投资下设世界观与方法论
          · 由 Vite + React 静态生成，托管于 GitHub Pages
        </p>
      </footer>
    </div>
  );
}

function catLabel(key) {
  const c = CATEGORY_LIST.find((x) => x.key === key);
  return c ? c.label : key;
}

function StudyGrid({ studies }) {
  return (
    <ul className="ss-grid">
      {studies.map((s) => (
        <li key={s.id}>
          <Link className="ss-card" to={`/s/${s.category}/${s.slug}`}>
            <div className="ss-card-top">
              <span className="ss-card-badges">
                <span className={`ss-badge ss-badge-${s.category}`}>
                  {catLabel(s.category)}
                </span>
                {s.sectionLabel && (
                  <span className={`ss-badge ss-badge-lane ss-badge-lane-${s.section}`}>
                    {s.sectionLabel}
                  </span>
                )}
              </span>
              {s.date && <span className="ss-date">{s.date}</span>}
            </div>
            <h2 className="ss-card-title">{s.title}</h2>
            {s.subtitle && <p className="ss-card-sub">{s.subtitle}</p>}
            {s.description && <p className="ss-card-desc">{s.description}</p>}
            {s.tags?.length > 0 && (
              <div className="ss-tags">
                {s.tags.map((t) => (
                  <span className="ss-tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            <span className="ss-card-go">阅读 →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
