"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Gift, Users, Trophy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ReferralClientProps {
  profile: any;
  referralCount: number;
}

export function ReferralClient({ profile, referralCount }: ReferralClientProps) {
  const [copied, setCopied] = useState(false);
  const referralUrl = `${typeof window !== "undefined" ? window.location.origin : "https://tripsync.io"}/auth/login?ref=${profile?.referral_code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const MILESTONES = [
    { count: 1,  reward: "1 extra AI itinerary",         icon: "🎁" },
    { count: 3,  reward: "1 month Pro free",             icon: "⭐" },
    { count: 5,  reward: "3 months Pro free",            icon: "🚀" },
    { count: 10, reward: "1 year Pro + exclusive badge", icon: "👑" },
  ];

  return (
    <div className="page-container py-8 max-w-2xl space-y-6">
      {/* Hero */}
      <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 text-white overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="absolute right-4 top-4 text-5xl opacity-20 select-none">🎁</div>
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-white/20 p-2.5">
              <Gift size={22} className="text-white" />
            </div>
            <div>
              <h2 className="font-syne font-bold text-xl">Refer & Earn</h2>
              <p className="text-white/80 text-sm">Share TripSync and unlock premium rewards</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-xl bg-white/20 backdrop-blur p-3 text-center">
              <p className="font-syne font-bold text-2xl">{referralCount}</p>
              <p className="text-xs text-white/80">Friends Referred</p>
            </div>
            <div className="rounded-xl bg-white/20 backdrop-blur p-3 text-center">
              <p className="font-syne font-bold text-2xl">
                {MILESTONES.find(m => referralCount < m.count)?.count ?? "∞"}
              </p>
              <p className="text-xs text-white/80">Until Next Reward</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ExternalLink size={16} className="text-blue-600" /> Your Referral Link
          </CardTitle>
          <CardDescription>Share this link with friends to earn rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={referralUrl}
              readOnly
              className="text-sm bg-muted/50 font-mono"
            />
            <Button onClick={copyLink} variant="outline" size="icon" className="shrink-0">
              {copied
                ? <Check size={16} className="text-emerald-600" />
                : <Copy size={16} />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Your code:</span>
            <Badge variant="info" className="font-mono text-sm px-3 py-1 tracking-widest">
              {profile?.referral_code}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy size={16} className="text-amber-600" /> Reward Milestones
          </CardTitle>
          <CardDescription>More referrals = bigger rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {MILESTONES.map((m) => {
            const achieved = referralCount >= m.count;
            const isNext = !achieved && (MILESTONES.find(x => referralCount < x.count)?.count === m.count);
            return (
              <div
                key={m.count}
                className={`flex items-center gap-4 rounded-xl p-3 border transition-all ${
                  achieved
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20"
                    : isNext
                    ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20"
                    : "border-border bg-muted/20"
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    {m.count} referral{m.count > 1 ? "s" : ""}
                    {isNext && <Badge variant="warning" className="text-[10px]">Next milestone</Badge>}
                    {achieved && <Badge variant="success" className="text-[10px]">Achieved ✓</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.reward}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {achieved ? "✅" : `${Math.min(referralCount, m.count)}/${m.count}`}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users size={16} className="text-violet-600" /> How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {[
              "Share your unique referral link or code with friends",
              "They sign up and create their first trip",
              "You both get rewarded automatically",
              "Unlock bigger rewards as you refer more people",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 font-bold text-xs shrink-0">
                  {i + 1}
                </span>
                <span className="text-muted-foreground pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
