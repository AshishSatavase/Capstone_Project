"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchBonds } from "@/lib/data";
import type { Bond } from "@/lib/types";

type NavbarProps = {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
};

export function Navbar({ onToggleSidebar, sidebarOpen }: NavbarProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Bond[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setResults(searchBonds(trimmed).slice(0, 8));
    setIsOpen(true);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (bond: Bond) => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    router.push(`/instrument/${bond.isin}`);
  };

  return (
    <nav className="border-b border-border bg-white px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-border text-ink transition-colors hover:bg-faint/5"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-ubs-red" />
            <span className="text-sm font-bold uppercase tracking-header text-ink">
              FI Execution
            </span>
          </Link>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-semibold text-ink transition-colors hover:text-ubs-red"
          >
            Market Watch
          </Link>
          <Link
            href="/trades"
            className="text-sm font-semibold text-ink transition-colors hover:text-ubs-red"
          >
            Trades
          </Link>
          <Link
            href="/portfolio"
            className="text-sm font-semibold text-ink transition-colors hover:text-ubs-red"
          >
            Portfolio
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div ref={searchRef} className="relative w-full max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => query.trim() && setIsOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsOpen(false);
                    setQuery("");
                  }
                }}
                placeholder="Search by ISIN or bond name"
                className="w-full rounded border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-ink placeholder-muted transition-colors focus:border-ubs-red focus:outline-none"
                aria-label="Search bonds"
              />
            </div>

            {isOpen && query.trim() && results.length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded border border-border bg-white">
                {results.map((bond) => (
                  <button
                    key={bond.isin}
                    type="button"
                    onClick={() => handleSelect(bond)}
                    className="flex w-full items-center justify-between gap-4 border-b border-border px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-faint/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{bond.issuerName}</p>
                      <p className="text-2xs uppercase tracking-label text-muted">{bond.ticker} • {bond.isin}</p>
                    </div>
                    <span className="shrink-0 text-2xs font-semibold uppercase tracking-label text-ubs-red">
                      {bond.instrumentType}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-l border-border pl-3">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-border text-2xs font-bold text-muted">
              C
            </div>
            <span className="hidden text-sm font-semibold text-ink sm:inline">CLT-1001</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
