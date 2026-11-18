"use client";

import { Suspense } from "react";
import { TransactionForm } from "@/components/TransactionForm";

export default function TambahTransaksiPage() {
  return (
    <Suspense fallback={<div className="text-text-secondary text-sm">Memuat form...</div>}>
      <TransactionForm />
    </Suspense>
  );
}
