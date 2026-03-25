import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { AnalyticsRequest, MonteCarloPoint, ScenarioResult } from "../../types";

type Props = {
  onTabChange: (t: string) => void;
  analyticsParams: AnalyticsRequest;
};

export default function Analytics({ onTabChange, analyticsParams }: Props) {
  const [mcData, setMcData] = useState<MonteCarloPoint[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const body = JSON.stringify(analyticsParams);
    const headers = { "Content-Type": "application/json" };

    Promise.all([
      fetch("/api/analytics/montecarlo", { method: "POST", headers, body }).then(r => r.json()),
      fetch("/api/analytics/scenarios",  { method: "POST", headers, body }).then(r => r.json()),
    ])
      .then(([mc, sc]) => {
        setMcData(mc.data ?? []);
        setScenarios(sc.scenarios ?? []);
      })
      .catch(() => {/* keep empty state on error */})
      .finally(() => setLoading(false));
  }, [analyticsParams]);

  return (
    <section className="section-analytics">
      <div className="section-inner">

      {/* Tab switcher */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        style={{ marginBottom: 48, display: "flex", justifyContent: "center" }}
      >
        <div className="glass-tab-switch switch-right">
          <div className="glass-tab-slider" />
          <button
            type="button"
            className="glass-tab-option"
            onClick={() => onTabChange("calculator")}
          >
            Calculator
          </button>
          <button type="button" className="glass-tab-option active">
            Advanced Analytics
          </button>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ marginBottom: 56 }}
      >
        <p className="section-eyebrow-blue">Advanced Analytics</p>
        <h2 className="section-headline-dark" style={{ margin: "0 0 12px" }}>
          Deep portfolio insights
        </h2>
        <p className="section-subtext-muted" style={{ maxWidth: 520 }}>
          Monte Carlo simulation, scenario analysis, benchmark comparison,
          and AI-driven explanations.
        </p>
      </motion.div>

      {/* Two-column grid */}
      <div className="analytics-grid">

        {/* Monte Carlo chart card */}
        <motion.div
          className="analytics-chart-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          <p className="risk-card-label">Monte Carlo Simulation</p>
          <span className="risk-badge-blue">1,000 simulations · {analyticsParams.horizonYears}-year horizon</span>

          <div style={{ flex: 1, minHeight: 0 }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: 14 }}>
                Loading simulation…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mcData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis
                    dataKey="year"
                    tickFormatter={(v) => `Yr ${v}`}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 12,
                      fontSize: 12,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    }}
                    formatter={(value, name) => [
                      typeof value === "number"
                        ? value.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          })
                        : String(value ?? ""),
                      name === "p95"
                        ? "95th Percentile"
                        : name === "median"
                        ? "Median"
                        : "5th Percentile",
                    ]}
                    labelFormatter={(l) => `Year ${l}`}
                  />
                  <Line type="monotone" dataKey="p95" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="median" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="p5" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { color: "#22c55e", label: "95th Percentile" },
              { color: "#2563eb", label: "Median" },
              { color: "#ef4444", label: "5th Percentile" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scenario cards */}
        <div className="scenario-cards-col">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: 14 }}>
              Loading scenarios…
            </div>
          ) : (
            scenarios.map((s, i) => (
              <motion.div
                key={s.id}
                className={`scenario-card${s.featured ? " scenario-card--featured" : ""}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 + i * 0.08 }}
              >
                <p className={`risk-card-label${s.featured ? " risk-card-label--white" : ""}`}>
                  {s.label}
                </p>
                <span className={s.badgeClass}>{s.badge}</span>
                <p className={`analytics-scenario-value${s.featured ? " scenario-value-white" : " scenario-value-dark"}`}>
                  {s.value}
                </p>
                <p className={`risk-card-desc${s.featured ? " risk-card-desc--white" : ""}`}>
                  {s.desc}
                </p>
              </motion.div>
            ))
          )}
        </div>

      </div>
      </div>
    </section>
  );
}
