"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getBondByISIN, getCashFlowSchedule, getPeerBonds } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import { Button, Badge, Card, CardBody, RatingBadge } from "@/components/ui";
import { DeltaValue } from "@/components/ui";
import { AppBarChart, AppCandlestickChart, AppLineChart } from "@/components/charts";
import { OrderTicket } from "@/components/orders/OrderTicket";
import type { CashFlow, Bond } from "@/lib/types";

type InstrumentDetailPageProps = {
  params: Promise<{ isin: string }>;
};

export default function InstrumentDetailPage({ params }: InstrumentDetailPageProps) {
  const { isin } = use(params);
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

  return <InstrumentPageContent bond={bond} cashFlows={cashFlows} peerBonds={peerBonds} />;
}

function InstrumentPageContent({
  bond,
  cashFlows,
  peerBonds,
}: {
  bond: Bond;
  cashFlows: CashFlow[];
  peerBonds: Bond[];
}) {
  const rangeOptions = ["1W", "1M", "1Y", "5Y", "ALL"] as const;
  const returnTenorOptions = ["1Y", "3Y", "5Y", "10Y"] as const;
  type RangeOption = (typeof rangeOptions)[number];
  type ReturnTenorOption = (typeof returnTenorOptions)[number];
  type ChartMode = "price" | "yield";
  type ReturnSeriesPoint = {
    tenor: ReturnTenorOption;
    invested: number;
    projected: number;
  };
  const [activeTab, setActiveTab] = useState<
    "overview" | "characteristics" | "cashflows" | "documents" | "peers" | "returns"
  >("overview");
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderSide, setOrderSide] = useState<"Buy" | "Sell">("Buy");
  const [selectedRange, setSelectedRange] = useState<RangeOption>("1Y");
  const [chartMode, setChartMode] = useState<ChartMode>("price");
  const [selectedReturnTenor, setSelectedReturnTenor] = useState<ReturnTenorOption>("1Y");

  const minInvestment = Math.ceil(
    (bond.lastTradedPrice +
      (bond.accruedInterestApplicable ? bond.accruedInterestAmount : 0)) *
      (bond.faceValue / 100) *
      bond.minLotSize
  );
  const maxInvestment = Math.max(1000000, minInvestment);
  const [selectedInvestment, setSelectedInvestment] = useState(minInvestment);

  useEffect(() => {
    setSelectedInvestment(minInvestment);
  }, [minInvestment]);

  const projectedValue = (principal: number, years: number) => {
    const annualYield = Math.max(bond.ytm, 0) / 100;
    return principal * Math.pow(1 + annualYield, years);
  };

  const investmentReturnSeries: ReturnSeriesPoint[] = [1, 3, 5, 10].map((years) => ({
    tenor: `${years}Y` as ReturnTenorOption,
    invested: Math.round(selectedInvestment),
    projected: Math.round(projectedValue(selectedInvestment, years)),
  }));
  const selectedReturnPoint = investmentReturnSeries.find(
    (point) => point.tenor === selectedReturnTenor
  ) ?? investmentReturnSeries[0];
  const selectedReturnGainPercent =
    selectedReturnPoint.invested > 0
      ? ((selectedReturnPoint.projected - selectedReturnPoint.invested) / selectedReturnPoint.invested) * 100
      : 0;

  const filteredHistory = useMemo(() => {
    const all = bond.priceHistory;
    if (!all.length) return [];

    const rangeToDays: Record<Exclude<RangeOption, "ALL">, number> = {
      "1W": 7,
      "1M": 30,
      "1Y": 365,
      "5Y": 365 * 5,
    };

    if (selectedRange === "ALL") {
      return all;
    }

    const days = rangeToDays[selectedRange];
    const endDate = new Date(all[all.length - 1].date);
    const startMs = endDate.getTime() - days * 24 * 60 * 60 * 1000;
    const ranged = all.filter((point) => new Date(point.date).getTime() >= startMs);
    return ranged.length > 1 ? ranged : all;
  }, [bond.priceHistory, selectedRange]);

  const candleData = useMemo(() => {
    return filteredHistory.map((point, index, arr) => {
      const previousPrice = index === 0 ? point.price : arr[index - 1].price;
      const open = index === 0 ? point.price * 0.997 : previousPrice;
      const close = point.price;
      const candleRange = Math.max(0.06, Math.abs(close - open) * 0.9);
      const high = Math.max(open, close) + candleRange;
      const low = Math.max(0.01, Math.min(open, close) - candleRange);

      return {
        date: point.date,
        open,
        high,
        low,
        close,
      };
    });
  }, [filteredHistory]);

  const yieldSeries = useMemo(() => {
    return filteredHistory.map((point) => ({
      date: new Date(point.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      yield: point.yield,
    }));
  }, [filteredHistory]);

  return (
    <div className="space-y-6 p-6 pb-28">
      <div className="flex items-center gap-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-ubs-red hover:underline">
          <ChevronLeft className="h-4 w-4" />
          Back to Market Watch
        </Link>
      </div>

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

      <div className="border-b border-border">
        <div className="flex gap-6">
          {(["overview", "characteristics", "cashflows", "documents", "peers", "returns"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-1 py-3 text-sm font-semibold uppercase tracking-label transition-colors ${
                activeTab === tab ? "border-b-2 border-ubs-red text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {tab === "overview" && "Overview"}
              {tab === "characteristics" && "Characteristics"}
              {tab === "cashflows" && "Cash Flows"}
              {tab === "documents" && "Documents"}
              {tab === "peers" && "Peer Comparison"}
              {tab === "returns" && "Returns Calculator"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-label text-muted">
                  {chartMode === "price" ? "Price History" : "Yield History"}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xs uppercase tracking-label text-muted">{bond.ticker}</span>
                  <div className="inline-flex rounded border border-border p-0.5">
                    <button
                      type="button"
                      className={`px-2 py-1 text-2xs font-semibold uppercase tracking-label ${
                        chartMode === "price" ? "bg-ink text-white" : "text-muted hover:text-ink"
                      }`}
                      onClick={() => setChartMode("price")}
                    >
                      Price
                    </button>
                    <button
                      type="button"
                      className={`px-2 py-1 text-2xs font-semibold uppercase tracking-label ${
                        chartMode === "yield" ? "bg-ink text-white" : "text-muted hover:text-ink"
                      }`}
                      onClick={() => setChartMode("yield")}
                    >
                      Yield
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-80">
                {chartMode === "price" ? (
                  <AppCandlestickChart data={candleData} />
                ) : (
                  <AppLineChart
                    data={yieldSeries}
                    xKey="date"
                    series={[{ dataKey: "yield", name: "Yield %", color: "#111111" }]}
                  />
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                {rangeOptions.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setSelectedRange(range)}
                    className={`rounded px-2.5 py-1 text-2xs font-semibold uppercase tracking-label transition-colors ${
                      selectedRange === range
                        ? "bg-ubs-red text-white"
                        : "text-muted hover:bg-faint/5 hover:text-ink"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </Card>

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
                  <p className="text-2xs font-semibold uppercase tracking-label text-muted">Modified Duration</p>
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
          </div>
        )}

        {activeTab === "characteristics" && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-label text-muted">Credit & Risk</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
                    <p className="text-2xs text-muted">Rating Date</p>
                    <p className="mt-1 font-semibold text-ink">{bond.ratingDate}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Sector</p>
                    <p className="mt-1 font-semibold text-ink">{bond.sector}</p>
                  </CardBody>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-label text-muted">Bond Type / Optionality</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Callable</p>
                    <p className="mt-1 font-semibold text-ink">{bond.callable ? "Yes" : "No"}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Puttable</p>
                    <p className="mt-1 font-semibold text-ink">{bond.puttable ? "Yes" : "No"}</p>
                  </CardBody>
                </Card>
                {bond.callable ? (
                  <>
                    <Card>
                      <CardBody>
                        <p className="text-2xs text-muted">Call Date</p>
                        <p className="mt-1 font-semibold text-ink">{bond.callDate ?? "—"}</p>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <p className="text-2xs text-muted">Call Price</p>
                        <p className="mt-1 font-semibold text-ink">{bond.callPrice ?? "—"}</p>
                      </CardBody>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardBody>
                      <p className="text-2xs text-muted">Call Features</p>
                      <p className="mt-1 font-semibold text-ink">Not Callable</p>
                    </CardBody>
                  </Card>
                )}
                {bond.puttable ? (
                  <>
                    <Card>
                      <CardBody>
                        <p className="text-2xs text-muted">Put Date</p>
                        <p className="mt-1 font-semibold text-ink">{bond.putDate ?? "—"}</p>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <p className="text-2xs text-muted">Put Price</p>
                        <p className="mt-1 font-semibold text-ink">{bond.putPrice ?? "—"}</p>
                      </CardBody>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardBody>
                      <p className="text-2xs text-muted">Put Features</p>
                      <p className="mt-1 font-semibold text-ink">Not Puttable</p>
                    </CardBody>
                  </Card>
                )}
                <Card>
                  <CardBody>
                    <p className="text-2xs text-muted">Day Count Convention</p>
                    <p className="mt-1 font-semibold text-ink">{bond.dayCountConvention}</p>
                  </CardBody>
                </Card>
              </div>
            </div>

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

        {activeTab === "returns" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-label text-muted">Returns Calculator</h3>
                <p className="mt-1 text-2xs text-muted">
                  Yield-based projection (includes zero-coupon bonds). Assumes annual compounding and reinvestment at the same yield.
                </p>
              </div>

              <div className="space-y-3 rounded border border-border bg-faint/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-2xs font-semibold uppercase tracking-label text-muted">Investment Amount</span>
                  <span className="text-sm font-semibold text-ink">
                    ₹{selectedInvestment.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="range"
                  min={minInvestment}
                  max={maxInvestment}
                  step={1000}
                  value={selectedInvestment}
                  onChange={(event) => setSelectedInvestment(Number(event.target.value))}
                  className="w-full accent-ubs-red"
                />
                <div className="flex items-center justify-between text-2xs text-muted">
                  <span>Min: ₹{minInvestment.toLocaleString("en-IN")}</span>
                  <span>Max: ₹{maxInvestment.toLocaleString("en-IN")}</span>
                </div>
                {minInvestment > 1000000 && (
                  <p className="text-2xs text-ubs-red">
                    Minimum investable amount for this bond is above ₹10,00,000.
                  </p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  {returnTenorOptions.map((tenor) => (
                    <button
                      key={tenor}
                      type="button"
                      onClick={() => setSelectedReturnTenor(tenor)}
                      className={`rounded px-2.5 py-1 text-2xs font-semibold uppercase tracking-label transition-colors ${
                        selectedReturnTenor === tenor
                          ? "bg-ubs-red text-white"
                          : "text-muted hover:bg-faint/5 hover:text-ink"
                      }`}
                    >
                      {tenor}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardBody>
                    <p className="text-2xs font-semibold uppercase tracking-label text-muted">Invested Amount</p>
                    <p className="mt-1 text-xl font-bold text-ink">₹{selectedInvestment.toLocaleString("en-IN")}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-2xs font-semibold uppercase tracking-label text-muted">
                      Would Become ({selectedReturnTenor})
                    </p>
                    <p className="mt-1 text-xl font-bold text-positive">
                      ₹{selectedReturnPoint.projected.toLocaleString("en-IN")}
                    </p>
                    <p className="mt-1 text-2xs font-semibold text-positive">
                      Gain: {selectedReturnGainPercent >= 0 ? "+" : ""}
                      {selectedReturnGainPercent.toFixed(2)}%
                    </p>
                  </CardBody>
                </Card>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold uppercase tracking-label text-muted">Invested vs Projected Value</h3>
              <div className="mt-4 h-80">
                <AppBarChart
                  data={investmentReturnSeries}
                  xKey="tenor"
                  series={[
                    { dataKey: "invested", name: "Invested", color: "#111111" },
                    { dataKey: "projected", name: "Projected", color: "#EC0016" },
                  ]}
                />
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/90 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl justify-end gap-3">
          <Button
            variant="sell"
            className="h-12 min-w-32 text-base font-semibold"
            onClick={() => {
              setOrderSide("Sell");
              setOrderOpen(true);
            }}
          >
            Sell
          </Button>
          <Button
            variant="buy"
            className="h-12 min-w-32 text-base font-semibold"
            onClick={() => {
              setOrderSide("Buy");
              setOrderOpen(true);
            }}
          >
            Buy
          </Button>
        </div>
      </div>

      <OrderTicket
        bond={bond}
        open={orderOpen}
        initialSide={orderSide}
        onClose={() => setOrderOpen(false)}
      />
    </div>
  );
}
