"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/tier-list",
    label: "Tier List",
  },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-20 hidden min-h-screen w-60 border-r border-cyan-500/20 bg-slate-950/95 p-4 backdrop-blur lg:block">
      <p className="mb-6 inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
        Nikke Navigator
      </p>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg border px-3 py-2 text-sm font-semibold ${
                isActive
                  ? "border-cyan-300 bg-cyan-300/15 text-cyan-100"
                  : "border-slate-700 bg-slate-900/40 text-slate-200 hover:border-cyan-300/70 hover:bg-slate-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
