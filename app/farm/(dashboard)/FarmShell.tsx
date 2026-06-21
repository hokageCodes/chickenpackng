"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Leaf, Menu, X } from "lucide-react";
import SidebarNav from "./SidebarNav";

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Leaf size={22} strokeWidth={2} />
      </div>
      <div className="leading-tight">
        <p className="text-[15px] font-bold text-foreground">Sinum Agro</p>
        <p className="text-xs text-muted-foreground">Food Technology</p>
        <span className="mt-1 inline-block rounded-md bg-gold/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-foreground">
          FarmOS
        </span>
      </div>
    </div>
  );
}

export default function FarmShell({
  footer,
  children,
}: {
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open on mobile.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile backdrop */}
      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar (drawer on mobile, static on desktop) */}
      <aside
        className={
          "fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85%] flex-col border-r border-border bg-card px-4 py-5 transition-transform duration-200 md:static md:z-auto md:max-w-none md:translate-x-0 " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="mb-5 flex items-start justify-between border-b border-border pb-5">
          <Brand />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <SidebarNav />

        {footer}
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card px-4 py-3 md:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-1.5 text-foreground hover:bg-accent"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <Leaf size={16} strokeWidth={2} />
            </div>
            <span className="text-sm font-bold">Sinum Agro</span>
          </div>
        </header>

        <main className="flex-1 bg-muted/30 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
