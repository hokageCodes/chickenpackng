"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  Truck,
  Percent,
  Star,
  BarChart3,
  Settings,
  Sprout,
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon; ready: boolean };

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, ready: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, ready: true },
  { href: "/admin/products", label: "Products", icon: Package, ready: true },
  { href: "/admin/customers", label: "Customers", icon: Users, ready: true },
  { href: "/admin/payments", label: "Payments", icon: CreditCard, ready: true },
  { href: "/admin/delivery", label: "Delivery", icon: Truck, ready: true },
  { href: "/admin/discounts", label: "Discounts", icon: Percent, ready: true },
  { href: "/admin/reviews", label: "Reviews", icon: Star, ready: false },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, ready: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, ready: false },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminSidebarNav() {
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

      {/* Cross-link to FarmOS */}
      <Link
        href="/farm"
        className="mt-2 flex items-center gap-3 rounded-lg border-t border-border px-3 pb-2 pt-4 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <Sprout size={20} strokeWidth={1.9} className="shrink-0" />
        <span className="flex-1">Sinum Agro FarmOS</span>
      </Link>
    </nav>
  );
}
