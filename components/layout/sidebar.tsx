"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Map, PlusCircle, Settings, LogOut, Plane, Sparkles, Gift, Crown, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Trips", href: "/dashboard/trips", icon: Map },
  { label: "Create Trip", href: "/dashboard/create", icon: PlusCircle },
  { label: "Referrals", href: "/dashboard/referral", icon: Gift },
  { label: "Upgrade", href: "/dashboard/upgrade", icon: Crown },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  user: { id: string; email: string; full_name: string | null; avatar_url: string | null } | null;
  notificationCount?: number;
}

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
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside style={{
      width: 240,
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#0a0a14",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px", height: 64, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(59,130,246,0.25)",
          flexShrink: 0,
        }}>
          <Plane size={15} color="white" style={{ transform: "rotate(45deg)" }} />
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em" }}>TripSync</span>
        <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
          BETA
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 12px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div className={`nav-item${active ? " active" : ""}`}>
                <Icon size={15} style={{ flexShrink: 0 }} />
                <span>{label}</span>
                {label === "Upgrade" && !active && (
                  <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 6, background: "rgba(245,158,11,0.1)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.2)" }}>
                    PRO
                  </span>
                )}
                {active && <ChevronRight size={12} style={{ marginLeft: "auto", opacity: 0.4 }} />}
              </div>
            </Link>
          );
        })}

        {/* AI CTA */}
        <div style={{ marginTop: 12, padding: 14, borderRadius: 12, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Sparkles size={13} color="#60a5fa" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd" }}>AI Itinerary</span>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10, lineHeight: 1.5 }}>
            Generate your perfect travel plan instantly
          </p>
          <Link href="/dashboard/trips" style={{ textDecoration: "none" }}>
            <div style={{
              height: 28, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 8, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              fontSize: 11, fontWeight: 600, color: "white", cursor: "pointer",
            }}>
              Generate Now
            </div>
          </Link>
        </div>
      </nav>

      {/* User */}
      <div style={{ padding: "8px 12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0, overflow: "hidden",
          }}>
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : getInitials(user?.full_name ?? user?.email ?? "U")}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.full_name ?? "Traveler"}
            </p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", flexShrink: 0, transition: "all 0.15s" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = "rgba(244,63,94,0.1)"; (e.target as HTMLElement).style.color = "#f87171"; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = "transparent"; (e.target as HTMLElement).style.color = "rgba(255,255,255,0.25)"; }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
