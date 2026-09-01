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
  return formatCurrency(n, currency, numberFormat);
};

export const fmtK = (n) => {
  const { currency, numberFormat } = getActiveSettings();
  const num = Number(n) || 0;
  if (num >= 100000) {
    return `${formatCurrency((num / 100000).toFixed(1), currency, numberFormat)}L`;
  }
  if (num >= 1000) {
    return `${formatCurrency((num / 1000).toFixed(1), currency, numberFormat)}K`;
  }
  return formatCurrency(num, currency, numberFormat);
};



