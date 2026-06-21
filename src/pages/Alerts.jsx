import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Bell, Mail, MessageSquare, Smartphone, Trash2 } from "lucide-react";
import { api, useApi } from "../api";
import { useAlerts } from "../lib/watchlist";
import ApiError from "../components/ApiError";

const CHANNELS = [
  { k: "email", icon: Mail, label: "Email" },
  { k: "sms", icon: Smartphone, label: "SMS" },
  { k: "whatsapp", icon: MessageSquare, label: "WhatsApp" },
];

export default function Alerts() {
  const [params] = useSearchParams();

  const { data: products, error, loading } = useApi(
    () => api.products(),
    []
  );

  const { alerts, add, remove } = useAlerts();

  const PRODUCTS = products || [];

  const initialPid =
    params.get("productId") || PRODUCTS[0]?.id || "";

  const [pid, setPid] = useState(initialPid);
  const [direction, setDirection] = useState("below");
  const [threshold, setThreshold] = useState("");
  const [channels, setChannels] = useState(["email"]);

  const toggleChan = (c) => {
    setChannels((prev) =>
      prev.includes(c)
        ? prev.filter((x) => x !== c)
        : [...prev, c]
    );
  };

  const submit = (e) => {
    e.preventDefault();

    const t = parseFloat(threshold);

    if (!t || t <= 0) {
      alert("Enter a valid threshold");
      return;
    }

    if (channels.length === 0) {
      alert("Pick at least one channel");
      return;
    }

    add({
      productId: pid,
      threshold: t,
      direction,
      channels,
    });

    setThreshold("");
    alert("Alert created");
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading products...
      </div>
    );
  }

  if (error) {
    return <ApiError error={error} />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Price Alerts
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Get notified when a polymer crosses your target
          price.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={submit}
          className="bg-card border border-border rounded-md p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold">
            New Alert
          </h2>

          <div>
            <label className="text-[10px] font-display tracking-widest text-muted-foreground">
              PRODUCT
            </label>

            <select
              value={pid}
              onChange={(e) => setPid(e.target.value)}
              className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm"
            >
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.grade}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-display tracking-widest text-muted-foreground">
                CONDITION
              </label>

              <div className="flex gap-1 mt-1 p-1 bg-secondary rounded-md">
                <button
                  type="button"
                  onClick={() => setDirection("below")}
                  className={`flex-1 py-1.5 text-xs rounded ${
                    direction === "below"
                      ? "bg-background"
                      : "text-muted-foreground"
                  }`}
                >
                  Below
                </button>

                <button
                  type="button"
                  onClick={() => setDirection("above")}
                  className={`flex-1 py-1.5 text-xs rounded ${
                    direction === "above"
                      ? "bg-background"
                      : "text-muted-foreground"
                  }`}
                >
                  Above
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-display tracking-widest text-muted-foreground">
                THRESHOLD (₹/KG)
              </label>

              <input
                type="number"
                step="0.01"
                value={threshold}
                onChange={(e) =>
                  setThreshold(e.target.value)
                }
                placeholder="130.00"
                className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-display tracking-widest text-muted-foreground">
              NOTIFY VIA
            </label>

            <div className="flex flex-wrap gap-2 mt-2">
              {CHANNELS.map((c) => (
                <button
                  key={c.k}
                  type="button"
                  onClick={() => toggleChan(c.k)}
                  className={`inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm transition-colors ${
                    channels.includes(c.k)
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <c.icon className="size-3.5" />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-md py-2.5 text-sm font-medium hover:opacity-90"
          >
            Create Alert
          </button>
        </form>

        <div className="bg-card border border-border rounded-md p-5">
          <h2 className="text-sm font-semibold mb-4">
            Active Alerts ({alerts.length})
          </h2>

          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="size-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No active alerts.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((a) => {
                const p = PRODUCTS.find(
                  (x) => x.id === a.productId
                );

                if (!p) return null;

                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 border border-border rounded-md"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {p.name}
                        <span className="text-muted-foreground font-mono text-xs">
                          {" "}
                          {p.grade}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground mt-0.5">
                        Notify when price{" "}
                        <span className="text-foreground">
                          {a.direction}
                        </span>{" "}
                        <span className="font-display text-foreground">
                          ₹{Number(a.threshold).toFixed(2)}
                        </span>{" "}
                        · {a.channels.join(", ")}
                      </div>
                    </div>

                    <button
                      onClick={() => remove(a.id)}
                      className="text-muted-foreground hover:text-down"
                      aria-label="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}