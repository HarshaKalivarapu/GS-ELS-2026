import { motion } from "framer-motion";

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
};

function riskLabel(v: number): string {
  if (v < 0.34) return "Conservative";
  if (v < 0.67) return "Moderate";
  return "Aggressive";
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
}: Props) {
  return (
    <section className="section-form">
      <div className="section-inner">

        {/* Tab switcher */}
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

          {/* Left: Context copy + numbered steps */}
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
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "#2563eb", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

          {/* Right: Form card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="calculator-card">

              {/* Display screen */}
              <div className="calc-display">
                <div className="calc-display-label">Portfolio Value</div>
                <div className="calc-display-value">
                  ${investmentAmount.toLocaleString()}
                </div>
                <div className="calc-display-sub">
                  {horizonYears}yr horizon &middot; {riskLabel(riskTolerance)} risk
                </div>
              </div>

              {/* Ticker input */}
              <div className="calc-field">
                <label className="calc-field-label">Fund Tickers</label>
                <input
                  className="calc-input"
                  value={tickerText}
                  onChange={(e) => onTickerChange(e.target.value)}
                  placeholder="VFIAX  FXAIX  SWPPX"
                />
              </div>

              {/* Risk tolerance toggle */}
              <div className="calc-field">
                <label className="calc-field-label">Risk Tolerance</label>
                <div className="calc-risk-toggle">
                  {(["Conservative", "Moderate", "Aggressive"] as const).map((label) => (
                    <button
                      key={label}
                      type="button"
                      className={`calc-risk-btn${riskLabel(riskTolerance) === label ? " active" : ""}`}
                      onClick={() => onRiskChange(label === "Conservative" ? 0.17 : label === "Moderate" ? 0.5 : 0.83)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Horizon + Amount */}
              <div className="calc-inputs-row">
                <div className="calc-field" style={{ margin: 0 }}>
                  <label className="calc-field-label">Years</label>
                  <input
                    type="number"
                    className="calc-number-input"
                    min={1} max={50}
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
                <div style={{
                  marginTop: 16, padding: "14px 18px",
                  background: "rgba(254,242,242,0.08)", border: "1px solid rgba(252,165,165,0.25)",
                  borderRadius: 14, color: "#fca5a5", fontSize: "0.9rem",
                }}>
                  <strong>Error: </strong>{error}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
