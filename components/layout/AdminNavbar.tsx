"use client";

import Link from "next/link";

export function AdminNavbar() {
  return (
    <nav className="border-b border-border bg-ink px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-ubs-red" />
          <span className="text-sm font-bold uppercase tracking-header text-white">
            FI Admin
          </span>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-6">
          <Link
            href="/admin/blotter"
            className="text-sm font-semibold text-white hover:text-ubs-red transition-colors"
          >
            Blotter
          </Link>
          <Link
            href="/admin/limits"
            className="text-sm font-semibold text-white hover:text-ubs-red transition-colors"
          >
            Limits
          </Link>
          <Link
            href="/admin/commissions"
            className="text-sm font-semibold text-white hover:text-ubs-red transition-colors"
          >
            Commissions
          </Link>
          <Link
            href="/admin/risk"
            className="text-sm font-semibold text-white hover:text-ubs-red transition-colors"
          >
            Risk
          </Link>
          <Link
            href="/admin/kyc"
            className="text-sm font-semibold text-white hover:text-ubs-red transition-colors"
          >
            KYC
          </Link>
        </div>

        {/* Client side link */}
        <Link
          href="/"
          className="ml-auto text-sm font-semibold text-white hover:text-ubs-red transition-colors"
        >
          ← Back to Client
        </Link>
      </div>
    </nav>
  );
}
