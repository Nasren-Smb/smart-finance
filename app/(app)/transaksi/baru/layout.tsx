import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tambah Transaksi",
};

export default function TambahTransaksiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
