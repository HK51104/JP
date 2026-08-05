/*
Conclusion of App.jsx
  App.jsx is the root component of the React application.
  It defines the overall application structure, mainly the routing configuration.
  It decides which page/component should be displayed based on the current URL.
  Every page (Dashboard, Products, Product Details, Watchlist, Alerts, etc.) is rendered through App.jsx.
*/


import { Routes, Route } from "react-router-dom";
// "If the user visits this road, show this page."
// That's what Routes and Route do.
import AppShell from "./components/AppShell.jsx";
// Import the layout of the website.(appshell.jsx)

import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/Productdetails.jsx";
import Watchlist from "./pages/Watchlist.jsx";
import Alerts from "./pages/Alerts.jsx";
import NotFound from "./pages/Notfound.jsx";
// Import all the pages of the website.

export default function App() {
  // when App() was called in main.jsx here it is what is returned 
  return (

    <div className="dark:bg-slate-950 dark:text-foreground bg-card text-foreground">
    <AppShell>
      {/* AppShell provides the overall layout for the application sourced from different page */}

      {/* CHILDREN */}
      <Routes>
        {/* Only one should appear at a time.That's the job of Routes. */}
        <Route path="/" element={<Dashboard />} />
        {/* if url matches "/" then open Dashboard page */}
        <Route path="/products" element={<Products />} />
        {/* if url matches "/products" then open Products page */}
        <Route path="/products/:id" element={<ProductDetails />} />
        {/* if url matches "/products/:id" then open ProductDetails page */}
        <Route path="/watchlist" element={<Watchlist />} />
        {/* if url matches "/watchlist" then open Watchlist page */}
        <Route path="/alerts" element={<Alerts />} />
        {/* if url matches "/alerts" then open Alerts page */}
        <Route path="*" element={<NotFound />} />
        {/* if url doesn't match any of the above, show NotFound page */}
      </Routes>
      {/* CHILDREN */}
    </AppShell>
    </div>
  );
}