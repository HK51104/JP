
/*
Dashboard.jsx

Responsive dashboard for POLYMETRIC.

Responsibilities:
1. Fetch products from the backend.
2. Handle loading and API errors.
3. Calculate category averages.
4. Calculate top gainers and losers.
5. Show market statistics.
6. Show browse-by-category links.
7. Remain fully responsive on mobile, tablet and desktop.
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
} from "../api";

import ApiError from "../components/APIerror";


function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div
      className="
        bg-card
        border
        border-border
        rounded-lg
        p-4
        sm:p-5
        min-w-0
      "
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="
            text-[9px]
            sm:text-[10px]
            font-display
            tracking-widest
            text-muted-foreground
            truncate
            pr-2
          "
        >
          {label}
        </span>

        <Icon className="size-4 text-muted-foreground shrink-0" />
      </div>

      <div
        className="
          font-display
          text-2xl
          sm:text-3xl
          font-bold
          tracking-tight
          truncate
        "
      >
        {value}
      </div>

      {sub && (
        <div className="text-[11px] sm:text-xs text-muted-foreground mt-1">
          {sub}
        </div>
      )}
    </div>
  );
}


function ChangeValue({ value }) {
  const change = Number(value) || 0;

  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-up">
        <ArrowUpRight className="size-3" />
        +{change.toFixed(2)}%
      </span>
    );
  }

  if (change < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-down">
        <ArrowDownRight className="size-3" />
        {change.toFixed(2)}%
      </span>
    );
  }

  return (
    <span className="text-muted-foreground">
      0.00%
    </span>
  );
}


export default function Dashboard() {
  const {
    data: products,
    error,
    loading,
  } = useApi(
    () => api.products(),
    []
  );


  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">

        <div>
          <div className="h-7 w-48 bg-secondary rounded" />
          <div className="h-4 w-72 max-w-full bg-secondary rounded mt-2" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="
                h-28
                bg-card
                border
                border-border
                rounded-lg
              "
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-card border border-border rounded-lg" />
          <div className="h-72 bg-card border border-border rounded-lg" />
        </div>

      </div>
    );
  }


  if (error) {
    return <ApiError error={error} />;
  }


  const list = products || [];

  const avgs = computeCategoryAverages(list);

  const movers = computeTopMovers(list);


  const categories = [
    ...new Set(
      list
        .map((p) => p.category)
        .filter(Boolean)
    ),
  ];


  const today = new Date()
    .toISOString()
    .slice(0, 10);


  const updatedToday = list.filter(
    (p) =>
      (p.lastUpdated || "").startsWith(today)
  ).length;


  const avgChange =
    list.length > 0
      ? list.reduce(
          (total, product) =>
            total + (Number(product.changePct) || 0),
          0
        ) / list.length
      : 0;


  return (
    <div className="w-full min-w-0">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-6 sm:mb-8">

        <h1
          className="
            text-2xl
            sm:text-3xl
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
            mt-1
            max-w-2xl
          "
        >
          Indicative spot prices for primary polymer
          grades — India market.
        </p>

      </div>


      {/* =====================================================
          MARKET STATS
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-2
          lg:grid-cols-4
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
          sub="Latest market updates"
        />


        <Stat
          icon={Activity}
          label="MARKET TREND"
          value={`
            ${avgChange >= 0 ? "+" : ""}
            ${avgChange.toFixed(2)}%
          `}
          sub="Average price change"
        />

      </div>


      {/* =====================================================
          CATEGORY AVERAGES + TOP MOVERS
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-3
          gap-5
          sm:gap-6
          mb-6
          sm:mb-8
        "
      >

        {/* =================================================
            CATEGORY AVERAGES
        ================================================== */}

        <section
          className="
            xl:col-span-2
            bg-card
            border
            border-border
            rounded-lg
            overflow-hidden
            min-w-0
          "
        >

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

            <div className="min-w-0">
              <h2 className="text-sm font-semibold">
                Category Averages
              </h2>

              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Average current price by material
              </p>
            </div>


            <Link
              to="/products"
              className="
                shrink-0
                text-[10px]
                sm:text-[11px]
                font-display
                text-primary
                hover:underline
              "
            >
              VIEW ALL →
            </Link>

          </div>


          {avgs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No category data available.
            </div>
          ) : (
            <div
              className="
                grid
                grid-cols-2
                sm:grid-cols-3
                lg:grid-cols-4
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
                    border-b
                    border-r
                    border-border
                    hover:bg-accent/50
                    transition-colors
                    min-w-0
                  "
                >

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


                  <div
                    className="
                      font-display
                      text-lg
                      sm:text-xl
                      font-bold
                      mt-1
                      truncate
                    "
                  >
                    ₹{Number(c.avg || 0).toFixed(2)}
                  </div>


                  <div className="text-xs mt-1">
                    <ChangeValue value={c.change} />
                  </div>

                </Link>
              ))}

            </div>
          )}

        </section>


        {/* =================================================
            TOP MOVERS
        ================================================== */}

        <section
          className="
            bg-card
            border
            border-border
            rounded-lg
            overflow-hidden
            min-w-0
          "
        >

          <div className="px-4 sm:px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">
              Top Movers
            </h2>

            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Biggest price movements
            </p>
          </div>


          <div className="p-2">

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


            {movers.gainers.length === 0 ? (
              <div className="px-3 py-3 text-xs text-muted-foreground">
                No gainers available.
              </div>
            ) : (
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
                    transition-colors
                    min-w-0
                  "
                >

                  <span className="min-w-0 truncate text-xs sm:text-sm">
                    <span>{p.name}</span>

                    {p.grade && (
                      <span className="text-muted-foreground font-mono text-[10px] sm:text-xs ml-1">
                        {p.grade}
                      </span>
                    )}
                  </span>


                  <span className="text-up font-display text-xs shrink-0">
                    +
                    {Number(p.changePct || 0).toFixed(2)}
                    %
                  </span>

                </Link>
              ))
            )}


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


            {movers.losers.length === 0 ? (
              <div className="px-3 py-3 text-xs text-muted-foreground">
                No losers available.
              </div>
            ) : (
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
                    transition-colors
                    min-w-0
                  "
                >

                  <span className="min-w-0 truncate text-xs sm:text-sm">
                    <span>{p.name}</span>

                    {p.grade && (
                      <span className="text-muted-foreground font-mono text-[10px] sm:text-xs ml-1">
                        {p.grade}
                      </span>
                    )}
                  </span>


                  <span className="text-down font-display text-xs shrink-0">
                    {Number(p.changePct || 0).toFixed(2)}
                    %
                  </span>

                </Link>
              ))
            )}

          </div>

        </section>

      </div>


      {/* =====================================================
          BROWSE BY CATEGORY
      ====================================================== */}

      <section
        className="
          bg-card
          border
          border-border
          rounded-lg
          overflow-hidden
        "
      >

        <div className="px-4 sm:px-5 py-4 border-b border-border">

          <h2 className="text-sm font-semibold">
            Browse by Category
          </h2>

          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
            Explore polymer grades by material
          </p>

        </div>


        <div className="p-4 flex flex-wrap gap-2">

          {categories.length === 0 ? (
            <span className="text-sm text-muted-foreground">
              No categories available.
            </span>
          ) : (
            categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(
                  category
                )}`}
                className="
                  px-3
                  sm:px-4
                  py-2
                  border
                  border-border
                  rounded-md
                  text-xs
                  sm:text-sm
                  font-display
                  hover:border-primary
                  hover:text-primary
                  transition-colors
                  active:scale-[0.98]
                "
              >
                {category}
              </Link>
            ))
          )}

        </div>

      </section>

    </div>
  );
}
```
