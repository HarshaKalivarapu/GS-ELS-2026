import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PortfolioRecommendation, PortfolioRequest } from "../../types";
import HeroSection from "./HeroSection";
import CalculatorForm from "./CalculatorForm";
import ResultsSection from "./ResultsSection";
import RiskMetricsSection from "./RiskMetricsSection";
import type { UserProfile } from "../../types/profile";

const SECTION_BGS = ["#ffffff", "#ffffff", "#0f172a", "#f8fafc"];

const pageVariants = {
  enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, y: 0 },
  exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -40 : 40 }),
};

const pageTrans = { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const };

function parseTickers(input: string): string[] {
  return input
    .split(/[,\s]+/)
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
}

type Props = {
  activeTab: string;
  onTabChange: (t: string) => void;
  initialSection?: number;
  onPortfolioSubmit?: (params: { tickers: string[]; investmentAmount: number; horizonYears: number }) => void;
  profile?: UserProfile | null;
};

export default function Calculator({
  activeTab,
  onTabChange,
  initialSection = 0,
  onPortfolioSubmit,
  profile,
}: Props) {

  function mapRiskToleranceToNumber(
    risk: "low" | "medium" | "high" | null | undefined
  ): number {
    if (risk === "low") return 0.17;
    if (risk === "high") return 0.83;
    return 0.5;
  }

  const currentYear = new Date().getFullYear();
  const derivedAge = profile?.birthYear ? currentYear - profile.birthYear : null;
  const derivedHorizon =
    derivedAge && profile?.idealRetirementAge
      ? Math.max(profile.idealRetirementAge - derivedAge, 1)
      : 5;

  const [riskTolerance, setRiskTolerance] = useState(
    mapRiskToleranceToNumber(profile?.riskTolerance)
  );
  const [horizonYears, setHorizonYears] = useState(derivedHorizon);
  const [investmentAmount, setInvestmentAmount] = useState(
    profile?.monthlySavings ?? 10000
  );

  const [tickerText, setTickerText] = useState("VFIAX FXAIX SWPPX");
  // const [riskTolerance, setRiskTolerance] = useState(0.5);
  // const [horizonYears, setHorizonYears] = useState(5);
  // const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [result, setResult] = useState<PortfolioRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sectionIdx, setSectionIdx] = useState(initialSection);
  const [direction, setDirection] = useState(1);

  const busy = useRef(false);
  const idxRef = useRef(initialSection);
  const lastNavTimeRef = useRef(0);

  const tickers = useMemo(() => parseTickers(tickerText), [tickerText]);

  const maxSectionRef = useRef(1);
  maxSectionRef.current = result ? SECTION_BGS.length - 1 : 1;

  const goTo = useCallback((next: number) => {
    const cur = idxRef.current;
    if (next === cur || next < 0 || next > maxSectionRef.current || busy.current) {
      return;
    }

    busy.current = true;
    setDirection(next > cur ? 1 : -1);
    setSectionIdx(next);
    idxRef.current = next;

    setTimeout(() => {
      busy.current = false;
    }, 600);
  }, []);

  function handleSectionWheel(e: React.WheelEvent<HTMLDivElement>) {
    const container = e.currentTarget;
    if (busy.current) return;

    const now = Date.now();
    if (now - lastNavTimeRef.current < 650) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const remaining = scrollHeight - clientHeight - scrollTop;

    const atTop = scrollTop <= 24;
    const atBottom = remaining <= 24;
    const canScroll = scrollHeight > clientHeight + 4;

    if (e.deltaY > 0) {
      if (Math.abs(e.deltaY) < 25) return;
      if (canScroll && !atBottom) return;
      e.preventDefault();
      lastNavTimeRef.current = now;
      goTo(idxRef.current + 1);
    } else if (e.deltaY < 0) {
      if (Math.abs(e.deltaY) < 25) return;
      if (canScroll && !atTop) return;
      e.preventDefault();
      lastNavTimeRef.current = now;
      goTo(idxRef.current - 1);
    }
  }

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const age = profile?.birthYear ? currentYear - profile.birthYear : null;
    const horizon =
      age && profile?.idealRetirementAge
        ? Math.max(profile.idealRetirementAge - age, 1)
        : 5;

    setRiskTolerance(mapRiskToleranceToNumber(profile?.riskTolerance));
    setHorizonYears(horizon);
    setInvestmentAmount(profile?.monthlySavings ?? 10000);
  }, [profile]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "PageDown") goTo(idxRef.current + 1);
      if (e.key === "ArrowUp" || e.key === "PageUp") goTo(idxRef.current - 1);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

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
      onPortfolioSubmit?.({ tickers, investmentAmount, horizonYears });
      setTimeout(() => goTo(2), 100);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const pages = [
    <HeroSection key="hero" onStartCalculating={() => goTo(1)} />,
        <CalculatorForm
      key="form"
      tickerText={tickerText}
      tickers={tickers}
      riskTolerance={riskTolerance}
      horizonYears={horizonYears}
      investmentAmount={investmentAmount}
      loading={loading}
      error={error}
      activeTab={activeTab}
      onTabChange={onTabChange}
      onTickerChange={setTickerText}
      onRiskChange={setRiskTolerance}
      onHorizonChange={setHorizonYears}
      onAmountChange={setInvestmentAmount}
      onSubmit={handleRecommend}
      result={result}
      profile={profile}
    />,
    <ResultsSection
      key="results"
      result={result}
      investmentAmount={investmentAmount}
      horizonYears={horizonYears}
      onScrollToForm={() => goTo(1)}
    />,
    <RiskMetricsSection
      key="risk"
      result={result}
      investmentAmount={investmentAmount}
    />,
  ];

  return (
    <motion.div
      style={{ position: "fixed", inset: 0, overflow: "hidden" }}
      animate={{ backgroundColor: SECTION_BGS[sectionIdx] }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div
        style={{
          position: "fixed",
          right: 24,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          zIndex: 50,
        }}
      >
        {SECTION_BGS.slice(0, result ? SECTION_BGS.length : 2).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              padding: 0,
              background:
                i === sectionIdx
                  ? sectionIdx === 1 || sectionIdx === 3
                    ? "#2563eb"
                    : "#ffffff"
                  : sectionIdx === 1 || sectionIdx === 3
                  ? "rgba(37,99,235,0.25)"
                  : "rgba(255,255,255,0.35)",
              transition: "background 0.3s, transform 0.3s",
              transform: i === sectionIdx ? "scale(1.5)" : "scale(1)",
            }}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </div>

      <AnimatePresence custom={direction} mode="sync">
        <motion.div
          key={sectionIdx}
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={pageTrans}
          onWheel={handleSectionWheel}
          style={{
            position: "absolute",
            inset: 0,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {pages[sectionIdx]}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}