"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getWatchlistBonds, DEMO_CLIENT_ID } from "@/lib/data";
import { DeltaValue } from "@/components/ui";
import type { Bond } from "@/lib/types";

export function Sidebar() {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const watchlistBonds = getWatchlistBonds(DEMO_CLIENT_ID);
    setBonds(watchlistBonds);
    setLoading(false);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex-shrink-0">
        <p className="text-2xs font-semibold uppercase tracking-header text-muted">
          Watchlist
        </p>
        <p className="mt-1 text-sm font-semibold text-ink">
          {bonds.length} Instruments
        </p>
      </div>

      {/* Bonds list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-6 text-center text-muted text-sm">
            Loading…
          </div>
        ) : bonds.length === 0 ? (
          <div className="px-4 py-6 text-center text-muted text-sm">
            No watchlist items
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {bonds.map((bond) => (
              <Link
                key={bond.isin}
                href={`/instrument/${bond.isin}`}
                className="block rounded border border-border bg-white p-3 transition-colors hover:border-ubs-red/40 hover:bg-faint/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-ink">{bond.ticker}</p>
                    <p className="mt-0.5 text-2xs leading-4 text-muted">{bond.issuerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-ink">{bond.lastTradedPrice.toFixed(2)}</p>
                    <DeltaValue value={bond.dayChangePercent} className="text-2xs" />
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-2xs">
                  <span className="text-muted">YTM</span>
                  <span className="font-semibold text-ink">{bond.ytm.toFixed(2)}%</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2 flex-shrink-0 text-2xs text-muted">
        Prices delayed by 15 min
      </div>
    </div>
  );
}
