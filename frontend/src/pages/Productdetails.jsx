/*
Productdetails.jsx

Responsibilities:
1. Fetch one product from the FastAPI backend.
2. Fetch its historical prices.
3. Switch between 30D / 90D / 1Y history.
4. Calculate period change, high and low.
5. Display a responsive price chart.
6. Manage watchlist state.
7. Provide alert, datasheet and RFQ actions.
8. Keep the page fully responsive on mobile.
*/

import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  FileText,
  Bell,
  MapPin,
  ChevronRight,
} from "lucide-react";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { api, useApi } from "../api";
import { useWatchlist } from "../lib/watchlist";
import ApiError from "../components/APIerror";


const RANGES = [
  { key: "30", label: "30D", days: 30 },
  { key: "90", label: "90D", days: 90 },
  { key: "365", label: "1Y", days: 365 },
];


function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toFixed(2);
}


function formatPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toFixed(2);
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


function Metric({ label, value, tone }) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] sm:text-[10px] font-display tracking-widest text-muted-foreground">
        {label}
      </div>

      <div
        className={`
          font-display
          text-lg
          sm:text-xl
          font-bold
          mt-1
          truncate
          ${
            tone === "up"
              ? "text-up"
              : tone === "down"
                ? "text-down"
                : ""
          }
        `}
      >
        {value}
      </div>
    </div>
  );
}


function Row({ k, v }) {
  return (
    <div
      className="
        flex
        flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-1
        border-b
        border-border/50
        pb-2
      "
    >
      <dt className="text-muted-foreground">
        {k}
      </dt>

      <dd className="font-medium sm:text-right break-words">
        {v || "—"}
      </dd>
    </div>
  );
}


function ChangeBadge({ value }) {
  const change = Number(value) || 0;

  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-up">
        <ArrowUpRight className="size-4" />
        +{formatPercent(change)}%
      </span>
    );
  }

  if (change < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-down">
        <ArrowDownRight className="size-4" />
        {formatPercent(change)}%
      </span>
    );
  }

  return (
    <span className="text-muted-foreground">
      0.00%
    </span>
  );
}


