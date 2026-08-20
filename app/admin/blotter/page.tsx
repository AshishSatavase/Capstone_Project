
import { useMemo, useState } from "react";
import { getTrades, getBondByISIN } from "@/lib/data";
import { DataTable, SectionHeader, type DataTableColumn } from "@/components/ui";
import type { Trade } from "@/lib/types";

export default function BlotterPage() {
  const allTrades = getTrades();
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredTrades = useMemo(() => {
    let result = [...allTrades];
    if (statusFilter !== "All") {
      result = result.filter((t) => t.status === statusFilter);
    }
    return result.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
  }, [statusFilter]);

  const columns: DataTableColumn<Trade>[] = [
    {
      id: "orderId",
      header: "Order ID",
      accessor: (t) => t.orderId,
      sortValue: (t) => t.orderId,
    },
    {
      id: "clientId",
      header: "Client ID",
      accessor: (t) => t.clientId,
      sortValue: (t) => t.clientId,
    },
    {
      id: "isin",
      header: "ISIN",
      accessor: (t) => {
        const bond = getBondByISIN(t.isin);
        return <div className="font-semibold">{t.isin}</div>;
      },
      sortValue: (t) => t.isin,
    },
    {
      id: "side",
      header: "Side",
      accessor: (t) => (
        <span className={`font-semibold ${t.side === "Buy" ? "text-positive" : "text-ubs-red"}`}>
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
      accessor: (t) =>
        `${t.filledQuantity.toLocaleString()} (${((t.filledQuantity / t.quantity) * 100).toFixed(0)}%)`,
      sortValue: (t) => t.filledQuantity,
    },
    {
      id: "price",
      header: "Avg Price",
      align: "right",
      accessor: (t) => (t.avgFillPrice ? `${t.avgFillPrice.toFixed(2)}` : "—"),
      sortValue: (t) => t.avgFillPrice || 0,
    },
    {
      id: "status",
      header: "Status",
      accessor: (t) => (
        <span
          className={`inline-block px-2 py-1 rounded text-2xs font-semibold ${
            t.status === "Filled"
              ? "bg-positive text-white"
              : t.status === "Cancelled" || t.status === "Rejected"
                ? "bg-ubs-red text-white"
                : "bg-muted text-white"
          }`}
        >
          {t.status}
        </span>
      ),
      sortValue: (t) => t.status,
    },
    {
      id: "placedAt",
      header: "Placed At",
      accessor: (t) => new Date(t.placedAt).toLocaleString(),
      sortValue: (t) => t.placedAt,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <SectionHeader title="Trade Blotter" eyebrow="Administration" />

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

      <div className="text-sm text-muted">{filteredTrades.length} trade(s)</div>

      <DataTable
        columns={columns}
        data={filteredTrades}
        rowKey={(t) => t.orderId}
        searchable={false}
      />
    </div>
  );
}
