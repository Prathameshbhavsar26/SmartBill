import React from "react";

import FilterBar from "./FilterBar";
import { useReportFilters } from "../useReportFilters";

/**
 * Shared wrapper so every report exposes the same filter UI.
 *
 * Props:
 * - onAppliedRangeChange(appliedRange): optional callback whenever the user clicks Apply
 */
export default function ReportFilters({ onAppliedRangeChange }) {
  const { from, to, setFrom, setTo, appliedRange, apply } = useReportFilters();

  React.useEffect(() => {
    onAppliedRangeChange?.(appliedRange);
  }, [appliedRange, onAppliedRangeChange]);

  return (
    <FilterBar
      from={from}
      to={to}
      onFromChange={setFrom}
      onToChange={setTo}
      onApply={apply}
    />
  );
}

