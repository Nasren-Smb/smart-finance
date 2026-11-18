import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-bg-main text-text-main">
      {/* Sidebar untuk Layar Laptop / Desktop (lg ke atas) */}
      <Sidebar />

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0 justify-between">
        <main className="p-4 sm:p-6 lg:p-8 pb-32 lg:pb-8 flex-1">
          {children}
        </main>

        {/* Footer untuk Layar Laptop / Desktop (lg ke atas) pada semua halaman kerangka */}
        <footer className="hidden lg:block py-6 px-8 border-t border-line text-center text-xs text-text-muted">
          © 2026 Smart Finance · Dibuat oleh Nasren Sembiring
        </footer>
      </div>

      {/* Navigasi Bawah dan Tombol Melayang untuk HP (di bawah lg) */}
      <BottomNav />
    </div>
  );
}
