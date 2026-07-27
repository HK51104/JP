import { useState } from "react";
// useState is a React hook that allows you to add state to functional components. It returns an array with two elements: the current state value and a function to update that state.
import { Link, useParams } from "react-router-dom";
// Link is a component from react-router-dom that allows you to navigate to different routes in your application without causing a full page reload. It is used for client-side navigation.
// useParams is a hook from react-router-dom that allows you to access the parameters of the current route. It returns an object containing key-value pairs of the route parameters.
import { api, useApi } from "../api";
// api is an object that contains functions for making API requests to the backend. It includes methods for fetching products, product details, price history, dashboard data, and top movers.
// useApi is a custom React hook that simplifies the process of making API requests and managing the loading, error, and data states. It takes a function that returns a promise (the API request) and an optional array of dependencies. It returns an object containing the data, error, and loading state.
import { useWatchlist } from "../lib/watchlist";
// useWatchlist is a custom React hook that provides functionality for managing a user's watchlist. It allows you to check if a product is in the watchlist and toggle its presence in the watchlist.
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Star, FileText, Bell, MapPin } from "lucide-react";
//  Importing several icon components from the lucide-react library. These icons are used for visual representation in the UI, such as navigation arrows, star for watchlist, file text for datasheet, bell for alerts, and map pin for location.
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
// Importing components from the recharts library, which is a charting library for React. These components are used to create responsive area charts with axes, tooltips, and grid lines.
import ApiError from "../components/APIerror";
// ApiError is a React component that displays an error message when an API request fails. It is used to provide feedback to the user in case of network or server errors.

const RANGES = [
  { key: "30", label: "30D", days: 30 },
  { key: "90", label: "90D", days: 90 },
  { key: "365", label: "1Y", days: 365 },
];
// key: A unique identifier for the range, used for internal logic and state management.
// label: A human-readable label for the range, displayed in the UI for users to select.
// days: The number of days corresponding to the range, used for filtering and displaying historical data.
// RANGES is an array of objects that defines different time ranges for viewing price history. Each object contains a key (used for identification), a label (displayed in the UI), and the number of days corresponding to that range. This allows users to select different time frames for analyzing product price trends.

function Metric({ label, value, tone }) 
// Display one metric (label + value), and color the value depending on whether it's positive or negative.
{
  // label: The label for the metric, displayed above the value to indicate what the metric represents (e.g., "PERIOD CHANGE", "PERIOD HIGH", "PERIOD LOW").
  // value: The actual value of the metric, displayed prominently to show the user the relevant data (e.g., "+1.2%", "₹78.42").
  // tone: An optional prop that indicates the sentiment or trend of the metric. It can be "up" for positive trends, "down" for negative trends, or undefined for neutral trends. This prop is used to apply conditional styling (e.g., green for positive, red for negative) to visually convey the trend to the user.
  return (
    <div>
      {/* This is the container for one complete metric. */}
      <div className="text-[10px] font-display tracking-widest text-muted-foreground">{label}</div>
      {/* Its only job is to display the name of the metric. */}
      <div className={`font-display text-xl font-bold mt-1 ${tone === "up" ? "text-up" : tone === "down" ? "text-down" : ""}`}>{value}</div>
      {/*This displays the actual value.*/}
    </div>
  );
}

function Row({ k, v }) 
/* This is a small reusable component whose job is:
Display one row of information in two columns:
Left = label (key)
Right = value
*/
// k: The key or label for the row, displayed on the left side to indicate what the value represents (e.g., "Supplier", "Plant", "Category").
// v: The value corresponding to the key, displayed on the right side to show the actual data (e.g., "ABC Corp", "Mumbai Plant", "Polymer").
{
  return (
    <div className="flex justify-between border-b border-border/50 pb-2">
      {/* It creates one horizontal row that contains:
          the label (left)
          the value (right)
          Think of it as a container. 
      */}
      <dt className="text-muted-foreground">{k}</dt>
      {/* This displays the label. */}
      <dd className="font-medium">{v}</dd>
      {/* This displays the actual value */}
    </div>
  );
}

