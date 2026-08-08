/*
CONCLUSION OF AppShell.jsx
  AppShell is the layout component of the entire application.
  It creates the parts of the UI that stay the same on every page:
  Live market ticker (top bar)
  Header with logo
  Navigation menu
  Market status
  Footer
  The only thing that changes is the page content, which is inserted through the children prop.
*/


import { Link, NavLink } from "react-router-dom";
// Link)Its purpose is:Navigate to another page without refreshing the website.
// NavLink is almost the same as Link.But it has one extra feature.It knows:"Am I the currently active page?"
import { Activity, LayoutDashboard, Boxes, Star, BellRing } from "lucide-react";
// Import five icon components from the lucide-react library.
import ThemeToggle from "./Themetoggle";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  // to:/ == The URL to navigate to when the link is clicked.
  // label:Dashboard == The text to display for the link.
  // icon:LayoutDashboard == The icon component to display next to the link.
  //end:true == This is specifically for NavLink.
  { to: "/products", label: "Products", icon: Boxes },
  { to: "/watchlist", label: "Watchlist", icon: Star },
  { to: "/alerts", label: "Alerts", icon: BellRing },
];

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* flex-col means the child elements will be stacked vertically */}
      <div className="h-9 border-b border-border bg-card flex items-center px-4 gap-6 overflow-hidden text-[11px] font-display">
        {/* overflow-hidden ensures that the content doesn't overflow the container */}
        <div className="flex items-center gap-2 text-primary font-bold tracking-tight">
          <Activity className="size-3 animate-pulse" /> POLYMETRIC LIVE
          {/*Activity==(It renders an SVG icon.) */}
          {/* animate-pulse means the icon will pulse with animation */}
        </div>
        <span className="text-muted-foreground">CRUDE BRENT</span><span>$78.42</span><span className="text-up">+1.2%</span>
        {/* text-up means the text will be colored green for positive values(acc. to up) */}
        <span className="text-muted-foreground">NAPHTHA</span><span>$642.10</span><span className="text-down">-0.8%</span>
        {/* text-down means the text will be colored red for negative values */}
        <span className="text-muted-foreground">USD/INR</span><span>83.46</span><span className="text-up">+0.1%</span>
        <span className="ml-auto text-muted-foreground hidden md:inline">UTC {new Date().toUTCString().slice(17, 25)}</span>
        {/* ml-auto pushes the element to the right */}
        {/* hidden md:inline means the element will be hidden on mobile devices but visible on medium screens and larger */}
      </div>

      <header className="border-b border-border bg-background">
        <div className="max-w-350 mx-auto px-6 h-14 flex items-center gap-8">
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
                  `flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${isActive ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`
                }
              >
                <n.icon className="size-3.5" /> {n.label}
              </NavLink>
            ))}
          </nav>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2 text-[11px] font-display text-muted-foreground">
              <div className="size-1.5 rounded-full bg-up animate-pulse" />
              MARKET OPEN
            </div>
            <ThemeToggle />
          </div>
          </div>
      </header>

      <main className="flex-1 max-w-350 mx-auto w-full px-6 py-8">{children}</main>

      <footer className="border-t border-border py-4 px-6 text-[10px] font-display text-muted-foreground flex justify-between max-w-350 mx-auto w-full">
        <span>© 2026 POLYMETRIC INTELLIGENCE · ALL VALUES INR/KG</span>
        <span>DATA: INDICATIVE / DEMO</span>
      </footer>
    </div>
  );
}
