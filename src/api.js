// Centralized API client for the Polymetric backend (FastAPI).
// Configure the base URL via VITE_API_BASE_URL (defaults to local dev server).
//
// Backend returns products shaped like:
//   { id, product_name, product_grade, current_price, last_updated, category }
// History items: { time, price }

import { useEffect, useState } from "react";

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

async function getJSON(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} @ ${path}`);
  return res.json();
}

// ---------- Normalization ----------
// Map raw backend product → UI shape used throughout the app.
const KNOWN_CATEGORIES = ["PPCP", "PP", "HDPE", "LLDPE", "LDPE", "PVC", "PET", "ABS"];

function deriveCategory(p) {
  if (p.category) return p.category;
  const name = (p.product_name || "").toUpperCase();
  return KNOWN_CATEGORIES.find((c) => name.startsWith(c + " ") || name === c) || "OTHER";
}

function deriveSupplier(p) {
  const parts = (p.product_name || "").trim().split(/\s+/);
  return parts.slice(1).join(" ") || parts[0] || "—";
}

function splitGrade(productGrade) {
  if (!productGrade) return { grade: "—", mfi: "—" };
  const [grade, ...rest] = productGrade.split(" - ");
  return { grade: grade.trim(), mfi: rest.join(" - ").trim() || "—" };
}

export function normalizeProduct(p) {
  const { grade, mfi } = splitGrade(p.product_grade);
  return {
    id: String(p.id),
    name: p.product_name,
    supplier: deriveSupplier(p),
    grade,
    mfi,
    category: deriveCategory(p),
    currentPrice: Number(p.current_price) || 0,
    changePct: Number(p.change_pct ?? 0),
    lastUpdated: p.last_updated,
    location: p.location || "—",
    datasheetUrl: p.datasheet_url || "#",
  };
}

export function normalizeHistory(rows) {
  return (rows || [])
    .map((r) => ({
      date: (r.time || r.recorded_at || "").slice(0, 10),
      price: Number(r.price) || 0,
    }))
    .filter((r) => r.date);
}

// ---------- Endpoint helpers ----------
export const api = {
  products: () => getJSON("/products").then((d) => (Array.isArray(d) ? d : []).map(normalizeProduct)),
  product: (id) => getJSON(`/products/${id}`).then(normalizeProduct),
  history: (id) => getJSON(`/products/${id}/history`).then(normalizeHistory),
  dashboard: () => getJSON("/dashboard"),
  topMovers: () => getJSON("/top-movers"),
};

// ---------- Tiny fetch hook ----------
export function useApi(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.resolve()
      .then(fn)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading };
}

// Derived helpers (computed client-side because backend doesn't return them yet)
export function computeCategoryAverages(products) {
  const map = new Map();
  for (const p of products) {
    if (!map.has(p.category)) map.set(p.category, []);
    map.get(p.category).push(p);
  }
  return [...map.entries()].map(([category, items]) => ({
    category,
    avg: Math.round((items.reduce((a, p) => a + p.currentPrice, 0) / items.length) * 100) / 100,
    change: Math.round((items.reduce((a, p) => a + p.changePct, 0) / items.length) * 100) / 100,
    count: items.length,
  }));
}

export function computeTopMovers(products) {
  const sorted = [...products].sort((a, b) => b.changePct - a.changePct);
  return { gainers: sorted.slice(0, 3), losers: sorted.slice(-3).reverse() };
}
