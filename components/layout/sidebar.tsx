"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  PlusCircle,
  Settings,
  LogOut,
  Plane,
  Bell,
  ChevronRight,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Trips", href: "/dashboard/trips", icon: Map },
  { label: "Create Trip", href: "/dashboard/create", icon: PlusCircle },
  { label: "Referrals 🎁", href: "/dashboard/referral", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  notificationCount?: number;
}

export function Sidebar({ user, notificationCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5 p-6 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg">
          <Plane className="h-4.5 w-4.5 text-white rotate-45" size={18} />
        </div>
        <span className="font-syne text-xl font-bold tracking-tight">TripSync</span>
        <Badge variant="info" className="ml-auto text-[10px] px-1.5 py-0.5">BETA</Badge>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}>
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </div>
            </Link>
          );
        })}

        {/* AI Itinerary CTA */}
        <div className="mt-4 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30 p-3 border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={14} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">AI Itinerary</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">Generate smart travel plans with AI</p>
          <Link href="/dashboard/trips">
            <Button size="sm" variant="gradient" className="w-full h-7 text-xs">
              Try Now
            </Button>
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t p-3">
        {notificationCount > 0 && (
          <Link href="/dashboard/settings">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2 mb-1 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer">
              <Bell size={18} />
              <span>Notifications</span>
              <Badge className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500">
                {notificationCount}
              </Badge>
            </div>
          </Link>
        )}
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar_url ?? ""} />
            <AvatarFallback className="text-xs">
              {getInitials(user?.full_name ?? user?.email ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name ?? "Traveler"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </aside>
  );
}
