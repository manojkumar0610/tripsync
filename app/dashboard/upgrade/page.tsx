import Link from "next/link";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Infinity, Download, Palette, HeadphonesIcon, Zap, Check, Crown } from "lucide-react";

const PRO_FEATURES = [
  { icon: Infinity, label: "Unlimited trips & members", desc: "No limits on how many trips or friends", color: "#3b82f6" },
  { icon: Zap, label: "Unlimited AI itineraries", desc: "Generate as many plans as you need", color: "#8b5cf6" },
  { icon: Download, label: "PDF export & sharing", desc: "Download beautiful trip summaries", color: "#10b981" },
  { icon: Palette, label: "Custom trip covers", desc: "Personalise each trip with cover images", color: "#f59e0b" },
  { icon: HeadphonesIcon, label: "Priority support", desc: "Get help fast when you need it", color: "#f43f5e" },
];

const TABLE_ROWS = [
  ["Active trips", "3", "Unlimited"],
  ["Members per trip", "10", "Unlimited"],
  ["AI itineraries/month", "2", "Unlimited"],
  ["PDF export", "—", "✓"],
  ["Expense analytics", "Basic", "Advanced"],
  ["Priority support", "—", "✓"],
];

export default function UpgradePage() {
  return (
    <>
      <DashboardHeader title="Upgrade to Pro" subtitle="Unlock the full TripSync experience" />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,88,12,0.1))", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 20, padding: 28, textAlign: "center", position: "relative" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #f59e0b, #f97316)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(245,158,11,0.25)" }}>
            <Crown size={24} color="white" />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.92)", marginBottom: 8, letterSpacing: "-0.02em" }}>TripSync Pro</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Take your travel planning to the next level</p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4 }}>
            <span style={{ fontSize: 48, fontWeight: 800, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.03em" }}>$9</span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>/month</span>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Billed monthly · Cancel anytime</p>
        </div>

        {/* Features */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {PRO_FEATURES.map(f => (
            <div key={f.label} style={{ background: "#0e0e1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${f.color}15`, border: `1px solid ${f.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <f.icon size={15} color={f.color} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 3 }}>{f.label}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.4 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 16, padding: 20, textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 99, padding: "3px 12px", display: "inline-block" }}>
            🎉 14-day free trial
          </span>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Try Pro free for 14 days. No credit card required.</p>
          <button style={{ width: "100%", height: 46, borderRadius: 12, background: "linear-gradient(135deg, #f59e0b, #f97316)", border: "none", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Crown size={16} /> Start Free Trial
          </button>
        </div>

        {/* Comparison table */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 12, textAlign: "center" }}>Free vs Pro</h3>
          <div style={{ background: "#0e0e1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Feature</th>
                  <th style={{ padding: "12px 16px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Free</th>
                  <th style={{ padding: "12px 16px", color: "#fbbf24", fontWeight: 600 }}>Pro</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map(([feat, free, pro], i) => (
                  <tr key={feat} style={{ borderBottom: i < TABLE_ROWS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td style={{ padding: "10px 16px", color: "rgba(255,255,255,0.5)" }}>{feat}</td>
                    <td style={{ padding: "10px 16px", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>{free}</td>
                    <td style={{ padding: "10px 16px", textAlign: "center", color: "#fbbf24", fontWeight: 600 }}>{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
