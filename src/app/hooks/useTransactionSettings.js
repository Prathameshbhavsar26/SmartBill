import { useState, useEffect, useCallback } from "react";
import {
  fetchTransactionSettings,
  saveTransactionSettings as apiSaveTransactionSettings,
} from "../api/transactionSettingsAPI";

export const DEFAULT_TRANSACTION_SETTINGS = {
  // Sales & Pricing
  salePrice: "Retail Price",
  discountType: "Percentage",
  allowDiscount: true,
  allowPriceEditing: false,
  allowNegativeStock: false,

  // Discount Rules
  discountAppliedOn: "Item-wise",
  maximumDiscount: "20",
  restrictDiscountLimit: true,

  // Sales Returns
  requireReturnPasscode: false,
  allowPartialReturn: true,
  restoreStockAfterReturn: true,
  allowReturnWithoutInvoice: false,

  // Cash Discount
  enableCashDiscount: true,
  cashDiscountType: "Percentage",
  defaultCashDiscount: "0",

  // Invoice Behavior
  autoSaveInvoice: true,
  printAfterSaving: false,
  showPrintPreview: true,

  // Order Management
  linkOrdersToInvoices: true,
  autoConvertOrders: false,
  allowPartialOrderConversion: true,
};

function getStorageKey() {
  try {
    const raw = localStorage.getItem("smartbill_user");
    if (!raw) return "smartbill_transaction_settings_guest";
    const user = JSON.parse(raw);
    const id = user?._id || user?.id || user?.email;
    return id
      ? `smartbill_transaction_settings_${id}`
      : "smartbill_transaction_settings_guest";
  } catch {
    return "smartbill_transaction_settings_guest";
  }
}

/**
 * Hook to access and synchronize transaction settings across the application.
 */
export function useTransactionSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const key = getStorageKey();
      const cached = localStorage.getItem(key);
      if (cached) {
        return { ...DEFAULT_TRANSACTION_SETTINGS, ...JSON.parse(cached) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_TRANSACTION_SETTINGS;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load from backend API
  const loadSettings = useCallback(async () => {
    const token = localStorage.getItem("smartbill_token");
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const res = await fetchTransactionSettings();
      if (res?.transactionSettings) {
        const merged = {
          ...DEFAULT_TRANSACTION_SETTINGS,
          ...res.transactionSettings,
        };
        setSettings(merged);
        const key = getStorageKey();
        localStorage.setItem(key, JSON.stringify(merged));
      }
    } catch (err) {
      console.warn("Could not load transaction settings from server:", err.message);
      setError(err.message || "Failed to load transaction settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync on mount and listen for updates
  useEffect(() => {
    loadSettings();

    const handleUpdated = (e) => {
      if (e?.detail) {
        setSettings((prev) => ({ ...prev, ...e.detail }));
      } else {
        loadSettings();
      }
    };

    window.addEventListener("transactionSettingsUpdated", handleUpdated);
    return () => {
      window.removeEventListener("transactionSettingsUpdated", handleUpdated);
    };
  }, [loadSettings]);

  // Helper to save settings
  const saveSettings = useCallback(async (newSettings) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiSaveTransactionSettings(newSettings);
      const saved = res?.transactionSettings
        ? { ...DEFAULT_TRANSACTION_SETTINGS, ...res.transactionSettings }
        : newSettings;

      setSettings(saved);
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(saved));

      // Broadcast update event to all components
      window.dispatchEvent(
        new CustomEvent("transactionSettingsUpdated", { detail: saved })
      );
      return res;
    } catch (err) {
      setError(err.message || "Failed to save transaction settings.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    settings,
    loading,
    error,
    reload: loadSettings,
    saveSettings,
  };
}

export default useTransactionSettings;
