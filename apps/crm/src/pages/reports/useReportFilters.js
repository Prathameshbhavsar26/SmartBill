import { useMemo, useState } from "react";

export function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function getStartOfMonthStr() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

/**
 * Centralized report date-range state.
 * - Defaults to current month start (from) and current date (to).
 */
export function useReportFilters({
  initialFrom = getStartOfMonthStr(),
  initialTo = getTodayStr(),
} = {}) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  const [appliedFrom, setAppliedFrom] = useState(initialFrom);
  const [appliedTo, setAppliedTo] = useState(initialTo);

  const appliedRange = useMemo(() => {
    return { from: appliedFrom, to: appliedTo };
  }, [appliedFrom, appliedTo]);

  const apply = () => {
    setAppliedFrom(from);
    setAppliedTo(to);
  };

  return {
    // draft
    from,
    to,
    setFrom,
    setTo,

    // applied
    appliedFrom,
    appliedTo,
    appliedRange,

    apply,
  };
}



