"use client";

import { useState } from "react";
import { Copy, Check, Gift, Trophy, Users } from "lucide-react";
import { toast } from "sonner";

interface ReferralClientProps {
  profile: any;
  referralCount: number;
}

export function ReferralClient({ profile, referralCount }: ReferralClientProps) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://tripsync-flax.vercel.app";
  const referralUrl = `${origin}/auth/login?ref=${profile?.referral_code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const MILESTONES = [
    { count: 1, reward: "1 extra AI itinerary", icon: "🎁" },
    { count: 3, reward: "1 month Pro free", icon: "⭐" },
    { count: 5, reward: "3 months Pro free", icon: "🚀" },
    { count: 10, reward: "1 year Pro + badge", icon: "👑" },
  ];

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,88,12,0.08))", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 20, padding: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 16, top: 12, fontSize: 48, opacity: 0.15, pointerEvents: "none" }}>🎁</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Gift size={18} color="#fbbf24" />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>Refer & Earn</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Share TripSync and unlock premium rewards</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: "rgba(255,255,255,0.92)" }}>{referralCount}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Friends Referred</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: "rgba(255,255,255,0.92)" }}>
              {MILESTONES.find(m => referralCount < m.count)?.count ?? "∞"}
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Until Next Reward</p>
          </div>
        </div>
      </div>

      {/* Referral link */}
      <div style={{ background: "#0e0e1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Copy size={13} color="#60a5fa" />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Your Referral Link</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={referralUrl}
            readOnly
            style={{ flex: 1, height: 42, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "0 12px", color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "monospace", outline: "none" }}
          />
          <button onClick={copyLink} style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {copied ? <Check size={15} color="#34d399" /> : <Copy size={15} color="rgba(255,255,255,0.4)" />}
          </button>
        </div>
        {profile?.referral_code && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Your code:</span>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", color: "#60a5fa", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, padding: "2px 10px", fontFamily: "monospace" }}>
              {profile.referral_code}
            </span>
          </div>
        )}
      </div>

      {/* Milestones */}
      <div style={{ background: "#0e0e1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trophy size={13} color="#fbbf24" />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Reward Milestones</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MILESTONES.map(m => {
            const achieved = referralCount >= m.count;
            const isNext = !achieved && MILESTONES.find(x => referralCount < x.count)?.count === m.count;
            return (
              <div key={m.count} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12,
                background: achieved ? "rgba(16,185,129,0.06)" : isNext ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${achieved ? "rgba(16,185,129,0.2)" : isNext ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}`,
              }}>
                <span style={{ fontSize: 20 }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
                      {m.count} referral{m.count > 1 ? "s" : ""}
                    </p>
                    {isNext && <span style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 99, padding: "1px 7px" }}>Next</span>}
                    {achieved && <span style={{ fontSize: 10, fontWeight: 700, color: "#34d399", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 99, padding: "1px 7px" }}>✓ Done</span>}
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{m.reward}</p>
                </div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>
                  {achieved ? "✅" : `${Math.min(referralCount, m.count)}/${m.count}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: "#0e0e1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={13} color="#a78bfa" />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>How It Works</p>
        </div>
        <ol style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            "Share your unique referral link or code with friends",
            "They sign up and create their first trip",
            "You both get rewarded automatically",
            "Unlock bigger rewards as you refer more people",
          ].map((step, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#a78bfa", flexShrink: 0 }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, paddingTop: 2 }}>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
