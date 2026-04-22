"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Plane, Loader2, Mail, ArrowRight, Sparkles,
  MapPin, Users, DollarSign, ChevronRight
} from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  // ── FIX: Listen for auth state changes and redirect immediately ──
  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace(redirectTo);
      } else {
        setCheckingSession(false);
      }
    });

    // Listen for OAuth callback - this fires when Google redirects back
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          router.replace(redirectTo);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [redirectTo]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
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
    if (!otp || otp.length < 6) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
    // onAuthStateChange above handles the redirect on success
  };

  // Show spinner while checking existing session
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* ── Left Panel - Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-violet-600/20 to-blue-900/40" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59,130,246,0.15) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(139,92,246,0.15) 0%, transparent 50%)`
        }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Plane className="w-5 h-5 text-white rotate-45" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">TripSync</span>
          </div>

          {/* Main copy */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-white leading-tight mb-4">
                Travel smarter,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                  together.
                </span>
              </h1>
              <p className="text-white/50 text-lg leading-relaxed max-w-sm">
                AI-powered itineraries, effortless expense splitting, and real-time collaboration for every trip.
              </p>
            </div>

            {/* Feature pills */}
            <div className="space-y-3">
              {[
                { icon: Sparkles, label: "AI Itinerary Generation", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
                { icon: DollarSign, label: "Smart Expense Splitting", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { icon: Users, label: "Real-time Collaboration", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                { icon: MapPin, label: "Live Weather Forecasts", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
              ].map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} w-fit`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-white/70 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white/60 text-sm leading-relaxed italic">
              "TripSync turned our chaotic group chats into a seamless travel experience. The AI itinerary alone saved us hours."
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">P</div>
              <div>
                <p className="text-white/80 text-xs font-semibold">Priya S.</p>
                <p className="text-white/40 text-xs">Traveled to 12 countries</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel - Auth Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Plane className="w-4 h-4 text-white rotate-45" />
            </div>
            <span className="text-lg font-bold text-white">TripSync</span>
          </div>

          {!otpSent ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Welcome back
                </h2>
                <p className="text-white/40">
                  Sign in to continue planning amazing trips
                </p>
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 h-12 px-5 rounded-xl bg-white hover:bg-white/95 text-slate-800 font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-white/10 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mb-6"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/30 text-xs font-medium uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailOTP} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm font-medium mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-white/20 text-sm outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Magic Link
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-white/25 text-xs mt-8 leading-relaxed">
                By continuing, you agree to our{" "}
                <a href="#" className="text-white/40 hover:text-white/70 underline transition-colors">Terms</a>
                {" "}and{" "}
                <a href="#" className="text-white/40 hover:text-white/70 underline transition-colors">Privacy Policy</a>
              </p>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Check your email
                </h2>
                <p className="text-white/40 text-sm">
                  We sent a 6-digit code to{" "}
                  <span className="text-white/70 font-medium">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm font-medium mb-2">
                    Verification code
                  </label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="w-full h-16 bg-white/5 border border-white/10 rounded-xl text-center text-3xl font-bold tracking-[0.4em] text-white placeholder:text-white/15 outline-none focus:border-blue-500/50 transition-all"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Verify & Sign In <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <button
                onClick={() => { setOtpSent(false); setOtp(""); }}
                className="w-full mt-4 text-sm text-white/30 hover:text-white/60 transition-colors"
              >
                ← Use a different email
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
