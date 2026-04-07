package com.gs.mutualfundcalc.dto;

public record PortfolioPresetRequest(
    Integer birthYear,
    Double income,
    Double monthlySavings,
    String jobTitle,
    String industry,
    String riskTolerance,
    String lifeGoal,
    Integer idealRetirementAge,
    String investorExperience
) {}