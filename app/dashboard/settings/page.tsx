"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  User, Bell, Palette, Shield, LogOut, Loader2,
  Copy, Check, Sun, Moon, Monitor, Save
} from "lucide-react";
import { cn } from "@/lib/utils";

const inputCls = "w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all";

function Section({ icon: Icon, title, desc, color, children }: {
  icon: React.ElementType; title: string; desc?: string; color: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.04]">
        <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0", color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {desc && <p className="text-xs text-white/35">{desc}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fullName, setFullName] = useState("");
  const [notifications, setNotifications] = useState({
    trip_invites: true, expense_updates: true,
    vote_reminders: true, itinerary_ready: true,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("users").select("*").eq("id", user.id).single().then(({ data }) => {
        if (data) { setProfile(data); setFullName(data.full_name ?? ""); }
      });
    });
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    const { error } = await supabase.from("users").update({ full_name: fullName, updated_at: new Date().toISOString() }).eq("id", profile.id);
    if (error) toast.error("Failed to update");
    else { toast.success("Profile updated!"); setProfile({ ...profile, full_name: fullName }); }
    setLoading(false);
  };

  const copyReferral = () => {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(`${window.location.origin}?ref=${profile.referral_code}`);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="animate-fade-in">
      <DashboardHeader title="Settings" subtitle="Manage your account" />
      <div className="page-container py-8 max-w-2xl space-y-5">

        {/* Profile */}
        <Section icon={User} title="Profile" desc="Update your personal information" color="bg-blue-500/10 border-blue-500/15 text-blue-400">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} className="w-full h-full rounded-2xl object-cover" alt="" />
                  : getInitials(profile?.full_name ?? profile?.email ?? "U")}
              </div>
            </div>
            <div>
              <p className="font-semibold text-white">{profile?.full_name ?? "Traveler"}</p>
              <p className="text-sm text-white/35">{profile?.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50">Full Name</label>
              <input className={inputCls} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50">Email</label>
              <input className={cn(inputCls, "opacity-40 cursor-not-allowed")} value={profile?.email ?? ""} disabled />
            </div>
            <button onClick={handleSave} disabled={loading}
              className="btn-glow flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-semibold text-white disabled:opacity-50">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </button>
          </div>
        </Section>

        {/* Theme */}
        <Section icon={Palette} title="Appearance" desc="Choose your preferred theme" color="bg-violet-500/10 border-violet-500/15 text-violet-400">
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <button key={value} onClick={() => setTheme(value)}
                className={cn("flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer",
                  theme === value
                    ? "border-blue-500/40 bg-blue-500/10"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]")}>
                <Icon className={cn("w-5 h-5", theme === value ? "text-blue-400" : "text-white/35")} />
                <span className={cn("text-xs font-medium", theme === value ? "text-blue-300" : "text-white/40")}>{label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications" desc="Control what you get notified about" color="bg-amber-500/10 border-amber-500/15 text-amber-400">
          <div className="space-y-4">
            {[
              { key: "trip_invites", label: "Trip Invites", desc: "When someone invites you to a trip" },
              { key: "expense_updates", label: "Expense Updates", desc: "When expenses are added or settled" },
              { key: "vote_reminders", label: "Vote Reminders", desc: "Active votes needing your input" },
              { key: "itinerary_ready", label: "Itinerary Ready", desc: "When AI generates your itinerary" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-white/70">{item.label}</p>
                  <p className="text-xs text-white/30">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                  className={cn("relative w-10 h-5.5 rounded-full transition-all", notifications[item.key as keyof typeof notifications] ? "bg-blue-600" : "bg-white/10")}>
                  <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", notifications[item.key as keyof typeof notifications] ? "translate-x-5" : "translate-x-0.5")} />
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* Referral */}
        {profile?.referral_code && (
          <Section icon={User} title="Refer Friends 🎁" desc="Share TripSync and earn rewards" color="bg-emerald-500/10 border-emerald-500/15 text-emerald-400">
            <div className="flex gap-2">
              <input
                className={cn(inputCls, "font-mono text-xs")}
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/join?ref=${profile.referral_code}`}
                readOnly
              />
              <button onClick={copyReferral}
                className="w-11 h-11 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center shrink-0 hover:bg-white/[0.08] transition-colors">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/40" />}
              </button>
            </div>
          </Section>
        )}

        {/* Danger zone */}
        <Section icon={Shield} title="Account" color="bg-rose-500/10 border-rose-500/15 text-rose-400">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <p className="text-sm font-medium text-white/70">Sign Out</p>
                <p className="text-xs text-white/25">Sign out of your account on this device</p>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-2 h-9 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/15 transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
