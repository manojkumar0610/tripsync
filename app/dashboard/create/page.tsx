"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { MapPin, Calendar, DollarSign, Users, ArrowRight, Loader2, FileText } from "lucide-react";

const TRIP_TYPES = [
  { value: "friends", label: "Friends", emoji: "🎉", desc: "Group getaway" },
  { value: "family", label: "Family", emoji: "👨‍👩‍👧‍👦", desc: "Family trip" },
  { value: "solo", label: "Solo", emoji: "🧭", desc: "Solo adventure" },
  { value: "bike_trip", label: "Bike Trip", emoji: "🏍️", desc: "Ride & explore" },
];

function SectionBox({ icon: Icon, title, desc, accentColor, children }: any) {
  return (
    <div style={{ background: "#0e0e1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: `${accentColor}14`, border: `1px solid ${accentColor}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={14} color={accentColor} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>{title}</p>
          {desc && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{desc}</p>}
        </div>
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );
}

function Field({ label, error, children }: any) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 7 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 11, color: "#fb7185", marginTop: 5 }}>{error}</p>}
    </div>
  );
}

export default function CreateTripPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", destination: "", start_date: "", end_date: "", budget: "", trip_type: "friends", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Required";
    if (!form.destination.trim()) errs.destination = "Required";
    if (!form.start_date) errs.start_date = "Required";
    if (!form.end_date) errs.end_date = "Required";
    if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) errs.end_date = "Must be after start date";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data, error } = await supabase.from("trips").insert({
        title: form.title.trim(), destination: form.destination.trim(),
        start_date: form.start_date, end_date: form.end_date,
        budget: parseFloat(form.budget) || 0, trip_type: form.trip_type,
        notes: form.notes.trim() || null, created_by: user.id,
      }).select().maybeSingle();
      if (error) throw error;
      toast.success("🎉 Trip created!");
      router.push(`/trip/${data.id}`);
    } catch (err: any) { toast.error(err.message ?? "Failed"); } finally { setLoading(false); }
  };

  const inputStyle = (field: string) => ({
    width: "100%", height: 44,
    background: errors[field] ? "rgba(244,63,94,0.06)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${errors[field] ? "rgba(244,63,94,0.4)" : "rgba(255,255,255,0.08)"}`,
    borderRadius: 12, padding: "0 14px",
    color: "rgba(255,255,255,0.88)", fontSize: 14, fontFamily: "inherit", outline: "none",
  } as React.CSSProperties);

  return (
    <>
      <DashboardHeader title="Create Trip" subtitle="Plan your next adventure" />
      <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 14 }} className="fade-in">

        <SectionBox icon={MapPin} title="Trip Details" desc="Name it and set the destination" accentColor="#3b82f6">
          <Field label="Trip Name *" error={errors.title}>
            <input style={inputStyle("title")} placeholder="e.g. Summer in Bali 🌴" value={form.title} onChange={e => set("title", e.target.value)} />
          </Field>
          <Field label="Destination *" error={errors.destination}>
            <input style={inputStyle("destination")} placeholder="e.g. Bali, Indonesia" value={form.destination} onChange={e => set("destination", e.target.value)} />
          </Field>
        </SectionBox>

        <SectionBox icon={Calendar} title="Dates & Budget" accentColor="#8b5cf6">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Start Date *" error={errors.start_date}>
              <input type="date" style={{ ...inputStyle("start_date"), colorScheme: "dark" }} value={form.start_date} onChange={e => set("start_date", e.target.value)} min={new Date().toISOString().split("T")[0]} />
            </Field>
            <Field label="End Date *" error={errors.end_date}>
              <input type="date" style={{ ...inputStyle("end_date"), colorScheme: "dark" }} value={form.end_date} onChange={e => set("end_date", e.target.value)} min={form.start_date || new Date().toISOString().split("T")[0]} />
            </Field>
          </div>
          <Field label="Total Budget (USD)">
            <div style={{ position: "relative" }}>
              <DollarSign size={14} color="rgba(255,255,255,0.25)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input type="number" style={{ ...inputStyle("budget"), paddingLeft: 36 }} placeholder="0.00" value={form.budget} onChange={e => set("budget", e.target.value)} min="0" step="0.01" />
            </div>
          </Field>
        </SectionBox>

        <SectionBox icon={Users} title="Trip Type" desc="Who are you travelling with?" accentColor="#10b981">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {TRIP_TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => set("trip_type", t.value)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "16px 12px", borderRadius: 12, cursor: "pointer",
                background: form.trip_type === t.value ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${form.trip_type === t.value ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.07)"}`,
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 22 }}>{t.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: form.trip_type === t.value ? "#60a5fa" : "rgba(255,255,255,0.55)" }}>{t.label}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{t.desc}</span>
              </button>
            ))}
          </div>
        </SectionBox>

        <SectionBox icon={FileText} title="Notes" desc="Ideas or special requirements" accentColor="#f59e0b">
          <textarea className="textarea" placeholder="e.g. Sarah's birthday trip! Focus on beach clubs 🌅" value={form.notes} onChange={e => set("notes", e.target.value)} />
        </SectionBox>

        <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", height: 48, fontSize: 15, borderRadius: 14 }}>
          {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Creating...</> : <>Create Trip <ArrowRight size={16} /></>}
        </button>
      </form>
    </>
  );
}
