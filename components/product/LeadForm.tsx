"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Input from "@/components/ui/Input";
import { createLead } from "@/app/actions/createLead";

interface Props {
  productId: string;
  vendorId: string;
  productName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function LeadForm({
  productId,
  vendorId,
  productName,
  onSuccess,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErr(null);

    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name || !phone || !message) {
      setLoading(false);
      setErr("Please fill all fields.");
      return;
    }

    try {
      const res = await createLead({
        productId,
        vendorId,
        productName,
        name,
        phone,
        message,
      });

      // If your action returns { success: boolean }
      if (res && "success" in res && res.success === false) {
        setErr("Saved message failed, but contact is unlocked. Please try again later.");
      }
    } catch (e) {
      console.error("createLead failed:", e);
      setErr("Message failed, but contact is unlocked. Please try again later.");
    } finally {
      // ✅ ALWAYS unlock after submit attempt
      setSent(true);
      setLoading(false);
      onSuccess?.();
    }
  }

  if (sent) {
    return (
      <p className="text-sm text-green-600">
        ✅ Submitted. Vendor contact unlocked.
      </p>
    );
  }

  const placeholderText = productName
    ? `Hi, I'm interested in ${productName}`
    : "Hi, I'm interested";

  return (
    <form action={handleSubmit} className="space-y-3">
      <Input name="name" placeholder="Your name" required />
      <Input name="phone" placeholder="Phone number" required />
      <Textarea name="message" placeholder={placeholderText} required />

      {err && <p className="text-xs text-red-600">{err}</p>}

      <div className="flex items-center gap-2">
        <Button disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </Button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-600 underline"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
