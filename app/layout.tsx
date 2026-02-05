import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";

/* =====================================================
   Metadata (SEO + PWA + Icons)
===================================================== */

export const metadata: Metadata = {
  title: {
    default: "GreenFarm",
    template: "%s | GreenFarm",
  },

  description:
    "Mobile-first agro marketplace connecting farmers and buyers",

  manifest: "/manifest.json",

  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },

  appleWebApp: {
    capable: true,
    title: "GreenFarm",
    statusBarStyle: "default",
  },
};

/* =====================================================
   Viewport (mobile-first)
===================================================== */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#16a34a",
};

/* =====================================================
   Root Layout
   ✅ System fonts only (no Google fetch)
===================================================== */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="
          min-h-screen
          bg-zinc-50
          text-zinc-900
          antialiased
          font-sans
          dark:bg-zinc-950
          dark:text-white
        "
        style={{
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
        }}
      >
        {/* ================= Header ================= */}
        <Header />

        {/* ================= Page Content ================= */}
        <main className="min-h-[calc(100vh-56px)]">
          {children}
        </main>

        {/* ================= Paystack ================= */}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
