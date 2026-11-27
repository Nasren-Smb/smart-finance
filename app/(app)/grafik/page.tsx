import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { GrafikContent } from "./GrafikContent";

export const metadata: Metadata = {
  title: "Grafik",
};

async function GrafikPageLoader() {
  await connection();
  return <GrafikContent />;
}

export default function GrafikPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 w-full max-w-4xl animate-pulse">
          <div className="h-8 w-32 bg-surface rounded-xl border border-line" />
          <div className="h-12 w-64 bg-surface rounded-xl border border-line" />
          <div className="h-80 bg-surface rounded-2xl border border-line" />
        </div>
      }
    >
      <GrafikPageLoader />
    </Suspense>
  );
}
