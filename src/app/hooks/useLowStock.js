import { useState, useEffect, useCallback, useRef } from "react";
import { getProducts } from "../api/productAPI";
import { getInventorySettings } from "../api/inventorySettingsAPI";

/**
 * Real-time Hook for Low Stock and Out of Stock Alerts.
 * Dynamically reacts to inventory settings changes, sales, purchases, product updates,
 * and live SSE notifications in real time.
 */
export function useLowStock(intervalMs = 30_000, enabled = true) {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [globalThreshold, setGlobalThreshold] = useState(() => {
    try {
      const stored = localStorage.getItem("smartbill_inventorySettings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lowStockAlert) return Number(parsed.lowStockAlert);
      }
    } catch (_) {}
    return 10;
  });
  const [lastChecked, setLastChecked] = useState(null);
  const thresholdRef = useRef(globalThreshold);
  thresholdRef.current = globalThreshold;

  // Load backend inventory settings on initial mount
  useEffect(() => {
    if (!enabled) return;
    getInventorySettings()
      .then((res) => {
        if (res?.settings?.lowStockAlert) {
          const val = Number(res.settings.lowStockAlert);
          if (!isNaN(val) && val >= 0) {
            setGlobalThreshold(val);
          }
        }
      })
      .catch(() => {});
  }, [enabled]);

  const check = useCallback(async () => {
    if (!enabled) {
      setLowStockItems([]);
      setOutOfStockItems([]);
      return;
    }
    try {
      // Refresh local threshold from storage if updated
      let currentThreshold = thresholdRef.current;
      try {
        const stored = localStorage.getItem("smartbill_inventorySettings");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.lowStockAlert !== undefined) {
            const num = Number(parsed.lowStockAlert);
            if (!isNaN(num) && num >= 0) {
              currentThreshold = num;
              setGlobalThreshold(num);
            }
          }
        }
      } catch (_) {}

      const res = await getProducts();
      const products = Array.isArray(res?.products) ? res.products : [];

      const low = [];
      const out = [];

      for (const p of products) {
        if (p.status === "Inactive") continue;
        const stock = Number(p.stock || 0);
        const minStock =
          p.minStock !== undefined && p.minStock !== null && p.minStock !== ""
            ? Number(p.minStock)
            : currentThreshold;

        if (stock <= 0) {
          out.push(p);
        } else if (stock <= minStock) {
          low.push(p);
        }
      }

      setLowStockItems(low);
      setOutOfStockItems(out);
      setLastChecked(new Date());
    } catch (_) {
      // silently fail
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

    // Real-time Event Listeners
    const handleInventorySettingsUpdated = (e) => {
      if (e?.detail?.lowStockAlert !== undefined) {
        const val = Number(e.detail.lowStockAlert);
        if (!isNaN(val) && val >= 0) {
          setGlobalThreshold(val);
        }
      }
      check();
    };

    const handleStockActivity = () => {
      check();
    };

    window.addEventListener("inventorySettingsUpdated", handleInventorySettingsUpdated);
    window.addEventListener("stockUpdated", handleStockActivity);
    window.addEventListener("productUpdated", handleStockActivity);
    window.addEventListener("orderCreated", handleStockActivity);
    window.addEventListener("purchaseCreated", handleStockActivity);
    window.addEventListener("storage", handleStockActivity);

    return () => {
      clearInterval(timer);
      window.removeEventListener("inventorySettingsUpdated", handleInventorySettingsUpdated);
      window.removeEventListener("stockUpdated", handleStockActivity);
      window.removeEventListener("productUpdated", handleStockActivity);
      window.removeEventListener("orderCreated", handleStockActivity);
      window.removeEventListener("purchaseCreated", handleStockActivity);
      window.removeEventListener("storage", handleStockActivity);
    };
  }, [check, intervalMs, enabled]);

  return {
    lowStockItems,
    outOfStockItems,
    alertCount: enabled ? lowStockItems.length + outOfStockItems.length : 0,
    globalThreshold,
    refresh: check,
    lastChecked,
  };
}
