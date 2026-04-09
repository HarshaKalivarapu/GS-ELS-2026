package com.gs.mutualfundcalc.dto;

import java.util.List;

public record PortfolioRecommendation(
    List<FundResult> funds,
    double totalFutureValue,
    double totalFutureValueBeforeFees,
    double totalFeeImpact,
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
        double expenseRatio,
        double futureValueBeforeFees,
        double futureValue,
        double feeImpact,
        double futureValueAfterTax,
        double taxOwed
    ) {}
}