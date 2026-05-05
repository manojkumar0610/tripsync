"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import {
  User, Bell, Palette, Shield, LogOut, Loader2,
  Copy, Check, Sun, Moon, Monitor
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "" });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setProfile(data);
        setForm({ full_name: data.full_name ?? "", email: data.email ?? "" });
      }
    };
    load();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setLoading(true);
    const { error } = await supabase
      .from("users")
      .update({ full_name: form.full_name, updated_at: new Date().toISOString() })
      .eq("id", profile.id);
    if (error) toast.error("Failed to update profile");
    else { toast.success("Profile updated!"); setProfile({ ...profile, full_name: form.full_name }); }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const copyReferral = () => {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(`${window.location.origin}?ref=${profile.referral_code}`);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-enter">
      <DashboardHeader title="Settings" subtitle="Manage your account" />
      <div className="page-container py-8 max-w-2xl space-y-6">

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User size={18} className="text-blue-600" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url ?? ""} />
                <AvatarFallback className="text-lg">
                  {getInitials(profile?.full_name ?? profile?.email ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{profile?.full_name ?? "Traveler"}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={form.email} disabled className="opacity-60" />
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={loading} className="gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette size={18} className="text-violet-600" /> Appearance
            </CardTitle>
            <CardDescription>Choose your preferred theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: Monitor },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    theme === value ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <Icon size={20} className={theme === value ? "text-blue-600" : "text-muted-foreground"} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell size={18} className="text-amber-600" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Trip invites", desc: "When someone invites you to a trip" },
              { label: "Expense updates", desc: "When expenses are added or settled" },
              { label: "Vote reminders", desc: "When there's an active vote on your trip" },
              { label: "Itinerary ready", desc: "When AI generates your itinerary" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Referral */}
        {profile?.referral_code && (
          <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10">
            <CardHeader>
              <CardTitle className="text-lg">🎁 Refer Friends</CardTitle>
              <CardDescription>Share TripSync and earn rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/join?ref=${profile.referral_code}`}
                  readOnly
                  className="text-sm bg-background"
                />
                <Button variant="outline" size="icon" onClick={copyReferral}>
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-900/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-red-600">
              <Shield size={18} /> Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout} className="gap-2">
              <LogOut size={16} /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
