import { useEffect, useState } from "react";

const KEY = "polymetric.watchlist";

function read() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [ids, setIds] = useState([]);
  useEffect(() => {
    setIds(read());
    const onChange = () => setIds(read());
    window.addEventListener("storage", onChange);
    window.addEventListener("watchlist-change", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("watchlist-change", onChange);
    };
  }, []);
  const toggle = (id) => {
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    setIds(next);
    window.dispatchEvent(new Event("watchlist-change"));
  };
  return { ids, toggle, has: (id) => ids.includes(id) };
}

const ALERT_KEY = "polymetric.alerts";

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    try {
      setAlerts(JSON.parse(localStorage.getItem(ALERT_KEY) ?? "[]"));
    } catch {
      setAlerts([]);
    }
  }, []);
  const save = (next) => {
    localStorage.setItem(ALERT_KEY, JSON.stringify(next));
    setAlerts(next);
  };
  const add = (a) =>
    save([...alerts, { ...a, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);
  const remove = (id) => save(alerts.filter((a) => a.id !== id));
  return { alerts, add, remove };
}
