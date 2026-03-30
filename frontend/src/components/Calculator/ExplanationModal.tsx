import { motion, AnimatePresence } from "framer-motion";
import type { PortfolioExplanation } from "../../types/ai";

type Props = {
  open: boolean;
  loading: boolean;
  explanation: PortfolioExplanation | null;
  onClose: () => void;
};

export default function ExplanationModal({
  open,
  loading,
  explanation,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="ai-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="ai-modal"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <div className="ai-modal-header">
              <div>
                <p className="ai-modal-eyebrow">AI Explanation</p>
                <h3 className="ai-modal-title">Why this portfolio?</h3>
              </div>

              <button className="ai-modal-close" onClick={onClose} aria-label="Close">
                ×
              </button>
            </div>

            {loading && (
              <div className="ai-modal-loading">
                <div className="ai-modal-spinner" />
                <p>Generating explanation...</p>
              </div>
            )}

            {!loading && explanation && (
              <div className="ai-modal-body">
                <section>
                  <h4>Summary</h4>
                  <p>{explanation.summary}</p>
                </section>

                <section>
                  <h4>Risk</h4>
                  <p>{explanation.riskExplanation}</p>
                </section>

                <section>
                  <h4>Fund Selection</h4>
                  <p>{explanation.tickerExplanation}</p>
                </section>

                <section>
                  <h4>Tradeoffs</h4>
                  <ul className="ai-tradeoff-list">
                    {explanation.tradeoffs.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}