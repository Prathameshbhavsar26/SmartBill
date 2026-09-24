import React from "react";
import { Filter } from "lucide-react";

import { Card } from "@shared/components/common/ui";

export default function FilterBar({
  from,
  to,
  onFromChange,
  onToChange,
  onApply,
}) {
  return (
    <Card className="p-3.5 sm:px-5 sm:py-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold">Filters</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
          <div className="flex items-center gap-1.5 flex-1 min-w-[130px]">
            <label className="text-xs font-semibold text-slate-500">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => onFromChange?.(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-1 min-w-[130px]">
            <label className="text-xs font-semibold text-slate-500">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => onToChange?.(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onApply}
          className="w-full sm:w-auto bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-all active:scale-[0.98] cursor-pointer text-center"
        >
          Apply Filters
        </button>
      </div>
    </Card>
  );
}



