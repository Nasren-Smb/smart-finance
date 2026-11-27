import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Akun",
};

async function AkunContent() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const handleLogout = async () => {
    "use server";
    const serverSupabase = await createClient();
    await serverSupabase.auth.signOut();
    redirect("/login");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl">
      <div className="pb-2 border-b border-line">
        <h1 className="text-xl lg:text-2xl font-bold text-text-main">Akun</h1>
      </div>

      <div className="rounded-2xl bg-surface p-6 border border-line flex flex-col gap-4">
        <div>
          <span className="text-xs text-text-secondary block mb-1">Email Pengguna</span>
          <span className="text-sm font-medium text-text-main break-all">{user.email}</span>
        </div>

        <div className="pt-4 border-t border-line">
          <form action={handleLogout} className="w-full">
            <button
              type="submit"
              className="w-full min-h-[44px] rounded-xl bg-surface-elevated border border-line px-4 py-3 text-sm font-medium text-expense hover:bg-line transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
              Keluar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AkunPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 w-full max-w-xl animate-pulse">
          <div className="h-8 w-32 bg-surface rounded-xl border border-line" />
          <div className="h-48 bg-surface rounded-2xl border border-line" />
        </div>
      }
    >
      <AkunContent />
    </Suspense>
  );
}
