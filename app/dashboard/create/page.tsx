"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { MapPin, Calendar, DollarSign, Users, ArrowRight, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const TRIP_TYPES = [
  { value: "friends", label: "Friends", emoji: "🎉", desc: "Group getaway" },
  { value: "family", label: "Family", emoji: "👨‍👩‍👧‍👦", desc: "Family trip" },
  { value: "solo", label: "Solo", emoji: "🧭", desc: "Solo adventure" },
  { value: "bike_trip", label: "Bike Trip", emoji: "🏍️", desc: "Ride & explore" },
];

function InputField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-white/60">{label}</label>
      {children}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

export default function CreateTripPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", destination: "", start_date: "", end_date: "",
    budget: "", trip_type: "friends", notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Trip name is required";
    if (!form.destination.trim()) e.destination = "Destination is required";
    if (!form.start_date) e.start_date = "Start date is required";
    if (!form.end_date) e.end_date = "End date is required";
    if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date))
      e.end_date = "End date must be after start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data, error } = await supabase.from("trips").insert({
        title: form.title.trim(), destination: form.destination.trim(),
        start_date: form.start_date, end_date: form.end_date,
        budget: parseFloat(form.budget) || 0, trip_type: form.trip_type,
        notes: form.notes.trim() || null, created_by: user.id,
      }).select().single();
      if (error) throw error;
      toast.success("🎉 Trip created!");
      router.push(`/trip/${data.id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) => cn(
    "w-full h-11 bg-white/[0.04] border rounded-xl px-3.5 text-sm text-white placeholder:text-white/20 outline-none transition-all",
    errors[field]
      ? "border-rose-500/50 focus:border-rose-500/80 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.1)]"
      : "border-white/[0.08] focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
  );

  return (
    <div className="animate-fade-in">
      <DashboardHeader title="Create Trip" subtitle="Plan your next adventure" />
      <div className="page-container py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section: Details */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Trip Details</h3>
                <p className="text-xs text-white/35">Name it and set the destination</p>
              </div>
            </div>
            <InputField label="Trip Name *" error={errors.title}>
              <input className={inputClass("title")} placeholder="e.g. Summer in Bali 🌴" value={form.title} onChange={e => set("title", e.target.value)} />
            </InputField>
            <InputField label="Destination *" error={errors.destination}>
              <input className={inputClass("destination")} placeholder="e.g. Bali, Indonesia" value={form.destination} onChange={e => set("destination", e.target.value)} />
            </InputField>
          </div>

          {/* Section: Dates & Budget */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/15 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Dates & Budget</h3>
                <p className="text-xs text-white/35">When are you going and what's the budget?</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Start Date *" error={errors.start_date}>
                <input type="date" className={inputClass("start_date")} value={form.start_date} onChange={e => set("start_date", e.target.value)} min={new Date().toISOString().split("T")[0]} style={{ colorScheme: "dark" }} />
              </InputField>
              <InputField label="End Date *" error={errors.end_date}>
                <input type="date" className={inputClass("end_date")} value={form.end_date} onChange={e => set("end_date", e.target.value)} min={form.start_date || new Date().toISOString().split("T")[0]} style={{ colorScheme: "dark" }} />
              </InputField>
            </div>
            <InputField label="Total Budget (USD)">
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type="number" className={cn(inputClass("budget"), "pl-9")} placeholder="0.00" value={form.budget} onChange={e => set("budget", e.target.value)} min="0" step="0.01" />
              </div>
            </InputField>
          </div>

          {/* Section: Trip Type */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Trip Type</h3>
                <p className="text-xs text-white/35">Who are you travelling with?</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRIP_TYPES.map((t) => (
                <button key={t.value} type="button" onClick={() => set("trip_type", t.value)}
                  className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer",
                    form.trip_type === t.value
                      ? "border-blue-500/40 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  )}>
                  <span className="text-2xl">{t.emoji}</span>
                  <span className={cn("text-xs font-semibold", form.trip_type === t.value ? "text-blue-300" : "text-white/60")}>{t.label}</span>
                  <span className="text-[10px] text-white/25">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Notes */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Notes</h3>
                <p className="text-xs text-white/35">Any ideas or special requirements?</p>
              </div>
            </div>
            <textarea
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all resize-none min-h-[100px]"
              placeholder="e.g. Sarah's birthday trip! Focus on beach clubs and sunset dinners 🌅"
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}
            className="btn-glow w-full h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <>Create Trip <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
