import { useState } from "react";
import "./App.css";
import Calculator from "./components/Calculator";
import Analytics from "./components/Analytics";

export default function App() {
  const [activeTab, setActiveTab] = useState<"calculator" | "advanced">("calculator");
  const [calcInitialSection, setCalcInitialSection] = useState(0);

  const handleTabChange = (t: string) => {
    if (t === "calculator") setCalcInitialSection(1);
    setActiveTab(t as "calculator" | "advanced");
  };

  return (
    <div className="app-shell">
      <main>
        {activeTab === "calculator" && (
          <Calculator activeTab={activeTab} onTabChange={handleTabChange} initialSection={calcInitialSection} />
        )}
        {activeTab === "advanced" && (
          <div style={{ position: "fixed", inset: 0, background: "#f8fafc", overflowY: "auto" }}>
            <Analytics onTabChange={handleTabChange} />
          </div>
        )}
      </main>
    </div>
  );
}
