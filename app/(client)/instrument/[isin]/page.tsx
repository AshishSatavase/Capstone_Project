"use client";

import { useState } from "react";
import Link from "next/link";
import { getBondByISIN, getCashFlowSchedule, getPeerBonds, getPortfolio, DEMO_CLIENT_ID } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import { Button, Badge, Card, CardBody, DataTable, RatingBadge, SectionHeader, type DataTableColumn } from "@/components/ui";
import { DeltaValue } from "@/components/ui";
import { AppLineChart } from "@/components/charts";
import type { CashFlow, Bond } from "@/lib/types";

type InstrumentDetailPageProps = {
  params: Promise<{ isin: string }>;
};

export default async function InstrumentDetailPage({ params }: InstrumentDetailPageProps) {
  const { isin } = await params;
  const bond = getBondByISIN(isin);

  if (!bond) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ink">Bond not found</h1>
          <p className="mt-2 text-muted">ISIN: {isin}</p>
          <Link href="/" className="mt-4 inline-block text-ubs-red hover:underline">
            ← Back to Market Watch
          </Link>
        </div>
      </div>
    );
  }

  const cashFlows = getCashFlowSchedule(isin);
  const peerBonds = getPeerBonds(isin);
  const portfolio = getPortfolio(DEMO_CLIENT_ID);
  const holding = portfolio?.holdings.find((h) => h.isin === isin);

  // Chart data from price history
  const chartData = bond.priceHistory.slice(-30);

  return (
    <div className="space-y-6 p-6">
      {/* Header with back link */}
      <div className="flex items-center gap-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-ubs-red hover:underline">
          <ChevronLeft className="h-4 w-4" />
          Back to Market Watch
        </Link>
      </div>

      {/* Bond Header */}
      <div className="flex items-start justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">{bond.ticker}</h1>
          <p className="mt-1 text-sm text-muted">{bond.issuerName}</p>
          <p className="mt-0.5 text-2xs text-muted">ISIN: {bond.isin}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-ink">{bond.lastTradedPrice.toFixed(2)}</p>
          <DeltaValue value={bond.dayChangePercent} />
          <div className="mt-3 flex items-center gap-2">
            <RatingBadge rating={bond.creditRating} />
            <Badge>{bond.instrumentType}</Badge>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-2xs font-semibold uppercase tracking-label text-muted">YTM</p>
            <p className="mt-1 text-lg font-bold text-ink">{bond.ytm.toFixed(2)}%</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-2xs font-semibold uppercase tracking-label text-muted">Maturity</p>
            <p className="mt-1 text-lg font-bold text-ink">{bond.maturityYears.toFixed(2)}Y</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-2xs font-semibold uppercase tracking-label text-muted">Duration</p>
            <p className="mt-1 text-lg font-bold text-ink">{bond.modifiedDuration.toFixed(2)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-2xs font-semibold uppercase tracking-label text-muted">Coupon</p>
            <p className="mt-1 text-lg font-bold text-ink">{bond.couponRate.toFixed(2)}%</p>
          </CardBody>
        </Card>
      </div>

      {/* Trade Button */}
      <div className="flex gap-2">
        <Button variant="buy">Buy</Button>
        <Button variant="sell">Sell</Button>
      </div>

      {/* Tabs */}
      <InstrumentTabs bond={bond} cashFlows={cashFlows} peerBonds={peerBonds} chartData={chartData} />
    </div>
  );
}

