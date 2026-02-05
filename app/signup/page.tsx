"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function SignupPage() {
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

  /* =====================================================
     EXACT Supabase password policy
  ===================================================== */

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const passwordValid =
    hasMinLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSymbol;

  /* =====================================================
     Signup
  ===================================================== */

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!passwordValid) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    await supabase.auth.signInWithPassword({
        email,
        password,
        });

        router.push("/vendor/dashboard");
        router.refresh();

  }

  /* =====================================================
     UI
  ===================================================== */

  const rule = (ok: boolean) =>
    ok ? "text-green-600" : "text-gray-400";

  return (
    <main className="mx-auto max-w-sm p-6 space-y-6">

      <h1 className="text-xl font-bold">
        Create Vendor Account
      </h1>

      <form onSubmit={handleSignup} className="space-y-4">

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white text-black p-3"
        />

        {/* Password with eye toggle */}
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white text-black p-3 pr-12"
          />

          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-3 text-gray-500"
          >
            {show ? "🙈" : "👁"}
          </button>
        </div>

        {/* ================= Password rules ================= */}
        <div className="text-xs space-y-1">

          <p className={rule(hasMinLength)}>
            • At least 8 characters
          </p>

          <p className={rule(hasUpper)}>
            • One uppercase letter (A–Z)
          </p>

          <p className={rule(hasLower)}>
            • One lowercase letter (a–z)
          </p>

          <p className={rule(hasNumber)}>
            • One number (0–9)
          </p>

          <p className={rule(hasSymbol)}>
            • One special symbol (!@#$%)
          </p>

        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          disabled={!passwordValid || loading}
          className="w-full rounded bg-green-600 p-3 text-white disabled:opacity-40"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

      </form>

      <p className="text-sm text-gray-500">
        Already have an account?{" "}
        <a href="/login" className="text-green-600 underline">
          Login
        </a>
      </p>

    </main>
  );
}
