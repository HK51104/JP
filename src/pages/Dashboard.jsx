import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, Boxes, Layers, Activity, Clock } from "lucide-react";
import { api, useApi, computeCategoryAverages, computeTopMovers } from "../api";
import ApiError from "../components/ApiError";

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-card border border-border rounded-md p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-display tracking-widest text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="font-display text-3xl font-bold tracking-tight">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { data: products, error, loading } = useApi(() => api.products(), []);

  if (loading) return <div className="text-sm text-muted-foreground">Loading market overview…</div>;
  if (error) return <ApiError error={error} />;

  const list = products || [];
  const avgs = computeCategoryAverages(list);
  const movers = computeTopMovers(list);
  const categories = [...new Set(list.map((p) => p.category))];
  const today = new Date().toISOString().slice(0, 10);
  const updatedToday = list.filter((p) => (p.lastUpdated || "").startsWith(today)).length;
  const avgChange = list.length
    ? list.reduce((a, p) => a + p.changePct, 0) / list.length
    : 0;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Market Overview</h1>
        <p className="text-sm text-muted-foreground">Indicative spot prices for primary polymer grades — India market.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat icon={Boxes} label="TOTAL PRODUCTS" value={String(list.length)} sub="Active grades tracked" />
        <Stat icon={Layers} label="MATERIALS" value={String(categories.length)} sub="Resin categories" />
        <Stat icon={Clock} label="UPDATED TODAY" value={String(updatedToday)} sub="In the last 24h" />
        <Stat icon={Activity} label="MARKET TREND" value={`${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`} sub="Avg. 24h change" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-md">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center">
            <h2 className="text-sm font-semibold tracking-tight">Category Averages</h2>
            <Link to="/products" className="text-[11px] font-display text-primary hover:underline">VIEW ALL →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-border">
            {avgs.map((c) => (
              <Link key={c.category} to={`/products?category=${c.category}`} className="p-4 hover:bg-accent/50 transition-colors group">
                <div className="text-[10px] font-display tracking-widest text-muted-foreground">{c.category}</div>
                <div className="font-display text-xl font-bold mt-1">₹{c.avg}</div>
                <div className={`text-xs mt-1 flex items-center gap-1 ${c.change > 0 ? "text-up" : c.change < 0 ? "text-down" : "text-muted-foreground"}`}>
                  {c.change > 0 ? <ArrowUpRight className="size-3" /> : c.change < 0 ? <ArrowDownRight className="size-3" /> : null}
                  {c.change > 0 ? "+" : ""}{c.change}%
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-md">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold tracking-tight">Top Movers</h2>
          </div>
          <div className="p-2">
            <div className="text-[10px] font-display tracking-widest text-up px-3 pt-2 pb-1">▲ GAINERS</div>
            {movers.gainers.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="flex items-center justify-between px-3 py-2 rounded hover:bg-accent text-sm">
                <span className="truncate">{p.name} <span className="text-muted-foreground font-mono text-xs">{p.grade}</span></span>
                <span className="text-up font-display text-xs">{p.changePct >= 0 ? "+" : ""}{p.changePct}%</span>
              </Link>
            ))}
            <div className="text-[10px] font-display tracking-widest text-down px-3 pt-3 pb-1">▼ LOSERS</div>
            {movers.losers.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="flex items-center justify-between px-3 py-2 rounded hover:bg-accent text-sm">
                <span className="truncate">{p.name} <span className="text-muted-foreground font-mono text-xs">{p.grade}</span></span>
                <span className="text-down font-display text-xs">{p.changePct}%</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-md">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-sm font-semibold tracking-tight">Browse by Category</h2>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c}
              to={`/products?category=${c}`}
              className="px-4 py-2 border border-border rounded-md text-sm font-display hover:border-primary hover:text-primary transition-colors"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
