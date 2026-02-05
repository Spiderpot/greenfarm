"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

/* =====================================================
   Component
===================================================== */

export default function AddProductForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setSuccess("");

    const form = new FormData(e.currentTarget);

    const name = form.get("name") as string;
    const description = form.get("description") as string;
    const category = form.get("category") as string;
    const location = form.get("location") as string;

    const price = Number(form.get("price"));
    const unit = form.get("unit") as string;

    const negotiable = form.get("negotiable") === "on";
    const discount_price = form.get("discount_price")
      ? Number(form.get("discount_price"))
      : null;

    const image = form.get("image") as File;

    try {
      /* =============================
         Get current vendor
      ============================== */

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("You must be logged in");

      /* =============================
         Upload image
      ============================== */

      let imagePath = "";

      if (image && image.size > 0) {
        const fileName = `${Date.now()}-${image.name}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("products")
          .getPublicUrl(fileName);

        imagePath = data.publicUrl;
      }

      /* =============================
         Insert product (pending by default)
      ============================== */

      const { error } = await supabase.from("products").insert({
        name,
        description,
        category,
        location,
        price,
        unit,
        negotiable,
        discount_price,
        image: imagePath,
        vendor_id: user.id,

        status: "pending", // 🔥 important for verification flow
        featured: false,
      });

      if (error) throw error;

      setSuccess("✅ Product submitted for review");

      e.currentTarget.reset();
    } catch (err: unknown) {
      /* =============================
         SAFE error handling (no any)
      ============================== */

      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     UI
  ====================================================== */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border p-4 bg-white dark:bg-zinc-900"
    >
      <h2 className="text-lg font-semibold">Add Product</h2>

      {/* Name */}
      <input
        name="name"
        placeholder="Product name"
        required
        className="w-full rounded border p-2"
      />

      {/* Description */}
      <textarea
        name="description"
        placeholder="Description"
        className="w-full rounded border p-2"
      />

      {/* Category */}
      <input
        name="category"
        placeholder="Category (grains, vegetables, etc)"
        className="w-full rounded border p-2"
      />

      {/* Location */}
      <input
        name="location"
        placeholder="Location (Lagos, Kano, etc)"
        className="w-full rounded border p-2"
      />

      {/* Price + Unit */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          name="price"
          placeholder="Price (₦)"
          className="rounded border p-2"
        />

        <input
          name="unit"
          placeholder="Unit (per bag, per ton)"
          className="rounded border p-2"
        />
      </div>

      {/* Discount */}
      <input
        type="number"
        name="discount_price"
        placeholder="Discount price (optional)"
        className="w-full rounded border p-2"
      />

      {/* Negotiable */}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="negotiable" />
        Negotiable price
      </label>

      {/* Image upload */}
      <input type="file" name="image" accept="image/*" />

      {/* Submit */}
      <button
        disabled={loading}
        className="w-full rounded bg-green-600 p-2 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Product"}
      </button>

      {success && <p className="text-green-600 text-sm">{success}</p>}
    </form>
  );
}
