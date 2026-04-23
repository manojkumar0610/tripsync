"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User, Bell, Palette, Shield, LogOut, Loader2, Copy, Check, Save } from "lucide-react";

const ROW = { padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 } as React.CSSProperties;
const LABEL = { fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" } as React.CSSProperties;
const SUBLABEL = { fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 } as React.CSSProperties;

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{
      width: 40, height: 22, borderRadius: 99, position: "relative", cursor: "pointer",
      background: on ? "#3b82f6" : "rgba(255,255,255,0.1)",
      transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "white",
        position: "absolute", top: 2, transition: "transform 0.2s",
        transform: on ? "translateX(20px)" : "translateX(2px)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }} />
    </div>
  );
}

function SectionCard({ icon: Icon, title, desc, accentColor, children }: any) {
  return (
    <div style={{ background: "#0e0e1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `${accentColor}14`, border: `1px solid ${accentColor}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={15} color={accentColor} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{title}</p>
          {desc && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{desc}</p>}
        </div>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fullName, setFullName] = useState("");
  const [notifs, setNotifs] = useState({ trip_invites: true, expense_updates: true, vote_reminders: true, itinerary_ready: true });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("users").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
        if (data) { setProfile(data); setFullName(data.full_name ?? ""); }
      });
    });
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    const { error } = await supabase.from("users").update({ full_name: fullName, updated_at: new Date().toISOString() }).eq("id", profile.id);
    if (error) toast.error("Failed to update"); else { toast.success("Profile updated!"); setProfile({ ...profile, full_name: fullName }); }
    setLoading(false);
  };

  const copyReferral = () => {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(`${window.location.origin}?ref=${profile.referral_code}`);
    setCopied(true); toast.success("Copied!"); setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  return (
    <>
      <DashboardHeader title="Settings" subtitle="Manage your account" />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 16 }} className="fade-in">

        {/* Profile */}
        <SectionCard icon={User} title="Profile" desc="Update your personal information" accentColor="#3b82f6">
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", overflow: "hidden", flexShrink: 0 }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : getInitials(profile?.full_name ?? profile?.email ?? "U")}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{profile?.full_name ?? "Traveler"}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{profile?.email}</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Full Name</label>
              <input className="input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Email</label>
              <input className="input" value={profile?.email ?? ""} disabled />
            </div>
            <button onClick={handleSave} disabled={loading} className="btn-primary" style={{ width: "fit-content" }}>
              {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
              Save Changes
            </button>
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard icon={Bell} title="Notifications" desc="Control what you get notified about" accentColor="#f59e0b">
          <div>
            {[
              { key: "trip_invites", label: "Trip Invites", desc: "When someone invites you to a trip" },
              { key: "expense_updates", label: "Expense Updates", desc: "When expenses are added or settled" },
              { key: "vote_reminders", label: "Vote Reminders", desc: "Active votes needing your input" },
              { key: "itinerary_ready", label: "Itinerary Ready", desc: "When AI generates your itinerary" },
            ].map((item, idx, arr) => (
              <div key={item.key} style={{ ...ROW, borderBottom: idx === arr.length - 1 ? "none" : ROW.borderBottom }}>
                <div>
                  <p style={LABEL}>{item.label}</p>
                  <p style={SUBLABEL}>{item.desc}</p>
                </div>
                <Toggle on={notifs[item.key as keyof typeof notifs]} onChange={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Referral */}
        {profile?.referral_code && (
          <SectionCard icon={User} title="Refer Friends 🎁" desc="Share TripSync and earn rewards" accentColor="#10b981">
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" value={`${typeof window !== "undefined" ? window.location.origin : ""}/join?ref=${profile.referral_code}`} readOnly style={{ fontFamily: "monospace", fontSize: 12 }} />
              <button onClick={copyReferral} style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} color="rgba(255,255,255,0.4)" />}
              </button>
            </div>
          </SectionCard>
        )}

        {/* Account / Danger */}
        <SectionCard icon={Shield} title="Account" accentColor="#f43f5e">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <p style={LABEL}>Sign Out</p>
              <p style={SUBLABEL}>Sign out on this device</p>
            </div>
            <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 7, height: 36, padding: "0 14px", borderRadius: 10, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#fb7185", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
