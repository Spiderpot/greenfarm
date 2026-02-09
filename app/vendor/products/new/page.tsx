"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import ProductForm from "@/components/product/ProductForm";
import LimitReachedCard from "@/components/vendor/LimitReachedCard";

export default function NewProductPage() {
  /* =====================================
     LIMIT STATE (monetization trigger)
  ===================================== */
  const [limitError, setLimitError] = useState<null | {
    code?: string;
    plan?: string;
    limit?: number;
    current?: number;
    error?: string;
  }>(null);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8">

        <h1 className="text-2xl font-bold mb-6">
          Add New Product
        </h1>

        {/* 🔥 EXACT PLACEMENT — Upgrade card shows here */}
        {limitError?.code === "LIMIT_REACHED" && (
          <div className="mb-6">
            <LimitReachedCard
              currentPlan={limitError.plan}
              currentCount={limitError.current}
            />
          </div>
        )}

        {/* pass callback into form */}
        <ProductForm onLimitReached={setLimitError} />

      </div>
    </DashboardLayout>
  );
}
