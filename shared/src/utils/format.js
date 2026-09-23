import { formatCurrency } from "./formatters";

function getActiveSettings() {
  try {
    const raw = localStorage.getItem("appSettings");
    if (!raw) return { currency: "INR", numberFormat: "Indian" };
    return JSON.parse(raw);
  } catch (e) {
    return { currency: "INR", numberFormat: "Indian" };
  }
}

export const fmt = (n) => {
  const { currency, numberFormat } = getActiveSettings();
  const res = formatCurrency(n, currency, numberFormat);
  return String(res).replace(/^([₹$€£])\s*\1+/g, "$1");
};

export const fmtK = (n) => {
  const { currency, numberFormat } = getActiveSettings();
  const num = Number(typeof n === "string" ? n.replace(/^[₹$€£\s]+/, "") : n) || 0;
  if (num >= 100000) {
    return `${String(formatCurrency((num / 100000).toFixed(1), currency, numberFormat)).replace(/^([₹$€£])\s*\1+/g, "$1")}L`;
  }
  if (num >= 1000) {
    return `${String(formatCurrency((num / 1000).toFixed(1), currency, numberFormat)).replace(/^([₹$€£])\s*\1+/g, "$1")}K`;
  }
  return String(formatCurrency(num, currency, numberFormat)).replace(/^([₹$€£])\s*\1+/g, "$1");
};



