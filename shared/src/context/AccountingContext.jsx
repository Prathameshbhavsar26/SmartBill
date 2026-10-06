import React, { createContext, useContext, useState, useEffect } from "react";
import { getAccountingSettings } from "@shared/api/accountingSettingsAPI";


const AccountingContext = createContext();

export const useAccounting = () => {
  return useContext(AccountingContext);
};

export const AccountingProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSettings();
    const handleSync = () => {
      fetchSettings();
    };
    window.addEventListener("userUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("userUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const fetchSettings = async () => {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("smartbill_token") : null;
    if (!token) {
      setSettings({
        baseCurrency: "INR (₹)",
        numberFormat: "Indian",
        decimalPlaces: 2
      });
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getAccountingSettings();
      setSettings(data);
    } catch (error) {
      // Fallback to defaults on error
      setSettings({
        baseCurrency: "INR (₹)",
        numberFormat: "Indian",
        decimalPlaces: 2
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "";
    const cleanAmount = typeof amount === "string" ? Number(amount.replace(/^[₹$€£\s]+/, "")) : Number(amount);
    if (isNaN(cleanAmount)) return "";
    
    const currencySym = settings?.baseCurrency?.split(' ')[1]?.replace(/[()]/g, '') || "₹";
    const locales = settings?.numberFormat === "Indian" ? "en-IN" : "en-US";
    const decimalPlaces = settings?.decimalPlaces ?? 2;

    const formattedAmount = new Intl.NumberFormat(locales, { 
      minimumFractionDigits: decimalPlaces, 
      maximumFractionDigits: decimalPlaces 
    }).format(cleanAmount);

    return `${currencySym}${formattedAmount}`;
  };

  return (
    <AccountingContext.Provider value={{ settings, formatCurrency, loading, refreshSettings: fetchSettings }}>
      {children}
    </AccountingContext.Provider>
  );
};



