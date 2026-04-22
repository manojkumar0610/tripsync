"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, PlusCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Trips", href: "/dashboard/trips", icon: Map },
  { label: "Create", href: "/dashboard/create", icon: PlusCircle, primary: true },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-[#0d0d14]/90 backdrop-blur-xl border-t border-white/[0.06] px-2 py-2 safe-area-bottom">
        <div className="flex items-center justify-around">
          {NAV.map(({ label, href, icon: Icon, primary }) => {
            const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
            return (
              <Link key={href} href={href}>
                <div className={cn(
                  "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all",
                  primary
                    ? "bg-gradient-to-br from-blue-600 to-violet-600 px-5"
                    : active ? "text-blue-400" : "text-white/30"
                )}>
                  <Icon className={cn("w-5 h-5", primary ? "text-white" : active ? "text-blue-400" : "text-white/30")} strokeWidth={active || primary ? 2.5 : 1.5} />
                  <span className={cn("text-[10px] font-medium", primary ? "text-white" : active ? "text-blue-400" : "text-white/25")}>
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
