package com.gs.mutualfundcalc.service;

import com.gs.mutualfundcalc.dto.FundDto;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PortfolioAllocationService {

    public Map<String, Double> allocate(
            List<FundDto> funds,
            String riskTolerance
    ) {
        if (funds == null || funds.isEmpty()) {
            return Map.of();
        }

        double equityTarget;
        double bondTarget;

        switch (riskTolerance == null ? "medium" : riskTolerance.toLowerCase()) {
            case "low" -> {
                equityTarget = 0.4;
                bondTarget = 0.6;
            }
            case "high" -> {
                equityTarget = 0.9;
                bondTarget = 0.1;
            }
            default -> {
                equityTarget = 0.7;
                bondTarget = 0.3;
            }
        }

        Map<String, List<FundDto>> byCategory = funds.stream()
                .collect(Collectors.groupingBy(FundDto::category));

        List<FundDto> equities = byCategory.getOrDefault("Equity", List.of());
        List<FundDto> bonds = byCategory.getOrDefault("Fixed Income", List.of());

        Map<String, Double> weights = new HashMap<>();

        boolean hasEquities = !equities.isEmpty();
        boolean hasBonds = !bonds.isEmpty();

        // Case 1: both categories present -> use target split normally
        if (hasEquities && hasBonds) {
            double equityPerFund = equityTarget / equities.size();
            for (FundDto f : equities) {
                weights.put(f.symbol(), equityPerFund);
            }

            double bondPerFund = bondTarget / bonds.size();
            for (FundDto f : bonds) {
                weights.put(f.symbol(), bondPerFund);
            }

            return weights;
        }

        // Case 2: only equities selected -> normalize equities to 100%
        if (hasEquities) {
            double perFund = 1.0 / equities.size();
            for (FundDto f : equities) {
                weights.put(f.symbol(), perFund);
            }
            return weights;
        }

        // Case 3: only bonds selected -> normalize bonds to 100%
        if (hasBonds) {
            double perFund = 1.0 / bonds.size();
            for (FundDto f : bonds) {
                weights.put(f.symbol(), perFund);
            }
            return weights;
        }

        // Case 4: fallback for other categories (international, balanced, etc.)
        double perFund = 1.0 / funds.size();
        for (FundDto f : funds) {
            weights.put(f.symbol(), perFund);
        }

        return weights;
    }
}