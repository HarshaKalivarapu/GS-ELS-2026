package com.gs.mutualfundcalc.service;

import com.gs.mutualfundcalc.dto.FundDto;
import com.gs.mutualfundcalc.dto.PortfolioRecommendation;
import com.gs.mutualfundcalc.dto.PortfolioRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PortfolioService {

    private final MarketDataService marketDataService;
    private final PortfolioAllocationService allocationService;

    public PortfolioService(
            MarketDataService marketDataService,
            PortfolioAllocationService allocationService
    ) {
        this.marketDataService = marketDataService;
        this.allocationService = allocationService;
    }

    public PortfolioRecommendation recommend(PortfolioRequest req) {
        List<String> tickers = req.tickers();
        double totalInvestment = req.investmentAmount();
        int years = req.horizonYears();

        if (tickers == null || tickers.isEmpty()) {
            throw new IllegalArgumentException("At least one ticker required");
        }

        Map<String, Double> weights;

        // 1. Use exact preset weights if passed in
        if (req.weights() != null && req.weights().size() == tickers.size()) {
            weights = new HashMap<>();
            for (int i = 0; i < tickers.size(); i++) {
                weights.put(tickers.get(i).toUpperCase(), req.weights().get(i));
            }
        } else {
            // 2. Otherwise fall back to risk-based category allocation
            String riskTolerance = mapRiskTolerance(req.riskTolerance());

            List<FundDto> funds = tickers.stream().map(ticker -> {
                var info = marketDataService.fetchFundInfo(ticker);
                return new FundDto(
                        ticker.toLowerCase(),
                        info.name(),
                        ticker.toUpperCase(),
                        info.expenseRatio(),
                        info.category()
                );
            }).toList();

            weights = allocationService.allocate(funds, riskTolerance);
        }

        double riskFreeRate = 0.04;

        List<PortfolioRecommendation.FundResult> results = tickers.stream().map(ticker -> {
            String normalizedTicker = ticker.toUpperCase();

            double weight = weights.getOrDefault(normalizedTicker, 1.0 / tickers.size());
            double principal = totalInvestment * weight;

            double beta = marketDataService.fetchBeta(normalizedTicker);
            double expectedReturn = marketDataService.fetchAnnualReturn(normalizedTicker);

            double capmRate = riskFreeRate + beta * (expectedReturn - riskFreeRate);
            double fv = principal * Math.exp(capmRate * years);

            return new PortfolioRecommendation.FundResult(
                    normalizedTicker,
                    principal,
                    weight,
                    beta,
                    expectedReturn,
                    capmRate,
                    fv
            );
        }).toList();

        double totalFV = results.stream()
                .mapToDouble(PortfolioRecommendation.FundResult::futureValue)
                .sum();

        String explanation =
                "Portfolio uses preset or risk-based allocation instead of equal weighting. " +
                "Returns calculated using CAPM and continuous compounding.";

        return new PortfolioRecommendation(results, totalFV, explanation);
    }

    private String mapRiskTolerance(double r) {
        if (r < 0.34) return "low";
        if (r < 0.67) return "medium";
        return "high";
    }
}