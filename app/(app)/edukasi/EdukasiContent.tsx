"use client";

import { useSyncExternalStore } from "react";
import { todayWIB } from "@/lib/finance/date";
import { MOTIVATION_QUOTES, getMotivationIndex } from "@/lib/motivation";

const emptySubscribe = () => () => {};

export function EdukasiContentSection() {
  // useSyncExternalStore mengembalikan "" saat SSR/prerender dan todayWIB() hanya di client browser.
  // Ini mencegah pembacaan unstable Date.now() selama SSR/prerendering Next.js.
  const today = useSyncExternalStore(
    emptySubscribe,
    () => todayWIB(),
    () => ""
  );

  // Jika belum di-mount di klien (SSR/prerender), tampilkan fallback placeholder kartu hari ini
  const todayIndex = today ? getMotivationIndex(today) : null;
  const todayQuote = todayIndex !== null ? MOTIVATION_QUOTES[todayIndex] : null;

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl">
      {/* Header Halaman */}
      <div className="pb-2 border-b border-line">
        <h1 className="text-xl lg:text-2xl font-bold text-text-main">
          Edukasi & Motivasi
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Pengingat sederhana untuk menemani langkah perjalanan keuanganmu setiap hari.
        </p>
      </div>

      {/* Kartu Besar: Kalimat Hari Ini */}
      <section
        aria-labelledby="heading-today-quote"
        className="rounded-2xl bg-surface p-6 sm:p-8 border border-line flex flex-col gap-3"
      >
        <div>
          <span
            id="heading-today-quote"
            className="text-xs font-medium uppercase tracking-wider text-accent"
          >
            Kalimat hari ini
          </span>
        </div>

        {todayQuote ? (
          <blockquote className="text-lg sm:text-xl font-medium text-text-main leading-relaxed">
            &ldquo;{todayQuote}&rdquo;
          </blockquote>
        ) : (
          <div className="h-16 animate-pulse bg-surface-raised rounded-xl" />
        )}
      </section>

      {/* Bagian: Semua Kalimat */}
      <section
        aria-labelledby="heading-all-quotes"
        className="flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <h2
            id="heading-all-quotes"
            className="text-base sm:text-lg font-semibold text-text-main"
          >
            Semua kalimat
          </h2>
          <span className="text-xs text-text-muted">
            {MOTIVATION_QUOTES.length} kalimat
          </span>
        </div>

        <ol className="rounded-2xl bg-surface border border-line divide-y divide-line">
          {MOTIVATION_QUOTES.map((quote, index) => (
            <li
              key={index}
              className="p-4 sm:p-5 flex items-start gap-4"
            >
              <span className="text-sm font-semibold tabular-nums w-7 shrink-0 text-right text-text-muted">
                {index + 1}.
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-text-main leading-relaxed">
                  {quote}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
