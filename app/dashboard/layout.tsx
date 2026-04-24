import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { OnboardingDialog } from "@/components/layout/onboarding-dialog";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Use maybeSingle — won't throw if profile row is missing on first login
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // If profile missing (trigger lag), create it now
  if (!profile) {
    await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
  }

  // Notification count — non-critical, won't crash if it fails
  let notificationCount = 0;
  try {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    notificationCount = count ?? 0;
  } catch {
    // non-critical
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#080810" }}>
      {/* Desktop sidebar */}
      <div style={{ display: "none" }} className="md-sidebar">
        <Sidebar user={profile} notificationCount={notificationCount} />
      </div>
      <style>{`@media(min-width:768px){.md-sidebar{display:flex!important}}`}</style>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto" }} className="main-content">
        <style>{`@media(max-width:767px){.main-content{padding-bottom:72px}}`}</style>
        {children}
      </main>

      <MobileBottomNav />
      <OnboardingDialog />
    </div>
  );
}
