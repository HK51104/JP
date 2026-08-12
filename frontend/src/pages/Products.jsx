/*
Products.jsx

Responsibilities:
1. Fetch products from the FastAPI backend.
2. Search products by name, grade, supplier, or category.
3. Filter products by category.
4. Keep search/filter state in the URL.
5. Support the existing watchlist functionality.
6. Show a desktop table.
7. Show responsive mobile product cards.
8. Navigate to product details.
9. Show price movement and update time.
10. Handle loading, empty, and API-error states.
*/

import { Link, useSearchParams } from "react-router-dom";
import { useWatchlist } from "../lib/watchlist";
import { api, useApi } from "../api";
import ApiError from "../components/APIerror";

import {
  Search,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ChevronRight,
} from "lucide-react";


function formatPrice(price) {
  const value = Number(price);

  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return value.toFixed(2);
}


function formatChange(change) {
  const value = Number(change);

  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return value.toFixed(2);
}


function formatUpdatedTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}


function formatUpdatedDate(value) {
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


function ChangeValue({ value }) {
  const change = Number(value) || 0;

  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-up">
        <ArrowUpRight className="size-3.5" />
        +{formatChange(change)}%
      </span>
    );
  }

  if (change < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-down">
        <ArrowDownRight className="size-3.5" />
        {formatChange(change)}%
      </span>
    );
  }

  return (
    <span className="text-muted-foreground">
      0.00%
    </span>
  );
}


function WatchlistButton({ productId, has, toggle }) {
  const active = has(productId);

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-label={
        active
          ? "Remove product from watchlist"
          : "Add product to watchlist"
      }
      aria-pressed={active}
      className="
        inline-flex
        items-center
        justify-center
        size-9
        rounded-md
        border
        border-border
        hover:bg-accent
        transition-colors
        shrink-0
      "
    >
      <Star
        className={`size-4 ${
          active
            ? "fill-primary text-primary"
            : "text-muted-foreground"
        }`}
      />
    </button>
  );
}


