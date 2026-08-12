/*
CONCLUSION OF AppShell.jsx

AppShell is the main layout component of the application.

It contains the parts of the website that remain visible across
all pages:

- Live polymer market ticker
- Header
- Logo
- Navigation
- Mobile navigation menu
- Live data indicator
- Theme toggle
- Main page container
- Footer

The actual page displayed inside the layout comes from the `children`
prop, which is provided by App.jsx.

Mobile behavior:
- Desktop navigation remains unchanged.
- On mobile, navigation is replaced by a hamburger button.
- The mobile menu opens below the header.
- Clicking a navigation item closes the menu.
*/

import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import {
  Activity,
  LayoutDashboard,
  Boxes,
  Star,
  BellRing,
  Menu,
  X,
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
    Mobile menu state.

    false = menu closed
    true  = menu open
  */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /*
    Fetch products from the backend.

    The same API layer is already used by Dashboard.jsx.
  */
  const { data: products } = useApi(() => api.products(), []);

  /*
    Always work with an array.

    While the API is loading, products can be null.
  */
  const list = products || [];

  /*
    Sort products from biggest positive price movement
    to biggest negative price movement.
  */
  const sortedProducts = [...list].sort(
    (a, b) => b.changePct - a.changePct
  );

  /*
    Biggest gainer.
  */
  const topGainer = sortedProducts[0] || null;

  /*
    Biggest loser.
  */
  const topLoser =
    sortedProducts.length > 0
      ? sortedProducts[sortedProducts.length - 1]
      : null;

  /*
    Close the mobile menu.

    This is called whenever the user clicks a navigation item.
  */
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

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
          px-3
          sm:px-4
          gap-4
          sm:gap-6
          overflow-hidden
          text-[10px]
          sm:text-[11px]
          font-display
        "
      >
        {/* POLYMETRIC LIVE */}

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

          <span className="hidden sm:inline">
            POLYMETRIC LIVE
          </span>

          <span className="sm:hidden">
            LIVE
          </span>
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
                max-w-24
                sm:max-w-32
                md:max-w-48
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
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-muted-foreground shrink-0">
              {topLoser.category || "POLYMER"}
            </span>

            <span
              className="
                truncate
                max-w-32
                md:max-w-48
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
          </div>
        )}

        {/* ---------------------------------------------------------
            UTC CLOCK
            --------------------------------------------------------- */}

        <span
          className="
            ml-auto
            text-muted-foreground
            hidden
            lg:inline
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
          relative
          z-40
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
          "
        >
          {/* -------------------------------------------------------
              LOGO
              ------------------------------------------------------- */}

          <Link
            to="/"
            onClick={closeMobileMenu}
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
              DESKTOP NAVIGATION
              ------------------------------------------------------- */}

          <nav
            className="
              hidden
              md:flex
              items-center
              gap-1
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
                    px-3
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

            {/* -----------------------------------------------------
                MOBILE MENU BUTTON
                ----------------------------------------------------- */}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((open) => !open)
              }
              className="
                md:hidden
                inline-flex
                items-center
                justify-center
                size-9
                rounded-md
                border
                border-border
                text-muted-foreground
                hover:text-foreground
                hover:bg-accent
                transition-colors
              "
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* =========================================================
            MOBILE NAVIGATION MENU
            ========================================================= */}

        {mobileMenuOpen && (
          <div
            className="
              md:hidden
              border-t
              border-border
              bg-background
              px-4
              py-3
            "
          >
            <nav className="flex flex-col gap-1">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `
                      flex
                      items-center
                      gap-3
                      px-3
                      py-3
                      rounded-md
                      text-sm
                      transition-colors
                      ${
                        isActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }
                    `
                  }
                >
                  <n.icon className="size-4 shrink-0" />

                  <span>{n.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Mobile live indicator */}

            <div
              className="
                mt-3
                pt-3
                border-t
                border-border
                flex
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
          </div>
        )}
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
          overflow-x-hidden
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