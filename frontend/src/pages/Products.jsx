/*
Products.jsx

Responsibilities:
- Fetch products from the backend.
- Search products.
- Filter by category.
- Add/remove products from watchlist.
- Navigate to product details.
- Open datasheets.
- Display responsive product cards on mobile.
- Display the full table on desktop.

Mobile behavior:
- No horizontal scrolling.
- Products become readable cards.
- Search is full width.
- Category filters are horizontally scrollable.
- Important information stays visible.
*/

import { Link, useSearchParams } from "react-router-dom";

import {
  Search,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ChevronRight,
} from "lucide-react";

import { api, useApi } from "../api";
import ApiError from "../components/APIerror";
import { useWatchlist } from "../lib/watchlist";


/* =========================================================
   MOBILE PRODUCT CARD
   ========================================================= */

function ProductCard({ product, has, toggle }) {
  const change = Number(product.changePct) || 0;

  const isUp = change > 0;
  const isDown = change < 0;

  return (
    <div
      className="
        bg-card
        border
        border-border
        rounded-md
        p-4
        min-w-0
      "
    >
      {/* =====================================================
          TOP ROW
          ===================================================== */}

      <div className="flex items-start justify-between gap-3">

        {/* Product identity */}

        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-2 min-w-0">

            <button
              onClick={() => toggle(product.id)}
              aria-label={
                has(product.id)
                  ? "Remove from watchlist"
                  : "Add to watchlist"
              }
              className="
                shrink-0
                p-1
                -ml-1
                rounded
                hover:bg-accent
                active:bg-accent
                transition-colors
              "
            >
              <Star
                className={`
                  size-4
                  ${
                    has(product.id)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }
                `}
              />
            </button>

            <Link
              to={`/products/${product.id}`}
              className="
                font-medium
                text-sm
                truncate
                hover:text-primary
              "
            >
              {product.name}
            </Link>

          </div>


          <div
            className="
              text-[11px]
              text-muted-foreground
              mt-1
              truncate
              pl-6
            "
          >
            {product.supplier || "Unknown supplier"}
          </div>

        </div>


        {/* Price */}

        <div className="text-right shrink-0">

          <div
            className="
              font-display
              font-semibold
              text-base
              whitespace-nowrap
            "
          >
            ₹{Number(product.currentPrice || 0).toFixed(2)}
          </div>

          <div
            className={`
              inline-flex
              items-center
              justify-end
              gap-0.5
              text-[11px]
              font-display
              mt-1
              ${
                isUp
                  ? "text-up"
                  : isDown
                  ? "text-down"
                  : "text-muted-foreground"
              }
            `}
          >
            {isUp && (
              <ArrowUpRight className="size-3" />
            )}

            {isDown && (
              <ArrowDownRight className="size-3" />
            )}

            {isUp ? "+" : ""}
            {change.toFixed(2)}%
          </div>

        </div>

      </div>


      {/* =====================================================
          PRODUCT DETAILS
          ===================================================== */}

      <div
        className="
          grid
          grid-cols-2
          gap-x-4
          gap-y-3
          mt-4
          pt-4
          border-t
          border-border
        "
      >

        {/* Grade */}

        <div className="min-w-0">

          <div
            className="
              text-[9px]
              font-display
              tracking-widest
              text-muted-foreground
              mb-1
            "
          >
            GRADE
          </div>

          <div
            className="
              font-mono
              text-xs
              truncate
            "
            title={product.grade}
          >
            {product.grade || "—"}
          </div>

        </div>


        {/* MFI */}

        <div className="min-w-0">

          <div
            className="
              text-[9px]
              font-display
              tracking-widest
              text-muted-foreground
              mb-1
            "
          >
            MFI
          </div>

          <div
            className="
              font-mono
              text-xs
              truncate
            "
          >
            {product.mfi || "—"}
          </div>

        </div>


        {/* Category */}

        <div className="min-w-0">

          <div
            className="
              text-[9px]
              font-display
              tracking-widest
              text-muted-foreground
              mb-1
            "
          >
            CATEGORY
          </div>

          <span
            className="
              inline-flex
              max-w-full
              text-[9px]
              font-display
              tracking-widest
              px-2
              py-1
              bg-secondary
              rounded
              truncate
            "
          >
            {product.category || "OTHER"}
          </span>

        </div>


        {/* Location */}

        <div className="min-w-0">

          <div
            className="
              text-[9px]
              font-display
              tracking-widest
              text-muted-foreground
              mb-1
            "
          >
            LOCATION
          </div>

          <div
            className="
              text-xs
              text-muted-foreground
              truncate
            "
          >
            {product.location || "—"}
          </div>

        </div>

      </div>


      {/* =====================================================
          BOTTOM ROW
          ===================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-3
          mt-4
          pt-3
          border-t
          border-border
        "
      >

        <div
          className="
            text-[10px]
            text-muted-foreground
            font-mono
          "
        >
          {product.lastUpdated
            ? new Date(product.lastUpdated).toLocaleString([], {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Not updated"}
        </div>


        <div className="flex items-center gap-3">

          {/* Datasheet */}

          {product.datasheetUrl &&
            product.datasheetUrl !== "#" && (
              <a
                href={product.datasheetUrl}
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  items-center
                  justify-center
                  size-9
                  rounded-md
                  border
                  border-border
                  text-muted-foreground
                  hover:text-primary
                  hover:border-primary
                  active:bg-accent
                  transition-colors
                "
                title="Open datasheet"
                aria-label="Open datasheet"
              >
                <FileText className="size-4" />
              </a>
            )}


          {/* Details */}

          <Link
            to={`/products/${product.id}`}
            className="
              inline-flex
              items-center
              gap-1
              px-3
              py-2
              rounded-md
              border
              border-border
              text-xs
              font-medium
              hover:border-primary
              hover:text-primary
              active:bg-accent
              transition-colors
            "
          >
            Details
            <ChevronRight className="size-3.5" />
          </Link>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   DESKTOP TABLE
   ========================================================= */

function ProductsTable({ products, has, toggle }) {
  return (
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

          {/* =================================================
              HEADER
              ================================================= */}

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

              <th className="text-left px-4 py-3 w-10">
                WATCH
              </th>

              <th className="text-left px-4 py-3">
                PRODUCT
              </th>

              <th className="text-left px-4 py-3">
                GRADE
              </th>

              <th className="text-left px-4 py-3">
                CATEGORY
              </th>

              <th className="text-left px-4 py-3">
                LOCATION
              </th>

              <th className="text-right px-4 py-3">
                PRICE (₹/KG)
              </th>

              <th className="text-right px-4 py-3">
                24H
              </th>

              <th className="text-right px-4 py-3">
                UPDATED
              </th>

              <th className="text-right px-4 py-3">
                DATA
              </th>

            </tr>
          </thead>


          {/* =================================================
              BODY
              ================================================= */}

          <tbody className="divide-y divide-border">

            {products.map((p) => {

              const change = Number(p.changePct) || 0;

              const isUp = change > 0;
              const isDown = change < 0;

              return (
                <tr
                  key={p.id}
                  className="
                    hover:bg-accent/40
                    transition-colors
                  "
                >

                  {/* Watchlist */}

                  <td className="px-4 py-3">

                    <button
                      onClick={() => toggle(p.id)}
                      aria-label={
                        has(p.id)
                          ? "Remove from watchlist"
                          : "Add to watchlist"
                      }
                      className="
                        p-1.5
                        rounded
                        hover:bg-accent
                        transition-colors
                      "
                    >
                      <Star
                        className={`
                          size-4
                          ${
                            has(p.id)
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }
                        `}
                      />
                    </button>

                  </td>


                  {/* Product */}

                  <td className="px-4 py-3">

                    <Link
                      to={`/products/${p.id}`}
                      className="
                        font-medium
                        hover:text-primary
                      "
                    >
                      {p.name}
                    </Link>

                    <div
                      className="
                        text-xs
                        text-muted-foreground
                        mt-0.5
                      "
                    >
                      {p.supplier} · {p.mfi}
                    </div>

                  </td>


                  {/* Grade */}

                  <td className="px-4 py-3 font-mono text-xs">
                    {p.grade || "—"}
                  </td>


                  {/* Category */}

                  <td className="px-4 py-3">

                    <span
                      className="
                        inline-flex
                        text-[10px]
                        font-display
                        tracking-widest
                        px-2
                        py-1
                        bg-secondary
                        rounded
                      "
                    >
                      {p.category || "OTHER"}
                    </span>

                  </td>


                  {/* Location */}

                  <td
                    className="
                      px-4
                      py-3
                      text-muted-foreground
                      text-xs
                    "
                  >
                    {p.location || "—"}
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
                    ₹{Number(p.currentPrice || 0).toFixed(2)}
                  </td>


                  {/* Change */}

                  <td
                    className={`
                      px-4
                      py-3
                      text-right
                      font-display
                      text-xs
                      whitespace-nowrap
                      ${
                        isUp
                          ? "text-up"
                          : isDown
                          ? "text-down"
                          : "text-muted-foreground"
                      }
                    `}
                  >

                    <span className="inline-flex items-center gap-0.5">

                      {isUp && (
                        <ArrowUpRight className="size-3" />
                      )}

                      {isDown && (
                        <ArrowDownRight className="size-3" />
                      )}

                      {isUp ? "+" : ""}
                      {change.toFixed(2)}%

                    </span>

                  </td>


                  {/* Updated */}

                  <td
                    className="
                      px-4
                      py-3
                      text-right
                      text-xs
                      text-muted-foreground
                      font-mono
                      whitespace-nowrap
                    "
                  >
                    {p.lastUpdated
                      ? new Date(
                          p.lastUpdated
                        ).toLocaleString([], {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>


                  {/* Datasheet */}

                  <td className="px-4 py-3 text-right">

                    {p.datasheetUrl &&
                      p.datasheetUrl !== "#" && (
                        <a
                          href={p.datasheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="
                            inline-flex
                            items-center
                            justify-center
                            size-8
                            rounded
                            text-muted-foreground
                            hover:text-primary
                            hover:bg-accent
                            transition-colors
                          "
                          title="Datasheet"
                          aria-label="Open datasheet"
                        >
                          <FileText className="size-3.5" />
                        </a>
                      )}

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}


/* =========================================================
   MAIN PRODUCTS PAGE
   ========================================================= */

export default function Products() {

  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";

  const category =
    params.get("category") ?? "ALL";


  /* Watchlist */

  const {
    has,
    toggle,
  } = useWatchlist();


  /* API */

  const {
    data: products,
    error,
    loading,
  } = useApi(
    () => api.products(),
    []
  );


  /* =========================================================
     URL PARAMETER HELPER
     ========================================================= */

  const setParam = (key, value) => {

    const next =
      new URLSearchParams(params);

    if (
      !value ||
      (
        value === "ALL" &&
        key === "category"
      )
    ) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    setParams(next, {
      replace: true,
    });
  };


  /* =========================================================
     PRODUCTS
     ========================================================= */

  const list = Array.isArray(products)
    ? products
    : [];


  /* =========================================================
     CATEGORIES
     ========================================================= */

  const categories = [
    "ALL",
    ...new Set(
      list
        .map((p) => p.category)
        .filter(Boolean)
    ),
  ];


  /* =========================================================
     FILTERING
     ========================================================= */

  const term = q
    .toLowerCase()
    .trim();


  const filtered = list.filter((p) => {

    const matchCategory =
      category === "ALL" ||
      p.category === category;


    const matchSearch =
      !term ||
      (p.name || "")
        .toLowerCase()
        .includes(term) ||
      (p.grade || "")
        .toLowerCase()
        .includes(term) ||
      (p.supplier || "")
        .toLowerCase()
        .includes(term) ||
      (p.location || "")
        .toLowerCase()
        .includes(term);


    return (
      matchCategory &&
      matchSearch
    );
  });


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div
        className="
          mb-5
          sm:mb-6
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-end
          md:justify-between
        "
      >

        <div className="min-w-0">

          <h1
            className="
              text-xl
              sm:text-2xl
              font-bold
              tracking-tight
            "
          >
            Products
          </h1>

          <p
            className="
              text-xs
              sm:text-sm
              text-muted-foreground
              mt-1
            "
          >
            {loading
              ? "Loading…"
              : `${filtered.length} grades · live indicative pricing`}
          </p>

        </div>


        {/* Search */}

        <div
          className="
            relative
            w-full
            md:w-80
            shrink-0
          "
        >

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
            value={q}
            onChange={(e) =>
              setParam("q", e.target.value)
            }
            placeholder="Search name, grade, supplier…"
            className="
              w-full
              h-11
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
            "
          />

        </div>

      </div>


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error ? (

        <ApiError error={error} />

      ) : (

        <>

          {/* =================================================
              CATEGORY FILTERS
              ================================================= */}

          <div
            className="
              mb-5
              sm:mb-6
              -mx-4
              px-4
              sm:mx-0
              sm:px-0
              overflow-x-auto
              scrollbar-none
            "
          >

            <div
              className="
                flex
                gap-2
                w-max
                sm:w-auto
                sm:flex-wrap
              "
            >

              {categories.map((c) => (

                <button
                  key={c}
                  onClick={() =>
                    setParam("category", c)
                  }
                  className={`
                    min-h-10
                    px-3
                    py-2
                    text-[10px]
                    sm:text-xs
                    font-display
                    tracking-wider
                    rounded
                    border
                    transition-colors
                    whitespace-nowrap
                    shrink-0
                    ${
                      category === c
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 active:bg-accent"
                    }
                  `}
                >
                  {c}
                </button>

              ))}

            </div>

          </div>


          {/* =================================================
              RESULT COUNT
              ================================================= */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              mb-3
              text-[10px]
              sm:text-xs
              text-muted-foreground
            "
          >

            <span>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {list.length}
              </span>{" "}
              products
            </span>

            {category !== "ALL" && (
              <button
                onClick={() =>
                  setParam("category", "ALL")
                }
                className="
                  text-primary
                  hover:underline
                  whitespace-nowrap
                "
              >
                Clear filter
              </button>
            )}

          </div>


          {/* =================================================
              MOBILE CARDS
              ================================================= */}

          <div className="md:hidden space-y-3">

            {loading && (
              <>
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="
                      h-48
                      rounded-md
                      bg-accent
                      animate-pulse
                    "
                  />
                ))}
              </>
            )}


            {!loading &&
              filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  has={has}
                  toggle={toggle}
                />
              ))}


            {!loading &&
              filtered.length === 0 && (
                <div
                  className="
                    bg-card
                    border
                    border-border
                    rounded-md
                    px-5
                    py-12
                    text-center
                  "
                >
                  <Search
                    className="
                      size-7
                      mx-auto
                      mb-3
                      text-muted-foreground
                    "
                  />

                  <div className="text-sm font-medium">
                    No products found
                  </div>

                  <p
                    className="
                      text-xs
                      text-muted-foreground
                      mt-1
                    "
                  >
                    Try another search term or category.
                  </p>

                  {(q || category !== "ALL") && (
                    <button
                      onClick={() => {
                        setParam("q", "");
                        setParam("category", "ALL");
                      }}
                      className="
                        mt-4
                        px-4
                        py-2
                        rounded-md
                        border
                        border-border
                        text-xs
                        hover:border-primary
                        hover:text-primary
                        transition-colors
                      "
                    >
                      Clear filters
                    </button>
                  )}

                </div>
              )}

          </div>


          {/* =================================================
              DESKTOP TABLE
              ================================================= */}

          {!loading &&
            filtered.length > 0 && (
              <ProductsTable
                products={filtered}
                has={has}
                toggle={toggle}
              />
            )}

          {loading && (
            <div
              className="
                hidden
                md:flex
                bg-card
                border
                border-border
                rounded-md
                h-64
                items-center
                justify-center
                text-sm
                text-muted-foreground
              "
            >
              Loading products…
            </div>
          )}

        </>

      )}

    </>
  );
}