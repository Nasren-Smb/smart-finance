"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const handleLoginGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-sm rounded-2xl bg-surface p-6 border border-line flex flex-col items-center text-center">
          <h1 className="text-xl font-bold text-text-main mb-2">Smart Finance</h1>
          <p className="text-sm text-text-secondary mb-6">
            Masuk untuk mencatat dan mengelola keuangan Anda
          </p>

          <button
            onClick={handleLoginGoogle}
            className="w-full min-h-[44px] rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-bg-main hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Masuk dengan Google
          </button>
        </div>
      </div>
      <footer className="py-4 text-center text-xs text-text-muted">
        © 2026 Smart Finance · Dibuat oleh Nasren Sembiring
      </footer>
    </main>
  );
}
