"use client";

import { useRef, useState } from "react";

type Props = {
  images: string[];
  setImages: (urls: string[]) => void;
};

const MAX_IMAGES = 5;

// Must exist in .env.local
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = "greenfarm_products";

export default function ImageUploader({ images, setImages }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  /* =====================================
     Upload single file → Cloudinary
     Auto-optimized via upload preset
  ===================================== */
  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error("Image upload failed");
    }

    const data: { secure_url?: string } = await res.json();

    if (!data.secure_url) {
      throw new Error("No image URL returned");
    }

    return data.secure_url;
  }

  /* =====================================
     Handle multiple files
  ===================================== */
  async function handleFiles(files: FileList | null) {
    if (!files) return;

    if (images.length + files.length > MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setUploading(true);

    try {
      const uploads = Array.from(files).map((file) =>
        uploadImage(file)
      );

      const urls = await Promise.all(uploads);
      setImages([...images, ...urls]);
    } catch (err) {
      console.error(err);
      alert("One or more images failed to upload.");
    } finally {
      setUploading(false);
    }
  }

  /* =====================================
     Remove image
  ===================================== */
  function remove(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

  return (
    <div className="border-2 border-dashed p-6 rounded-xl text-center bg-white">
      <input
        ref={fileRef}
        type="file"
        multiple
        hidden
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
        className="text-green-600 font-medium disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Click to upload images"}
      </button>

      {/* Preview grid */}
      <div className="grid grid-cols-4 gap-3 mt-4">
        {images.map((img, i) => (
          <div key={img} className="relative">
            <img
              src={img}
              alt={`Product image ${i + 1}`}
              className="w-full h-24 object-cover rounded"
            />

            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded"
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Max {MAX_IMAGES} images • Auto-optimized for speed & quality
      </p>
    </div>
  );
}
