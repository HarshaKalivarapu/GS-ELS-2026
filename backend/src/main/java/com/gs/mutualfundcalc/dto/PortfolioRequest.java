package com.gs.mutualfundcalc.dto;

import java.util.List;

public record PortfolioRequest(
    List<String> tickers,
    List<Double> weights,
    double riskTolerance,
    int horizonYears,
    double investmentAmount,
    Double income
) {}