"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClientsIcon, HomeIcon, InvoiceIcon, SettingsIcon } from "./icons";

const TABS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/new-invoice", label: "New Invoice", icon: InvoiceIcon },
  { href: "/clients", label: "Clients", icon: ClientsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
            >
              <Icon
                className={`h-6 w-6 ${active ? "text-emerald-600" : "text-zinc-400"}`}
              />
              <span className={active ? "text-emerald-600" : "text-zinc-500"}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
