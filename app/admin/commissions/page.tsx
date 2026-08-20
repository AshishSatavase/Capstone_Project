"use client";

import { SectionHeader, DataTable, Card, type DataTableColumn } from "@/components/ui";
import { AppBarChart, type ChartPoint } from "@/components/charts";

interface CommissionRate {
  id: string;
  instrumentType: string;
  baseBps: number;
}

const COMMISSION_RATES: CommissionRate[] = [
  { id: "1", instrumentType: "Government Securities", baseBps: 0.5 },
  { id: "2", instrumentType: "PSU Bonds", baseBps: 1.0 },
  { id: "3", instrumentType: "Corporate Bonds", baseBps: 2.0 },
  { id: "4", instrumentType: "High Yield", baseBps: 3.5 },
];

const EARNINGS_DATA: ChartPoint[] = [
  { month: "Jan", earnings: 150000 },
  { month: "Feb", earnings: 220000 },
  { month: "Mar", earnings: 180000 },
  { month: "Apr", earnings: 290000 },
  { month: "May", earnings: 310000 },
  { month: "Jun", earnings: 260000 },
];

export default function CommissionsPage() {
  const columns: DataTableColumn<CommissionRate>[] = [
    {
      id: "instrumentType",
      header: "Instrument Type",
      accessor: (c) => <div className="font-semibold">{c.instrumentType}</div>,
      sortValue: (c) => c.instrumentType,
    },
    {
      id: "baseBps",
      header: "Commission (bps)",
      align: "right",
      accessor: (c) => <span className="font-semibold">{c.baseBps}</span>,
      sortValue: (c) => c.baseBps,
    },
  ];

  const totalEarnings = EARNINGS_DATA.reduce((sum, d) => (sum + (d.earnings as number)), 0);

  return (
    <div className="space-y-6 p-6">
      <SectionHeader title="Commissions" eyebrow="Administration" />

      {/* Summary Card */}
      <Card className="p-6 bg-ink text-white">
        <div className="text-sm font-semibold opacity-80 mb-2">Total Earned (6 months)</div>
        <div className="text-3xl font-bold">₹{totalEarnings.toLocaleString("en-IN")}</div>
      </Card>

      {/* Commission Rates Table */}
      <div>
        <h3 className="text-sm font-semibold text-ink mb-4">Commission Rates</h3>
        <DataTable columns={columns} data={COMMISSION_RATES} rowKey={(c) => c.id} searchable={false} />
      </div>

      {/* Earnings Chart */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-ink mb-4">Monthly Earnings</h3>
        <div className="h-64">
          <AppBarChart
            data={EARNINGS_DATA}
            xKey="month"
            series={[{ dataKey: "earnings", name: "Earnings (₹)" }]}
          />
        </div>
      </Card>
    </div>
  );
}
