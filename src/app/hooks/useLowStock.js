import { useState, useEffect, useCallback } from "react";
import { getProducts } from "../api/productAPI";

/**
 * Polls product stock every `intervalMs` ms and returns items
 * that are below their minStock threshold.
 */
export function useLowStock(intervalMs = 60_000, enabled = true) {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [lastChecked, setLastChecked] = useState(null);

  const check = useCallback(async () => {
    if (!enabled) {
      setLowStockItems([]);
      setOutOfStockItems([]);
      return;
    }
    try {
      const res = await getProducts();
      const products = res.products || [];
      setLowStockItems(
        products.filter(
          (p) =>
            Number(p.stock || 0) > 0 &&
            Number(p.stock || 0) <= Number(p.minStock || 10)
        )
      );
      setOutOfStockItems(products.filter((p) => Number(p.stock || 0) === 0));
      setLastChecked(new Date());
    } catch (_) {
      // silently fail — inventory page shows its own error
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setLowStockItems([]);
      setOutOfStockItems([]);
      return;
    }
    check();
    const timer = setInterval(check, intervalMs);
    return () => clearInterval(timer);
  }, [check, intervalMs, enabled]);

  return {
    lowStockItems,
    outOfStockItems,
    alertCount: enabled ? lowStockItems.length + outOfStockItems.length : 0,
    refresh: check,
    lastChecked,
  };
}
