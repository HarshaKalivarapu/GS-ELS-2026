export type RiskTolerance = "low" | "medium" | "high";

export type InvestorExperience =
  | "casual"
  | "beginner"
  | "intermediate"
  | "experienced";

export interface UserProfile {
  userId: string;
  name?: string;
  email?: string;

  birthYear: number | null;
  income: number | null;
  monthlySavings: number | null;

  jobTitle: string;
  industry: string;

  riskTolerance: RiskTolerance | null;
  lifeGoal: string;
  idealRetirementAge: number | null;
  investorExperience: InvestorExperience | null;

  profileCompleted: boolean;
  skippedProfile: boolean;
}