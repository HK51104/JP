/*
Dashboard.jsx

Responsibilities:
1. Fetch products from the backend.
2. Handle loading and API errors.
3. Calculate dashboard statistics.
4. Calculate category averages.
5. Calculate top movers.
6. Render the market overview.
7. Remain responsive across mobile, tablet and desktop.

Mobile-first improvements:
- 2-column statistic cards on phones.
- Responsive category grid.
- Responsive Top Movers section.
- Comfortable touch targets.
- No unnecessary horizontal overflow.
- Better empty-state handling.
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


/* =========================================================
   STAT CARD
   ========================================================= */

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div
      className="
        bg-card
        border
        border-border
        rounded-md
        p-3
        sm:p-5
        min-w-0
        overflow-hidden
      "
    >
      {/* Header */}

      <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
        <span
          className="
            text-[8px]
            sm:text-[10px]
            font-display
            tracking-widest
            text-muted-foreground
            truncate
          "
        >
          {label}
        </span>

        <Icon
          className="
            size-3.5
            sm:size-4
            text-muted-foreground
            shrink-0
          "
        />
      </div>

      {/* Main value */}

      <div
        className="
          font-display
          text-xl
          sm:text-3xl
          font-bold
          tracking-tight
          truncate
        "
      >
        {value}
      </div>

      {/* Subtitle */}

      {sub && (
        <div
          className="
            text-[10px]
            sm:text-xs
            text-muted-foreground
            mt-1
            truncate
          "
        >
          {sub}
        </div>
      )}
    </div>
  );
}


/* =========================================================
   CHANGE DISPLAY
   ========================================================= */

