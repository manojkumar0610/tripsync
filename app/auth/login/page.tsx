"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Loader2, Mail, ArrowRight, Sparkles,
  DollarSign, Users, Star, Check, Shield
} from "lucide-react";

/* ─── Google coloured G icon ─── */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

/* ─── TripSync star logo (matches the image) ─── */
const TripSyncLogo = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M16 2L19.5 12.5H30L21.5 18.5L25 29L16 23L7 29L10.5 18.5L2 12.5H12.5L16 2Z"
      fill="url(#logoGrad)" />
    <defs>
      <linearGradient id="logoGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a78bfa"/>
        <stop offset="1" stopColor="#7c3aed"/>
      </linearGradient>
    </defs>
  </svg>
);

const FEATURES = [
  {
    icon: Sparkles,
    label: "AI Itinerary Builder",
    desc: "Get day-by-day plans tailored to your budget, style & interests.",
    color: "#a78bfa",
    bg: "rgba(139,92,246,0.2)",
  },
  {
    icon: DollarSign,
    label: "Split Expenses",
    desc: "Track costs, split fairly, and settle up in one click.",
    color: "#a78bfa",
    bg: "rgba(139,92,246,0.2)",
  },
  {
    icon: Users,
    label: "Real-time Collaboration",
    desc: "Plan together, vote on options, and stay in sync.",
    color: "#a78bfa",
    bg: "rgba(139,92,246,0.2)",
  },
];

