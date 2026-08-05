/*
CONCLUSION)
 this Alerts component allows users to create and manage price alerts for polymer products. It fetches the available products from the backend, lets users choose a product, define an alert condition (above or below a target price), select one or more notification channels, and save the alert. It also displays all active alerts and allows users to delete them. By combining React state, custom hooks, and API integration, the page provides a complete interface for monitoring product prices and notifying users when their specified conditions are met.
*/



import { useState } from "react";
// useState is a React hook that allows functional components to have state variables. It returns an array with two elements: the current state value and a function to update that value. In this code, useState is used to manage the state of various variables such as product ID, direction, threshold, and notification channels in the Alerts component.
import { useSearchParams } from "react-router-dom";
// useSearchParams is a hook from the react-router-dom library that provides access to the URL's query parameters. It returns an array with two elements: the current search parameters and a function to update them. In this code, useSearchParams is used to read the "productId" parameter from the URL and set it as the initial product ID for creating alerts in the Alerts component.
import { Bell, Mail, MessageSquare, Smartphone, Trash2 } from "lucide-react";
// Bell, Mail, MessageSquare, Smartphone, and Trash2 are icon components imported from the lucide-react library. These icons are used in the Alerts component to visually represent different actions and notification channels. For example, the Bell icon is used to indicate alerts, the Mail icon for email notifications, the MessageSquare icon for WhatsApp notifications, the Smartphone icon for SMS notifications, and the Trash2 icon for deleting alerts.
import { api, useApi } from "../api";
// api is an object that contains functions for making API requests to the backend server, such as fetching products, product details, and price history. useApi is a custom React hook that simplifies the process of making API requests and managing the loading, error, and data states. It is used to fetch data from the backend and handle the response in a React component.
import { useAlerts } from "../lib/watchlist";
// useAlerts is a custom React hook that provides functionality for managing price alerts in the application. It allows components to access the current list of alerts, add new alerts, and remove existing alerts. This hook is used in the Alerts component to handle the creation and management of price alerts for different products.
import ApiError from "../components/APIerror";
// ApiError is a React component that is used to display error messages related to API requests. It takes an error object as a prop and renders a user-friendly message indicating that there was an issue with the API request. This component helps improve the user experience by providing feedback when something goes wrong during data fetching.

const CHANNELS = [
  { k: "email", icon: Mail, label: "Email" },
  // k:email == This is the key for the channel.(key value)
  // icon:Mail == This is the icon component to display for the channel.
  // label:Email == This is the text to display for the channel.
  { k: "sms", icon: Smartphone, label: "SMS" },
  { k: "whatsapp", icon: MessageSquare, label: "WhatsApp" },
];
// It simply creates a list of all supported notification channels (Email, SMS, and WhatsApp), along with their internal key, icon, and display label, so the rest of the Alerts component can loop over this array and automatically build the UI instead of hardcoding each channel separately.

