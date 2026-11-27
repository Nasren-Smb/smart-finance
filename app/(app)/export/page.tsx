import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { ExportContentSection } from "./ExportContent";

export const metadata: Metadata = {
  title: "Export",
};

async function ExportPageLoader() {
  await connection();
  return <ExportContentSection />;
}

export default function ExportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 w-full max-w-4xl animate-pulse">
          <div className="h-8 w-40 bg-surface rounded-xl border border-line" />
          <div className="h-96 bg-surface rounded-2xl border border-line" />
        </div>
      }
    >
      <ExportPageLoader />
    </Suspense>
  );
}
