"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { MapPin, Calendar, DollarSign, Users, ArrowRight, Loader2 } from "lucide-react";

const TRIP_TYPES = [
  { value: "friends", label: "Friends", emoji: "🎉", desc: "Party with pals" },
  { value: "family", label: "Family", emoji: "👨‍👩‍👧‍👦", desc: "Family getaway" },
  { value: "solo", label: "Solo", emoji: "🧭", desc: "Solo adventure" },
  { value: "bike_trip", label: "Bike Trip", emoji: "🏍️", desc: "Ride the roads" },
];

export default function CreateTripPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    destination: "",
    start_date: "",
    end_date: "",
    budget: "",
    trip_type: "friends",
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.destination || !form.start_date || !form.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      toast.error("End date must be after start date");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data, error } = await supabase.from("trips").insert({
        title: form.title,
        destination: form.destination,
        start_date: form.start_date,
        end_date: form.end_date,
        budget: parseFloat(form.budget) || 0,
        trip_type: form.trip_type,
        notes: form.notes || null,
        created_by: user.id,
      }).select().single();

      if (error) throw error;

      toast.success("🎉 Trip created successfully!");
      router.push(`/trip/${data.id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter">
      <DashboardHeader title="Create Trip" subtitle="Plan your next adventure" />

      <div className="page-container py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin size={18} className="text-blue-600" /> Trip Details
              </CardTitle>
              <CardDescription>Give your trip a name and destination</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Trip Name *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Summer in Bali 🌴"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  placeholder="e.g. Bali, Indonesia"
                  value={form.destination}
                  onChange={(e) => handleChange("destination", e.target.value)}
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* Dates & Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar size={18} className="text-violet-600" /> Dates & Budget
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={(e) => handleChange("start_date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={(e) => handleChange("end_date", e.target.value)}
                    min={form.start_date || new Date().toISOString().split("T")[0]}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Total Budget (USD)</Label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0.00"
                    value={form.budget}
                    onChange={(e) => handleChange("budget", e.target.value)}
                    className="h-11 pl-8"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users size={18} className="text-emerald-600" /> Trip Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TRIP_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange("trip_type", type.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all cursor-pointer hover:border-blue-300",
                      form.trip_type === type.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <span className="text-2xl">{type.emoji}</span>
                    <span className="text-sm font-semibold">{type.label}</span>
                    <span className="text-xs text-muted-foreground">{type.desc}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
              <CardDescription>Any special instructions or ideas for the trip</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g. We're celebrating Sarah's birthday! Focus on beach activities and sunset dinners 🌅"
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            variant="gradient"
            size="xl"
            className="w-full gap-2"
            disabled={loading}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Creating Trip...</>
            ) : (
              <>Create Trip <ArrowRight size={18} /></>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
