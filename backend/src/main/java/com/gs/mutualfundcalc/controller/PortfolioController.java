package com.gs.mutualfundcalc.controller;

import com.gs.mutualfundcalc.dto.PortfolioRecommendation;
import com.gs.mutualfundcalc.dto.PortfolioRequest;
import com.gs.mutualfundcalc.service.PortfolioService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

  private final PortfolioService portfolioService;

  public PortfolioController(PortfolioService portfolioService) {
    this.portfolioService = portfolioService;
  }

  @PostMapping("/recommend")
  public PortfolioRecommendation recommend(@RequestBody PortfolioRequest req) {
    return portfolioService.recommend(req);
  }
}