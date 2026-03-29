import { useEffect, useState } from "react";
import type { UserProfile } from "../../types/profile";
import {
  getProfile,
  createProfileShell,
  updateProfile,
  skipProfile,
} from "../../services/profileService";
import LoadingScreen from "../LoadingScreen";

type Props = {
  userId: string;
  name?: string;
  email?: string;
};

export default function CreateProfile({ userId, name, email }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      let p = await getProfile(userId);

      if (!p) {
        p = await createProfileShell({
          userId,
          name,
          email,
        });
      }

      setProfile(p);
      setLoading(false);
    }

    load();
  }, [userId, name, email]);

  if (loading || !profile) return <LoadingScreen text="Loading your profile..." />;
  
  const handleSave = async () => {
    if (
      !profile.birthYear ||
      !profile.income ||
      !profile.monthlySavings ||
      !profile.riskTolerance ||
      !profile.lifeGoal.trim() ||
      !profile.idealRetirementAge ||
      !profile.investorExperience
    ) {
      alert("Please fill required fields");
      return;
    }

    await updateProfile(profile.userId, profile);
    window.location.href = "/";
  };

  const handleSkip = async () => {
    await skipProfile(profile.userId);
    window.location.href = "/";
  };

  return (
    <section className="section-form profile-onboarding-section">
      <div className="section-inner">
        <div className="two-thirds-col profile-onboarding-grid">
          <div className="profile-onboarding-copy">
            <p className="section-eyebrow-blue">Get started</p>
            <h1 className="section-headline-dark">Create your profile</h1>
            <p className="section-subtext-muted">
              Tell us a bit about your finances and goals so we can personalize
              your portfolio, projected value, and recurring investment plan.
            </p>

            <div className="hero-chart-wrap-light profile-summary-card">
              <p className="hero-chart-label hero-chart-label-light">
                PERSONALIZED SETUP
              </p>
              <p className="hero-chart-value-light">
                {profile.monthlySavings
                  ? `$${profile.monthlySavings.toLocaleString()}`
                  : "$0"}
              </p>
              <div className="hero-chart-badge-light">
                Monthly savings input
              </div>
            </div>
          </div>

          <div className="form-card-gray profile-form-card">
            <div className="profile-form-grid">
              <div>
                <label className="form-field-label">Birth year</label>
                <input
                  className="form-input-clean"
                  type="number"
                  placeholder="2004"
                  value={profile.birthYear ?? ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      birthYear: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>

              <div>
                <label className="form-field-label">Income</label>
                <input
                  className="form-input-clean"
                  type="number"
                  placeholder="60000"
                  value={profile.income ?? ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      income: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>

              <div>
                <label className="form-field-label">Monthly savings</label>
                <input
                  className="form-input-clean"
                  type="number"
                  placeholder="800"
                  value={profile.monthlySavings ?? ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      monthlySavings: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                />
              </div>

              <div>
                <label className="form-field-label">Job title</label>
                <input
                  className="form-input-clean"
                  type="text"
                  placeholder="Student, SWE intern, analyst..."
                  value={profile.jobTitle}
                  onChange={(e) =>
                    setProfile({ ...profile, jobTitle: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="form-field-label">Industry</label>
                <input
                  className="form-input-clean"
                  type="text"
                  placeholder="Technology, finance, healthcare..."
                  value={profile.industry}
                  onChange={(e) =>
                    setProfile({ ...profile, industry: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="form-field-label">Risk tolerance</label>
                <select
                  className="form-input-clean"
                  value={profile.riskTolerance ?? ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      riskTolerance:
                        e.target.value === ""
                          ? null
                          : (e.target.value as "low" | "medium" | "high"),
                    })
                  }
                >
                  <option value="">Select risk tolerance</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="profile-full-width">
                <label className="form-field-label">Financial goals</label>
                <textarea
                  className="form-input-clean profile-textarea"
                  placeholder="I want to retire early, buy a house in 7 years, and steadily build long-term wealth."
                  value={profile.lifeGoal}
                  onChange={(e) =>
                    setProfile({ ...profile, lifeGoal: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="form-field-label">Ideal retirement age</label>
                <input
                  className="form-input-clean"
                  type="number"
                  placeholder="60"
                  value={profile.idealRetirementAge ?? ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      idealRetirementAge: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                />
              </div>

              <div>
                <label className="form-field-label">Investor experience</label>
                <select
                  className="form-input-clean"
                  value={profile.investorExperience ?? ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      investorExperience:
                        e.target.value === ""
                          ? null
                          : (e.target.value as
                              | "casual"
                              | "beginner"
                              | "intermediate"
                              | "experienced"),
                    })
                  }
                >
                  <option value="">Select experience</option>
                  <option value="casual">Casual</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="experienced">Experienced</option>
                </select>
              </div>
            </div>

            <div className="profile-action-row">
              <button className="pill-cta-blue" onClick={handleSave}>
                Save profile <span className="cta-arrow">→</span>
              </button>

              <button className="profile-skip-button" onClick={handleSkip}>
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}