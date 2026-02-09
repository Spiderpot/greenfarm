"use client"

import { useState } from "react"
import ImageUploader from "./ImageUploader"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Select from "@/components/ui/Select"
import Button from "@/components/ui/Button"

type Props = {
  onLimitReached?: (data: {
    code?: string;
    plan?: string;
    limit?: number;
    current?: number;
    error?: string;
  }) => void;
};

export default function ProductForm({ onLimitReached }: Props) {

  const [images, setImages] = useState<string[]>([])
  const [isPro] = useState(false)
  const [loading, setLoading] = useState(false)

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formEl = e.currentTarget; // ✅ store reference early

    setLoading(true);

    const form = new FormData(formEl);

    const payload = {
      title: form.get("title"),
      category: form.get("category"),
      description: form.get("description"),
      tags: form.get("tags"),
      price: Number(form.get("price")),
      discount: Number(form.get("discount") || 0),
      stock: Number(form.get("stock")),
      location: form.get("location"),
      delivery: form.get("delivery"),
      condition: form.get("condition"),
      featured: isPro ? form.get("featured") === "on" : false,
      images
    };

  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    // 🔥 Monetization trigger: show upgrade card
    if (res.status === 403 && data.code === "LIMIT_REACHED") {
      onLimitReached?.(data);
      setLoading(false);
      return;
    }

    alert(data.error || "Failed to upload product");
    setLoading(false);
    return;
  }

  alert("✅ Product uploaded successfully");

  formEl.reset(); // ✅ safe now
  setImages([]);
  setLoading(false);

  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <form
      onSubmit={handleSubmit}
      className="
        space-y-10
        rounded-2xl
        border border-gray-200
        bg-white
        p-8
        shadow-sm

        text-gray-900
        [&_*]:text-gray-900
      "
    >

      {/* =====================================================
         PRODUCT INFO
      ===================================================== */}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">📦 Product Information</h2>

        <Input
          name="title"
          placeholder="Product title (e.g Fresh Tomatoes)"
          required
          className="placeholder:text-gray-600"
        />

        <Select name="category">
          <option>Farm Produce</option>
          <option>Seeds</option>
          <option>Livestock</option>
          <option>Equipment</option>
        </Select>

        <Textarea
          name="description"
          placeholder="Describe quality, harvest date, packaging, size..."
          className="placeholder:text-gray-600"
        />

        <Input
          name="tags"
          placeholder="Tags (tomatoes, organic, bulk)"
          className="placeholder:text-gray-600"
        />
      </section>


      {/* =====================================================
         PRICING
      ===================================================== */}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">💰 Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            name="price"
            type="number"
            placeholder="Price (₦)"
            required
            className="placeholder:text-gray-600"
          />

          <Input
            name="discount"
            type="number"
            placeholder="Discount (optional)"
            className="placeholder:text-gray-600"
          />

          <Input
            name="stock"
            type="number"
            placeholder="Available quantity"
            required
            className="placeholder:text-gray-600"
          />
        </div>
      </section>


      {/* =====================================================
         IMAGES
      ===================================================== */}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">🖼 Product Images</h2>
        <ImageUploader images={images} setImages={setImages} />
      </section>


      {/* =====================================================
         DELIVERY & DETAILS
      ===================================================== */}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">🚚 Delivery & Details</h2>

        <Select name="location" required>
          <option value="">Select State</option>

          <option>Abia</option>
          <option>Adamawa</option>
          <option>Akwa Ibom</option>
          <option>Anambra</option>
          <option>Bauchi</option>
          <option>Bayelsa</option>
          <option>Benue</option>
          <option>Borno</option>
          <option>Cross River</option>
          <option>Delta</option>
          <option>Ebonyi</option>
          <option>Edo</option>
          <option>Ekiti</option>
          <option>Enugu</option>
          <option>FCT Abuja</option>
          <option>Gombe</option>
          <option>Imo</option>
          <option>Jigawa</option>
          <option>Kaduna</option>
          <option>Kano</option>
          <option>Katsina</option>
          <option>Kebbi</option>
          <option>Kogi</option>
          <option>Kwara</option>
          <option>Lagos</option>
          <option>Nasarawa</option>
          <option>Niger</option>
          <option>Ogun</option>
          <option>Ondo</option>
          <option>Osun</option>
          <option>Oyo</option>
          <option>Plateau</option>
          <option>Rivers</option>
          <option>Sokoto</option>
          <option>Taraba</option>
          <option>Yobe</option>
          <option>Zamfara</option>
        </Select>

        <Select name="delivery">
          <option value="pickup">Pickup</option>
          <option value="delivery">Delivery Available</option>
        </Select>

        {/* Farm-specific wording */}
        <Select name="condition">
          <option value="fresh">Fresh Harvest</option>
          <option value="stored">Stored Stock</option>
        </Select>

        {isPro ? (
          <label className="flex gap-2 text-sm items-center">
            <input type="checkbox" name="featured" />
            Feature this product
          </label>
        ) : (
          <p className="text-sm text-yellow-600">
            🔒 Featured placement available for PRO+ plan
          </p>
        )}
      </section>


      {/* =====================================================
         SUBMIT
      ===================================================== */}

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? "Publishing..." : "Publish Product"}
      </Button>

    </form>
  )
}
