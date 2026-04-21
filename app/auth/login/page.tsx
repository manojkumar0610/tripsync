"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plane, Loader2, Mail, ArrowRight, Sparkles } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

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
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}` },
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
    } else {
      toast.success("Welcome to TripSync! 🎉");
      window.location.href = redirectTo;
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-2xl mb-4">
            <Plane className="text-white rotate-45" size={24} />
          </div>
          <h1 className="font-syne text-3xl font-bold text-white">TripSync</h1>
          <p className="text-blue-200/70 mt-1.5 text-sm">Your AI-powered travel companion</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
          <h2 className="font-syne text-xl font-semibold text-white mb-1">
            {otpSent ? "Check your email" : "Welcome back"}
          </h2>
          <p className="text-sm text-blue-200/60 mb-6">
            {otpSent
              ? `We sent a 6-digit code to ${email}`
              : "Sign in to start planning your next adventure"}
          </p>

          {!otpSent ? (
            <>
              {/* Google */}
              <Button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full h-12 bg-white text-slate-900 hover:bg-white/90 font-medium gap-3 mb-4"
              >
                {googleLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </Button>

              <div className="flex items-center gap-3 my-4">
                <Separator className="flex-1 bg-white/10" />
                <span className="text-xs text-blue-200/40 font-medium">OR</span>
                <Separator className="flex-1 bg-white/10" />
              </div>

              {/* Email OTP */}
              <form onSubmit={handleEmailOTP} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-blue-100/70 text-sm">Email address</Label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300/50" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-9 bg-white/10 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-400"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-violet-600 hover:opacity-90 text-white font-medium gap-2 border-0"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <><Mail size={16} /> Send Magic Link</>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-blue-100/70 text-sm">Verification code</Label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-14 text-center text-2xl font-mono tracking-[0.3em] bg-white/10 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-400"
                  maxLength={6}
                />
              </div>
              <Button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-violet-600 hover:opacity-90 text-white font-medium gap-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>Verify & Sign In <ArrowRight size={16} /></>
                )}
              </Button>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-xs text-blue-300/50 hover:text-blue-200 transition-colors"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>

        {/* Features preview */}
        <div className="mt-6 flex items-center justify-center gap-6 text-blue-200/40 text-xs">
          <span className="flex items-center gap-1.5"><Sparkles size={12} /> AI Itineraries</span>
          <span className="flex items-center gap-1.5">✈️ Trip Planning</span>
          <span className="flex items-center gap-1.5">💰 Split Expenses</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
