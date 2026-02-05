"use client";

import Image from "next/image";

export default function ProductImages({ images }: { images: string[] }) {
  const src = images?.[0] || "/products/placeholder.jpg";

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-200">
      <Image
        src={src}
        alt="Product image"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
        unoptimized
      />
    </div>
  );
}
