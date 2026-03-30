package com.gs.mutualfundcalc.dto.ai;

import java.util.List;

public class PortfolioExplanationResponse {
    private String summary;
    private String riskExplanation;
    private String tickerExplanation;
    private List<String> tradeoffs;

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getRiskExplanation() {
        return riskExplanation;
    }

    public void setRiskExplanation(String riskExplanation) {
        this.riskExplanation = riskExplanation;
    }

    public String getTickerExplanation() {
        return tickerExplanation;
    }

    public void setTickerExplanation(String tickerExplanation) {
        this.tickerExplanation = tickerExplanation;
    }

    public List<String> getTradeoffs() {
        return tradeoffs;
    }

    public void setTradeoffs(List<String> tradeoffs) {
        this.tradeoffs = tradeoffs;
    }
}