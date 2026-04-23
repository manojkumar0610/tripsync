import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TripDetailClient } from "@/components/trips/trip-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch trip — use maybeSingle so it returns null instead of throwing
  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!trip) notFound();

  // Check membership
  const { data: membership } = await supabase
    .from("trip_members")
    .select("role")
    .eq("trip_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect(`/join?code=${trip.invite_code}`);
  }

  // Fetch members
  const { data: members } = await supabase
    .from("trip_members")
    .select("*, user:users(*)")
    .eq("trip_id", id);

  // Fetch expenses
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*, payer:users!expenses_paid_by_fkey(*), splits:expense_splits(*, user:users(*))")
    .eq("trip_id", id)
    .order("created_at", { ascending: false });

  // Fetch votes
  const { data: votes } = await supabase
    .from("votes")
    .select("*, responses:vote_responses(*, user:users(*))")
    .eq("trip_id", id)
    .order("created_at", { ascending: false });

  // Fetch itineraries
  const { data: itineraries } = await supabase
    .from("itineraries")
    .select("*")
    .eq("trip_id", id)
    .order("created_at", { ascending: false });

  // Fetch current user profile safely
  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <TripDetailClient
      trip={trip}
      members={members ?? []}
      expenses={expenses ?? []}
      votes={votes ?? []}
      itineraries={itineraries ?? []}
      currentUser={userProfile ?? { id: user.id, email: user.email, full_name: null, avatar_url: null }}
      userRole={membership.role}
    />
  );
}
