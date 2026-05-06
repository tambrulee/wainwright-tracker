"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleAuth() {
        if (mode === "signup" && password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setMessage("");

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({
            email,
            password,
          })
        : await supabase.auth.signUp({
            email,
            password,
          });

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup") {
      setMessage("Account created. You may need to confirm your email.");
      return;
    }

    window.location.href = "/";
  }

  async function resetPassword() {
    setMessage("");

    if (!email) {
        setMessage("Enter your email first, then click reset password.");
        return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:3000/reset-password",
    });

    if (error) {
        setMessage(error.message);
        return;
    }

    setMessage("Password reset link sent. Check your email.");
    }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7f2] p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
          Wainwright Planner
        </p>

        <h1 className="mt-2 text-4xl font-black text-stone-950">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
          />

          {mode === "signup" && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
            />
          )}

          {message && (
            <p className="rounded-2xl bg-stone-100 p-3 text-sm font-bold text-stone-700">
              {message}
            </p>
          )}

          <button
            onClick={handleAuth}
            className="w-full rounded-2xl bg-emerald-900 px-4 py-3 font-black text-white"
          >
            
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <button
            onClick={() =>
              setMode((current) => (current === "signin" ? "signup" : "signin"))
            }
            className="w-full rounded-2xl border border-stone-200 px-4 py-3 font-bold text-stone-700"
          >
            {mode === "signin"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
          <button
            onClick={resetPassword}
            className="w-full rounded-2xl border border-stone-200 px-4 py-3 font-bold text-stone-700"
            >
            Forgot password?
        </button>
        </div>
      </div>
    </main>
  );
}