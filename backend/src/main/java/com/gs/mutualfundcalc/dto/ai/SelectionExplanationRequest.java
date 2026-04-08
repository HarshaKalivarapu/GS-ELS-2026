package com.gs.mutualfundcalc.dto.ai;

import java.util.List;
import java.util.Map;

public class SelectionExplanationRequest {
    private String selectedText;
    private String userQuestion;
    private String currentScreen;

    // Unified context
    private Profile profile;
    private PortfolioInputs portfolioInputs;
    private PortfolioResult portfolioResult;
    private RiskMetrics riskMetrics;
    private AnalyticsContext analytics;

    // ── Getters & Setters ─────────────────────────────────────────────

    public String getSelectedText() { return selectedText; }
    public void setSelectedText(String selectedText) { this.selectedText = selectedText; }

    public String getUserQuestion() { return userQuestion; }
    public void setUserQuestion(String userQuestion) { this.userQuestion = userQuestion; }

    public String getCurrentScreen() { return currentScreen; }
    public void setCurrentScreen(String currentScreen) { this.currentScreen = currentScreen; }

    public Profile getProfile() { return profile; }
    public void setProfile(Profile profile) { this.profile = profile; }

    public PortfolioInputs getPortfolioInputs() { return portfolioInputs; }
    public void setPortfolioInputs(PortfolioInputs portfolioInputs) { this.portfolioInputs = portfolioInputs; }

    public PortfolioResult getPortfolioResult() { return portfolioResult; }
    public void setPortfolioResult(PortfolioResult portfolioResult) { this.portfolioResult = portfolioResult; }

    public RiskMetrics getRiskMetrics() { return riskMetrics; }
    public void setRiskMetrics(RiskMetrics riskMetrics) { this.riskMetrics = riskMetrics; }

    public AnalyticsContext getAnalytics() { return analytics; }
    public void setAnalytics(AnalyticsContext analytics) { this.analytics = analytics; }

    // ── Nested types ──────────────────────────────────────────────────

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

    public static class PortfolioInputs {
        private List<String> tickers;
        private List<Double> weights;
        private double investmentAmount;
        private int horizonYears;
        private double riskTolerance;

        public List<String> getTickers() { return tickers; }
        public void setTickers(List<String> tickers) { this.tickers = tickers; }
        public List<Double> getWeights() { return weights; }
        public void setWeights(List<Double> weights) { this.weights = weights; }
        public double getInvestmentAmount() { return investmentAmount; }
        public void setInvestmentAmount(double investmentAmount) { this.investmentAmount = investmentAmount; }
        public int getHorizonYears() { return horizonYears; }
        public void setHorizonYears(int horizonYears) { this.horizonYears = horizonYears; }
        public double getRiskTolerance() { return riskTolerance; }
        public void setRiskTolerance(double riskTolerance) { this.riskTolerance = riskTolerance; }
    }

    public static class FundResult {
        private String ticker;
        private double principal;
        private double weight;
        private double beta;
        private double expectedReturnRate;
        private double capmRate;
        private double futureValue;
        private double futureValueAfterTax;
        private double taxOwed;

        public String getTicker() { return ticker; }
        public void setTicker(String ticker) { this.ticker = ticker; }
        public double getPrincipal() { return principal; }
        public void setPrincipal(double principal) { this.principal = principal; }
        public double getWeight() { return weight; }
        public void setWeight(double weight) { this.weight = weight; }
        public double getBeta() { return beta; }
        public void setBeta(double beta) { this.beta = beta; }
        public double getExpectedReturnRate() { return expectedReturnRate; }
        public void setExpectedReturnRate(double expectedReturnRate) { this.expectedReturnRate = expectedReturnRate; }
        public double getCapmRate() { return capmRate; }
        public void setCapmRate(double capmRate) { this.capmRate = capmRate; }
        public double getFutureValue() { return futureValue; }
        public void setFutureValue(double futureValue) { this.futureValue = futureValue; }
        public double getFutureValueAfterTax() { return futureValueAfterTax; }
        public void setFutureValueAfterTax(double futureValueAfterTax) { this.futureValueAfterTax = futureValueAfterTax; }
        public double getTaxOwed() { return taxOwed; }
        public void setTaxOwed(double taxOwed) { this.taxOwed = taxOwed; }
    }

