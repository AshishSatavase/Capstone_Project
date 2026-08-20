"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui";
import { getCommissions } from "@/lib/data";
import type { Bond } from "@/lib/types";

type OrderTicketProps = {
  bond: Bond;
  open: boolean;
  onClose: () => void;
  onSubmit?: (order: any) => void;
};

export function OrderTicket({ bond, open, onClose, onSubmit }: OrderTicketProps) {
  const [side, setSide] = useState<"Buy" | "Sell">("Buy");
  const [orderType, setOrderType] = useState<"Market" | "Limit" | "Stop-Loss" | "GTD" | "GTC">("Market");
  const [quantity, setQuantity] = useState("");
  const [disclosedQty, setDisclosedQty] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [triggerPrice, setTriggerPrice] = useState("");

  const commissions = getCommissions();
  const baseBps = commissions.rates.find((r) => r.instrumentType === bond.instrumentType)?.bps || 5;

  // Calculations
  const qty = parseInt(quantity) || 0;
  const cleanPrice = parseFloat(limitPrice) || bond.lastTradedPrice;
  const dirtyPrice = cleanPrice + (bond.accruedInterestApplicable ? bond.accruedInterestAmount : 0);
  const notional = dirtyPrice * qty * (bond.faceValue / 100);
  const brokerageFee = (notional * baseBps) / 10000;
  const totalConsideration = notional + brokerageFee;
  const utilisedLimit = Math.random() * 0.7 * 10000000;
  const totalLimit = 10000000;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center">
      <div className="w-full max-w-lg rounded-t border border-border bg-white p-6 sm:rounded">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">Order Ticket</h2>
            <p className="mt-1 text-sm text-muted">{bond.ticker} ({bond.isin})</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-border hover:bg-faint/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Side */}
          <div>
            <label className="block text-2xs font-semibold uppercase tracking-label text-muted mb-2">
              Side
            </label>
            <div className="flex gap-2">
              {(["Buy", "Sell"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`flex-1 px-3 py-2 rounded font-semibold text-sm transition-colors ${
                    side === s
                      ? s === "Buy"
                        ? "bg-positive text-white"
                        : "bg-ubs-red text-white"
                      : "border border-border text-ink hover:bg-faint/5"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Order Type */}
          <div>
            <label className="block text-2xs font-semibold uppercase tracking-label text-muted mb-2">
              Order Type
            </label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className="w-full rounded border border-border px-3 py-2 text-sm text-ink focus:border-ubs-red focus:outline-none"
            >
              <option>Market</option>
              <option>Limit</option>
              <option>Stop-Loss</option>
              <option>GTD</option>
              <option>GTC</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-2xs font-semibold uppercase tracking-label text-muted mb-2">
              Quantity (Face Value)
            </label>
            <input
              type="number"
              placeholder="e.g., 10000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded border border-border px-3 py-2 text-sm text-ink placeholder-muted focus:border-ubs-red focus:outline-none"
            />
            <p className="mt-1 text-2xs text-muted">Min lot: {bond.minLotSize}</p>
          </div>

          {/* Disclosed Quantity */}
          <div>
            <label className="block text-2xs font-semibold uppercase tracking-label text-muted mb-2">
              Disclosed Quantity (Optional)
            </label>
            <input
              type="number"
              placeholder="Leave blank for full disclosure"
              value={disclosedQty}
              onChange={(e) => setDisclosedQty(e.target.value)}
              className="w-full rounded border border-border px-3 py-2 text-sm text-ink placeholder-muted focus:border-ubs-red focus:outline-none"
            />
          </div>

          {/* Price Fields */}
          {orderType === "Limit" && (
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-label text-muted mb-2">
                Limit Price
              </label>
              <input
                type="number"
                step="0.01"
                placeholder={bond.lastTradedPrice.toFixed(2)}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-sm text-ink placeholder-muted focus:border-ubs-red focus:outline-none"
              />
            </div>
          )}

          {orderType === "Stop-Loss" && (
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-label text-muted mb-2">
                Trigger Price
              </label>
              <input
                type="number"
                step="0.01"
                placeholder={bond.lastTradedPrice.toFixed(2)}
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-sm text-ink placeholder-muted focus:border-ubs-red focus:outline-none"
              />
            </div>
          )}

          {/* Price Calculation */}
          <div className="space-y-2 rounded bg-faint/5 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Clean Price:</span>
              <span className="font-semibold text-ink">{cleanPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Accrued Interest:</span>
              <span className="font-semibold text-ink">
                {bond.accruedInterestApplicable ? bond.accruedInterestAmount.toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Dirty Price:</span>
                <span className="font-semibold text-ink">{dirtyPrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-2 border-t border-border pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Notional:</span>
                <span className="font-semibold text-ink">₹{(notional / 100000).toFixed(2)}L</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Brokerage ({baseBps} bps):</span>
                <span className="font-semibold text-ink">₹{(brokerageFee / 100000).toFixed(2)}L</span>
              </div>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-ink">Total Consideration:</span>
                <span className="text-ubs-red">₹{(totalConsideration / 100000).toFixed(2)}L</span>
              </div>
            </div>
          </div>

          {/* Limit Utilization Bar */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-2xs font-semibold uppercase tracking-label text-muted">
                Limit Utilization
              </span>
              <span className="text-sm font-semibold text-ink">
                ₹{(utilisedLimit / 1000000).toFixed(1)}M / ₹{(totalLimit / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="h-2 w-full rounded bg-border">
              <div
                className="h-2 rounded bg-ubs-red transition-all"
                style={{
                  width: `${(utilisedLimit / totalLimit) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant={side === "Buy" ? "buy" : "sell"}
              className="flex-1"
              onClick={() => {
                onSubmit?.({
                  side,
                  orderType,
                  quantity: qty,
                  disclosedQty: disclosedQty ? parseInt(disclosedQty) : null,
                  limitPrice: orderType === "Limit" ? parseFloat(limitPrice) : null,
                  triggerPrice: orderType === "Stop-Loss" ? parseFloat(triggerPrice) : null,
                });
                onClose();
              }}
            >
              {side === "Buy" ? "Buy" : "Sell"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
