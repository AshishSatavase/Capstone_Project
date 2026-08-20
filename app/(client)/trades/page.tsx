"use client";

import { useState, useMemo } from "react";
import { getTrades, DEMO_CLIENT_ID } from "@/lib/data";
import { DataTable, SectionHeader, type DataTableColumn } from "@/components/ui";
import type { Trade } from "@/lib/types";

export default function TradesPage() {
  const allTrades = getTrades();
  const clientTrades = allTrades.filter((t) => t.clientId === DEMO_CLIENT_ID);

  // Tabs
  const [activeTab, setActiveTab] = useState<"open" | "executed" | "all">("open");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredTrades = useMemo(() => {
    let result = clientTrades;

    if (activeTab === "open") {
      result = result.filter((t) => ["Placed", "Pending", "Partially Filled"].includes(t.status));
    } else if (activeTab === "executed") {
      result = result.filter((t) => ["Filled", "Cancelled", "Rejected"].includes(t.status));
    }

    if (statusFilter !== "All") {
      result = result.filter((t) => t.status === statusFilter);
    }

    return result;
  }, [clientTrades, activeTab, statusFilter]);

  const columns: DataTableColumn<Trade>[] = [
    {
      id: "orderId",
      header: "Order ID",
      accessor: (t) => t.orderId,
      sortValue: (t) => t.orderId,
    },
    {
      id: "isin",
      header: "ISIN",
      accessor: (t) => t.isin,
      sortValue: (t) => t.isin,
    },
    {
      id: "side",
      header: "Side",
      accessor: (t) => (
        <span
          className={`font-semibold ${
            t.side === "Buy" ? "text-positive" : "text-ubs-red"
          }`}
        >
          {t.side}
        </span>
      ),
      sortValue: (t) => t.side,
    },
    {
      id: "quantity",
      header: "Quantity",
      align: "right",
      accessor: (t) => t.quantity.toLocaleString(),
      sortValue: (t) => t.quantity,
    },
    {
      id: "filled",
      header: "Filled",
      align: "right",
      accessor: (t) => `${t.filledQuantity.toLocaleString()} (${((t.filledQuantity / t.quantity) * 100).toFixed(0)}%)`,
      sortValue: (t) => t.filledQuantity,
    },
    {
      id: "price",
      header: "Avg Price",
      align: "right",
      accessor: (t) => t.avgFillPrice ? `${t.avgFillPrice.toFixed(2)}` : "—",
      sortValue: (t) => t.avgFillPrice || 0,
    },
    {
      id: "status",
      header: "Status",
      accessor: (t) => <StatusBadge status={t.status} />,
      sortValue: (t) => t.status,
    },
    {
      id: "placed",
      header: "Placed At",
      accessor: (t) => new Date(t.placedAt).toLocaleDateString(),
      sortValue: (t) => t.placedAt,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <SectionHeader title="Trade Management" eyebrow="Orders" />

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          {(["open", "executed", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-1 py-3 text-sm font-semibold uppercase tracking-label transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-ubs-red text-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {tab === "open" && "Open Orders"}
              {tab === "executed" && "Executed"}
              {tab === "all" && "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-2xs font-semibold text-muted mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-border px-2 py-1 text-sm text-ink focus:border-ubs-red focus:outline-none"
          >
            <option>All</option>
            <option>Placed</option>
            <option>Pending</option>
            <option>Partially Filled</option>
            <option>Filled</option>
            <option>Cancelled</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted">
        {filteredTrades.length} trade{filteredTrades.length !== 1 ? "s" : ""}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredTrades}
        rowKey={(t) => t.orderId}
        searchable={false}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: Trade["status"] }) {
  const colors: Record<Trade["status"], string> = {
    "Placed": "bg-ink text-white",
    "Pending": "bg-muted text-white",
    "Partially Filled": "bg-faint text-ink",
    "Filled": "bg-positive text-white",
    "Cancelled": "bg-ubs-red text-white",
    "Rejected": "bg-ubs-red text-white",
  };

  return (
    <span
      className={`inline-block px-2 py-1 rounded text-2xs font-semibold ${colors[status]}`}
    >
      {status}
    </span>
  );
}
