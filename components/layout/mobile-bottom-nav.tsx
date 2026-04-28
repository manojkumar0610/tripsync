"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, PlusCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Trips", href: "/dashboard/trips", icon: Map },
  { label: "Create", href: "/dashboard/create", icon: PlusCircle },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background/90 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all",
                  isActive
                    ? "text-blue-600"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  size={20}
                  className={isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}
                />
                <span className="text-[10px] font-medium">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
