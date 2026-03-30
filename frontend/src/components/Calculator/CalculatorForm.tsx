import { motion } from "framer-motion";
import { useState } from "react";
import type { PortfolioRecommendation } from "../../types";
import type { UserProfile } from "../../types/profile";
import type { PortfolioExplanation } from "../../types/ai";
import { fetchPortfolioExplanation } from "./aiService";
import ExplanationModal from "./ExplanationModal";

type Props = {
  tickerText: string;
  tickers: string[];
  riskTolerance: number;
  horizonYears: number;
  investmentAmount: number;
  loading: boolean;
  error: string | null;
  activeTab: string;
  onTabChange: (t: string) => void;
  onTickerChange: (v: string) => void;
  onRiskChange: (v: number) => void;
  onHorizonChange: (v: number) => void;
  onAmountChange: (v: number) => void;
  onSubmit: () => void;
  result: PortfolioRecommendation | null;
  profile?: UserProfile | null;
};

function riskLabel(v: number): string {
  if (v < 0.34) return "Conservative";
  if (v < 0.67) return "Moderate";
  return "Aggressive";
}

function buildFallbackRecommendation(
  tickers: string[],
  investmentAmount: number,
  horizonYears: number,
  riskTolerance: number
) {
  const risk = riskLabel(riskTolerance);

  let expectedAnnualReturn = 0.07;
  if (risk === "Conservative") expectedAnnualReturn = 0.05;
  if (risk === "Aggressive") expectedAnnualReturn = 0.09;

  const projectedPortfolioValue = Math.round(
    investmentAmount * Math.pow(1 + expectedAnnualReturn, horizonYears)
  );

  const weight = tickers.length > 0 ? Number((100 / tickers.length).toFixed(2)) : 100;

  return {
    horizonYears,
    expectedAnnualReturn,
    projectedPortfolioValue,
    recommendedFundTickers: tickers.length > 0 ? tickers : ["VFIAX", "FXAIX", "SWPPX"],
    recommendedAllocations:
      tickers.length > 0
        ? tickers.map((ticker) => ({
            ticker,
            weight,
            category: "Fund",
          }))
        : [
            { ticker: "VFIAX", weight: 33.33, category: "Fund" },
            { ticker: "FXAIX", weight: 33.33, category: "Fund" },
            { ticker: "SWPPX", weight: 33.34, category: "Fund" },
          ],
  };
}

type RecommendationAllocation = {
  ticker: string;
  weight: number;
  category: string;
};

type RecommendationPayload = {
  horizonYears: number;
  expectedAnnualReturn: number;
  projectedPortfolioValue: number;
  recommendedFundTickers: string[];
  recommendedAllocations: RecommendationAllocation[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseAllocations(value: unknown): RecommendationAllocation[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) => {
      const ticker =
        typeof item.ticker === "string" ? item.ticker : "UNKNOWN";
      const weight =
        typeof item.weight === "number" ? item.weight : 0;
      const category =
        typeof item.category === "string" ? item.category : "Fund";

      return { ticker, weight, category };
    });
}

function getNumberField(obj: Record<string, unknown>, key: string): number | null {
  const value = obj[key];
  return typeof value === "number" ? value : null;
}

function getAllocationsField(obj: Record<string, unknown>): RecommendationAllocation[] {
  return parseAllocations(obj["allocations"]);
}

