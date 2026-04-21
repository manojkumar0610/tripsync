"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TripOverviewTab } from "@/components/trips/trip-overview-tab";
import { TripMembersTab } from "@/components/trips/trip-members-tab";
import { ExpensesTab } from "@/components/expenses/expenses-tab";
import { ItineraryTab } from "@/components/itinerary/itinerary-tab";
import { VotesTab } from "@/components/votes/votes-tab";
import { TripSettingsTab } from "@/components/trips/trip-settings-tab";
import { WeatherWidget } from "@/components/trips/weather-widget";
import { ExportPDFButton } from "@/components/trips/export-pdf-button";
import { formatDate, getTripTypeEmoji, getDaysUntilTrip } from "@/lib/utils";
import { Calendar, MapPin, ChevronLeft } from "lucide-react";

interface TripDetailClientProps {
  trip: any;
  members: any[];
  expenses: any[];
  votes: any[];
  itineraries: any[];
  currentUser: any;
  userRole: string;
}

export function TripDetailClient({
  trip, members, expenses, votes, itineraries, currentUser, userRole,
}: TripDetailClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const daysUntil = getDaysUntilTrip(trip.start_date);
  const isPast = new Date(trip.end_date) < new Date();
  const isActive =
    new Date(trip.start_date) <= new Date() && new Date(trip.end_date) >= new Date();

  return (
    <div className="page-enter min-h-screen">
      {/* Trip Hero Header */}
      <div className="relative overflow-hidden border-b bg-gradient-to-br from-blue-600 via-violet-600 to-blue-800 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="page-container py-6 relative">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard/trips">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5"
              >
                <ChevronLeft size={16} /> Back to Trips
              </Button>
            </Link>
            <ExportPDFButton
              trip={trip}
              members={members}
              expenses={expenses}
              itinerary={itineraries[0]}
              variant="ghost"
              size="sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur text-3xl shrink-0">
              {getTripTypeEmoji(trip.trip_type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="font-syne text-2xl font-bold">{trip.title}</h1>
                {isActive && (
                  <Badge className="bg-emerald-400/20 text-emerald-200 border-emerald-400/30 text-xs">
                    ● Active
                  </Badge>
                )}
                {isPast && (
                  <Badge className="bg-white/20 text-white/80 border-white/30 text-xs">
                    Completed
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-white/80 text-sm flex-wrap">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} /> {trip.destination}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
                </span>
                {!isPast && daysUntil >= 0 && (
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    {daysUntil === 0 ? "🎉 Starts today!" : `${daysUntil} days away`}
                  </Badge>
                )}
              </div>
            </div>
            <WeatherWidget destination={trip.destination} compact />
          </div>
        </div>
      </div>

      <div className="page-container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-auto flex-wrap gap-1 p-1 mb-6 w-full sm:w-auto overflow-x-auto">
            {[
              { value: "overview",  label: "Overview" },
              { value: "members",   label: `Members (${members.length})` },
              { value: "expenses",  label: `Expenses (${expenses.length})` },
              { value: "itinerary", label: "Itinerary" },
              { value: "votes",     label: `Votes (${votes.length})` },
              ...(userRole === "owner" ? [{ value: "settings", label: "Settings" }] : []),
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <TripOverviewTab
              trip={trip}
              members={members}
              expenses={expenses}
              itineraries={itineraries}
              currentUser={currentUser}
            />
          </TabsContent>
          <TabsContent value="members">
            <TripMembersTab
              trip={trip}
              members={members}
              currentUser={currentUser}
              userRole={userRole}
            />
          </TabsContent>
          <TabsContent value="expenses">
            <ExpensesTab
              trip={trip}
              expenses={expenses}
              members={members}
              currentUser={currentUser}
            />
          </TabsContent>
          <TabsContent value="itinerary">
            <ItineraryTab
              trip={trip}
              itineraries={itineraries}
              currentUser={currentUser}
            />
          </TabsContent>
          <TabsContent value="votes">
            <VotesTab trip={trip} votes={votes} currentUser={currentUser} />
          </TabsContent>
          {userRole === "owner" && (
            <TabsContent value="settings">
              <TripSettingsTab trip={trip} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
