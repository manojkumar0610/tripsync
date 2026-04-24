import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PlusCircle, Map, DollarSign, Calendar, ArrowRight, Sparkles, Plane, TrendingUp, Users, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate, getDaysUntilTrip, getTripTypeEmoji, getInitials } from "@/lib/utils";

const S = {
  page: { animation: "fadeIn 0.35s ease" } as React.CSSProperties,
  wrap: { maxWidth: 1280, margin: "0 auto", padding: "32px 24px" } as React.CSSProperties,
  card: { background: "#0e0e1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 } as React.CSSProperties,
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle();
  const { data: tripMembers } = await supabase.from("trip_members").select("trip_id,role").eq("user_id", user.id);
  const tripIds = (tripMembers ?? []).map((m: any) => m.trip_id);

  let trips: any[] = [];
  if (tripIds.length > 0) {
    const { data } = await supabase.from("trips").select("*, trip_members(count)").in("id", tripIds).order("start_date", { ascending: true });
    trips = data ?? [];
  }

  const now = new Date();
  const upcoming = trips.filter(t => new Date(t.start_date) > now);
  const active = trips.filter(t => new Date(t.start_date) <= now && new Date(t.end_date) >= now);
  const past = trips.filter(t => new Date(t.end_date) < now);

  let totalSpent = 0, pendingBalance = 0;
  if (tripIds.length > 0) {
    const { data: paid } = await supabase.from("expenses").select("amount").eq("paid_by", user.id);
    totalSpent = (paid ?? []).reduce((s: number, e: any) => s + Number(e.amount), 0);
    const { data: splits } = await supabase.from("expense_splits").select("amount,expense_id,expenses(paid_by)").eq("user_id", user.id).eq("is_settled", false);
    pendingBalance = (splits ?? []).filter((s: any) => s.expenses?.paid_by !== user.id).reduce((s: number, x: any) => s + Number(x.amount), 0);
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = profile?.full_name?.split(" ")[0] ?? "Traveler";
  const displayTrips = [...active, ...upcoming].slice(0, 5);

  const stats = [
    { label: "Total Trips", value: trips.length, icon: Map, color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.15)" },
    { label: "Upcoming", value: upcoming.length, icon: Calendar, color: "#a78bfa", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.15)" },
    { label: "Total Spent", value: formatCurrency(totalSpent), icon: TrendingUp, color: "#34d399", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)" },
    { label: "You Owe", value: formatCurrency(pendingBalance), icon: DollarSign, color: pendingBalance > 0 ? "#fb7185" : "#34d399", bg: pendingBalance > 0 ? "rgba(244,63,94,0.08)" : "rgba(16,185,129,0.08)", border: pendingBalance > 0 ? "rgba(244,63,94,0.15)" : "rgba(16,185,129,0.15)" },
  ];

  return (
    <>
      <DashboardHeader title="Dashboard" subtitle="Your travel command center" />
      <div style={S.wrap} className="fade-in">

        {/* Welcome */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>{greeting} 👋</p>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.03em" }}>{firstName}</h2>
          </div>
          <Link href="/dashboard/create" style={{ textDecoration: "none" }}>
            <button className="btn-primary" style={{ gap: 8 }}>
              <PlusCircle size={16} /> New Trip
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 32 }}>
          {stats.map((s) => (
            <div key={s.label} className="stat-card fade-up" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <s.icon size={16} color={s.color} />
                </div>
              </div>
              <p style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: "-0.03em", marginBottom: 2 }}>
                {typeof s.value === "number" ? s.value : s.value}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          {/* Trips section */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
                {active.length > 0 ? "Active & Upcoming" : "Upcoming Trips"}
              </h3>
              <Link href="/dashboard/trips" style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "rgba(255,255,255,0.35)", cursor: "pointer" }}>
                  View all <ChevronRight size={14} />
                </div>
              </Link>
            </div>

            {displayTrips.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Plane size={22} color="rgba(255,255,255,0.2)" style={{ transform: "rotate(45deg)" }} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>No trips yet</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>Start planning your next adventure</p>
                <Link href="/dashboard/create" style={{ textDecoration: "none" }}>
                  <button className="btn-primary" style={{ fontSize: 13, height: 36 }}>
                    <PlusCircle size={14} /> Create Trip
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {displayTrips.map((trip) => {
                  const daysUntil = getDaysUntilTrip(trip.start_date);
                  const isActivenow = new Date(trip.start_date) <= now && new Date(trip.end_date) >= now;
                  const count = trip.trip_members?.[0]?.count ?? 1;
                  return (
                    <Link key={trip.id} href={`/trip/${trip.id}`} style={{ textDecoration: "none" }}>
                      <div className="card-hover" style={{ padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                            {getTripTypeEmoji(trip.trip_type)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                              <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.88)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trip.title}</p>
                              {isActivenow && (
                                <span className="badge badge-green" style={{ flexShrink: 0 }}>
                                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", animation: "pulse-dot 2s infinite" }} />
                                  Active
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>{trip.destination}</p>
                            <div style={{ display: "flex", gap: 14, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={10} />{formatDate(trip.start_date)}</span>
                              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={10} />{count}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            {!isActivenow && daysUntil >= 0 && (
                              <p style={{ fontSize: 13, fontWeight: 700, color: daysUntil <= 7 ? "#fbbf24" : "#60a5fa" }}>
                                {daysUntil === 0 ? "Today!" : `${daysUntil}d`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { icon: PlusCircle, label: "New Trip", href: "/dashboard/create", color: "#60a5fa" },
                { icon: Sparkles, label: "AI Itinerary", href: "/dashboard/trips", color: "#a78bfa" },
                { icon: Map, label: "All Trips", href: "/dashboard/trips", color: "#34d399" },
                { icon: DollarSign, label: "Expenses", href: "/dashboard/trips", color: "#fbbf24" },
              ].map((a) => (
                <Link key={a.label} href={a.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "14px 16px", borderRadius: 12,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex", flexDirection: "column", gap: 8,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.background = "rgba(255,255,255,0.05)"; el.style.borderColor = "rgba(255,255,255,0.12)"; }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.background = "rgba(255,255,255,0.02)"; el.style.borderColor = "rgba(255,255,255,0.07)"; }}
                  >
                    <a.icon size={18} color={a.color} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>{a.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
