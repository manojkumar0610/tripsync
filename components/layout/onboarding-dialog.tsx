"use client";

import { useEffect, useState } from "react";
import { Plane, Sparkles, Users, DollarSign, ArrowRight, Check, X } from "lucide-react";

const STEPS = [
  { icon: Plane, title: "Welcome to TripSync ✈️", desc: "Your AI-powered travel planning companion. Let's take a quick tour.", color: "#3b82f6" },
  { icon: Sparkles, title: "AI Itineraries", desc: "Generate a complete day-by-day travel plan in seconds with GPT-4.", color: "#8b5cf6" },
  { icon: Users, title: "Invite Your Crew", desc: "Share a 6-letter code to bring friends into your trip in real time.", color: "#10b981" },
  { icon: DollarSign, title: "Split Expenses", desc: "Track every expense, split equally or custom, settle up one click.", color: "#f59e0b" },
];

const STORAGE_KEY = "tripsync_onboarding_done";

export function OnboardingDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        const t = setTimeout(() => setOpen(true), 900);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
  };

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        width: "100%", maxWidth: 360,
        background: "#0e0e1a",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20,
        padding: 28,
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 20, textAlign: "center",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        animation: "fadeUp 0.3s ease",
      }}>
        {/* Close */}
        <button onClick={handleClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "rgba(255,255,255,0.06)", border: "none",
          width: 28, height: 28, borderRadius: 8, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.4)",
        }}>
          <X size={14} />
        </button>

        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: `${current.color}18`,
          border: `1px solid ${current.color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={28} color={current.color} />
        </div>

        {/* Text */}
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.92)", marginBottom: 8, letterSpacing: "-0.02em" }}>
            {current.title}
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
            {current.desc}
          </p>
        </div>

        {/* Dots */}
        <div style={{ display: "flex", gap: 6 }}>
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} style={{
              height: 6, width: i === step ? 20 : 6,
              borderRadius: 99, border: "none", cursor: "pointer",
              background: i === step ? "#3b82f6" : "rgba(255,255,255,0.15)",
              transition: "all 0.2s",
            }} />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          <button onClick={handleClose} style={{
            flex: 1, height: 38, borderRadius: 10,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500,
            cursor: "pointer",
          }}>
            Skip
          </button>
          <button onClick={isLast ? handleClose : () => setStep(s => s + 1)} style={{
            flex: 1, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            border: "none", color: "white", fontSize: 13, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6,
          }}>
            {isLast ? <><Check size={13} /> Get Started!</> : <>Next <ArrowRight size={13} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
