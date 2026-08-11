const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

/**
 * Format a monetary amount according to selected currency and number style.
 */
export function formatCurrency(
  val,
  currency = "INR",
  numberFormat = "Indian",
) {
  const num = Number(val) || 0;
  const symbol = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.INR;
  const locale = numberFormat === "Indian" ? "en-IN" : "en-US";

  const formattedNum = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(num);

  return `${symbol}${formattedNum}`;
}

/**
 * Format a number according to selected number style (Indian 1,00,000 vs International 100,000).
 */
export function formatNumber(val, numberFormat = "Indian") {
  const num = Number(val) || 0;
  const locale = numberFormat === "Indian" ? "en-IN" : "en-US";

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a date object or string into the user's preferred format.
 */
export function formatDate(dateVal, dateFormat = "DD-MM-YYYY") {
  if (!dateVal) return "";
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return String(dateVal);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  switch (dateFormat) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "MM-DD-YYYY":
      return `${month}-${day}-${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD-MM-YYYY":
    default:
      return `${day}-${month}-${year}`;
  }
}

/**
 * Format a date's time component into 12-hour (02:30 PM) or 24-hour (14:30) format.
 */
export function formatTime(dateVal, timeFormat = "24-hour") {
  if (!dateVal) return "";
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return String(dateVal);

  if (timeFormat === "12-hour") {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
