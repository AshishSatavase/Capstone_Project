"use client";

import { useState } from "react";
import { SectionHeader, DataTable, type DataTableColumn } from "@/components/ui";

interface KYCEntry {
  id: string;
  clientName: string;
  clientId: string;
  submittedAt: string;
  status: "Pending" | "Approved" | "Rejected" | "Extended";
}

const KYC_QUEUE: KYCEntry[] = [
  { id: "1", clientName: "ABC Investment Corp", clientId: "C001", submittedAt: "2024-01-15", status: "Pending" },
  { id: "2", clientName: "XYZ Hedge Fund", clientId: "C002", submittedAt: "2024-01-10", status: "Pending" },
  { id: "3", clientName: "Global Capital Partners", clientId: "C003", submittedAt: "2024-01-08", status: "Extended" },
  { id: "4", clientName: "Sovereign Wealth Fund", clientId: "C004", submittedAt: "2024-01-05", status: "Approved" },
  { id: "5", clientName: "Emerging Markets Fund", clientId: "C005", submittedAt: "2023-12-28", status: "Rejected" },
];

export default function KycPage() {
  const [actioningId, setActioningId] = useState<string | null>(null);

  const columns: DataTableColumn<KYCEntry>[] = [
    {
      id: "clientName",
      header: "Client Name",
      accessor: (k) => (
        <div>
          <div className="font-semibold">{k.clientName}</div>
          <div className="text-2xs text-muted">{k.clientId}</div>
        </div>
      ),
      sortValue: (k) => k.clientName,
    },
    {
      id: "submittedAt",
      header: "Submitted",
      accessor: (k) => new Date(k.submittedAt).toLocaleDateString("en-IN"),
      sortValue: (k) => k.submittedAt,
    },
    {
      id: "status",
      header: "Status",
      accessor: (k) => (
        <span
          className={`inline-block px-2 py-1 rounded text-2xs font-semibold ${
            k.status === "Approved"
              ? "bg-positive text-white"
              : k.status === "Rejected"
                ? "bg-ubs-red text-white"
                : k.status === "Extended"
                  ? "bg-yellow-500 text-white"
                  : "bg-muted text-white"
          }`}
        >
          {k.status}
        </span>
      ),
      sortValue: (k) => k.status,
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (k) => (
        <div className="flex gap-1">
          {k.status === "Pending" && (
            <>
              <button className="px-2 py-1 text-2xs font-semibold text-positive border border-border rounded hover:bg-positive/10 transition-colors">
                Approve
              </button>
              <button className="px-2 py-1 text-2xs font-semibold text-ubs-red border border-border rounded hover:bg-ubs-red/10 transition-colors">
                Reject
              </button>
              <button className="px-2 py-1 text-2xs font-semibold text-ink border border-border rounded hover:bg-faint/5 transition-colors">
                Extend
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <SectionHeader title="KYC Queue" eyebrow="Administration" />

      <div className="text-sm text-muted">
        {KYC_QUEUE.filter((k) => k.status === "Pending").length} pending approval(s)
      </div>

      <DataTable columns={columns} data={KYC_QUEUE} rowKey={(k) => k.id} searchable={false} />
    </div>
  );
}
