import { Suspense } from "react";
import type { Metadata } from "next";
import { TransaksiContent } from "./TransaksiContent";

export const metadata: Metadata = {
  title: "Transaksi",
};

export default function TransaksiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-pulse">
          <div className="h-10 w-48 bg-surface rounded-xl border border-line" />
          <div className="h-24 bg-surface rounded-2xl border border-line" />
          <div className="h-12 bg-surface rounded-xl border border-line" />
          <div className="flex flex-col gap-3">
            <div className="h-16 rounded-2xl bg-surface border border-line" />
            <div className="h-16 rounded-2xl bg-surface border border-line" />
          </div>
        </div>
      }
    >
      <TransaksiContent />
    </Suspense>
  );
}
