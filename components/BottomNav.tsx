"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  ArrowLeftRight,
  ChartColumn,
  FileDown,
  Lightbulb,
  Plus,
} from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Beranda",
      icon: <House className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
    {
      href: "/transaksi",
      label: "Transaksi",
      icon: <ArrowLeftRight className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
    {
      href: "/grafik",
      label: "Grafik",
      icon: <ChartColumn className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
    {
      href: "/export",
      label: "Export",
      icon: <FileDown className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
    {
      href: "/edukasi",
      label: "Edukasi",
      icon: <Lightbulb className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
  ];

  return (
    <>
      {/* Tombol Tambah Transaksi Melayang (Mobile Floating Action Button) */}
      <Link
        href="/transaksi/baru"
        aria-label="Tambah transaksi"
        className="lg:hidden fixed right-5 bottom-20 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-accent text-bg-main shadow-lg hover:opacity-90 transition-opacity"
      >
        <Plus className="w-7 h-7" aria-hidden="true" />
      </Link>

      {/* Menu Navigasi Bawah HP */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around bg-surface border-t border-line px-2 py-1 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl text-[11px] font-medium transition-colors ${
                isActive ? "text-accent font-semibold" : "text-text-secondary hover:text-text-main"
              }`}
            >
              {item.icon}
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
