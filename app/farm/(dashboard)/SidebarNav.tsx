"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bird,
  Fish,
  Wheat,
  Pill,
  Skull,
  PackageOpen,
  Wallet,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon; ready: boolean };

const NAV: NavItem[] = [
  { href: "/farm", label: "Dashboard", icon: LayoutDashboard, ready: true },
  { href: "/farm/poultry", label: "Poultry", icon: Bird, ready: true },
  { href: "/farm/fish", label: "Fish", icon: Fish, ready: false },
  { href: "/farm/feed", label: "Feed", icon: Wheat, ready: true },
  { href: "/farm/medication", label: "Medication", icon: Pill, ready: false },
  { href: "/farm/mortality", label: "Mortality", icon: Skull, ready: true },
  { href: "/farm/harvest", label: "Harvest", icon: PackageOpen, ready: false },
  { href: "/farm/finance", label: "Finance", icon: Wallet, ready: true },
  { href: "/farm/analytics", label: "Analytics", icon: BarChart3, ready: false },
];

function isActive(pathname: string, href: string) {
  if (href === "/farm") return pathname === "/farm";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function SidebarNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon, ready }) => {
        if (!ready) {
          return (
            <span
              key={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/50"
            >
              <Icon size={20} strokeWidth={1.75} className="shrink-0" />
              <span className="flex-1">{label}</span>
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                soon
              </span>
            </span>
          );
        }

        const active = isActive(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors " +
              (active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary")
            }
          >
            <Icon
              size={20}
              strokeWidth={active ? 2.25 : 1.9}
              className={
                "shrink-0 transition-colors " +
                (active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")
              }
            />
            <span className="flex-1">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
