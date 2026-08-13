import { useEffect, useState } from "react";
import {
  Bell,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { api, formatPrice, formatChange } from "../api";
import ApiError from "../components/APIerror";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);

  const [productId, setProductId] = useState("");
  const [alertType, setAlertType] =
    useState("price_above");
  const [targetValue, setTargetValue] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [alertsData, productsData] =
        await Promise.all([
          api.alerts(),
          api.products(),
        ]);

      setAlerts(
        Array.isArray(alertsData)
          ? alertsData
          : []
      );

      setProducts(
        Array.isArray(productsData)
          ? productsData
          : []
      );
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();

    if (!productId || targetValue === "") {
      return;
    }

    try {
      setCreating(true);

      await api.createAlert({
        productId: Number(productId),
        alertType,
        targetValue: Number(targetValue),
      });

      setProductId("");
      setTargetValue("");

      await loadData();
    } catch (err) {
      setError(err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteAlert(id);

      setAlerts((current) =>
        current.filter(
          (alert) => alert.id !== id
        )
      );
    } catch (err) {
      setError(err);
    }
  }

  function getAlertLabel(type) {
    switch (type) {
      case "price_above":
        return "Price goes above";

      case "price_below":
        return "Price goes below";

      case "change_above":
        return "Change exceeds";

      case "change_below":
        return "Change falls below";

      default:
        return type;
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-accent animate-pulse rounded" />
        <div className="h-40 bg-accent animate-pulse rounded-md" />
        <div className="h-40 bg-accent animate-pulse rounded-md" />
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
          <div className="p-2 bg-primary/10 rounded-md">
            <Bell className="size-5 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Price Alerts
            </h1>

            <p className="text-sm text-muted-foreground mt-1">
              Monitor polymer prices and get notified
              when your conditions are reached.
            </p>
          </div>
        </div>
      </section>


      {/* CREATE ALERT */}

      <section className="bg-card border border-border rounded-md">

        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Plus className="size-4 text-primary" />

            <h2 className="text-sm font-semibold">
              Create Alert
            </h2>
          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="p-5 space-y-5"
        >

          {/* PRODUCT */}

          <div>
            <label className="block text-xs font-semibold mb-2">
              Product
            </label>

            <select
              value={productId}
              onChange={(e) =>
                setProductId(e.target.value)
              }
              className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm"
            >
              <option value="">
                Select product
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name}
                  {product.grade
                    ? ` · ${product.grade}`
                    : ""}
                </option>
              ))}
            </select>
          </div>


          {/* TYPE */}

          <div>
            <label className="block text-xs font-semibold mb-2">
              Alert when
            </label>

            <select
              value={alertType}
              onChange={(e) =>
                setAlertType(e.target.value)
              }
              className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm"
            >
              <option value="price_above">
                Price goes above
              </option>

              <option value="price_below">
                Price goes below
              </option>

              <option value="change_above">
                Change exceeds
              </option>

              <option value="change_below">
                Change falls below
              </option>
            </select>
          </div>


          {/* VALUE */}

          <div>
            <label className="block text-xs font-semibold mb-2">
              Target value
            </label>

            <div className="relative">

              <input
                type="number"
                step="0.01"
                value={targetValue}
                onChange={(e) =>
                  setTargetValue(e.target.value)
                }
                placeholder={
                  alertType.startsWith("price")
                    ? "150"
                    : "5"
                }
                className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {alertType.startsWith("price")
                  ? "₹/kg"
                  : "%"}
              </span>

            </div>
          </div>


          <button
            type="submit"
            disabled={
              creating ||
              !productId ||
              targetValue === ""
            }
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="size-4" />

            {creating
              ? "Creating..."
              : "Create Alert"}
          </button>

        </form>
      </section>


      {/* ALERT LIST */}

      <section>

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />

            <h2 className="text-sm font-semibold">
              My Alerts
            </h2>
          </div>

          <span className="text-xs text-muted-foreground">
            {alerts.length} alert
            {alerts.length !== 1 ? "s" : ""}
          </span>

        </div>


        {alerts.length === 0 ? (

          <div className="bg-card border border-dashed border-border rounded-md p-10 text-center">

            <Bell className="size-8 mx-auto text-muted-foreground mb-3" />

            <div className="text-sm font-semibold">
              No alerts yet
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              Create your first price alert above.
            </div>

          </div>

        ) : (

          <div className="space-y-3">

            {alerts.map((alert) => (

              <div
                key={alert.id}
                className="bg-card border border-border rounded-md p-4"
              >

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div className="flex items-start gap-3">

                    <div className="mt-0.5">

                      {alert.triggered ? (
                        <CheckCircle2 className="size-5 text-up" />
                      ) : (
                        <AlertTriangle className="size-5 text-primary" />
                      )}

                    </div>


                    <div>

                      <div className="font-semibold text-sm">
                        {alert.productName}
                      </div>

                      {alert.productGrade && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {alert.productGrade}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mt-2">

                        {getAlertLabel(
                          alert.alertType
                        )}

                        {" "}

                        <span className="font-semibold text-foreground">
                          {alert.alertType.startsWith(
                            "price"
                          )
                            ? formatPrice(
                                alert.targetValue
                              )
                            : formatChange(
                                alert.targetValue
                              )}
                        </span>

                      </div>

                    </div>

                  </div>


                  <div className="flex items-center gap-4">

                    <div className="text-right">

                      <div className="text-[10px] tracking-widest text-muted-foreground">
                        CURRENT
                      </div>

                      <div className="font-display font-bold">
                        {formatPrice(
                          alert.currentPrice
                        )}
                      </div>

                    </div>


                    <button
                      onClick={() =>
                        handleDelete(alert.id)
                      }
                      className="p-2 text-muted-foreground hover:text-down transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="size-4" />
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}