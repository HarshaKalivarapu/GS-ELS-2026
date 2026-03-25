package com.gs.mutualfundcalc.dto;

import java.util.List;

public record AnalyticsRequest(
    List<String> tickers,
    double investmentAmount,
    int horizonYears
) {}
