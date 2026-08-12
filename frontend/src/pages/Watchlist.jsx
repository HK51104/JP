
/*
Watchlist.jsx

Responsive Watchlist page for POLYMETRIC.

Responsibilities:
1. Display products saved to the user's watchlist.
2. Allow products to be removed from the watchlist.
3. Link each product to its Product Details page.
4. Show current price and daily percentage change.
5. Handle an empty watchlist cleanly.
6. Work properly on mobile, tablet and desktop.
*/

import { Link } from "react-router-dom";
import {
  Star,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Trash2,
} from "lucide-react";

import { useApi, api } from "../api";
import ApiError from "../components/APIerror";
import { useWatchlist } from "../lib/useWatchlist";


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


function WatchlistRow({ product, onRemove }) {
  return (
    <div
      className="
        group
        bg-card
        border
        border-border
        rounded-lg
        p-4
        sm:p-5
        transition-colors
        hover:bg-accent/30
      "
    >
      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          gap-4
        "
      >

        {/* PRODUCT INFORMATION */}

        <div className="flex items-start gap-3 min-w-0 flex-1">

          <div
            className="
              size-9
              sm:size-10
              shrink-0
              rounded-md
              bg-accent
              flex
              items-center
              justify-center
            "
          >
            <Star className="size-4 text-primary fill-primary" />
          </div>


          <div className="min-w-0 flex-1">

            <Link
              to={`/products/${product.id}`}
              className="
                block
                text-sm
                sm:text-base
                font-semibold
                truncate
                hover:text-primary
                transition-colors
              "
            >
              {product.name || "Unnamed Product"}
            </Link>


            <div
              className="
                mt-1
                flex
                flex-wrap
                items-center
                gap-x-2
                gap-y-1
                text-[10px]
                sm:text-xs
                text-muted-foreground
              "
            >
              {product.grade && (
                <span className="font-mono">
                  {product.grade}
                </span>
              )}

              {product.category && (
                <>
                  <span className="text-border">
                    •
                  </span>

                  <span>
                    {product.category}
                  </span>
                </>
              )}

              {product.supplier && product.supplier !== "—" && (
                <>
                  <span className="text-border">
                    •
                  </span>

                  <span className="truncate max-w-32 sm:max-w-none">
                    {product.supplier}
                  </span>
                </>
              )}
            </div>

          </div>

        </div>


        {/* PRICE + CHANGE */}

        <div
          className="
            flex
            items-center
            justify-between
            sm:justify-end
            gap-6
            sm:gap-8
            sm:min-w-48
          "
        >

          <div className="sm:text-right">

            <div
              className="
                text-[9px]
                sm:text-[10px]
                font-display
                tracking-widest
                text-muted-foreground
              "
            >
              CURRENT PRICE
            </div>

            <div
              className="
                mt-0.5
                font-display
                text-lg
                sm:text-xl
                font-bold
              "
            >
              ₹{Number(product.currentPrice || 0).toFixed(2)}
            </div>

          </div>


          <div className="text-xs font-display min-w-16 text-right">
            <ChangeValue value={product.changePct} />
          </div>

        </div>


        {/* ACTIONS */}

        <div
          className="
            flex
            items-center
            gap-2
            sm:ml-2
            sm:border-l
            sm:border-border
            sm:pl-4
          "
        >

          <Link
            to={`/products/${product.id}`}
            title="View product"
            className="
              size-9
              rounded-md
              border
              border-border
              flex
              items-center
              justify-center
              text-muted-foreground
              hover:text-primary
              hover:border-primary
              transition-colors
            "
          >
            <ExternalLink className="size-3.5" />
          </Link>


          <button
            type="button"
            onClick={() => onRemove(product.id)}
            title="Remove from watchlist"
            aria-label={`Remove ${product.name || "product"} from watchlist`}
            className="
              size-9
              rounded-md
              border
              border-border
              flex
              items-center
              justify-center
              text-muted-foreground
              hover:text-down
              hover:border-down
              transition-colors
            "
          >
            <Trash2 className="size-3.5" />
          </button>

        </div>

      </div>
    </div>
  );
}


