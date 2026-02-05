"use client";

import React from "react";

/* =====================================================
   TYPES
   T must be an object (not string/number/etc)
===================================================== */

type Props<T extends Record<string, unknown>> = {
  data: T[];
  filename: string;
  headers?: Partial<Record<keyof T, string>>;
};

/* =====================================================
   COMPONENT
===================================================== */

export default function ExportCsvButton<
  T extends Record<string, unknown>
>({ data, filename, headers }: Props<T>) {
  function exportCSV() {
    if (!data.length) return;

    /* ===============================
       Keys (type-safe)
    =============================== */
    const keys = Object.keys(data[0]) as (keyof T)[];

    /* ===============================
       Header row
    =============================== */
    const headerRow = keys.map((k) =>
      headers?.[k] ?? String(k)
    );

    /* ===============================
       Data rows
    =============================== */
    const rows = data.map((row) =>
      keys
        .map((k) => {
          const value = row[k];

          return `"${String(value ?? "")
            .replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    /* ===============================
       CSV build
    =============================== */
    const csv = [headerRow.join(","), ...rows].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    URL.revokeObjectURL(link.href);
  }

  return (
    <button
      onClick={exportCSV}
      className="rounded-md bg-black px-4 py-2 text-white text-sm hover:opacity-90"
    >
      Export CSV
    </button>
  );
}
