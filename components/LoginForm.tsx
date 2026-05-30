"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/picks";
  const errorKind = params.get("error");
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      }
    });
    if (error) setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm">
      <h1 className="font-display text-2xl">Sign in to save your schedule</h1>
      <p className="mt-2 text-sm text-black/60">
        Your picks sync across devices. Sign in with the Gocertify Google account.
      </p>

      {errorKind === "unauthorized" && (
        <p className="mt-4 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          That Google account isn't allowed to sign in here.
        </p>
      )}
      {errorKind === "auth" && (
        <p className="mt-4 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Something went wrong signing in. Please try again.
        </p>
      )}

      <button
        onClick={signIn}
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sxsw-black px-5 py-3 text-sm font-semibold text-sxsw-cream transition hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Redirecting..." : "Continue with Google"}
      </button>
    </div>
  );
}
