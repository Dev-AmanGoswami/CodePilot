"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MenuIcon } from "./icons";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setMobileOpen(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] shrink-0 border-r border-border md:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={close}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 h-full w-[280px] border-r border-border shadow-xl">
            <Sidebar onNavigate={close} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-12 items-center gap-2 border-b border-border px-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
            className="rounded-md p-1.5 hover:bg-hover"
          >
            <MenuIcon />
          </button>
          <span className="text-sm font-semibold">CodePilot</span>
        </header>

        <main key={pathname} className="min-h-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
