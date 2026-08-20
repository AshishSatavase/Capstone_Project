"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin/blotter", label: "Trade Blotter", icon: "📊" },
  { href: "/admin/limits", label: "Dealer Limits", icon: "⚠️" },
  { href: "/admin/commissions", label: "Commissions", icon: "💰" },
  { href: "/admin/risk", label: "Risk Dashboard", icon: "📈" },
  { href: "/admin/kyc", label: "KYC Queue", icon: "✓" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-4 py-4 flex-shrink-0">
        <p className="text-2xs font-semibold uppercase tracking-header text-muted">
          Admin Module
        </p>
      </div>

      {/* Links */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-3">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-ubs-red text-white"
                    : "text-ink hover:bg-faint/10"
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
