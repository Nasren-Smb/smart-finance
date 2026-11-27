"use client";

import Link from "next/link";
import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-bg-main text-text-main flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-surface p-8 border border-line flex flex-col items-center text-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-text-main">
            Terjadi kesalahan
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Maaf, terjadi masalah saat memuat halaman ini. Silakan coba lagi.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-accent text-bg-main text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Coba lagi
            </button>
            <Link
              href="/"
              className="w-full sm:flex-1 inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl bg-surface-elevated border border-line text-text-main text-sm font-medium hover:bg-line transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
