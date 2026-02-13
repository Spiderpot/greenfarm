"use client";

import { useMemo, useState, useTransition, useEffect } from "react";

/* =====================================================
   TYPES
===================================================== */

type Lead = {
  id: string;
  buyer_name: string;
  buyer_phone: string;
  product_name: string;
  created_at: string;
  contacted?: boolean;
};

type Props = {
  leads: Lead[];
  vendorId: string;
  vendorEmail: string;
};

/* =====================================================
   COMPONENT
===================================================== */

export default function LeadsTable({ leads }: Props) {
  const [search, setSearch] = useState("");
  const [contactedIds, setContactedIds] =
    useState<Set<string>>(new Set());

  const [, startTransition] = useTransition();

  /* =====================================================
     🔥 AUTO REFRESH (REAL-TIME SAFE FOR LAUNCH)
  ===================================================== */

  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 15000); // refresh every 15 seconds

    return () => clearInterval(interval);
  }, []);

  /* =====================================================
     FILTER
  ===================================================== */

  const filtered = useMemo(() => {
    if (!search.trim()) return leads;

    const q = search.toLowerCase();

    return leads.filter((l) =>
      `${l.buyer_name} ${l.buyer_phone} ${l.product_name}`
        .toLowerCase()
        .includes(q)
    );
  }, [leads, search]);

  /* =====================================================
     ACTIONS
  ===================================================== */

  function markResponded(id: string) {
    startTransition(() => {
      setContactedIds((prev) => new Set(prev).add(id));
    });
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-4">

      <input
        placeholder="Search buyer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-3 py-2 bg-white"
      />

      <div className="border rounded-xl bg-white overflow-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 font-semibold">
            <tr>
              <th className="p-3 text-left">Buyer</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-t">

                <td className="p-3 font-medium">
                  {lead.buyer_name}
                </td>

                <td className="p-3 font-semibold">
                  {lead.buyer_phone}
                </td>

                <td className="p-3">
                  {lead.product_name}
                </td>

                <td className="p-3 text-gray-500">
                  {new Date(lead.created_at).toLocaleString("en-NG")}
                </td>

                <td className="p-3 flex gap-2">

                  <a
                    href={`https://wa.me/${lead.buyer_phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-lg"
                  >
                    WhatsApp
                  </a>

                  {!contactedIds.has(lead.id) && (
                    <button
                      onClick={() => markResponded(lead.id)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg"
                    >
                      ✔ Responded
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No leads yet.
                </td>
              </tr>
            )}

          </tbody>

        </table>
      </div>
    </div>
  );
}