function mapRecommendation(
  result: PortfolioRecommendation,
  investmentAmount: number,
  horizonYears: number
): RecommendationPayload {
  const resultObj: Record<string, unknown> = result as unknown as Record<string, unknown>;

  const recommendedAllocations = getAllocationsField(resultObj);
  const recommendedFundTickers = recommendedAllocations.map((a) => a.ticker);

  const projectedPortfolioValue =
    getNumberField(resultObj, "futureValue") ?? investmentAmount;

  const expectedAnnualReturn =
    getNumberField(resultObj, "expectedReturn") ?? 0.07;

  return {
    horizonYears,
    expectedAnnualReturn,
    projectedPortfolioValue,
    recommendedFundTickers,
    recommendedAllocations,
  };
}
export default function CalculatorForm({
  tickerText,
  tickers,
  riskTolerance,
  horizonYears,
  investmentAmount,
  loading,
  error,
  activeTab,
  onTabChange,
  onTickerChange,
  onRiskChange,
  onHorizonChange,
  onAmountChange,
  onSubmit,
  result,
  profile,
}: Props) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<PortfolioExplanation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  async function handleOpenExplanation() {
    setShowExplanation(true);

    try {
      setAiLoading(true);
      setAiError(null);

      const recommendation = result
        ? mapRecommendation(result, investmentAmount, horizonYears)
        : buildFallbackRecommendation(
            tickers,
            investmentAmount,
            horizonYears,
            riskTolerance
          );

      const explanation = await fetchPortfolioExplanation({
        profile,
        recommendation,
      });

      setAiExplanation(explanation);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to generate explanation";

      console.error("AI explanation error:", message, e);
      setAiError(message);
      console.log(aiError)

      setAiExplanation({
        summary:
          "We could not generate the live AI explanation right now, so this is a fallback summary based on your current inputs.",
        riskExplanation:
          riskLabel(riskTolerance) === "Conservative"
            ? "This setup is conservative because it uses a lower-risk profile and a more cautious return assumption."
            : riskLabel(riskTolerance) === "Moderate"
            ? "This setup is moderate because it balances growth potential with a middle-of-the-road risk profile."
            : "This setup is aggressive because it assumes a higher-risk, higher-return profile over the selected time horizon.",
        tickerExplanation:
          tickers.length > 0
            ? `The selected funds (${tickers.join(", ")}) are being used as the basis for the recommendation and are weighted evenly in the fallback explanation.`
            : "The fallback explanation assumes a simple diversified mutual fund mix based on the default inputs.",
        tradeoffs: [
          "Higher expected returns usually come with more volatility.",
          "Longer horizons can better absorb short-term fluctuations.",
          "Using a small set of funds is simple, but may reduce diversification depending on what they hold.",
        ],
      });
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <section className="section-form">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          style={{ marginBottom: 48, display: "flex", justifyContent: "center" }}
        >
          <div className={`glass-tab-switch ${activeTab === "advanced" ? "switch-right" : "switch-left"}`}>
            <div className="glass-tab-slider" />
            <button
              type="button"
              className={`glass-tab-option ${activeTab === "calculator" ? "active" : ""}`}
              onClick={() => onTabChange("calculator")}
            >
              Calculator
            </button>
            <button
              type="button"
              className={`glass-tab-option ${activeTab === "advanced" ? "active" : ""}`}
              onClick={() => onTabChange("advanced")}
            >
              Advanced Analytics
            </button>
          </div>
        </motion.div>

        <div className="two-thirds-col">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ display: "flex", flexDirection: "column", gap: 28 }}
          >
            <p className="section-eyebrow-blue">Calculator Input</p>
            <h2 className="section-headline-dark" style={{ margin: 0 }}>
              Enter mutual funds and investment details
            </h2>
            <p className="section-subtext-muted" style={{ margin: 0 }}>
              Add one or more fund tickers, set your investment amount and time
              horizon. Returns are split equally across all selected funds.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
              {[
                "Beta sourced from live market data",
                "Analyze multiple funds simultaneously",
                "CAPM-powered expected return calculations",
              ].map((label, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.12 + 0.3 }}
                  style={{ display: "flex", alignItems: "center", gap: 14 }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "#2563eb",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#0f172a" }}>
                    {label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="calculator-card">
              <div className="calc-display calc-display-with-ai">
                <button
                  type="button"
                  className="calc-ai-help-btn"
                  onClick={handleOpenExplanation}
                  aria-label="Explain this portfolio"
                  title="Explain this portfolio"
                >
                  AI✨
                </button>

                <div className="calc-display-label">Portfolio Value</div>
                <div className="calc-display-value">
                  ${investmentAmount.toLocaleString()}
                </div>
                <div className="calc-display-sub">
                  {horizonYears}yr horizon &middot; {riskLabel(riskTolerance)} risk
                </div>
              </div>

              <div className="calc-field">
                <label className="calc-field-label">Fund Tickers</label>
                <input
                  className="calc-input"
                  value={tickerText}
                  onChange={(e) => onTickerChange(e.target.value)}
                  placeholder="VFIAX  FXAIX  SWPPX"
                />
              </div>

              <div className="calc-field">
                <label className="calc-field-label">Risk Tolerance</label>
                <div className="calc-risk-toggle">
                  {(["Conservative", "Moderate", "Aggressive"] as const).map((label) => (
                    <button
                      key={label}
                      type="button"
                      className={`calc-risk-btn${riskLabel(riskTolerance) === label ? " active" : ""}`}
                      onClick={() =>
                        onRiskChange(
                          label === "Conservative" ? 0.17 : label === "Moderate" ? 0.5 : 0.83
                        )
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="calc-inputs-row">
                <div className="calc-field" style={{ margin: 0 }}>
                  <label className="calc-field-label">Years</label>
                  <input
                    type="number"
                    className="calc-number-input"
                    min={1}
                    max={50}
                    value={horizonYears}
                    onChange={(e) => onHorizonChange(Number(e.target.value))}
                  />
                </div>
                <div className="calc-field" style={{ margin: 0 }}>
                  <label className="calc-field-label">Amount ($)</label>
                  <input
                    type="number"
                    className="calc-number-input"
                    min={0}
                    value={investmentAmount}
                    onChange={(e) => onAmountChange(Number(e.target.value))}
                  />
                </div>
              </div>

              <button
                className="pill-cta-white"
                onClick={onSubmit}
                disabled={loading || tickers.length === 0}
                style={{ width: "100%", justifyContent: "center", padding: "18px 28px", fontSize: "1.05rem" }}
              >
                {loading ? "Calculating..." : "Get future value"}
              </button>

              {error && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "14px 18px",
                    background: "rgba(254,242,242,0.08)",
                    border: "1px solid rgba(252,165,165,0.25)",
                    borderRadius: 14,
                    color: "#fca5a5",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>Error: </strong>
                  {error}
                </div>
              )}

            </div>
          </motion.div>
        </div>
      </div>

      <ExplanationModal
        open={showExplanation}
        loading={aiLoading}
        explanation={aiExplanation}
        onClose={() => setShowExplanation(false)}
      />
    </section>
  );
}