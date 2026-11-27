"use client";

import { Suspense } from "react";
import { TransactionForm } from "@/components/TransactionForm";

export default function TambahTransaksiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 w-full max-w-xl mx-auto animate-pulse">
          <div className="h-8 w-48 bg-surface rounded-lg border border-line" />
          <div className="h-96 bg-surface rounded-2xl border border-line" />
        </div>
      }
    >
      <TransactionForm />
    </Suspense>
  );
}
