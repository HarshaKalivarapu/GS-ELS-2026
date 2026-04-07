package com.gs.mutualfundcalc.dto;

import java.util.List;

public record StressTestResponse(List<StressEvent> events) {

    public record StressPoint(
        String date,
        double normalValue,
        double stressValue
    ) {}

    public record StressEvent(
        String id,
        String label,
        String period,
        double marketDrawdownPct,
        double portfolioDrawdownPct,
        double startValue,
        double troughValue,
        double endValue,
        double normalEndValue,
        List<StressPoint> series,
        String description,
        boolean featured
    ) {}
}