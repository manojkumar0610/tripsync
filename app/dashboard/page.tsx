import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  PlusCircle, Map, DollarSign, Users, TrendingUp,
  Calendar, ArrowRight, Sparkles, Plane, Bell,
  BarChart3, FileText, UserPlus, Search, Settings,
  ChevronRight, Gift, Activity, Briefcase
} from "lucide-react";
import {
  formatCurrency, formatDate, getDaysUntilTrip,
  getTripTypeEmoji, getInitials
} from "@/lib/utils";

// ── Wave SVG for stat cards ──────────────────────────────────
function WaveLine({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 30" fill="none" style={{ width: "100%", height: 30 }}>
      <path
        d="M0 15 C20 5, 40 25, 60 15 S100 5, 120 15"
        stroke={color} strokeWidth="2" fill="none" opacity="0.5"
      />
    </svg>
  );
}

export default async function DashboardPage() {
  // ── ALL DATA LOGIC UNCHANGED ────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users").select("*").eq("id", user.id).single();

  const { data: tripMembers } = await supabase
    .from("trip_members").select("trip_id, role").eq("user_id", user.id);

  const tripIds = (tripMembers ?? []).map((m: any) => m.trip_id);

  let trips: any[] = [];
  if (tripIds.length > 0) {
    const { data } = await supabase
      .from("trips").select("*, trip_members(count)")
      .in("id", tripIds).order("start_date", { ascending: true });
    trips = data ?? [];
  }

  const now = new Date();
  const upcomingTrips = trips.filter((t) => new Date(t.start_date) >= now).slice(0, 3);
  const pastTrips = trips.filter((t) => new Date(t.end_date) < now).length;

  let totalSpent = 0;
  let pendingBalance = 0;
  if (tripIds.length > 0) {
    const { data: expenseSplits } = await supabase
      .from("expense_splits")
      .select("amount, is_settled, expense_id, expenses(paid_by)")
      .eq("user_id", user.id).eq("is_settled", false);
    pendingBalance = (expenseSplits ?? [])
      .filter((s: any) => s.expenses?.paid_by !== user.id)
      .reduce((sum: number, s: any) => sum + Number(s.amount), 0);
    const { data: paidExpenses } = await supabase
      .from("expenses").select("amount").eq("paid_by", user.id);
    totalSpent = (paidExpenses ?? []).reduce((sum: number, e: any) => sum + Number(e.amount), 0);
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };
  const firstName = profile?.full_name?.split(" ")[0] ?? "Traveler";
  // ── END DATA LOGIC ──────────────────────────────────────────

  const stats = [
    {
      label: "Total Trips", value: trips.length.toString(),
      subtext: "Trips created", icon: Briefcase,
      color: "#7c3aed", wave: "#7c3aed", bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.2)",
    },
    {
      label: "Upcoming", value: upcomingTrips.length.toString(),
      subtext: "Trips coming up", icon: Calendar,
      color: "#3b82f6", wave: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.2)",
    },
    {
      label: "Total Spent", value: formatCurrency(totalSpent),
      subtext: "Total expenses", icon: DollarSign,
      color: "#10b981", wave: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.2)",
    },
    {
      label: "You Owe", value: formatCurrency(pendingBalance),
      subtext: "To be settled", icon: TrendingUp,
      color: pendingBalance > 0 ? "#f97316" : "#10b981",
      wave: pendingBalance > 0 ? "#f97316" : "#10b981",
      bg: pendingBalance > 0 ? "rgba(249,115,22,0.12)" : "rgba(16,185,129,0.12)",
      border: pendingBalance > 0 ? "rgba(249,115,22,0.2)" : "rgba(16,185,129,0.2)",
    },
  ];

  const quickActions = [
    { icon: PlusCircle, label: "Create Trip", desc: "Start a new trip\nfor your group", href: "/dashboard/create", color: "#7c3aed", bg: "rgba(124,58,237,0.15)" },
    { icon: Sparkles, label: "Generate Itinerary", desc: "AI-powered itinerary\nin seconds", href: "/dashboard/trips", color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
    { icon: DollarSign, label: "Add Expense", desc: "Track and split\nexpenses easily", href: "/dashboard/trips", color: "#10b981", bg: "rgba(16,185,129,0.15)" },
    { icon: UserPlus, label: "Invite Friends", desc: "Invite friends to\njoin your trip", href: "/dashboard/trips", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
    { icon: BarChart3, label: "Travel Stats", desc: "View your travel\ninsights", href: "/dashboard/trips", color: "#ec4899", bg: "rgba(236,72,153,0.15)" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .ts-dash * { box-sizing: border-box; }
        .ts-dash { font-family: 'Inter', system-ui, sans-serif; background: #0b0b14; min-height: 100vh; color: white; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .stat-card-ts { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card-ts:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.4) !important; }
        .trip-card-ts { transition: all 0.2s ease; cursor: pointer; }
        .trip-card-ts:hover { transform: translateY(-2px); border-color: rgba(124,58,237,0.35) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.35) !important; }
        .action-card-ts { transition: all 0.2s ease; cursor: pointer; }
        .action-card-ts:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.35) !important; }
        .plan-btn-ts:hover { opacity: 0.88; transform: translateY(-1px); }
        .plan-btn-ts:active { transform: none; }
        .view-all-ts:hover { color: white !important; }
        .sidebar-link-ts { transition: background 0.15s, color 0.15s; }
        .sidebar-link-ts:hover { background: rgba(255,255,255,0.06) !important; color: white !important; }
        .sidebar-link-ts.active-link { background: rgba(124,58,237,0.15) !important; color: #a78bfa !important; }
        @media (max-width: 768px) {
          .ts-dash-wrap { flex-direction: column !important; }
          .ts-sidebar { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .main-grid { grid-template-columns: 1fr !important; }
          .actions-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .ts-header-search { display: none !important; }
        }
      `}</style>

      <div className="ts-dash">
        <div className="ts-dash-wrap" style={{ display: "flex", minHeight: "100vh" }}>

          {/* ════════════════════════════════
              SIDEBAR (desktop)
          ════════════════════════════════ */}
          <aside className="ts-sidebar" style={{
            width: 220, minWidth: 220, height: "100vh",
            background: "#0e0c1c",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexDirection: "column",
            position: "sticky", top: 0, overflowY: "auto",
            flexShrink: 0,
          }}>
            {/* Logo */}
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(124,58,237,0.35)",
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5L12 2Z" fill="white" />
                  </svg>
                </div>
                <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>TripSync</span>
              </div>
            </div>

            {/* Nav items */}
            <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { icon: Map, label: "Dashboard", href: "/dashboard", active: true },
                { icon: Plane, label: "Trips", href: "/dashboard/trips" },
                { icon: Sparkles, label: "Itinerary", href: "/dashboard/trips" },
                { icon: DollarSign, label: "Expenses", href: "/dashboard/trips" },
                { icon: Users, label: "Groups", href: "/dashboard/trips" },
                { icon: UserPlus, label: "Friends", href: "/dashboard/trips" },
                { icon: Activity, label: "Activity", href: "/dashboard/trips" },
                { icon: Settings, label: "Settings", href: "/dashboard/settings" },
              ].map(({ icon: Icon, label, href, active }) => (
                <Link key={label} href={href} style={{ textDecoration: "none" }}>
                  <div className={`sidebar-link-ts${active ? " active-link" : ""}`} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 10,
                    color: active ? "#a78bfa" : "rgba(255,255,255,0.45)",
                    fontSize: 13.5, fontWeight: active ? 600 : 500,
                  }}>
                    <Icon size={16} style={{ flexShrink: 0 }} />
                    {label}
                  </div>
                </Link>
              ))}

              {/* Upgrade card */}
              <div style={{
                margin: "16px 4px 0", padding: "16px 14px", borderRadius: 14,
                background: "linear-gradient(135deg,rgba(124,58,237,0.18),rgba(109,40,217,0.1))",
                border: "1px solid rgba(124,58,237,0.2)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, marginBottom: 10,
                  background: "rgba(124,58,237,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Gift size={16} color="#a78bfa" />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Upgrade to Pro</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 12 }}>
                  Unlock premium features for your group trips.
                </p>
                <Link href="/dashboard/upgrade" style={{ textDecoration: "none" }}>
                  <button style={{
                    width: "100%", height: 32, borderRadius: 8, fontFamily: "inherit",
                    background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                    border: "none", fontSize: 12, fontWeight: 700, color: "white",
                    cursor: "pointer",
                  }}>
                    Upgrade Now
                  </button>
                </Link>
              </div>
            </nav>

            {/* User profile at bottom */}
            <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0,
                  overflow: "hidden",
                }}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : getInitials(profile?.full_name ?? profile?.email ?? "U")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {profile?.full_name ?? "Traveler"}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {profile?.email ?? ""}
                  </p>
                </div>
                <ChevronRight size={14} color="rgba(255,255,255,0.25)" />
              </div>
            </div>
          </aside>

          {/* ════════════════════════════════
              MAIN CONTENT
          ════════════════════════════════ */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

            {/* ── TOP HEADER ── */}
            <header style={{
              position: "sticky", top: 0, zIndex: 50,
              height: 64, display: "flex", alignItems: "center",
              justifyContent: "space-between", padding: "0 24px",
              background: "rgba(11,11,20,0.85)", backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              gap: 16,
            }}>
              {/* Search */}
              <div className="ts-header-search" style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "0 14px", height: 38, flex: 1, maxWidth: 320,
              }}>
                <Search size={14} color="rgba(255,255,255,0.3)" />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Search anything...</span>
                <kbd style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 5, fontFamily: "monospace" }}>⌘ K</kbd>
              </div>

              {/* Right side */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
                {/* Notification bell */}
                <div style={{ position: "relative" }}>
                  <button style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "rgba(255,255,255,0.6)",
                  }}>
                    <Bell size={16} />
                  </button>
                  <span style={{
                    position: "absolute", top: 8, right: 8,
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#7c3aed", border: "2px solid #0b0b14",
                  }} />
                </div>

                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "white",
                  overflow: "hidden", cursor: "pointer", flexShrink: 0,
                  border: "2px solid rgba(124,58,237,0.4)",
                }}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : getInitials(profile?.full_name ?? profile?.email ?? "U")}
                </div>
              </div>
            </header>

            {/* ── PAGE CONTENT ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 24px 40px" }}>

              {/* Welcome + CTA */}
              <div style={{
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                flexWrap: "wrap", gap: 16, marginBottom: 28,
                animation: "fadeUp 0.5s ease both",
              }}>
                {/* Hero banner */}
                <div style={{
                  flex: 1, minWidth: 280,
                  background: "linear-gradient(135deg,#1a0a3c 0%,#0e0c1c 60%,#0b0b14 100%)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  borderRadius: 20, padding: "24px 24px",
                  position: "relative", overflow: "hidden",
                  backgroundImage: "url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=60&auto=format&fit=crop')",
                  backgroundSize: "cover", backgroundPosition: "center right",
                }}>
                  {/* Overlay */}
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: 20,
                    background: "linear-gradient(to right, rgba(11,11,20,0.95) 40%, rgba(11,11,20,0.7) 70%, rgba(11,11,20,0.4) 100%)",
                  }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>
                      {greeting()} 👋
                    </p>
                    <h1 style={{
                      fontSize: "clamp(20px,3vw,28px)", fontWeight: 800,
                      letterSpacing: "-0.025em", marginBottom: 6,
                    }}>
                      {firstName}
                    </h1>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
                      {upcomingTrips.length > 0
                        ? `You have ${upcomingTrips.length} upcoming trip${upcomingTrips.length > 1 ? "s" : ""}`
                        : "Ready to plan your next adventure?"}
                    </p>
                    <Link href="/dashboard/create" style={{ textDecoration: "none" }}>
                      <button className="plan-btn-ts" style={{
                        height: 42, padding: "0 20px",
                        background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                        border: "none", borderRadius: 11,
                        display: "inline-flex", alignItems: "center", gap: 8,
                        fontSize: 14, fontWeight: 700, color: "white",
                        cursor: "pointer", fontFamily: "inherit",
                        transition: "all 0.2s ease",
                        boxShadow: "0 6px 20px rgba(124,58,237,0.4)",
                      }}>
                        <PlusCircle size={16} /> Plan New Trip
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* ── STATS GRID ── */}
              <div className="stats-grid" style={{
                display: "grid", gridTemplateColumns: "repeat(4,1fr)",
                gap: 14, marginBottom: 28,
                animation: "fadeUp 0.5s ease 0.05s both",
              }}>
                {stats.map((s, i) => (
                  <div key={s.label} className="stat-card-ts" style={{
                    background: "#0e0c1c",
                    border: `1px solid ${s.border}`,
                    borderRadius: 16, padding: "20px 20px 12px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                    animation: `fadeUp 0.5s ease ${0.05 + i * 0.05}s both`,
                  }}>
                    {/* Icon + label row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: s.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <s.icon size={17} color={s.color} />
                      </div>
                    </div>
                    {/* Value */}
                    <p style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, letterSpacing: "-0.02em", color: s.color, marginBottom: 3 }}>
                      {s.value}
                    </p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>{s.subtext}</p>
                    {/* Label */}
                    <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
                      {s.label}
                    </p>
                    {/* Wave */}
                    <WaveLine color={s.wave} />
                  </div>
                ))}
              </div>

              {/* ── MAIN GRID ── */}
              <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, marginBottom: 28 }}>

                {/* Upcoming Trips */}
                <div style={{ animation: "fadeUp 0.5s ease 0.15s both" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>Upcoming Trips</h2>
                    <Link href="/dashboard/trips" style={{ textDecoration: "none" }}>
                      <button className="view-all-ts" style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 13, fontWeight: 600, color: "#a78bfa",
                        display: "flex", alignItems: "center", gap: 4,
                        fontFamily: "inherit", transition: "color 0.15s", padding: "4px 8px",
                      }}>
                        View all <ChevronRight size={14} />
                      </button>
                    </Link>
                  </div>

                  {upcomingTrips.length === 0 ? (
                    /* Empty state */
                    <div style={{
                      background: "#0e0c1c",
                      border: "1px dashed rgba(255,255,255,0.1)",
                      borderRadius: 18, padding: "48px 24px",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: 12, textAlign: "center",
                    }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 20,
                        background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Plane size={28} color="#7c3aed" style={{ opacity: 0.7 }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No upcoming trips</p>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                          Start planning your next adventure with your group!
                        </p>
                      </div>
                      <Link href="/dashboard/create" style={{ textDecoration: "none" }}>
                        <button className="plan-btn-ts" style={{
                          height: 42, padding: "0 24px",
                          background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                          border: "none", borderRadius: 11,
                          fontSize: 14, fontWeight: 700, color: "white",
                          cursor: "pointer", fontFamily: "inherit",
                          transition: "all 0.2s ease",
                          boxShadow: "0 6px 20px rgba(124,58,237,0.35)",
                        }}>
                          Create Trip
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {upcomingTrips.map((trip) => {
                        const daysUntil = getDaysUntilTrip(trip.start_date);
                        const memberCount = trip.trip_members?.[0]?.count ?? 1;
                        return (
                          <Link key={trip.id} href={`/trip/${trip.id}`} style={{ textDecoration: "none" }}>
                            <div className="trip-card-ts" style={{
                              background: "#0e0c1c",
                              border: "1px solid rgba(255,255,255,0.07)",
                              borderRadius: 16, padding: "16px 18px",
                              display: "flex", alignItems: "center", gap: 14,
                              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                            }}>
                              <div style={{
                                width: 48, height: 48, borderRadius: 14,
                                background: "linear-gradient(135deg,rgba(124,58,237,0.25),rgba(168,85,247,0.2))",
                                border: "1px solid rgba(124,58,237,0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 22, flexShrink: 0,
                              }}>
                                {getTripTypeEmoji(trip.trip_type)}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                                  <p style={{ fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {trip.title}
                                  </p>
                                  <span style={{
                                    fontSize: 11, fontWeight: 700,
                                    padding: "3px 9px", borderRadius: 99,
                                    background: daysUntil <= 7 ? "rgba(249,115,22,0.15)" : "rgba(124,58,237,0.15)",
                                    color: daysUntil <= 7 ? "#fb923c" : "#a78bfa",
                                    border: `1px solid ${daysUntil <= 7 ? "rgba(249,115,22,0.25)" : "rgba(124,58,237,0.25)"}`,
                                    whiteSpace: "nowrap", flexShrink: 0,
                                  }}>
                                    {daysUntil === 0 ? "Today!" : daysUntil < 0 ? "Active" : `${daysUntil}d away`}
                                  </span>
                                </div>
                                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                                  {trip.destination}
                                </p>
                                <div style={{ display: "flex", gap: 14, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <Calendar size={10} /> {formatDate(trip.start_date)}
                                  </span>
                                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <Users size={10} /> {memberCount} member{memberCount !== 1 ? "s" : ""}
                                  </span>
                                  {trip.budget > 0 && (
                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                      <DollarSign size={10} /> {formatCurrency(trip.budget)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ArrowRight size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right column: Recent Activity + Promo */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp 0.5s ease 0.2s both" }}>

                  {/* Recent Activity */}
                  <div>
                    <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 14 }}>Recent Activity</h2>
                    <div style={{
                      background: "#0e0c1c",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 18, padding: "32px 20px",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: 10, textAlign: "center",
                    }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <FileText size={22} color="rgba(255,255,255,0.2)" />
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>No recent activity yet</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>
                        Your trip activities and updates will appear here.
                      </p>
                    </div>
                  </div>

                  {/* Promo card */}
                  <div style={{
                    borderRadius: 18, overflow: "hidden",
                    position: "relative",
                    background: "#0e0c1c",
                    border: "1px solid rgba(124,58,237,0.2)",
                  }}>
                    {/* Background image */}
                    <div style={{
                      position: "absolute", inset: 0,
                      backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=60&auto=format&fit=crop')",
                      backgroundSize: "cover", backgroundPosition: "center",
                    }} />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to bottom, rgba(11,11,20,0.5) 0%, rgba(11,11,20,0.85) 60%, rgba(11,11,20,0.98) 100%)",
                    }} />
                    <div style={{ position: "relative", zIndex: 1, padding: "20px 20px 20px" }}>
                      <div style={{ paddingTop: 80 }}>
                        <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.01em" }}>
                          Let's plan something amazing! ✨
                        </p>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 16 }}>
                          Whether it's a weekend getaway or a long adventure, TripSync has got your back.
                        </p>
                        <Link href="/dashboard/create" style={{ textDecoration: "none" }}>
                          <button className="plan-btn-ts" style={{
                            width: "100%", height: 42, borderRadius: 11,
                            background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                            border: "none", fontSize: 13, fontWeight: 700, color: "white",
                            cursor: "pointer", fontFamily: "inherit",
                            transition: "all 0.2s ease",
                            boxShadow: "0 6px 20px rgba(124,58,237,0.4)",
                          }}>
                            Plan Your First Trip
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── QUICK ACTIONS ── */}
              <div style={{ animation: "fadeUp 0.5s ease 0.25s both", marginBottom: 28 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 14 }}>Quick Actions</h2>
                <div className="actions-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
                  {quickActions.map((a, i) => (
                    <Link key={a.label} href={a.href} style={{ textDecoration: "none" }}>
                      <div className="action-card-ts" style={{
                        background: "#0e0c1c",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 16, padding: "20px 16px",
                        display: "flex", flexDirection: "column", gap: 10,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                        animation: `fadeUp 0.5s ease ${0.25 + i * 0.04}s both`,
                      }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: a.bg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <a.icon size={20} color={a.color} />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{a.label}</p>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                            {a.desc}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── FOOTER CTA STRIP ── */}
              <div style={{
                background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(109,40,217,0.06))",
                border: "1px solid rgba(124,58,237,0.15)",
                borderRadius: 18, padding: "20px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 16, flexWrap: "wrap",
                animation: "fadeUp 0.5s ease 0.35s both",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: "rgba(124,58,237,0.18)", border: "1px solid rgba(124,58,237,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Gift size={22} color="#a78bfa" />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>Bring your travel dreams to life</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                      Plan, collaborate, and create unforgettable memories with your favorite people.
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/create" style={{ textDecoration: "none" }}>
                  <button className="plan-btn-ts" style={{
                    height: 44, padding: "0 22px",
                    background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                    border: "none", borderRadius: 11,
                    display: "inline-flex", alignItems: "center", gap: 8,
                    fontSize: 14, fontWeight: 700, color: "white",
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.2s ease",
                    boxShadow: "0 6px 20px rgba(124,58,237,0.35)",
                    whiteSpace: "nowrap",
                  }}>
                    Start Planning Now <ArrowRight size={16} />
                  </button>
                </Link>
              </div>

              {/* ── FOOTER ── */}
              <div style={{
                marginTop: 32, paddingTop: 20,
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: 12,
              }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
                  © {new Date().getFullYear()} TripSync. All rights reserved.
                </p>
                <div style={{ display: "flex", gap: 20 }}>
                  {["Privacy Policy", "Terms of Service", "Help Center"].map(item => (
                    <a key={item} href="#" style={{
                      fontSize: 12, color: "rgba(255,255,255,0.25)",
                      textDecoration: "none", transition: "color 0.15s",
                    }}
                      onMouseEnter={e => (e.target as HTMLElement).style.color = "rgba(255,255,255,0.6)"}
                      onMouseLeave={e => (e.target as HTMLElement).style.color = "rgba(255,255,255,0.25)"}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