function ChangeValue({ value }) {
  const numericValue = Number(value) || 0;

  const positive = numericValue > 0;
  const negative = numericValue < 0;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1
        whitespace-nowrap
        ${
          positive
            ? "text-up"
            : negative
            ? "text-down"
            : "text-muted-foreground"
        }
      `}
    >
      {positive && (
        <ArrowUpRight className="size-3 shrink-0" />
      )}

      {negative && (
        <ArrowDownRight className="size-3 shrink-0" />
      )}

      {positive ? "+" : ""}
      {numericValue.toFixed(2)}%
    </span>
  );
}


/* =========================================================
   DASHBOARD
   ========================================================= */

export default function Dashboard() {
  const {
    data: products,
    error,
    loading,
  } = useApi(() => api.products(), []);


  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="space-y-4">
        <div
          className="
            h-7
            w-44
            rounded-md
            bg-accent
            animate-pulse
          "
        />

        <div
          className="
            h-4
            w-72
            max-w-full
            rounded-md
            bg-accent
            animate-pulse
          "
        />

        <div
          className="
            grid
            grid-cols-2
            gap-3
            mt-6
          "
        >
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="
                h-28
                rounded-md
                bg-accent
                animate-pulse
              "
            />
          ))}
        </div>
      </div>
    );
  }


  /* =========================================================
     ERROR
     ========================================================= */

  if (error) {
    return <ApiError error={error} />;
  }


  /* =========================================================
     DATA
     ========================================================= */

  const list = Array.isArray(products)
    ? products
    : [];


  const avgs = computeCategoryAverages(list);

  const movers = computeTopMovers(list);

  const {
    categories,
    updatedToday,
    avgChange,
  } = computeDashboardStats(list);


  /* =========================================================
     EMPTY STATE
     ========================================================= */

  if (list.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1
            className="
              text-xl
              sm:text-2xl
              font-bold
              tracking-tight
              text-foreground
            "
          >
            Market Overview
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Indicative spot prices for primary polymer grades — India market.
          </p>
        </div>

        <div
          className="
            bg-card
            border
            border-border
            rounded-md
            p-6
            sm:p-10
            text-center
          "
        >
          <Boxes
            className="
              size-8
              mx-auto
              mb-3
              text-muted-foreground
            "
          />

          <h2 className="font-semibold">
            No products available
          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            The backend did not return any products.
          </p>

          <Link
            to="/products"
            className="
              inline-flex
              items-center
              justify-center
              mt-5
              px-4
              py-2.5
              rounded-md
              bg-primary
              text-primary-foreground
              text-sm
              font-medium
              hover:opacity-90
              transition-opacity
            "
          >
            View Products
          </Link>
        </div>
      </div>
    );
  }


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      {/* =======================================================
          MARKET OVERVIEW
          ======================================================= */}

      <section className="mb-6 sm:mb-8">
        <h1
          className="
            text-xl
            sm:text-2xl
            font-bold
            tracking-tight
            text-foreground
          "
        >
          Market Overview
        </h1>

        <p
          className="
            text-xs
            sm:text-sm
            text-muted-foreground
            leading-relaxed
            mt-1
            max-w-2xl
          "
        >
          Indicative spot prices for primary polymer grades — India market.
        </p>
      </section>


      {/* =======================================================
          MARKET STATS
          ======================================================= */}

      <section
        className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-3
          sm:gap-4
          mb-6
          sm:mb-8
        "
      >
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
      </section>


      {/* =======================================================
          CATEGORY AVERAGES + TOP MOVERS
          ======================================================= */}

      <section
        className="
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-4
          sm:gap-6
          mb-6
          sm:mb-8
          min-w-0
        "
      >

        {/* =====================================================
            CATEGORY AVERAGES
            ===================================================== */}

        <div
          className="
            lg:col-span-2
            bg-card
            border
            border-border
            rounded-md
            min-w-0
            overflow-hidden
          "
        >

          {/* Header */}

          <div
            className="
              px-4
              sm:px-5
              py-4
              border-b
              border-border
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <h2 className="text-sm font-semibold tracking-tight">
              Category Averages
            </h2>

            <Link
              to="/products"
              className="
                text-[10px]
                sm:text-[11px]
                font-display
                text-primary
                hover:underline
                whitespace-nowrap
                shrink-0
                px-2
                py-1
              "
            >
              VIEW ALL →
            </Link>
          </div>


          {/* Category cards */}

          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              divide-x
              divide-y
              divide-border
            "
          >
            {avgs.map((c) => (
              <Link
                key={c.category}
                to={`/products?category=${encodeURIComponent(
                  c.category
                )}`}
                className="
                  p-3
                  sm:p-4
                  min-w-0
                  min-h-24
                  hover:bg-accent/50
                  active:bg-accent
                  transition-colors
                  group
                  flex
                  flex-col
                  justify-center
                "
              >

                {/* Category */}

                <div
                  className="
                    text-[9px]
                    sm:text-[10px]
                    font-display
                    tracking-widest
                    text-muted-foreground
                    truncate
                  "
                >
                  {c.category}
                </div>


                {/* Average price */}

                <div
                  className="
                    font-display
                    text-base
                    sm:text-xl
                    font-bold
                    mt-1
                    truncate
                  "
                >
                  ₹{Number(c.avg).toFixed(2)}
                </div>


                {/* Change */}

                <div
                  className="
                    text-[10px]
                    sm:text-xs
                    mt-1
                  "
                >
                  <ChangeValue value={c.change} />
                </div>

              </Link>
            ))}
          </div>
        </div>


        {/* =====================================================
            TOP MOVERS
            ===================================================== */}

        <div
          className="
            bg-card
            border
            border-border
            rounded-md
            min-w-0
            overflow-hidden
          "
        >

          {/* Header */}

          <div
            className="
              px-4
              sm:px-5
              py-4
              border-b
              border-border
            "
          >
            <h2 className="text-sm font-semibold tracking-tight">
              Top Movers
            </h2>
          </div>


          <div className="p-2">

            {/* Gainers */}

            <div
              className="
                text-[9px]
                sm:text-[10px]
                font-display
                tracking-widest
                text-up
                px-3
                pt-2
                pb-1
              "
            >
              ▲ GAINERS
            </div>


            {movers.gainers.length > 0 ? (
              movers.gainers.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    px-3
                    py-2.5
                    rounded
                    hover:bg-accent
                    active:bg-accent
                    transition-colors
                    text-xs
                    sm:text-sm
                    min-w-0
                  "
                >

                  <span
                    className="
                      truncate
                      min-w-0
                    "
                  >
                    {p.name}

                    <span
                      className="
                        text-muted-foreground
                        font-mono
                        text-[10px]
                        sm:text-xs
                        ml-1
                      "
                    >
                      {p.grade}
                    </span>
                  </span>


                  <span
                    className="
                      text-up
                      font-display
                      text-[10px]
                      sm:text-xs
                      whitespace-nowrap
                      shrink-0
                    "
                  >
                    {p.changePct >= 0 ? "+" : ""}
                    {Number(p.changePct).toFixed(2)}%
                  </span>

                </Link>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-muted-foreground">
                No gainers available.
              </div>
            )}


            {/* Losers */}

            <div
              className="
                text-[9px]
                sm:text-[10px]
                font-display
                tracking-widest
                text-down
                px-3
                pt-4
                pb-1
              "
            >
              ▼ LOSERS
            </div>


            {movers.losers.length > 0 ? (
              movers.losers.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    px-3
                    py-2.5
                    rounded
                    hover:bg-accent
                    active:bg-accent
                    transition-colors
                    text-xs
                    sm:text-sm
                    min-w-0
                  "
                >

                  <span
                    className="
                      truncate
                      min-w-0
                    "
                  >
                    {p.name}

                    <span
                      className="
                        text-muted-foreground
                        font-mono
                        text-[10px]
                        sm:text-xs
                        ml-1
                      "
                    >
                      {p.grade}
                    </span>
                  </span>


                  <span
                    className="
                      text-down
                      font-display
                      text-[10px]
                      sm:text-xs
                      whitespace-nowrap
                      shrink-0
                    "
                  >
                    {Number(p.changePct) >= 0 ? "+" : ""}
                    {Number(p.changePct).toFixed(2)}%
                  </span>

                </Link>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-muted-foreground">
                No losers available.
              </div>
            )}

          </div>
        </div>

      </section>


      {/* =======================================================
          BROWSE BY CATEGORY
          ======================================================= */}

      <section
        className="
          bg-card
          border
          border-border
          rounded-md
          overflow-hidden
        "
      >

        {/* Header */}

        <div
          className="
            px-4
            sm:px-5
            py-4
            border-b
            border-border
          "
        >
          <h2 className="text-sm font-semibold tracking-tight">
            Browse by Category
          </h2>
        </div>


        {/* Categories */}

        <div
          className="
            p-3
            sm:p-4
            flex
            flex-wrap
            gap-2
          "
        >
          {categories.map((c) => (
            <Link
              key={c}
              to={`/products?category=${encodeURIComponent(c)}`}
              className="
                px-3
                sm:px-4
                py-2.5
                border
                border-border
                rounded-md
                text-xs
                sm:text-sm
                font-display
                hover:border-primary
                hover:text-primary
                active:bg-accent
                transition-colors
                whitespace-nowrap
                min-h-10
                flex
                items-center
              "
            >
              {c}
            </Link>
          ))}
        </div>

      </section>
    </>
  );
}