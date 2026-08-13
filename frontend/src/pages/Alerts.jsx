import { useMemo, useState } from "react";
import {
  BellRing,
  Trash2,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { api, useApi, formatPrice } from "../api";
import ApiError from "../components/APIerror";

const STORAGE_KEY = "jp_price_alerts";

function loadAlerts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAlerts(alerts) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(alerts)
  );
}

export default function Alerts() {
  const {
    data: products,
    error,
    loading,
  } = useApi(() => api.products(), []);

  const [alerts, setAlerts] = useState(loadAlerts);

  const [productId, setProductId] = useState("");

  const [condition, setCondition] = useState("above");

  const [targetPrice, setTargetPrice] = useState("");

  const selectedProduct = useMemo(() => {
    if (!productId || !Array.isArray(products)) {
      return null;
    }

    return products.find(
      (product) =>
        String(product.id) === String(productId)
    );
  }, [products, productId]);

  function createAlert(event) {
    event.preventDefault();

    if (!selectedProduct) {
      return;
    }

    const price = Number(targetPrice);

    if (!Number.isFinite(price) || price <= 0) {
      return;
    }

    const newAlert = {
      id: crypto.randomUUID(),

      productId: selectedProduct.id,

      productName: selectedProduct.name,

      grade: selectedProduct.grade,

      condition,

      targetPrice: price,

      createdAt: new Date().toISOString(),
    };

    const updatedAlerts = [
      ...alerts,
      newAlert,
    ];

    setAlerts(updatedAlerts);

    saveAlerts(updatedAlerts);

    setProductId("");

    setTargetPrice("");
  }

  function deleteAlert(id) {
    const updatedAlerts = alerts.filter(
      (alert) => alert.id !== id
    );

    setAlerts(updatedAlerts);

    saveAlerts(updatedAlerts);
  }

  function isTriggered(alert) {
    if (!Array.isArray(products)) {
      return false;
    }

    const product = products.find(
      (item) =>
        String(item.id) ===
        String(alert.productId)
    );

    if (!product) {
      return false;
    }

    const currentPrice = Number(product.price);

    if (alert.condition === "above") {
      return currentPrice >= alert.targetPrice;
    }

    return currentPrice <= alert.targetPrice;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-accent animate-pulse rounded" />

        <div className="h-32 bg-accent animate-pulse rounded-md" />

        <div className="h-24 bg-accent animate-pulse rounded-md" />
      </div>
    );
  }

  if (error) {
    return <ApiError error={error} />;
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <section>
        <div className="flex items-center gap-3">

          <div className="size-9 rounded-md bg-accent flex items-center justify-center">
            <BellRing className="size-4 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Price Alerts
            </h1>

            <p className="text-sm text-muted-foreground mt-1">
              Get notified when a polymer reaches your target price.
            </p>
          </div>

        </div>
      </section>


      {/* CREATE ALERT */}

      <section className="bg-card border border-border rounded-md">

        <div className="px-5 py-4 border-b border-border">

          <h2 className="text-sm font-semibold">
            Create Price Alert
          </h2>

          <p className="text-xs text-muted-foreground mt-1">
            Set a price threshold for any tracked product.
          </p>

        </div>


        <form
          onSubmit={createAlert}
          className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4"
        >

          {/* PRODUCT */}

          <div>
            <label className="text-[10px] font-display tracking-widest text-muted-foreground">
              PRODUCT
            </label>

            <select
              value={productId}
              onChange={(event) =>
                setProductId(event.target.value)
              }
              className="
                mt-2
                w-full
                h-10
                rounded-md
                border
                border-border
                bg-background
                px-3
                text-sm
                outline-none
                focus:ring-1
                focus:ring-primary
              "
            >
              <option value="">
                Select product
              </option>

              {(products || []).map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name}
                  {product.grade
                    ? ` — ${product.grade}`
                    : ""}
                </option>
              ))}
            </select>
          </div>


          {/* CONDITION */}

          <div>
            <label className="text-[10px] font-display tracking-widest text-muted-foreground">
              CONDITION
            </label>

            <select
              value={condition}
              onChange={(event) =>
                setCondition(event.target.value)
              }
              className="
                mt-2
                w-full
                h-10
                rounded-md
                border
                border-border
                bg-background
                px-3
                text-sm
                outline-none
                focus:ring-1
                focus:ring-primary
              "
            >
              <option value="above">
                Price goes above
              </option>

              <option value="below">
                Price goes below
              </option>
            </select>
          </div>


          {/* TARGET */}

          <div>
            <label className="text-[10px] font-display tracking-widest text-muted-foreground">
              TARGET PRICE
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={targetPrice}
              onChange={(event) =>
                setTargetPrice(event.target.value)
              }
              placeholder="₹0.00"
              className="
                mt-2
                w-full
                h-10
                rounded-md
                border
                border-border
                bg-background
                px-3
                text-sm
                outline-none
                focus:ring-1
                focus:ring-primary
              "
            />

            {selectedProduct && (
              <div className="text-[11px] text-muted-foreground mt-1">
                Current:{" "}
                {formatPrice(selectedProduct.price)}
              </div>
            )}
          </div>


          {/* BUTTON */}

          <div className="flex items-end">

            <button
              type="submit"
              disabled={
                !selectedProduct ||
                !targetPrice
              }
              className="
                w-full
                h-10
                rounded-md
                bg-primary
                text-primary-foreground
                text-sm
                font-semibold
                flex
                items-center
                justify-center
                gap-2
                disabled:opacity-40
                disabled:cursor-not-allowed
                hover:opacity-90
                transition-opacity
              "
            >
              <Plus className="size-4" />

              Create Alert
            </button>

          </div>

        </form>

      </section>


      {/* ACTIVE ALERTS */}

      <section>

        <div className="flex items-center justify-between mb-4">

          <div>
            <h2 className="text-sm font-semibold">
              Your Alerts
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              {alerts.length} active alert
              {alerts.length === 1 ? "" : "s"}
            </p>
          </div>

        </div>


        {alerts.length === 0 ? (

          <div className="bg-card border border-dashed border-border rounded-md p-10 text-center">

            <BellRing className="size-8 mx-auto text-muted-foreground mb-3" />

            <div className="text-sm font-semibold">
              No price alerts
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              Create an alert above to start monitoring prices.
            </div>

          </div>

        ) : (

          <div className="space-y-3">

            {alerts.map((alert) => {

              const triggered =
                isTriggered(alert);

              const product =
                (products || []).find(
                  (item) =>
                    String(item.id) ===
                    String(alert.productId)
                );

              const currentPrice =
                product
                  ? Number(product.price)
                  : null;

              return (
                <div
                  key={alert.id}
                  className={`
                    bg-card
                    border
                    rounded-md
                    p-4
                    ${
                      triggered
                        ? "border-primary"
                        : "border-border"
                    }
                  `}
                >

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    {/* PRODUCT */}

                    <div>

                      <div className="text-sm font-semibold">
                        {alert.productName}
                      </div>

                      {alert.grade && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {alert.grade}
                        </div>
                      )}

                    </div>


                    {/* CONDITION */}

                    <div className="flex items-center gap-2">

                      {alert.condition === "above" ? (
                        <ArrowUpRight className="size-4 text-up" />
                      ) : (
                        <ArrowDownRight className="size-4 text-down" />
                      )}

                      <div className="text-sm">
                        {alert.condition === "above"
                          ? "Above"
                          : "Below"}
                      </div>

                      <div className="font-display font-bold">
                        {formatPrice(
                          alert.targetPrice
                        )}
                      </div>

                    </div>


                    {/* CURRENT */}

                    <div className="text-sm">

                      <span className="text-muted-foreground">
                        Current:{" "}
                      </span>

                      <span className="font-semibold">
                        {currentPrice != null
                          ? formatPrice(
                              currentPrice
                            )
                          : "Unavailable"}
                      </span>

                    </div>


                    {/* STATUS */}

                    <div>

                      {triggered ? (
                        <span className="text-xs font-semibold text-up">
                          TARGET REACHED
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          MONITORING
                        </span>
                      )}

                    </div>


                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={() =>
                        deleteAlert(alert.id)
                      }
                      className="
                        size-9
                        rounded-md
                        border
                        border-border
                        flex
                        items-center
                        justify-center
                        text-muted-foreground
                        hover:text-down
                        hover:bg-accent
                        transition-colors
                      "
                      aria-label="Delete alert"
                    >
                      <Trash2 className="size-4" />
                    </button>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </section>


      {/* EXPLANATION */}

      <section className="border border-border rounded-md bg-card p-4">

        <div className="text-[10px] font-display tracking-widest text-muted-foreground">
          HOW ALERTS WORK
        </div>

        <div className="text-sm mt-2">
          Alerts are currently stored in this browser.
          They compare your target price with the latest
          market price whenever the Alerts page loads.
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          Cloud notifications and cross-device alerts can
          be added later through the backend.
        </div>

      </section>

    </div>
  );
}