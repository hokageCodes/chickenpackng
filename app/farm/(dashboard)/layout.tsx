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
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-neutral-200 bg-white px-4 py-5 md:flex">
        {/* Brand */}
        <div className="flex items-center gap-3 px-1 pb-6">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <Leaf size={22} strokeWidth={2} />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-bold text-neutral-900">Sinum Agro</p>
            <p className="text-xs text-neutral-500">Food Technology</p>
            <span className="mt-1 inline-block rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              FarmOS
            </span>
          </div>
        </div>

        <SidebarNav />

        {/* User + sign out */}
        <div className="mt-3 border-t border-neutral-200 pt-3">
          <div className="flex items-center gap-3 px-1 pb-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600">
              {(session.user.name ?? session.user.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-neutral-800">
                {session.user.name ?? "Owner"}
              </p>
              <p className="truncate text-xs text-neutral-500">{session.user.email}</p>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/farm/login" });
            }}
          >
            <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-red-50 hover:text-red-600">
              <LogOut size={18} strokeWidth={1.9} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
