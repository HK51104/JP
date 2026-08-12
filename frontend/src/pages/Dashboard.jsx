/*
Dashboard.jsx — Conclusion
  1. Fetches data from the backend
  2. Handles Loading & Errors
  3. Creates derived data
  4. Uses reusable components
  5. Renders sections
  6. Uses map()
  7. Uses conditional rendering
  8. Uses Links instead of <a>
  9. Uses reusable utility functions from api.js
*/

import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Layers,
  Activity,
  Clock,
} from "lucide-react";

import {
  api,
  useApi,
  computeCategoryAverages,
  computeTopMovers,
  computeDashboardStats,
} from "../api";

import ApiError from "../components/APIerror";


function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-card border border-border rounded-md p-4 sm:p-5 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] sm:text-[10px] font-display tracking-widest text-muted-foreground truncate pr-2">
          {label}
        </span>

        <Icon className="size-4 text-muted-foreground shrink-0" />
      </div>

      <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight truncate">
        {value}
      </div>

      {sub && (
        <div className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">
          {sub}
        </div>
      )}
    </div>
  );
}


export default function Dashboard() {
  const {
    data: products,
    error,
    loading,
  } = useApi(() => api.products(), []);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading market overview…
      </div>
    );
  }

  if (error) {
    return <ApiError error={error} />;
  }

  const list = products || [];

  const avgs = computeCategoryAverages(list);
  const movers = computeTopMovers(list);

const {
  categories,
  updatedToday,
  avgChange,
} = computeDashboardStats(list);


  return (
    <>
      {/* =========================
          MARKET OVERVIEW
      ========================== */}

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 text-foreground">
          Market Overview
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Indicative spot prices for primary polymer grades — India market.
        </p>
      </div>


      {/* =========================
          MARKET STATS
      ========================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">

        <Stat
          icon={Boxes}
          label="TOTAL PRODUCTS"
          value={String(list.length)}
          sub="Active grades tracked"
        />

        <Stat
          icon={Layers}
          label="MATERIALS"
          value={String(categories.length)}
          sub="Resin categories"
        />

        <Stat
          icon={Clock}
          label="UPDATED TODAY"
          value={String(updatedToday)}
          sub="In the last 24h"
        />

        <Stat
          icon={Activity}
          label="MARKET TREND"
          value={`${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`}
          sub="Avg. 24h change"
        />

      </div>


      {/* =========================
          CATEGORY AVERAGES
          + TOP MOVERS
      ========================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">

        {/* CATEGORY AVERAGES */}

        <div className="lg:col-span-2 bg-card border border-border rounded-md min-w-0">

          <div className="px-4 sm:px-5 py-4 border-b border-border flex items-center justify-between gap-3">

            <h2 className="text-sm font-semibold tracking-tight">
              Category Averages
            </h2>

            <Link
              to="/products"
              className="text-[10px] sm:text-[11px] font-display text-primary hover:underline whitespace-nowrap"
            >
              VIEW ALL →
            </Link>

          </div>


          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 divide-x divide-y divide-border">

            {avgs.map((c) => (

              <Link
                key={c.category}
                to={`/products?category=${c.category}`}
                className="p-3 sm:p-4 hover:bg-accent/50 transition-colors group min-w-0"
              >

                <div className="text-[9px] sm:text-[10px] font-display tracking-widest text-muted-foreground truncate">
                  {c.category}
                </div>

                <div className="font-display text-lg sm:text-xl font-bold mt-1 truncate">
                  ₹{c.avg}
                </div>

                <div
                  className={`text-[11px] sm:text-xs mt-1 flex items-center gap-1 ${
                    c.change > 0
                      ? "text-up"
                      : c.change < 0
                      ? "text-down"
                      : "text-muted-foreground"
                  }`}
                >

                  {c.change > 0 ? (
                    <ArrowUpRight className="size-3 shrink-0" />
                  ) : c.change < 0 ? (
                    <ArrowDownRight className="size-3 shrink-0" />
                  ) : null}

                  <span className="truncate">
                    {c.change > 0 ? "+" : ""}
                    {c.change}%
                  </span>

                </div>

              </Link>

            ))}

          </div>

        </div>


        {/* TOP MOVERS */}

        <div className="bg-card border border-border rounded-md min-w-0">

          <div className="px-4 sm:px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold tracking-tight">
              Top Movers
            </h2>
          </div>


          <div className="p-2">

            {/* GAINERS */}

            <div className="text-[9px] sm:text-[10px] font-display tracking-widest text-up px-3 pt-2 pb-1">
              ▲ GAINERS
            </div>


            {movers.gainers.map((p) => (

              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-accent text-xs sm:text-sm min-w-0"
              >

                <span className="truncate min-w-0">
                  {p.name}{" "}
                  <span className="text-muted-foreground font-mono text-[10px] sm:text-xs">
                    {p.grade}
                  </span>
                </span>

                <span className="text-up font-display text-[10px] sm:text-xs whitespace-nowrap shrink-0">
                  {p.changePct >= 0 ? "+" : ""}
                  {p.changePct}%
                </span>

              </Link>

            ))}


            {/* LOSERS */}

            <div className="text-[9px] sm:text-[10px] font-display tracking-widest text-down px-3 pt-3 pb-1">
              ▼ LOSERS
            </div>


            {movers.losers.map((p) => (

              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-accent text-xs sm:text-sm min-w-0"
              >

                <span className="truncate min-w-0">
                  {p.name}{" "}
                  <span className="text-muted-foreground font-mono text-[10px] sm:text-xs">
                    {p.grade}
                  </span>
                </span>

                <span className="text-down font-display text-[10px] sm:text-xs whitespace-nowrap shrink-0">
                  {p.changePct}%
                </span>

              </Link>

            ))}

          </div>

        </div>

      </div>


      {/* =========================
          BROWSE BY CATEGORY
      ========================== */}

      <div className="bg-card border border-border rounded-md">

        <div className="px-4 sm:px-5 py-4 border-b border-border flex items-center justify-between">

          <h2 className="text-sm font-semibold tracking-tight">
            Browse by Category
          </h2>

        </div>


        <div className="p-3 sm:p-4 flex flex-wrap gap-2">

          {categories.map((c) => (

            <Link
              key={c}
              to={`/products?category=${c}`}
              className="px-3 sm:px-4 py-2 border border-border rounded-md text-xs sm:text-sm font-display hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
            >
              {c}
            </Link>

          ))}

        </div>

      </div>

    </>
  );
}