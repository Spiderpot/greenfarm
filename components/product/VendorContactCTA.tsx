"use client";

import { useMemo, useState } from "react";
import LeadForm from "@/components/product/LeadForm";

export interface Vendor {
  id: string;
  business_name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  location: string;
}

interface Props {
  vendor: Vendor;
  productId: string;
  productName?: string;
  isDemo?: boolean;
}

export default function VendorContactCTA({
  vendor,
  productId,
  productName,
  isDemo = false,
}: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false); // ✅ NEW

  const cleanPhone = useMemo(() => {
    if (!vendor.phone) return "";
    return vendor.phone.replace(/\s+/g, "");
  }, [vendor.phone]);

  const cleanWhatsapp = useMemo(() => {
    if (!vendor.whatsapp) return "";
    return vendor.whatsapp.replace(/\s+/g, "");
  }, [vendor.whatsapp]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm text-zinc-900">
      <h3 className="mb-2 text-sm font-semibold text-zinc-900">Vendor</h3>

      <p className="text-sm font-medium text-zinc-900">
        {vendor.business_name}
      </p>
      <p className="text-xs text-zinc-600">{vendor.location}</p>

      {/* ================= BEFORE SUBMIT ================= */}
      {!submitted && !unlocked && (
        <div className="mt-3 space-y-3">
          {!showForm ? (
            <>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Contact Vendor
              </button>

              <p className="text-xs text-zinc-600">
                Submit your details to unlock vendor contact.
              </p>
            </>
          ) : (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-zinc-900">
              <p className="mb-2 text-xs text-zinc-600">
                Enter your details to continue.
              </p>

              <LeadForm
                vendorId={vendor.id}
                productId={productId}
                productName={productName}
                onSuccess={() => {
                  setSubmitted(true);

                  if (!isDemo) {
                    setUnlocked(true);
                  }

                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* ================= REAL PRODUCT UNLOCK ================= */}
      {submitted && unlocked && !isDemo && (
        <div className="mt-3 space-y-1 text-sm text-zinc-900">
          {vendor.phone && (
            <a
              href={`tel:${cleanPhone}`}
              className="block font-medium hover:underline"
            >
              📞 {vendor.phone}
            </a>
          )}

          {vendor.whatsapp && (
            <a
              href={`https://wa.me/${cleanWhatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="block font-medium hover:underline"
            >
              💬 WhatsApp
            </a>
          )}

          {vendor.email && (
            <a
              href={`mailto:${vendor.email}`}
              className="block font-medium hover:underline"
            >
              ✉️ Email
            </a>
          )}
        </div>
      )}

      {/* ================= DEMO SUCCESS MESSAGE ================= */}
      {submitted && isDemo && (
        <div className="mt-3 text-xs text-green-700 bg-green-50 border border-green-200 p-3 rounded">
          ✅ Your request has been sent.
          GreenFarm team will contact you shortly.
        </div>
      )}
    </div>
  );
}
