import { useEffect, useState } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import "./App.css";
import Calculator from "./components/Calculator";
import Analytics from "./components/Analytics";
import type { AnalyticsRequest } from "./types";
import type { UserProfile } from "./types/profile";
import LoadingScreen from "./components/LoadingScreen";

import { getProfile } from "./services/profileService";
import CreateProfile from "./components/Profile/CreateProfile";

// Default params used in Analytics before the user runs a calculation
const DEFAULT_ANALYTICS: AnalyticsRequest = {
  tickers: ["VFIAX", "FXAIX", "SWPPX"],
  investmentAmount: 10_000,
  horizonYears: 10,
};

export default function App() {
  const { isLoaded, isSignedIn, user } = useUser();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [activeTab, setActiveTab] = useState<"calculator" | "advanced">("calculator");
  const [calcInitialSection, setCalcInitialSection] = useState(0);
  const [analyticsParams, setAnalyticsParams] =
    useState<AnalyticsRequest>(DEFAULT_ANALYTICS);

  useEffect(() => {
    async function load() {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        setProfile(null);
        setLoadingProfile(false);
        return;
      }

      const p = await getProfile(user.id);
      setProfile(p);

      if (p && p.profileCompleted) {
        setCalcInitialSection(1); 
      }

      setLoadingProfile(false);
    }

    load();
  }, [isLoaded, isSignedIn, user]);

  const handleTabChange = (t: string) => {
    if (t === "calculator") setCalcInitialSection(1);
    setActiveTab(t as "calculator" | "advanced");
  };

  const handlePortfolioSubmit = (params: AnalyticsRequest) => {
    setAnalyticsParams(params);
  };

  if (!isLoaded || loadingProfile) {
    return <LoadingScreen text="Loading your workspace..." />;
  }

  // signed in but no completed profile -> show profile creation
  if (isSignedIn && user && (!profile || !profile.profileCompleted)) {
    return (
      <>
        <div className="auth-top-right">
          <UserButton />
        </div>

        <CreateProfile
          userId={user.id}
          name={user.fullName ?? ""}
          email={user.primaryEmailAddress?.emailAddress ?? ""}
        />
      </>
    );
  }

  return (
    <div className="app-shell">
      <div className="auth-top-right">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="pill-cta-blue">Sign in</button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      <main>
        {activeTab === "calculator" && (
          <Calculator
            activeTab={activeTab}
            onTabChange={handleTabChange}
            initialSection={calcInitialSection}
            onPortfolioSubmit={handlePortfolioSubmit}
            profile={profile}
          />
        )}

        {activeTab === "advanced" && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "#f8fafc",
              overflowY: "auto",
            }}
          >
            <Analytics
              onTabChange={handleTabChange}
              analyticsParams={analyticsParams}
            />
          </div>
        )}
      </main>
    </div>
  );
}