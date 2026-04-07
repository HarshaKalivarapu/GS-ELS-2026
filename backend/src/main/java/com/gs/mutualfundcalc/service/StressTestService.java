package com.gs.mutualfundcalc.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gs.mutualfundcalc.dto.AnalyticsRequest;
import com.gs.mutualfundcalc.dto.FundDto;
import com.gs.mutualfundcalc.dto.StressTestResponse;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class StressTestService {

    private final Map<String, Object> root;
    private final MarketDataService marketDataService;
    private final PortfolioAllocationService allocationService;

    public StressTestService(
            MarketDataService marketDataService,
            PortfolioAllocationService allocationService
    ) {
        this.marketDataService = marketDataService;
        this.allocationService = allocationService;

        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream in = new ClassPathResource("stress-history.json").getInputStream();
            this.root = mapper.readValue(in, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to load stress-history.json", e);
        }
    }

    @SuppressWarnings("unchecked")
    public StressTestResponse stress(AnalyticsRequest req) {
        List<Map<String, Object>> events = (List<Map<String, Object>>) root.get("events");
        if (events == null || events.isEmpty()) {
            return new StressTestResponse(List.of());
        }

        List<String> tickers = req.tickers();
        if (tickers == null || tickers.isEmpty()) {
            return new StressTestResponse(List.of());
        }

        String riskTolerance = mapRiskTolerance(req.riskTolerance());

        List<FundDto> funds = tickers.stream().map(ticker -> {
            MarketDataService.FundInfo info = marketDataService.fetchFundInfo(ticker);
            return new FundDto(
                    ticker.toLowerCase(),
                    info.name(),
                    ticker.toUpperCase(),
                    info.expenseRatio(),
                    info.category()
            );
        }).toList();

        Map<String, Double> weights = allocationService.allocate(funds, riskTolerance);

        double weightedBeta = weightedBeta(tickers, weights);
        double weightedAnnualReturn = weightedAnnualReturn(tickers, weights);

        List<StressTestResponse.StressEvent> out = new ArrayList<>();

        for (Map<String, Object> event : events) {
            List<Map<String, Object>> rawSeries = (List<Map<String, Object>>) event.get("series");
            if (rawSeries == null || rawSeries.isEmpty()) {
                continue;
            }

            double startValue = req.investmentAmount();
            List<StressTestResponse.StressPoint> fullSeries = new ArrayList<>();

            String firstDate = getString(rawSeries.get(0), "date", null);
            if (firstDate == null) {
                continue;
            }

            LocalDate startDate = LocalDate.parse(firstDate);

            double minStressValue = Double.MAX_VALUE;
            double lastStressValue = startValue;
            double lastNormalValue = startValue;

            for (Map<String, Object> point : rawSeries) {
                String date = getString(point, "date", null);
                if (date == null) continue;

                double marketIndex = getDouble(point, "marketIndex", 100.0);
                double marketReturn = (marketIndex / 100.0) - 1.0;

                double stressReturn = marketReturn * weightedBeta;
                double stressValue = round2(startValue * Math.max(0.0, 1.0 + stressReturn));

                long days = ChronoUnit.DAYS.between(startDate, LocalDate.parse(date));
                double yearsElapsed = Math.max(0.0, days / 365.25);
                double normalValue = round2(startValue * Math.pow(1.0 + weightedAnnualReturn, yearsElapsed));

                fullSeries.add(new StressTestResponse.StressPoint(
                        date,
                        normalValue,
                        stressValue
                ));

                if (stressValue < minStressValue) {
                    minStressValue = stressValue;
                }

                lastStressValue = stressValue;
                lastNormalValue = normalValue;
            }

            List<StressTestResponse.StressPoint> chartSeries = downsample(fullSeries, 80);

            double marketDrawdownPct = getDouble(event, "marketDrawdownPct", 0.0);
            double portfolioDrawdownPct = (minStressValue / startValue) - 1.0;

            out.add(new StressTestResponse.StressEvent(
                    getString(event, "id", "unknown"),
                    getString(event, "label", "Unknown Event"),
                    getString(event, "start", "") + " → " + getString(event, "end", ""),
                    round4(marketDrawdownPct),
                    round4(portfolioDrawdownPct),
                    round2(startValue),
                    round2(minStressValue),
                    round2(lastStressValue),
                    round2(lastNormalValue),
                    chartSeries,
                    getString(event, "description", ""),
                    getBoolean(event, "featured", false)
            ));
        }

        return new StressTestResponse(out);
    }

    private double weightedBeta(List<String> tickers, Map<String, Double> weights) {
        double total = 0.0;
        double totalWeight = 0.0;

        for (String ticker : tickers) {
            try {
                String normalized = ticker.toUpperCase();
                double beta = marketDataService.fetchBeta(normalized);
                double weight = weights.getOrDefault(normalized, 0.0);

                total += beta * weight;
                totalWeight += weight;
            } catch (Exception ignored) {
            }
        }

        if (totalWeight <= 0.0) {
            return 1.0;
        }

        return total / totalWeight;
    }

    private double weightedAnnualReturn(List<String> tickers, Map<String, Double> weights) {
        double total = 0.0;
        double totalWeight = 0.0;

        for (String ticker : tickers) {
            try {
                String normalized = ticker.toUpperCase();
                double annualReturn = marketDataService.fetchAnnualReturn(normalized);
                double weight = weights.getOrDefault(normalized, 0.0);

                total += annualReturn * weight;
                totalWeight += weight;
            } catch (Exception ignored) {
            }
        }

        if (totalWeight <= 0.0) {
            return 0.08;
        }

        return total / totalWeight;
    }

    private List<StressTestResponse.StressPoint> downsample(
            List<StressTestResponse.StressPoint> points,
            int maxPoints
    ) {
        if (points.size() <= maxPoints) {
            return points;
        }

        List<StressTestResponse.StressPoint> out = new ArrayList<>();
        double step = (double) (points.size() - 1) / (maxPoints - 1);

        for (int i = 0; i < maxPoints; i++) {
            int idx = (int) Math.round(i * step);
            out.add(points.get(Math.min(idx, points.size() - 1)));
        }

        return out;
    }

    private String getString(Map<String, Object> map, String key, String fallback) {
        Object value = map.get(key);
        return value instanceof String s ? s : fallback;
    }

    private boolean getBoolean(Map<String, Object> map, String key, boolean fallback) {
        Object value = map.get(key);
        return value instanceof Boolean b ? b : fallback;
    }

    private double getDouble(Map<String, Object> map, String key, double fallback) {
        Object value = map.get(key);
        if (value instanceof Number n) {
            return n.doubleValue();
        }
        return fallback;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private double round4(double value) {
        return Math.round(value * 10000.0) / 10000.0;
    }

    private String mapRiskTolerance(double riskTolerance) {
        if (riskTolerance < 0.34) return "low";
        if (riskTolerance < 0.67) return "medium";
        return "high";
    }
}