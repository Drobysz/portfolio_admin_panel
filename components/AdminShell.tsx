"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { apiFetch, ApiResource, setToken, User } from "@/lib/api";

const navigation = [
  { href: "/admin_panel/users", label: "Users" },
  { href: "/admin_panel/projects", label: "Projects" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    apiFetch<ApiResource<User>>("/admin/me")
      .then((response) => {
        setUser(response.data);
        setReady(true);
      })
      .catch(() => {
        setToken(null);
        router.replace("/admin_panel/login");
      });
  }, [router]);

  async function logout() {
    await apiFetch("/admin/logout", { method: "POST" }).catch(() => null);
    setToken(null);
    router.replace("/admin_panel/login");
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-600">
        Loading admin panel
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:hidden">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold"
          onClick={() => setMenuOpen(true)}
        >
          Menu
        </button>
        <span className="text-sm font-semibold">Portfolio Admin</span>
      </header>

      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-slate-950 text-white transition-transform md:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="px-6 py-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
              portfolio-drobysz
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              Admin panel
            </h1>
          </div>
          <nav className="flex-1 px-3">
            {navigation.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`mb-1 block rounded-md px-4 py-3 text-sm font-semibold ${
                    active
                      ? "bg-sky-400 text-slate-950"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-800 p-4">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
            <button
              type="button"
              onClick={logout}
              className="mt-4 w-full rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="min-h-screen px-4 py-6 md:ml-72 md:px-8 lg:px-10">
        {children}
      </main>
    </div>
  );
}
