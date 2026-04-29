"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Compass, Loader2, Mail, Sparkles, Star, Users, Wallet } from "lucide-react";

const features = [
  { icon: Sparkles, title: "AI Itinerary Builder", desc: "Get day-by-day plans tailored to your budget, style & interests." },
  { icon: Wallet, title: "Split Expenses", desc: "Track costs, split fairly, and settle up in one click." },
  { icon: Users, title: "Real-time Collaboration", desc: "Plan together, vote on options, and stay in sync." },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/dashboard");
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}` },
    });
    if (error) {
      toast.error(error.message);
      setGoogleLoading(false);
    }
  };

  const handleEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}` },
    });
    if (error) toast.error(error.message);
    else {
      setOtpSent(true);
      toast.success("Magic link sent! Check your email 📧");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Welcome to TripSync! 🎉");
    router.push("/dashboard");
    router.refresh();
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#030617] p-3 text-white sm:p-6">
      <div className="relative mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1700px] overflow-hidden rounded-3xl border border-white/10 bg-[#050a24] lg:grid-cols-2">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,.18),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(37,99,235,.16),transparent_30%)]" />

        <aside className="relative flex flex-col justify-between gap-8 border-white/10 p-6 sm:p-10 lg:border-r">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2400&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-[#0b1b4a]/55 to-[#030617]/90" />

          <div className="relative z-10">
            <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/20 bg-black/35 px-4 py-2 backdrop-blur-md">
              <Compass className="h-4 w-4 text-violet-300" />
              <span className="text-xl font-semibold">TripSync</span>
            </div>

            <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Plan unforgettable trips <span className="text-violet-400">together</span></h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">AI itineraries, group expenses, voting, live collaboration.</p>

            <div className="mt-8 space-y-4">
              {features.map((feature, i) => (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-violet-500/25 p-3">
                      <feature.icon className="h-5 w-5 text-violet-100" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-white">{feature.title}</p>
                      <p className="mt-1 text-white/80">{feature.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative z-10 rounded-2xl border border-white/20 bg-[#0b1438]/80 p-4 backdrop-blur-xl">
            <div className="mb-2 flex items-center gap-1 text-amber-300">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
            <p className="text-lg font-medium text-white">Trusted by 10,000+ travelers</p>
          </div>
        </aside>

        <section className="relative z-10 flex items-center justify-center p-4 sm:p-8 lg:p-10">
          <div className="w-full max-w-[620px] rounded-3xl border border-white/15 bg-[linear-gradient(170deg,rgba(255,255,255,.10),rgba(255,255,255,.03))] p-6 shadow-2xl backdrop-blur-2xl sm:p-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2">
                <Compass className="h-4 w-4 text-violet-300" /> <span className="font-semibold">TripSync</span>
              </div>
              <h2 className="text-5xl font-bold leading-tight">Welcome back</h2>
              <p className="mt-3 text-lg text-white/80">Sign in to continue planning smarter trips</p>
            </div>

            {!otpSent ? (
              <>
                <Button onClick={handleGoogleLogin} disabled={googleLoading || loading} className="h-14 w-full rounded-xl bg-white text-lg font-semibold text-slate-900 hover:bg-white/95">
                  {googleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <svg viewBox="0 0 24 24" width="20" height="20" className="mr-2"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
                  Continue with Google
                </Button>

                <div className="my-6 flex items-center gap-3 text-sm font-semibold tracking-[0.16em] text-white/50">
                  <div className="h-px flex-1 bg-white/20" />OR CONTINUE WITH<div className="h-px flex-1 bg-white/20" />
                </div>

                <Button variant="outline" type="button" onClick={() => setShowEmail((v) => !v)} className="h-14 w-full rounded-xl border-white/25 bg-transparent text-white hover:bg-white/10">
                  <Mail className="mr-2 h-5 w-5" /> Continue with Email
                </Button>

                {showEmail && <form onSubmit={handleEmailOTP} className="mt-4 space-y-3"><Label htmlFor="email" className="text-white/90">Email address</Label><Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 border-white/20 bg-white/5 text-white" required /><Button type="submit" disabled={loading || !email} className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}Send Magic Link</Button></form>}
              </>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4"><Label htmlFor="otp" className="text-white/90">Verification code</Label><Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="h-14 border-white/20 bg-white/5 text-center text-2xl tracking-[0.35em]" /><Button type="submit" disabled={loading || otp.length < 6} className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Verify & Sign In</Button><button type="button" onClick={() => setOtpSent(false)} className="w-full text-sm text-white/70 hover:text-violet-300">Use a different email</button></form>
            )}

            <div className="mt-6 flex items-center justify-between">
              <label htmlFor="remember-me" className="flex items-center gap-2 text-white/90"><input id="remember-me" type="checkbox" className="h-4 w-4 accent-violet-500" />Remember me</label>
              <Link href="#" className="text-violet-300 hover:text-violet-200">Forgot password?</Link>
            </div>

            <p className="mt-8 text-center text-lg text-white/80">Don&apos;t have an account? <Link href="#" className="font-semibold text-violet-300 underline-offset-4 hover:underline">Create one</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
