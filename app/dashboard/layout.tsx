import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { OnboardingDialog } from "@/components/layout/onboarding-dialog";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
  const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#080810" }}>
      {/* Desktop sidebar */}
      <div style={{ display: "none" }} className="md-sidebar">
        <Sidebar user={profile} notificationCount={count ?? 0} />
      </div>
      {/* Sidebar visible on md+ */}
      <style>{`@media(min-width:768px){.md-sidebar{display:flex!important}}`}</style>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto", paddingBottom: 0 }} className="main-content">
        <style>{`@media(max-width:767px){.main-content{padding-bottom:72px}}`}</style>
        {children}
      </main>

      {/* Mobile nav */}
      <MobileBottomNav />
      <OnboardingDialog />
    </div>
  );
}
