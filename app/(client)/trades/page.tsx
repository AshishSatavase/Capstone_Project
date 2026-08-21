"use client";

import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { getBondByISIN, getTrades, DEMO_CLIENT_ID } from "@/lib/data";
import { Badge, Button, DataTable, SectionHeader, StatChip, type DataTableColumn } from "@/components/ui";
import { CancelOrderConfirm } from "@/components/trades/CancelOrderConfirm";
import { ModifyOrderModal } from "@/components/trades/ModifyOrderModal";
import type { Trade } from "@/lib/types";

type TradeTab = "open" | "executed" | "all";
type EditableOrderFields = Pick<Trade, "quantity" | "disclosedQuantity" | "limitPrice" | "triggerPrice" | "validityDate" | "expiryDate">;
const openStatuses: Trade["status"][] = ["Placed", "Pending", "Partially Filled"];

export default function TradesPage() {
  const [trades, setTrades] = useState(() => getTrades().filter((trade) => trade.clientId === DEMO_CLIENT_ID));
  const [activeTab, setActiveTab] = useState<TradeTab>("open");
  const [statusFilter, setStatusFilter] = useState<Trade["status"] | "All">("All");
  const [modifyOrder, setModifyOrder] = useState<Trade | null>(null);
  const [cancelOrder, setCancelOrder] = useState<Trade | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredTrades = useMemo(() => {
    let result = trades;
    if (activeTab === "open") result = result.filter((trade) => openStatuses.includes(trade.status));
    if (activeTab === "executed") result = result.filter((trade) => ["Filled", "Cancelled", "Rejected"].includes(trade.status));
    return statusFilter === "All" ? result : result.filter((trade) => trade.status === statusFilter);
  }, [activeTab, statusFilter, trades]);

  const stats = useMemo(() => {
    const today = new Date().toLocaleDateString("en-CA");
    const isToday = (value: string) => new Date(value).toLocaleDateString("en-CA") === today;
    const openTrades = trades.filter((trade) => openStatuses.includes(trade.status));
    const filledToday = trades.filter((trade) => trade.status === "Filled" && isToday(trade.updatedAt));
    const negativeToday = trades.filter((trade) => ["Cancelled", "Rejected"].includes(trade.status) && isToday(trade.updatedAt));
    const executedValue = filledToday.reduce((sum, trade) => sum + trade.filledQuantity * (trade.avgFillPrice ?? trade.limitPrice ?? 0) * (getBondByISIN(trade.isin)?.faceValue ?? 100) / 100, 0);
    const pendingValue = openTrades.reduce((sum, trade) => {
      const bond = getBondByISIN(trade.isin);
      const price = trade.limitPrice ?? bond?.lastTradedPrice ?? 0;
      return sum + (trade.quantity - trade.filledQuantity) * price * (bond?.faceValue ?? 100) / 100;
    }, 0);
    return { openOrders: openTrades.length, filledToday: filledToday.length, executedValue, negativeToday: negativeToday.length, pendingValue };
  }, [trades]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 4000);
  }

  function confirmModify(fields: EditableOrderFields) {
    if (!modifyOrder) return;
    const timestamp = new Date().toISOString();
    setTrades((current) => current.map((trade) => trade.orderId === modifyOrder.orderId ? { ...trade, ...fields, status: trade.status === "Placed" ? "Pending" : trade.status, updatedAt: timestamp, lastModifiedAt: timestamp } : trade));
    setModifyOrder(null);
    showNotice(`${modifyOrder.orderId} was modified.`);
  }

  function confirmCancel() {
    if (!cancelOrder) return;
    const timestamp = new Date().toISOString();
    setTrades((current) => current.map((trade) => trade.orderId === cancelOrder.orderId ? { ...trade, status: "Cancelled", updatedAt: timestamp, lastModifiedAt: timestamp } : trade));
    setCancelOrder(null);
    showNotice(`${cancelOrder.orderId} was cancelled.`);
  }

  const columns: DataTableColumn<Trade>[] = [
    { id: "orderId", header: "Order ID", accessor: (trade) => <div className="flex items-center gap-1.5"><span>{trade.orderId}</span>{trade.lastModifiedAt && <span title={`Modified ${new Date(trade.lastModifiedAt).toLocaleString()}`}><Pencil className="size-3 text-muted" aria-label={`Modified ${new Date(trade.lastModifiedAt).toLocaleString()}`} /></span>}</div>, sortValue: (trade) => trade.orderId },
    { id: "isin", header: "Instrument", accessor: (trade) => <div><span>{getBondByISIN(trade.isin)?.ticker ?? trade.isin}</span><span className="ml-1 text-2xs text-muted">{trade.isin}</span></div>, sortValue: (trade) => trade.isin },
    { id: "side", header: "Side", accessor: (trade) => <span className={trade.side === "Buy" ? "font-semibold text-positive" : "font-semibold text-ubs-red"}>{trade.side}</span>, sortValue: (trade) => trade.side },
    { id: "quantity", header: "Quantity", align: "right", accessor: (trade) => trade.quantity.toLocaleString(), sortValue: (trade) => trade.quantity },
    { id: "filled", header: "Filled", align: "right", accessor: (trade) => `${trade.filledQuantity.toLocaleString()} (${((trade.filledQuantity / trade.quantity) * 100).toFixed(0)}%)`, sortValue: (trade) => trade.filledQuantity },
    { id: "price", header: "Price", align: "right", accessor: (trade) => trade.avgFillPrice ?? trade.limitPrice ? (trade.avgFillPrice ?? trade.limitPrice)!.toFixed(2) : "—", sortValue: (trade) => trade.avgFillPrice ?? trade.limitPrice ?? 0 },
    { id: "status", header: "Status", accessor: (trade) => <StatusBadge status={trade.status} />, sortValue: (trade) => trade.status },
    { id: "placed", header: "Placed", accessor: (trade) => new Date(trade.placedAt).toLocaleDateString("en-IN"), sortValue: (trade) => trade.placedAt },
    { id: "actions", header: "Actions", align: "right", accessor: (trade) => openStatuses.includes(trade.status) ? <div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => setModifyOrder(trade)}>Modify</Button><Button size="sm" variant="ghost" className="text-ubs-red hover:bg-ubs-red/5 hover:text-ubs-red" onClick={() => setCancelOrder(trade)}>Cancel</Button></div> : "—" },
  ];

  return <div className="space-y-6 p-6">
    <SectionHeader title="Trade Management" eyebrow="Orders" />
    {notice && <div className="border border-positive/30 bg-white px-3 py-2 text-sm text-positive" role="status">{notice}</div>}
    <div className="flex flex-wrap gap-3"><StatChip label="Open Orders" value={stats.openOrders} /><StatChip label="Filled Today" value={stats.filledToday} /><StatChip label="Executed Value Today" value={formatInr(stats.executedValue)} /><StatChip label="Cancelled / Rejected Today" value={stats.negativeToday} className="border-ubs-red/30 [&_p:last-child]:text-ubs-red" /><StatChip label="Pending Value" value={formatInr(stats.pendingValue)} /></div>
    <div className="border-b border-border"><div className="flex gap-6">{(["open", "executed", "all"] as TradeTab[]).map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-1 py-3 text-sm font-semibold uppercase tracking-label transition-colors ${activeTab === tab ? "border-b-2 border-ubs-red text-ink" : "text-muted hover:text-ink"}`}>{tab === "open" ? "Open Orders" : tab === "executed" ? "Executed" : "All"}</button>)}</div></div>
    <div className="flex flex-wrap items-end gap-4"><label className="block text-2xs font-semibold uppercase tracking-label text-muted">Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as Trade["status"] | "All")} className="mt-1 block rounded-sm border border-border bg-white px-2 py-1 text-sm normal-case tracking-normal text-ink focus:border-ubs-red focus:outline-none"><option>All</option>{(["Placed", "Pending", "Partially Filled", "Filled", "Cancelled", "Rejected"] as Trade["status"][]).map((status) => <option key={status}>{status}</option>)}</select></label></div>
    <div className="text-sm text-muted">{filteredTrades.length} trade{filteredTrades.length === 1 ? "" : "s"}</div>
    <DataTable columns={columns} data={filteredTrades} rowKey={(trade) => trade.orderId} searchable={false} />
    <ModifyOrderModal order={modifyOrder} bond={modifyOrder ? getBondByISIN(modifyOrder.isin) : undefined} onClose={() => setModifyOrder(null)} onConfirm={confirmModify} />
    <CancelOrderConfirm order={cancelOrder} bond={cancelOrder ? getBondByISIN(cancelOrder.isin) : undefined} onClose={() => setCancelOrder(null)} onConfirm={confirmCancel} />
  </div>;
}

function StatusBadge({ status }: { status: Trade["status"] }) {
  const variant = status === "Cancelled" || status === "Rejected" ? "red" : status === "Filled" ? "default" : "muted";
  return <Badge variant={variant} className={status === "Filled" ? "border-positive/30 text-positive" : undefined}>{status}</Badge>;
}

function formatInr(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}
