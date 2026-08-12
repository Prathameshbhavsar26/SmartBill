import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchOrders } from "../../api/orderAPI";
import { getExpenses } from "../../api/expenseApi";
import { getProducts } from "../../api/productAPI";
import { fetchSuppliers } from "../../api/supplierAPI";
import { fetchCustomers } from "../../api/customerAPI";
import { fetchPurchases } from "../../api/purchaseAPI";

export function isDateInRange(dateStr, fromStr, toStr) {
  if (!dateStr) return true;
  try {
    const d = new Date(dateStr).toISOString().slice(0, 10);
    if (fromStr && d < fromStr) return false;
    if (toStr && d > toStr) return false;
    return true;
  } catch {
    return true;
  }
}

export function useReportData(fromStr, toStr) {
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, expensesRes, productsRes, suppliersRes, customersRes, purchasesRes] =
        await Promise.allSettled([
          fetchOrders(),
          getExpenses(),
          getProducts(),
          fetchSuppliers(),
          fetchCustomers(),
          fetchPurchases(),
        ]);

      if (ordersRes.status === "fulfilled") {
        setOrders(ordersRes.value?.orders || []);
      }
      if (expensesRes.status === "fulfilled") {
        setExpenses(expensesRes.value?.expenses || []);
      }
      if (productsRes.status === "fulfilled") {
        setProducts(productsRes.value?.products || []);
      }
      if (suppliersRes.status === "fulfilled") {
        const raw = suppliersRes.value;
        setSuppliers(Array.isArray(raw?.suppliers) ? raw.suppliers : Array.isArray(raw) ? raw : []);
      }
      if (customersRes.status === "fulfilled") {
        const raw = customersRes.value;
        setCustomers(Array.isArray(raw?.customers) ? raw.customers : Array.isArray(raw) ? raw : []);
      }
      if (purchasesRes.status === "fulfilled") {
        const raw = purchasesRes.value;
        setPurchases(Array.isArray(raw?.purchases) ? raw.purchases : Array.isArray(raw) ? raw : []);
      }
    } catch (err) {
      console.error("Error loading report data:", err);
      setError(err.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => isDateInRange(o.createdAt || o.date, fromStr, toStr));
  }, [orders, fromStr, toStr]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => isDateInRange(e.date || e.createdAt, fromStr, toStr));
  }, [expenses, fromStr, toStr]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => isDateInRange(p.purchaseDate || p.createdAt || p.date, fromStr, toStr));
  }, [purchases, fromStr, toStr]);

  return {
    orders,
    expenses,
    products,
    suppliers,
    customers,
    purchases,
    filteredOrders,
    filteredExpenses,
    filteredPurchases,
    loading,
    error,
    refetch: loadAllData,
  };
}
