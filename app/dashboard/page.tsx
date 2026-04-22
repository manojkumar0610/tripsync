import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import {
  PlusCircle, Map, DollarSign, Calendar,
  ArrowRight, Sparkles, Plane, TrendingUp,
  Users, Clock, ChevronRight
} from "lucide-react";
import {
  formatCurrency, formatDate, getDaysUntilTrip,
  getTripTypeEmoji, getInitials
} from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
  const { data: tripMembers } = await supabase.from("trip_members").select("trip_id, role").eq("user_id", user.id);
  const tripIds = (tripMembers ?? []).map((m) => m.trip_id);

  let trips: any[] = [];
  if (tripIds.length > 0) {
    const { data } = await supabase.from("trips").select("*, trip_members(count)").in("id", tripIds).order("start_date", { ascending: true });
    trips = data ?? [];
  }

  const now = new Date();
  const upcomingTrips = trips.filter(t => new Date(t.start_date) >= now).slice(0, 4);
  const activeTrips = trips.filter(t => new Date(t.start_date) <= now && new Date(t.end_date) >= now);
  const pastTrips = trips.filter(t => new Date(t.end_date) < now);

  let totalSpent = 0, pendingBalance = 0;
  if (tripIds.length > 0) {
    const { data: paid } = await supabase.from("expenses").select("amount").eq("paid_by", user.id);
    totalSpent = (paid ?? []).reduce((s: number, e: any) => s + Number(e.amount), 0);
    const { data: splits } = await supabase.from("expense_splits").select("amount, expense_id, expenses(paid_by)").eq("user_id", user.id).eq("is_settled", false);
    pendingBalance = (splits ?? []).filter((s: any) => s.expenses?.paid_by !== user.id).reduce((s: number, x: any) => s + Number(x.amount), 0);
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = profile?.full_name?.split(" ")[0] ?? "Traveler";

  const stats = [
    { label: "Total Trips", value: trips.length.toString(), icon: Map, color: "text-blue-400", glow: "shadow-blue-500/20", bg: "from-blue-600/10 to-blue-600/5", border: "border-blue-500/10" },
    { label: "Upcoming", value: upcomingTrips.length.toString(), icon: Calendar, color: "text-violet-400", glow: "shadow-violet-500/20", bg: "from-violet-600/10 to-violet-600/5", border: "border-violet-500/10" },
    { label: "Total Spent", value: formatCurrency(totalSpent), icon: TrendingUp, color: "text-emerald-400", glow: "shadow-emerald-500/20", bg: "from-emerald-600/10 to-emerald-600/5", border: "border-emerald-500/10" },
    { label: "You Owe", value: formatCurrency(pendingBalance), icon: DollarSign, color: pendingBalance > 0 ? "text-rose-400" : "text-emerald-400", glow: pendingBalance > 0 ? "shadow-rose-500/20" : "shadow-emerald-500/20", bg: pendingBalance > 0 ? "from-rose-600/10 to-rose-600/5" : "from-emerald-600/10 to-emerald-600/5", border: pendingBalance > 0 ? "border-rose-500/10" : "border-emerald-500/10" },
  ];

  return (
    <div className="animate-fade-in">
      <DashboardHeader title="Dashboard" subtitle="Your travel command center" />

      <div className="page-container py-8 space-y-8">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/40 text-sm mb-0.5">{greeting} 👋</p>
            <h2 className="text-2xl font-bold text-white">{firstName}</h2>
          </div>
          <Link href="/dashboard/create">
            <button className="btn-glow flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-white">
              <PlusCircle className="w-4 h-4" />
              New Trip
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className={`stat-card bg-gradient-to-br ${stat.bg} border ${stat.border}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${stat.color} mb-0.5`}>{stat.value}</p>
              <p className="text-xs text-white/35">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trips */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                {activeTrips.length > 0 ? "Active & Upcoming" : "Upcoming Trips"}
              </h3>
              <Link href="/dashboard/trips">
                <button className="flex items-center gap-1 text-xs text-white/35 hover:text-white/70 transition-colors">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>

            {[...activeTrips, ...upcomingTrips].length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <Plane className="w-6 h-6 text-white/20 rotate-45" />
                </div>
                <p className="text-white/50 font-medium mb-1">No trips yet</p>
                <p className="text-white/25 text-sm mb-5">Start planning your next adventure</p>
                <Link href="/dashboard/create">
                  <button className="btn-glow h-9 px-5 rounded-xl text-sm font-semibold text-white inline-flex items-center gap-2">
                    <PlusCircle className="w-3.5 h-3.5" /> Create Trip
                  </button>
                </Link>
              </div>
            ) : (
              [...activeTrips, ...upcomingTrips].slice(0, 4).map((trip) => {
                const daysUntil = getDaysUntilTrip(trip.start_date);
                const isActive = new Date(trip.start_date) <= now && new Date(trip.end_date) >= now;
                const memberCount = trip.trip_members?.[0]?.count ?? 1;
                return (
                  <Link key={trip.id} href={`/trip/${trip.id}`}>
                    <div className="card-glow p-4 cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-white/[0.06] flex items-center justify-center text-xl shrink-0">
                          {getTripTypeEmoji(trip.trip_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-white/90 truncate">{trip.title}</p>
                            {isActive && (
                              <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/35 mb-1.5">{trip.destination}</p>
                          <div className="flex items-center gap-3 text-[11px] text-white/25">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(trip.start_date)}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{memberCount}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {!isActive && daysUntil >= 0 && (
                            <p className={`text-sm font-bold ${daysUntil <= 7 ? "text-amber-400" : "text-blue-400"}`}>
                              {daysUntil === 0 ? "Today!" : `${daysUntil}d`}
                            </p>
                          )}
                          <ArrowRight className="w-4 h-4 text-white/15 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick actions */}
            <div>
              <h3 className="text-base font-semibold text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { icon: PlusCircle, label: "Create New Trip", href: "/dashboard/create", color: "text-blue-400" },
                  { icon: Sparkles, label: "AI Itinerary", href: "/dashboard/trips", color: "text-violet-400" },
                  { icon: Map, label: "View All Trips", href: "/dashboard/trips", color: "text-emerald-400" },
                  { icon: DollarSign, label: "Expenses", href: "/dashboard/trips", color: "text-amber-400" },
                ].map((action) => (
                  <Link key={action.label} href={action.href}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer group">
                      <action.icon className={`w-4 h-4 ${action.color} shrink-0`} />
                      <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">{action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white/20 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Stats mini card */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-600/10 via-violet-600/10 to-blue-600/5 border border-blue-500/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-white/70">Your Stats</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Completed", value: pastTrips.length, total: trips.length, color: "bg-blue-500" },
                  { label: "Active", value: activeTrips.length, total: Math.max(activeTrips.length, 1), color: "bg-emerald-500" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white/40">{item.label}</span>
                      <span className="text-white/60 font-medium">{item.value}/{item.total}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-700`}
                        style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {trips.length === 0 && (
                <p className="text-xs text-white/25 mt-3">Create your first trip to see stats!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
