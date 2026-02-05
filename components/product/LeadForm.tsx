"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Input from "@/components/ui/Input";
import { createLead } from "@/app/actions/createLead";

interface Props {
  productId: string;
  vendorId: string;
  productName: string;
}

export default function LeadForm({
  productId,
  vendorId,
  productName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    await createLead({
      productId,
      vendorId,
      productName, // ✅ ADD THIS
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
    });

    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-sm text-green-600">
        ✅ Message sent to vendor. They’ll contact you soon.
      </p>
    );
  }

  return (
    <div className="mt-4">
      {/* Toggle */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-gray-600 underline"
        >
          Prefer message instead?
        </button>
      )}

      {open && (
        <form action={handleSubmit} className="space-y-3 mt-3">
          <Input name="name" placeholder="Your name" required />
          <Input name="phone" placeholder="Phone number" required />
          <Textarea
            name="message"
            placeholder={`Hi, I'm interested in ${productName}`}
            required
          />

          <Button disabled={loading}>
            {loading ? "Sending..." : "Send message"}
          </Button>
        </form>
      )}
    </div>
  );
}
