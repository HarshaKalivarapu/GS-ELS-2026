import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PortfolioRecommendation } from "../../types";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function AllocationLegend({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
      {data.map((entry, i) => (
        <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: COLORS[i % COLORS.length],
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>
            {entry.name} <span style={{ color: "#94a3b8" }}>— {entry.value}%</span>
          </span>
        </div>
      ))}
    </div>
  );
}

const RISK_FREE_RATE = 0.045;
const MARKET_VOLATILITY = 0.15;

function calcVaR(funds: PortfolioRecommendation["funds"], amount: number): number {
  const weightedBeta =
    funds.reduce((sum, f) => sum + f.beta * f.weight, 0);

  return amount * weightedBeta * MARKET_VOLATILITY * 1.645;
}

function calcSharpe(funds: PortfolioRecommendation["funds"]): number {
  const weightedReturn =
    funds.reduce((sum, f) => sum + f.expectedReturnRate * f.weight, 0);

  const weightedBeta =
    funds.reduce((sum, f) => sum + f.beta * f.weight, 0);

  return (weightedReturn - RISK_FREE_RATE) / (weightedBeta * MARKET_VOLATILITY);
}

type Props = {
  result: PortfolioRecommendation | null;
  investmentAmount: number;
};

export default function RiskMetricsSection({ result, investmentAmount }: Props) {
  const var95 = result ? calcVaR(result.funds, investmentAmount) : null;
  const sharpe = result ? calcSharpe(result.funds) : null;
  const isGoodSharpe = sharpe !== null && sharpe >= 1;

  const pieData = result
    ? result.funds.map((f) => ({
        name: f.ticker,
        value: Math.round(f.weight * 100),
      }))
    : [];

  return (
    <section className="section-risk">
      <div className="section-inner" style={{ display: "flex", flexDirection: "column" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ marginBottom: 56 }}
        >
          <p className="section-eyebrow-blue">Risk Metrics</p>
          <h2 className="section-headline-dark" style={{ margin: "0 0 12px" }}>
            Portfolio risk analysis
          </h2>
          <p className="section-subtext-muted" style={{ maxWidth: 520 }}>
            Key risk indicators derived from your portfolio's weighted beta,
            weighted expected return, and a 4.5% risk-free rate assumption.
          </p>
        </motion.div>

        <div className="risk-cards-grid">
          <motion.div
            className="risk-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <p className="risk-card-label">Value at Risk (95%)</p>
            <span className="risk-badge-warning">1-year, 95% confidence</span>
            <p className="risk-card-value">
              {var95 !== null
                ? var95.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  })
                : "—"}
            </p>
            <p className="risk-card-desc">
              {var95 !== null
                ? "There is a 5% chance your portfolio could lose more than this amount in a single year under normal market conditions."
                : "Submit a calculation to see your portfolio's Value at Risk."}
            </p>
          </motion.div>

          <motion.div
            className="risk-card risk-card--tall"
            style={{ padding: 36 }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14 }}
          >
            <p className="risk-card-label">Portfolio Allocation</p>
            <p className="risk-card-desc">
              {result
                ? `Risk-based allocation across ${result.funds.length} fund${result.funds.length !== 1 ? "s" : ""}.`
                : "Submit a calculation to see your allocation breakdown."}
            </p>

            <div className="risk-card-chart">
              {result ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#ffffff",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 12,
                        fontSize: 12,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      }}
                      formatter={(v) => `${v}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      border: "16px solid #f1f5f9",
                    }}
                  />
                  <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0 }}>
                    Submit a calculation to see your allocation breakdown.
                  </p>
                </div>
              )}
            </div>

            {result && <AllocationLegend data={pieData} />}
          </motion.div>

          <motion.div
            className="risk-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            <p className="risk-card-label">Sharpe Ratio</p>
            <span className={isGoodSharpe ? "risk-badge-positive" : "risk-badge-warning"}>
              {sharpe !== null
                ? isGoodSharpe
                  ? "Good risk-adjusted return"
                  : "Moderate risk-adjusted return"
                : "Risk-adjusted return"}
            </span>
            <p className="risk-card-value">{sharpe !== null ? sharpe.toFixed(2) : "—"}</p>
            <p className="risk-card-desc">
              {sharpe !== null
                ? "Measures excess return per unit of risk. A ratio above 1.0 is generally considered good. Calculated using a 4.5% risk-free rate."
                : "Submit a calculation to see your portfolio's Sharpe Ratio."}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}