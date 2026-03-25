package com.gs.mutualfundcalc.dto;

import java.util.List;

public record ScenariosResponse(List<Scenario> scenarios) {

    // Matches the shape the Analytics frontend expects
    public record Scenario(
        String id,
        String label,
        String badge,
        String badgeClass,
        String value,       // formatted string e.g. "+8.7%"
        String desc,
        boolean featured
    ) {}
}
