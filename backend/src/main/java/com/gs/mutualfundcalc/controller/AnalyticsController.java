package com.gs.mutualfundcalc.controller;

import com.gs.mutualfundcalc.dto.AnalyticsRequest;
import com.gs.mutualfundcalc.dto.MonteCarloResponse;
import com.gs.mutualfundcalc.dto.ScenariosResponse;
import com.gs.mutualfundcalc.dto.StressTestResponse;
import com.gs.mutualfundcalc.service.AnalyticsService;
import com.gs.mutualfundcalc.service.StressTestService;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final StressTestService stressTestService;

    public AnalyticsController(
        AnalyticsService analyticsService,
        StressTestService stressTestService
    ) {
        this.analyticsService = analyticsService;
        this.stressTestService = stressTestService;
    }

    @GetMapping("/ping")
    public String ping() {
        return "analytics alive";
    }

    @PostMapping("/montecarlo")
    public MonteCarloResponse monteCarlo(@RequestBody AnalyticsRequest req) {
        return analyticsService.monteCarlo(req);
    }

    @PostMapping("/scenarios")
    public ScenariosResponse scenarios(@RequestBody AnalyticsRequest req) {
        return analyticsService.scenarios(req);
    }

    @PostMapping("/stress")
    public StressTestResponse stress(@RequestBody AnalyticsRequest req) {
        return stressTestService.stress(req);
    }
}