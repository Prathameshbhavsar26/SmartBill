import React from "react";
import { Filter } from "lucide-react";

import { Card } from "../uiExports";


export default function FilterBar({
  from,
  to,
  onFromChange,
  onToChange,
  onApply,
}) {
  return (
    <Card className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold">Filters</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500">
            From
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => onFromChange?.(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="text-xs font-semibold text-slate-500">
            To
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => onToChange?.(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="sm:hidden flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => onFromChange?.(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => onToChange?.(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={onApply}
          className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-all active:scale-[0.98]"
        >
          Apply
        </button>
      </div>
    </Card>
  );
}

