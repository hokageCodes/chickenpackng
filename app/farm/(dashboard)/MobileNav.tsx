"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Leaf, Menu, X } from "lucide-react";
import SidebarNav from "./SidebarNav";

// Mobile-only navigation. Everything here is hidden at `md` and up, so it can
// never affect the desktop layout.
export default function MobileNav({
  brand,
  footer,
}: {
  brand: React.ReactNode;
  footer: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
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

      {/* Backdrop */}
      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40"
        />
      )}

      {/* Drawer */}
      <aside
        className={
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85%] flex-col border-r border-border bg-card px-4 py-5 transition-transform duration-200 " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="mb-5 flex items-start justify-between border-b border-border pb-5">
          {brand}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
          >
            <X size={20} />
          </button>
        </div>
        <SidebarNav />
        {footer}
      </aside>
    </div>
  );
}
