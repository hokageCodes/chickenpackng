import { redirect } from "next/navigation";
import { Store, LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import AdminSidebarNav from "./AdminSidebarNav";
import AdminMobileNav from "./AdminMobileNav";

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Store size={22} strokeWidth={2} />
      </div>
      <div className="leading-tight">
        <p className="text-[15px] font-bold text-foreground">Protein Pack</p>
        <p className="text-xs text-muted-foreground">Sinum Agro</p>
        <span className="mt-1 inline-block rounded-md bg-gold/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-foreground">
          Commerce
        </span>
      </div>
    </div>
  );
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const initial = (session.user.name ?? session.user.email ?? "?")
    .charAt(0)
    .toUpperCase();

  const footer = (
    <div className="mt-3 space-y-2 border-t border-border pt-4">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-3 py-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {initial}
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-foreground">
            {session.user.name ?? "Owner"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
        </div>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/admin/login" });
        }}
      >
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700">
          <LogOut size={18} strokeWidth={2} />
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card px-4 py-5 md:flex">
        <div className="mb-5 border-b border-border pb-5">
          <Brand />
        </div>
        <AdminSidebarNav />
        {footer}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileNav footer={footer} />
        <main className="flex-1 bg-muted/30 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
