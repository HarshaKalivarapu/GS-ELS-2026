package com.gs.mutualfundcalc.service;

import com.gs.mutualfundcalc.dto.PortfolioPresetRequest;
import com.gs.mutualfundcalc.dto.PortfolioPresetResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class PortfolioPresetService {

    public PortfolioPresetResponse recommendPreset(PortfolioPresetRequest req) {
        String risk = normalizeRisk(req.riskTolerance());
        String goal = lower(req.lifeGoal());
        String exp = lower(req.investorExperience());

        boolean wantsSimplicity =
                exp.contains("casual") ||
                exp.contains("beginner") ||
                goal.contains("simple") ||
                goal.contains("balanced");

        boolean wantsGrowthTilt =
                goal.contains("growth") ||
                goal.contains("tech") ||
                goal.contains("aggressive") ||
                goal.contains("maximize") ||
                exp.contains("experienced");

        boolean wantsIncome =
                goal.contains("income") ||
                goal.contains("preserve") ||
                goal.contains("stability") ||
                goal.contains("lower risk");

        if (risk.equals("low") && wantsIncome) {
            return new PortfolioPresetResponse(
                    "Conservative Income",
                    List.of("VTI", "BND", "AGG"),
                    List.of(0.30, 0.35, 0.35),
                    "low",
                    "This preset emphasizes capital preservation and lower volatility through a bond-heavy mix, while keeping some equity exposure for long-term growth."
            );
        }

        if (risk.equals("low")) {
            return new PortfolioPresetResponse(
                    "Conservative Core",
                    List.of("VTI", "VXUS", "BND"),
                    List.of(0.40, 0.20, 0.40),
                    "low",
                    "This preset is designed for lower risk tolerance, with meaningful bond exposure to reduce drawdowns while still keeping diversified stock exposure."
            );
        }

        if (risk.equals("high") && wantsGrowthTilt) {
            return new PortfolioPresetResponse(
                    "Growth Tilt",
                    List.of("VTI", "QQQM", "VXUS", "BND"),
                    List.of(0.50, 0.20, 0.20, 0.10),
                    "high",
                    "This preset adds a technology growth tilt through QQQM, while keeping broad U.S., international, and some bond exposure for diversification."
            );
        }

        if (risk.equals("high")) {
            return new PortfolioPresetResponse(
                    "Growth Core",
                    List.of("VTI", "VXUS"),
                    List.of(0.70, 0.30),
                    "high",
                    "This preset is built for long-horizon growth with all-equity exposure split between U.S. and international markets."
            );
        }

        if (wantsSimplicity) {
            return new PortfolioPresetResponse(
                    "Simple Balanced",
                    List.of("VBIAX", "VXUS"),
                    List.of(0.70, 0.30),
                    "medium",
                    "This preset keeps things simple with a balanced core fund plus international diversification, making it easier to understand and maintain."
            );
        }

        return new PortfolioPresetResponse(
                "Balanced Core",
                List.of("VTI", "VXUS", "BND"),
                List.of(0.60, 0.20, 0.20),
                "medium",
                "This preset balances growth and stability through broad U.S. equity, international diversification, and bonds."
        );
    }

    private String normalizeRisk(String risk) {
        String r = lower(risk);
        if (r.equals("low") || r.equals("medium") || r.equals("high")) {
            return r;
        }
        return "medium";
    }

    private String lower(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).trim();
    }
}