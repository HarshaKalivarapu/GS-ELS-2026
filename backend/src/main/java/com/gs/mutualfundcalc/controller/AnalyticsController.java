package com.gs.mutualfundcalc.controller;

import com.gs.mutualfundcalc.dto.AnalyticsRequest;
import com.gs.mutualfundcalc.dto.MonteCarloResponse;
import com.gs.mutualfundcalc.dto.ScenariosResponse;
import com.gs.mutualfundcalc.service.AnalyticsService;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * POST /api/analytics/montecarlo
     * Runs a 1,000-path Monte Carlo simulation and returns yearly p5/median/p95 values.
     */
    @PostMapping("/montecarlo")
    public MonteCarloResponse monteCarlo(@RequestBody AnalyticsRequest req) {
        return analyticsService.monteCarlo(req);
    }

    /**
     * POST /api/analytics/scenarios
     * Returns conservative, moderate, and aggressive annual return scenarios
     * calculated from real Yahoo Finance data for the given tickers.
     */
    @PostMapping("/scenarios")
    public ScenariosResponse scenarios(@RequestBody AnalyticsRequest req) {
        return analyticsService.scenarios(req);
    }
}
