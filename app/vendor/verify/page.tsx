"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";

const supabase = getSupabaseClient();


export default function VerifyPage() {
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [nin, setNin] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  /* ================= LOAD USER ================= */

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setEmail(null);
        return;
      }

      setEmail(user.email ?? "");
    }

    loadUser();
  }, []);

  /* ================= SEND OTP ================= */
  async function sendOtp() {
    if (!email) return;

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
        shouldCreateUser: false,
        emailRedirectTo: undefined, // 🔥 disables magic link
        },
    });

    if (error) {
        alert(error.message);
        setLoading(false);
        return;
    }

    setOtpSent(true);
    setLoading(false);

    alert("OTP sent to your email");
    }


  /* ================= VERIFY OTP ================= */

  async function verifyOtp() {
    if (!email || !otp) return;

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      alert("Invalid OTP");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("vendors")
      .update({ email_verified: true })
      .eq("id", user?.id);

    alert("Email verified ✅");

    setLoading(false);
  }

  /* ================= SAVE NIN ================= */

  async function saveNin() {
    if (!nin) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("vendors")
      .update({
        nin,
        nin_verified: true,
      })
      .eq("id", user?.id);

    alert("NIN saved ✅");
  }

  /* ================= UI ================= */

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-xl bg-white p-6 text-gray-900 shadow">
      <h1 className="text-center text-xl font-bold">
        Verify your account
      </h1>

      {/* ================= EMAIL ================= */}

      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>

        <input
          value={email ?? "Loading..."}
          readOnly
          className="w-full rounded-md border bg-gray-100 p-2"
        />

        {!email && (
          <p className="text-xs text-red-500">
            Not logged in. Please login first.
          </p>
        )}

        {email && !otpSent && (
          <button
            onClick={sendOtp}
            disabled={loading}
            className="w-full rounded bg-green-600 py-2 text-white"
          >
            Send OTP
          </button>
        )}
      </div>

      {/* ================= OTP ================= */}

      {otpSent && (
        <div className="space-y-2">
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full rounded-md border p-2"
          />

          <button
            onClick={verifyOtp}
            className="w-full rounded bg-blue-600 py-2 text-white"
          >
            Verify OTP
          </button>
        </div>
      )}

      {/* ================= NIN ================= */}

      <div className="space-y-2">
        <label className="text-sm font-medium">NIN</label>

        <input
          placeholder="11-digit NIN"
          value={nin}
          onChange={(e) => setNin(e.target.value)}
          className="w-full rounded-md border p-2"
        />

        <button
          onClick={saveNin}
          className="w-full rounded bg-purple-600 py-2 text-white"
        >
          Save NIN
        </button>
      </div>
    </div>
  );
}
