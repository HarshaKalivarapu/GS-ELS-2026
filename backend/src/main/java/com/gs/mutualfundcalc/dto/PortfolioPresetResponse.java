package com.gs.mutualfundcalc.dto;

import java.util.List;

public record PortfolioPresetResponse(
    String presetName,
    List<String> tickers,
    List<Double> weights,
    String riskTolerance,
    String reason
) {}