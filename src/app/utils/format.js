export const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
export const fmtK = (n) =>
  Number(n) >= 100000
    ? `₹${(Number(n) / 100000).toFixed(1)}L`
    : Number(n) >= 1000
      ? `₹${(Number(n) / 1000).toFixed(1)}K`
      : `₹${Number(n)}`;
