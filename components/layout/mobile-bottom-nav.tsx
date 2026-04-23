"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, PlusCircle, Settings } from "lucide-react";

const NAV = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Trips", href: "/dashboard/trips", icon: Map },
  { label: "Create", href: "/dashboard/create", icon: PlusCircle, primary: true },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(10,10,20,0.95)", backdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-around",
      padding: "8px 8px 12px",
    }} className="md:hidden">
      {NAV.map(({ label, href, icon: Icon, primary }) => {
        const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: primary ? "6px 16px" : "6px 12px",
              borderRadius: 12,
              background: primary ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "transparent",
              minWidth: 60,
            }}>
              <Icon
                size={20}
                color={primary ? "white" : active ? "#60a5fa" : "rgba(255,255,255,0.3)"}
                strokeWidth={active || primary ? 2.5 : 1.5}
              />
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: primary ? "white" : active ? "#60a5fa" : "rgba(255,255,255,0.25)",
              }}>
                {label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
