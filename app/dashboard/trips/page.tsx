import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PlusCircle, Calendar, Users, DollarSign, Plane, ArrowRight, Map } from "lucide-react";
import { formatCurrency, formatDate, getDaysUntilTrip, getTripTypeEmoji, getTripTypeLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default async function TripsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: tripMembers } = await supabase.from("trip_members").select("trip_id, role").eq("user_id", user.id);
  const tripIds = (tripMembers ?? []).map(m => m.trip_id);
  const roleMap = Object.fromEntries((tripMembers ?? []).map(m => [m.trip_id, m.role]));

  let trips: any[] = [];
  if (tripIds.length > 0) {
    const { data } = await supabase.from("trips").select("*, trip_members(count)").in("id", tripIds).order("start_date", { ascending: true });
    trips = data ?? [];
  }

  const now = new Date();
  const active = trips.filter(t => new Date(t.start_date) <= now && new Date(t.end_date) >= now);
  const upcoming = trips.filter(t => new Date(t.start_date) > now);
  const past = trips.filter(t => new Date(t.end_date) < now);

  const TripCard = ({ trip }: { trip: any }) => {
    const daysUntil = getDaysUntilTrip(trip.start_date);
    const isActiveTripNow = !!active.find((a: any) => a.id === trip.id);
    const isPast = new Date(trip.end_date) < now;
    const memberCount = trip.trip_members?.[0]?.count ?? 1;
    const role = roleMap[trip.id];
    const colors: Record<string, string> = {
      friends: "from-blue-500 to-violet-600",
      family: "from-emerald-500 to-teal-600",
      solo: "from-amber-500 to-orange-600",
      bike_trip: "from-rose-500 to-red-600",
    };

    return (
      <Link href={`/trip/${trip.id}`}>
        <div className="card-glow p-5 cursor-pointer group animate-fade-up">
          <div className="flex items-start gap-4">
            {/* Emoji icon */}
            <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl shrink-0", colors[trip.trip_type] ?? "from-blue-500 to-violet-600")}>
              <span className="filter drop-shadow-sm">{getTripTypeEmoji(trip.trip_type)}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-semibold text-white/90 truncate">{trip.title}</h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isActiveTripNow && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Active
                    </span>
                  )}
                  {isPast && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/10">Done</span>}
                  {role === "owner" && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full badge-blue">Owner</span>}
                </div>
              </div>

              <p className="text-xs text-white/40 flex items-center gap-1 mb-2">
                <Map className="w-3 h-3" />{trip.destination}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/25">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(trip.start_date)} — {formatDate(trip.end_date)}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{memberCount}</span>
                {trip.budget > 0 && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{formatCurrency(trip.budget)}</span>}
              </div>
            </div>

            <div className="text-right shrink-0">
              {!isPast && !isActiveTripNow && daysUntil >= 0 && (
                <p className={cn("text-sm font-bold", daysUntil <= 7 ? "text-amber-400" : "text-blue-400")}>
                  {daysUntil === 0 ? "Today!" : `${daysUntil}d`}
                </p>
              )}
              <ArrowRight className="w-4 h-4 text-white/15 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const Section = ({ title, trips, dot }: { title: string; trips: any[]; dot?: string }) => (
    trips.length > 0 ? (
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          {dot && <span className={cn("w-2 h-2 rounded-full", dot)} />}
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">{title}</h2>
          <span className="text-xs text-white/25 font-medium">({trips.length})</span>
        </div>
        {trips.map(t => <TripCard key={t.id} trip={t} />)}
      </section>
    ) : null
  );

  return (
    <div className="animate-fade-in">
      <DashboardHeader title="My Trips" subtitle={`${trips.length} trips total`} />
      <div className="page-container py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-xs text-white/30">
            <span><span className="text-white/60 font-semibold">{upcoming.length}</span> upcoming</span>
            <span><span className="text-white/60 font-semibold">{active.length}</span> active</span>
            <span><span className="text-white/60 font-semibold">{past.length}</span> past</span>
          </div>
          <Link href="/dashboard/create">
            <button className="btn-glow flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold text-white">
              <PlusCircle className="w-3.5 h-3.5" /> New Trip
            </button>
          </Link>
        </div>

        <Section title="Active Now" trips={active} dot="bg-emerald-400 animate-pulse" />
        <Section title="Upcoming" trips={upcoming} dot="bg-blue-400" />
        <Section title="Past Trips" trips={past} dot="bg-white/20" />

        {trips.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto">
              <Plane className="w-7 h-7 text-white/15 rotate-45" />
            </div>
            <div>
              <p className="text-white/50 font-semibold mb-1">No trips yet</p>
              <p className="text-white/25 text-sm">Create your first trip and start exploring</p>
            </div>
            <Link href="/dashboard/create">
              <button className="btn-glow inline-flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-semibold text-white">
                <PlusCircle className="w-4 h-4" /> Create First Trip
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
