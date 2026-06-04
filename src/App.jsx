import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Study from "./pages/Study.jsx";

// 用 HashRouter：GitHub Pages 没有 SPA 路由回退，hash 路由（/#/...）
// 可以直接分享深链接、刷新不 404。
// HashRouter avoids GitHub Pages' lack of SPA fallback — deep links & refresh just work.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/s/:category/:slug" element={<Study />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
