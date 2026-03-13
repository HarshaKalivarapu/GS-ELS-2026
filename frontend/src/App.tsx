import { useEffect, useMemo, useState } from "react";
import "./App.css";

type PortfolioRequest = {
  tickers: string[];
  riskTolerance: number;
  horizonYears: number;
  investmentAmount: number;
};

type FundResult = {
  ticker: string;
  principal: number;
  beta: number;
  expectedReturnRate: number;
  capmRate: number;
  futureValue: number;
};

type PortfolioRecommendation = {
  funds: FundResult[];
  totalFutureValue: number;
  explanation: string;
};

function parseTickers(input: string): string[] {
  return input
    .split(/[,\s]+/)
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
}

export default function App() {
  const [tickerText, setTickerText] = useState("VFIAX FXAIX SWPPX");
  const [riskTolerance, setRiskTolerance] = useState(0.5);
  const [horizonYears, setHorizonYears] = useState(5);
  const [investmentAmount, setInvestmentAmount] = useState(10000);

  const [result, setResult] = useState<PortfolioRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [navOpacity, setNavOpacity] = useState(0);
  const [mouse, setMouse] = useState({ x: 50, y: 35 });

  const tickers = useMemo(() => parseTickers(tickerText), [tickerText]);

  useEffect(() => {
    const handleScroll = () => {
      const fadeStart = 120;
      const fadeEnd = 360;
      const scroll = window.scrollY;

      let opacity = 0;
      if (scroll > fadeStart) {
        opacity = Math.min((scroll - fadeStart) / (fadeEnd - fadeStart), 1);
      }
      setNavOpacity(opacity);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMouse({ x, y });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const heroStyle = useMemo(
    () => ({
      background: `
        radial-gradient(
          circle at ${mouse.x}% ${mouse.y}%,
          rgba(59, 130, 246, 0.24) 0%,
          rgba(59, 130, 246, 0.12) 18%,
          rgba(59, 130, 246, 0.04) 34%,
          rgba(245, 247, 251, 0.96) 62%
        ),
        linear-gradient(180deg, #f8fafc 0%, #eef2f7 56%, #e9eef5 100%)
      `,
    }),
    [mouse]
  );

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

  const scrollToOptimizer = () => {
    const el = document.getElementById("optimizer-section");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <header className="floating-nav" style={{ opacity: navOpacity }}>
        <div className="floating-nav-inner">
          <div className="nav-brand">
            <div className="nav-brand-mark">MF</div>
            <span>Mutual Fund Calculator</span>
          </div>

          <button className="nav-button" onClick={scrollToOptimizer}>
            Calculate
          </button>
        </div>
      </header>

      <section className="hero" style={heroStyle}>
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="hero-eyebrow">CAPM-based mutual fund forecasting</p>
            <h1>Estimate future value across one or more mutual funds</h1>
            <p className="hero-subtext">
              Input mutual fund tickers, your initial investment, and your time
              horizon to estimate future value using beta, historical return,
              and the CAPM formula.
            </p>

            <div className="hero-cta-row">
              <button className="primary-cta" onClick={scrollToOptimizer}>
                Start calculating
              </button>
              <div className="hero-mini-note">
                Try VFIAX, FXAIX, SWPPX, AGTHX
              </div>
            </div>
          </div>
        </div>

        <button
          className="scroll-indicator"
          onClick={scrollToOptimizer}
          aria-label="Scroll down"
        >
          <span className="scroll-indicator-text">Scroll</span>
          <span className="scroll-indicator-arrow">↓</span>
        </button>
      </section>

      <main id="optimizer-section" className="content-section">
        <section className="glass-card intro-card">
          <div className="intro-copy">
            <p className="eyebrow">Calculator input</p>
            <h2>Enter mutual funds and investment details</h2>
            <p className="intro-text">
              Add one or more mutual fund tickers, then enter your investment
              amount and time horizon. The total amount is split evenly across
              the selected funds.
            </p>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Mutual fund tickers</span>
              <input
                value={tickerText}
                onChange={(e) => setTickerText(e.target.value)}
                placeholder="VFIAX FXAIX SWPPX"
              />
              <small>
                Parsed: {tickers.length ? tickers.join(", ") : "(none)"}
              </small>
            </label>

            <label className="field">
              <span>Risk tolerance: {riskTolerance.toFixed(2)}</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(Number(e.target.value))}
              />
              <small>
                Included in the request for future extensibility. Current CAPM
                calculation may not use it directly.
              </small>
            </label>

            <div className="two-col">
              <label className="field">
                <span>Horizon (years)</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={horizonYears}
                  onChange={(e) => setHorizonYears(Number(e.target.value))}
                />
              </label>

              <label className="field">
                <span>Initial investment ($)</span>
                <input
                  type="number"
                  min={0}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                />
              </label>
            </div>

            <button
              className="action-button"
              onClick={handleRecommend}
              disabled={loading || tickers.length === 0}
            >
              {loading ? "Calculating..." : "Get future value"}
            </button>
          </div>
        </section>

        {error && (
          <section className="glass-card feedback-card error-card">
            <strong>Error</strong>
            <p>{error}</p>
          </section>
        )}

        {result && (
          <section className="results-grid">
            <article className="glass-card stat-card">
              <div className="stat-label">Total predicted future value</div>
              <div className="stat-value">
                {result.totalFutureValue.toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </article>

            {result.funds.map((fund) => (
              <article key={fund.ticker} className="glass-card result-card">
                <div className="card-top">
                  <h3>{fund.ticker}</h3>
                </div>

                <div className="tag-row">
                  <span className="soft-tag">
                    Principal:{" "}
                    {fund.principal.toLocaleString(undefined, {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="soft-tag">
                    Beta: {fund.beta.toFixed(2)}
                  </span>
                  <span className="soft-tag">
                    Expected Return: {(fund.expectedReturnRate * 100).toFixed(2)}%
                  </span>
                  <span className="soft-tag">
                    CAPM Rate: {(fund.capmRate * 100).toFixed(2)}%
                  </span>
                  <span className="soft-tag highlight-tag">
                    Future Value:{" "}
                    {fund.futureValue.toLocaleString(undefined, {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </article>
            ))}

            <article className="glass-card result-card">
              <div className="card-top">
                <h3>Explanation</h3>
              </div>
              <p className="explanation-text">{result.explanation}</p>
            </article>
          </section>
        )}
      </main>
    </div>
  );
}