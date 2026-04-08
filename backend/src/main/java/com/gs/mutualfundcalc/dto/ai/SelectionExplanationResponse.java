package com.gs.mutualfundcalc.dto.ai;

public class SelectionExplanationResponse {
    private String explanation;

    public SelectionExplanationResponse() {}

    public SelectionExplanationResponse(String explanation) {
        this.explanation = explanation;
    }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
