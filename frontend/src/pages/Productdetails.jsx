import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Trophy,
} from "lucide-react";

import {
  api,
  useApi,
  formatPrice,
  formatChange,
  formatRupeeChange,
  formatLastUpdated,
  getRelativeTime,
} from "../api";

import ApiError from "../components/APIerror";


/*
--------------------------------------------------
PRICE CHANGE DISPLAY
--------------------------------------------------
*/

function ChangeValue({ value, showIcon = true }) {
  const number = Number(value) || 0;

  if (number > 0) {
    return (
      <span className="text-up flex items-center gap-1">
        {showIcon && (
          <ArrowUpRight className="size-4" />
        )}

        +{number.toFixed(2)}%
      </span>
    );
  }

  if (number < 0) {
    return (
      <span className="text-down flex items-center gap-1">
        {showIcon && (
          <ArrowDownRight className="size-4" />
        )}

        {number.toFixed(2)}%
      </span>
    );
  }

  return (
    <span className="text-muted-foreground">
      0.00%
    </span>
  );
}


/*
--------------------------------------------------
METRIC CARD
--------------------------------------------------
*/

function Metric({ label, value, sub }) {
  return (
    <div className="bg-card border border-border rounded-md p-4">
      <div className="text-[10px] font-display tracking-widest text-muted-foreground">
        {label}
      </div>

      <div className="font-display text-xl font-bold mt-2">
        {value}
      </div>

      {sub && (
        <div className="text-xs text-muted-foreground mt-1">
          {sub}
        </div>
      )}
    </div>
  );
}


/*
--------------------------------------------------
PRICE HISTORY CHART
--------------------------------------------------
*/

function PriceChart({ history }) {
  if (!history || history.length < 2) {
    return (
      <div className="h-72 flex items-center justify-center border border-dashed border-border rounded-md">
        <div className="text-sm text-muted-foreground">
          Not enough price history to display a chart.
        </div>
      </div>
    );
  }

  const width = 900;
  const height = 300;

  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const prices = history.map(
    (item) => Number(item.price) || 0
  );

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const range =
    maxPrice - minPrice || 1;

  const points = history.map(
    (item, index) => {
      const x =
        paddingLeft +
        (index /
          Math.max(history.length - 1, 1)) *
          (width -
            paddingLeft -
            paddingRight);

      const y =
        paddingTop +
        ((maxPrice - Number(item.price)) /
          range) *
          (height -
            paddingTop -
            paddingBottom);

      return {
        x,
        y,
        price: Number(item.price),
        time: item.time,
      };
    }
  );

  const linePoints = points
    .map(
      (point) =>
        `${point.x},${point.y}`
    )
    .join(" ");

  const areaPoints = [
    `${paddingLeft},${height - paddingBottom}`,

    ...points.map(
      (point) =>
        `${point.x},${point.y}`
    ),

    `${points[points.length - 1].x},${
      height - paddingBottom
    }`,
  ].join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-140 h-72"
        preserveAspectRatio="none"
      >

        {[0, 1, 2, 3, 4].map(
          (line) => {
            const y =
              paddingTop +
              (line / 4) *
                (height -
                  paddingTop -
                  paddingBottom);

            const value =
              maxPrice -
              (line / 4) * range;

            return (
              <g key={line}>

                <line
                  x1={paddingLeft}
                  x2={width - paddingRight}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-border"
                  strokeWidth="1"
                />

                <text
                  x="5"
                  y={y + 4}
                  className="fill-muted-foreground"
                  fontSize="11"
                >
                  ₹{value.toFixed(0)}
                </text>

              </g>
            );
          }
        )}

        <polygon
          points={areaPoints}
          fill="currentColor"
          className="text-primary opacity-10"
        />

        <polyline
          points={linePoints}
          fill="none"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map(
          (point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="currentColor"
              className="text-primary"
            />
          )
        )}

        <text
          x={paddingLeft}
          y={height - 12}
          className="fill-muted-foreground"
          fontSize="11"
        >
          {formatChartDate(
            history[0]?.time
          )}
        </text>

        <text
          x={width - paddingRight}
          y={height - 12}
          textAnchor="end"
          className="fill-muted-foreground"
          fontSize="11"
        >
          {formatChartDate(
            history[
              history.length - 1
            ]?.time
          )}
        </text>

      </svg>
    </div>
  );
}


