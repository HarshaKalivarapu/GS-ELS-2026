package com.gs.mutualfundcalc.dto;

import java.util.List;

public record MonteCarloResponse(List<DataPoint> data) {

    // One point per year — matches the chart's { year, p95, median, p5 } shape
    public record DataPoint(int year, long p95, long median, long p5) {}
}
