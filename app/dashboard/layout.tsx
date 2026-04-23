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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Safe profile fetch — fallback to null if not found yet (e.g. trigger delay)
  let profile = null;
  try {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle(); // maybeSingle returns null instead of throwing if not found
    profile = data;
  } catch {
    // Profile not ready yet — continue with null, UI handles gracefully
  }

  // If profile still missing, create it now (safety net)
  if (!profile) {
    try {
      await supabase.from("users").insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
      });
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      profile = data;
    } catch {
      // Already exists (race condition) — fetch again
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      profile = data;
    }
  }

  // Safe notification count
  let notificationCount = 0;
  try {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    notificationCount = count ?? 0;
  } catch {
    // Non-critical — continue
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#080810",
      }}
    >
      {/* Desktop sidebar — hidden on mobile via style tag */}
      <div style={{ display: "none" }} className="ts-sidebar">
        <Sidebar user={profile} notificationCount={notificationCount} />
      </div>

      <style>{`
        @media (min-width: 768px) { .ts-sidebar { display: flex !important; } }
        @media (max-width: 767px) { .ts-main { padding-bottom: 72px !important; } }
      `}</style>

      <main
        className="ts-main"
        style={{ flex: 1, overflowY: "auto", minWidth: 0 }}
      >
        {children}
      </main>

      <MobileBottomNav />
      <OnboardingDialog />
    </div>
  );
}
