import { motion } from "framer-motion";

type Props = {
  text?: string;
};

export default function LoadingScreen({ text = "Loading..." }: Props) {
  return (
    <div className="app-loading-screen">
      <motion.div
        className="app-loading-content"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className="app-loading-spinner"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear",
          }}
        />
        <p className="app-loading-text">{text}</p>
      </motion.div>
    </div>
  );
}