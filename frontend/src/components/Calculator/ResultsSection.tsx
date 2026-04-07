import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PortfolioRecommendation } from "../../types";

function AnimatedNumber({ value, formatter }: { value: number; formatter: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1800, bounce: 0 });
  const display = useTransform(spring, (v) => formatter(Math.round(v)));

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

const FUND_COLORS = [
  "#60a5fa",
  "#34d399",
  "#f472b6",
  "#fbbf24",
  "#a78bfa",
  "#fb923c",
];

function buildChartData(
  funds: PortfolioRecommendation["funds"],
  horizonYears: number
): Record<string, number | string>[] {
  const points: Record<string, number | string>[] = [];
  for (let y = 0; y <= horizonYears; y++) {
    const row: Record<string, number | string> = { year: `Y${y}` };
    for (const fund of funds) {
      const rate = fund.capmRate > 0 ? fund.capmRate : fund.expectedReturnRate;
      row[fund.ticker] = Math.round(fund.principal * Math.pow(1 + rate, y));
    }
    points.push(row);
  }
  return points;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

type Props = {
  result: PortfolioRecommendation | null;
  investmentAmount: number;
  horizonYears: number;
  onScrollToForm: () => void;
};

export default function ResultsSection({
  result,
  investmentAmount,
  horizonYears,
  onScrollToForm,
}: Props) {
  if (!result) {
    return (
      <section
        className="section-results"
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", maxWidth: 480 }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: 20 }}
          >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>

          <h2
            style={{
              color: "#ffffff",
              fontSize: "1.8rem",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              marginBottom: 12,
            }}
          >
            Your forecast will appear here
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "1rem",
              lineHeight: 1.7,
              marginBottom: 28,
            }}
          >
            Enter your tickers and investment details above to see a full portfolio growth
            projection.
          </p>

          <button className="pill-cta-white" onClick={onScrollToForm}>
            Enter details above
          </button>
        </motion.div>
      </section>
    );
  }

  const chartData = buildChartData(result.funds, horizonYears);
  const totalReturn = result.totalFutureValue - investmentAmount;
  const totalReturnPct = ((totalReturn / investmentAmount) * 100).toFixed(1);
  const cagr = (
    (Math.pow(result.totalFutureValue / investmentAmount, 1 / horizonYears) - 1) * 100
  ).toFixed(2);

  return (
    <section className="section-results">
      <div className="section-inner">
        <div className="s3-two-col" style={{ marginBottom: 24 }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <p className="section-eyebrow-muted">Your Forecast</p>

            <h2 className="section-headline-white" style={{ margin: 0 }}>
              Portfolio growth projection
            </h2>

            <p
              style={{
                fontSize: "clamp(2.8rem, 4.5vw, 4rem)",
                fontWeight: 800,
                letterSpacing: "-0.05em",
                lineHeight: 1,
                color: "#ffffff",
                margin: 0,
              }}
            >
              <AnimatedNumber value={result.totalFutureValue} formatter={fmt} />
            </p>

            <div>
              {[
                { label: "Total invested", value: fmt(investmentAmount), color: "#ffffff" },
                {
                  label: "Total return",
                  value: `+${fmt(totalReturn)} (${totalReturnPct}%)`,
                  color: "#4ade80",
                },
                { label: "CAGR", value: `${cagr}%`, color: "#ffffff" },
                { label: "Horizon", value: `${horizonYears} years`, color: "#ffffff" },
              ].map(({ label, value, color }, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "rgba(255,255,255,0.4)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    {label}
                  </span>

                  <span
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="chart-wrap-dark"
          >
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "0.72rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 20,
              }}
            >
              Growth Projection (Y0 → Y{horizonYears})
            </p>

            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                <XAxis
                  dataKey="year"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)}
                />

                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 12,
                  }}
                  formatter={(v) => (typeof v === "number" ? fmt(v) : String(v))}
                />

                <Legend
                  wrapperStyle={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 12,
                  }}
                />

                {result.funds.map((fund, i) => (
                  <Line
                    key={fund.ticker}
                    type="monotone"
                    dataKey={fund.ticker}
                    stroke={FUND_COLORS[i % FUND_COLORS.length]}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div
          style={{
            marginBottom: 28,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
            padding: 18,
          }}
        >
          <p
            style={{
              margin: "0 0 14px",
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.78rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Portfolio Weights
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            {result.funds.map((fund, i) => (
              <div
                key={fund.ticker}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 800,
                    color: FUND_COLORS[i % FUND_COLORS.length],
                    marginBottom: 6,
                  }}
                >
                  {fund.ticker}
                </div>

                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "#ffffff",
                    marginBottom: 4,
                  }}
                >
                  {(fund.weight * 100).toFixed(0)}%
                </div>

                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  {fmt(fund.principal)} allocated
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="metric-grid">
          {result.funds.map((fund, i) => (
            <motion.div
              key={fund.ticker}
              className="metric-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.07 }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  color: FUND_COLORS[i % FUND_COLORS.length],
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px",
                }}
              >
                {fund.ticker}
              </p>

              <p className="metric-card-label">Future Value</p>

              <p className="metric-card-value">
                <AnimatedNumber value={fund.futureValue} formatter={fmt} />
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {[
                  `${(fund.weight * 100).toFixed(0)}% weight`,
                  `β ${fund.beta.toFixed(2)}`,
                  `CAPM ${(fund.capmRate * 100).toFixed(1)}%`,
                  `Ret. ${(fund.expectedReturnRate * 100).toFixed(1)}%`,
                ].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: 9999,
                      padding: "3px 10px",
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.55)",
                      fontWeight: 600,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}