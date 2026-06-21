import { redirect } from "next/navigation";
import { Leaf, LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import SidebarNav from "./SidebarNav";

export default async function FarmDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/farm/login");

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card px-4 py-5 md:flex">
        {/* Brand */}
        <div className="mb-5 flex items-center gap-3 border-b border-border px-1 pb-5">
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

        <SidebarNav />

        {/* User + sign out */}
        <div className="mt-3 border-t border-border pt-3">
          <div className="flex items-center gap-3 px-1 pb-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
              {(session.user.name ?? session.user.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-foreground">
                {session.user.name ?? "Owner"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/farm/login" });
            }}
          >
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
              <LogOut size={18} strokeWidth={1.9} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-muted/30 p-6 md:p-8">{children}</main>
    </div>
  );
}
