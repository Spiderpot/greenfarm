import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-16 sm:px-10">

        {/* ================= HERO ================= */}
        <section className="flex w-full flex-col items-center text-center gap-6">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="GreenFarm Logo"
              width={52}
              height={52}
              priority
              className="rounded-xl"
            />
            <h1 className="text-3xl font-bold tracking-tight">
              GreenFarm
            </h1>
          </div>

          {/* Headline */}
          <h2 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Buy Farm Produce Directly From Trusted Nigerian Farmers
          </h2>

          {/* Subtext */}
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Fresh food. Better prices. No middlemen.  
            Connect with real vendors and request bulk quotes instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="rounded-full bg-green-600 px-8 py-3 font-semibold text-white shadow hover:bg-green-700 transition"
            >
              Browse Products
            </Link>

            <Link
              href="/vendor/dashboard"
              className="rounded-full border border-green-600 px-8 py-3 font-semibold text-green-600 hover:bg-green-50 dark:hover:bg-green-950 transition"
            >
              Sell Your Produce
            </Link>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="mt-20 grid w-full gap-6 sm:grid-cols-3 text-center">

          <Feature
            title="Verified Vendors"
            desc="Only trusted farmers and sellers allowed"
          />

          <Feature
            title="Bulk Orders"
            desc="Buy in large quantities at cheaper rates"
          />

          <Feature
            title="Direct Contact"
            desc="Chat or call vendors instantly via WhatsApp"
          />
        </section>

        {/* ================= PRODUCT PREVIEW ================= */}
        <section className="mt-20 w-full">
          <h3 className="mb-6 text-xl font-semibold text-center">
            Popular Produce
          </h3>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

            {[
              "/products/tomatoes.jpg",
              "/products/maize-yellow.jpg",
              "/products/white-rice.jpg",
              "/products/fertilizer.jpg",
            ].map((src, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-2xl shadow bg-white"
              >
                <Image
                  src={src}
                  alt="Product"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/products"
              className="text-green-600 font-semibold hover:underline"
            >
              View all products →
            </Link>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="mt-24 text-sm text-zinc-500 dark:text-zinc-400 text-center">
          Built for Nigerian farmers & buyers 🇳🇬
        </footer>
      </main>
    </div>
  );
}

/* =====================================================
   Reusable Feature Card
===================================================== */

function Feature({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm">
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{desc}</p>
    </div>
  );
}
