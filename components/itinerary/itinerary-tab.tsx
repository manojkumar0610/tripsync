"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, ChevronDown, ChevronUp, Clock, MapPin,
  Utensils, DollarSign, Loader2, Calendar, Download
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, TRIP_INTERESTS, TRIP_STYLES } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ItineraryTabProps {
  trip: any;
  itineraries: any[];
  currentUser: any;
}

export function ItineraryTab({ trip, itineraries, currentUser }: ItineraryTabProps) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [tripStyle, setTripStyle] = useState("Comfort");
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [currentItinerary, setCurrentItinerary] = useState(
    itineraries.length > 0 ? itineraries[0] : null
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const generateItinerary = async () => {
    setGenerating(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 85));
    }, 400);

    try {
      const res = await fetch("/api/ai/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: trip.id,
          destination: trip.destination,
          start_date: trip.start_date,
          end_date: trip.end_date,
          budget: trip.budget,
          trip_type: trip.trip_type,
          interests: selectedInterests,
          trip_style: tripStyle,
          num_people: 2,
        }),
      });

      clearInterval(interval);
      setProgress(100);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to generate itinerary");
      }

      const data = await res.json();
      setCurrentItinerary(data);
      toast.success("✨ Itinerary generated!");
    } catch (err: any) {
      toast.error(err.message ?? "Generation failed");
    } finally {
      setGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const downloadItinerary = () => {
    if (!currentItinerary) return;
    const content = generateTextItinerary(currentItinerary.content, trip);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${trip.title.replace(/\s+/g, "-")}-itinerary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      {!currentItinerary || true ? (
        <Card className="border-violet-200 dark:border-violet-900/30 bg-gradient-to-br from-violet-50/50 to-blue-50/50 dark:from-violet-950/20 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={18} className="text-violet-600" />
              AI Itinerary Generator
            </CardTitle>
            <CardDescription>
              Generate a personalized day-by-day itinerary for {trip.destination}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Trip Style</Label>
              <Select value={tripStyle} onValueChange={setTripStyle}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIP_STYLES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Interests (select all that apply)</Label>
              <div className="flex flex-wrap gap-2">
                {TRIP_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                      selectedInterests.includes(interest)
                        ? "border-violet-500 bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
                        : "border-border hover:border-violet-300 hover:bg-muted"
                    )}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {generating && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-violet-600">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Crafting your perfect itinerary...</span>
                </div>
                <Progress value={progress} className="[&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-blue-500" />
              </div>
            )}

            <Button
              variant="gradient"
              className="w-full gap-2"
              onClick={generateItinerary}
              disabled={generating}
            >
              {generating ? (
                <><Loader2 size={16} className="animate-spin" /> Generating...</>
              ) : (
                <><Sparkles size={16} /> Generate AI Itinerary</>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Itinerary Display */}
      {currentItinerary && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-syne text-lg font-semibold">Your Itinerary</h3>
              {currentItinerary.content?.summary && (
                <p className="text-sm text-muted-foreground mt-0.5">{currentItinerary.content.summary}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={downloadItinerary}>
                <Download size={14} /> Download
              </Button>
              <Button
                variant="gradient"
                size="sm"
                className="gap-2"
                onClick={generateItinerary}
                disabled={generating}
              >
                <Sparkles size={14} /> Regenerate
              </Button>
            </div>
          </div>

          {/* Summary stats */}
          {currentItinerary.content?.estimated_total_cost && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border bg-card p-3 text-center">
                <Calendar size={16} className="text-blue-600 mx-auto mb-1" />
                <p className="font-bold text-lg">{currentItinerary.content.days?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Days</p>
              </div>
              <div className="rounded-xl border bg-card p-3 text-center">
                <DollarSign size={16} className="text-emerald-600 mx-auto mb-1" />
                <p className="font-bold text-lg">{formatCurrency(currentItinerary.content.estimated_total_cost)}</p>
                <p className="text-xs text-muted-foreground">Est. Cost</p>
              </div>
              <div className="rounded-xl border bg-card p-3 text-center">
                <MapPin size={16} className="text-violet-600 mx-auto mb-1" />
                <p className="font-bold text-lg">
                  {currentItinerary.content.days?.reduce(
                    (sum: number, d: any) => sum + (d.morning?.length || 0) + (d.afternoon?.length || 0) + (d.evening?.length || 0), 0
                  ) ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Activities</p>
              </div>
            </div>
          )}

          {/* Daily itinerary */}
          {currentItinerary.content?.days?.map((day: any, idx: number) => (
            <Card key={idx} className="overflow-hidden">
              <button
                className="w-full text-left"
                onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
              >
                <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white font-syne font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-syne font-semibold">Day {day.day} — {day.theme}</p>
                      {day.date && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-emerald-600">
                      ~{formatCurrency(day.estimated_cost)}
                    </span>
                    {expandedDay === idx ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                  </div>
                </div>
              </button>

              {expandedDay === idx && (
                <div className="border-t px-4 pb-4 space-y-4">
                  {/* Time slots */}
                  {[
                    { label: "☀️ Morning", activities: day.morning },
                    { label: "🌤️ Afternoon", activities: day.afternoon },
                    { label: "🌙 Evening", activities: day.evening },
                  ].map(({ label, activities }) =>
                    activities?.length > 0 ? (
                      <div key={label}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3 mb-2">{label}</p>
                        <div className="space-y-2">
                          {activities.map((act: any, aIdx: number) => (
                            <div key={aIdx} className="flex gap-3 rounded-xl bg-muted/40 p-3">
                              <div className="flex flex-col items-center gap-1 text-center w-12 shrink-0">
                                <Clock size={12} className="text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">{act.time}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">{act.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{act.description}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <MapPin size={10} /> {act.location}
                                  </span>
                                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Clock size={10} /> {act.duration}
                                  </span>
                                  {act.cost > 0 && (
                                    <Badge variant="secondary" className="text-[10px] h-4">
                                      ~{formatCurrency(act.cost)}
                                    </Badge>
                                  )}
                                </div>
                                {act.tips && (
                                  <p className="text-[10px] text-blue-600 mt-1 italic">💡 {act.tips}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}

                  {/* Meals */}
                  {day.meals?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3 mb-2">
                        🍽️ Food & Dining
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {day.meals.map((meal: any, mIdx: number) => (
                          <div key={mIdx} className="rounded-xl border p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-semibold capitalize text-muted-foreground">{meal.type}</p>
                                <p className="text-sm font-medium">{meal.name}</p>
                                <p className="text-xs text-muted-foreground">{meal.cuisine}</p>
                              </div>
                              <Badge variant="outline" className="text-[10px] shrink-0">{meal.price_range}</Badge>
                            </div>
                            {meal.must_try && (
                              <p className="text-[10px] text-amber-600 mt-1">⭐ Must try: {meal.must_try}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}

          {/* Tips */}
          {currentItinerary.content?.tips?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">💡 Travel Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {currentItinerary.content.tips.map((tip: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-blue-500 shrink-0">→</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {itineraries.length === 0 && !currentItinerary && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="rounded-full bg-violet-50 dark:bg-violet-950/30 p-5">
              <Sparkles size={32} className="text-violet-500" />
            </div>
            <p className="font-semibold text-lg">No itinerary yet</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Let AI craft a personalized day-by-day travel plan for {trip.destination}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function generateTextItinerary(content: any, trip: any): string {
  let text = `TRIPSYNC ITINERARY\n`;
  text += `==================\n`;
  text += `Trip: ${trip.title}\n`;
  text += `Destination: ${trip.destination}\n`;
  text += `Dates: ${trip.start_date} to ${trip.end_date}\n\n`;
  if (content.summary) text += `${content.summary}\n\n`;
  content.days?.forEach((day: any) => {
    text += `DAY ${day.day}: ${day.theme}\n`;
    text += `${"─".repeat(40)}\n`;
    const allActivities = [
      ...((day.morning ?? []).map((a: any) => ({ ...a, period: "Morning" }))),
      ...((day.afternoon ?? []).map((a: any) => ({ ...a, period: "Afternoon" }))),
      ...((day.evening ?? []).map((a: any) => ({ ...a, period: "Evening" }))),
    ];
    allActivities.forEach((act) => {
      text += `[${act.period} - ${act.time}] ${act.title}\n`;
      text += `  📍 ${act.location} | ⏱ ${act.duration}`;
      if (act.cost > 0) text += ` | 💰 ~$${act.cost}`;
      text += `\n  ${act.description}\n`;
      if (act.tips) text += `  💡 ${act.tips}\n`;
      text += "\n";
    });
    if (day.meals?.length) {
      text += "MEALS:\n";
      day.meals.forEach((m: any) => {
        text += `  ${m.type.toUpperCase()}: ${m.name} (${m.cuisine}) — ${m.price_range}\n`;
      });
    }
    text += `Estimated daily cost: ~$${day.estimated_cost}\n\n`;
  });
  if (content.tips?.length) {
    text += "TRAVEL TIPS:\n";
    content.tips.forEach((tip: string) => { text += `• ${tip}\n`; });
  }
  return text;
}
