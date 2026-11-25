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
  User,
} from "lucide-react";

export function Sidebar() {
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

  const isAkunActive = pathname === "/akun";
  const isTambahActive = pathname === "/transaksi/baru";

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-line bg-surface p-4 shrink-0 justify-between">
      <div className="flex flex-col gap-6">
        <div className="px-3 py-2">
          <span className="text-xl font-bold text-text-main tracking-tight">Smart Finance</span>
        </div>

        <Link
          href="/transaksi/baru"
          aria-current={isTambahActive ? "page" : undefined}
          className={`flex items-center justify-center gap-2 w-full min-h-[44px] rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
            isTambahActive
              ? "bg-accent text-bg-main"
              : "bg-surface-elevated text-text-main hover:bg-line border border-line"
          }`}
        >
          <Plus className="w-5 h-5 shrink-0" aria-hidden="true" />
          Tambah transaksi
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-surface-elevated text-accent font-semibold"
                    : "text-text-secondary hover:text-text-main hover:bg-surface-elevated"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-line">
        <Link
          href="/akun"
          aria-current={isAkunActive ? "page" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${
            isAkunActive
              ? "bg-surface-elevated text-accent font-semibold"
              : "text-text-secondary hover:text-text-main hover:bg-surface-elevated"
          }`}
        >
          <User className="w-5 h-5 shrink-0" aria-hidden="true" />
          Akun
        </Link>
      </div>
    </aside>
  );
}
