import type { UserProfile } from "../types/profile";
import { supabase } from "../lib/supabase";

type ProfileRow = {
  user_id: string;
  name: string | null;
  email: string | null;
  birth_year: number | null;
  income: number | null;
  monthly_savings: number | null;
  job_title: string | null;
  industry: string | null;
  risk_tolerance: "low" | "medium" | "high" | null;
  life_goal: string | null;
  ideal_retirement_age: number | null;
  investor_experience:
    | "casual"
    | "beginner"
    | "intermediate"
    | "experienced"
    | null;
  profile_completed: boolean;
  skipped_profile: boolean;
};

function mapRowToProfile(row: ProfileRow): UserProfile {
  return {
    userId: row.user_id,
    name: row.name ?? "",
    email: row.email ?? "",
    birthYear: row.birth_year,
    income: row.income,
    monthlySavings: row.monthly_savings,
    jobTitle: row.job_title ?? "",
    industry: row.industry ?? "",
    riskTolerance: row.risk_tolerance,
    lifeGoal: row.life_goal ?? "",
    idealRetirementAge: row.ideal_retirement_age,
    investorExperience: row.investor_experience,
    profileCompleted: row.profile_completed,
    skippedProfile: row.skipped_profile,
  };
}

function mapProfileToRow(profile: Partial<UserProfile>) {
  return {
    user_id: profile.userId,
    name: profile.name ?? null,
    email: profile.email ?? null,
    birth_year: profile.birthYear ?? null,
    income: profile.income ?? null,
    monthly_savings: profile.monthlySavings ?? null,
    job_title: profile.jobTitle ?? null,
    industry: profile.industry ?? null,
    risk_tolerance: profile.riskTolerance ?? null,
    life_goal: profile.lifeGoal ?? null,
    ideal_retirement_age: profile.idealRetirementAge ?? null,
    investor_experience: profile.investorExperience ?? null,
    profile_completed: profile.profileCompleted ?? false,
    skipped_profile: profile.skippedProfile ?? false,
    updated_at: new Date().toISOString(),
  };
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapRowToProfile(data as ProfileRow);
}

export async function createProfileShell(user: {
  userId: string;
  name?: string;
  email?: string;
}): Promise<UserProfile> {
  const existing = await getProfile(user.userId);
  if (existing) return existing;

  const row = {
    user_id: user.userId,
    name: user.name ?? null,
    email: user.email ?? null,
    birth_year: null,
    income: null,
    monthly_savings: null,
    job_title: null,
    industry: null,
    risk_tolerance: null,
    life_goal: null,
    ideal_retirement_age: null,
    investor_experience: null,
    profile_completed: false,
    skipped_profile: false,
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(row)
    .select()
    .single();

  if (error) throw error;

  return mapRowToProfile(data as ProfileRow);
}

export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const row = mapProfileToRow({
    ...updates,
    userId,
    profileCompleted: true,
    skippedProfile: false,
  });

  const { data, error } = await supabase
    .from("profiles")
    .upsert(row, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw error;

  return mapRowToProfile(data as ProfileRow);
}

export async function skipProfile(userId: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      skipped_profile: true,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) throw error;
}