import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function AkunContent() {
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
    <Suspense fallback={<div className="text-text-secondary text-sm">Memuat info akun...</div>}>
      <AkunContent />
    </Suspense>
  );
}
