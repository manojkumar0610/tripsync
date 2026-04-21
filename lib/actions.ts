"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ──────────────────────────────────────────────
// TRIP ACTIONS
// ──────────────────────────────────────────────

export async function createTripAction(formData: {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  trip_type: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("trips")
    .insert({ ...formData, created_by: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/trips");
  revalidatePath("/dashboard");
  return data;
}

export async function updateTripAction(
  tripId: string,
  updates: Partial<{
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    budget: number;
    notes: string;
  }>
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("trips")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", tripId);

  if (error) throw new Error(error.message);
  revalidatePath(`/trip/${tripId}`);
}

export async function deleteTripAction(tripId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("trips").delete().eq("id", tripId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/trips");
  redirect("/dashboard/trips");
}

// ──────────────────────────────────────────────
// EXPENSE ACTIONS
// ──────────────────────────────────────────────

export async function addExpenseAction(data: {
  trip_id: string;
  title: string;
  amount: number;
  category: string;
  paid_by: string;
  split_type: "equal" | "custom";
  notes?: string;
  splits: Array<{ user_id: string; amount: number }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { splits, ...expenseData } = data;

  const { data: expense, error } = await supabase
    .from("expenses")
    .insert(expenseData)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const splitRows = splits.map((s) => ({
    expense_id: expense.id,
    user_id: s.user_id,
    amount: s.amount,
    is_settled: s.user_id === data.paid_by,
  }));

  const { error: splitError } = await supabase
    .from("expense_splits")
    .insert(splitRows);

  if (splitError) throw new Error(splitError.message);

  revalidatePath(`/trip/${data.trip_id}`);
  return expense;
}

export async function settleExpenseSplitAction(
  splitId: string,
  tripId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("expense_splits")
    .update({ is_settled: true, settled_at: new Date().toISOString() })
    .eq("id", splitId);

  if (error) throw new Error(error.message);
  revalidatePath(`/trip/${tripId}`);
}

// ──────────────────────────────────────────────
// MEMBER ACTIONS
// ──────────────────────────────────────────────

export async function joinTripByCodeAction(inviteCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: trip } = await supabase
    .from("trips")
    .select("id")
    .eq("invite_code", inviteCode.toUpperCase().trim())
    .single();

  if (!trip) throw new Error("Invalid invite code");

  const { data: existing } = await supabase
    .from("trip_members")
    .select("id")
    .eq("trip_id", trip.id)
    .eq("user_id", user.id)
    .single();

  if (existing) return trip.id; // already member

  const { error } = await supabase.from("trip_members").insert({
    trip_id: trip.id,
    user_id: user.id,
    role: "member",
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/trip/${trip.id}`);
  return trip.id;
}

export async function removeMemberAction(memberId: string, tripId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("trip_members")
    .delete()
    .eq("id", memberId);

  if (error) throw new Error(error.message);
  revalidatePath(`/trip/${tripId}`);
}

// ──────────────────────────────────────────────
// VOTE ACTIONS
// ──────────────────────────────────────────────

export async function createVoteAction(data: {
  trip_id: string;
  title: string;
  description?: string;
  options: Array<{ id: string; label: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("votes").insert({
    ...data,
    created_by: user.id,
    status: "open",
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/trip/${data.trip_id}`);
}

export async function castVoteAction(
  voteId: string,
  optionId: string,
  tripId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("vote_responses").upsert(
    { vote_id: voteId, user_id: user.id, option_id: optionId },
    { onConflict: "vote_id,user_id" }
  );

  if (error) throw new Error(error.message);
  revalidatePath(`/trip/${tripId}`);
}

export async function closeVoteAction(voteId: string, tripId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("votes")
    .update({ status: "closed" })
    .eq("id", voteId);

  if (error) throw new Error(error.message);
  revalidatePath(`/trip/${tripId}`);
}

// ──────────────────────────────────────────────
// NOTIFICATION ACTIONS
// ──────────────────────────────────────────────

export async function markNotificationsReadAction(userId: string) {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  revalidatePath("/dashboard");
}

// ──────────────────────────────────────────────
// PROFILE ACTIONS
// ──────────────────────────────────────────────

export async function updateProfileAction(data: {
  full_name?: string;
  avatar_url?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("users")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings");
}
