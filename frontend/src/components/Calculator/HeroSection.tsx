import { useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

const MOCK_DATA = [
  { year: "Y0", value: 10000 },
  { year: "Y2", value: 12100 },
  { year: "Y4", value: 14641 },
  { year: "Y6", value: 17716 },
  { year: "Y8", value: 21436 },
  { year: "Y10", value: 25937 },
];

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function AnimatedNumber({ value, formatter }: { value: number; formatter: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1800, bounce: 0 });
  const display = useTransform(spring, formatter);
  if (inView) motionValue.set(value);
  return <motion.span ref={ref}>{display}</motion.span>;
}

type Props = {
  onStartCalculating: () => void;
};

export default function HeroSection({ onStartCalculating }: Props) {
  return (
    <section className="section-hero">
      <div className="section-inner">
        <div className="hero-two-col">

          {/* Left: Eyebrow + Headline + Subtext + CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <motion.p
              className="hero-eyebrow-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              CAPM-Based Forecasting
            </motion.p>
            <motion.h1
              className="hero-headline-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              Estimate future value across mutual funds
            </motion.h1>
            <motion.p
              className="hero-subtext-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              style={{ margin: 0 }}
            >
              Input tickers, investment amount, and time horizon to forecast
              returns using beta and the CAPM formula.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
            >
              <button className="pill-cta-white" onClick={onStartCalculating}>
                Start calculating
              </button>
            </motion.div>
          </div>

          {/* Right: Frosted glass preview card */}
          <motion.div
            className="hero-chart-wrap"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
          >
            <p className="hero-chart-label">Portfolio Preview</p>
            <p className="hero-chart-value">
              <AnimatedNumber value={25937} formatter={fmt} />
            </p>
            <span className="hero-chart-badge">↑ +159.4% over 10 years</span>
            <div style={{ marginTop: 20, background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: "12px 4px 4px" }}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={MOCK_DATA} margin={{ left: 4, right: 4, top: 4, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      background: "rgba(15,23,42,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 12,
                    }}
                    formatter={(v) =>
                      typeof v === "number"
                        ? v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
                        : String(v)
                    }
                  />
                  <Line
                    type="linear"
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={1800}
                    animationEasing="ease-out"
                    animationBegin={200}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      </div>

      <button
        className="scroll-indicator"
        onClick={onStartCalculating}
        aria-label="Scroll down"
      >
        <span className="scroll-indicator-text">Scroll</span>
        <span className="scroll-indicator-arrow">↓</span>
      </button>
    </section>
  );
}
