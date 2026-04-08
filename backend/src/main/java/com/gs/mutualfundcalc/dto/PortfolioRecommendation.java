package com.gs.mutualfundcalc.dto;

import java.util.List;

public record PortfolioRecommendation(
    List<FundResult> funds,
    double totalFutureValue,
    double totalFutureValueAfterTax,
    double totalTaxOwed,
    double taxRate,
    String explanation
) {
    public record FundResult(
        String ticker,
        double principal,
        double weight,
        double beta,
        double expectedReturnRate,
        double capmRate,
        double futureValue,
        double futureValueAfterTax,
        double taxOwed
    ) {}
}