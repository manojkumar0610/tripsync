"use client";
import { useState } from "react";
import { Search } from "lucide-react";

export function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40, height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px",
      background: "rgba(8,8,16,0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{subtitle}</p>
        )}
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10, padding: "0 12px", height: 36,
      }}>
        <Search size={13} color="rgba(255,255,255,0.25)" />
        <input
          type="text"
          placeholder="Search..."
          style={{
            background: "transparent", border: "none", outline: "none",
            fontSize: 13, color: "rgba(255,255,255,0.7)",
            fontFamily: "inherit", width: 140,
          }}
        />
        <kbd style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4, fontFamily: "monospace" }}>⌘K</kbd>
      </div>
    </header>
  );
}
