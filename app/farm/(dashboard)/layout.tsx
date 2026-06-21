import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

const NAV = [
  { href: "/farm", label: "Dashboard", ready: true },
  { href: "/farm/poultry", label: "Poultry", ready: false },
  { href: "/farm/fish", label: "Fish", ready: false },
  { href: "/farm/feed", label: "Feed", ready: true },
  { href: "/farm/medication", label: "Medication", ready: false },
  { href: "/farm/mortality", label: "Mortality", ready: true },
  { href: "/farm/harvest", label: "Harvest", ready: false },
  { href: "/farm/finance", label: "Finance", ready: true },
  { href: "/farm/analytics", label: "Analytics", ready: false },
];

export default async function FarmDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/farm/login");

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-200 bg-white p-4 md:flex">
        <div className="px-2 pb-4">
          <p className="text-sm font-bold">Protein Park</p>
          <p className="text-xs text-neutral-500">FarmOS</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) =>
            item.ready ? (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.href}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-400"
              >
                {item.label}
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] uppercase">
                  soon
                </span>
              </span>
            )
          )}
        </nav>
        <div className="border-t border-neutral-200 pt-3">
          <p className="px-3 text-xs text-neutral-500">{session.user.email}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/farm/login" });
            }}
          >
            <button className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
