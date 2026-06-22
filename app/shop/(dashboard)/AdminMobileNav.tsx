"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Store, Menu, X } from "lucide-react";
import AdminSidebarNav from "./AdminSidebarNav";

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Store size={18} strokeWidth={2} />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-foreground">Protein Pack</p>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Commerce</p>
      </div>
    </div>
  );
}

export default function AdminMobileNav({ footer }: { footer: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-2 py-3">
        <Brand />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-1.5 text-foreground transition-colors hover:bg-accent"
        >
          <Menu size={24} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-card duration-200 animate-in fade-in slide-in-from-left-2">
          <div className="flex items-center justify-between border-b border-border px-2 py-3">
            <Brand />
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="rounded-lg p-1.5 text-foreground transition-colors hover:bg-accent"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <AdminSidebarNav />
          </div>
          <div className="border-t border-border px-3 pb-4">{footer}</div>
        </div>
      )}
    </div>
  );
}
