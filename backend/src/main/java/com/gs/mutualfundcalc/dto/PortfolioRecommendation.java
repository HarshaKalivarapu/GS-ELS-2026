package com.gs.mutualfundcalc.dto;

import java.util.List;

public record PortfolioRecommendation(
    List<Allocation> allocations,
    double expectedReturn,
    double volatility,
    String explanation
) {
  public record Allocation(String ticker, double weight) {}
}