    public static class PortfolioResult {
        private List<FundResult> funds;
        private double totalFutureValue;
        private double totalFutureValueAfterTax;
        private double totalTaxOwed;
        private double taxRate;

        public List<FundResult> getFunds() { return funds; }
        public void setFunds(List<FundResult> funds) { this.funds = funds; }
        public double getTotalFutureValue() { return totalFutureValue; }
        public void setTotalFutureValue(double totalFutureValue) { this.totalFutureValue = totalFutureValue; }
        public double getTotalFutureValueAfterTax() { return totalFutureValueAfterTax; }
        public void setTotalFutureValueAfterTax(double totalFutureValueAfterTax) { this.totalFutureValueAfterTax = totalFutureValueAfterTax; }
        public double getTotalTaxOwed() { return totalTaxOwed; }
        public void setTotalTaxOwed(double totalTaxOwed) { this.totalTaxOwed = totalTaxOwed; }
        public double getTaxRate() { return taxRate; }
        public void setTaxRate(double taxRate) { this.taxRate = taxRate; }
    }

    public static class RiskMetrics {
        private Double sharpeRatio;
        private Double var95;

        public Double getSharpeRatio() { return sharpeRatio; }
        public void setSharpeRatio(Double sharpeRatio) { this.sharpeRatio = sharpeRatio; }
        public Double getVar95() { return var95; }
        public void setVar95(Double var95) { this.var95 = var95; }
    }

    public static class AnalyticsContext {
        private List<MonteCarloPoint> monteCarlo;
        private List<ScenarioSummary> scenarios;
        private List<StressSummary> stressTests;

        public List<MonteCarloPoint> getMonteCarlo() { return monteCarlo; }
        public void setMonteCarlo(List<MonteCarloPoint> monteCarlo) { this.monteCarlo = monteCarlo; }
        public List<ScenarioSummary> getScenarios() { return scenarios; }
        public void setScenarios(List<ScenarioSummary> scenarios) { this.scenarios = scenarios; }
        public List<StressSummary> getStressTests() { return stressTests; }
        public void setStressTests(List<StressSummary> stressTests) { this.stressTests = stressTests; }
    }

    public static class MonteCarloPoint {
        private int year;
        private long p95;
        private long median;
        private long p5;

        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }
        public long getP95() { return p95; }
        public void setP95(long p95) { this.p95 = p95; }
        public long getMedian() { return median; }
        public void setMedian(long median) { this.median = median; }
        public long getP5() { return p5; }
        public void setP5(long p5) { this.p5 = p5; }
    }

    public static class ScenarioSummary {
        private String label;
        private String value;
        private String desc;

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
        public String getDesc() { return desc; }
        public void setDesc(String desc) { this.desc = desc; }
    }

    public static class StressSummary {
        private String label;
        private String period;
        private double marketDrawdownPct;
        private double portfolioDrawdownPct;
        private double startValue;
        private double troughValue;
        private double endValue;

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
        public double getMarketDrawdownPct() { return marketDrawdownPct; }
        public void setMarketDrawdownPct(double marketDrawdownPct) { this.marketDrawdownPct = marketDrawdownPct; }
        public double getPortfolioDrawdownPct() { return portfolioDrawdownPct; }
        public void setPortfolioDrawdownPct(double portfolioDrawdownPct) { this.portfolioDrawdownPct = portfolioDrawdownPct; }
        public double getStartValue() { return startValue; }
        public void setStartValue(double startValue) { this.startValue = startValue; }
        public double getTroughValue() { return troughValue; }
        public void setTroughValue(double troughValue) { this.troughValue = troughValue; }
        public double getEndValue() { return endValue; }
        public void setEndValue(double endValue) { this.endValue = endValue; }
    }
}
