import Link from "next/link";
import LogoutButton from "@/components/layout/LogoutButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">

        <Link href="/" className="text-lg font-bold text-green-600">
          GreenFarm
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-black">
          <Link href="/products">Browse</Link>

          {/* 🔥 THIS MUST BE dashboard */}
          <Link href="/vendor/dashboard">Vendor</Link>

          <Link href="/signup">Signup</Link>

          <Link href="/login">Login</Link>

          <LogoutButton />

        </nav>

      </div>
    </header>
  );
}
