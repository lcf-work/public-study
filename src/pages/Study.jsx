import React, { Suspense, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { findStudy, CATEGORY_LIST } from "../registry.js";

export default function Study() {
  const { category, slug } = useParams();
  const study = useMemo(() => findStudy(category, slug), [category, slug]);

  // 切换研习时回到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category, slug]);

  // 浏览器标签标题
  useEffect(() => {
    const prev = document.title;
    if (study) document.title = `${study.title} · studyspace`;
    return () => {
      document.title = prev;
    };
  }, [study]);

  const Lazy = useMemo(
    () => (study ? React.lazy(study.loader) : null),
    [study]
  );

  if (!study) {
    return (
      <div className="ss-notfound">
        <p>没有找到这篇研习。</p>
        <Link className="ss-back-link" to="/">
          ← 返回首页
        </Link>
      </div>
    );
  }

  const cat = CATEGORY_LIST.find((c) => c.key === study.category);

  return (
    <div className="ss-study">
      <div className="ss-topbar">
        <Link className="ss-back" to="/">
          ← 返回
        </Link>
        <div className="ss-topbar-meta">
          <span className={`ss-badge ss-badge-${study.category}`}>
            {cat ? cat.label : study.category}
          </span>
          <span className="ss-topbar-title">{study.title}</span>
        </div>
      </div>

      <div className="ss-study-body">
        <Suspense fallback={<Loading />}>{Lazy && <Lazy />}</Suspense>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="ss-loading">
      <span className="ss-spinner" />
      <span>正在载入…</span>
    </div>
  );
}
