"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");

  async function signIn() {
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000",
      },
    });

    alert("Check your email for login link.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
          Wainwright Planner
        </p>

        <h1 className="mt-2 text-4xl font-black text-stone-950">
          Sign in
        </h1>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
          />

          <button
            onClick={signIn}
            className="w-full rounded-2xl bg-emerald-900 px-4 py-3 font-black text-white"
          >
            Send magic link
          </button>
        </div>
      </div>
    </main>
  );
}