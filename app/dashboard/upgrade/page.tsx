import Link from "next/link";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, Sparkles, Zap, Crown,
  Infinity, Download, Palette, HeadphonesIcon
} from "lucide-react";

const PRO_FEATURES = [
  { icon: Infinity, label: "Unlimited trips & members", desc: "No limits on how many trips or friends" },
  { icon: Sparkles, label: "Unlimited AI itineraries", desc: "Generate as many plans as you need" },
  { icon: Download, label: "PDF export & sharing", desc: "Download and share beautiful trip summaries" },
  { icon: Palette, label: "Custom trip covers", desc: "Personalise each trip with unique cover images" },
  { icon: Zap, label: "Advanced expense analytics", desc: "Charts and insights on your travel spending" },
  { icon: HeadphonesIcon, label: "Priority support", desc: "Get help fast when you need it" },
];

export default function UpgradePage() {
  return (
    <div className="page-enter">
      <DashboardHeader title="Upgrade to Pro" subtitle="Unlock the full TripSync experience" />
      <div className="page-container py-10 max-w-3xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl mb-4">
            <Crown size={28} className="text-white" />
          </div>
          <h2 className="font-syne text-3xl font-bold mb-3">TripSync Pro</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Take your travel planning to the next level with unlimited everything.
          </p>
          <div className="mt-4 flex items-end justify-center gap-1">
            <span className="font-syne text-5xl font-bold">$9</span>
            <span className="text-muted-foreground mb-2">/month</span>
          </div>
          <p className="text-sm text-muted-foreground">Billed monthly · Cancel anytime</p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {PRO_FEATURES.map((f) => (
            <div key={f.label} className="flex items-start gap-3 rounded-2xl border bg-card p-4">
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 p-2 shrink-0">
                <f.icon size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-sm">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Card className="border-amber-200 dark:border-amber-900/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardContent className="p-6 text-center space-y-4">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400">
              🎉 14-day free trial
            </Badge>
            <p className="text-sm text-muted-foreground">
              Try Pro free for 14 days. No credit card required.
            </p>
            <Button
              variant="gradient"
              size="xl"
              className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90"
            >
              <Crown size={18} /> Start Free Trial
            </Button>
            <p className="text-xs text-muted-foreground">
              By upgrading you agree to our{" "}
              <Link href="#" className="underline hover:text-foreground">Terms of Service</Link>
            </p>
          </CardContent>
        </Card>

        {/* Comparison */}
        <div className="mt-8">
          <h3 className="font-syne text-lg font-semibold mb-4 text-center">Free vs Pro</h3>
          <div className="rounded-2xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Feature</th>
                  <th className="p-3 font-medium text-center">Free</th>
                  <th className="p-3 font-medium text-center text-amber-600">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  ["Active trips", "3", "Unlimited"],
                  ["Members per trip", "10", "Unlimited"],
                  ["AI itineraries/month", "2", "Unlimited"],
                  ["PDF export", "—", "✓"],
                  ["Expense analytics", "Basic", "Advanced"],
                  ["Custom trip covers", "—", "✓"],
                  ["Support", "Community", "Priority"],
                ].map(([feature, free, pro]) => (
                  <tr key={feature} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-muted-foreground">{feature}</td>
                    <td className="p-3 text-center">{free}</td>
                    <td className="p-3 text-center font-semibold text-amber-600">{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
