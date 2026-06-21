"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Leaf, Menu, X } from "lucide-react";
import SidebarNav from "./SidebarNav";

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Leaf size={18} strokeWidth={2} />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-foreground">Sinum Agro</p>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          FarmOS
        </p>
      </div>
    </div>
  );
}

// Mobile-only navigation. The whole thing is hidden at `md` and up, and the
// full-screen panel only mounts while open, so it can never affect desktop or
// appear open by default.
export default function MobileNav({ footer }: { footer: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock background scroll while open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      {/* Top bar: logo left, hamburger right */}
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

      {/* Full-screen nav (only mounted while open) */}
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
            <SidebarNav />
          </div>

          <div className="border-t border-border px-3 pb-4">{footer}</div>
        </div>
      )}
    </div>
  );
}
