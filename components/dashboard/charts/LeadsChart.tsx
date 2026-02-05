"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface Lead {
  created_at: string;
}

export default function LeadsChart({ leads }: { leads: Lead[] }) {
  /* -----------------------------
     Group leads by day
  ----------------------------- */
  const map: Record<string, number> = {};

  leads.forEach((l) => {
    const day = new Date(l.created_at).toLocaleDateString();
    map[day] = (map[day] || 0) + 1;
  });

  const data = Object.entries(map).map(([day, count]) => ({
    day,
    count,
  }));

  return (
    <div className="rounded-2xl bg-white p-4 shadow dark:bg-zinc-900">
      <h3 className="mb-4 font-semibold">Leads Analytics</h3>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#16a34a" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
