"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";
import type { Bond, Trade } from "@/lib/types";

type CancelOrderConfirmProps = { order: Trade | null; bond: Bond | undefined; onClose: () => void; onConfirm: () => void };

export function CancelOrderConfirm({ order, bond, onClose, onConfirm }: CancelOrderConfirmProps) {
  if (!order) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="cancel-order-title">
    <div className="w-full max-w-sm rounded-sm border border-border bg-white p-5 shadow-sm"><AlertTriangle className="size-5 text-ubs-red" aria-hidden="true" /><h2 id="cancel-order-title" className="mt-3 text-base font-bold text-ink">Cancel order?</h2><p className="mt-2 text-sm leading-5 text-muted">Cancel the {order.side} {order.orderType} order for {order.quantity.toLocaleString()} of {bond?.ticker ?? order.isin}? This action cannot be undone in this session.</p><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Keep Order</Button><Button variant="primary" onClick={onConfirm}>Cancel Order</Button></div></div>
  </div>;
}
