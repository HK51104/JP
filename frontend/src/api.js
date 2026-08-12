import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://jp-pfin.onrender.com";

async function getJSON(path) {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData?.detail) {
        message = errorData.detail;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

/*
--------------------------------------------------
PRODUCT NORMALIZATION
--------------------------------------------------

Backend:

{
  id,
  product_name,
  product_grade,
  current_price,
  previous_price,
  price_change,
  change_pct,
  change_24h,
  change_7d,
  last_updated,
  category
}

Frontend:

{
  id,
  name,
  grade,
  price,
  previousPrice,
  priceChange,
  changePct,
  change24h,
  change7d,
  lastUpdated,
  category
}
*/

export function normalizeProduct(p = {}) {
  const price = Number(p.current_price ?? p.price ?? 0);

  const previousPrice =
    p.previous_price != null
      ? Number(p.previous_price)
      : null;

  const priceChange =
    p.price_change != null
      ? Number(p.price_change)
      : previousPrice != null
        ? price - previousPrice
        : 0;

  const changePct =
    p.change_pct != null
      ? Number(p.change_pct)
      : previousPrice != null && previousPrice !== 0
        ? ((price - previousPrice) / previousPrice) * 100
        : 0;

  const change24h =
    p.change_24h != null
      ? Number(p.change_24h)
      : Number(p.changePct ?? 0);

  const change7d =
    p.change_7d != null
      ? Number(p.change_7d)
      : 0;

  return {
    id: p.id,

    name:
      p.product_name ??
      p.name ??
      "Unknown Product",

    grade:
      p.product_grade ??
      p.grade ??
      "",

    price,

    previousPrice,

    priceChange,

    changePct,

    change24h,

    change7d,

    lastUpdated:
      p.last_updated ??
      p.lastUpdated ??
      null,

    category:
      p.category ??
      "Uncategorized",
  };
}


/*
--------------------------------------------------
API
--------------------------------------------------
*/

export const api = {

  /*
  PRODUCTS
  */

  products: () =>
    getJSON("/products").then((data) => {
      console.log("RAW BACKEND PRODUCTS:", data);

      return (Array.isArray(data) ? data : [])
        .map(normalizeProduct);
    }),


  /*
  SINGLE PRODUCT
  */

  product: (id) =>
    getJSON(`/products/${id}`)
      .then(normalizeProduct),


  /*
  PRICE HISTORY
  */

  history: (id) =>
    getJSON(`/products/${id}/history`)
      .then((data) =>
        Array.isArray(data)
          ? data.map((item) => ({
              price:
                Number(item.price) || 0,

              time:
                item.time ??
                item.recorded_at ??
                null,
            }))
          : []
      ),

/*
SUPPLIER COMPARISON
*/

comparison: (id) =>
  getJSON(`/products/${id}/comparison`)
    .then((data) => ({
      product: data?.product
        ? normalizeProduct(data.product)
        : null,

      suppliers: Array.isArray(data?.suppliers)
        ? data.suppliers.map((supplier) => ({
            id: supplier.id,

            supplier:
              supplier.supplier ??
              supplier.name ??
              "Unknown Supplier",

            grade:
              supplier.grade ??
              "",

            price:
              Number(supplier.price) || 0,

            changePct:
              Number(
                supplier.changePct ??
                supplier.change_pct ??
                0
              ),

            lastUpdated:
              supplier.lastUpdated ??
              supplier.last_updated ??
              null,
          }))
        : [],

      lowestPrice:
        data?.lowestPrice != null
          ? Number(data.lowestPrice)
          : null,

      supplierCount:
        Number(data?.supplierCount) ||
        0,
    })),
  /*
  STATS
  */

  stats: () =>
    getJSON("/stats"),


  /*
  TOP MOVERS
  */

 topMovers: () =>
  getJSON("/top-movers"),


  /*
  CATEGORIES
  */

  categories: () =>
    getJSON("/categories")
      .then((data) =>
        Array.isArray(data)
          ? data
          : []
      ),
};


/*
--------------------------------------------------
REUSABLE API HOOK
--------------------------------------------------
*/

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
      .then((result) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return {
    data,
    error,
    loading,
  };
}


/*
--------------------------------------------------
CATEGORY AVERAGES
--------------------------------------------------

Calculates:

PP average price
HDPE average price
LDPE average price
PVC average price
etc.
*/

export function computeCategoryAverages(products = []) {
  const groups = {};

  for (const product of products) {
    const category =
      product.category ||
      "Uncategorized";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(product);
  }

  return Object.entries(groups)
    .map(([category, items]) => {

      const avg =
        items.reduce(
          (sum, product) =>
            sum + product.price,
          0
        ) / items.length;

      const change =
        items.reduce(
          (sum, product) =>
            sum + product.changePct,
          0
        ) / items.length;

      return {
        category,

        avg: Number(avg.toFixed(2)),

        change: Number(
          change.toFixed(2)
        ),
      };
    })
    .sort((a, b) =>
      a.category.localeCompare(
        b.category
      )
    );
}


/*
--------------------------------------------------
TOP MOVERS
--------------------------------------------------

Frontend fallback calculation.

This is temporary until we upgrade
the backend /top-movers endpoint properly.
*/

export function computeTopMovers(products = []) {
  const sorted = [...products]
    .sort(
      (a, b) =>
        b.changePct - a.changePct
    );

  return {
    gainers: sorted
      .filter(
        (product) =>
          product.changePct > 0
      )
      .slice(0, 5),

    losers: [...products]
      .sort(
        (a, b) =>
          a.changePct - b.changePct
      )
      .filter(
        (product) =>
          product.changePct < 0
      )
      .slice(0, 5),
  };
}


/*
--------------------------------------------------
FORMATTERS
--------------------------------------------------
*/

export function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0.00";
  }

  return `₹${number.toFixed(2)}`;
}


export function formatChange(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00%";
  }

  return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
}


export function formatRupeeChange(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0.00";
  }

  return `${number >= 0 ? "+" : "-"}₹${Math.abs(number).toFixed(2)}`;
}


/*
--------------------------------------------------
DIRECTION HELPERS
--------------------------------------------------
*/

export function getChangeDirection(value) {
  const number = Number(value);

  if (number > 0) {
    return "up";
  }

  if (number < 0) {
    return "down";
  }

  return "flat";
}


export function getChangeColorClass(value) {
  const direction =
    getChangeDirection(value);

  if (direction === "up") {
    return "text-up";
  }

  if (direction === "down") {
    return "text-down";
  }

  return "text-muted-foreground";
}


/*
--------------------------------------------------
DATE / TIME
--------------------------------------------------
*/

export function formatLastUpdated(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


/*
--------------------------------------------------
DATA FRESHNESS
--------------------------------------------------
*/

export function getRelativeTime(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const now = Date.now();

  const diff =
    Math.max(
      0,
      now - date.getTime()
    );

  const minutes =
    Math.floor(
      diff / (1000 * 60)
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  return `${days}d ago`;
}

