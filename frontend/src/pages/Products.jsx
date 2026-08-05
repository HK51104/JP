/*
Products.jsx — Final Conclusion

This page has one responsibility:

Fetch all products from the backend, let the user search/filter them, and display them in a table.
*/




import { Link, useSearchParams } from "react-router-dom";
// useSearchParams is a hook from react-router-dom that allows you to read and modify the query parameters in the URL. It returns an array with two elements: the current search parameters and a function to update them.
// Link is a component from react-router-dom that allows you to navigate to different routes in your application without causing a full page reload. It is used to create links that users can click to navigate to different pages within the app.
import { api, useApi } from "../api";
// api is an object that contains methods for making API requests to the backend server. It provides functions to fetch data related to products, product details, price history, dashboard information, and top movers. The useApi function is a custom React hook that simplifies the process of making API requests and managing the loading, error, and data states. It takes a function that performs the API request and an array of dependencies, and it returns an object containing the loading state, any error that occurred during the request, and the fetched data.
// useApi is a custom React hook that simplifies the process of making API requests and managing the loading, error, and data states. It takes a function that performs the API request and an array of dependencies, and it returns an object containing the loading state, any error that occurred during the request, and the fetched data.
import { useState, useEffect } from "react";
// useState is a React hook that allows you to add state to functional components. It returns an array with two elements: the current state value and a function to update that state.
// useEffect is a React hook that allows you to perform side effects in functional components. It takes a function as an argument and runs it after the component renders. You can also specify dependencies to control when the effect should re-run.
import { ArrowLeft } from "lucide-react";
// ArrowLeft is an icon component from the lucide-react library that renders a left-pointing arrow SVG. It can be used in the UI to indicate navigation or direction, such as going back to a previous page.
import ApiError from "../components/APIerror";
// ApiError is a React component that displays an error message when an API request fails. It takes an error object as a prop and renders a user-friendly message indicating that there was an issue with the API request. This component is used to provide feedback to the user when there are problems fetching data from the backend server.
import { useWatchlist } from "../lib/watchlist";
// useWatchlist is a custom React hook that provides functionality for managing a user's watchlist. It allows you to check if a product is in the watchlist, add or remove products from the watchlist, and toggle the watchlist status of a product. This hook helps manage the state of the watchlist and provides an interface for interacting with it in the application.
import { Search, Star, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react";
// Search is an icon component from the lucide-react library that renders a magnifying glass SVG, typically used to represent search functionality in the UI.
// Star is an icon component from the lucide-react library that renders a star SVG, often used to represent favorites or watchlist items in the UI.
// ArrowUpRight is an icon component from the lucide-react library that renders an arrow pointing up and to the right, often used to indicate positive changes or increases in data.
// ArrowDownRight is an icon component from the lucide-react library that renders an arrow pointing down and to the right, often used to indicate negative changes or decreases in data.
// FileText is an icon component from the lucide-react library that renders a document or file SVG, often used to represent downloadable files or datasheets in the UI.

export default function Products()
// The Products function is a React functional component that serves as the main page for displaying a list of products. It utilizes various hooks and components to manage state, handle API requests, and render the UI. The component fetches product data from the backend, allows users to filter and search through the products, and provides navigation links to individual product details pages. It also integrates watchlist functionality, enabling users to add or remove products from their watchlist. The component handles loading states, error messages, and displays the filtered list of products in a table format with relevant information such as name, grade, category, location, price, and last updated time.
{
  const [params, setParams] = useSearchParams();
  // useSearchParams is a hook from react-router-dom that allows you to read and modify the query parameters in the URL. It returns an array with two elements: the current search parameters and a function to update them. In this case, it is used to manage the search and filter parameters for the products page, enabling users to filter products by category and search term.
  const q = params.get("q") ?? "";
  // params.get("q") retrieves the value of the "q" query parameter from the URL, which represents the search term entered by the user. If the "q" parameter is not present in the URL, it defaults to an empty string (""). This allows the component to handle cases where no search term is provided and ensures that the search functionality works correctly even when the query parameter is missing.
  const category = params.get("category") ?? "ALL";
  // params.get("category") retrieves the value of the "category" query parameter from the URL, which represents the selected product category for filtering. If the "category" parameter is not present in the URL, it defaults to "ALL". This allows the component to handle cases where no specific category is selected and ensures that all products are displayed when no category filter is applied.
  const { has, toggle } = useWatchlist();
  // useWatchlist is a custom React hook that provides functionality for managing a user's watchlist. It returns an object with two properties: "has" and "toggle". The "has" function checks if a specific product ID is present in the watchlist, returning a boolean value. The "toggle" function adds or removes a product from the watchlist based on its current state. This allows the component to manage the watchlist state and provide users with the ability to add or remove products from their watchlist directly from the products page.
  const { data: products, error, loading } = useApi(() => api.products(), []);
  // useApi is a custom React hook that simplifies the process of making API requests and managing the loading, error, and data states. In this case, it is used to fetch the list of products from the backend server by calling the "api.products()" function. The hook takes an empty array as the second argument, indicating that the effect should only run once when the component mounts. The returned object contains three properties: "data" (renamed to "products"), which holds the fetched product data; "error", which captures any errors that occur during the API request; and "loading", which indicates whether the data is still being fetched. This allows the component to handle loading states, display error messages, and render the list of products once the data is successfully retrieved.

  const setParam = (key, value) => {
    // The setParam function is a utility function that updates the query parameters in the URL based on the provided key and value. It takes two arguments: "key", which represents the name of the query parameter to be updated, and "value", which represents the new value for that parameter. The function creates a new instance of URLSearchParams using the current search parameters, modifies the specified parameter based on the provided value, and then updates the URL with the new search parameters using the setParams function. This allows users to filter products by category or search term, and ensures that the URL reflects the current state of the filters applied to the product list.
    const next = new URLSearchParams(params);
    // The line "const next = new URLSearchParams(params);" creates a new instance of the URLSearchParams object using the current search parameters from the URL. This allows the function to work with a copy of the existing query parameters, enabling it to modify them without directly altering the original parameters. The "next" variable will be used to update the specified query parameter based on the provided key and value, and then set the updated parameters back to the URL.
    if (!value || (value === "ALL" && key === "category")) next.delete(key);
    // The line "if (!value || (value === "ALL" && key === "category")) next.delete(key);" checks if the provided value is falsy (e.g., null, undefined, or an empty string) or if the value is "ALL" and the key is "category". If either condition is true, it removes the specified query parameter from the URL by calling the "delete" method on the "next" URLSearchParams object. This ensures that when a user clears a search term or selects "ALL" for the category filter, the corresponding query parameter is removed from the URL, keeping it clean and reflecting the current state of the filters applied to the product list.
    else next.set(key, value);
    // The line "else next.set(key, value);" sets the specified query parameter in the "next" URLSearchParams object to the provided value. If the value is not falsy and does not meet the conditions for deletion, this line updates or adds the query parameter with the new value. This allows users to filter products by category or search term, and ensures that the URL reflects the current state of the filters applied to the product list.
    setParams(next, { replace: true });
    // The line "setParams(next, { replace: true });" updates the URL with the modified search parameters stored in the "next" URLSearchParams object. The "replace: true" option ensures that the current entry in the browser's history is replaced with the new URL, rather than adding a new entry. This prevents cluttering the browser history with multiple entries for each filter change, allowing users to navigate back and forth more easily while maintaining a clean history of their browsing session.
  };

  const list = products || [];
  // The line "const list = products || [];" creates a new variable called "list" that holds the value of the "products" data fetched from the API. If the "products" data is null or undefined (e.g., if the API request has not completed or failed), it defaults to an empty array ([]). This ensures that the component can safely work with the "list" variable without encountering errors when trying to access properties or methods on a null or undefined value. The "list" variable will be used to filter and display the products in the UI.
  const categories = ["ALL", ...new Set(list.map((p) => p.category))];
  // The line "const categories = ["ALL", ...new Set(list.map((p) => p.category))];" creates an array called "categories" that contains unique product categories derived from the "list" of products. It first maps over the "list" to extract the "category" property from each product, then uses the Set object to remove duplicate categories, and finally spreads the unique categories into a new array. The string "ALL" is added at the beginning of the array to represent an option for displaying all products regardless of category. This array will be used to render category filter buttons in the UI, allowing users to filter products by their respective categories.
  const filtered = list.filter((p) => {
    // The line "const filtered = list.filter((p) => {" creates a new array called "filtered" that contains products from the "list" that match the current search and category filters. It uses the "filter" method to iterate over each product "p" in the "list" and applies a filtering function to determine if the product should be included in the "filtered" array. The filtering function checks if the product's category matches the selected category filter and if the product's name, grade, or supplier includes the search term entered by the user. This allows users to view a subset of products that meet their specified criteria, making it easier to find relevant products in the list.
    const matchCat = category === "ALL" || p.category === category;
    // The line "const matchCat = category === "ALL" || p.category === category;" checks if the current product's category matches the selected category filter. If the selected category is "ALL", it means that all products should be included regardless of their category, so "matchCat" will be true for all products. If a specific category is selected, "matchCat" will only be true for products whose category matches the selected category. This variable is used in the filtering function to determine whether a product should be included in the "filtered" array based on its category.
    const term = q.toLowerCase().trim();
    // The line "const term = q.toLowerCase().trim();" processes the search term entered by the user (stored in the variable "q") by converting it to lowercase and removing any leading or trailing whitespace. This ensures that the search is case-insensitive and ignores any accidental spaces, making it more user-friendly. The processed search term is then used in the filtering function to check if the product's name, grade, or supplier includes the search term, allowing users to find relevant products based on their input.
    const matchQ =
    // The line "const matchQ =" defines a variable called "matchQ" that checks if the current product matches the search term entered by the user. It evaluates to true if the search term is empty (indicating no search filter is applied) or if the product's name, grade, or supplier includes the search term (case-insensitive). This variable is used in the filtering function to determine whether a product should be included in the "filtered" array based on the search criteria, allowing users to find relevant products by name, grade, or supplier.
      !term ||
      // The line "!term ||" checks if the search term is empty (falsy). If the search term is empty, it means that no search filter is applied, and all products should be included in the filtered results. In this case, "matchQ" will evaluate to true for all products, allowing them to be displayed regardless of their name, grade, or supplier. This ensures that users can see the full list of products when they have not entered any search criteria.
      p.name.toLowerCase().includes(term) ||
      // The line "p.name.toLowerCase().includes(term) ||" checks if the current product's name (converted to lowercase) includes the search term entered by the user. If the product's name contains the search term, "matchQ" will evaluate to true for that product, indicating that it matches the search criteria. This allows users to find products based on their names, making it easier to locate specific products in the list.
      p.grade.toLowerCase().includes(term) ||
      // The line "p.grade.toLowerCase().includes(term) ||" checks if the current product's grade (converted to lowercase) includes the search term entered by the user. If the product's grade contains the search term, "matchQ" will evaluate to true for that product, indicating that it matches the search criteria. This allows users to find products based on their grades, making it easier to locate specific products in the list.
      p.supplier.toLowerCase().includes(term);
      // The line "p.supplier.toLowerCase().includes(term);" checks if the current product's supplier (converted to lowercase) includes the search term entered by the user. If the product's supplier contains the search term, "matchQ" will evaluate to true for that product, indicating that it matches the search criteria. This allows users to find products based on their suppliers, making it easier to locate specific products in the list.
    return matchCat && matchQ;
    // The line "return matchCat && matchQ;" determines whether the current product should be included in the "filtered" array based on both the category and search term filters. It returns true if the product matches the selected category (matchCat) and also matches the search term (matchQ). If both conditions are met, the product will be included in the filtered results; otherwise, it will be excluded. This ensures that users see a list of products that meet their specified criteria, allowing them to easily find relevant products based on their selected category and search input.
  });

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        {/*
          This is the top header container.
          It splits the top into two sections.(different layout for desktop and mobile) 
        */}
        <div>
          {/* Contains the page title. */}
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          {/* main heading */}
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading…" : `${filtered.length} grades · live indicative pricing`}
          </p>
        </div>
        <div className="relative w-full md:w-80">
          {/* everything related to searching is inside */}
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
            {/* contains all category buttons */}
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
            {/* 
                This is the entire products table container.
                Everything related to the table lives inside. 
            */}

            <table className="w-full text-sm">
              {/* creates actual table */}
              <thead className="bg-secondary/50 text-[10px] font-display tracking-widest text-muted-foreground">
              {/* contains all column names */}
                <tr>
                  {/* product row */}
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
                  {/* contains all product rows */}
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3">
                      {/* watchlist button */}
                      <button onClick={() => toggle(p.id)} aria-label="Toggle watchlist">
                        <Star className={`size-4 ${has(p.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {/* contains grade */}
                      <Link to={`/products/${p.id}`} className="font-medium hover:text-primary">
                        {p.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{p.supplier} · {p.mfi}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{p.grade}</td>
                    {/* contains grade */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-[10px] font-display tracking-widest px-2 py-1 bg-secondary rounded">{p.category}</span>
                    {/* contains category */}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{p.location}</td>
                    {/* contains location */}
                    <td className="px-4 py-3 text-right font-display font-semibold">₹{p.currentPrice.toFixed(2)}</td>
                    {/* contains current price */}
                    <td className={`px-4 py-3 text-right font-display text-xs ${p.changePct > 0 ? "text-up" : p.changePct < 0 ? "text-down" : 
                      "text-muted-foreground"}`}>
                        {/* last updated time */}
                      <span className="inline-flex items-center gap-0.5">
                        {p.changePct > 0 ? <ArrowUpRight className="size-3" /> : p.changePct < 0 ? <ArrowDownRight className="size-3" /> : null}
                        {p.changePct > 0 ? "+" : ""}{p.changePct}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden md:table-cell font-mono">
                      {/* contains datasheet button */}
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
