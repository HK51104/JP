import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { api, useApi, formatPrice, formatChange } from "../api";
import ApiError from "../components/APIerror";


/*
--------------------------------------------------
CHANGE DISPLAY
--------------------------------------------------
*/

function Change({ value }) {
  const number = Number(value) || 0;

  if (number > 0) {
    return (
      <span className="text-up flex items-center gap-1 font-display text-xs">
        <ArrowUpRight className="size-3.5" />
        +{number.toFixed(2)}%
      </span>
    );
  }

  if (number < 0) {
    return (
      <span className="text-down flex items-center gap-1 font-display text-xs">
        <ArrowDownRight className="size-3.5" />
        {number.toFixed(2)}%
      </span>
    );
  }

  return (
    <span className="text-muted-foreground font-display text-xs">
      0.00%
    </span>
  );
}


/*
--------------------------------------------------
PRODUCT ROW
--------------------------------------------------
*/

function ProductRow({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group grid grid-cols-[minmax(0,1fr)_110px_110px_110px] md:grid-cols-[minmax(0,1fr)_140px_130px_130px] items-center gap-3 px-4 py-4 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors"
    >
      {/* PRODUCT */}

      <div className="min-w-0">
        <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
          {product.name}
        </div>

        <div className="text-xs text-muted-foreground mt-1 truncate">
          {product.grade}
        </div>
      </div>


      {/* PRICE */}

      <div className="text-right">
        <div className="font-display font-semibold text-sm">
          {formatPrice(product.price)}
        </div>

        <div className="text-[10px] text-muted-foreground mt-1">
          INR / KG
        </div>
      </div>


      {/* ₹ CHANGE */}

      <div className="text-right">
        <div
          className={
            product.priceChange > 0
              ? "text-up font-display text-xs"
              : product.priceChange < 0
                ? "text-down font-display text-xs"
                : "text-muted-foreground font-display text-xs"
          }
        >
          {product.priceChange > 0
            ? "+"
            : product.priceChange < 0
              ? "-"
              : ""}
          ₹{Math.abs(
            Number(product.priceChange) || 0
          ).toFixed(2)}
        </div>

        <div className="mt-1">
          <Change
            value={product.changePct}
          />
        </div>
      </div>


      {/* 24H */}

      <div className="text-right">
        <Change
          value={product.change24h}
        />

        <div className="text-[10px] text-muted-foreground mt-1">
          24H
        </div>
      </div>
    </Link>
  );
}


/*
--------------------------------------------------
PRODUCTS PAGE
--------------------------------------------------
*/

