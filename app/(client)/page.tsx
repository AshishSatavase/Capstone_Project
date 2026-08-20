"use client";

import { useState, useMemo } from "react";
import { getBonds, getNewIssuances, getYieldCurve } from "@/lib/data";
import { Button, DataTable, SectionHeader, type DataTableColumn } from "@/components/ui";
import { DeltaValue, RatingBadge } from "@/components/ui";
import {  AppLineChart } from "@/components/charts";
import { ChartContainer } from "@/components/charts/ChartContainer";
import type { Bond } from "@/lib/types";

export default function MarketWatchPage() {
  const allBonds = getBonds();
  const newIssuances = getNewIssuances();
  const yieldCurve = getYieldCurve();

  // Filters state
  const [search, setSearch] = useState("");
  const [instrumentType, setInstrumentType] = useState<string>("All");
  const [issuerType, setIssuerType] = useState<string>("All");
  const [rating, setRating] = useState<string>("All");
  const [couponType, setCouponType] = useState<string>("All");

  // Apply filters
  const filteredBonds = useMemo(() => {
    let result = allBonds;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.isin.toLowerCase().includes(q) ||
          b.ticker.toLowerCase().includes(q) ||
          b.issuerName.toLowerCase().includes(q)
      );
    }

    // Instrument type
    if (instrumentType !== "All") {
      result = result.filter((b) => b.instrumentType === instrumentType);
    }

    // Issuer type
    if (issuerType !== "All") {
      result = result.filter((b) => b.issuerType === issuerType);
    }

    // Rating
    if (rating !== "All") {
      result = result.filter((b) => b.creditRating === rating);
    }

    // Coupon type
    if (couponType !== "All") {
      result = result.filter((b) => b.couponType === couponType);
    }

    return result;
  }, [allBonds, search, instrumentType, issuerType, rating, couponType]);

  // Get unique values for filters
  const uniqueInstrumentTypes = ["All", ...new Set(allBonds.map((b) => b.instrumentType))];
  const uniqueIssuerTypes = ["All", ...new Set(allBonds.map((b) => b.issuerType))];
  const uniqueRatings = ["All", ...new Set(allBonds.map((b) => b.creditRating))];
  const uniqueCouponTypes = ["All", ...new Set(allBonds.map((b) => b.couponType))];

  // DataTable columns
  const columns: DataTableColumn<Bond>[] = [
    {
      id: "ticker",
      header: "Ticker",
      accessor: (b) => b.ticker,
      sortValue: (b) => b.ticker,
    },
    {
      id: "issuer",
      header: "Issuer",
      accessor: (b) => b.issuerName,
      sortValue: (b) => b.issuerName,
    },
    {
      id: "instrumentType",
      header: "Type",
      accessor: (b) => b.instrumentType,
      sortValue: (b) => b.instrumentType,
    },
    {
      id: "rating",
      header: "Rating",
      accessor: (b) => <RatingBadge rating={b.creditRating} />,
      sortValue: (b) => b.creditRating,
    },
    {
      id: "price",
      header: "Price",
      align: "right",
      accessor: (b) => `${b.lastTradedPrice.toFixed(2)}`,
      sortValue: (b) => b.lastTradedPrice,
    },
    {
      id: "dayChange",
      header: "Day Δ",
      align: "right",
      accessor: (b) => <DeltaValue value={b.dayChangePercent} />,
      sortValue: (b) => b.dayChangePercent,
    },
    {
      id: "ytm",
      header: "YTM",
      align: "right",
      accessor: (b) => `${b.ytm.toFixed(2)}%`,
      sortValue: (b) => b.ytm,
    },
    {
      id: "duration",
      header: "Modified Duration",
      align: "right",
      accessor: (b) => `${b.modifiedDuration.toFixed(2)}`,
      sortValue: (b) => b.modifiedDuration,
    },
    {
      id: "maturity",
      header: "Maturity (Years)",
      align: "right",
      accessor: (b) => `${b.maturityYears.toFixed(2)}`,
      sortValue: (b) => b.maturityYears,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <SectionHeader title="Market Watch" eyebrow="Bonds" />

      {/* New Issuances Rail */}
      {newIssuances.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-label text-muted">
            New Issuances
          </p>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {newIssuances.slice(0, 4).map((issue) => (
              <div
                key={issue.id}
                className="flex-shrink-0 w-64 rounded border border-border bg-white p-4"
              >
                <p className="text-sm font-semibold text-ink">{issue.issuerName}</p>
                <p className="mt-1 text-2xs text-muted">{issue.instrumentType}</p>
                {issue.couponRate && (
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {issue.couponRate.toFixed(2)}%
                  </p>
                )}
                <p className="mt-1 text-2xs text-muted">
                  Tenor: {issue.tenorLabel}
                </p>
                <p className="mt-2 text-2xs text-muted">
                  Subscription: {issue.subscriptionOpen} to {issue.subscriptionClose}
                </p>
                <Button
                  size="sm"
                  variant="buy"
                  className="mt-4 w-full"
                >
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yield Curve Chart */}
      <ChartContainer title="Sovereign Yield Curve" height={240}>
        <AppLineChart
          data={yieldCurve}
          xKey="tenor"
          series={[{ dataKey: "yield", name: "Yield %", color: "#EC0016" }]}
        />
      </ChartContainer>

      {/* Filters */}
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-label text-muted">
          Filters
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div>
            <label className="block text-2xs font-semibold text-muted mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="ISIN, ticker, issuer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-border px-2 py-1 text-sm text-ink placeholder-muted focus:border-ubs-red focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-2xs font-semibold text-muted mb-1">
              Instrument
            </label>
            <select
              value={instrumentType}
              onChange={(e) => setInstrumentType(e.target.value)}
              className="w-full rounded border border-border px-2 py-1 text-sm text-ink focus:border-ubs-red focus:outline-none"
            >
              {uniqueInstrumentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-2xs font-semibold text-muted mb-1">
              Issuer
            </label>
            <select
              value={issuerType}
              onChange={(e) => setIssuerType(e.target.value)}
              className="w-full rounded border border-border px-2 py-1 text-sm text-ink focus:border-ubs-red focus:outline-none"
            >
              {uniqueIssuerTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-2xs font-semibold text-muted mb-1">
              Rating
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full rounded border border-border px-2 py-1 text-sm text-ink focus:border-ubs-red focus:outline-none"
            >
              {uniqueRatings.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-2xs font-semibold text-muted mb-1">
              Coupon
            </label>
            <select
              value={couponType}
              onChange={(e) => setCouponType(e.target.value)}
              className="w-full rounded border border-border px-2 py-1 text-sm text-ink focus:border-ubs-red focus:outline-none"
            >
              {uniqueCouponTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted">
        {filteredBonds.length} of {allBonds.length} bonds
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredBonds}
        rowKey={(b) => b.isin}
        searchable={false}
      />
    </div>
  );
}
