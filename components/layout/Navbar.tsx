"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui";

type NavbarProps = {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
};

export function Navbar({ onToggleSidebar, sidebarOpen }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-white px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Sidebar toggle + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-border hover:bg-faint/5 text-ink transition-colors"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? (
              <Menu className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-ubs-red" />
            <span className="text-sm font-bold uppercase tracking-header text-ink">
              FI Execution
            </span>
          </Link>
        </div>

        {/* Center: Navigation links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-semibold text-ink hover:text-ubs-red transition-colors"
          >
            Market Watch
          </Link>
          <Link
            href="/trades"
            className="text-sm font-semibold text-ink hover:text-ubs-red transition-colors"
          >
            Trades
          </Link>
          <Link
            href="/portfolio"
            className="text-sm font-semibold text-ink hover:text-ubs-red transition-colors"
          >
            Portfolio
          </Link>
        </div>

        {/* Right: Search + Profile */}
        <div className="flex items-center gap-3">
          {searchOpen ? (
            <div className="relative flex-1 max-w-xs">
              <input
                autoFocus
                type="text"
                placeholder="Search ISIN, ticker, issuer…"
                className="w-full rounded border border-border bg-white px-3 py-2 text-sm text-ink placeholder-muted focus:border-ubs-red focus:outline-none"
                onBlur={() => setSearchOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-border hover:bg-faint/5 text-ink transition-colors"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          {/* Profile menu - minimal */}
          <div className="flex items-center gap-2 border-l border-border pl-3">
            <div className="h-6 w-6 rounded bg-border text-2xs font-bold text-muted flex items-center justify-center">
              C
            </div>
            <span className="hidden text-sm font-semibold text-ink sm:inline">
              CLT-1001
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
