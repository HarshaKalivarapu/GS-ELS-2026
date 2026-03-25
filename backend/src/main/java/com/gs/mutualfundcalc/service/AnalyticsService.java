package com.gs.mutualfundcalc.service;

import com.gs.mutualfundcalc.dto.AnalyticsRequest;
import com.gs.mutualfundcalc.dto.MonteCarloResponse;
import com.gs.mutualfundcalc.dto.MonteCarloResponse.DataPoint;
import com.gs.mutualfundcalc.dto.ScenariosResponse;
import com.gs.mutualfundcalc.dto.ScenariosResponse.Scenario;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
public class AnalyticsService {

    private static final int SIMULATIONS = 1_000;
    private static final double RISK_FREE_RATE = 0.04;

    private final MarketDataService marketDataService;

    public AnalyticsService(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    /**
     * Monte Carlo simulation:
     * 1. Fetch mean annual return and volatility for each ticker
     * 2. Average them (equal-weight portfolio)
     * 3. Run 1,000 simulations — each year apply a random return drawn from Normal(mean, sigma)
     * 4. At each year, sort all simulation values and pick the 5th, 50th, 95th percentiles
     */
    public MonteCarloResponse monteCarlo(AnalyticsRequest req) {
        List<String> tickers = req.tickers();
        if (tickers == null || tickers.isEmpty()) {
            throw new IllegalArgumentException("At least one ticker required");
        }

        // Average return and volatility across all tickers (equal weight)
        double meanReturn = tickers.stream()
                .mapToDouble(marketDataService::fetchAnnualReturn)
                .average().orElse(0.08);

        double volatility = tickers.stream()
                .mapToDouble(marketDataService::fetchAnnualVolatility)
                .average().orElse(0.15);

        double principal = req.investmentAmount();
        int years = req.horizonYears();
        Random rng = new Random(42); // fixed seed for reproducible results

        // Run all simulations — paths[sim][year] = portfolio value
        double[][] paths = new double[SIMULATIONS][years + 1];
        for (int sim = 0; sim < SIMULATIONS; sim++) {
            paths[sim][0] = principal;
            for (int yr = 1; yr <= years; yr++) {
                double randomReturn = meanReturn + volatility * rng.nextGaussian();
                paths[sim][yr] = paths[sim][yr - 1] * (1 + randomReturn);
            }
        }

        // Build one DataPoint per year using percentiles across all simulations
        List<DataPoint> dataPoints = new ArrayList<>();
        for (int yr = 0; yr <= years; yr++) {
            final int y = yr;
            double[] valuesAtYear = Arrays.stream(paths)
                    .mapToDouble(path -> path[y])
                    .sorted()
                    .toArray();

            long p95    = Math.round(percentile(valuesAtYear, 95));
            long median = Math.round(percentile(valuesAtYear, 50));
            long p5     = Math.round(percentile(valuesAtYear, 5));
            dataPoints.add(new DataPoint(yr, p95, median, p5));
        }

        return new MonteCarloResponse(dataPoints);
    }

    /**
     * Scenario analysis:
     * Uses three different risk multipliers on top of the base CAPM return.
     * Conservative = 30% market exposure, Moderate = 100% (base), Aggressive = 150%
     */
    public ScenariosResponse scenarios(AnalyticsRequest req) {
        List<String> tickers = req.tickers();
        if (tickers == null || tickers.isEmpty()) {
            throw new IllegalArgumentException("At least one ticker required");
        }

        double avgReturn = tickers.stream()
                .mapToDouble(marketDataService::fetchAnnualReturn)
                .average().orElse(0.08);

        double avgBeta = tickers.stream()
                .mapToDouble(marketDataService::fetchBeta)
                .average().orElse(1.0);

        // CAPM rate at three different beta multipliers
        double conservativeRate = capm(avgBeta * 0.3, avgReturn);
        double moderateRate     = capm(avgBeta * 1.0, avgReturn);
        double aggressiveRate   = capm(avgBeta * 1.5, avgReturn);

        List<Scenario> scenarios = List.of(
            new Scenario(
                "conservative",
                "CONSERVATIVE",
                "Low risk",
                "scenario-badge-green",
                formatRate(conservativeRate),
                "Stable, diversified returns with minimal drawdown risk.",
                false
            ),
            new Scenario(
                "moderate",
                "MODERATE",
                "Recommended",
                "scenario-badge-white",
                formatRate(moderateRate),
                "Balanced growth with diversified fund exposure.",
                true
            ),
            new Scenario(
                "aggressive",
                "AGGRESSIVE",
                "High risk",
                "scenario-badge-amber",
                formatRate(aggressiveRate),
                "High potential upside with elevated volatility and drawdown.",
                false
            )
        );

        return new ScenariosResponse(scenarios);
    }

    // CAPM: riskFreeRate + beta * (expectedReturn - riskFreeRate)
    private double capm(double beta, double expectedReturn) {
        return RISK_FREE_RATE + beta * (expectedReturn - RISK_FREE_RATE);
    }

    // Format as "+8.7%" string
    private String formatRate(double rate) {
        return String.format("%+.1f%%", rate * 100);
    }

    // Linear interpolation percentile (p = 0-100)
    private double percentile(double[] sorted, double p) {
        double index = (p / 100.0) * (sorted.length - 1);
        int lo = (int) index;
        int hi = Math.min(lo + 1, sorted.length - 1);
        double frac = index - lo;
        return sorted[lo] + frac * (sorted[hi] - sorted[lo]);
    }
}
