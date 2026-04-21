"use client";

import { useState } from "react";
import { ShareTripDialog } from "@/components/trips/share-trip-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Copy, Check, Share2, Users, DollarSign, Calendar,
  FileText, Sparkles, Map
} from "lucide-react";
import { toast } from "sonner";
import {
  formatCurrency, formatDate, getTripDuration,
  getInitials, getTripTypeLabel
} from "@/lib/utils";

interface TripOverviewTabProps {
  trip: any;
  members: any[];
  expenses: any[];
  itineraries: any[];
  currentUser: any;
}

export function TripOverviewTab({ trip, members, expenses, itineraries, currentUser }: TripOverviewTabProps) {
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
  const budgetPercent = trip.budget > 0 ? Math.min((totalExpenses / trip.budget) * 100, 100) : 0;
  const duration = getTripDuration(trip.start_date, trip.end_date);

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join?code=${trip.invite_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Duration", value: `${duration} days`, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
            { label: "Members", value: members.length, icon: Users, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
            { label: "Expenses", value: expenses.length, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "Type", value: getTripTypeLabel(trip.trip_type), icon: Map, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card p-4">
              <div className={`rounded-xl p-2 w-fit ${s.bg} mb-2`}>
                <s.icon size={16} className={s.color} />
              </div>
              <p className="font-syne font-bold text-lg">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Budget */}
        {trip.budget > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Budget Tracker</span>
                <span className={`text-sm font-normal ${budgetPercent >= 90 ? "text-red-500" : "text-muted-foreground"}`}>
                  {formatCurrency(totalExpenses)} / {formatCurrency(trip.budget)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={budgetPercent} className={budgetPercent >= 90 ? "[&>div]:bg-red-500" : ""} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{budgetPercent.toFixed(0)}% used</span>
                <span>{formatCurrency(trip.budget - totalExpenses)} remaining</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {trip.notes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText size={16} className="text-blue-600" /> Trip Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{trip.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Latest Itinerary Preview */}
        {itineraries.length > 0 && (
          <Card className="border-violet-200 dark:border-violet-900/30 bg-violet-50/30 dark:bg-violet-950/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles size={16} className="text-violet-600" /> AI Itinerary Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {itineraries[0].content?.days?.length ?? 0}-day itinerary generated
              </p>
              <Badge variant="info">View in Itinerary tab</Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right column */}
      <div className="space-y-5">
        {/* Members */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Trip Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={m.user?.avatar_url ?? ""} />
                  <AvatarFallback className="text-xs">
                    {getInitials(m.user?.full_name ?? m.user?.email ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {m.user?.full_name ?? m.user?.email ?? "Unknown"}
                    {m.user_id === currentUser?.id && (
                      <span className="text-xs text-muted-foreground"> (you)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                </div>
                {m.role === "owner" && (
                  <Badge variant="info" className="text-[10px]">Owner</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Invite */}
        <Card className="border-blue-200 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Share2 size={16} className="text-blue-600" /> Invite Friends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border bg-background p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Join Code</p>
              <p className="font-syne text-2xl font-bold tracking-widest text-blue-600">
                {trip.invite_code}
              </p>
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={copyInviteLink}>
              {copied ? (
                <><Check size={16} className="text-emerald-600" /> Copied!</>
              ) : (
                <><Copy size={16} /> Copy Invite Link</>
              )}
            </Button>
            <Button
              variant="gradient"
              className="w-full gap-2"
              onClick={() => setShowShare(true)}
            >
              <Share2 size={16} /> Share Trip
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>

    <ShareTripDialog
      trip={trip}
      members={members}
      expenses={expenses}
      open={showShare}
      onClose={() => setShowShare(false)}
    />
    </>
  );
}
