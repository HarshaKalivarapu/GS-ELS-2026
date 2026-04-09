export type PortfolioRequest = {
  tickers: string[];
  weights?: number[];
  riskTolerance: number;
  horizonYears: number;
  investmentAmount: number;
  income?: number | null;
};

export type FundResult = {
  ticker: string;
  principal: number;
  weight: number;
  beta: number;
  expectedReturnRate: number;
  capmRate: number;
  expenseRatio: number;
  futureValueBeforeFees: number;
  futureValue: number;
  feeImpact: number;
  futureValueAfterTax: number;
  taxOwed: number;
};

export type PortfolioRecommendation = {
  funds: FundResult[];
  totalFutureValue: number;
  totalFutureValueBeforeFees: number;
  totalFeeImpact: number;
  totalFutureValueAfterTax: number;
  totalTaxOwed: number;
  taxRate: number;
  explanation: string;
};

export type AnalyticsRequest = {
  tickers: string[];
  investmentAmount: number;
  horizonYears: number;
  riskTolerance: number;
};

export type MonteCarloPoint = {
  year: number;
  p95: number;
  median: number;
  p5: number;
};

export type ScenarioResult = {
  id: string;
  label: string;
  badge: string;
  badgeClass: string;
  value: string;
  desc: string;
  featured: boolean;
};

export type StressPoint = {
  date: string;
  normalValue: number;
  stressValue: number;
};

export type StressEventResult = {
  id: string;
  label: string;
  period: string;
  marketDrawdownPct: number;
  portfolioDrawdownPct: number;
  startValue: number;
  troughValue: number;
  endValue: number;
  normalEndValue: number;
  series: StressPoint[];
  description: string;
  featured: boolean;
};

export type PortfolioPreset = {
  presetName: string;
  tickers: string[];
  weights: number[];
  riskTolerance: "low" | "medium" | "high";
  reason: string;
};