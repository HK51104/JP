import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";

import { api, useApi, formatPrice } from "../api";
import ApiError from "../components/APIerror";


const ALERTS_KEY = "polymetric_price_alerts";


/*
--------------------------------------------------
LOCAL STORAGE
--------------------------------------------------
*/

function readAlerts() {
  try {
    const stored =
      localStorage.getItem(ALERTS_KEY);

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}


function saveAlerts(alerts) {
  localStorage.setItem(
    ALERTS_KEY,
    JSON.stringify(alerts)
  );
}


/*
--------------------------------------------------
ALERT CONDITION
--------------------------------------------------
*/

function isTriggered(alert, product) {
  if (!product) return false;

  const price =
    Number(product.price) || 0;

  const change =
    Number(product.changePct) || 0;

  const target =
    Number(alert.target) || 0;

  if (alert.condition === "above") {
    return price >= target;
  }

  if (alert.condition === "below") {
    return price <= target;
  }

  if (alert.condition === "change_above") {
    return change >= target;
  }

  if (alert.condition === "change_below") {
    return change <= target;
  }

  return false;
}


/*
--------------------------------------------------
CONDITION LABEL
--------------------------------------------------
*/

function conditionLabel(alert) {
  if (alert.condition === "above") {
    return `Price ≥ ₹${Number(alert.target).toFixed(2)}`;
  }

  if (alert.condition === "below") {
    return `Price ≤ ₹${Number(alert.target).toFixed(2)}`;
  }

  if (alert.condition === "change_above") {
    return `24H change ≥ +${Number(alert.target).toFixed(2)}%`;
  }

  if (alert.condition === "change_below") {
    return `24H change ≤ ${Number(alert.target).toFixed(2)}%`;
  }

  return "Unknown condition";
}


/*
--------------------------------------------------
ALERT CARD
--------------------------------------------------
*/

function AlertCard({
  alert,
  product,
  triggered,
  onDelete,
}) {
  return (
    <div
      className={`bg-card border rounded-md p-4 ${
        triggered
          ? "border-primary"
          : "border-border"
      }`}
    >

      <div className="flex items-start gap-3">

        <div
          className={`size-9 rounded-md flex items-center justify-center shrink-0 ${
            triggered
              ? "bg-primary/10 text-primary"
              : "bg-accent text-muted-foreground"
          }`}
        >
          {triggered ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <BellRing className="size-4" />
          )}
        </div>


        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <div className="font-medium text-sm truncate">
                {product?.name ||
                  "Unknown product"}
              </div>

              <div className="text-xs text-muted-foreground mt-1">
                {product?.grade ||
                  "Product unavailable"}
              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                onDelete(alert.id)
              }
              className="size-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-down hover:bg-down/10 transition-colors shrink-0"
              aria-label="Delete alert"
            >
              <Trash2 className="size-3.5" />
            </button>

          </div>


          <div className="mt-4 flex flex-wrap items-center gap-2">

            <span className="px-2.5 py-1 rounded-md bg-accent text-xs font-display">
              {conditionLabel(alert)}
            </span>

            {triggered && (
              <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                TRIGGERED
              </span>
            )}

          </div>


          {product && (
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">

              <span className="text-xs text-muted-foreground">
                Current
              </span>

              <span className="font-display font-semibold text-sm">
                {formatPrice(product.price)}
              </span>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}


/*
--------------------------------------------------
CREATE ALERT FORM
--------------------------------------------------
*/

function CreateAlert({
  products,
  onCreate,
  onCancel,
}) {
  const [productId, setProductId] =
    useState(
      products[0]
        ? String(products[0].id)
        : ""
    );

  const [condition, setCondition] =
    useState("above");

  const [target, setTarget] =
    useState("");


  const selectedProduct =
    products.find(
      (product) =>
        String(product.id) ===
        String(productId)
    );


  function submit(event) {
    event.preventDefault();

    if (!productId) return;

    if (
      target === "" ||
      !Number.isFinite(
        Number(target)
      )
    ) {
      return;
    }

    onCreate({
      productId,
      condition,
      target: Number(target),
    });
  }


  return (
    <form
      onSubmit={submit}
      className="bg-card border border-border rounded-md p-5"
    >

      <div className="flex items-center justify-between mb-5">

        <div>

          <h2 className="text-sm font-semibold">
            Create Alert
          </h2>

          <p className="text-xs text-muted-foreground mt-1">
            Get notified when a market condition
            is reached.
          </p>

        </div>

        <button
          type="button"
          onClick={onCancel}
          className="size-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent"
        >
          <X className="size-4" />
        </button>

      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


        {/* PRODUCT */}

        <div>

          <label className="block text-[10px] font-display tracking-widest text-muted-foreground mb-2">
            PRODUCT
          </label>

          <select
            value={productId}
            onChange={(event) =>
              setProductId(
                event.target.value
              )
            }
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm outline-none focus:border-primary"
          >
            {products.map(
              (product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name} ·{" "}
                  {product.grade}
                </option>
              )
            )}
          </select>

        </div>


        {/* CONDITION */}

        <div>

          <label className="block text-[10px] font-display tracking-widest text-muted-foreground mb-2">
            CONDITION
          </label>

          <select
            value={condition}
            onChange={(event) =>
              setCondition(
                event.target.value
              )
            }
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm outline-none focus:border-primary"
          >
            <option value="above">
              Price goes above
            </option>

            <option value="below">
              Price goes below
            </option>

            <option value="change_above">
              24H change exceeds
            </option>

            <option value="change_below">
              24H change falls below
            </option>
          </select>

        </div>


        {/* TARGET */}

        <div>

          <label className="block text-[10px] font-display tracking-widest text-muted-foreground mb-2">
            TARGET
          </label>

          <div className="relative">

            <input
              type="number"
              step="0.01"
              value={target}
              onChange={(event) =>
                setTarget(
                  event.target.value
                )
              }
              placeholder={
                condition ===
                  "change_above" ||
                condition ===
                  "change_below"
                  ? "5"
                  : selectedProduct
                    ? String(
                        selectedProduct.price
                      )
                    : "150"
              }
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm outline-none focus:border-primary"
            />

            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {condition ===
                  "change_above" ||
                condition ===
                  "change_below"
                ? "%"
                : "₹"}
            </span>

          </div>

        </div>

      </div>


      <div className="flex justify-end gap-2 mt-5">

        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md border border-border text-xs hover:bg-accent transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
        >
          Create Alert
        </button>

      </div>

    </form>
  );
}


/*
--------------------------------------------------
ALERTS PAGE
--------------------------------------------------
*/

export default function Alerts() {

  const {
    data: products,
    error,
    loading,
  } = useApi(
    () => api.products(),
    []
  );


  const [
    alerts,
    setAlerts,
  ] = useState(readAlerts);


  const [
    creating,
    setCreating,
  ] = useState(false);


  /*
  ----------------------------------------------
  SAVE ALERTS
  ----------------------------------------------
  */

  useEffect(() => {
    saveAlerts(alerts);
  }, [alerts]);


  const productList =
    Array.isArray(products)
      ? products
      : [];


  /*
  ----------------------------------------------
  PRODUCT LOOKUP
  ----------------------------------------------
  */

  const productMap =
    useMemo(() => {

      return new Map(
        productList.map(
          (product) => [
            String(product.id),
            product,
          ]
        )
      );

    }, [productList]);


  /*
  ----------------------------------------------
  TRIGGERED ALERTS
  ----------------------------------------------
  */

  const enrichedAlerts =
    useMemo(() => {

      return alerts.map(
        (alert) => {

          const product =
            productMap.get(
              String(
                alert.productId
              )
            );

          return {
            ...alert,
            product,
            triggered:
              isTriggered(
                alert,
                product
              ),
          };

        }
      );

    }, [
      alerts,
      productMap,
    ]);


  /*
  ----------------------------------------------
  CREATE
  ----------------------------------------------
  */

  function createAlert(data) {

    const newAlert = {
      id:
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      productId:
        String(data.productId),

      condition:
        data.condition,

      target:
        Number(data.target),

      createdAt:
        new Date().toISOString(),
    };


    setAlerts(
      (current) => [
        newAlert,
        ...current,
      ]
    );

    setCreating(false);
  }


  /*
  ----------------------------------------------
  DELETE
  ----------------------------------------------
  */

  function deleteAlert(id) {
    setAlerts(
      (current) =>
        current.filter(
          (alert) =>
            alert.id !== id
        )
    );
  }


  /*
  ----------------------------------------------
  LOADING
  ----------------------------------------------
  */

  if (loading) {
    return (
      <div className="space-y-4">

        <div className="h-8 w-40 bg-accent animate-pulse rounded" />

        <div className="h-24 bg-accent animate-pulse rounded-md" />

        <div className="h-64 bg-accent animate-pulse rounded-md" />

      </div>
    );
  }


  /*
  ----------------------------------------------
  ERROR
  ----------------------------------------------
  */

  if (error) {
    return (
      <ApiError error={error} />
    );
  }


  const triggeredCount =
    enrichedAlerts.filter(
      (alert) =>
        alert.triggered
    ).length;


  /*
  ----------------------------------------------
  MAIN
  ----------------------------------------------
  */

  return (
    <div className="space-y-6">


      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

        <div>

          <div className="flex items-center gap-2">

            <BellRing className="size-5 text-primary" />

            <h1 className="text-2xl font-bold tracking-tight">
              Price Alerts
            </h1>

          </div>

          <p className="text-sm text-muted-foreground mt-1">
            Monitor products and get notified when
            your conditions are reached.
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            setCreating(true)
          }
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4" />
          Create Alert
        </button>

      </div>


      {/* TRIGGERED NOTICE */}

      {triggeredCount > 0 && (
        <div className="border border-primary/40 bg-primary/5 rounded-md p-4 flex items-start gap-3">

          <AlertTriangle className="size-5 text-primary shrink-0 mt-0.5" />

          <div>

            <div className="text-sm font-semibold">
              {triggeredCount}{" "}
              {triggeredCount === 1
                ? "alert has"
                : "alerts have"}{" "}
              been triggered.
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              Review the triggered alerts below.
            </div>

          </div>

        </div>
      )}


      {/* CREATE FORM */}

      {creating && (
        <CreateAlert
          products={productList}
          onCreate={createAlert}
          onCancel={() =>
            setCreating(false)
          }
        />
      )}


      {/* EMPTY */}

      {enrichedAlerts.length === 0 && (
        <div className="bg-card border border-border rounded-md p-10 md:p-16 text-center">

          <div className="mx-auto size-12 rounded-full bg-accent flex items-center justify-center">
            <BellRing className="size-6 text-primary" />
          </div>

          <h2 className="font-semibold mt-5">
            No alerts yet
          </h2>

          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Create an alert for a polymer price
            or 24-hour price movement.
          </p>

          {!creating && (
            <button
              type="button"
              onClick={() =>
                setCreating(true)
              }
              className="inline-flex items-center gap-2 px-4 py-2 mt-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              <Plus className="size-4" />
              Create Your First Alert
            </button>
          )}

        </div>
      )}


      {/* ALERTS */}

      {enrichedAlerts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {enrichedAlerts.map(
            (alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                product={alert.product}
                triggered={
                  alert.triggered
                }
                onDelete={
                  deleteAlert
                }
              />
            )
          )}

        </div>
      )}


      {/* FOOTNOTE */}

      {enrichedAlerts.length > 0 && (
        <div className="text-xs text-muted-foreground border-t border-border pt-4">
          Alerts are currently stored locally on
          this device and evaluated against the
          latest product data.
        </div>
      )}

    </div>
  );
}