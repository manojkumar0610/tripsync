"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Sparkles,
  Wallet,
  Users,
  Star,
  Compass,
  ArrowRight,
} from "lucide-react";

const featureCards = [
  {
    icon: Sparkles,
    title: "AI Itinerary Builder",
    description: "Get day-by-day plans tailored to your budget, style & interests.",
  },
  {
    icon: Wallet,
    title: "Split Expenses",
    description: "Track costs, split fairly, and settle up in one click.",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "Plan together, vote on options, and stay in sync.",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

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
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}`,
      },
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
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}`,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      setOtpSent(true);
      toast.success("Magic link sent! Check your email 📧");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

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
    <main className="relative min-h-screen overflow-hidden bg-[#040714] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.22),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(37,99,235,0.2),transparent_32%)]" />
      <motion.div
        aria-hidden
        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-16 right-0 h-64 w-64 rounded-full bg-violet-500/20 blur-[110px]"
      />

      <section className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <aside className="relative overflow-hidden border-white/10 px-5 py-10 sm:px-8 lg:border-r lg:px-12 lg:py-14">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-[#101a43]/65 to-[#040714]/90" />

          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
                <Compass className="h-4 w-4 text-violet-300" />
                <span className="text-lg font-semibold tracking-tight">TripSync</span>
              </div>

              <div className="max-w-xl space-y-4">
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                  Plan unforgettable trips <span className="text-violet-400">together</span>
                </h1>
                <p className="max-w-lg text-base text-slate-200/90 sm:text-lg">
                  AI itineraries, group expenses, voting, live collaboration.
                </p>
              </div>

              <div className="grid max-w-xl gap-4 pt-2">
                {featureCards.map((item, idx) => (
                  <motion.article
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * idx + 0.2 }}
                    className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl transition hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-violet-500/20 p-3">
                        <item.icon className="h-5 w-5 text-violet-200" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="mt-1 text-sm text-slate-300">{item.description}</p>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>

            <div className="max-w-xl rounded-2xl border border-white/15 bg-[#0d1434]/65 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-3 text-amber-300">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-2 text-lg font-medium">Trusted by 10,000+ travelers</p>
            </div>
          </div>
        </aside>

        <div className="relative flex items-center justify-center p-4 sm:p-6 lg:p-10">
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(17,24,39,0.65)] backdrop-blur-2xl sm:p-8"
            aria-label="Sign in panel"
          >
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
                <Compass className="h-4 w-4 text-violet-300" />
                <span className="font-semibold">TripSync</span>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight">Welcome back</h2>
              <p className="mt-2 text-slate-300">Sign in to continue planning smarter trips</p>
            </div>

            {!otpSent ? (
              <>
                <Button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || loading}
                  aria-label="Continue with Google"
                  className="h-14 w-full rounded-xl bg-white text-base font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-white/95 disabled:opacity-60"
                >
                  {googleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
                    <svg viewBox="0 0 24 24" width="20" height="20" className="mr-2">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continue with Google
                </Button>

                <div className="my-6 flex items-center gap-3">
                  <Separator className="bg-white/15" />
                  <span className="text-xs font-semibold tracking-[0.14em] text-slate-400">OR CONTINUE WITH</span>
                  <Separator className="bg-white/15" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEmailForm((prev) => !prev)}
                  className="h-14 w-full rounded-xl border-white/20 bg-transparent text-base text-white hover:bg-white/10"
                >
                  <Mail className="mr-2 h-5 w-5" /> Continue with Email
                </Button>

                {showEmailForm && (
                  <form onSubmit={handleEmailOTP} className="mt-4 space-y-3">
                    <Label htmlFor="email" className="text-slate-200">Email address</Label>
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 border-white/20 bg-white/5 text-white placeholder:text-slate-400" placeholder="you@example.com" />
                    <Button type="submit" disabled={loading || !email} className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 font-semibold hover:opacity-95">
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}Send Magic Link
                    </Button>
                  </form>
                )}
              </>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <Label htmlFor="otp" className="text-slate-200">Verification code</Label>
                <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="h-14 border-white/20 bg-white/5 text-center font-mono text-2xl tracking-[0.35em]" />
                <Button type="submit" disabled={loading || otp.length < 6} className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 font-semibold">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Verify & Sign In
                </Button>
                <button type="button" onClick={() => setOtpSent(false)} className="w-full text-sm text-slate-300 hover:text-violet-300">Use a different email</button>
              </form>
            )}

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input id="remember-me" name="remember-me" type="checkbox" aria-label="Remember me" className="h-4 w-4 rounded border border-white/30 bg-transparent text-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040714]" />
                <Label htmlFor="remember-me" className="text-slate-300">Remember me</Label>
              </div>
              <Link href="#" className="text-violet-300 hover:text-violet-200">Forgot password?</Link>
            </div>

            <p className="mt-8 text-center text-slate-300">
              Don&apos;t have an account? <Link href="#" className="font-semibold text-violet-300 hover:text-violet-200">Create one</Link>
            </p>
          </motion.section>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
