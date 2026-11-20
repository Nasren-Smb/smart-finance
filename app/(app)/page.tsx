import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HomeSummarySection } from "./HomeSummarySection";
import { HomeChartSection } from "./HomeChartSection";
import { HomeRecentTransactions } from "./HomeRecentTransactions";

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
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
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
    <Suspense fallback={<div className="text-text-secondary text-sm">Memuat...</div>}>
      <HomeContent />
    </Suspense>
  );
}
