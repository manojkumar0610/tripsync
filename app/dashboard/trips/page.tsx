import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle, Calendar, Users, DollarSign,
  Plane, ArrowRight, Map
} from "lucide-react";
import {
  formatCurrency, formatDate, getDaysUntilTrip,
  getTripTypeEmoji, getTripTypeLabel
} from "@/lib/utils";

export default async function TripsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: tripMembers } = await supabase
    .from("trip_members").select("trip_id, role").eq("user_id", user.id);

  const tripIds = (tripMembers ?? []).map((m) => m.trip_id);
  const roleMap = Object.fromEntries((tripMembers ?? []).map((m) => [m.trip_id, m.role]));

  let trips: any[] = [];
  if (tripIds.length > 0) {
    const { data } = await supabase
      .from("trips")
      .select("*, trip_members(count)")
      .in("id", tripIds)
      .order("start_date", { ascending: true });
    trips = data ?? [];
  }

  const now = new Date();
  const upcoming = trips.filter((t) => new Date(t.start_date) >= now);
  const past = trips.filter((t) => new Date(t.end_date) < now);
  const active = trips.filter((t) => new Date(t.start_date) <= now && new Date(t.end_date) >= now);

  const TripCard = ({ trip }: { trip: any }) => {
    const daysUntil = getDaysUntilTrip(trip.start_date);
    const isActive = new Date(trip.start_date) <= now && new Date(trip.end_date) >= now;
    const isPast = new Date(trip.end_date) < now;
    const memberCount = trip.trip_members?.[0]?.count ?? 1;
    const role = roleMap[trip.id];

    return (
      <Link href={`/trip/${trip.id}`}>
        <Card className="trip-card-hover cursor-pointer group overflow-hidden">
          {/* Color band based on trip type */}
          <div className={`h-1.5 w-full ${
            trip.trip_type === "friends" ? "bg-gradient-to-r from-blue-400 to-violet-500" :
            trip.trip_type === "family" ? "bg-gradient-to-r from-emerald-400 to-teal-500" :
            trip.trip_type === "solo" ? "bg-gradient-to-r from-amber-400 to-orange-500" :
            "bg-gradient-to-r from-red-400 to-rose-500"
          }`} />
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-xl shrink-0">
                {getTripTypeEmoji(trip.trip_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-syne font-semibold">{trip.title}</h3>
                  {isActive && <Badge variant="success" className="text-[10px]">Active</Badge>}
                  {isPast && <Badge variant="secondary" className="text-[10px]">Completed</Badge>}
                  {role === "owner" && <Badge variant="info" className="text-[10px]">Owner</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Map size={12} /> {trip.destination}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={11} /> {memberCount} member{memberCount !== 1 ? "s" : ""}
                  </span>
                  {trip.budget > 0 && (
                    <span className="flex items-center gap-1">
                      <DollarSign size={11} /> {formatCurrency(trip.budget)} budget
                    </span>
                  )}
                  <span className="capitalize">{getTripTypeLabel(trip.trip_type)}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                {!isPast && (
                  <p className={`text-xs font-semibold ${daysUntil <= 7 ? "text-amber-600" : "text-blue-600"}`}>
                    {isActive ? "Today!" : daysUntil === 0 ? "Tomorrow" : `${daysUntil}d`}
                  </p>
                )}
                <ArrowRight size={16} className="text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="page-enter">
      <DashboardHeader title="My Trips" subtitle={`${trips.length} trips total`} />
      <div className="page-container py-6 space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{upcoming.length} upcoming</span>
            <span>{active.length} active</span>
            <span>{past.length} past</span>
          </div>
          <Link href="/dashboard/create">
            <Button variant="gradient" size="sm" className="gap-2">
              <PlusCircle size={16} /> New Trip
            </Button>
          </Link>
        </div>

        {/* Active trips */}
        {active.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-syne text-lg font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Now
            </h2>
            {active.map((t) => <TripCard key={t.id} trip={t} />)}
          </section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-syne text-lg font-semibold">Upcoming Trips</h2>
            {upcoming.map((t) => <TripCard key={t.id} trip={t} />)}
          </section>
        )}

        {/* Past */}
        {past.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-syne text-lg font-semibold text-muted-foreground">Past Trips</h2>
            {past.map((t) => <TripCard key={t.id} trip={t} />)}
          </section>
        )}

        {trips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="rounded-full bg-muted p-6">
              <Plane size={36} className="text-muted-foreground" />
            </div>
            <h3 className="font-syne text-xl font-semibold">No trips yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Create your first trip and start exploring the world with friends or family.
            </p>
            <Link href="/dashboard/create">
              <Button variant="gradient" size="lg" className="gap-2">
                <PlusCircle size={18} /> Create Your First Trip
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
