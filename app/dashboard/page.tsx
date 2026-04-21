import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  PlusCircle, Map, DollarSign, Users, TrendingUp,
  Calendar, ArrowRight, Sparkles, Clock, Plane
} from "lucide-react";
import {
  formatCurrency, formatDate, getDaysUntilTrip,
  getTripTypeEmoji, getInitials, truncate
} from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch user profile
  const { data: profile } = await supabase
    .from("users").select("*").eq("id", user.id).single();

  // Fetch trips where user is member
  const { data: tripMembers } = await supabase
    .from("trip_members")
    .select("trip_id, role")
    .eq("user_id", user.id);

  const tripIds = (tripMembers ?? []).map((m) => m.trip_id);

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
  const upcomingTrips = trips.filter((t) => new Date(t.start_date) >= now).slice(0, 3);
  const pastTrips = trips.filter((t) => new Date(t.end_date) < now).length;

  // Fetch expenses
  let totalSpent = 0;
  let pendingBalance = 0;
  if (tripIds.length > 0) {
    const { data: expenseSplits } = await supabase
      .from("expense_splits")
      .select("amount, is_settled, expense_id, expenses(paid_by)")
      .eq("user_id", user.id)
      .eq("is_settled", false);

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

  return (
    <div className="page-enter">
      <DashboardHeader title="Dashboard" subtitle="Your travel command center" />

      <div className="page-container py-6 space-y-8">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-syne text-2xl font-bold">
              {greeting()}, {firstName} 👋
            </h2>
            <p className="text-muted-foreground mt-1">
              {upcomingTrips.length > 0
                ? `You have ${upcomingTrips.length} upcoming trip${upcomingTrips.length > 1 ? "s" : ""}`
                : "Ready to plan your next adventure?"}
            </p>
          </div>
          <Link href="/dashboard/create">
            <Button variant="gradient" size="lg" className="gap-2">
              <PlusCircle size={18} />
              Plan New Trip
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Trips",
              value: trips.length,
              icon: Map,
              color: "text-blue-600",
              bg: "bg-blue-50 dark:bg-blue-950/30",
              suffix: "",
            },
            {
              label: "Upcoming",
              value: upcomingTrips.length,
              icon: Calendar,
              color: "text-violet-600",
              bg: "bg-violet-50 dark:bg-violet-950/30",
              suffix: "",
            },
            {
              label: "Total Spent",
              value: formatCurrency(totalSpent),
              icon: DollarSign,
              color: "text-emerald-600",
              bg: "bg-emerald-50 dark:bg-emerald-950/30",
              suffix: "",
              isFormatted: true,
            },
            {
              label: "You Owe",
              value: formatCurrency(pendingBalance),
              icon: TrendingUp,
              color: pendingBalance > 0 ? "text-red-500" : "text-emerald-600",
              bg: pendingBalance > 0 ? "bg-red-50 dark:bg-red-950/30" : "bg-emerald-50 dark:bg-emerald-950/30",
              suffix: "",
              isFormatted: true,
            },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`font-syne text-2xl font-bold mt-1 ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Trips */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-syne text-lg font-semibold">Upcoming Trips</h3>
              <Link href="/dashboard/trips">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  View all <ArrowRight size={14} />
                </Button>
              </Link>
            </div>

            {upcomingTrips.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="rounded-full bg-muted p-4">
                    <Plane size={28} className="text-muted-foreground" />
                  </div>
                  <p className="font-semibold">No upcoming trips</p>
                  <p className="text-sm text-muted-foreground text-center">
                    Start planning your next adventure
                  </p>
                  <Link href="/dashboard/create">
                    <Button variant="gradient" size="sm">Create Trip</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              upcomingTrips.map((trip) => {
                const daysUntil = getDaysUntilTrip(trip.start_date);
                const memberCount = trip.trip_members?.[0]?.count ?? 1;
                return (
                  <Link key={trip.id} href={`/trip/${trip.id}`}>
                    <Card className="trip-card-hover cursor-pointer overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex items-center gap-4 p-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-violet-500 text-2xl shadow-md shrink-0">
                            {getTripTypeEmoji(trip.trip_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-syne font-semibold truncate">{trip.title}</p>
                              <Badge variant={daysUntil <= 7 ? "warning" : "info"} className="shrink-0 text-[10px]">
                                {daysUntil === 0 ? "Today!" : daysUntil < 0 ? "Active" : `${daysUntil}d away`}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{trip.destination}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar size={11} />
                                {formatDate(trip.start_date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users size={11} />
                                {memberCount} member{memberCount !== 1 ? "s" : ""}
                              </span>
                              {trip.budget > 0 && (
                                <span className="flex items-center gap-1">
                                  <DollarSign size={11} />
                                  {formatCurrency(trip.budget)}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-muted-foreground shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>

          {/* Quick Actions + Activity */}
          <div className="space-y-4">
            <h3 className="font-syne text-lg font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { icon: PlusCircle, label: "Create Trip", href: "/dashboard/create", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
                { icon: Sparkles, label: "Generate Itinerary", href: "/dashboard/trips", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
                { icon: DollarSign, label: "Add Expense", href: "/dashboard/trips", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
                { icon: Users, label: "Invite Friends", href: "/dashboard/trips", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
              ].map((action) => (
                <Link key={action.label} href={action.href}>
                  <div className="flex items-center gap-3 rounded-xl border p-3 hover:bg-accent transition-colors cursor-pointer group">
                    <div className={`rounded-lg p-2 ${action.bg}`}>
                      <action.icon size={16} className={action.color} />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                    <ArrowRight size={14} className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Stats card */}
            <Card className="bg-gradient-to-br from-blue-600 to-violet-700 text-white border-0 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} />
                  <span className="text-sm font-semibold">Travel Stats</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1 opacity-90">
                      <span>Trips Completed</span>
                      <span>{pastTrips}/{trips.length}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{ width: trips.length ? `${(pastTrips / trips.length) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                  <p className="text-xs opacity-80">
                    {trips.length === 0
                      ? "Create your first trip to get started!"
                      : `${pastTrips} completed, ${upcomingTrips.length} upcoming`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
