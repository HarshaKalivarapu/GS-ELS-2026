package com.gs.mutualfundcalc.dto;

import java.util.List;

public record PortfolioRequest(
    List<String> tickers,
    double riskTolerance,
    int horizonYears,
    double investmentAmount
) {}