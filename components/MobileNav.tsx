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
  {
    href: "/recent-reviews",
    label: "Recent Reviews",
  },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-cyan-500/25 bg-slate-950/95 px-2 pb-2 pt-1 backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex h-12 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                  isActive
                    ? "border-cyan-300 bg-cyan-300/15 text-cyan-100"
                    : "border-slate-700 bg-slate-900/40 text-slate-300"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