function InstrumentTabs({ bond, cashFlows, peerBonds, chartData }: any) {
  const [activeTab, setActiveTab] = useState<"overview" | "characteristics" | "cashflows" | "documents" | "peers">("overview");

  return (
    <>
      <div className="border-b border-border">
        <div className="flex gap-6">
          {(["overview", "characteristics", "cashflows", "documents", "peers"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-1 py-3 text-sm font-semibold uppercase tracking-label transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-ubs-red text-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {tab === "overview" && "Overview"}
              {tab === "characteristics" && "Characteristics"}
              {tab === "cashflows" && "Cash Flows"}
              {tab === "documents" && "Documents"}
              {tab === "peers" && "Peer Comparison"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div>
             <Card className="p-6">
               <h3 className="text-sm font-semibold text-ink mb-4">Price & Yield History (Last 30 days)</h3>
               <div className="h-80">
                 <AppLineChart
                   data={chartData}
                   xKey="date"
                   series={[
                     { dataKey: "price", name: "Price %", color: "#111111" },
                     { dataKey: "yield", name: "Yield %", color: "#EC0016" },
                   ]}
                 />
               </div>
             </Card>
           </div>
        )}

        {activeTab === "characteristics" && (
          <div className="space-y-6">
            {/* Identification */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-label text-muted">Identification</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">ISIN</p>
                    <p className="mt-1 font-semibold text-ink">{bond.isin}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Ticker</p>
                    <p className="mt-1 font-semibold text-ink">{bond.ticker}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Issuer Type</p>
                    <p className="mt-1 font-semibold text-ink">{bond.issuerType}</p>
                  </CardBody>
                </Card>
              </div>
            </div>

            {/* Credit & Risk */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-label text-muted">Credit & Risk</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Rating</p>
                    <p className="mt-1"><RatingBadge rating={bond.creditRating} /></p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Agency</p>
                    <p className="mt-1 font-semibold text-ink">{bond.ratingAgency}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Outlook</p>
                    <p className="mt-1 font-semibold text-ink">{bond.ratingOutlook}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Seniority</p>
                    <p className="mt-1 font-semibold text-ink">{bond.seniority}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Secured Status</p>
                    <p className="mt-1 font-semibold text-ink">{bond.securedStatus}</p>
                  </CardBody>
                </Card>
              </div>
            </div>

            {/* Coupon & Yield */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-label text-muted">Coupon & Yield</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Coupon Rate</p>
                    <p className="mt-1 font-semibold text-ink">{bond.couponRate.toFixed(2)}%</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Type</p>
                    <p className="mt-1 font-semibold text-ink">{bond.couponType}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Frequency</p>
                    <p className="mt-1 font-semibold text-ink">{bond.couponFrequency}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">YTM</p>
                    <p className="mt-1 font-semibold text-ink">{bond.ytm.toFixed(2)}%</p>
                  </CardBody>
                </Card>
              </div>
            </div>

            {/* Dates & Lifecycle */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-label text-muted">Dates & Lifecycle</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Issue Date</p>
                    <p className="mt-1 font-semibold text-ink">{bond.issueDate}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Redemption Date</p>
                    <p className="mt-1 font-semibold text-ink">{bond.redemptionDate}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Days to Maturity</p>
                    <p className="mt-1 font-semibold text-ink">{bond.daysToMaturity}</p>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cashflows" && (
          <div>
            {cashFlows.length === 0 ? (
              <p className="text-muted">No cash flows scheduled</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-ink">Date</th>
                    <th className="px-4 py-2 text-left font-semibold text-ink">Type</th>
                    <th className="px-4 py-2 text-right font-semibold text-ink">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cashFlows.map((cf: CashFlow, idx: number) => (
                    <tr key={idx} className="hover:bg-faint/5">
                      <td className="px-4 py-2">{cf.date}</td>
                      <td className="px-4 py-2">{cf.type}</td>
                      <td className="px-4 py-2 text-right font-semibold">₹{cf.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div>
            <Card>
              <CardBody>
                <p className="text-muted">Indenture document:</p>
                <a href={bond.indentureDocUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-ubs-red hover:underline font-semibold">
                  {bond.indentureDocUrl}
                </a>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === "peers" && (
          <div>
            {peerBonds.length === 0 ? (
              <p className="text-muted">No peer bonds found</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-ink">Ticker</th>
                    <th className="px-4 py-2 text-left font-semibold text-ink">Issuer</th>
                    <th className="px-4 py-2 text-left font-semibold text-ink">Rating</th>
                    <th className="px-4 py-2 text-right font-semibold text-ink">Maturity (Y)</th>
                    <th className="px-4 py-2 text-right font-semibold text-ink">YTM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {peerBonds.map((pb: Bond) => (
                    <tr key={pb.isin} className="hover:bg-faint/5">
                      <td className="px-4 py-2">
                        <Link href={`/instrument/${pb.isin}`} className="text-ubs-red hover:underline font-semibold">
                          {pb.ticker}
                        </Link>
                      </td>
                      <td className="px-4 py-2">{pb.issuerName}</td>
                      <td className="px-4 py-2"><RatingBadge rating={pb.creditRating} /></td>
                      <td className="px-4 py-2 text-right">{pb.maturityYears.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right font-semibold">{pb.ytm.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  );
}
