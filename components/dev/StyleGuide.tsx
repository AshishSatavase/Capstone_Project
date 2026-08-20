"use client";

import { useState } from "react";
import {
  AppAreaChart,
  AppBarChart,
  AppDonutChart,
  AppLineChart,
} from "@/components/charts";
import { ChartContainer } from "@/components/charts/ChartContainer";
import {
  Badge,
  Button,
  Card,
  CardBody,
  DataTable,
  DeltaValue,
  RatingBadge,
  SectionHeader,
  StatChip,
  TableSkeleton,
  type DataTableColumn,
} from "@/components/ui";

type DemoRow = {
  isin: string;
  ticker: string;
  issuer: string;
  type: string;
  ytm: number;
  change: number;
  rating: string;
};

const DEMO_ROWS: DemoRow[] = [
  {
    isin: "IN0020240011",
    ticker: "GS 7.18 2037",
    issuer: "Govt of India",
    type: "G-Sec",
    ytm: 6.92,
    change: 0.04,
    rating: "AAA",
  },
  {
    isin: "INE020B08AA1",
    ticker: "REC 7.85 2031",
    issuer: "REC Ltd",
    type: "NCD",
    ytm: 7.41,
    change: -0.12,
    rating: "AAA",
  },
  {
    isin: "INE134E08XX2",
    ticker: "PFC 7.60 2029",
    issuer: "PFC Ltd",
    type: "NCD",
    ytm: 7.28,
    change: 0.08,
    rating: "AAA",
  },
  {
    isin: "INE090A08ZZ9",
    ticker: "ICICI AT1 PERP",
    issuer: "ICICI Bank",
    type: "AT1",
    ytm: 8.95,
    change: -0.31,
    rating: "AA+",
  },
];

const columns: DataTableColumn<DemoRow>[] = [
  { id: "ticker", header: "Ticker", accessor: (r) => r.ticker, sortValue: (r) => r.ticker },
  { id: "issuer", header: "Issuer", accessor: (r) => r.issuer, sortValue: (r) => r.issuer },
  { id: "type", header: "Type", accessor: (r) => r.type, sortValue: (r) => r.type },
  {
    id: "rating",
    header: "Rating",
    accessor: (r) => <RatingBadge rating={r.rating} />,
    sortValue: (r) => r.rating,
  },
  {
    id: "ytm",
    header: "YTM",
    align: "right",
    accessor: (r) => `${r.ytm.toFixed(2)}%`,
    sortValue: (r) => r.ytm,
  },
  {
    id: "change",
    header: "Day Δ",
    align: "right",
    accessor: (r) => <DeltaValue value={r.change} />,
    sortValue: (r) => r.change,
  },
];

const yieldCurve = [
  { tenor: "3M", yield: 6.52 },
  { tenor: "6M", yield: 6.61 },
  { tenor: "1Y", yield: 6.68 },
  { tenor: "2Y", yield: 6.74 },
  { tenor: "5Y", yield: 6.81 },
  { tenor: "10Y", yield: 6.92 },
  { tenor: "15Y", yield: 7.01 },
  { tenor: "30Y", yield: 7.12 },
];

const portfolioSeries = [
  { date: "Mar", value: 98, invested: 100, bench: 99 },
  { date: "Apr", value: 99.4, invested: 100, bench: 99.2 },
  { date: "May", value: 101.1, invested: 102, bench: 99.8 },
  { date: "Jun", value: 100.6, invested: 102, bench: 100.1 },
  { date: "Jul", value: 103.2, invested: 104, bench: 101.0 },
  { date: "Aug", value: 104.8, invested: 104, bench: 101.6 },
];

const exposure = [
  { name: "Sovereign", value: 42 },
  { name: "PSU", value: 28 },
  { name: "Bank", value: 18 },
  { name: "Corporate", value: 12 },
];

const issuerBars = [
  { issuer: "GOI", amt: 420 },
  { issuer: "REC", amt: 180 },
  { issuer: "PFC", amt: 140 },
  { issuer: "NHAI", amt: 95 },
];

