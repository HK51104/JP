import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, useApi } from "../api";
import { useWatchlist } from "../lib/watchlist";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Star, FileText, Bell, MapPin } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import ApiError from "../components/ApiError";

const RANGES = [
  { key: "30", label: "30D", days: 30 },
  { key: "90", label: "90D", days: 90 },
  { key: "365", label: "1Y", days: 365 },
];

function Metric({ label, value, tone }) {
  return (
    <div>
      <div className="text-[10px] font-display tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-display text-xl font-bold mt-1 ${tone === "up" ? "text-up" : tone === "down" ? "text-down" : ""}`}>{value}</div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between border-b border-border/50 pb-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const { has, toggle } = useWatchlist();
  const [range, setRange] = useState(RANGES[0]);

  const { data: product, error: prodErr, loading: prodLoad } = useApi(() => api.product(id), [id]);
  const { data: history, error: histErr } = useApi(() => api.history(id).catch(() => []), [id]);

  if (prodLoad) return <div className="text-sm text-muted-foreground">Loading product…</div>;
  if (prodErr) return <ApiError error={prodErr} />;
  if (!product) {
    return (
      <div className="text-center py-20">
        <h1 className="text-xl font-bold">Product not found</h1>
        <Link to="/products" className="text-primary text-sm mt-2 inline-block">← Back to products</Link>
      </div>
    );
  }

  const fullHistory = history || [];
  const data = fullHistory.slice(-range.days);
  const first = data[0]?.price ?? product.currentPrice;
  const periodChange = first ? ((product.currentPrice - first) / first) * 100 : 0;
  const high = data.length ? Math.max(...data.map((d) => d.price)) : product.currentPrice;
  const low = data.length ? Math.min(...data.map((d) => d.price)) : product.currentPrice;

  return (
    <>
      <Link to="/products" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="size-3" /> Back to products
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        <div>
          <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-1">{product.category} · {product.supplier}</div>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground font-mono">
            <span>{product.grade}</span><span>·</span><span>{product.mfi}</span><span>·</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{product.location}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-4xl font-bold tracking-tight">₹{product.currentPrice.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">
            per KG{product.lastUpdated ? ` · updated ${new Date(product.lastUpdated).toLocaleString()}` : ""}
          </div>
          <div className={`inline-flex items-center gap-1 mt-2 text-sm font-display ${product.changePct > 0 ? "text-up" : product.changePct < 0 ? "text-down" : "text-muted-foreground"}`}>
            {product.changePct > 0 ? <ArrowUpRight className="size-4" /> : product.changePct < 0 ? <ArrowDownRight className="size-4" /> : null}
            {product.changePct > 0 ? "+" : ""}{product.changePct}% (24h)
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => toggle(product.id)} className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm hover:border-primary">
          <Star className={`size-4 ${has(product.id) ? "fill-primary text-primary" : ""}`} />
          {has(product.id) ? "In watchlist" : "Add to watchlist"}
        </button>
        <Link to={`/alerts?productId=${product.id}`} className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm hover:border-primary">
          <Bell className="size-4" /> Set price alert
        </Link>
        <a href={product.datasheetUrl} className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm hover:border-primary">
          <FileText className="size-4" /> Download datasheet
        </a>
        <button className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90">
          Request Quote (RFQ)
        </button>
      </div>

      <div className="bg-card border border-border rounded-md p-5 mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Price History</h2>
            <p className="text-xs text-muted-foreground mt-1">Indicative spot, INR per KG</p>
          </div>
          <div className="flex gap-1 p-1 bg-secondary rounded-md">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs font-display tracking-wider rounded ${range.key === r.key ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 text-center md:text-left">
          <Metric label="PERIOD CHANGE" value={`${periodChange > 0 ? "+" : ""}${periodChange.toFixed(2)}%`} tone={periodChange > 0 ? "up" : "down"} />
          <Metric label="PERIOD HIGH" value={`₹${high.toFixed(2)}`} />
          <Metric label="PERIOD LOW" value={`₹${low.toFixed(2)}`} />
        </div>

        <div className="h-[360px]">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              {histErr ? "Couldn't load price history." : "No price history yet."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" tick={{ fontSize: 10, fontFamily: "var(--font-display)" }} tickFormatter={(v) => v.slice(5)} minTickGap={40} />
                <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 10, fontFamily: "var(--font-display)" }} domain={["auto", "auto"]} tickFormatter={(v) => `₹${v}`} width={56} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: "var(--muted-foreground)", fontFamily: "var(--font-display)" }}
                  formatter={(v) => [`₹${v.toFixed(2)}`, "Price"]}
                />
                <Area type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={2} fill="url(#priceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-semibold mb-4">Supplier Information</h3>
        <dl className="space-y-2 text-sm">
          <Row k="Supplier" v={product.supplier} />
          <Row k="Plant" v={product.location} />
          <Row k="Category" v={product.category} />
          <Row k="MFI / Specification" v={product.mfi} />
        </dl>
      </div>
    </>
  );
}