export default function Alerts() 
// The Alerts component is a React functional component that allows users to create and manage price alerts for different products. It uses the useApi hook to fetch the list of products from the backend server, the useSearchParams hook to read query parameters from the URL, and the useAlerts hook to manage the list of alerts. The component provides a form for creating new alerts, displays a list of active alerts, and handles loading and error states. It also includes functionality for selecting notification channels (email, SMS, WhatsApp) and validating user input before creating an alert.
{
  const [params] = useSearchParams();
  // The useSearchParams hook is called to access the URL's query parameters. It returns an array with two elements: the current search parameters (params) and a function to update them. In this code, only the first element (params) is used to read the "productId" parameter from the URL, which is then used to set the initial product ID for creating alerts in the Alerts component.
  
  const { data: products, error, loading } = useApi(
    () => api.products(),
    []
  );
  // The useApi hook is called with a function that fetches the list of products from the backend server using the api.products() method. The hook returns an object containing three properties: data (renamed to products), which holds the fetched product data; error, which captures any errors that occur during the API request; and loading, which indicates whether the data is still being fetched. This allows the component to handle loading states, display error messages, and render the list of products once the data is successfully retrieved.

  const { alerts, add, remove } = useAlerts();
  // The useAlerts hook is called to access the functionality for managing price alerts in the application. It returns an object containing three properties: alerts, which is an array of the current alerts; add, which is a function that allows adding a new alert; and remove, which is a function that allows removing an existing alert. This hook enables the Alerts component to create and manage price alerts for different products effectively.

  const PRODUCTS = products || [];
  // The line "const PRODUCTS = products || [];" creates a new constant called PRODUCTS that holds the list of products fetched from the backend server. If the products data is null or undefined (e.g., if the API request has not completed yet), it defaults to an empty array. This ensures that the component can safely work with the PRODUCTS variable without encountering errors when trying to access its properties or iterate over it, even if the data has not been loaded yet.

  const initialPid =
    params.get("productId") || PRODUCTS[0]?.id || "";
    // The line "const initialPid = params.get("productId") || PRODUCTS[0]?.id || "";" initializes the variable initialPid with the product ID to be used when creating a new alert. It first attempts to retrieve the "productId" query parameter from the URL using params.get("productId"). If that value is not present (i.e., it returns null), it falls back to using the ID of the first product in the PRODUCTS array (PRODUCTS[0]?.id). If there are no products available (i.e., PRODUCTS is empty), it defaults to an empty string. This ensures that initialPid always has a valid value, either from the URL, the first product, or an empty string if no products are available.

  const [pid, setPid] = useState(initialPid);
  // The line "const [pid, setPid] = useState(initialPid);" uses the useState hook to create a state variable called pid and a corresponding setter function called setPid. The initial value of pid is set to initialPid, which is determined based on the URL query parameter or the first product in the PRODUCTS array. The pid state variable represents the currently selected product ID for creating a new alert, and setPid allows updating this value when the user selects a different product from the dropdown menu in the form.

  const [direction, setDirection] = useState("below");
  // The line "const [direction, setDirection] = useState("below");" uses the useState hook to create a state variable called direction and a corresponding setter function called setDirection. The initial value of direction is set to "below", indicating that the default condition for the price alert is to trigger when the product's price falls below the specified threshold. The direction state variable represents the selected condition for the alert, and setDirection allows updating this value when the user chooses between "below" or "above" in the form.

  const [threshold, setThreshold] = useState("");
  // The line "const [threshold, setThreshold] = useState("");" uses the useState hook to create a state variable called threshold and a corresponding setter function called setThreshold. The initial value of threshold is set to an empty string, indicating that no threshold value has been entered yet. The threshold state variable represents the target price for the alert, and setThreshold allows updating this value when the user inputs a specific price in the form.

  const [channels, setChannels] = useState(["email"]);
  // The line "const [channels, setChannels] = useState(["email"]);" uses the useState hook to create a state variable called channels and a corresponding setter function called setChannels. The initial value of channels is set to an array containing the string "email", indicating that email notifications are enabled by default for the alert. The channels state variable represents the selected notification channels for the alert, and setChannels allows updating this value when the user selects or deselects different channels (e.g., email, SMS, WhatsApp) in the form.

  const toggleChan = (c) => {
    setChannels((prev) =>
      prev.includes(c)
        ? prev.filter((x) => x !== c)
        : [...prev, c]
    );
  };
  // The toggleChan function is a utility function that allows toggling the selection of notification channels for the alert. It takes a channel key (c) as an argument and updates the channels state variable accordingly. If the channel is already selected (i.e., it exists in the channels array), it removes it by filtering it out. If the channel is not selected, it adds it to the array by spreading the previous channels and appending the new channel. This function enables users to easily select or deselect notification channels when creating an alert.

  const submit = (e) => {
    e.preventDefault();
    // The submit function is an event handler that is called when the user submits the form to create a new alert. It takes an event object (e) as an argument and calls e.preventDefault() to prevent the default form submission behavior, which would cause a page reload. Instead, the function performs validation checks on the input values (threshold and channels) and, if valid, calls the add function from the useAlerts hook to create a new alert with the specified product ID, threshold, direction, and selected notification channels. After successfully adding the alert, it resets the threshold input field and displays a confirmation message to the user.

    const t = parseFloat(threshold);
    // The line "const t = parseFloat(threshold);" converts the threshold input value (which is a string) into a floating-point number using the parseFloat function. This is necessary because the threshold value entered by the user in the form is initially stored as a string, and it needs to be converted to a number for validation and comparison purposes when creating the alert. The variable t will hold the numeric representation of the threshold value, which will be used in subsequent validation checks and when adding the alert.

    if (!t || t <= 0) {
      alert("Enter a valid threshold");
      return;
    }
    // The if statement checks whether the parsed threshold value (t) is falsy (e.g., NaN, 0, or null) or less than or equal to zero. If either condition is true, it means that the user has entered an invalid threshold value. In this case, the function displays an alert message to the user indicating that they need to enter a valid threshold and then returns early from the submit function, preventing the creation of the alert. This validation ensures that only positive numeric values are accepted for the threshold when creating a new price alert.

    if (channels.length === 0) {
      alert("Pick at least one channel");
      return;
    }
    // The if statement checks whether the length of the channels array is zero, which indicates that the user has not selected any notification channels for the alert. If this condition is true, it means that the user must choose at least one channel to receive notifications. In this case, the function displays an alert message to the user indicating that they need to pick at least one channel and then returns early from the submit function, preventing the creation of the alert. This validation ensures that users cannot create an alert without specifying how they want to be notified.

    add({
      productId: pid,
      threshold: t,
      direction,
      channels,
    });
    // The add function from the useAlerts hook is called with an object containing the necessary properties to create a new alert. The object includes the selected product ID (pid), the parsed threshold value (t), the selected direction (either "below" or "above"), and the array of selected notification channels (channels). This function adds the new alert to the list of active alerts, allowing users to receive notifications when the specified conditions are met for the chosen product.

    setThreshold("");
    alert("Alert created");
  };
  // The submit function is an event handler that is called when the user submits the form to create a new alert. It takes an event object (e) as an argument and calls e.preventDefault() to prevent the default form submission behavior, which would cause a page reload. Instead, the function performs validation checks on the input values (threshold and channels) and, if valid, calls the add function from the useAlerts hook to create a new alert with the specified product ID, threshold, direction, and selected notification channels. After successfully adding the alert, it resets the threshold input field and displays a confirmation message to the user.

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading products...
      </div>
    );
  }
