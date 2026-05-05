import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ReferralClient } from "@/components/layout/referral-client";

export default async function ReferralPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users").select("*").eq("id", user.id).maybeSingle();

  // Count referrals
  const { count: referralCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("referred_by", user.id);

  return (
    <div className="page-enter">
      <DashboardHeader title="Referrals" subtitle="Invite friends, earn rewards" />
      <ReferralClient profile={profile} referralCount={referralCount ?? 0} />
    </div>
  );
}
