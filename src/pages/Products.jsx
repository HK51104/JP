import { Link, useSearchParams } from "react-router-dom";
import { api, useApi } from "../api";
import { useWatchlist } from "../lib/watchlist";
import { Search, Star, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react";
import ApiError from "../components/ApiError";

export default function Products() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "ALL";
  const { has, toggle } = useWatchlist();
  const { data: products, error, loading } = useApi(() => api.products(), []);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || (value === "ALL" && key === "category")) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const list = products || [];
  const categories = ["ALL", ...new Set(list.map((p) => p.category))];
  const filtered = list.filter((p) => {
    const matchCat = category === "ALL" || p.category === category;
    const term = q.toLowerCase().trim();
    const matchQ =
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.grade.toLowerCase().includes(term) ||
      p.supplier.toLowerCase().includes(term);
    return matchCat && matchQ;
  });

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading…" : `${filtered.length} grades · live indicative pricing`}
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setParam("q", e.target.value)}
            placeholder="Search name, grade, supplier…"
            className="w-full bg-card border border-border rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {error ? (
        <ApiError error={error} />
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setParam("category", c)}
                className={`px-3 py-1.5 text-xs font-display tracking-wider rounded border transition-colors ${
                  category === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-[10px] font-display tracking-widest text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 w-8"></th>
                  <th className="text-left px-4 py-3">PRODUCT</th>
                  <th className="text-left px-4 py-3">GRADE</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">CATEGORY</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">LOCATION</th>
                  <th className="text-right px-4 py-3">PRICE (₹/KG)</th>
                  <th className="text-right px-4 py-3">24H</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">UPDATED</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(p.id)} aria-label="Toggle watchlist">
                        <Star className={`size-4 ${has(p.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/products/${p.id}`} className="font-medium hover:text-primary">
                        {p.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{p.supplier} · {p.mfi}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{p.grade}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-[10px] font-display tracking-widest px-2 py-1 bg-secondary rounded">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{p.location}</td>
                    <td className="px-4 py-3 text-right font-display font-semibold">₹{p.currentPrice.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right font-display text-xs ${p.changePct > 0 ? "text-up" : p.changePct < 0 ? "text-down" : "text-muted-foreground"}`}>
                      <span className="inline-flex items-center gap-0.5">
                        {p.changePct > 0 ? <ArrowUpRight className="size-3" /> : p.changePct < 0 ? <ArrowDownRight className="size-3" /> : null}
                        {p.changePct > 0 ? "+" : ""}{p.changePct}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden md:table-cell font-mono">
                      {p.lastUpdated ? new Date(p.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a href={p.datasheetUrl} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary" title="Datasheet">
                        <FileText className="size-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">No products match your filters.</td></tr>
                )}
                {loading && (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">Loading products…</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
