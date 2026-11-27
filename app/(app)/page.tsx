import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HomeSummarySection } from "./HomeSummarySection";
import { HomeChartSection } from "./HomeChartSection";
import { HomeRecentTransactions } from "./HomeRecentTransactions";

export const metadata: Metadata = {
  title: "Beranda",
};

export const instant = false;

async function HomeContent() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl">
      {/* Header HP: Menampilkan ikon profil akun di pojok atas */}
      <div className="flex items-center justify-between lg:hidden pb-2 border-b border-line">
        <h1 className="text-xl font-bold text-text-main">Beranda</h1>
        <Link
          href="/akun"
          className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full bg-surface-elevated border border-line text-text-secondary hover:text-text-main"
          aria-label="Akun Saya"
        >
          <User className="w-5 h-5 shrink-0" aria-hidden="true" />
        </Link>
      </div>

      <div className="hidden lg:block pb-2 border-b border-line">
        <h1 className="text-2xl font-bold text-text-main">Beranda</h1>
      </div>

      <HomeSummarySection />

      <HomeChartSection />

      <HomeRecentTransactions />

      {/* Footer khusus tampilan HP hanya di akhir Beranda */}
      <footer className="py-6 text-center text-xs text-text-muted lg:hidden">
        © 2026 Smart Finance · Dibuat oleh Nasren Sembiring
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 w-full max-w-4xl animate-pulse">
          <div className="h-8 w-40 bg-surface rounded-xl border border-line" />
          <div className="h-32 bg-surface rounded-2xl border border-line" />
          <div className="h-44 bg-surface rounded-2xl border border-line" />
          <div className="h-64 bg-surface rounded-2xl border border-line" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
