
/*
  Alerts.jsx

  Responsibilities:
  - Fetch products from the backend.
  - Create price alerts.
  - Support above/below conditions.
  - Support Email, SMS and WhatsApp notification channels.
  - Display active alerts.
  - Delete alerts.
  - Responsive across mobile, tablet and desktop.
*/

import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Trash2,
  ArrowDown,
  ArrowUp,
  Plus,
  ExternalLink,
} from "lucide-react";

import { api, useApi } from "../api";
import { useAlerts } from "../lib/watchlist";
import ApiError from "../components/APIerror";


const CHANNELS = [
  {
    k: "email",
    icon: Mail,
    label: "Email",
  },
  {
    k: "sms",
    icon: Smartphone,
    label: "SMS",
  },
  {
    k: "whatsapp",
    icon: MessageSquare,
    label: "WhatsApp",
  },
];


function AlertDirection({ direction }) {
  const isAbove = direction === "above";

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1
        text-[10px]
        sm:text-xs
        font-display
        ${
          isAbove
            ? "text-up"
            : "text-down"
        }
      `}
    >
      {isAbove ? (
        <ArrowUp className="size-3" />
      ) : (
        <ArrowDown className="size-3" />
      )}

      {isAbove ? "ABOVE" : "BELOW"}
    </span>
  );
}


function AlertCard({ alert, product, onRemove }) {
  return (
    <div
      className="
        bg-background
        border
        border-border
        rounded-lg
        p-4
        transition-colors
        hover:bg-accent/30
      "
    >
      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-4
        "
      >

        {/* PRODUCT + ALERT INFORMATION */}

        <div className="min-w-0 flex-1">

          <div
            className="
              flex
              items-start
              gap-3
            "
          >

            <div
              className="
                size-9
                shrink-0
                rounded-md
                bg-primary/10
                flex
                items-center
                justify-center
              "
            >
              <Bell className="size-4 text-primary" />
            </div>


            <div className="min-w-0 flex-1">

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-x-2
                  gap-y-1
                "
              >

                <Link
                  to={`/products/${product.id}`}
                  className="
                    text-sm
                    font-semibold
                    truncate
                    hover:text-primary
                    transition-colors
                  "
                >
                  {product.name}
                </Link>


                <span
                  className="
                    text-[10px]
                    sm:text-xs
                    text-muted-foreground
                    font-mono
                  "
                >
                  {product.grade}
                </span>

              </div>


              <div
                className="
                  mt-1.5
                  flex
                  flex-wrap
                  items-center
                  gap-x-2
                  gap-y-1
                  text-xs
                  text-muted-foreground
                "
              >

                <span>
                  Notify when price
                </span>

                <AlertDirection
                  direction={alert.direction}
                />

                <span
                  className="
                    font-display
                    text-foreground
                    font-semibold
                  "
                >
                  ₹{Number(alert.threshold).toFixed(2)}
                </span>

              </div>


              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  gap-1.5
                "
              >

                {(alert.channels || []).map(
                  (channel) => {
                    const channelInfo =
                      CHANNELS.find(
                        (c) => c.k === channel
                      );

                    if (!channelInfo) {
                      return null;
                    }

                    const Icon =
                      channelInfo.icon;

                    return (
                      <span
                        key={channel}
                        className="
                          inline-flex
                          items-center
                          gap-1
                          px-2
                          py-1
                          rounded
                          bg-secondary
                          text-[10px]
                          text-muted-foreground
                        "
                      >
                        <Icon className="size-3" />

                        {channelInfo.label}
                      </span>
                    );
                  }
                )}

              </div>

            </div>

          </div>

        </div>


        {/* CURRENT PRICE + DELETE */}

        <div
          className="
            flex
            items-center
            justify-between
            sm:justify-end
            gap-4
            sm:min-w-44
          "
        >

          <div className="sm:text-right">

            <div
              className="
                text-[9px]
                sm:text-[10px]
                font-display
                tracking-widest
                text-muted-foreground
              "
            >
              CURRENT PRICE
            </div>

            <div
              className="
                font-display
                text-base
                sm:text-lg
                font-bold
                mt-0.5
              "
            >
              ₹{Number(product.currentPrice || 0).toFixed(2)}
            </div>

          </div>


          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <Link
              to={`/products/${product.id}`}
              title="View product"
              aria-label={`View ${product.name}`}
              className="
                size-9
                rounded-md
                border
                border-border
                flex
                items-center
                justify-center
                text-muted-foreground
                hover:text-primary
                hover:border-primary
                transition-colors
              "
            >
              <ExternalLink className="size-3.5" />
            </Link>


            <button
              type="button"
              onClick={() => onRemove(alert.id)}
              title="Delete alert"
              aria-label={`Delete alert for ${product.name}`}
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
                hover:border-down
                transition-colors
              "
            >
              <Trash2 className="size-3.5" />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}


export default function Alerts() {

  const [params] = useSearchParams();


  const {
    data: products,
    error,
    loading,
  } = useApi(
    () => api.products(),
    []
  );


  const {
    alerts,
    add,
    remove,
  } = useAlerts();


  const PRODUCTS = products || [];


  const initialPid =
    params.get("productId") ||
    PRODUCTS[0]?.id ||
    "";


  const [pid, setPid] =
    useState(initialPid);


  const [direction, setDirection] =
    useState("below");


  const [threshold, setThreshold] =
    useState("");


  const [channels, setChannels] =
    useState(["email"]);


  const toggleChan = (channel) => {

    setChannels((previous) =>
      previous.includes(channel)
        ? previous.filter(
            (item) => item !== channel
          )
        : [...previous, channel]
    );

  };


  const submit = (event) => {

    event.preventDefault();


    const value =
      parseFloat(threshold);


    if (!value || value <= 0) {
      alert("Enter a valid threshold");
      return;
    }


    if (!pid) {
      alert("Select a product");
      return;
    }


    if (channels.length === 0) {
      alert("Pick at least one channel");
      return;
    }


    add({
      productId: pid,
      threshold: value,
      direction,
      channels,
    });


    setThreshold("");

    alert("Alert created");

  };


  if (loading) {

    return (
      <div className="w-full min-w-0 animate-pulse">

        <div className="mb-8">

          <div className="h-7 w-36 bg-secondary rounded" />

          <div className="h-4 w-72 max-w-full bg-secondary rounded mt-2" />

        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="h-96 bg-card border border-border rounded-lg" />

          <div className="h-96 bg-card border border-border rounded-lg" />

        </div>

      </div>
    );

  }


  if (error) {
    return <ApiError error={error} />;
  }


  return (
    <div className="w-full min-w-0">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div
        className="
          mb-6
          sm:mb-8
          flex
          flex-col
          sm:flex-row
          sm:items-end
          sm:justify-between
          gap-3
        "
      >

        <div>

          <div className="flex items-center gap-2">

            <Bell
              className="
                size-5
                sm:size-6
                text-primary
              "
            />

            <h1
              className="
                text-2xl
                sm:text-3xl
                font-bold
                tracking-tight
              "
            >
              Price Alerts
            </h1>

          </div>


          <p
            className="
              text-xs
              sm:text-sm
              text-muted-foreground
              mt-1
            "
          >
            Get notified when a polymer crosses your target price.
          </p>

        </div>


        <div
          className="
            text-[10px]
            sm:text-xs
            font-display
            text-muted-foreground
          "
        >
          {alerts.length}{" "}
          {alerts.length === 1
            ? "ACTIVE ALERT"
            : "ACTIVE ALERTS"}
        </div>

      </div>


      {/* =====================================================
          MAIN GRID
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-5
          lg:gap-6
          items-start
        "
      >

        {/* ===================================================
            CREATE ALERT
        ==================================================== */}

        <form
          onSubmit={submit}
          className="
            bg-card
            border
            border-border
            rounded-lg
            p-4
            sm:p-5
            space-y-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
              pb-3
              border-b
              border-border
            "
          >

            <div
              className="
                size-8
                rounded-md
                bg-primary/10
                flex
                items-center
                justify-center
              "
            >
              <Plus className="size-4 text-primary" />
            </div>


            <div>

              <h2 className="text-sm font-semibold">
                New Alert
              </h2>

              <p className="text-[10px] text-muted-foreground mt-0.5">
                Set a price target for any tracked grade.
              </p>

            </div>

          </div>


          {/* PRODUCT */}

          <div>

            <label
              htmlFor="alert-product"
              className="
                text-[10px]
                font-display
                tracking-widest
                text-muted-foreground
              "
            >
              PRODUCT
            </label>


            <select
              id="alert-product"
              value={pid}
              onChange={(event) =>
                setPid(event.target.value)
              }
              className="
                w-full
                mt-1.5
                bg-background
                border
                border-border
                rounded-md
                px-3
                py-2.5
                text-sm
                focus:outline-none
                focus:border-primary
              "
            >

              {PRODUCTS.length === 0 ? (
                <option value="">
                  No products available
                </option>
              ) : (
                PRODUCTS.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name} — {product.grade}
                  </option>
                ))
              )}

            </select>

          </div>


          {/* CONDITION + THRESHOLD */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-4
            "
          >

            {/* CONDITION */}

            <div>

              <label
                className="
                  text-[10px]
                  font-display
                  tracking-widest
                  text-muted-foreground
                "
              >
                CONDITION
              </label>


              <div
                className="
                  flex
                  gap-1
                  mt-1.5
                  p-1
                  bg-secondary
                  rounded-md
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setDirection("below")
                  }
                  className={`
                    flex-1
                    py-2
                    text-xs
                    rounded
                    transition-colors
                    ${
                      direction === "below"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  ↓ Below
                </button>


                <button
                  type="button"
                  onClick={() =>
                    setDirection("above")
                  }
                  className={`
                    flex-1
                    py-2
                    text-xs
                    rounded
                    transition-colors
                    ${
                      direction === "above"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  ↑ Above
                </button>

              </div>

            </div>


            {/* THRESHOLD */}

            <div>

              <label
                htmlFor="alert-threshold"
                className="
                  text-[10px]
                  font-display
                  tracking-widest
                  text-muted-foreground
                "
              >
                THRESHOLD (₹/KG)
              </label>


              <div className="relative mt-1.5">

                <span
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-muted-foreground
                    text-sm
                  "
                >
                  ₹
                </span>


                <input
                  id="alert-threshold"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={threshold}
                  onChange={(event) =>
                    setThreshold(event.target.value)
                  }
                  placeholder="130.00"
                  className="
                    w-full
                    bg-background
                    border
                    border-border
                    rounded-md
                    pl-7
                    pr-3
                    py-2.5
                    text-sm
                    focus:outline-none
                    focus:border-primary
                  "
                />

              </div>

            </div>

          </div>


          {/* CHANNELS */}

          <div>

            <label
              className="
                text-[10px]
                font-display
                tracking-widest
                text-muted-foreground
              "
            >
              NOTIFY VIA
            </label>


            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-3
                gap-2
                mt-2
              "
            >

              {CHANNELS.map((channel) => {

                const Icon = channel.icon;

                const selected =
                  channels.includes(channel.k);


                return (
                  <button
                    key={channel.k}
                    type="button"
                    onClick={() =>
                      toggleChan(channel.k)
                    }
                    aria-pressed={selected}
                    className={`
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-3
                      py-2.5
                      border
                      rounded-md
                      text-xs
                      transition-colors
                      ${
                        selected
                          ? "border-primary text-primary bg-primary/10"
                          : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                      }
                    `}
                  >

                    <Icon className="size-3.5" />

                    {channel.label}

                  </button>
                );

              })}

            </div>

          </div>


          {/* CREATE */}

          <button
            type="submit"
            disabled={!pid || PRODUCTS.length === 0}
            className="
              w-full
              bg-primary
              text-primary-foreground
              rounded-md
              py-2.5
              text-sm
              font-medium
              hover:opacity-90
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition-opacity
            "
          >
            Create Alert
          </button>

        </form>


        {/* ===================================================
            ACTIVE ALERTS
        ==================================================== */}

        <div
          className="
            bg-card
            border
            border-border
            rounded-lg
            p-4
            sm:p-5
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              pb-3
              border-b
              border-border
            "
          >

            <div>

              <h2 className="text-sm font-semibold">
                Active Alerts
              </h2>

              <p className="text-[10px] text-muted-foreground mt-0.5">
                Your configured price triggers.
              </p>

            </div>


            <span
              className="
                shrink-0
                px-2
                py-1
                rounded
                bg-secondary
                text-[10px]
                font-display
                text-muted-foreground
              "
            >
              {alerts.length}
            </span>

          </div>


          {alerts.length === 0 ? (

            <div
              className="
                text-center
                py-10
                sm:py-14
              "
            >

              <div
                className="
                  mx-auto
                  size-12
                  rounded-full
                  bg-accent
                  flex
                  items-center
                  justify-center
                  mb-3
                "
              >

                <Bell
                  className="
                    size-5
                    text-muted-foreground
                  "
                />

              </div>


              <p className="text-sm font-medium">
                No active alerts
              </p>


              <p
                className="
                  text-xs
                  text-muted-foreground
                  mt-1
                  max-w-xs
                  mx-auto
                "
              >
                Create an alert on the left to start monitoring a price target.
              </p>

            </div>

          ) : (

            <div className="space-y-3 pt-4">

              {alerts.map((alertItem) => {

                const product =
                  PRODUCTS.find(
                    (product) =>
                      String(product.id) ===
                      String(alertItem.productId)
                  );


                if (!product) {
                  return null;
                }


                return (
                  <AlertCard
                    key={alertItem.id}
                    alert={alertItem}
                    product={product}
                    onRemove={remove}
                  />
                );

              })}

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          FOOTER NOTE
      ====================================================== */}

      <div
        className="
          mt-5
          text-[10px]
          sm:text-xs
          text-muted-foreground
        "
      >
        Alerts are stored locally in your browser and are currently
        used for UI monitoring rather than server-side notifications.
      </div>

    </div>
  );
}

