"use client";

import { SectionHeader, DataTable, Card, type DataTableColumn } from "@/components/ui";
import { AppBarChart, AppDonutChart, type DonutSlice, type ChartPoint } from "@/components/charts";

interface ExposureByIssuer {
  issuer: string;
  exposure: number;
  limit: number;
}

interface BreachAlert {
  alertId: string;
  issuer: string;
  exposure: number;
  limit: number;
  breach: number;
  severity: "High" | "Medium";
}

const EXPOSURE_DATA: ExposureByIssuer[] = [
  { issuer: "State Bank of India", exposure: 2500000, limit: 3000000 },
  { issuer: "ICICI Bank", exposure: 2100000, limit: 3000000 },
  { issuer: "HDFC Bank", exposure: 1800000, limit: 2500000 },
  { issuer: "Axis Bank", exposure: 1500000, limit: 2000000 },
  { issuer: "Kotak Mahindra", exposure: 900000, limit: 1500000 },
];

const RATING_BREAKDOWN = [
  { name: "AAA", value: 3500000 },
  { name: "AA", value: 2800000 },
  { name: "A", value: 2100000 },
  { name: "BBB", value: 900000 },
];

const BREACHES: BreachAlert[] = [
  { alertId: "1", issuer: "ICICI Bank", exposure: 2100000, limit: 3000000, breach: 0, severity: "Medium" },
];

export default function RiskPage() {
  const breachColumns: DataTableColumn<BreachAlert>[] = [
    {
      id: "issuer",
      header: "Issuer",
      accessor: (b) => <div className="font-semibold">{b.issuer}</div>,
      sortValue: (b) => b.issuer,
    },
    {
      id: "exposure",
      header: "Exposure",
      align: "right",
      accessor: (b) => `₹${b.exposure.toLocaleString("en-IN")}`,
      sortValue: (b) => b.exposure,
    },
    {
      id: "limit",
      header: "Limit",
      align: "right",
      accessor: (b) => `₹${b.limit.toLocaleString("en-IN")}`,
      sortValue: (b) => b.limit,
    },
    {
      id: "severity",
      header: "Severity",
      accessor: (b) => (
        <span
          className={`inline-block px-2 py-1 rounded text-2xs font-semibold ${
            b.severity === "High" ? "bg-ubs-red text-white" : "bg-yellow-500 text-white"
          }`}
        >
          {b.severity}
        </span>
      ),
    },
  ];

  const exposureChartData: ChartPoint[] = EXPOSURE_DATA.map((e) => ({
    issuer: e.issuer.split(" ")[0],
    exposure: e.exposure / 1000000,
  }));

  const ratingDonutData: DonutSlice[] = RATING_BREAKDOWN;

  return (
    <div className="space-y-6 p-6">
      <SectionHeader title="Risk Dashboard" eyebrow="Administration" />

      {/* Breach Alerts */}
      {BREACHES.length > 0 && (
        <Card className="p-6 border-2 border-ubs-red bg-ubs-red/5">
          <h3 className="text-sm font-semibold text-ubs-red mb-4">⚠️ Exposure Alerts</h3>
          <DataTable columns={breachColumns} data={BREACHES} rowKey={(b) => b.alertId} searchable={false} />
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Exposure by Issuer Bar Chart */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-ink mb-4">Exposure by Issuer (₹M)</h3>
          <div className="h-64">
            <AppBarChart
              data={exposureChartData}
              xKey="issuer"
              series={[{ dataKey: "exposure", name: "Exposure" }]}
            />
          </div>
        </Card>

        {/* Rating Breakdown Pie Chart */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-ink mb-4">Rating Breakdown</h3>
          <div className="h-64">
            <AppDonutChart data={ratingDonutData} />
          </div>
        </Card>
      </div>

      {/* Full Exposure Table */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-ink mb-4">All Issuer Exposures</h3>
        <DataTable
          columns={[
            {
              id: "issuer",
              header: "Issuer",
              accessor: (e) => <div className="font-semibold">{e.issuer}</div>,
              sortValue: (e) => e.issuer,
            },
            {
              id: "exposure",
              header: "Exposure",
              align: "right",
              accessor: (e) => `₹${e.exposure.toLocaleString("en-IN")}`,
              sortValue: (e) => e.exposure,
            },
            {
              id: "limit",
              header: "Limit",
              align: "right",
              accessor: (e) => `₹${e.limit.toLocaleString("en-IN")}`,
              sortValue: (e) => e.limit,
            },
            {
              id: "utilization",
              header: "Utilization",
              align: "right",
              accessor: (e) => {
                const pct = ((e.exposure / e.limit) * 100).toFixed(0);
                return (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-faint rounded overflow-hidden">
                      <div
                        className={`h-full ${parseFloat(pct) > 80 ? "bg-ubs-red" : "bg-positive"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-2xs">{pct}%</span>
                  </div>
                );
              },
            },
          ]}
          data={EXPOSURE_DATA}
          rowKey={(e) => e.issuer}
          searchable={false}
        />
      </Card>
    </div>
  );
}
