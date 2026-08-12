import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  Star,
  Trash2,
  Search,
} from "lucide-react";

import {
  api,
  useApi,
  formatPrice,
  formatChange,
} from "../api";

import ApiError from "../components/APIerror";


const WATCHLIST_KEY = "polymetric_watchlist";


/*
--------------------------------------------------
WATCHLIST STORAGE
--------------------------------------------------
*/

function readWatchlist() {
  try {
    const stored = localStorage.getItem(
      WATCHLIST_KEY
    );

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}


function saveWatchlist(ids) {
  localStorage.setItem(
    WATCHLIST_KEY,
    JSON.stringify(ids)
  );
}


/*
--------------------------------------------------
CHANGE DISPLAY
--------------------------------------------------
*/

function Change({ value }) {
  const number = Number(value) || 0;

  if (number > 0) {
    return (
      <span className="text-up flex items-center gap-1">
        <ArrowUpRight className="size-3.5" />
        +{number.toFixed(2)}%
      </span>
    );
  }

  if (number < 0) {
    return (
      <span className="text-down flex items-center gap-1">
        <ArrowDownRight className="size-3.5" />
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
WATCHLIST ROW
--------------------------------------------------
*/

function WatchlistRow({
  product,
  onRemove,
}) {
  return (
    <div className="group grid grid-cols-[minmax(0,1fr)_110px_100px_45px] md:grid-cols-[minmax(0,1fr)_140px_120px_55px] items-center gap-3 px-4 py-4 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors">

      {/* PRODUCT */}

      <Link
        to={`/products/${product.id}`}
        className="min-w-0"
      >
        <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
          {product.name}
        </div>

        <div className="text-xs text-muted-foreground mt-1 truncate">
          {product.grade}
        </div>
      </Link>


      {/* PRICE */}

      <Link
        to={`/products/${product.id}`}
        className="text-right"
      >
        <div className="font-display font-semibold text-sm">
          {formatPrice(product.price)}
        </div>

        <div className="text-[10px] text-muted-foreground mt-1">
          INR / KG
        </div>
      </Link>


      {/* CHANGE */}

      <Link
        to={`/products/${product.id}`}
        className="text-right text-xs font-display"
      >
        <Change
          value={product.changePct}
        />

        <div className="text-[10px] text-muted-foreground mt-1">
          24H
        </div>
      </Link>


      {/* REMOVE */}

      <button
        type="button"
        onClick={() =>
          onRemove(product.id)
        }
        aria-label={`Remove ${product.name} from watchlist`}
        className="size-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-down hover:bg-down/10 transition-colors"
      >
        <Trash2 className="size-4" />
      </button>

    </div>
  );
}


/*
--------------------------------------------------
WATCHLIST PAGE
--------------------------------------------------
*/

export default function Watchlist() {

  const {
    data: products,
    error,
    loading,
  } = useApi(
    () => api.products(),
    []
  );


  const [
    watchlistIds,
    setWatchlistIds,
  ] = useState(readWatchlist);


  const [
    search,
    setSearch,
  ] = useState("");


  /*
  ----------------------------------------------
  KEEP LOCAL STORAGE IN SYNC
  ----------------------------------------------
  */

  useEffect(() => {
    saveWatchlist(watchlistIds);
  }, [watchlistIds]);


  /*
  ----------------------------------------------
  REMOVE PRODUCT
  ----------------------------------------------
  */

  function removeProduct(id) {
    setWatchlistIds((current) =>
      current.filter(
        (item) =>
          String(item) !== String(id)
      )
    );
  }


  /*
  ----------------------------------------------
  CLEAR ALL
  ----------------------------------------------
  */

  function clearAll() {
    setWatchlistIds([]);
  }


  /*
  ----------------------------------------------
  WATCHLIST PRODUCTS
  ----------------------------------------------
  */

  const watchlistProducts =
    useMemo(() => {

      if (!Array.isArray(products)) {
        return [];
      }

      const ids = new Set(
        watchlistIds.map(String)
      );

      return products.filter(
        (product) =>
          ids.has(
            String(product.id)
          )
      );

    }, [
      products,
      watchlistIds,
    ]);


  /*
  ----------------------------------------------
  SEARCH
  ----------------------------------------------
  */

  const visibleProducts =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return watchlistProducts;
      }

      return watchlistProducts.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(query) ||
          product.grade
            .toLowerCase()
            .includes(query)
      );

    }, [
      watchlistProducts,
      search,
    ]);


  /*
  ----------------------------------------------
  LOADING
  ----------------------------------------------
  */

  if (loading) {
    return (
      <div className="space-y-4">

        <div className="h-8 w-48 bg-accent animate-pulse rounded" />

        <div className="h-12 w-full bg-accent animate-pulse rounded-md" />

        <div className="h-72 bg-accent animate-pulse rounded-md" />

      </div>
    );
  }


  /*
  ----------------------------------------------
  ERROR
  ----------------------------------------------
  */

  if (error) {
    return (
      <ApiError error={error} />
    );
  }


  /*
  ----------------------------------------------
  EMPTY WATCHLIST
  ----------------------------------------------
  */

  if (
    watchlistProducts.length === 0
  ) {
    return (
      <div className="space-y-8">

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            My Watchlist
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Track the polymer grades you care about.
          </p>
        </div>


        <div className="bg-card border border-border rounded-md p-10 md:p-16 text-center">

          <div className="mx-auto size-12 rounded-full bg-accent flex items-center justify-center">
            <Star className="size-6 text-primary" />
          </div>

          <h2 className="font-semibold mt-5">
            Your watchlist is empty
          </h2>

          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Add products to your watchlist from the
            Products page to keep their prices and
            market movements in one place.
          </p>

          <Link
            to="/products"
            className="inline-flex items-center justify-center px-4 py-2 mt-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Browse Products
          </Link>

        </div>

      </div>
    );
  }


  /*
  ----------------------------------------------
  MAIN
  ----------------------------------------------
  */

  return (
    <div className="space-y-6">


      {/* ---------------------------------------
          HEADER
      ---------------------------------------- */}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

        <div>

          <div className="flex items-center gap-2">

            <Star className="size-5 text-primary fill-primary" />

            <h1 className="text-2xl font-bold tracking-tight">
              My Watchlist
            </h1>

          </div>

          <p className="text-sm text-muted-foreground mt-1">
            {watchlistProducts.length}{" "}
            {watchlistProducts.length === 1
              ? "product"
              : "products"}{" "}
            being tracked.
          </p>

        </div>


        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-border text-xs text-muted-foreground hover:text-down hover:border-down transition-colors"
        >
          <Trash2 className="size-3.5" />
          Clear Watchlist
        </button>

      </div>


      {/* ---------------------------------------
          SEARCH
      ---------------------------------------- */}

      <div className="bg-card border border-border rounded-md p-4">

        <div className="relative">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search your watchlist..."
            className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
          />

        </div>

      </div>


      {/* ---------------------------------------
          TABLE
      ---------------------------------------- */}

      <div className="bg-card border border-border rounded-md overflow-hidden">

        <div className="overflow-x-auto">

          <div className="min-w-[620px]">

            {/* HEADER */}

            <div className="grid grid-cols-[minmax(0,1fr)_110px_100px_45px] md:grid-cols-[minmax(0,1fr)_140px_120px_55px] gap-3 px-4 py-3 border-b border-border bg-accent/30 text-[10px] font-display tracking-widest text-muted-foreground">

              <div>
                PRODUCT
              </div>

              <div className="text-right">
                PRICE
              </div>

              <div className="text-right">
                CHANGE
              </div>

              <div />

            </div>


            {/* SEARCH EMPTY */}

            {visibleProducts.length === 0 && (
              <div className="py-12 text-center">

                <div className="text-sm font-medium">
                  No matching products
                </div>

                <div className="text-xs text-muted-foreground mt-1">
                  Try another search.
                </div>

              </div>
            )}


            {/* ROWS */}

            {visibleProducts.map(
              (product) => (
                <WatchlistRow
                  key={product.id}
                  product={product}
                  onRemove={
                    removeProduct
                  }
                />
              )
            )}

          </div>

        </div>

      </div>


      {/* ---------------------------------------
          FOOTER
      ---------------------------------------- */}

      <div className="text-xs text-muted-foreground">
        Watchlist is stored locally on this device.
      </div>

    </div>
  );
}