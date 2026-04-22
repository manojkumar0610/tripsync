"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Search, Bell, Command } from "lucide-react";
import { useState } from "react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-white/35 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className={`hidden md:flex items-center gap-2 h-9 px-3 rounded-xl border transition-all duration-200 ${
          searchFocused
            ? "bg-white/[0.06] border-blue-500/30 w-56"
            : "bg-white/[0.03] border-white/[0.06] w-44"
        }`}>
          <Search className="w-3.5 h-3.5 text-white/25 shrink-0" />
          <input
            type="text"
            placeholder="Search trips..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="flex-1 bg-transparent text-xs text-white placeholder:text-white/25 outline-none"
          />
          <div className="flex items-center gap-0.5 shrink-0">
            <kbd className="text-[9px] text-white/20 bg-white/5 px-1 py-0.5 rounded font-mono">⌘K</kbd>
          </div>
        </div>
      </div>
    </header>
  );
}
