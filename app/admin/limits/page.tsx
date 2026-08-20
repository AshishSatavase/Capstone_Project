"use client";

import { useState } from "react";
import { SectionHeader, DataTable, Card, type DataTableColumn } from "@/components/ui";

interface Limit {
  dealerId: string;
  dealerName: string;
  totalLimit: number;
  used: number;
  available: number;
}

const DEMO_LIMITS: Limit[] = [
  { dealerId: "D001", dealerName: "Dealer Alpha", totalLimit: 10000000, used: 6500000, available: 3500000 },
  { dealerId: "D002", dealerName: "Dealer Beta", totalLimit: 8000000, used: 3200000, available: 4800000 },
  { dealerId: "D003", dealerName: "Dealer Gamma", totalLimit: 5000000, used: 4900000, available: 100000 },
  { dealerId: "D004", dealerName: "Dealer Delta", totalLimit: 12000000, used: 0, available: 12000000 },
  { dealerId: "D005", dealerName: "Dealer Epsilon", totalLimit: 7500000, used: 7500000, available: 0 },
];

export default function LimitsPage() {
  const [editingId, setEditingId] = useState<string | null>(null);

  const columns: DataTableColumn<Limit>[] = [
    {
      id: "dealerName",
      header: "Dealer",
      accessor: (l) => <div className="font-semibold">{l.dealerName}</div>,
      sortValue: (l) => l.dealerName,
    },
    {
      id: "totalLimit",
      header: "Total Limit",
      align: "right",
      accessor: (l) => `₹${l.totalLimit.toLocaleString("en-IN")}`,
      sortValue: (l) => l.totalLimit,
    },
    {
      id: "used",
      header: "Used",
      align: "right",
      accessor: (l) => `₹${l.used.toLocaleString("en-IN")}`,
      sortValue: (l) => l.used,
    },
    {
      id: "available",
      header: "Available",
      align: "right",
      accessor: (l) => (
        <span className={l.available < l.totalLimit * 0.1 ? "text-ubs-red font-semibold" : ""}>
          ₹{l.available.toLocaleString("en-IN")}
        </span>
      ),
      sortValue: (l) => l.available,
    },
    {
      id: "utilization",
      header: "Utilization",
      align: "right",
      accessor: (l) => {
        const pct = ((l.used / l.totalLimit) * 100).toFixed(0);
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 h-1 bg-faint rounded overflow-hidden">
              <div
                className={`h-full ${parseFloat(pct) > 90 ? "bg-ubs-red" : parseFloat(pct) > 70 ? "bg-yellow-500" : "bg-positive"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-2xs font-semibold">{pct}%</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (l) => (
        <button
          onClick={() => setEditingId(l.dealerId)}
          className="px-2 py-1 text-2xs font-semibold text-ink border border-border rounded hover:bg-faint/5"
        >
          Edit Limit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <SectionHeader title="Dealer Limits" eyebrow="Administration" />

      <div className="text-sm text-muted">{DEMO_LIMITS.length} dealer(s)</div>

      <DataTable columns={columns} data={DEMO_LIMITS} rowKey={(l) => l.dealerId} searchable={false} />
    </div>
  );
}
