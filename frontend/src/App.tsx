import { useMemo, useState } from "react";
import "./App.css";

type Allocation = { ticker: string; weight: number };

type PortfolioRequest = {
  tickers: string[];
  riskTolerance: number; // 0..1
  horizonYears: number;
  investmentAmount: number;
};

type PortfolioRecommendation = {
  allocations: Allocation[];
  expectedReturn: number;
  volatility: number;
  explanation: string;
};

function parseTickers(input: string): string[] {
  return input
    .split(/[,\s]+/)
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
}

export default function App() {
  const [tickerText, setTickerText] = useState("AAPL MSFT VTI");
  const [riskTolerance, setRiskTolerance] = useState(0.5);
  const [horizonYears, setHorizonYears] = useState(5);
  const [investmentAmount, setInvestmentAmount] = useState(10000);

  const tickers = useMemo(() => parseTickers(tickerText), [tickerText]);

  const [result, setResult] = useState<PortfolioRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRecommend() {
    setLoading(true);
    setError(null);
    setResult(null);

    const payload: PortfolioRequest = {
      tickers,
      riskTolerance,
      horizonYears,
      investmentAmount,
    };

    try {
      const res = await fetch("/api/portfolio/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }

      const data = (await res.json()) as PortfolioRecommendation;
      setResult(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>AI Portfolio Optimizer</h1>
      <p style={{ marginTop: 4, opacity: 0.8 }}>
        Input tickers + risk profile → get allocation + risk summary.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Tickers (space or comma separated)</span>
          <input
            value={tickerText}
            onChange={(e) => setTickerText(e.target.value)}
            placeholder="AAPL MSFT VTI"
          />
          <small style={{ opacity: 0.7 }}>
            Parsed: {tickers.length ? tickers.join(", ") : "(none)"}
          </small>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Risk tolerance: {riskTolerance.toFixed(2)}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={riskTolerance}
            onChange={(e) => setRiskTolerance(Number(e.target.value))}
          />
          <small style={{ opacity: 0.7 }}>0 = conservative, 1 = aggressive</small>
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Horizon (years)</span>
            <input
              type="number"
              min={1}
              max={50}
              value={horizonYears}
              onChange={(e) => setHorizonYears(Number(e.target.value))}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Investment amount ($)</span>
            <input
              type="number"
              min={0}
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
            />
          </label>
        </div>

        <button
          onClick={handleRecommend}
          disabled={loading || tickers.length === 0}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          {loading ? "Generating..." : "Get recommendation"}
        </button>

        {error && (
          <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
            <strong>Error:</strong> <span>{error}</span>
          </div>
        )}

        {result && (
          <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
            <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
              <h2 style={{ marginTop: 0 }}>Allocation</h2>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {result.allocations.map((a) => (
                  <li key={a.ticker}>
                    {a.ticker}: {(a.weight * 100).toFixed(1)}%
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
                <div style={{ opacity: 0.7 }}>Expected return</div>
                <div style={{ fontSize: 22 }}>
                  {(result.expectedReturn * 100).toFixed(1)}%
                </div>
              </div>
              <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
                <div style={{ opacity: 0.7 }}>Volatility</div>
                <div style={{ fontSize: 22 }}>
                  {(result.volatility * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
              <h2 style={{ marginTop: 0 }}>Why this portfolio</h2>
              <p style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                {result.explanation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}