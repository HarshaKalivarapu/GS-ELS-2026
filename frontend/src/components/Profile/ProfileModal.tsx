import { useState } from "react";
import type { UserProfile } from "../../types/profile";
import { updateProfile } from "../../services/profileService";

type Props = {
  profile: UserProfile;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
};

const FIELD_CONFIG = [
  { key: "birthYear", label: "Birth Year", type: "number", placeholder: "2004" },
  { key: "income", label: "Income", type: "number", placeholder: "60000" },
  { key: "monthlySavings", label: "Monthly Savings", type: "number", placeholder: "800" },
  { key: "jobTitle", label: "Job Title", type: "text", placeholder: "Student, SWE intern, analyst..." },
  { key: "industry", label: "Industry", type: "text", placeholder: "Technology, finance, healthcare..." },
  {
    key: "riskTolerance",
    label: "Risk Tolerance",
    type: "select",
    options: [
      { value: "", label: "Not set" },
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
  },
  { key: "lifeGoal", label: "Financial Goals", type: "textarea", placeholder: "I want to retire early, buy a house..." },
  { key: "idealRetirementAge", label: "Ideal Retirement Age", type: "number", placeholder: "60" },
  {
    key: "investorExperience",
    label: "Investor Experience",
    type: "select",
    options: [
      { value: "", label: "Not set" },
      { value: "casual", label: "Casual" },
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "experienced", label: "Experienced" },
    ],
  },
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getField(obj: UserProfile, key: string): any {
  return (obj as any)[key];
}

function displayValue(profile: UserProfile, key: string): string {
  const val = getField(profile, key);
  if (val === null || val === undefined || val === "") return "—";
  if (key === "income" || key === "monthlySavings") {
    return `$${Number(val).toLocaleString()}`;
  }
  if (key === "riskTolerance" || key === "investorExperience") {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }
  return String(val);
}

export default function ProfileModal({ profile, onClose, onProfileUpdated }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>({ ...profile });
  const [saving, setSaving] = useState(false);

  const handleChange = (key: string, value: string) => {
    setDraft((prev) => {
      const numFields = ["birthYear", "income", "monthlySavings", "idealRetirementAge"];
      const selectNullable = ["riskTolerance", "investorExperience"];

      if (numFields.includes(key)) {
        return { ...prev, [key]: value === "" ? null : Number(value) };
      }
      if (selectNullable.includes(key)) {
        return { ...prev, [key]: value === "" ? null : value };
      }
      return { ...prev, [key]: value };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile(draft.userId, draft);
      onProfileUpdated(updated);
      setEditing(false);
    } catch (e) {
      console.error("Failed to update profile:", e);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft({ ...profile });
    setEditing(false);
  };

  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-modal-header">
          <div>
            <h2 className="profile-modal-title">Your Profile</h2>
            <p className="profile-modal-subtitle">
              {profile.name || "User"} · {profile.email || "No email"}
            </p>
          </div>
          <button className="profile-modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="profile-modal-body">
          {FIELD_CONFIG.map((field) => (
            <div key={field.key} className={`profile-modal-field ${field.type === "textarea" ? "profile-modal-field--full" : ""}`}>
              <label className="profile-modal-label">{field.label}</label>

              {!editing ? (
                <p className="profile-modal-value">{displayValue(profile, field.key)}</p>
              ) : field.type === "select" ? (
                <select
                  className="form-input-clean profile-modal-input"
                  value={String(getField(draft, field.key) ?? "")}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  className="form-input-clean profile-modal-input profile-modal-textarea"
                  value={String(getField(draft, field.key) ?? "")}
                  placeholder={field.placeholder}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              ) : (
                <input
                  className="form-input-clean profile-modal-input"
                  type={field.type}
                  value={String(getField(draft, field.key) ?? "")}
                  placeholder={field.placeholder}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="profile-modal-footer">
          {!editing ? (
            <button className="profile-modal-edit-btn" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          ) : (
            <>
              <button className="profile-modal-cancel-btn" onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
              <button className="profile-modal-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
