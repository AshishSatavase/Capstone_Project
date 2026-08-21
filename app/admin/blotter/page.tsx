"use client";

import { useMemo, useState } from "react";
import {
  getTrades,
  getClients,
  getBonds,
  getBondByISIN,
  filterTrades,
  aggregateTrades,
} from "@/lib/data";
import { DataTable, SectionHeader, type DataTableColumn } from "@/components/ui";
import type { Trade } from "@/lib/types";

export default function BlotterPage() {
  const allTrades = getTrades();
  const clients = getClients();
  const bonds = getBonds();

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [clientFilter, setClientFilter] = useState<string>("All");
  const [isinFilter, setIsinFilter] = useState<string>("All");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const filteredTrades = useMemo(() => {
    const trades = filterTrades({
      from: fromDate || undefined,
      to: toDate || undefined,
      clientId: clientFilter === "All" ? undefined : clientFilter,
      isin: isinFilter === "All" ? undefined : isinFilter,
      status:
        statusFilter === "All"
          ? undefined
          : (statusFilter as Trade["status"]),
    });

    return trades;
  }, [fromDate, toDate, clientFilter, isinFilter, statusFilter]);

  const aggregates = useMemo(
    () => aggregateTrades(filteredTrades),
    [filteredTrades]
  );

  const columns: DataTableColumn<Trade>[] = [
    {
      id: "orderId",
      header: "Order ID",
      accessor: (t) => t.orderId,
      sortValue: (t) => t.orderId,
    },
    {
      id: "clientId",
      header: "Client",
      accessor: (t) => {
        const c = clients.find((p) => p.id === t.clientId);

        return (
          <div className="font-semibold">
            {c ? `${c.name} (${c.id})` : t.clientId}
          </div>
        );
      },
      sortValue: (t) => t.clientId,
    },
    {
      id: "isin",
      header: "ISIN",
      accessor: (t) => {
        const bond = getBondByISIN(t.isin);

        return (
          <div>
            <div className="font-semibold">
              {bond ? bond.ticker : t.isin}
            </div>
            <div className="text-2xs text-muted">{t.isin}</div>
          </div>
        );
      },
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
      accessor: (t) =>
        `${t.filledQuantity.toLocaleString()} (${(
          (t.filledQuantity / t.quantity) *
          100
        ).toFixed(0)}%)`,
      sortValue: (t) => t.filledQuantity,
    },
    {
      id: "price",
      header: "Avg Price",
      align: "right",
      accessor: (t) =>
        t.avgFillPrice ? `${t.avgFillPrice.toFixed(2)}` : "—",
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

  function clearFilters() {
    setStatusFilter("All");
    setClientFilter("All");
    setIsinFilter("All");
    setFromDate("");
    setToDate("");
  }

  return (
    <div className="space-y-6 p-6">
      <SectionHeader title="Trade Blotter" eyebrow="Administration" />

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-2xs font-semibold text-muted mb-1">
            From
          </label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded border border-border px-2 py-1 text-sm text-ink focus:border-ubs-red focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-2xs font-semibold text-muted mb-1">
            To
          </label>

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded border border-border px-2 py-1 text-sm text-ink focus:border-ubs-red focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-2xs font-semibold text-muted mb-1">
            Client
          </label>

          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="rounded border border-border px-2 py-1 text-sm text-ink focus:border-ubs-red focus:outline-none"
          >
            <option value="All">All</option>

            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-2xs font-semibold text-muted mb-1">
            ISIN / Item
          </label>

          <select
            value={isinFilter}
            onChange={(e) => setIsinFilter(e.target.value)}
            className="rounded border border-border px-2 py-1 text-sm text-ink focus:border-ubs-red focus:outline-none"
          >
            <option value="All">All</option>

            {bonds.map((b) => (
              <option key={b.isin} value={b.isin}>
                {b.ticker} — {b.isin}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-2xs font-semibold text-muted mb-1">
            Status
          </label>

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

        <div className="ml-2">
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-2xs font-semibold border border-border rounded hover:bg-faint/5"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="text-sm text-muted">
        {filteredTrades.length} trade(s)
      </div>

      <DataTable
        columns={columns}
        data={filteredTrades}
        rowKey={(t) => t.orderId}
        searchable={false}
      />

      {/* Aggregate summary */}
      <div className="mt-4 p-4 border border-border rounded bg-faint">
        <h3 className="text-sm font-semibold mb-2">
          Aggregate (based on active filters)
        </h3>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="text-2xs text-muted">Trades</div>
            <div className="font-semibold">{aggregates.count}</div>
          </div>

          <div>
            <div className="text-2xs text-muted">Total Quantity</div>
            <div className="font-semibold">
              {aggregates.totalQuantity.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-2xs text-muted">Filled Quantity</div>
            <div className="font-semibold">
              {aggregates.totalFilledQuantity.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-2xs text-muted">
              Avg Fill Price (weighted)
            </div>

            <div className="font-semibold">
              {aggregates.avgFillPriceWeighted
                ? aggregates.avgFillPriceWeighted.toFixed(2)
                : "—"}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-2xs text-muted">
              Total Notional (FilledQty × AvgPrice)
            </div>

            <div className="font-semibold">
              ₹{aggregates.totalNotional.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}