import React from "react";

/**
 * Minimal shared primitive for report screens.
 * Kept as .jsx so Vite can parse JSX during import analysis.
 */
export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

