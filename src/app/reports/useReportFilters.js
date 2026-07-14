import { useMemo, useState } from "react";

const DEFAULT_FROM = "2024-08-01";
const DEFAULT_TO = "2024-08-31";

/**
 * Centralized report date-range state.
 * - from/to: editable draft values
 * - appliedFrom/appliedTo: last applied values
 */
export function useReportFilters({ initialFrom = DEFAULT_FROM, initialTo = DEFAULT_TO } = {}) {
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

