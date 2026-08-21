"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui";
import type { Bond, Trade } from "@/lib/types";

type EditableOrderFields = Pick<Trade, "quantity" | "disclosedQuantity" | "limitPrice" | "triggerPrice" | "validityDate" | "expiryDate">;
type ModifyOrderModalProps = { order: Trade | null; bond: Bond | undefined; onClose: () => void; onConfirm: (fields: EditableOrderFields) => void };
const requiresLimitPrice = (orderType: Trade["orderType"]) => ["Limit", "Stop-Loss", "GTD", "GTC"].includes(orderType);
const inputClass = "mt-1 block w-full rounded-sm border border-border px-2 py-1.5 text-sm text-ink focus:border-ubs-red focus:outline-none";

export function ModifyOrderModal({ order, bond, onClose, onConfirm }: ModifyOrderModalProps) {
  if (!order || !bond) return null;
  return <ModifyOrderForm key={order.orderId} order={order} bond={bond} onClose={onClose} onConfirm={onConfirm} />;
}

function ModifyOrderForm({ order, bond, onClose, onConfirm }: { order: Trade; bond: Bond; onClose: () => void; onConfirm: (fields: EditableOrderFields) => void }) {
  const [quantity, setQuantity] = useState(String(order.quantity));
  const [disclosedQuantity, setDisclosedQuantity] = useState(order.disclosedQuantity == null ? "" : String(order.disclosedQuantity));
  const [limitPrice, setLimitPrice] = useState(order.limitPrice == null ? "" : String(order.limitPrice));
  const [triggerPrice, setTriggerPrice] = useState(order.triggerPrice == null ? "" : String(order.triggerPrice));
  const [expiryDate, setExpiryDate] = useState(order.expiryDate ?? order.validityDate ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit() {
    const nextErrors: Record<string, string> = {};
    const nextQuantity = Number(quantity);
    const nextDisclosedQuantity = disclosedQuantity ? Number(disclosedQuantity) : null;
    const nextLimitPrice = limitPrice ? Number(limitPrice) : null;
    const nextTriggerPrice = triggerPrice ? Number(triggerPrice) : null;
    if (!Number.isInteger(nextQuantity) || nextQuantity < bond.minLotSize || nextQuantity % bond.minLotSize !== 0) nextErrors.quantity = `Quantity must be a multiple of the minimum lot (${bond.minLotSize.toLocaleString()}).`;
    else if (nextQuantity < order.filledQuantity) nextErrors.quantity = "Quantity cannot be below the quantity already filled.";
    if (nextDisclosedQuantity != null && (!Number.isInteger(nextDisclosedQuantity) || nextDisclosedQuantity <= 0 || nextDisclosedQuantity > nextQuantity)) nextErrors.disclosedQuantity = "Disclosed quantity must be a whole number no greater than quantity.";
    if (requiresLimitPrice(order.orderType) && (!nextLimitPrice || nextLimitPrice <= 0)) nextErrors.limitPrice = "Enter a positive limit price.";
    if (order.orderType === "Stop-Loss" && (!nextTriggerPrice || nextTriggerPrice <= 0)) nextErrors.triggerPrice = "Enter a positive trigger price.";
    if (order.orderType === "GTD" && !expiryDate) nextErrors.expiryDate = "Select an expiry date for a GTD order.";
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);
    onConfirm({ quantity: nextQuantity, disclosedQuantity: nextDisclosedQuantity, limitPrice: nextLimitPrice, triggerPrice: nextTriggerPrice, validityDate: order.orderType === "GTD" ? expiryDate : null, expiryDate: order.orderType === "GTD" ? expiryDate : null });
  }

  return <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="modify-order-title">
    <div className="w-full max-w-lg rounded-t border border-border bg-white p-6 shadow-sm sm:rounded-sm">
      <div className="mb-5 flex items-start justify-between gap-4"><div><h2 id="modify-order-title" className="text-lg font-bold text-ink">Modify Order</h2><p className="mt-1 text-sm text-muted">{bond.ticker} · {order.side} · {order.orderType}</p></div><button onClick={onClose} className="inline-flex size-8 items-center justify-center rounded-sm border border-border text-ink hover:bg-black/[0.04]" aria-label="Close modify order dialog"><X className="size-4" /></button></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`Quantity (minimum ${bond.minLotSize.toLocaleString()})`} error={errors.quantity}><input type="number" min={bond.minLotSize} step={bond.minLotSize} value={quantity} onChange={(event) => setQuantity(event.target.value)} className={inputClass} /></Field>
        <Field label="Disclosed quantity" error={errors.disclosedQuantity}><input type="number" min="1" value={disclosedQuantity} onChange={(event) => setDisclosedQuantity(event.target.value)} className={inputClass} /></Field>
        {requiresLimitPrice(order.orderType) && <Field label="Limit price" error={errors.limitPrice}><input type="number" min="0" step="0.01" value={limitPrice} onChange={(event) => setLimitPrice(event.target.value)} className={inputClass} /></Field>}
        {order.orderType === "Stop-Loss" && <Field label="Trigger price" error={errors.triggerPrice}><input type="number" min="0" step="0.01" value={triggerPrice} onChange={(event) => setTriggerPrice(event.target.value)} className={inputClass} /></Field>}
        {order.orderType === "GTD" && <Field label="Expiry date" error={errors.expiryDate}><input type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} className={inputClass} /></Field>}
      </div>
      <div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Close</Button><Button onClick={submit}>Confirm Changes</Button></div>
    </div>
  </div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block text-2xs font-semibold uppercase tracking-label text-muted">{label}{children}{error && <span className="mt-1 block normal-case tracking-normal text-ubs-red">{error}</span>}</label>;
}
