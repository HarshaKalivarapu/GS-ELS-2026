package com.gs.mutualfundcalc.dto.ai;

import java.util.List;

public class PortfolioExplanationRequest {
    private Profile profile;
    private Recommendation recommendation;

    public Profile getProfile() {
        return profile;
    }

    public void setProfile(Profile profile) {
        this.profile = profile;
    }

    public Recommendation getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(Recommendation recommendation) {
        this.recommendation = recommendation;
    }

    public static class Profile {
        private Integer birthYear;
        private Double income;
        private Double monthlySavings;
        private String jobTitle;
        private String industry;
        private String riskTolerance;
        private String lifeGoal;
        private Integer idealRetirementAge;
        private String investorExperience;

        public Integer getBirthYear() { return birthYear; }
        public void setBirthYear(Integer birthYear) { this.birthYear = birthYear; }

        public Double getIncome() { return income; }
        public void setIncome(Double income) { this.income = income; }

        public Double getMonthlySavings() { return monthlySavings; }
        public void setMonthlySavings(Double monthlySavings) { this.monthlySavings = monthlySavings; }

        public String getJobTitle() { return jobTitle; }
        public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

        public String getIndustry() { return industry; }
        public void setIndustry(String industry) { this.industry = industry; }

        public String getRiskTolerance() { return riskTolerance; }
        public void setRiskTolerance(String riskTolerance) { this.riskTolerance = riskTolerance; }

        public String getLifeGoal() { return lifeGoal; }
        public void setLifeGoal(String lifeGoal) { this.lifeGoal = lifeGoal; }

        public Integer getIdealRetirementAge() { return idealRetirementAge; }
        public void setIdealRetirementAge(Integer idealRetirementAge) { this.idealRetirementAge = idealRetirementAge; }

        public String getInvestorExperience() { return investorExperience; }
        public void setInvestorExperience(String investorExperience) { this.investorExperience = investorExperience; }
    }

    public static class Recommendation {
        private Integer horizonYears;
        private Double expectedAnnualReturn;
        private Double projectedPortfolioValue;
        private List<String> recommendedFundTickers;
        private List<Allocation> recommendedAllocations;

        public Integer getHorizonYears() { return horizonYears; }
        public void setHorizonYears(Integer horizonYears) { this.horizonYears = horizonYears; }

        public Double getExpectedAnnualReturn() { return expectedAnnualReturn; }
        public void setExpectedAnnualReturn(Double expectedAnnualReturn) { this.expectedAnnualReturn = expectedAnnualReturn; }

        public Double getProjectedPortfolioValue() { return projectedPortfolioValue; }
        public void setProjectedPortfolioValue(Double projectedPortfolioValue) { this.projectedPortfolioValue = projectedPortfolioValue; }

        public List<String> getRecommendedFundTickers() { return recommendedFundTickers; }
        public void setRecommendedFundTickers(List<String> recommendedFundTickers) { this.recommendedFundTickers = recommendedFundTickers; }

        public List<Allocation> getRecommendedAllocations() { return recommendedAllocations; }
        public void setRecommendedAllocations(List<Allocation> recommendedAllocations) { this.recommendedAllocations = recommendedAllocations; }
    }

    public static class Allocation {
        private String ticker;
        private Double weight;
        private String category;

        public String getTicker() { return ticker; }
        public void setTicker(String ticker) { this.ticker = ticker; }

        public Double getWeight() { return weight; }
        public void setWeight(Double weight) { this.weight = weight; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }
}