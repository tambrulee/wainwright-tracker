"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthButton() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    setEmail(null);
    window.location.href = "/login";
  }

  if (!email) {
    return (
      <a
        href="/login"
        className="rounded-xl bg-emerald-900 px-4 py-2 text-sm font-black text-white"
      >
        Sign in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm font-bold text-stone-600 md:inline">
        {email}
      </span>

      <button
        onClick={signOut}
        className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-black text-stone-800 hover:bg-stone-100"
      >
        Sign out
      </button>
    </div>
  );
}