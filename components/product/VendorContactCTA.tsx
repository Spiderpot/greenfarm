"use client";

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
}

export default function VendorContactCTA({ vendor }: Props) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold">Vendor</h3>

      <p className="text-sm font-medium">{vendor.business_name}</p>
      <p className="text-xs text-gray-600">{vendor.location}</p>

      <div className="mt-3 space-y-1 text-sm">
        <a href={`tel:${vendor.phone}`} className="block hover:underline">
          📞 {vendor.phone}
        </a>

        {vendor.whatsapp && (
          <a
            href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            className="block hover:underline"
          >
            💬 WhatsApp
          </a>
        )}

        {vendor.email && (
          <a
            href={`mailto:${vendor.email}`}
            className="block hover:underline"
          >
            ✉️ Email
          </a>
        )}
      </div>
    </div>
  );
}