/* ─── Avatar stack ─── */
const AVATAR_URLS = [
  "https://i.pravatar.cc/40?img=47",
  "https://i.pravatar.cc/40?img=12",
  "https://i.pravatar.cc/40?img=32",
  "https://i.pravatar.cc/40?img=56",
];

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const supabase = createClient();

  const [email, setEmail]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogle]    = useState(false);
  const [otpSent, setOtpSent]         = useState(false);
  const [otp, setOtp]                 = useState("");
  const [rememberMe, setRememberMe]   = useState(false);
  const [checking, setChecking]       = useState(true);
  const [showEmail, setShowEmail]     = useState(false);

  /* ─── Auth state ─── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(redirectTo);
      else setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) router.replace(redirectTo);
    });
    return () => subscription.unsubscribe();
  }, [redirectTo]);

  /* ─── Handlers ─── */
  const handleGoogle = async () => {
    setGoogle(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}` },
    });
    if (error) { toast.error(error.message); setGoogle(false); }
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
    else { setOtpSent(true); toast.success("Magic link sent! Check your email 📧"); }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    if (error) { toast.error(error.message); setLoading(false); }
    // onAuthStateChange handles redirect
  };

  /* ─── Loading screen ─── */
  if (checking) return (
    <div style={{ minHeight:"100vh", background:"#0c0c1a", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Loader2 size={30} color="#a78bfa" style={{ animation:"spin 1s linear infinite" }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ════════════════════════════════════════
     FULL PAGE
  ════════════════════════════════════════ */
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:"#0c0c1a", fontFamily:"'Inter',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes blob1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.06)}66%{transform:translate(-15px,15px) scale(0.94)}}
        @keyframes blob2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-25px,20px) scale(1.08)}66%{transform:translate(20px,-25px) scale(0.92)}}
        .left-panel{display:none!important}
        .right-panel{width:100%;min-height:100vh;padding:24px 16px 80px;}
        @media(min-width:900px){
          .left-panel{display:flex!important}
          .right-panel{width:520px;min-width:520px;padding:40px 56px;}
          .main-row{flex-direction:row!important}
          .mobile-logo{display:none!important}
        }
        @media(min-width:1200px){.right-panel{width:560px;min-width:560px;padding:48px 64px;}}
        @media(min-width:1600px){.right-panel{width:600px;min-width:600px;}}
        .google-btn:hover{background:rgba(255,255,255,0.96)!important;transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,0.35)!important;}
        .google-btn:active{transform:none;}
        .google-btn:disabled{opacity:.55;cursor:not-allowed;transform:none!important;}
        .email-outline-btn:hover{background:rgba(255,255,255,0.05)!important;border-color:rgba(255,255,255,0.2)!important;transform:translateY(-1px);}
        .email-outline-btn:disabled{opacity:.5;cursor:not-allowed;}
        .signin-btn:hover{opacity:.88;transform:translateY(-1px);box-shadow:0 10px 28px rgba(124,58,237,0.5)!important;}
        .signin-btn:active{transform:none;}
        .signin-btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important;}
        .input-field:focus{border-color:rgba(139,92,246,0.6)!important;box-shadow:0 0 0 3px rgba(139,92,246,0.12)!important;outline:none;}
        .feature-card{transition:transform 0.2s ease,border-color 0.2s ease;}
        .feature-card:hover{transform:translateY(-2px);border-color:rgba(255,255,255,0.15)!important;}
        .link-btn:hover{text-decoration:underline;}
        .back-link:hover{color:rgba(255,255,255,0.55)!important;}
        input::placeholder{color:rgba(255,255,255,0.25);}
        input[type=checkbox]{accent-color:#7c3aed;width:16px;height:16px;cursor:pointer;}
      `}</style>

      {/* ── Main row ── */}
      <div className="main-row" style={{ display:"flex", flex:1 }}>

        {/* ════════════════
            LEFT PANEL
        ════════════════ */}
        <div className="left-panel" style={{
          flex:1, position:"relative", overflow:"hidden",
          flexDirection:"column", justifyContent:"space-between",
          padding:"44px 52px",
        }}>
          {/* Travel photo background */}
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:`url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=85&auto=format&fit=crop')`,
            backgroundSize:"cover", backgroundPosition:"center bottom",
          }} />
          {/* Dark gradient overlay */}
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(to bottom, rgba(8,6,24,0.75) 0%, rgba(8,6,24,0.45) 35%, rgba(8,6,24,0.55) 65%, rgba(8,6,24,0.88) 100%)",
          }} />
          {/* Purple tint overlay */}
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(135deg, rgba(76,29,149,0.3) 0%, transparent 60%)",
          }} />

          {/* Logo top-left */}
          <div style={{ position:"relative", zIndex:2, display:"flex", alignItems:"center", gap:10 }}>
            <TripSyncLogo size={26} />
            <span style={{ fontSize:18, fontWeight:700, color:"white", letterSpacing:"-0.01em" }}>TripSync</span>
          </div>

          {/* Hero copy + feature cards */}
          <div style={{ position:"relative", zIndex:2, animation:"fadeUp 0.7s ease both" }}>
            <h1 style={{
              fontSize:"clamp(30px,3.2vw,46px)", fontWeight:800, color:"white",
              lineHeight:1.12, letterSpacing:"-0.03em", marginBottom:16,
            }}>
              Plan unforgettable<br />
              trips{" "}
              <span style={{
                background:"linear-gradient(90deg,#c084fc,#a855f7)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              }}>
                together
              </span>
            </h1>

            <p style={{ fontSize:15, color:"rgba(255,255,255,0.65)", lineHeight:1.65, maxWidth:340, marginBottom:36 }}>
              AI itineraries, group expenses, voting,<br />
              live collaboration. Everything your<br />
              travel group needs.
            </p>

            {/* Feature cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {FEATURES.map(({ icon: Icon, label, desc, color, bg }, i) => (
                <div key={label} className="feature-card" style={{
                  display:"flex", alignItems:"center", gap:16,
                  padding:"14px 18px",
                  background:"rgba(255,255,255,0.07)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:14, backdropFilter:"blur(16px)",
                  animation:`fadeUp 0.7s ease ${0.15 + i*0.1}s both`,
                  cursor:"default",
                }}>
                  <div style={{
                    width:44, height:44, borderRadius:12, flexShrink:0,
                    background:bg, display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:"white", marginBottom:3 }}>{label}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.5 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust row — bottom left */}
          <div style={{ position:"relative", zIndex:2 }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:14,
              padding:"12px 18px",
              background:"rgba(255,255,255,0.07)",
              border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:14, backdropFilter:"blur(16px)",
            }}>
              {/* Avatars */}
              <div style={{ display:"flex" }}>
                {AVATAR_URLS.map((url, i) => (
                  <img key={i} src={url} alt="" width={32} height={32} style={{
                    borderRadius:"50%", border:"2px solid rgba(12,12,26,0.8)",
                    marginLeft: i > 0 ? -10 : 0, objectFit:"cover",
                  }} />
                ))}
              </div>
              <div>
                <div style={{ display:"flex", gap:2, marginBottom:3 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#facc15" color="#facc15" />)}
                </div>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.6)", fontWeight:500 }}>
                  Trusted by <strong style={{ color:"white" }}>10,000+</strong> travelers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════
            RIGHT PANEL
        ════════════════ */}
        <div className="right-panel" style={{
          background:"#0f0e1f",
          display:"flex", flexDirection:"column",
          justifyContent:"center", alignItems:"center",
          position:"relative", overflow:"hidden",
        }}>
          {/* Subtle bg blobs */}
          <div style={{
            position:"absolute", top:"-15%", right:"-10%",
            width:360, height:360, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)",
            animation:"blob1 9s ease-in-out infinite", pointerEvents:"none",
          }} />
          <div style={{
            position:"absolute", bottom:"-15%", left:"-10%",
            width:300, height:300, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%)",
            animation:"blob2 11s ease-in-out infinite", pointerEvents:"none",
          }} />

          {/* Mobile logo */}
          <div className="mobile-logo" style={{
            display:"flex", flexDirection:"column", alignItems:"center", gap:8,
            marginBottom:28, animation:"fadeIn 0.5s ease",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <TripSyncLogo size={24} />
              <span style={{ fontSize:20, fontWeight:700, color:"white", letterSpacing:"-0.01em" }}>TripSync</span>
            </div>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>AI-powered group travel planning</p>
          </div>

          {/* ── Auth card ── */}
          <div style={{
            width:"100%", maxWidth:420,
            background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:20,
            padding:"36px 32px",
            backdropFilter:"blur(20px)",
            boxShadow:"0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            animation:"fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both",
            position:"relative", zIndex:1,
          }}>
            {!otpSent && !showEmail ? (
              <>
                {/* Logo + title */}
                <div style={{ textAlign:"center", marginBottom:28 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:16 }}>
                    <TripSyncLogo size={24} />
                    <span style={{ fontSize:17, fontWeight:700, color:"white", letterSpacing:"-0.01em" }}>TripSync</span>
                  </div>
                  <h2 style={{ fontSize:26, fontWeight:800, color:"white", letterSpacing:"-0.025em", marginBottom:6 }}>
                    Welcome back
                  </h2>
                  <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", lineHeight:1.5 }}>
                    Sign in to continue planning smarter trips
                  </p>
                </div>

                {/* Google button */}
                <button
                  className="google-btn"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  aria-label="Continue with Google"
                  style={{
                    width:"100%", height:52,
                    background:"white",
                    border:"1px solid rgba(255,255,255,0.2)",
                    borderRadius:12,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                    fontSize:15, fontWeight:600, color:"#1e1b4b",
                    cursor:"pointer", transition:"all 0.2s ease",
                    boxShadow:"0 2px 12px rgba(0,0,0,0.3)",
                    fontFamily:"inherit", marginBottom:14,
                  }}
                >
                  {googleLoading
                    ? <Loader2 size={18} color="#1e1b4b" style={{ animation:"spin 1s linear infinite" }} />
                    : <GoogleIcon />
                  }
                  {googleLoading ? "Signing in..." : "Continue with Google"}
                </button>

                {/* Divider */}
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }} />
                  <span style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.28)", letterSpacing:"0.08em" }}>
                    OR CONTINUE WITH
                  </span>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }} />
                </div>

                {/* Email button */}
                <button
                  className="email-outline-btn"
                  onClick={() => setShowEmail(true)}
                  aria-label="Continue with Email"
                  style={{
                    width:"100%", height:50,
                    background:"transparent",
                    border:"1px solid rgba(255,255,255,0.12)",
                    borderRadius:12,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                    fontSize:15, fontWeight:600, color:"rgba(255,255,255,0.85)",
                    cursor:"pointer", transition:"all 0.2s ease",
                    fontFamily:"inherit", marginBottom:20,
                  }}
                >
                  <Mail size={17} color="rgba(255,255,255,0.7)" />
                  Continue with Email
                </button>

                {/* Remember me + Forgot password */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                  <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      aria-label="Remember me"
                    />
                    <span style={{ fontSize:14, color:"rgba(255,255,255,0.65)" }}>Remember me</span>
                  </label>
                  <button
                    className="link-btn"
                    style={{
                      background:"none", border:"none", cursor:"pointer",
                      fontSize:14, color:"#a78bfa", fontFamily:"inherit", padding:0,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign in CTA */}
                <button
                  className="signin-btn"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  aria-label="Sign in"
                  style={{
                    width:"100%", height:50,
                    background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
                    border:"none", borderRadius:12,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:15, fontWeight:700, color:"white",
                    cursor:"pointer", transition:"all 0.2s ease",
                    boxShadow:"0 6px 20px rgba(124,58,237,0.4)",
                    fontFamily:"inherit", marginBottom:20,
                    letterSpacing:"0.01em",
                  }}
                >
                  {googleLoading
                    ? <Loader2 size={18} color="white" style={{ animation:"spin 1s linear infinite" }} />
                    : "Sign in"
                  }
                </button>

                {/* Create account */}
                <p style={{ textAlign:"center", fontSize:14, color:"rgba(255,255,255,0.4)" }}>
                  Don't have an account?{" "}
                  <button
                    className="link-btn"
                    style={{
                      background:"none", border:"none", cursor:"pointer",
                      fontSize:14, color:"#a78bfa", fontWeight:600, fontFamily:"inherit",
                    }}
                  >
                    Create one
                  </button>
                </p>
              </>
            ) : showEmail && !otpSent ? (
              <>
                {/* Email input screen */}
                <div style={{ textAlign:"center", marginBottom:24 }}>
                  <TripSyncLogo size={28} />
                  <h2 style={{ fontSize:22, fontWeight:800, color:"white", marginTop:12, marginBottom:6, letterSpacing:"-0.02em" }}>
                    Sign in with email
                  </h2>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>
                    We'll send a magic link to your inbox
                  </p>
                </div>

                <form onSubmit={handleEmailOTP} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.06em", color:"rgba(255,255,255,0.4)", marginBottom:7 }}>
                      EMAIL ADDRESS
                    </label>
                    <div style={{ position:"relative" }}>
                      <Mail size={15} color="rgba(255,255,255,0.25)" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
                      <input
                        className="input-field"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        aria-label="Email address"
                        style={{
                          width:"100%", height:48,
                          background:"rgba(255,255,255,0.05)",
                          border:"1px solid rgba(255,255,255,0.1)",
                          borderRadius:12, paddingLeft:40, paddingRight:14,
                          fontSize:14, color:"white", fontFamily:"inherit",
                          transition:"all 0.15s ease",
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="signin-btn"
                    style={{
                      width:"100%", height:48,
                      background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
                      border:"none", borderRadius:12,
                      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                      fontSize:14, fontWeight:700, color:"white",
                      cursor:"pointer", transition:"all 0.2s ease",
                      boxShadow:"0 6px 20px rgba(124,58,237,0.4)",
                      fontFamily:"inherit",
                    }}
                  >
                    {loading
                      ? <Loader2 size={16} color="white" style={{ animation:"spin 1s linear infinite" }} />
                      : <><Mail size={15} /> Send Magic Link</>
                    }
                  </button>
                </form>

                <button
                  className="back-link"
                  onClick={() => setShowEmail(false)}
                  style={{
                    width:"100%", marginTop:14, background:"none", border:"none",
                    fontSize:13, color:"rgba(255,255,255,0.3)", cursor:"pointer",
                    fontFamily:"inherit", transition:"color 0.15s",
                  }}
                >
                  ← Back to sign in
                </button>
              </>
            ) : (
              <>
                {/* OTP verification screen */}
                <div style={{ textAlign:"center", marginBottom:24 }}>
                  <div style={{
                    width:56, height:56, borderRadius:16, margin:"0 auto 16px",
                    background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <Mail size={24} color="#a78bfa" />
                  </div>
                  <h2 style={{ fontSize:22, fontWeight:800, color:"white", marginBottom:6, letterSpacing:"-0.02em" }}>
                    Check your email
                  </h2>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>
                    We sent a code to{" "}
                    <span style={{ color:"rgba(255,255,255,0.75)", fontWeight:600 }}>{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.06em", color:"rgba(255,255,255,0.4)", marginBottom:7 }}>
                      VERIFICATION CODE
                    </label>
                    <input
                      className="input-field"
                      type="text"
                      inputMode="numeric"
                      placeholder="000000"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
                      maxLength={6}
                      autoFocus
                      aria-label="6-digit verification code"
                      style={{
                        width:"100%", height:60,
                        background:"rgba(255,255,255,0.05)",
                        border:"1px solid rgba(255,255,255,0.1)",
                        borderRadius:14, textAlign:"center",
                        fontSize:26, fontWeight:700, letterSpacing:"0.35em",
                        color:"white", fontFamily:"monospace",
                        transition:"all 0.15s ease", caretColor:"#a78bfa",
                      }}
                    />
                    {/* Progress dots */}
                    <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:10 }}>
                      {[...Array(6)].map((_,i) => (
                        <div key={i} style={{
                          width:7, height:7, borderRadius:"50%",
                          background: i < otp.length ? "#7c3aed" : "rgba(255,255,255,0.1)",
                          transition:"background 0.15s",
                        }} />
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="signin-btn"
                    style={{
                      width:"100%", height:48,
                      background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
                      border:"none", borderRadius:12,
                      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                      fontSize:14, fontWeight:700, color:"white",
                      cursor:"pointer", transition:"all 0.2s ease",
                      boxShadow:"0 6px 20px rgba(124,58,237,0.4)",
                      fontFamily:"inherit",
                    }}
                  >
                    {loading
                      ? <Loader2 size={16} color="white" style={{ animation:"spin 1s linear infinite" }} />
                      : <>Verify & Sign In <ArrowRight size={15} /></>
                    }
                  </button>
                </form>

                <button
                  className="back-link"
                  onClick={() => { setOtpSent(false); setShowEmail(false); setOtp(""); }}
                  style={{
                    width:"100%", marginTop:14, background:"none", border:"none",
                    fontSize:13, color:"rgba(255,255,255,0.3)", cursor:"pointer",
                    fontFamily:"inherit", transition:"color 0.15s",
                  }}
                >
                  ← Use a different email
                </button>
              </>
            )}
          </div>

          {/* Mobile trust bar */}
          <div style={{
            display:"flex", alignItems:"center", gap:8, marginTop:24,
            animation:"fadeIn 0.6s ease 0.3s both", position:"relative", zIndex:1,
          }}>
            <div style={{ display:"flex", gap:1 }}>
              {[...Array(5)].map((_,i) => <Star key={i} size={11} fill="#facc15" color="#facc15" />)}
            </div>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>
              Trusted by <span style={{ color:"rgba(255,255,255,0.55)", fontWeight:600 }}>10,000+</span> travelers
            </p>
          </div>

          {/* Security badge */}
          <div style={{
            display:"flex", alignItems:"center", gap:5, marginTop:12,
            position:"relative", zIndex:1,
          }}>
            <Shield size={12} color="rgba(255,255,255,0.2)" />
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>256-bit SSL encryption</p>
          </div>
        </div>
      </div>

      {/* ── Global footer ── */}
      <div style={{
        background:"#0c0b1a",
        borderTop:"1px solid rgba(255,255,255,0.05)",
        padding:"14px 24px",
        textAlign:"center",
      }}>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>
          By continuing, you agree to our{" "}
          <a href="#" style={{ color:"#a78bfa", textDecoration:"none" }}>Terms of Service</a>
          {" "}and{" "}
          <a href="#" style={{ color:"#a78bfa", textDecoration:"none" }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:"100vh", background:"#0c0c1a", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Loader2 size={28} color="#a78bfa" style={{ animation:"spin 1s linear infinite" }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
