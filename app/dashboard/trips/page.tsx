import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PlusCircle, Calendar, Users, DollarSign, Plane, ArrowRight, Map, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate, getDaysUntilTrip, getTripTypeEmoji, getTripTypeLabel } from "@/lib/utils";

export default async function TripsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: tripMembers } = await supabase.from("trip_members").select("trip_id,role").eq("user_id", user.id);
  const tripIds = (tripMembers ?? []).map((m: any) => m.trip_id);
  const roleMap = Object.fromEntries((tripMembers ?? []).map((m: any) => [m.trip_id, m.role]));

  let trips: any[] = [];
  if (tripIds.length > 0) {
    const { data } = await supabase.from("trips").select("*, trip_members(count)").in("id", tripIds).order("start_date", { ascending: true });
    trips = data ?? [];
  }

  const now = new Date();
  const active = trips.filter(t => new Date(t.start_date) <= now && new Date(t.end_date) >= now);
  const upcoming = trips.filter(t => new Date(t.start_date) > now);
  const past = trips.filter(t => new Date(t.end_date) < now);

  const typeGradients: Record<string, string> = {
    friends: "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))",
    family: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(20,184,166,0.3))",
    solo: "linear-gradient(135deg, rgba(245,158,11,0.3), rgba(234,88,12,0.3))",
    bike_trip: "linear-gradient(135deg, rgba(244,63,94,0.3), rgba(239,68,68,0.3))",
  };

  const TripCard = ({ trip }: { trip: any }) => {
    const daysUntil = getDaysUntilTrip(trip.start_date);
    const isActivenow = new Date(trip.start_date) <= now && new Date(trip.end_date) >= now;
    const isPast = new Date(trip.end_date) < now;
    const count = trip.trip_members?.[0]?.count ?? 1;
    const role = roleMap[trip.id];

    return (
      <Link href={`/trip/${trip.id}`} style={{ textDecoration: "none" }}>
        <div className="card-hover" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: typeGradients[trip.trip_type] ?? typeGradients.friends, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              {getTripTypeEmoji(trip.trip_type)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.88)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{trip.title}</p>
                {isActivenow && (
                  <span className="badge badge-green">
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", animation: "pulse-dot 2s infinite" }} /> Active
                  </span>
                )}
                {isPast && <span className="badge badge-muted">Completed</span>}
                {role === "owner" && <span className="badge badge-blue">Owner</span>}
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                <Map size={11} /> {trip.destination}
              </p>
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: "rgba(255,255,255,0.25)", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={10} />{formatDate(trip.start_date)} — {formatDate(trip.end_date)}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={10} />{count}</span>
                {trip.budget > 0 && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><DollarSign size={10} />{formatCurrency(trip.budget)}</span>}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              {!isPast && !isActivenow && daysUntil >= 0 && (
                <p style={{ fontSize: 13, fontWeight: 700, color: daysUntil <= 7 ? "#fbbf24" : "#60a5fa" }}>
                  {daysUntil === 0 ? "Today!" : `${daysUntil}d`}
                </p>
              )}
              <ChevronRight size={14} color="rgba(255,255,255,0.2)" style={{ marginTop: 4 }} />
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const Section = ({ title, trips, dot }: { title: string; trips: any[]; dot: string }) =>
    trips.length > 0 ? (
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />
          <span className="section-label">{title}</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>({trips.length})</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {trips.map(t => <TripCard key={t.id} trip={t} />)}
        </div>
      </div>
    ) : null;

  return (
    <>
      <DashboardHeader title="My Trips" subtitle={`${trips.length} trip${trips.length !== 1 ? "s" : ""} total`} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }} className="fade-in">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
            <span style={{ color: "rgba(255,255,255,0.3)" }}><span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>{upcoming.length}</span> upcoming</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}><span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>{active.length}</span> active</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}><span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>{past.length}</span> past</span>
          </div>
          <Link href="/dashboard/create" style={{ textDecoration: "none" }}>
            <button className="btn-primary"><PlusCircle size={15} /> New Trip</button>
          </Link>
        </div>

        <Section title="Active Now" trips={active} dot="#34d399" />
        <Section title="Upcoming" trips={upcoming} dot="#60a5fa" />
        <Section title="Past Trips" trips={past} dot="rgba(255,255,255,0.2)" />

        {trips.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 80, paddingBottom: 80 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Plane size={24} color="rgba(255,255,255,0.15)" style={{ transform: "rotate(45deg)" }} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>No trips yet</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>Create your first trip and start exploring</p>
            <Link href="/dashboard/create" style={{ textDecoration: "none" }}>
              <button className="btn-primary btn-primary-lg"><PlusCircle size={16} /> Create First Trip</button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
