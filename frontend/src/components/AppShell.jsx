/*
CONCLUSION OF AppShell.jsx

AppShell is the main layout component of the application.

It contains the parts of the website that remain visible across
all pages:

- Live polymer market ticker
- Header
- Logo
- Navigation
- Live data indicator
- Theme toggle
- Main page container
- Footer

The actual page displayed inside the layout comes from the `children`
prop, which is provided by App.jsx.

The live ticker now uses real product data from the backend instead
of hardcoded demo values.
*/

import { Link, NavLink } from "react-router-dom";

import {
  Activity,
  LayoutDashboard,
  Boxes,
  Star,
  BellRing,
} from "lucide-react";

import ThemeToggle from "./ThemeToggle";

import { api, useApi } from "../api";


const NAV = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/products",
    label: "Products",
    icon: Boxes,
  },
  {
    to: "/watchlist",
    label: "Watchlist",
    icon: Star,
  },
  {
    to: "/alerts",
    label: "Alerts",
    icon: BellRing,
  },
];


export default function AppShell({ children }) {

  /*
    Fetch the products from the backend.

    The backend now returns products containing:

    {
      id,
      name,
      supplier,
      grade,
      category,
      currentPrice,
      changePct,
      lastUpdated,
      ...
    }

    We use the same API layer already used by Dashboard.jsx.
  */

  const {
    data: products,
  } = useApi(() => api.products(), []);


  /*
    Make sure we always have an array.

    While the API is loading, products may be null.
    Using [] prevents errors such as:

    products.sort(...)
    products.map(...)

    when the data hasn't arrived yet.
  */

  const list = products || [];


  /*
    Create a copy of the products array and sort it
    from the biggest positive price movement to the
    biggest negative price movement.

    We use [...list] so the original API data is NOT modified.
  */

  const sortedProducts = [...list].sort(
    (a, b) => b.changePct - a.changePct
  );


  /*
    Biggest gainer.

    Example:

    PP IOCL       +2.31%
    HDPE ABC      +1.42%
    PVC XYZ       -0.72%

    topGainer = PP IOCL
  */

  const topGainer = sortedProducts[0];


  /*
    Biggest loser.

    Because the array is sorted from highest change
    to lowest change, the last item is the biggest loser.
  */

  const topLoser =
    sortedProducts.length > 0
      ? sortedProducts[sortedProducts.length - 1]
      : null;


  return (
    <div className="min-h-screen flex flex-col">

      {/* =========================================================
          LIVE MARKET TICKER
          ========================================================= */}

      <div
        className="
          h-9
          border-b
          border-border
          bg-card
          flex
          items-center
          px-4
          gap-6
          overflow-hidden
          text-[11px]
          font-display
        "
      >

        {/* POLYMETRIC LIVE label */}

        <div
          className="
            flex
            items-center
            gap-2
            text-primary
            font-bold
            tracking-tight
            shrink-0
          "
        >
          <Activity className="size-3 animate-pulse" />

          POLYMETRIC LIVE
        </div>


        {/* ---------------------------------------------------------
            TOP GAINER
            --------------------------------------------------------- */}

        {topGainer && (
          <>
            <span className="text-muted-foreground shrink-0">
              {topGainer.category || "POLYMER"}
            </span>

            <span
              className="
                truncate
                max-w-32
                sm:max-w-48
                shrink-0
              "
              title={topGainer.name}
            >
              {topGainer.name}
            </span>

            <span
              className="
                text-up
                shrink-0
              "
            >
              {topGainer.changePct >= 0 ? "+" : ""}
              {Number(topGainer.changePct).toFixed(2)}%
            </span>
          </>
        )}


        {/* ---------------------------------------------------------
            TOP LOSER
            --------------------------------------------------------- */}

        {topLoser && (
          <>
            <span className="text-muted-foreground shrink-0">
              {topLoser.category || "POLYMER"}
            </span>

            <span
              className="
                truncate
                max-w-32
                sm:max-w-48
                shrink-0
              "
              title={topLoser.name}
            >
              {topLoser.name}
            </span>

            <span
              className="
                text-down
                shrink-0
              "
            >
              {topLoser.changePct >= 0 ? "+" : ""}
              {Number(topLoser.changePct).toFixed(2)}%
            </span>
          </>
        )}


        {/* ---------------------------------------------------------
            UTC CLOCK

            Hidden on smaller screens so the ticker doesn't
            become overcrowded.
            --------------------------------------------------------- */}

        <span
          className="
            ml-auto
            text-muted-foreground
            hidden
            md:inline
            shrink-0
          "
        >
          UTC {new Date().toUTCString().slice(17, 25)}
        </span>

      </div>


      {/* =========================================================
          HEADER
          ========================================================= */}

      <header
        className="
          border-b
          border-border
          bg-background
        "
      >

        <div
          className="
            max-w-350
            mx-auto
            px-4
            sm:px-6
            h-14
            flex
            items-center
            gap-4
            sm:gap-8
          "
        >

          {/* -------------------------------------------------------
              LOGO
              ------------------------------------------------------- */}

          <Link
            to="/"
            className="
              font-display
              font-bold
              tracking-tighter
              text-base
              shrink-0
            "
          >
            POLY
            <span className="text-primary">
              METRIC
            </span>
          </Link>


          {/* -------------------------------------------------------
              NAVIGATION
              ------------------------------------------------------- */}

          <nav
            className="
              flex
              items-center
              gap-1
              overflow-x-auto
              scrollbar-none
            "
          >

            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `
                    flex
                    items-center
                    gap-2
                    px-2
                    sm:px-3
                    py-1.5
                    text-sm
                    rounded-md
                    transition-colors
                    whitespace-nowrap
                    ${
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }
                  `
                }
              >

                <n.icon className="size-3.5 shrink-0" />

                {n.label}

              </NavLink>
            ))}

          </nav>


          {/* -------------------------------------------------------
              RIGHT SIDE CONTROLS
              ------------------------------------------------------- */}

          <div
            className="
              ml-auto
              flex
              items-center
              gap-3
              sm:gap-4
              shrink-0
            "
          >

            {/* Live data indicator */}

            <div
              className="
                hidden
                sm:flex
                items-center
                gap-2
                text-[11px]
                font-display
                text-muted-foreground
              "
            >

              <div
                className="
                  size-1.5
                  rounded-full
                  bg-up
                  animate-pulse
                "
              />

              LIVE DATA

            </div>


            {/* Theme toggle */}

            <ThemeToggle />

          </div>

        </div>

      </header>


      {/* =========================================================
          MAIN CONTENT
          ========================================================= */}

      <main
        className="
          flex-1
          max-w-350
          mx-auto
          w-full
          px-4
          sm:px-6
          py-6
          sm:py-8
        "
      >
        {children}
      </main>


      {/* =========================================================
          FOOTER
          ========================================================= */}

      <footer
        className="
          border-t
          border-border
          py-4
          px-4
          sm:px-6
          text-[10px]
          font-display
          text-muted-foreground
          flex
          flex-col
          sm:flex-row
          justify-between
          gap-2
          max-w-350
          mx-auto
          w-full
        "
      >

        <span>
          © 2026 POLYMETRIC INTELLIGENCE · ALL VALUES INR/KG
        </span>

        <span>
          DATA: INDICATIVE / DEMO
        </span>

      </footer>

    </div>
  );
}