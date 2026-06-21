import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import FarmShell from "./FarmShell";

export default async function FarmDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/farm/login");

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
          await signOut({ redirectTo: "/farm/login" });
        }}
      >
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700">
          <LogOut size={18} strokeWidth={2} />
          Sign out
        </button>
      </form>
    </div>
  );

  return <FarmShell footer={footer}>{children}</FarmShell>;
}
