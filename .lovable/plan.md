## Goal
Rebuild PolyMetric as a plain **React JS** app using **Vite + React Router DOM**, with every file written as `.jsx` / `.js` — no TypeScript, no TanStack Start, no TanStack Router.

## What gets removed
- TanStack Start scaffolding: `src/router.tsx`, `src/server.ts`, `src/start.ts`, `src/routes/__root.tsx`, `src/routeTree.gen.ts`, all `src/routes/*.tsx`.
- TypeScript config files (`tsconfig.json`) and TS-only deps (`typescript`, `@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/zod-adapter`, `zod`, `@types/*`).
- The current `vite.config.ts` (Start plugin) replaced with a plain React Vite config in `.js`.

## What gets built (all JSX)
Folder layout:
```
src/
  main.jsx              // ReactDOM root + BrowserRouter
  App.jsx               // <Routes> with all pages + AppShell layout
  styles.css            // existing theme tokens kept as-is
  components/
    AppShell.jsx        // header, ticker, nav (react-router <Link>/<NavLink>)
  lib/
    mock-data.js        // products, categories, price-history generator
    watchlist.js        // useWatchlist / useAlerts (localStorage hooks)
    utils.js            // cn() helper
  pages/
    Dashboard.jsx       // market ticker stats, category averages, top movers
    Products.jsx        // search + category filter + table
    ProductDetails.jsx  // grade info + Recharts price history (30D/90D/1Y)
    Watchlist.jsx       // saved products
    Alerts.jsx          // price threshold form + list
    NotFound.jsx
```

Routes (React Router v6):
- `/` → Dashboard
- `/products` → Products (query params `?q=&category=`)
- `/products/:id` → ProductDetails
- `/watchlist` → Watchlist
- `/alerts` → Alerts
- `*` → NotFound

## Dependencies
- Keep: `react`, `react-dom`, `recharts`, `lucide-react`, `sonner`, `tailwindcss`, shadcn UI components (they're already `.tsx` but we'll **convert the few we actually use** to `.jsx`: `button`, `input`, `card`, `badge`, `table`, `tabs`, `select`, `sonner`). Unused shadcn `.tsx` files get deleted to avoid TS in the project.
- Add: `react-router-dom`.
- Remove: all `@tanstack/*`, `zod`, `typescript`, `@types/*`.

## Functionality parity
Same features as the current build:
- Live ticker (Crude, Naphtha, USD/INR — static demo values).
- Dashboard: total products, categories, top gainers/losers, category averages.
- Products page: search by name/grade, category chips (PP, PPCP, HDPE, LLDPE, LDPE, PVC, PET, ABS), sortable table with current price + last updated.
- Product details: name, grade, MFI, location, current price, RFQ button, Recharts AreaChart with 30D/90D/1Y toggle, watchlist toggle.
- Watchlist + Alerts persisted in `localStorage`.
- Industrial dark "Bloomberg-style" theme retained from `styles.css` (JetBrains Mono, slate palette).

## Technical details
- `vite.config.js` uses `@vitejs/plugin-react` only; alias `@` → `/src` preserved.
- `index.html` mounts `<div id="root">` and loads `/src/main.jsx`.
- `eslint.config.js` simplified for JS/JSX (no `@typescript-eslint`).
- shadcn `components.json` updated with `"tsx": false`.
- Tailwind v4 config in `src/styles.css` stays as-is; class names unchanged.

## Out of scope
- No backend, no Lovable Cloud, no auth — pure frontend with mock data (matches current app).
- No SSR.

After approval I'll do the conversion in one pass: remove old files, install/uninstall deps, write the new JSX tree.
