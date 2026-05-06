"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  async function updatePassword() {
    setMessage("");

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated. You can now sign in.");
    window.setTimeout(() => {
      window.location.href = "/login";
    }, 1200);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7f2] p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
          Wainwright Planner
        </p>

        <h1 className="mt-2 text-4xl font-black text-stone-950">
          Reset password
        </h1>

        <div className="mt-6 space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
          />

          {message && (
            <p className="rounded-2xl bg-stone-100 p-3 text-sm font-bold text-stone-700">
              {message}
            </p>
          )}

          <button
            onClick={updatePassword}
            className="w-full rounded-2xl bg-emerald-900 px-4 py-3 font-black text-white"
          >
            Update password
          </button>
        </div>
      </div>
    </main>
  );
}