export default function Products() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const {
    data: products,
    error,
    loading,
  } = useApi(
    () => api.products(),
    []
  );


  /*
  ----------------------------------------------
  SEARCH / FILTER STATE
  ----------------------------------------------
  */

  const initialCategory =
    searchParams.get("category") || "All";

  const [search, setSearch] =
    React.useState("");

  const [category, setCategory] =
    React.useState(initialCategory);

  const [sort, setSort] =
    React.useState("default");


  /*
  ----------------------------------------------
  LOAD
  ----------------------------------------------
  */

  if (loading) {
    return (
      <div className="space-y-4">

        <div className="h-8 w-48 bg-accent animate-pulse rounded" />

        <div className="h-12 w-full bg-accent animate-pulse rounded-md" />

        <div className="h-96 bg-accent animate-pulse rounded-md" />

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


  const list =
    Array.isArray(products)
      ? products
      : [];


  /*
  ----------------------------------------------
  CATEGORIES
  ----------------------------------------------
  */

  const categories = [
    "All",
    ...Array.from(
      new Set(
        list
          .map(
            (product) =>
              product.category
          )
          .filter(Boolean)
      )
    ).sort(),
  ];


  /*
  ----------------------------------------------
  FILTER
  ----------------------------------------------
  */

  const filtered = list.filter(
    (product) => {

      const searchText =
        search
          .trim()
          .toLowerCase();

      const matchesSearch =
        !searchText ||
        product.name
          .toLowerCase()
          .includes(searchText) ||
        product.grade
          .toLowerCase()
          .includes(searchText) ||
        String(
          product.category || ""
        )
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "All" ||
        product.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );


  /*
  ----------------------------------------------
  SORT
  ----------------------------------------------
  */

  const sorted = [
    ...filtered,
  ];

  if (sort === "price-desc") {
    sorted.sort(
      (a, b) =>
        b.price - a.price
    );
  }

  if (sort === "price-asc") {
    sorted.sort(
      (a, b) =>
        a.price - b.price
    );
  }

  if (sort === "change-desc") {
    sorted.sort(
      (a, b) =>
        b.changePct -
        a.changePct
    );
  }

  if (sort === "change-asc") {
    sorted.sort(
      (a, b) =>
        a.changePct -
        b.changePct
    );
  }

  if (sort === "recent") {
    sorted.sort(
      (a, b) =>
        new Date(
          b.lastUpdated || 0
        ) -
        new Date(
          a.lastUpdated || 0
        )
    );
  }


  /*
  ----------------------------------------------
  CATEGORY UPDATE
  ----------------------------------------------
  */

  function changeCategory(value) {
    setCategory(value);

    if (value === "All") {
      searchParams.delete(
        "category"
      );
    } else {
      searchParams.set(
        "category",
        value
      );
    }

    setSearchParams(
      searchParams
    );
  }


  /*
  ----------------------------------------------
  RESET
  ----------------------------------------------
  */

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setSort("default");

    setSearchParams({});
  }


  const hasFilters =
    search ||
    category !== "All" ||
    sort !== "default";


  /*
  ----------------------------------------------
  RENDER
  ----------------------------------------------
  */

  return (
    <div className="space-y-6">


      {/* ---------------------------------------
          HEADER
      ---------------------------------------- */}

      <div>

        <h1 className="text-2xl font-bold tracking-tight">
          Products
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          Polymer grades and indicative
          market prices.
        </p>

      </div>


      {/* ---------------------------------------
          FILTER PANEL
      ---------------------------------------- */}

      <div className="bg-card border border-border rounded-md p-4">

        <div className="flex items-center gap-2 mb-4">

          <SlidersHorizontal className="size-4 text-primary" />

          <span className="text-sm font-semibold">
            Search & Filters
          </span>

          <span className="text-xs text-muted-foreground ml-auto">
            {sorted.length} of {list.length}
          </span>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_180px_180px_auto] gap-3">


          {/* SEARCH */}

          <div className="relative">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search products or grades..."
              className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
            />

          </div>


          {/* CATEGORY */}

          <select
            value={category}
            onChange={(event) =>
              changeCategory(
                event.target.value
              )
            }
            className="h-10 px-3 rounded-md border border-border bg-background text-sm outline-none focus:border-primary"
          >
            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item === "All"
                    ? "All Categories"
                    : item}
                </option>
              )
            )}
          </select>


          {/* SORT */}

          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value
              )
            }
            className="h-10 px-3 rounded-md border border-border bg-background text-sm outline-none focus:border-primary"
          >
            <option value="default">
              Sort: Default
            </option>

            <option value="price-desc">
              Price: High → Low
            </option>

            <option value="price-asc">
              Price: Low → High
            </option>

            <option value="change-desc">
              Change: Highest
            </option>

            <option value="change-asc">
              Change: Lowest
            </option>

            <option value="recent">
              Recently Updated
            </option>
          </select>


          {/* RESET */}

          {hasFilters ? (
            <button
              onClick={resetFilters}
              className="h-10 px-3 inline-flex items-center justify-center gap-2 rounded-md border border-border text-sm hover:bg-accent transition-colors"
            >
              <X className="size-4" />
              Reset
            </button>
          ) : (
            <div />
          )}

        </div>


        {/* CATEGORY CHIPS */}

        <div className="flex gap-2 overflow-x-auto pt-4 pb-1">

          {categories.map(
            (item) => (
              <button
                key={item}
                onClick={() =>
                  changeCategory(item)
                }
                className={`shrink-0 px-3 py-1.5 rounded-md border text-xs font-display transition-colors ${
                  category === item
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {item}
              </button>
            )
          )}

        </div>

      </div>


      {/* ---------------------------------------
          PRODUCT TABLE
      ---------------------------------------- */}

      <div className="bg-card border border-border rounded-md overflow-hidden">

        {/* TABLE HEADER */}

        <div className="overflow-x-auto">

          <div className="min-w-[680px]">

            <div className="grid grid-cols-[minmax(0,1fr)_110px_110px_110px] md:grid-cols-[minmax(0,1fr)_140px_130px_130px] gap-3 px-4 py-3 border-b border-border bg-accent/30 text-[10px] font-display tracking-widest text-muted-foreground">

              <div>
                PRODUCT
              </div>

              <div className="text-right">
                PRICE
              </div>

              <div className="text-right">
                CHANGE
              </div>

              <div className="text-right">
                24H
              </div>

            </div>


            {/* EMPTY */}

            {sorted.length === 0 && (
              <div className="py-16 text-center">

                <div className="text-sm font-medium">
                  No products found
                </div>

                <div className="text-xs text-muted-foreground mt-1">
                  Try changing your search
                  or filters.
                </div>

                <button
                  onClick={resetFilters}
                  className="mt-4 text-xs text-primary hover:underline"
                >
                  Clear filters
                </button>

              </div>
            )}


            {/* PRODUCTS */}

            {sorted.map(
              (product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                />
              )
            )}

          </div>

        </div>

      </div>


      {/* ---------------------------------------
          FOOTER INFO
      ---------------------------------------- */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">

        <span>
          Showing {sorted.length} of{" "}
          {list.length} products
        </span>

        <span>
          Prices are indicative and
          denominated in INR/kg.
        </span>

      </div>

    </div>
  );
}