export function StyleGuide() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-6">
      <header className="mb-8">
        <p className="text-2xs font-semibold uppercase tracking-header text-muted">
          Capstone · Step 1 of 8
        </p>
        <h1 className="mt-1 text-xl font-bold uppercase tracking-header text-ink">
          FI Execution Design System
        </h1>
        <div className="mt-2 h-px w-full bg-border">
          <div className="h-[2px] w-24 bg-ubs-red" />
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Temporary review surface for tokens and primitives. This page will be
          replaced by Market Watch in a later step.
        </p>
      </header>

      <SectionHeader title="Buttons" eyebrow="Actions" />
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <Button>Submit Order</Button>
        <Button variant="buy">Buy</Button>
        <Button variant="sell">Sell</Button>
        <Button variant="secondary">Modify</Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="ghost" size="sm">
          Ghost
        </Button>
        <Button loading>Confirm</Button>
      </div>

      <SectionHeader title="Badges & Deltas" eyebrow="Status" />
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Badge>Pending</Badge>
        <Badge variant="red">Rejected</Badge>
        <Badge variant="outline">Open</Badge>
        <Badge variant="muted">Cancelled</Badge>
        <RatingBadge rating="AAA" />
        <RatingBadge rating="AA+" />
        <RatingBadge rating="BBB" />
        <DeltaValue value={0.14} />
        <DeltaValue value={-0.22} />
        <DeltaValue value={0} />
      </div>

      <SectionHeader title="Stat chips" eyebrow="Summary" />
      <div className="mb-8 grid grid-cols-2 gap-px border border-border md:grid-cols-4">
        <StatChip
          className="border-0"
          label="Total invested"
          value="₹12.40 Cr"
        />
        <StatChip
          className="border-0 border-l border-border"
          label="Current value"
          value="₹12.91 Cr"
          delta={4.12}
        />
        <StatChip
          className="border-0 border-l-0 border-border md:border-l"
          label="Overall return"
          value="4.12%"
          delta={4.12}
        />
        <StatChip
          className="border-0 border-l border-border"
          label="Accrued interest"
          value="₹18.6 L"
          hint="Receivable"
        />
      </div>

      <SectionHeader
        title="Market watch table"
        eyebrow="DataTable"
        actions={
          <Button size="sm" variant="outline" onClick={() => setLoading((v) => !v)}>
            {loading ? "Show data" : "Show skeleton"}
          </Button>
        }
      />
      <div className="mb-8">
        {loading ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={DEMO_ROWS}
            rowKey={(r) => r.isin}
            searchable
            searchPlaceholder="Search ISIN, ticker, issuer…"
          />
        )}
      </div>

      <SectionHeader title="Charts" eyebrow="Recharts wrappers" />
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartContainer title="Sovereign yield curve" height={240}>
          <AppLineChart
            data={yieldCurve}
            xKey="tenor"
            series={[{ dataKey: "yield", name: "Yield %", color: "#EC0016" }]}
          />
        </ChartContainer>
        <ChartContainer title="Portfolio vs invested" height={240}>
          <AppAreaChart
            data={portfolioSeries}
            xKey="date"
            series={[
              { dataKey: "value", name: "MTM", color: "#111111" },
              { dataKey: "invested", name: "Invested", color: "#EC0016" },
            ]}
          />
        </ChartContainer>
        <ChartContainer title="Exposure by issuer" height={240}>
          <AppBarChart
            data={issuerBars}
            xKey="issuer"
            series={[{ dataKey: "amt", name: "₹ Cr", color: "#111111" }]}
          />
        </ChartContainer>
        <ChartContainer title="Allocation" height={240}>
          <AppDonutChart data={exposure} />
        </ChartContainer>
      </div>

      <SectionHeader title="Card" eyebrow="Surface" />
      <Card className="mb-10 max-w-md">
        <CardBody>
          <p className="text-2xs font-semibold uppercase tracking-label text-muted">
            Indenture
          </p>
          <p className="mt-1 text-sm text-ink">
            White surface, 1px #E5E5E5 border, no drop shadow. Use this for
            instrument rails and ticket panels.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
