package com.gs.mutualfundcalc.service;

import com.gs.mutualfundcalc.dto.PortfolioRecommendation;
import com.gs.mutualfundcalc.dto.PortfolioRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PortfolioService {

  public PortfolioRecommendation recommend(PortfolioRequest req) {

    List<String> tickers = req.tickers();
    double totalInvestment = req.investmentAmount();
    int years = req.horizonYears();

    if (tickers == null || tickers.isEmpty()) {
      throw new IllegalArgumentException("At least one ticker required");
    }

    double principalPerFund = totalInvestment / tickers.size();

    double riskFreeRate = 0.04;

    var results = tickers.stream().map(ticker -> {

      double beta = getBeta(ticker);
      double expectedReturn = getExpectedReturn(ticker);

      double capmRate = riskFreeRate + beta * (expectedReturn - riskFreeRate);

      double fv = principalPerFund * Math.exp(capmRate * years);

      return new PortfolioRecommendation.FundResult(
          ticker,
          principalPerFund,
          beta,
          expectedReturn,
          capmRate,
          fv
      );

    }).toList();

    double totalFV = results.stream()
        .mapToDouble(r -> r.futureValue())
        .sum();

    String explanation = "Future value calculated using CAPM and FV = P * e^(rt)";

    return new PortfolioRecommendation(results, totalFV, explanation);
  }

  private double getBeta(String ticker) {
    return switch (ticker) {
      case "VFIAX" -> 1.0;
      case "FXAIX" -> 1.0;
      case "AGTHX" -> 1.08;
      default -> 1.0;
    };
  }

  private double getExpectedReturn(String ticker) {

    double first = switch (ticker) {
      case "VFIAX" -> 430.0;
      case "FXAIX" -> 158.0;
      case "AGTHX" -> 62.3;
      default -> 100.0;
    };

    double last = switch (ticker) {
      case "VFIAX" -> 468.7;
      case "FXAIX" -> 172.8;
      case "AGTHX" -> 68.1;
      default -> 110.0;
    };

    return (last - first) / first;
  }
}