import React, { createContext, useContext, useState, useEffect } from "react";
import { getAccountingSettings } from "../api/accountingSettingsAPI";


const AccountingContext = createContext();

export const useAccounting = () => {
  return useContext(AccountingContext);
};

export const AccountingProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // You might want to trigger this only when auth is successful.
  // We'll fetch on mount for now and handle errors silently if unauthenticated.
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getAccountingSettings();
      setSettings(data);
    } catch (error) {
      console.warn("Could not load accounting settings", error);
      // Fallback to defaults
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
    if (amount === null || amount === undefined || isNaN(amount)) return "";
    
    const currencySym = settings?.baseCurrency?.split(' ')[1]?.replace(/[()]/g, '') || "₹";
    const locales = settings?.numberFormat === "Indian" ? "en-IN" : "en-US";
    const decimalPlaces = settings?.decimalPlaces ?? 2;

    const formattedAmount = new Intl.NumberFormat(locales, { 
      minimumFractionDigits: decimalPlaces, 
      maximumFractionDigits: decimalPlaces 
    }).format(amount);

    return `${currencySym} ${formattedAmount}`;
  };

  return (
    <AccountingContext.Provider value={{ settings, formatCurrency, loading, refreshSettings: fetchSettings }}>
      {children}
    </AccountingContext.Provider>
  );
};
