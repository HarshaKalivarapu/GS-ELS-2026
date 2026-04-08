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
        double taxRate = estimateTaxRate(req.income(), years);

        List<PortfolioRecommendation.FundResult> results = tickers.stream().map(ticker -> {
            String normalizedTicker = ticker.toUpperCase();

            double weight = weights.getOrDefault(normalizedTicker, 1.0 / tickers.size());
            double principal = totalInvestment * weight;

            double beta = marketDataService.fetchBeta(normalizedTicker);
            double expectedReturn = marketDataService.fetchAnnualReturn(normalizedTicker);

            double capmRate = riskFreeRate + beta * (expectedReturn - riskFreeRate);
            double fv = principal * Math.exp(capmRate * years);

            double gain = Math.max(0, fv - principal);
            double taxOwed = gain * taxRate;
            double fvAfterTax = fv - taxOwed;

            return new PortfolioRecommendation.FundResult(
                    normalizedTicker,
                    principal,
                    weight,
                    beta,
                    expectedReturn,
                    capmRate,
                    fv,
                    fvAfterTax,
                    taxOwed
            );
        }).toList();

        double totalFV = results.stream()
                .mapToDouble(PortfolioRecommendation.FundResult::futureValue)
                .sum();

        double totalFVAfterTax = results.stream()
                .mapToDouble(PortfolioRecommendation.FundResult::futureValueAfterTax)
                .sum();

        double totalTaxOwed = results.stream()
                .mapToDouble(PortfolioRecommendation.FundResult::taxOwed)
                .sum();

        String explanation =
                "Portfolio uses preset or risk-based allocation instead of equal weighting. " +
                "Returns calculated using CAPM and continuous compounding.";

        return new PortfolioRecommendation(results, totalFV, totalFVAfterTax, totalTaxOwed, taxRate, explanation);
    }

    /**
     * Estimates the federal capital gains tax rate based on income and holding period.
     * Short-term (< 1 year): taxed as ordinary income using simplified brackets.
     * Long-term (>= 1 year): 0%, 15%, or 20% based on income.
     * Defaults to 15% if income is not provided.
     */
    private double estimateTaxRate(Double income, int horizonYears) {
        if (horizonYears < 1) {
            // Short-term capital gains — taxed as ordinary income
            if (income == null) return 0.22;
            if (income <= 11_600)  return 0.10;
            if (income <= 47_150)  return 0.12;
            if (income <= 100_525) return 0.22;
            if (income <= 191_950) return 0.24;
            if (income <= 243_725) return 0.32;
            if (income <= 609_350) return 0.35;
            return 0.37;
        }

        // Long-term capital gains
        if (income == null) return 0.15;
        if (income <= 47_025)  return 0.0;
        if (income <= 518_900) return 0.15;
        return 0.20;
    }

    private String mapRiskTolerance(double r) {
        if (r < 0.34) return "low";
        if (r < 0.67) return "medium";
        return "high";
    }
}