function ProductMobileCard({ product, has, toggle }) {
  return (
    <article
      className="
        bg-card
        border
        border-border
        rounded-lg
        p-4
        transition-colors
        hover:border-primary/40
      "
    >
      {/* Top section */}
      <div className="flex items-start gap-3">
        <WatchlistButton
          productId={product.id}
          has={has}
          toggle={toggle}
        />

        <div className="min-w-0 flex-1">
          <Link
            to={`/products/${product.id}`}
            className="
              block
              font-semibold
              text-sm
              leading-5
              hover:text-primary
              transition-colors
            "
          >
            {product.name || "Unnamed product"}
          </Link>

          <div className="mt-1 text-xs text-muted-foreground">
            {product.supplier || "—"}
            {" · "}
            {product.mfi || "—"}
          </div>
        </div>

        <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-1" />
      </div>


      {/* Category + grade */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className="
            inline-flex
            items-center
            px-2
            py-1
            rounded
            bg-secondary
            text-[10px]
            font-display
            tracking-widest
          "
        >
          {product.category || "OTHER"}
        </span>

        <span className="text-xs font-mono text-muted-foreground">
          {product.grade || "—"}
        </span>
      </div>


      {/* Main price */}
      <div
        className="
          mt-4
          flex
          items-end
          justify-between
          gap-4
        "
      >
        <div>
          <div className="text-[10px] font-display tracking-widest text-muted-foreground">
            CURRENT PRICE
          </div>

          <div className="mt-1 font-display text-2xl font-bold">
            ₹{formatPrice(product.currentPrice)}
          </div>

          <div className="text-[10px] text-muted-foreground mt-0.5">
            per kg
          </div>
        </div>

        <div className="text-sm font-display font-semibold">
          <ChangeValue value={product.changePct} />
        </div>
      </div>


      {/* Extra information */}
      <div
        className="
          mt-4
          pt-3
          border-t
          border-border
          grid
          grid-cols-2
          gap-3
        "
      >
        <div>
          <div className="text-[9px] font-display tracking-widest text-muted-foreground">
            LOCATION
          </div>

          <div className="mt-1 text-xs truncate">
            {product.location || "—"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[9px] font-display tracking-widest text-muted-foreground">
            UPDATED
          </div>

          <div className="mt-1 text-xs font-mono">
            {formatUpdatedTime(product.lastUpdated)}
          </div>

          <div className="text-[9px] text-muted-foreground">
            {formatUpdatedDate(product.lastUpdated)}
          </div>
        </div>
      </div>


      {/* Bottom actions */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <Link
          to={`/products/${product.id}`}
          className="
            inline-flex
            items-center
            justify-center
            min-h-10
            px-3
            rounded-md
            bg-accent
            text-xs
            font-medium
            hover:bg-accent/70
            transition-colors
          "
        >
          View details
          <ChevronRight className="size-3.5 ml-1" />
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
              min-h-10
              px-3
              rounded-md
              border
              border-border
              text-xs
              text-muted-foreground
              hover:text-primary
              hover:border-primary/50
              transition-colors
            "
          >
            <FileText className="size-3.5 mr-1.5" />
            Datasheet
          </a>
        ) : (
          <span
            className="
              inline-flex
              items-center
              justify-center
              min-h-10
              px-3
              text-xs
              text-muted-foreground/50
            "
          >
            No datasheet
          </span>
        )}
      </div>
    </article>
  );
}


export default function Products() {
  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "ALL";

  const {
    has,
    toggle,
  } = useWatchlist();

  const {
    data: products,
    error,
    loading,
  } = useApi(() => api.products(), []);


  /*
    Update one URL parameter while preserving
    all other parameters.
  */
  const setParam = (key, value) => {
    const next = new URLSearchParams(params);

    if (
      !value ||
      (value === "ALL" && key === "category")
    ) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    setParams(next, {
      replace: true,
    });
  };


  const list = products || [];


  /*
    Create unique categories.

    "OTHER" is kept as a fallback because some
    backend products may not have a category.
  */
  const categories = [
    "ALL",
    ...new Set(
      list.map((p) => p.category || "OTHER")
    ),
  ];


  /*
    Search + category filtering.
  */
  const term = q.toLowerCase().trim();

  const filtered = list.filter((product) => {
    const productCategory =
      product.category || "OTHER";

    const matchCategory =
      category === "ALL" ||
      productCategory === category;

    const name =
      String(product.name || "").toLowerCase();

    const grade =
      String(product.grade || "").toLowerCase();

    const supplier =
      String(product.supplier || "").toLowerCase();

    const mfi =
      String(product.mfi || "").toLowerCase();

    const location =
      String(product.location || "").toLowerCase();

    const matchSearch =
      !term ||
      name.includes(term) ||
      grade.includes(term) ||
      supplier.includes(term) ||
      mfi.includes(term) ||
      location.includes(term) ||
      productCategory.toLowerCase().includes(term);

    return matchCategory && matchSearch;
  });


  return (
    <div className="w-full min-w-0">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div
        className="
          mb-6
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-end
          md:justify-between
        "
      >
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">
            Products
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? "Loading market data…"
              : `${filtered.length} grades · live indicative pricing`}
          </p>
        </div>


        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              size-4
              text-muted-foreground
            "
          />

          <input
            type="search"
            value={q}
            onChange={(event) =>
              setParam("q", event.target.value)
            }
            placeholder="Search products, grades…"
            aria-label="Search products"
            className="
              w-full
              min-h-11
              bg-card
              border
              border-border
              rounded-md
              pl-9
              pr-3
              text-sm
              placeholder:text-muted-foreground
              focus:outline-none
              focus:border-primary
              focus:ring-1
              focus:ring-primary/30
            "
          />
        </div>
      </div>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error ? (
        <ApiError error={error} />
      ) : (
        <>


          {/* =================================================
              CATEGORY FILTERS
          ================================================== */}

          <div
            className="
              -mx-1
              px-1
              mb-6
              overflow-x-auto
              scrollbar-none
            "
          >
            <div className="flex gap-2 min-w-max">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setParam("category", item)
                  }
                  aria-pressed={category === item}
                  className={`
                    min-h-10
                    px-3
                    rounded-md
                    border
                    text-xs
                    font-display
                    tracking-wider
                    whitespace-nowrap
                    transition-colors
                    ${
                      category === item
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-accent"
                    }
                  `}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>


          {/* =================================================
              ACTIVE FILTER SUMMARY
          ================================================== */}

          {(q || category !== "ALL") && (
            <div
              className="
                mb-4
                flex
                flex-wrap
                items-center
                gap-2
                text-xs
                text-muted-foreground
              "
            >
              <span>
                Showing {filtered.length} result
                {filtered.length === 1 ? "" : "s"}
              </span>

              {category !== "ALL" && (
                <button
                  type="button"
                  onClick={() =>
                    setParam("category", "ALL")
                  }
                  className="
                    px-2
                    py-1
                    rounded
                    bg-accent
                    hover:bg-accent/70
                    transition-colors
                  "
                >
                  {category} ×
                </button>
              )}

              {q && (
                <button
                  type="button"
                  onClick={() =>
                    setParam("q", "")
                  }
                  className="
                    px-2
                    py-1
                    rounded
                    bg-accent
                    hover:bg-accent/70
                    transition-colors
                  "
                >
                  "{q}" ×
                </button>
              )}
            </div>
          )}


          {/* =================================================
              MOBILE VIEW
          ================================================== */}

          <div className="md:hidden">

            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="
                      bg-card
                      border
                      border-border
                      rounded-lg
                      p-4
                      animate-pulse
                    "
                  >
                    <div className="h-4 bg-secondary rounded w-2/3" />
                    <div className="h-3 bg-secondary rounded w-1/3 mt-2" />
                    <div className="h-8 bg-secondary rounded w-1/2 mt-5" />
                    <div className="h-3 bg-secondary rounded w-full mt-4" />
                  </div>
                ))}
              </div>
            )}


            {!loading &&
              filtered.length === 0 && (
                <div
                  className="
                    bg-card
                    border
                    border-border
                    rounded-lg
                    px-4
                    py-12
                    text-center
                  "
                >
                  <Search
                    className="
                      size-8
                      mx-auto
                      text-muted-foreground/50
                    "
                  />

                  <div className="mt-3 text-sm font-medium">
                    No products found
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    Try changing your search or category filter.
                  </div>

                  {(q || category !== "ALL") && (
                    <button
                      type="button"
                      onClick={() => {
                        setParams(
                          {},
                          { replace: true }
                        );
                      }}
                      className="
                        mt-4
                        px-3
                        py-2
                        rounded-md
                        bg-primary
                        text-primary-foreground
                        text-xs
                        font-medium
                      "
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}


            {!loading &&
              filtered.length > 0 && (
                <div className="space-y-3">
                  {filtered.map((product) => (
                    <ProductMobileCard
                      key={product.id}
                      product={product}
                      has={has}
                      toggle={toggle}
                    />
                  ))}
                </div>
              )}

          </div>


          {/* =================================================
              DESKTOP / TABLET VIEW
          ================================================== */}

          <div
            className="
              hidden
              md:block
              bg-card
              border
              border-border
              rounded-md
              overflow-hidden
            "
          >
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead
                  className="
                    bg-secondary/50
                    text-[10px]
                    font-display
                    tracking-widest
                    text-muted-foreground
                  "
                >
                  <tr>

                    <th
                      className="
                        text-left
                        px-4
                        py-3
                        w-12
                      "
                    />

                    <th className="text-left px-4 py-3">
                      PRODUCT
                    </th>

                    <th className="text-left px-4 py-3">
                      GRADE
                    </th>

                    <th
                      className="
                        text-left
                        px-4
                        py-3
                        hidden
                        md:table-cell
                      "
                    >
                      CATEGORY
                    </th>

                    <th
                      className="
                        text-left
                        px-4
                        py-3
                        hidden
                        lg:table-cell
                      "
                    >
                      LOCATION
                    </th>

                    <th
                      className="
                        text-right
                        px-4
                        py-3
                      "
                    >
                      PRICE (₹/KG)
                    </th>

                    <th
                      className="
                        text-right
                        px-4
                        py-3
                      "
                    >
                      24H
                    </th>

                    <th
                      className="
                        text-right
                        px-4
                        py-3
                        hidden
                        lg:table-cell
                      "
                    >
                      UPDATED
                    </th>

                    <th className="text-right px-4 py-3">
                      ACTIONS
                    </th>

                  </tr>
                </thead>


                <tbody className="divide-y divide-border">

                  {loading && (
                    <tr>
                      <td
                        colSpan={9}
                        className="
                          px-4
                          py-16
                          text-center
                          text-sm
                          text-muted-foreground
                        "
                      >
                        Loading products…
                      </td>
                    </tr>
                  )}


                  {!loading &&
                    filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="
                            px-4
                            py-16
                            text-center
                            text-sm
                            text-muted-foreground
                          "
                        >
                          No products match your filters.
                        </td>
                      </tr>
                    )}


                  {!loading &&
                    filtered.map((product) => (
                      <tr
                        key={product.id}
                        className="
                          hover:bg-accent/40
                          transition-colors
                        "
                      >

                        {/* Watchlist */}
                        <td className="px-4 py-3">
                          <WatchlistButton
                            productId={product.id}
                            has={has}
                            toggle={toggle}
                          />
                        </td>


                        {/* Product */}
                        <td className="px-4 py-3">
                          <Link
                            to={`/products/${product.id}`}
                            className="
                              font-medium
                              hover:text-primary
                              transition-colors
                            "
                          >
                            {product.name || "Unnamed product"}
                          </Link>

                          <div
                            className="
                              text-xs
                              text-muted-foreground
                              mt-0.5
                            "
                          >
                            {product.supplier || "—"}
                            {" · "}
                            {product.mfi || "—"}
                          </div>
                        </td>


                        {/* Grade */}
                        <td
                          className="
                            px-4
                            py-3
                            font-mono
                            text-xs
                          "
                        >
                          {product.grade || "—"}
                        </td>


                        {/* Category */}
                        <td className="px-4 py-3">
                          <span
                            className="
                              text-[10px]
                              font-display
                              tracking-widest
                              px-2
                              py-1
                              bg-secondary
                              rounded
                            "
                          >
                            {product.category || "OTHER"}
                          </span>
                        </td>


                        {/* Location */}
                        <td
                          className="
                            px-4
                            py-3
                            hidden
                            lg:table-cell
                            text-muted-foreground
                            text-xs
                          "
                        >
                          {product.location || "—"}
                        </td>


                        {/* Price */}
                        <td
                          className="
                            px-4
                            py-3
                            text-right
                            font-display
                            font-semibold
                            whitespace-nowrap
                          "
                        >
                          ₹{formatPrice(product.currentPrice)}
                        </td>


                        {/* Change */}
                        <td
                          className="
                            px-4
                            py-3
                            text-right
                            font-display
                            text-xs
                            whitespace-nowrap
                          "
                        >
                          <ChangeValue
                            value={product.changePct}
                          />
                        </td>


                        {/* Updated */}
                        <td
                          className="
                            px-4
                            py-3
                            text-right
                            text-xs
                            text-muted-foreground
                            hidden
                            lg:table-cell
                            font-mono
                          "
                        >
                          {formatUpdatedTime(
                            product.lastUpdated
                          )}
                        </td>


                        {/* Actions */}
                        <td
                          className="
                            px-4
                            py-3
                            text-right
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              justify-end
                              gap-2
                            "
                          >

                            <Link
                              to={`/products/${product.id}`}
                              className="
                                inline-flex
                                items-center
                                justify-center
                                size-8
                                rounded
                                hover:bg-accent
                                text-muted-foreground
                                hover:text-primary
                                transition-colors
                              "
                              title="View product"
                              aria-label="View product"
                            >
                              <ChevronRight className="size-4" />
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
                                  size-8
                                  rounded
                                  hover:bg-accent
                                  text-muted-foreground
                                  hover:text-primary
                                  transition-colors
                                "
                                title="Datasheet"
                                aria-label="Open datasheet"
                              >
                                <FileText className="size-3.5" />
                              </a>
                            ) : null}

                          </div>
                        </td>

                      </tr>
                    ))}

                </tbody>
              </table>

            </div>
          </div>

        </>
      )}

    </div>
  );
}