import { Routes, Route } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/Productdetails.jsx";
import Watchlist from "./pages/Watchlist.jsx";
import Alerts from "./pages/Alerts.jsx";
import NotFound from "./pages/Notfound.jsx";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}