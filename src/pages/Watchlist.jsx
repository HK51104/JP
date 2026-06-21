import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { api, useApi } from "../api";
import { useWatchlist } from "../lib/watchlist";
import ApiError from "../components/ApiError";

export default function Watchlist() {
  const { data: products, error, loading } = useApi(
    () => api.products(),
    []
  );

  const { ids, toggle, has } = useWatchlist();

  if (loading) {
    return (
      <div className="p-6 text-gray-400">
        Loading watchlist...
      </div>
    );
  }

  if (error) {
    return <ApiError error={error} />;
  }

  const watchlistProducts = (products || []).filter((p) =>
    ids.includes(p.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <p className="text-gray-400 text-sm">
          Saved products
        </p>
      </div>

      {watchlistProducts.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border border-border rounded-md">
          No products in your watchlist.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlistProducts.map((p) => (
            <div
              key={p.id}
              className="card p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-xs text-gray-500">
                    {p.category}
                  </div>

                  <Link
                    to={`/products/${p.id}`}
                    className="font-semibold hover:text-yellow-400"
                  >
                    {p.name}
                  </Link>

                  <div className="text-sm text-gray-500">
                    {p.grade}
                  </div>
                </div>

                <button
                  onClick={() => toggle(p.id)}
                  aria-label="Remove from watchlist"
                >
                  <Star
                    size={16}
                    className={
                      has(p.id)
                        ? "fill-primary text-primary"
                        : ""
                    }
                  />
                </button>
              </div>

              <div className="text-2xl font-bold">
                ₹{p.currentPrice.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}