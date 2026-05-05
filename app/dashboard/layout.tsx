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

  // Use maybeSingle — returns null instead of throwing if row missing
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Safety net: create profile if missing (trigger lag on first login)
  if (!profile) {
    try {
      await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
        },
        { onConflict: "id", ignoreDuplicates: true }
      );
    } catch {
      // Already exists — race condition, ignore
    }
  }

  // Notification count — non-critical
  let notificationCount = 0;
  try {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    notificationCount = count ?? 0;
  } catch {
    // Non-critical, continue
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#0b0b14" }}>
      <div style={{ display: "none" }} className="md-sidebar">
        <Sidebar user={profile} notificationCount={notificationCount} />
      </div>
      <style>{`
        @media(min-width:768px){ .md-sidebar{display:flex!important} }
        @media(max-width:767px){ .ts-main{padding-bottom:72px!important} }
      `}</style>
      <main className="ts-main" style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        {children}
      </main>
      <MobileBottomNav />
      <OnboardingDialog />
    </div>
  );
}
