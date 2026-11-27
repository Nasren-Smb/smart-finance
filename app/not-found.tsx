import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-bg-main text-text-main">
      <div className="w-full max-w-md rounded-2xl bg-surface p-8 border border-line flex flex-col items-center text-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-text-main">
          Halaman tidak ditemukan
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Halaman yang Anda tuju tidak tersedia atau tautan mungkin sudah kedaluwarsa.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl bg-accent text-bg-main text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
