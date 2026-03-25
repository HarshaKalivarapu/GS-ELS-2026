import { useState } from "react";
import "./App.css";
import Calculator from "./components/Calculator";
import Analytics from "./components/Analytics";
import type { AnalyticsRequest } from "./types";

// Default params used in Analytics before the user runs a calculation
const DEFAULT_ANALYTICS: AnalyticsRequest = {
  tickers: ["VFIAX", "FXAIX", "SWPPX"],
  investmentAmount: 10_000,
  horizonYears: 10,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"calculator" | "advanced">("calculator");
  const [calcInitialSection, setCalcInitialSection] = useState(0);
  const [analyticsParams, setAnalyticsParams] = useState<AnalyticsRequest>(DEFAULT_ANALYTICS);

  const handleTabChange = (t: string) => {
    if (t === "calculator") setCalcInitialSection(1);
    setActiveTab(t as "calculator" | "advanced");
  };

  // Called by Calculator on submit — keeps Analytics in sync with the user's portfolio
  const handlePortfolioSubmit = (params: AnalyticsRequest) => {
    setAnalyticsParams(params);
  };

  return (
    <div className="app-shell">
      <main>
        {activeTab === "calculator" && (
          <Calculator
            activeTab={activeTab}
            onTabChange={handleTabChange}
            initialSection={calcInitialSection}
            onPortfolioSubmit={handlePortfolioSubmit}
          />
        )}
        {activeTab === "advanced" && (
          <div style={{ position: "fixed", inset: 0, background: "#f8fafc", overflowY: "auto" }}>
            <Analytics onTabChange={handleTabChange} analyticsParams={analyticsParams} />
          </div>
        )}
      </main>
    </div>
  );
}
