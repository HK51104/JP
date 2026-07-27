import { Link } from "react-router-dom";
// Link is a component from the react-router-dom library that allows navigation between different pages in a React application without causing a full page reload. It is used to create links that enable users to navigate to different routes defined in the application.
import { Star } from "lucide-react";
// Star is an icon component imported from the lucide-react library. It is used to display a star icon in the user interface, typically for indicating favorites or watchlist items.
import { api, useApi } from "../api";
// api is an object that contains functions for making API requests to the backend server, such as fetching products, product details, and price history. useApi is a custom React hook that simplifies the process of making API requests and managing the loading, error, and data states. It is used to fetch data from the backend and handle the response in a React component.
// useApi is a custom React hook that simplifies the process of making API requests and managing the loading, error, and data states. It is used to fetch data from the backend and handle the response in a React component.
import { useWatchlist } from "../lib/watchlist";
// useWatchlist is a custom React hook that provides functionality for managing a user's watchlist. It allows components to access the current watchlist items, toggle items in and out of the watchlist, and check if an item is already in the watchlist. This hook is used to implement watchlist features in the application, such as adding or removing products from the user's watchlist.
import ApiError from "../components/APIerror";
// ApiError is a React component that is used to display error messages related to API requests. It takes an error object as a prop and renders a user-friendly message indicating that there was an issue with the API request. This component helps improve the user experience by providing feedback when something goes wrong during data fetching.

export default function Watchlist() 
// The Watchlist component is a React functional component that displays a list of products that the user has added to their watchlist. It uses the useApi hook to fetch the list of products from the backend server and the useWatchlist hook to manage the user's watchlist. The component handles loading and error states, and renders the watchlist products in a grid layout. If there are no products in the watchlist, it displays a message indicating that the watchlist is empty.
{
  const { data: products, error, loading } = useApi(
    // The useApi hook is called with a function that fetches the list of products from the backend server using the api.products() method. The hook returns an object containing three properties: data (renamed to products), which holds the fetched product data; error, which captures any errors that occur during the API request; and loading, which indicates whether the data is still being fetched. This allows the component to handle loading states, display error messages, and render the watchlist products once the data is successfully retrieved.
    () => api.products(),
    // The function passed to the useApi hook is an arrow function that calls the api.products() method to fetch the list of products from the backend server. This function is executed when the component mounts, and it returns a promise that resolves with the product data. The useApi hook manages the loading, error, and data states based on the result of this API request.
    // The second argument to the useApi hook is an empty array, which means that the effect will only run once when the component mounts. This ensures that the product data is fetched only once and not on every render of the component.
    // The useApi hook is called with a function that fetches the list of products from the backend server using the api.products() method. The hook returns an object containing three properties: data (renamed to products), which holds the fetched product data; error, which captures any errors that occur during the API request; and loading, which indicates whether the data is still being fetched. This allows the component to handle loading states, display error messages, and render the watchlist products once the data is successfully retrieved.
    []
  );

  const { ids, toggle, has } = useWatchlist();
  // The useWatchlist hook is called to access the user's watchlist functionality. It returns an object containing three properties: ids, which is an array of product IDs that are currently in the user's watchlist; toggle, which is a function that allows adding or removing a product from the watchlist based on its ID; and has, which is a function that checks if a specific product ID is already in the watchlist. This hook enables the Watchlist component to manage and display the user's watchlist effectively.

  if (loading)
    // If the data is still being fetched (indicated by the "loading" state being true), the component renders a loading message to inform the user that the watchlist is being loaded. This provides feedback to the user while waiting for the API request to complete. 
    {
    return (
      <div className="p-6 text-gray-400">
        Loading watchlist...
      </div>
    );
  }

  if (error) 
    {
    return <ApiError error={error} />;
  }

  const watchlistProducts = (products || []).filter((p) =>
    // The line "const watchlistProducts = (products || []).filter((p) => ids.includes(p.id));" creates a new array called "watchlistProducts" that contains only the products that are currently in the user's watchlist. It uses the "filter" method to iterate over the "products" array (or an empty array if "products" is null or undefined) and checks if each product's ID is included in the "ids" array returned by the useWatchlist hook. This ensures that only the products that the user has added to their watchlist are displayed in the component.
    ids.includes(p.id)
    // The "ids.includes(p.id)" condition checks if the current product's ID (p.id) is present in the "ids" array, which contains the IDs of products that are in the user's watchlist. If the product's ID is found in the "ids" array, it means that the product is part of the watchlist and will be included in the "watchlistProducts" array. This filtering process allows the component to display only the relevant products that the user has chosen to monitor in their watchlist.
  );

  return (
    <div className="space-y-6">
      {/*
      Main container of the whole Watchlist page.
      It stacks every section vertically with spacing. 
      */}
      <div>
        {/* Header section. */}
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <p className="text-gray-400 text-sm">
          Saved products
        </p>
      </div>

      {watchlistProducts.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border border-border rounded-md">
          {/*
           Empty state box.
           Shows
           No products in your watchlist.
           when there are no products. 
          */}
          No products in your watchlist.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Creates the watchlist product grid. */}
          {watchlistProducts.map((p) => (
            <div
              key={p.id}
              className="card p-4"
            >
            {/* One complete product card. */}
              <div className="flex justify-between items-start mb-3">
                {/* Top section of the card. splits into left and right */}
                <div>
                  {/* stores product info */}
                  <div className="text-xs text-gray-500">
                    {/* shows category */}
                    {p.category}
                  </div>

                  <Link
                    to={`/products/${p.id}`}
                    className="font-semibold hover:text-yellow-400"
                  >
                    {p.name}
                  </Link>

                  <div className="text-sm text-gray-500">
                    {/* shows grade */}
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
                {/* shows current price */}
                ₹{p.currentPrice.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}