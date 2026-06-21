import { Link, NavLink } from "react-router-dom";
import { Activity, LayoutDashboard, Boxes, Star, BellRing } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Boxes },
  { to: "/watchlist", label: "Watchlist", icon: Star },
  { to: "/alerts", label: "Alerts", icon: BellRing },
];

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-9 border-b border-border bg-card flex items-center px-4 gap-6 overflow-hidden text-[11px] font-display">
        <div className="flex items-center gap-2 text-primary font-bold tracking-tight">
          <Activity className="size-3 animate-pulse" /> POLYMETRIC LIVE
        </div>
        <span className="text-muted-foreground">CRUDE BRENT</span><span>$78.42</span><span className="text-up">+1.2%</span>
        <span className="text-muted-foreground">NAPHTHA</span><span>$642.10</span><span className="text-down">-0.8%</span>
        <span className="text-muted-foreground">USD/INR</span><span>83.46</span><span className="text-up">+0.1%</span>
        <span className="ml-auto text-muted-foreground hidden md:inline">UTC {new Date().toUTCString().slice(17, 25)}</span>
      </div>

      <header className="border-b border-border bg-background">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center gap-8">
          <Link to="/" className="font-display font-bold tracking-tighter text-base">
            POLY<span className="text-primary">METRIC</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isActive ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`
                }
              >
                <n.icon className="size-3.5" /> {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-[11px] font-display text-muted-foreground">
            <div className="size-1.5 rounded-full bg-up animate-pulse" />
            MARKET OPEN
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-8">{children}</main>

      <footer className="border-t border-border py-4 px-6 text-[10px] font-display text-muted-foreground flex justify-between max-w-[1400px] mx-auto w-full">
        <span>© 2026 POLYMETRIC INTELLIGENCE · ALL VALUES INR/KG</span>
        <span>DATA: INDICATIVE / DEMO</span>
      </footer>
    </div>
  );
}