export default function Watchlist() {

  const {
    data: products,
    error,
    loading,
  } = useApi(
    () => api.products(),
    []
  );


  const {
    has,
    toggle,
  } = useWatchlist();


  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">

        <div>
          <div className="h-7 w-36 bg-secondary rounded" />

          <div className="h-4 w-64 max-w-full bg-secondary rounded mt-2" />
        </div>


        <div className="space-y-3">

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

      </div>
    );
  }


  if (error) {
    return <ApiError error={error} />;
  }


  const allProducts = products || [];


  const watchedProducts = allProducts.filter(
    (product) => has(product.id)
  );


  return (
    <div className="w-full min-w-0">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        className="
          mb-6
          sm:mb-8
          flex
          flex-col
          sm:flex-row
          sm:items-end
          sm:justify-between
          gap-3
        "
      >

        <div>

          <div className="flex items-center gap-2">

            <Star
              className="
                size-5
                sm:size-6
                text-primary
                fill-primary
              "
            />

            <h1
              className="
                text-2xl
                sm:text-3xl
                font-bold
                tracking-tight
              "
            >
              Watchlist
            </h1>

          </div>


          <p
            className="
              text-xs
              sm:text-sm
              text-muted-foreground
              mt-1
            "
          >
            Keep track of the polymer grades you care about.
          </p>

        </div>


        <div
          className="
            text-[10px]
            sm:text-xs
            font-display
            text-muted-foreground
          "
        >
          {watchedProducts.length}{" "}
          {watchedProducts.length === 1
            ? "PRODUCT"
            : "PRODUCTS"}{" "}
          WATCHING
        </div>

      </div>


      {/* =====================================================
          EMPTY WATCHLIST
      ====================================================== */}

      {watchedProducts.length === 0 ? (
        <div
          className="
            bg-card
            border
            border-border
            rounded-lg
            p-8
            sm:p-12
            text-center
          "
        >

          <div
            className="
              mx-auto
              size-12
              sm:size-14
              rounded-full
              bg-accent
              flex
              items-center
              justify-center
              mb-4
            "
          >
            <Star
              className="
                size-5
                sm:size-6
                text-muted-foreground
              "
            />
          </div>


          <h2 className="text-base sm:text-lg font-semibold">
            Your watchlist is empty
          </h2>


          <p
            className="
              text-xs
              sm:text-sm
              text-muted-foreground
              max-w-md
              mx-auto
              mt-2
            "
          >
            Add polymer grades to your watchlist to
            quickly monitor their prices and market movement.
          </p>


          <Link
            to="/products"
            className="
              inline-flex
              items-center
              justify-center
              mt-5
              px-4
              py-2
              rounded-md
              bg-primary
              text-primary-foreground
              text-xs
              sm:text-sm
              font-medium
              hover:opacity-90
              transition-opacity
            "
          >
            Browse Products
          </Link>

        </div>
      ) : (

        /* ===================================================
           WATCHLIST PRODUCTS
        ==================================================== */

        <div className="space-y-3">

          {watchedProducts.map((product) => (
            <WatchlistRow
              key={product.id}
              product={product}
              onRemove={toggle}
            />
          ))}

        </div>

      )}


      {/* =====================================================
          FOOTER INFORMATION
      ====================================================== */}

      {watchedProducts.length > 0 && (
        <div
          className="
            mt-5
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-2
            text-[10px]
            sm:text-xs
            text-muted-foreground
          "
        >

          <span>
            Prices are indicative and may change with market conditions.
          </span>


          <Link
            to="/products"
            className="
              text-primary
              hover:underline
              shrink-0
            "
          >
            Browse all products →
          </Link>

        </div>
      )}

    </div>
  );
}

