import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { EdukasiContentSection } from "./EdukasiContent";

export const metadata: Metadata = {
  title: "Edukasi",
};

async function EdukasiPageLoader() {
  await connection();
  return <EdukasiContentSection />;
}

export default function EdukasiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-8 w-full max-w-4xl animate-pulse">
          <div className="h-8 w-48 bg-surface rounded-xl border border-line" />
          <div className="h-36 bg-surface rounded-2xl border border-line" />
          <div className="h-96 bg-surface rounded-2xl border border-line" />
        </div>
      }
    >
      <EdukasiPageLoader />
    </Suspense>
  );
}