/*
--------------------------------------------------
CHART DATE
--------------------------------------------------
*/

function formatChartDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
}


/*
--------------------------------------------------
SUPPLIER COMPARISON
--------------------------------------------------
*/

function SupplierComparison({
  comparison,
  loading,
  error,
}) {
  if (loading) {
    return (
      <section>

        <div className="flex items-center gap-2 mb-4">
          <Trophy className="size-4 text-primary" />

          <h2 className="text-sm font-semibold">
            Supplier Comparison
          </h2>
        </div>

        <div className="bg-card border border-border rounded-md p-5">

          <div className="space-y-3">

            <div className="h-4 w-40 bg-accent animate-pulse rounded" />

            <div className="h-10 w-full bg-accent animate-pulse rounded" />

            <div className="h-10 w-full bg-accent animate-pulse rounded" />

            <div className="h-10 w-full bg-accent animate-pulse rounded" />

          </div>

        </div>

      </section>
    );
  }

  if (error) {
    return null;
  }

  const suppliers =
    comparison?.suppliers || [];

  /*
  Don't show the section if there is
  nothing meaningful to compare.
  */

  if (suppliers.length < 2) {
    return null;
  }

  const lowestPrice =
    comparison?.lowestPrice != null
      ? Number(comparison.lowestPrice)
      : Math.min(
          ...suppliers.map(
            (supplier) =>
              Number(supplier.price) || 0
          )
        );

  return (
    <section>

      <div className="flex items-center justify-between gap-4 mb-4">

        <div className="flex items-center gap-2">

          <Trophy className="size-4 text-primary" />

          <h2 className="text-sm font-semibold">
            Supplier Comparison
          </h2>

        </div>

        <div className="text-[10px] font-display tracking-widest text-muted-foreground">
          {suppliers.length} SUPPLIERS
        </div>

      </div>


      <div className="bg-card border border-border rounded-md overflow-hidden">

        {/* Table header */}

        <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 border-b border-border text-[10px] font-display tracking-widest text-muted-foreground">

          <div>
            SUPPLIER
          </div>

          <div className="text-right">
            PRICE
          </div>

          <div className="text-right">
            24H
          </div>

        </div>


        {/* Suppliers */}

        <div className="divide-y divide-border">

          {suppliers.map(
            (supplier) => {
              const supplierPrice =
                Number(
                  supplier.price
                ) || 0;

              const isLowest =
                Math.abs(
                  supplierPrice -
                    lowestPrice
                ) < 0.001;

              const supplierChange =
                Number(
                  supplier.changePct
                ) || 0;

              return (
                <Link
                  key={supplier.id}
                  to={`/products/${supplier.id}`}
                  className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-4 py-3 hover:bg-accent/50 transition-colors"
                >

                  <div className="min-w-0">

                    <div className="flex items-center gap-2">

                      <span className="text-sm font-medium truncate">
                        {supplier.supplier}
                      </span>

                      {isLowest && (
                        <span className="shrink-0 text-[9px] font-display tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          LOWEST
                        </span>
                      )}

                    </div>

                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {supplier.grade}
                    </div>

                  </div>


                  <div className="text-sm font-display font-semibold text-right whitespace-nowrap">
                    {formatPrice(
                      supplierPrice
                    )}
                  </div>


                  <div className="text-xs font-display text-right whitespace-nowrap">

                    <ChangeValue
                      value={
                        supplierChange
                      }
                      showIcon={false}
                    />

                  </div>

                </Link>
              );
            }
          )}

        </div>


        {/* Lowest price summary */}

        <div className="border-t border-border px-4 py-4 bg-accent/20">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

            <div>

              <div className="text-[10px] font-display tracking-widest text-muted-foreground">
                LOWEST AVAILABLE PRICE
              </div>

              <div className="font-display text-lg font-bold mt-1">
                {formatPrice(
                  lowestPrice
                )}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  /kg
                </span>
              </div>

            </div>

            <div className="text-xs text-muted-foreground">
              Based on currently available supplier records
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}


/*
--------------------------------------------------
PRODUCT DETAILS
--------------------------------------------------
*/

export default function ProductDetails() {
  const { id } = useParams();


  /*
  PRODUCT
  */

  const {
    data: product,
    error: productError,
    loading: productLoading,
  } = useApi(
    () => api.product(id),
    [id]
  );


  /*
  HISTORY
  */

  const {
    data: history,
    error: historyError,
    loading: historyLoading,
  } = useApi(
    () => api.history(id),
    [id]
  );


  /*
  SUPPLIER COMPARISON
  */

  const {
    data: comparison,
    error: comparisonError,
    loading: comparisonLoading,
  } = useApi(
    () => api.comparison(id),
    [id]
  );


  /*
  LOADING
  */

  if (productLoading) {
    return (
      <div className="space-y-4">

        <div className="h-4 w-32 bg-accent animate-pulse rounded" />

        <div className="h-10 w-64 bg-accent animate-pulse rounded" />

        <div className="h-72 bg-accent animate-pulse rounded-md" />

      </div>
    );
  }


  /*
  ERROR
  */

  if (productError) {
    return (
      <ApiError error={productError} />
    );
  }


  if (!product) {
    return (
      <div className="text-sm text-muted-foreground">
        Product not found.
      </div>
    );
  }


  const price =
    Number(product.price) || 0;

  const previousPrice =
    product.previousPrice != null
      ? Number(product.previousPrice)
      : null;

  const priceChange =
    Number(product.priceChange) || 0;

  const changePct =
    Number(product.changePct) || 0;

  const change24h =
    Number(product.change24h) || 0;

  const change7d =
    Number(product.change7d) || 0;


  /*
  HISTORY
  */

  const priceHistory =
    Array.isArray(history)
      ? history
      : [];


  /*
  HIGH / LOW
  */

  const historyPrices =
    priceHistory
      .map(
        (item) =>
          Number(item.price)
      )
      .filter(
        (value) =>
          Number.isFinite(value)
      );

  const historyHigh =
    historyPrices.length
      ? Math.max(
          ...historyPrices
        )
      : price;

  const historyLow =
    historyPrices.length
      ? Math.min(
          ...historyPrices
        )
      : price;


  /*
  DIRECTION
  */

  const direction =
    changePct > 0
      ? "up"
      : changePct < 0
        ? "down"
        : "flat";


  return (
    <div className="space-y-8">

      {/* BACK */}

      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />

        Back to Products
      </Link>


      {/* PRODUCT HEADER */}

      <section className="bg-card border border-border rounded-md">

        <div className="p-5 md:p-7">

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

            <div>

              <div className="text-[10px] font-display tracking-widest text-muted-foreground uppercase">
                {product.category ||
                  "Polymer"}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2">
                {product.name}
              </h1>

              <div className="text-sm text-muted-foreground mt-1">
                {product.grade}
              </div>

            </div>


            <div className="lg:text-right">

              <div className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                {formatPrice(price)}
              </div>

              <div className="text-sm text-muted-foreground mt-1">
                per kg
              </div>

              <div className="flex lg:justify-end mt-3">

                <ChangeValue
                  value={changePct}
                />

              </div>

            </div>

          </div>


          {/* QUICK CHANGE */}

          <div className="border-t border-border mt-6 pt-5">

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">

              <div
                className={`flex items-center gap-2 font-display text-lg font-semibold ${
                  direction === "up"
                    ? "text-up"
                    : direction === "down"
                      ? "text-down"
                      : "text-muted-foreground"
                }`}
              >

                {direction === "up" && (
                  <ArrowUpRight className="size-5" />
                )}

                {direction === "down" && (
                  <ArrowDownRight className="size-5" />
                )}

                {formatRupeeChange(
                  priceChange
                )}

              </div>


              <div className="text-sm text-muted-foreground">
                {formatChange(
                  changePct
                )}
              </div>


              <div className="hidden sm:block h-4 w-px bg-border" />


              <div className="text-xs text-muted-foreground flex items-center gap-2">

                <Clock className="size-3.5" />

                Updated{" "}
                {getRelativeTime(
                  product.lastUpdated
                )}

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* PRICE METRICS */}

      <section>

        <div className="flex items-center gap-2 mb-4">

          <Activity className="size-4 text-primary" />

          <h2 className="text-sm font-semibold">
            Price Intelligence
          </h2>

        </div>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          <Metric
            label="24H CHANGE"
            value={
              formatChange(
                change24h
              )
            }
            sub="Compared with 24h ago"
          />

          <Metric
            label="7D CHANGE"
            value={
              formatChange(
                change7d
              )
            }
            sub="Compared with 7d ago"
          />

          <Metric
            label="PREVIOUS PRICE"
            value={
              previousPrice != null
                ? formatPrice(
                    previousPrice
                  )
                : "—"
            }
            sub="Previous recorded price"
          />

          <Metric
            label="PRICE CHANGE"
            value={
              formatRupeeChange(
                priceChange
              )
            }
            sub="Since previous record"
          />

        </div>

      </section>


      {/* SUPPLIER COMPARISON */}

      <SupplierComparison
        comparison={comparison}
        loading={comparisonLoading}
        error={comparisonError}
      />


      {/* HISTORY CHART */}

      <section className="bg-card border border-border rounded-md">

        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

          <div>

            <h2 className="text-sm font-semibold">
              Price History
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              Historical recorded prices
            </p>

          </div>


          <div className="text-xs font-display text-muted-foreground">
            {priceHistory.length} records
          </div>

        </div>


        <div className="p-5">

          {historyLoading && (
            <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
              Loading price history…
            </div>
          )}


          {!historyLoading &&
            historyError && (
              <div className="h-72 flex items-center justify-center text-sm text-down">
                Unable to load price history.
              </div>
            )}


          {!historyLoading &&
            !historyError && (
              <PriceChart
                history={
                  priceHistory
                }
              />
            )}

        </div>

      </section>


      {/* HISTORY STATISTICS */}

      <section>

        <div className="flex items-center gap-2 mb-4">

          {changePct >= 0 ? (
            <TrendingUp className="size-4 text-up" />
          ) : (
            <TrendingDown className="size-4 text-down" />
          )}

          <h2 className="text-sm font-semibold">
            Historical Range
          </h2>

        </div>


        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

          <Metric
            label="HIGH"
            value={formatPrice(
              historyHigh
            )}
            sub="Highest recorded price"
          />

          <Metric
            label="LOW"
            value={formatPrice(
              historyLow
            )}
            sub="Lowest recorded price"
          />

          <Metric
            label="CURRENT"
            value={formatPrice(
              price
            )}
            sub="Latest price"
          />

        </div>

      </section>


      {/* LAST UPDATED */}

      <section className="border border-border rounded-md p-4 bg-card">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div>

            <div className="text-[10px] font-display tracking-widest text-muted-foreground">
              LAST UPDATED
            </div>

            <div className="text-sm font-semibold mt-1">
              {formatLastUpdated(
                product.lastUpdated
              )}
            </div>

          </div>


          <div className="text-xs text-muted-foreground">
            Data: indicative / market reference
          </div>

        </div>

      </section>

    </div>
  );
}