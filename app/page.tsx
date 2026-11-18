import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function HomeContent() {
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
    <div className="w-full max-w-sm rounded-2xl bg-surface p-6 border border-line flex flex-col items-center text-center">
      <h1 className="text-xl font-bold text-text-main mb-6">Beranda</h1>
      <form action={handleLogout} className="w-full">
        <button
          type="submit"
          className="w-full rounded-xl bg-surface-elevated border border-line px-4 py-3 text-sm font-medium text-text-main hover:bg-line transition-colors"
        >
          Keluar
        </button>
      </form>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-text-secondary text-sm">Memuat...</div>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}
