"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/vendor/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-sm p-6 space-y-6">

      <h1 className="text-xl font-bold">Vendor Login</h1>

      <form onSubmit={handleLogin} className="space-y-4">

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border p-3"
        />

        {/* Password with eye toggle */}
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white text-black p-3 pr-12 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-3 text-gray-500"
          >
            {show ? "🙈" : "👁"}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          disabled={loading}
          className="w-full rounded bg-green-600 p-3 text-white"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

      <p className="text-sm text-gray-500">
        New vendor?{" "}
        <a href="/signup" className="text-green-600 underline">
          Create account
        </a>
      </p>

    </main>
  );
}
