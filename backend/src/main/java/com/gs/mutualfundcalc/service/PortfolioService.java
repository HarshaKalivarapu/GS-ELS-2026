package com.gs.mutualfundcalc.service;

import com.gs.mutualfundcalc.dto.PortfolioRecommendation;
import com.gs.mutualfundcalc.dto.PortfolioRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PortfolioService {

  public PortfolioRecommendation recommend(PortfolioRequest req) {
    List<String> tickers = req.tickers();
    double w = tickers.isEmpty() ? 0.0 : 1.0 / tickers.size();

    var allocations = tickers.stream()
        .map(t -> new PortfolioRecommendation.Allocation(t, w))
        .toList();

    String explanation = """
        Stub recommendation: equal-weight allocation.
        Replace with optimizer that uses volatility, correlation, and risk tolerance.
        """;

    return new PortfolioRecommendation(
        allocations,
        0.08,
        0.15,
        explanation.trim()
    );
  }
}