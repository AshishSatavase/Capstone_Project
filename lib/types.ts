/** Shared domain types. JSON files in `/data` are treated as API payloads. */

export type IssuerType = "Sovereign" | "State" | "PSU" | "Bank" | "Corporate";

export type InstrumentType =
  | "G-Sec"
  | "SDL"
  | "T-Bill"
  | "NCD"
  | "CD"
  | "CP"
  | "AT1";

export type CouponType = "Fixed" | "Floating" | "Zero";
export type CouponFrequency = "Annual" | "Semi-Annual" | "Quarterly" | "None";
export type RatingOutlook = "Stable" | "Positive" | "Negative";
export type RatingAgency = "CRISIL" | "ICRA" | "CARE" | "India Ratings";
export type Seniority = "Senior" | "Subordinated";
export type SecuredStatus = "Secured" | "Unsecured";
export type DayCountConvention = "30/360" | "Actual/365";
export type ListingExchange = "NSE" | "BSE" | "NSE/BSE";
export type Sector =
  | "Sovereign"
  | "State"
  | "Infrastructure"
  | "Power"
  | "Banking"
  | "NBFC"
  | "Housing"
  | "Metals"
  | "Conglomerate";

export type PricePoint = {
  date: string;
  price: number;
  yield: number;
};

export type Bond = {
  isin: string;
  ticker: string;
  issuerName: string;
  issuerType: IssuerType;
  instrumentType: InstrumentType;
  bidPrice: number;
  askPrice: number;
  lastTradedPrice: number;
  dayChangePercent: number;
  ytm: number;
  currentYield: number;
  couponRate: number;
  couponType: CouponType;
  couponFrequency: CouponFrequency;
  floatingBenchmark: string | null;
  faceValue: number;
  minLotSize: number;
  issueDate: string;
  issuePrice: number;
  redemptionDate: string;
  redemptionPrice: number;
  daysToMaturity: number;
  maturityYears: number;
  modifiedDuration: number;
  macaulayDuration: number;
  convexity: number;
  creditRating: string;
  ratingAgency: RatingAgency;
  ratingOutlook: RatingOutlook;
  ratingDate: string;
  seniority: Seniority;
  securedStatus: SecuredStatus;
  callable: boolean;
  callDate: string | null;
  callPrice: number | null;
  puttable: boolean;
  putDate: string | null;
  putPrice: number | null;
  dayCountConvention: DayCountConvention;
  accruedInterestApplicable: boolean;
  accruedInterestAmount: number;
  outstandingIssueSize: number;
  listingExchange: ListingExchange;
  couponPaymentDates: string[];
  sector: Sector;
  priceHistory: PricePoint[];
  indentureDocUrl: string;
};

export type Watchlist = {
  clientId: string;
  isins: string[];
};

export type CostingMethod = "FIFO" | "LIFO" | "Weighted Average";

export type Lot = {
  quantity: number;
  price: number;
  date: string;
};

export type Holding = {
  isin: string;
  quantity: number;
  averageCostPrice: number;
  purchaseDate: string;
  costingMethod: CostingMethod;
  lots: Lot[];
};

export type Portfolio = {
  clientId: string;
  asOf: string;
  holdings: Holding[];
};

export type OrderSide = "Buy" | "Sell";
export type OrderType = "Market" | "Limit" | "Stop-Loss" | "GTD" | "GTC";
export type OrderStatus =
  | "Placed"
  | "Pending"
  | "Partially Filled"
  | "Filled"
  | "Cancelled"
  | "Rejected";

export type Trade = {
  orderId: string;
  tradeId: string | null;
  clientId: string;
  dealerId: string;
  isin: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  filledQuantity: number;
  disclosedQuantity: number | null;
  limitPrice: number | null;
  triggerPrice: number | null;
  avgFillPrice: number | null;
  status: OrderStatus;
  placedAt: string;
  updatedAt: string;
  /** Set only after a user changes an order during the current session. */
  lastModifiedAt?: string;
  validityDate: string | null;
  /** In-memory alias used by the modify-order form for GTD orders. */
  expiryDate?: string | null;
  brokerageBps: number;
  remarks: string | null;
};

export type KycStatus = "Approved" | "Pending" | "Rejected" | "Expired";
export type ClientTier = "Institutional" | "HNI" | "Bank-Treasury";
export type PartyType = "Dealer" | "Client";

export type Party = {
  id: string;
  name: string;
  type: PartyType;
  parentDealerId: string | null;
  tier: ClientTier;
  tradingLimit: number;
  utilizedAmount: number;
  kycStatus: KycStatus;
  kycUpdatedAt: string;
  pan: string;
  city: string;
};

export type NewsItem = {
  id: string;
  headline: string;
  source: string;
  timestamp: string;
  relatedIsin: string | null;
};

export type MarketRates = {
  asOf: string;
  repoRate: number;
  reverseRepoRate: number;
  gsec10y: number;
  usdInr: number;
};

export type YieldCurvePoint = {
  tenor: string;
  yield: number;
};

export type BenchmarkId = "NIFTY_COMPOSITE_DEBT" | "GSEC_10Y_INDEX";

export type BenchmarkSeries = {
  id: BenchmarkId;
  name: string;
  points: PricePoint[];
};

export type NewIssuance = {
  id: string;
  issuerName: string;
  instrumentType: InstrumentType;
  couponRate: number | null;
  tenorLabel: string;
  issueSize: number;
  minLotSize: number;
  faceValue: number;
  subscriptionOpen: string;
  subscriptionClose: string;
  priceBand: string;
  status: "Upcoming" | "Open" | "Closed";
};

export type CommissionRate = {
  instrumentType: InstrumentType;
  clientTier: ClientTier;
  bps: number;
};

export type CommissionSummary = {
  asOf: string;
  earnedToday: number;
  earnedThisMonth: number;
  daily: { date: string; amount: number }[];
};

export type CommissionsFile = {
  rates: CommissionRate[];
  summary: CommissionSummary;
};

export type CashFlow = {
  date: string;
  type: "Coupon" | "Redemption" | "Coupon + Redemption";
  amount: number;
};

export type BondFilters = {
  query?: string;
  instrumentType?: InstrumentType | "All";
  issuerType?: IssuerType | "All";
  rating?: string | "All";
  couponType?: CouponType | "All";
};

export type PortfolioValuePoint = {
  date: string;
  value: number;
  invested: number;
};
