"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Map, PlusCircle, Settings,
  LogOut, Plane, Bell, Sparkles, Users,
  ChevronRight, Gift, TrendingUp, Crown
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: { id: string; email: string; full_name: string | null; avatar_url: string | null } | null;
  notificationCount?: number;
}

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Trips", href: "/dashboard/trips", icon: Map },
  { label: "Create Trip", href: "/dashboard/create", icon: PlusCircle },
  { label: "Referrals", href: "/dashboard/referral", icon: Gift },
  { label: "Upgrade", href: "/dashboard/upgrade", icon: Crown },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ user, notificationCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <aside className="flex h-screen w-[240px] flex-col bg-[#0d0d14] border-r border-white/[0.06]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/[0.06] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
          <Plane className="w-4 h-4 text-white rotate-45" />
        </div>
        <span className="text-base font-bold text-white tracking-tight">TripSync</span>
        <div className="ml-auto">
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            BETA
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
              )}>
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-blue-400" : "text-white/30 group-hover:text-white/60")} />
                <span>{label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto text-blue-400/60" />}
                {label === "Upgrade" && !active && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    PRO
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {/* AI CTA */}
        <div className="mt-4 mx-1 rounded-xl bg-gradient-to-br from-blue-600/10 to-violet-600/10 border border-blue-500/10 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-300">AI Itinerary</span>
          </div>
          <p className="text-[11px] text-white/35 mb-3 leading-relaxed">
            Generate your perfect day-by-day travel plan instantly
          </p>
          <Link href="/dashboard/trips">
            <button className="w-full h-7 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity">
              Generate Now
            </button>
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="px-3 pb-4 pt-2 border-t border-white/[0.06] space-y-1">
        {notificationCount > 0 && (
          <Link href="/dashboard/settings">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all cursor-pointer">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
              <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            </div>
          </Link>
        )}

        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user?.full_name ?? user?.email ?? "U")
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/80 truncate">
              {user?.full_name ?? "Traveler"}
            </p>
            <p className="text-[10px] text-white/30 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
