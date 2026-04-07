package com.gs.mutualfundcalc.dto;

import java.util.List;

public record PortfolioRecommendation(
    List<FundResult> funds,
    double totalFutureValue,
    String explanation
) {
    public record FundResult(
        String ticker,
        double principal,
        double weight,              // ✅ NEW FIELD
        double beta,
        double expectedReturnRate,
        double capmRate,
        double futureValue
    ) {}
}