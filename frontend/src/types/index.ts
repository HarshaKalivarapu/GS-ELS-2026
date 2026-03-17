export type PortfolioRequest = {
  tickers: string[];
  riskTolerance: number;
  horizonYears: number;
  investmentAmount: number;
};

export type FundResult = {
  ticker: string;
  principal: number;
  beta: number;
  expectedReturnRate: number;
  capmRate: number;
  futureValue: number;
};

export type PortfolioRecommendation = {
  funds: FundResult[];
  totalFutureValue: number;
  explanation: string;
};