export default function ProductDetails() 
// ProductDetails is a React functional component that displays detailed information about a specific product. It fetches product data and price history from the API, manages state for the selected time range, and renders various UI elements such as product name, category, supplier, current price, price change percentage, and a price history chart. It also provides options to add the product to a watchlist, set price alerts, download datasheets, and request quotes. The component handles loading states and error messages to ensure a smooth user experience.
{
  const { id } = useParams();
  // useParams is a hook from react-router-dom that allows you to access the parameters of the current route. In this case, it retrieves the "id" parameter from the URL, which represents the unique identifier of the product being viewed. This "id" is then used to fetch the corresponding product details and price history from the API.
  const { has, toggle } = useWatchlist();
  // useWatchlist is a custom React hook that provides functionality for managing a user's watchlist. It returns two functions: "has" and "toggle". The "has" function checks if a specific product (identified by its ID) is currently in the user's watchlist, returning a boolean value. The "toggle" function allows the user to add or remove a product from the watchlist based on its current state. In this component, these functions are used to manage the watchlist status of the product being viewed, enabling users to easily add or remove it from their watchlist with a button click.
  const [range, setRange] = useState(RANGES[0]);
  // useState is a React hook that allows you to add state to functional components. In this case, it initializes the "range" state variable with the first element of the RANGES array (representing a 30-day range). The "setRange" function is used to update the "range" state when the user selects a different time range for viewing price history. This state management enables dynamic rendering of the price history chart based on the selected time frame.

  const { data: product, error: prodErr, loading: prodLoad } = useApi(() => api.product(id), [id]);
  // useApi is a custom React hook that simplifies the process of making API requests and managing the loading, error, and data states. In this case, it is used to fetch the details of a specific product based on its "id" parameter from the URL. The hook takes a function that calls the "api.product(id)" method to retrieve the product data and an array of dependencies (in this case, [id]) to re-run the effect when the "id" changes. The returned object contains three properties: "data" (renamed to "product"), which holds the fetched product details; "error" (renamed to "prodErr"), which captures any errors that occur during the API request; and "loading" (renamed to "prodLoad"), which indicates whether the data is still being fetched. This allows the component to handle loading states, display error messages, and render the product details once they are successfully retrieved.
  const { data: history, error: histErr } = useApi(() => api.history(id).catch(() => []), [id]);
  // useApi is a custom React hook that simplifies the process of making API requests and managing the loading, error, and data states. In this case, it is used to fetch the price history of a specific product based on its "id" parameter from the URL. The hook takes a function that calls the "api.history(id)" method to retrieve the price history data and an array of dependencies (in this case, [id]) to re-run the effect when the "id" changes. The ".catch(() => [])" part ensures that if there is an error during the API request, it will return an empty array instead of throwing an error. The returned object contains two properties: "data" (renamed to "history"), which holds the fetched price history data; and "error" (renamed to "histErr"), which captures any errors that occur during the API request. This allows the component to handle error messages and render the price history chart once the data is successfully retrieved.

  if (prodLoad) return <div className="text-sm text-muted-foreground">Loading product…</div>;
  // If the product data is still being fetched (indicated by the "prodLoad" state being true), the component renders a loading message to inform the user that the product details are being loaded. This provides feedback to the user while waiting for the API request to complete.
  if (prodErr) return <ApiError error={prodErr} />;
  // If there is an error while fetching the product data (indicated by the "prodErr" state being truthy), the component renders the "ApiError" component, passing the error object as a prop. This allows the user to see an error message indicating that there was an issue retrieving the product details, providing feedback on the failure of the API request.
  if (!product) 
    // If the product data is not available (indicated by the "product" state being falsy), it means that the product with the specified ID was not found. In this case, the component renders a message informing the user that the product was not found and provides a link to navigate back to the products page. This ensures that users are aware of the situation and can easily return to the list of products to continue browsing.
    {
    return (
      <div className="text-center py-20">
        <h1 className="text-xl font-bold">Product not found</h1>
        <Link to="/products" className="text-primary text-sm mt-2 inline-block">← Back to products</Link>
      </div>
    );
  }

  const fullHistory = history || [];
  // If the "history" data is available (fetched from the API), it is assigned to the "fullHistory" variable. If the "history" data is not available (indicated by it being falsy), an empty array is assigned to "fullHistory". This ensures that "fullHistory" always has a valid array value, allowing the component to safely perform operations on it without encountering errors due to undefined or null values.
  const data = fullHistory.slice(-range.days);
  // The "data" variable is created by slicing the "fullHistory" array to include only the most recent entries based on the selected time range. The "range.days" value determines how many days of price history to include. By using the "slice" method with a negative index, it retrieves the last "range.days" elements from the "fullHistory" array. This allows the component to dynamically display the relevant price history data based on the user's selected time range, ensuring that the chart reflects the appropriate historical data for analysis.
  const first = data[0]?.price ?? product.currentPrice;
  // The "first" variable is assigned the price of the first entry in the "data" array, which represents the earliest price point within the selected time range. The optional chaining operator (?.) is used to safely access the "price" property of the first element in the "data" array, preventing errors if the array is empty. If the "data" array is empty (i.e., there are no historical price entries for the selected range), the nullish coalescing operator (??) provides a fallback value by assigning "product.currentPrice" to "first". This ensures that "first" always has a valid price value, either from the historical data or from the current product price, allowing for accurate calculations of price changes over the selected period.
  const periodChange = first ? ((product.currentPrice - first) / first) * 100 : 0;
  // The "periodChange" variable calculates the percentage change in price over the selected time range. It compares the current product price ("product.currentPrice") with the first price point in the "data" array ("first"). The formula used is: ((currentPrice - first) / first) * 100, which gives the percentage change. If "first" is a valid price (not zero or undefined), the calculation is performed; otherwise, if "first" is falsy (e.g., zero or undefined), "periodChange" is set to 0. This ensures that the component can accurately display the percentage change in price over the selected period, providing users with insights into price trends.
  const high = data.length ? Math.max(...data.map((d) => d.price)) : product.currentPrice;
  // The "high" variable calculates the highest price within the selected time range. If the "data" array has entries (i.e., its length is greater than 0), it uses the "Math.max" function along with the "map" method to extract the "price" values from each entry in the "data" array and find the maximum price. If the "data" array is empty (i.e., there are no historical price entries for the selected range), it falls back to using the current product price ("product.currentPrice") as the high value. This ensures that "high" always has a valid price value, either from the historical data or from the current product price, allowing for accurate display of the highest price during the selected period.
  const low = data.length ? Math.min(...data.map((d) => d.price)) : product.currentPrice;
  // The "low" variable calculates the lowest price within the selected time range. If the "data" array has entries (i.e., its length is greater than 0), it uses the "Math.min" function along with the "map" method to extract the "price" values from each entry in the "data" array and find the minimum price. If the "data" array is empty (i.e., there are no historical price entries for the selected range), it falls back to using the current product price ("product.currentPrice") as the low value. This ensures that "low" always has a valid price value, either from the historical data or from the current product price, allowing for accurate display of the lowest price during the selected period.

  return (
    <>
      <Link to="/products" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="size-3" /> Back to products
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        {/*
        This is the main header container.
        It divides the top section into two parts: 
        Left = Product information
        Right = Price panel
        */}
        <div>
          {/* Contains everything describing the product. */}
          <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-1">{product.category} · {product.supplier}</div>
          {/* shows catgeories.supplier */}
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          {/* main product title */}
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground font-mono">
            {/* Show product metadata in one horizontal row. */}
            <span>{product.grade}</span><span>·</span><span>{product.mfi}</span><span>·</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{product.location}</span>
          </div>
        </div>
        <div className="text-right">
          {/* Show pricing information. */}
          <div className="font-display text-4xl font-bold tracking-tight">₹{product.currentPrice.toFixed(2)}</div>
          {/* shows big current price */}
          <div className="text-xs text-muted-foreground">
            {/* shows small supporting info */}
            per KG{product.lastUpdated ? ` · updated ${new Date(product.lastUpdated).toLocaleString()}` : ""}
          </div>
          <div className={`inline-flex items-center gap-1 mt-2 text-sm font-display ${product.changePct > 0 ? "text-up" : product.changePct < 0 ? "text-down" : "text-muted-foreground"}`}>
            {product.changePct > 0 ? <ArrowUpRight className="size-4" /> : product.changePct < 0 ? <ArrowDownRight className="size-4" /> : null}
            {product.changePct > 0 ? "+" : ""}{product.changePct}% (24h)
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {/* Show pricing information. */}
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
        {/* 
          Entire card for
          Price History
          Everything related to graphs is inside.
        */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          {/*
           Split the top into
           Left
           Right 
          */}
          <div>
            {/* 
            Contains
            Price History
            Indicative Spot Prices 
            */}
            <h2 className="text-sm font-semibold tracking-tight">Price History</h2>
            <p className="text-xs text-muted-foreground mt-1">Indicative spot, INR per KG</p>
          </div>
          <div className="flex gap-1 p-1 bg-secondary rounded-md">
            {/* contains all time buttons */}
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
          {/* 
          Show
          Period Change
          Period High
          Period Low 
          */}
          <Metric label="PERIOD CHANGE" value={`${periodChange > 0 ? "+" : ""}${periodChange.toFixed(2)}%`} tone={periodChange > 0 ? "up" : "down"} />
          <Metric label="PERIOD HIGH" value={`₹${high.toFixed(2)}`} />
          <Metric label="PERIOD LOW" value={`₹${low.toFixed(2)}`} />
        </div>

        <div className="h-[360px]">
          {/* Reserve 360px height for the chart. */}
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              {/*
               If there is no graph data
              center this message
              No price history yet
              exactly in the middle. 
              */}
              {histErr ? "Couldn't load price history." : "No price history yet."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {/* Entire graph lives here */}
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
        {/* 
        Second big card.
        Contains supplier information. 
        */}
        <h3 className="text-sm font-semibold mb-4">Supplier Information</h3>
        {/* shows supplier information */}
        <dl className="space-y-2 text-sm">
          {/* container for defination list */}
          <Row k="Supplier" v={product.supplier} />
          <Row k="Plant" v={product.location} />
          <Row k="Category" v={product.category} />
          <Row k="MFI / Specification" v={product.mfi} />
        </dl>
      </div>
    </>
  );
}