// If there is an error, display the error message
  if (error) {
    return <ApiError error={error} />;
  }
  // If there is no loading or error, display the alert creation form

  return 
  // This entire component lets the user fetch products from the backend, configure a price alert (product, condition, threshold, and notification channels), save it, display all active alerts, and delete alerts—all while React automatically updates the UI whenever the underlying state changes.
  (
    <>
      <div className="mb-6">
      {/* page heading section. */}
        <h1 className="text-2xl font-bold tracking-tight">
          Price Alerts
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Get notified when a polymer crosses your target
          price.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* main layout container. */}
        <form
          onSubmit={submit}
          className="bg-card border border-border rounded-md p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold">
            New Alert
          </h2>

          <div>
            {/* groups dropdown together */}
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
            {/* This outs thresold and condition side by side together */}
            <div>
              {/* groups CONDITION and  below above condition together */}
              <label className="text-[10px] font-display tracking-widest text-muted-foreground">
                CONDITION
              </label>

              <div className="flex gap-1 mt-1 p-1 bg-secondary rounded-md">
                {/* button container */}
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
              {/* groups THRESHOLD and input box together */}
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
            {/* groups NOTIFY VIA and buttons together */}
            <label className="text-[10px] font-display tracking-widest text-muted-foreground">
              NOTIFY VIA
            </label>

            <div className="flex flex-wrap gap-2 mt-2">
              {/* allows wrapping of EMAIL SMS WHATSAPP */}
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
          {/* This is the entire Active Alerts card. */}
          <h2 className="text-sm font-semibold mb-4">
            Active Alerts ({alerts.length})
          </h2>

          {alerts.length === 0 ? (
            <div className="text-center py-12">
              {/* Show the empty state. */}
              <Bell className="size-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No active alerts.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Stack all alerts vertically.*/}
              {alerts.map((a) => {
                const p = PRODUCTS.find(
                  (x) => x.id === a.productId
                );

                if (!p) 
                  {
                    return null;
                  }

                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 border border-border rounded-md"
                  >
                    {/* One complete alert card. */}
                    <div>
                      {/* groups product name and condition together */}
                      <div className="text-sm font-medium">
                        {p.name}
                        <span className="text-muted-foreground font-mono text-xs">
                          {" "}
                          {p.grade}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground mt-0.5">
                        {/* Show PVC Resin PPH110 Product title. */}
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