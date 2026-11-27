import { Suspense } from "react";
import type { Metadata } from "next";
import { EditTransaksiClient } from "./EditTransaksiClient";

export const metadata: Metadata = {
  title: "Edit Transaksi",
};

export const instant = false;

export default function EditTransaksiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 w-full max-w-xl mx-auto animate-pulse">
          <div className="h-8 w-48 bg-surface rounded-lg border border-line" />
          <div className="h-96 bg-surface rounded-2xl border border-line" />
        </div>
      }
    >
      <EditTransaksiClient idPromise={params} />
    </Suspense>
  );
}
