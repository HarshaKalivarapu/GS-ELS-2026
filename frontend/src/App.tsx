import { useEffect, useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import "./App.css";
import Calculator from "./components/Calculator";
import Analytics from "./components/Analytics";
import type { AnalyticsRequest } from "./types";
import type { UserProfile } from "./types/profile";

import { getProfile } from "./services/profileService";
import CreateProfile from "./components/Profile/CreateProfile";
import LoadingScreen from "./components/LoadingScreen";

const DEFAULT_ANALYTICS: AnalyticsRequest = {
  tickers: ["VTI", "VXUS", "BND"],
  investmentAmount: 10_000,
  horizonYears: 10,
  riskTolerance: 0.5,
};

function TopRightAuth() {
  return (
    <div className="auth-container">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="auth-signin-btn">Sign in</button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <div className="auth-user-wrapper">
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
    </div>
  );
}

export default function App() {
  const { isLoaded, isSignedIn, user } = useUser();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"calculator" | "advanced">("calculator");
  const [calcInitialSection, setCalcInitialSection] = useState(0);
  const [analyticsParams, setAnalyticsParams] =
    useState<AnalyticsRequest>(DEFAULT_ANALYTICS);

  useEffect(() => {
    async function loadProfile() {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        const p = await getProfile(user.id);
        setProfile(p);
      } finally {
        setProfileLoading(false);
      }
    }

    loadProfile();
  }, [isLoaded, isSignedIn, user]);

  const handleTabChange = (t: string) => {
    if (t === "calculator") setCalcInitialSection(1);
    setActiveTab(t as "calculator" | "advanced");
  };

  const handlePortfolioSubmit = (params: AnalyticsRequest) => {
    setAnalyticsParams(params);
  };

  if (!isLoaded) {
    return <LoadingScreen text="Loading..." />;
  }

  const signedInButNeedsProfile =
    isSignedIn && user && (!profile || !profile.profileCompleted);

  return (
    <>
      <TopRightAuth />

      {signedInButNeedsProfile ? (
        <CreateProfile
          userId={user.id}
          name={user.fullName ?? user.firstName ?? ""}
          email={user.primaryEmailAddress?.emailAddress ?? ""}
        />
      ) : (
        <div className="app-shell">
          <main>
            {activeTab === "calculator" && (
              <Calculator
                activeTab={activeTab}
                onTabChange={handleTabChange}
                initialSection={calcInitialSection}
                onPortfolioSubmit={handlePortfolioSubmit}
                profile={isSignedIn ? profile : null}
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
      )}
    </>
  );
}