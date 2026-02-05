"use client";

import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">

        {/* ================= SIDEBAR ================= */}
        <aside className="hidden w-64 flex-col bg-white p-6 shadow-lg dark:bg-zinc-900 md:flex">
          <h2 className="mb-8 text-xl font-bold text-green-600">
            GreenFarm
          </h2>

          <nav className="space-y-3 text-sm">
            <a href="/vendor/dashboard" className="block">Dashboard</a>
            <a href="#">Leads</a>
            <a href="#">Analytics</a>
            <a href="#">Payments</a>
            <a href="#">Settings</a>
          </nav>

          <button
            onClick={() => setDark(!dark)}
            className="mt-auto rounded-lg bg-zinc-100 p-2 text-xs dark:bg-zinc-800"
          >
            Toggle Dark Mode
          </button>
        </aside>

        {/* ================= CONTENT ================= */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
