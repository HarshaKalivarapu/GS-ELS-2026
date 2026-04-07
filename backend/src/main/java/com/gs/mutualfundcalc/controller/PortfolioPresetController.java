package com.gs.mutualfundcalc.controller;

import com.gs.mutualfundcalc.dto.PortfolioPresetRequest;
import com.gs.mutualfundcalc.dto.PortfolioPresetResponse;
import com.gs.mutualfundcalc.service.PortfolioPresetService;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/presets")
public class PortfolioPresetController {

    private final PortfolioPresetService portfolioPresetService;

    public PortfolioPresetController(PortfolioPresetService portfolioPresetService) {
        this.portfolioPresetService = portfolioPresetService;
    }

    @PostMapping("/recommend")
    public PortfolioPresetResponse recommend(@RequestBody PortfolioPresetRequest req) {
        return portfolioPresetService.recommendPreset(req);
    }
}