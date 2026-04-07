import { AnimatePresence, motion } from "framer-motion";

type Props = {
  open: boolean;
  title: string;
  body: string;
  onClose: () => void;
};

export default function StressExplanationModal({
  open,
  title,
  body,
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
                <h3 className="ai-modal-title">{title}</h3>
              </div>

              <button className="ai-modal-close" onClick={onClose} aria-label="Close">
                ×
              </button>
            </div>

            <div className="ai-modal-body">
              <section>
                <p>{body}</p>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}