export default function ProductDetails() {
  const { id } = useParams();

  const { has, toggle } = useWatchlist();

  const [range, setRange] = useState(RANGES[0]);


  const {
    data: product,
    error: prodErr,
    loading: prodLoad,
  } = useApi(
    () => api.product(id),
    [id]
  );


  const {
    data: history,
    error: histErr,
  } = useApi(
    () => api.history(id).catch(() => []),
    [id]
  );


  if (prodLoad) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-32 bg-secondary rounded animate-pulse" />
        <div className="h-8 w-2/3 bg-secondary rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-secondary rounded animate-pulse" />

        <div className="h-80 bg-card border border-border rounded-lg animate-pulse" />
      </div>
    );
  }


  if (prodErr) {
    return <ApiError error={prodErr} />;
  }


  if (!product) {
    return (
      <div className="text-center py-20 px-4">
        <h1 className="text-xl font-bold">
          Product not found
        </h1>

        <Link
          to="/products"
          className="
            text-primary
            text-sm
            mt-2
            inline-flex
            items-center
            gap-1
          "
        >
          <ArrowLeft className="size-3" />
          Back to products
        </Link>
      </div>
    );
  }


  const fullHistory = history || [];

  const data = fullHistory.slice(-range.days);

  const first =
    data[0]?.price ??
    product.currentPrice;

  const periodChange =
    first
      ? ((product.currentPrice - first) / first) * 100
      : 0;

  const high =
    data.length
      ? Math.max(...data.map((d) => d.price))
      : product.currentPrice;

  const low =
    data.length
      ? Math.min(...data.map((d) => d.price))
      : product.currentPrice;


  const watchlisted = has(product.id);


  return (
    <div className="w-full min-w-0">

      {/* =====================================================
          BACK
      ====================================================== */}

      <Link
        to="/products"
        className="
          inline-flex
          items-center
          gap-1
          text-xs
          text-muted-foreground
          hover:text-foreground
          mb-5
          sm:mb-6
        "
      >
        <ArrowLeft className="size-3.5" />
        Back to products
      </Link>


      {/* =====================================================
          PRODUCT HEADER
      ====================================================== */}

      <section
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-start
          lg:justify-between
          mb-6
          sm:mb-8
        "
      >

        {/* Product identity */}
        <div className="min-w-0">

          <div
            className="
              text-[9px]
              sm:text-[10px]
              font-display
              tracking-widest
              text-muted-foreground
              mb-2
              uppercase
            "
          >
            {product.category || "OTHER"}
            {" · "}
            {product.supplier || "—"}
          </div>


          <h1
            className="
              text-2xl
              sm:text-3xl
              lg:text-4xl
              font-bold
              tracking-tight
              break-words
            "
          >
            {product.name}
          </h1>


          <div
            className="
              flex
              flex-wrap
              items-center
              gap-x-2
              gap-y-2
              mt-3
              text-xs
              sm:text-sm
              text-muted-foreground
              font-mono
            "
          >
            <span>{product.grade || "—"}</span>

            <span className="text-border">
              ·
            </span>

            <span>{product.mfi || "—"}</span>

            <span className="text-border">
              ·
            </span>

            <span className="inline-flex items-center gap-1 min-w-0">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">
                {product.location || "—"}
              </span>
            </span>
          </div>

        </div>


        {/* Current price */}
        <div
          className="
            w-full
            lg:w-auto
            lg:min-w-[230px]
            lg:text-right
            bg-card
            border
            border-border
            rounded-lg
            p-4
            sm:p-5
          "
        >

          <div className="text-[9px] font-display tracking-widest text-muted-foreground">
            CURRENT PRICE
          </div>

          <div
            className="
              font-display
              text-3xl
              sm:text-4xl
              font-bold
              tracking-tight
              mt-1
            "
          >
            ₹{formatPrice(product.currentPrice)}
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            INR / KG
          </div>

          <div className="mt-3 text-sm font-display">
            <ChangeBadge value={product.changePct} />
            <span className="text-muted-foreground ml-1">
              24h
            </span>
          </div>

          {product.lastUpdated && (
            <div className="text-[10px] text-muted-foreground mt-2">
              Updated {formatDateTime(product.lastUpdated)}
            </div>
          )}

        </div>

      </section>


      {/* =====================================================
          ACTIONS
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-2
          sm:flex
          sm:flex-wrap
          gap-2
          mb-6
        "
      >

        <button
          type="button"
          onClick={() => toggle(product.id)}
          aria-pressed={watchlisted}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            min-h-11
            px-3
            border
            border-border
            rounded-md
            text-xs
            sm:text-sm
            hover:border-primary
            hover:bg-accent
            transition-colors
          "
        >
          <Star
            className={`
              size-4
              ${
                watchlisted
                  ? "fill-primary text-primary"
                  : ""
              }
            `}
          />

          <span className="truncate">
            {watchlisted
              ? "In watchlist"
              : "Add to watchlist"}
          </span>
        </button>


        <Link
          to={`/alerts?productId=${product.id}`}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            min-h-11
            px-3
            border
            border-border
            rounded-md
            text-xs
            sm:text-sm
            hover:border-primary
            hover:bg-accent
            transition-colors
          "
        >
          <Bell className="size-4 shrink-0" />
          <span>Set alert</span>
        </Link>


        {product.datasheetUrl &&
        product.datasheetUrl !== "#" ? (
          <a
            href={product.datasheetUrl}
            target="_blank"
            rel="noreferrer"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              min-h-11
              px-3
              border
              border-border
              rounded-md
              text-xs
              sm:text-sm
              hover:border-primary
              hover:bg-accent
              transition-colors
            "
          >
            <FileText className="size-4 shrink-0" />
            <span>Datasheet</span>
          </a>
        ) : (
          <span
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              min-h-11
              px-3
              border
              border-border
              rounded-md
              text-xs
              sm:text-sm
              text-muted-foreground/50
            "
          >
            <FileText className="size-4" />
            No datasheet
          </span>
        )}


        <button
          type="button"
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            min-h-11
            px-3
            bg-primary
            text-primary-foreground
            rounded-md
            text-xs
            sm:text-sm
            font-medium
            hover:opacity-90
            transition-opacity
          "
        >
          Request Quote
          <ChevronRight className="size-3.5" />
        </button>

      </div>


      {/* =====================================================
          PRICE HISTORY
      ====================================================== */}

      <section
        className="
          bg-card
          border
          border-border
          rounded-lg
          p-4
          sm:p-5
          mb-6
        "
      >

        {/* Header */}
        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-start
            sm:justify-between
            mb-5
          "
        >

          <div>
            <h2 className="text-sm font-semibold">
              Price History
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              Indicative spot, INR per KG
            </p>
          </div>


          {/* Range selector */}
          <div
            className="
              flex
              gap-1
              p-1
              bg-secondary
              rounded-md
              w-full
              sm:w-auto
            "
          >
            {RANGES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setRange(item)}
                className={`
                  flex-1
                  sm:flex-none
                  min-h-9
                  px-3
                  text-xs
                  font-display
                  tracking-wider
                  rounded
                  transition-colors
                  ${
                    range.key === item.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {item.label}
              </button>
            ))}
          </div>

        </div>


        {/* Metrics */}
        <div
          className="
            grid
            grid-cols-3
            gap-2
            sm:gap-4
            mb-6
            p-3
            sm:p-0
            bg-secondary/30
            sm:bg-transparent
            rounded-md
          "
        >

          <Metric
            label="PERIOD CHANGE"
            value={`
              ${periodChange > 0 ? "+" : ""}
              ${formatPercent(periodChange)}%
            `}
            tone={
              periodChange > 0
                ? "up"
                : periodChange < 0
                  ? "down"
                  : undefined
            }
          />

          <Metric
            label="PERIOD HIGH"
            value={`₹${formatPrice(high)}`}
          />

          <Metric
            label="PERIOD LOW"
            value={`₹${formatPrice(low)}`}
          />

        </div>


        {/* Chart */}
        <div
          className="
            h-[260px]
            sm:h-[320px]
            lg:h-[360px]
            w-full
            min-w-0
          "
        >

          {data.length === 0 ? (
            <div
              className="
                h-full
                flex
                items-center
                justify-center
                text-sm
                text-muted-foreground
                text-center
                px-4
              "
            >
              {histErr
                ? "Couldn't load price history."
                : "No price history yet."}
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 4,
                  left: -10,
                  bottom: 0,
                }}
              >

                <defs>
                  <linearGradient
                    id="priceGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--primary)"
                      stopOpacity={0.4}
                    />

                    <stop
                      offset="100%"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>


                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="2 4"
                  vertical={false}
                />


                <XAxis
                  dataKey="date"
                  stroke="var(--muted-foreground)"
                  tick={{
                    fontSize: 9,
                    fontFamily:
                      "var(--font-display)",
                  }}
                  tickFormatter={(value) =>
                    String(value).slice(5)
                  }
                  minTickGap={30}
                  tickMargin={6}
                />


                <YAxis
                  stroke="var(--muted-foreground)"
                  tick={{
                    fontSize: 9,
                    fontFamily:
                      "var(--font-display)",
                  }}
                  domain={["auto", "auto"]}
                  tickFormatter={(value) =>
                    `₹${value}`
                  }
                  width={50}
                />


                <Tooltip
                  contentStyle={{
                    background:
                      "var(--popover)",
                    border:
                      "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  labelStyle={{
                    color:
                      "var(--muted-foreground)",
                    fontFamily:
                      "var(--font-display)",
                  }}
                  formatter={(value) => [
                    `₹${Number(value).toFixed(2)}`,
                    "Price",
                  ]}
                />


                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#priceGrad)"
                  dot={false}
                  activeDot={{
                    r: 4,
                  }}
                />

              </AreaChart>
            </ResponsiveContainer>
          )}

        </div>

      </section>


      {/* =====================================================
          SUPPLIER INFORMATION
      ====================================================== */}

      <section
        className="
          bg-card
          border
          border-border
          rounded-lg
          p-4
          sm:p-5
        "
      >

        <h3 className="text-sm font-semibold mb-4">
          Supplier Information
        </h3>


        <dl className="space-y-3 text-sm">

          <Row
            k="Supplier"
            v={product.supplier}
          />

          <Row
            k="Plant / Location"
            v={product.location}
          />

          <Row
            k="Category"
            v={product.category}
          />

          <Row
            k="Grade"
            v={product.grade}
          />

          <Row
            k="MFI / Specification"
            v={product.mfi}
          />

          <Row
            k="Last Updated"
            v={formatDateTime(product.lastUpdated)}
          />

        </dl>

      </section>


      {/* =====================================================
          MOBILE BOTTOM ACTION
      ====================================================== */}

      <div className="h-20 sm:hidden" />

      <div
        className="
          sm:hidden
          fixed
          bottom-0
          left-0
          right-0
          z-30
          border-t
          border-border
          bg-background/95
          backdrop-blur
          p-3
        "
      >
        <Link
          to="/products"
          className="
            flex
            items-center
            justify-center
            gap-2
            w-full
            min-h-11
            rounded-md
            bg-primary
            text-primary-foreground
            text-sm
            font-medium
          "
        >
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
      </div>

    </div>
  );
}