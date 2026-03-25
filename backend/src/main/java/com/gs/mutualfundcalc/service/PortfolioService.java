package com.gs.mutualfundcalc.service;

import com.gs.mutualfundcalc.dto.PortfolioRecommendation;
import com.gs.mutualfundcalc.dto.PortfolioRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PortfolioService {

    private final MarketDataService marketDataService;

    // MarketDataService is injected by Spring so we get real Yahoo Finance data
    public PortfolioService(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    public PortfolioRecommendation recommend(PortfolioRequest req) {

        List<String> tickers = req.tickers();
        double totalInvestment = req.investmentAmount();
        int years = req.horizonYears();

        if (tickers == null || tickers.isEmpty()) {
            throw new IllegalArgumentException("At least one ticker required");
        }

        double principalPerFund = totalInvestment / tickers.size();
        double riskFreeRate = 0.04; // 10-year Treasury approximation

        var results = tickers.stream().map(ticker -> {

            // Fetch real beta and annual return from Yahoo Finance
            double beta           = marketDataService.fetchBeta(ticker);
            double expectedReturn = marketDataService.fetchAnnualReturn(ticker);

            // CAPM: expected return adjusted for the fund's market sensitivity
            double capmRate = riskFreeRate + beta * (expectedReturn - riskFreeRate);

            // Future value using continuous compounding: FV = P * e^(rt)
            double fv = principalPerFund * Math.exp(capmRate * years);

            return new PortfolioRecommendation.FundResult(
                    ticker,
                    principalPerFund,
                    beta,
                    expectedReturn,
                    capmRate,
                    fv
            );

        }).toList();

        double totalFV = results.stream().mapToDouble(r -> r.futureValue()).sum();
        String explanation = "Future value calculated using CAPM and FV = P * e^(rt). " +
                "Beta and annual return sourced live from Yahoo Finance.";

        return new PortfolioRecommendation(results, totalFV, explanation);
    }
}
