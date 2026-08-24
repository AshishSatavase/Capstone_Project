"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui";
import { getCommissions } from "@/lib/data";
import type { Bond } from "@/lib/types";

type OrderTicketProps = {
  bond: Bond;
  open: boolean;
  initialSide?: "Buy" | "Sell";
  onClose: () => void;
  onSubmit?: (order: any) => void;
};

type OrderCategory = "time" | "money";
type OrderType =
  | "Market"
  | "Limit"
  | "Stop-Loss"
  | "Yield"
  | "Spread"
  | "Day"
  | "IOC"
  | "FOK"
  | "GTD"
  | "GTC";

export function OrderTicket({ bond, open, initialSide = "Buy", onClose, onSubmit }: OrderTicketProps) {
  const [side, setSide] = useState<"Buy" | "Sell">(initialSide);
  const [orderCategory, setOrderCategory] = useState<OrderCategory>("time");
  const [orderType, setOrderType] = useState<OrderType>("Day");
  const [quantity, setQuantity] = useState("");
  const [disclosedQty, setDisclosedQty] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    if (open) {
      setSide(initialSide);
    }
  }, [initialSide, open]);

  const commissions = getCommissions();
  const baseBps = commissions.rates.find((r) => r.instrumentType === bond.instrumentType)?.bps || 5;

  // Calculations
  const qty = parseInt(quantity) || 0;
  const cleanPrice = parseFloat(limitPrice) || bond.lastTradedPrice;
  const dirtyPrice = cleanPrice + (bond.accruedInterestApplicable ? bond.accruedInterestAmount : 0);
  const notional = dirtyPrice * qty * (bond.faceValue / 100);
  const brokerageFee = (notional * baseBps) / 10000;
  const totalConsideration = notional + brokerageFee;
  const utilisedLimit = useMemo(() => {
    const base = Array.from(bond.isin).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return (0.45 + ((base % 31) / 100)) * 10000000;
  }, [bond.isin]);
  const totalLimit = 10000000;
  const projectedUtilised = utilisedLimit + (side === "Buy" ? totalConsideration : 0);
  const isLimitExceeded = side === "Buy" && projectedUtilised > totalLimit;
  const isQtyInvalid = qty < bond.minLotSize;
  const canSubmit = qty > 0 && !isQtyInvalid && !isLimitExceeded;
  const limitPct = Math.min((projectedUtilised / totalLimit) * 100, 100);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex h-full max-h-[94vh] w-full max-w-3xl flex-col rounded-lg border border-border bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-ink">Order Ticket</h2>
            <p className="mt-1 text-sm text-muted">{bond.ticker} ({bond.isin})</p>
            <p className="mt-1 text-2xs font-semibold uppercase tracking-label text-muted">Side: {side}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-border hover:bg-faint/5 transition-colors"
            aria-label="Close order ticket"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-label text-muted mb-2">
                Order options
              </label>
              <div className="mb-2 grid grid-cols-2 gap-1 rounded border border-border bg-faint/5 p-1">
                {([
                  ["time", "Time-based"],
                  ["money", "Money-based"],
                ] as const).map(([category, label]) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setOrderCategory(category);
                      setOrderType(category === "time" ? "Day" : "Limit");
                    }}
                    className={`rounded px-2 py-1.5 text-2xs font-semibold uppercase tracking-label transition-colors ${
                      orderCategory === category ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
                className="w-full rounded border border-border px-3 py-2 text-sm text-ink placeholder-muted focus:border-ubs-red focus:outline-none"
              >
                {orderCategory === "time" ? (
                  <>
                    <option>Day</option>
                    <option>IOC</option>
                    <option>FOK</option>
                    <option>GTD</option>
                    <option>GTC</option>
                  </>
                ) : (
                  <>
                    <option>Market</option>
                    <option>Limit</option>
                    <option>Stop-Loss</option>
                    <option>Yield</option>
                    <option>Spread</option>
                  </>
                )}
              </select>
            </div>

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
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
            {orderType === "GTD" && (
              <div>
                <label className="block text-2xs font-semibold uppercase tracking-label text-muted mb-2">
                  Good till date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full rounded border border-border px-3 py-2 text-sm text-ink placeholder-muted focus:border-ubs-red focus:outline-none"
                />
              </div>
            )}
            {orderType !== "Limit" && orderType !== "Stop-Loss" && orderType !== "GTD" && <div />}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Price Calculation */}
            <div className="space-y-2 rounded border border-border bg-faint/5 p-3">
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
            <div className="rounded border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-2xs font-semibold uppercase tracking-label text-muted">
                  Limit Utilization
                </span>
                <span className="text-sm font-semibold text-ink">
                  ₹{(projectedUtilised / 1000000).toFixed(1)}M / ₹{(totalLimit / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="h-2 w-full rounded bg-border">
                <div
                  className={`h-2 rounded transition-all ${isLimitExceeded ? "bg-ubs-red" : "bg-ink"}`}
                  style={{
                    width: `${limitPct}%`,
                  }}
                />
              </div>
              {isLimitExceeded && (
                <p className="mt-2 text-2xs font-semibold text-ubs-red">
                  Warning: Order exceeds available limit. Reduce quantity or choose a lower price.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-border px-5 py-4 sm:px-6">
          <Button variant="outline" className="h-11 flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            className="h-11 flex-1"
            onClick={() => onClose()}
          >
            RFQ
          </Button>
          <Button
            variant={side === "Buy" ? "buy" : "sell"}
            className="h-11 flex-1"
            disabled={!canSubmit}
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
        {isQtyInvalid && (
          <div className="px-5 pb-4 text-2xs font-semibold text-ubs-red sm:px-6">
            Quantity must be at least the minimum lot size ({bond.minLotSize}).
          </div>
        )}
        {!isQtyInvalid && !canSubmit && side === "Buy" && (
          <div className="px-5 pb-4 text-2xs font-semibold text-ubs-red sm:px-6">
            Buy is disabled until projected utilization is within limit.
          </div>
        )}
      </div>
    </div>
  );
}
