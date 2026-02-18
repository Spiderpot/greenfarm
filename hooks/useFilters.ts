"use client";

import { useMemo } from "react";

/* =====================================================
   Generic table filter hook
   - strict TS safe
   - no any
   - reusable for vendors, leads, products, etc.
===================================================== */

export default function useTableFilter<
  T extends Record<string, unknown>
>(data: T[], search: string): T[] {
  return useMemo(() => {
    if (!search.trim()) return data;

    const q = (search ?? "").toLowerCase().trim();

    return data.filter((item) =>
      Object.values(item).some((value) => {
        if (value == null) return false;

        return String(value)
          .toLowerCase()
          .includes(q);
      })
    );
  }, [data, search]);
}
