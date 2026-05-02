"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Sparkles, DollarSign, Users, Vote, CloudSun,
  ArrowRight, Check, Star, Play, Menu, X,
  BarChart3, Briefcase, ChevronRight, Shield, Map
} from "lucide-react";

const TripSyncStar = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5L12 2Z" fill="url(#sg)" />
    <defs>
      <linearGradient id="sg" x1="2" y1="2" x2="22" y2="22">
        <stop stopColor="#a78bfa" /><stop offset="1" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
  </svg>
);

const FEATURES = [
  { icon: Sparkles, title: "AI Itinerary Builder", desc: "Get day-by-day plans tailored to your budget, style, and interests.", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  { icon: DollarSign, title: "Smart Expense Splitting", desc: "Split expenses equally or custom amounts. One-click settlement.", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  { icon: Vote, title: "Group Voting", desc: "Vote on places, activities, and plans. Everyone's voice counts.", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  { icon: Users, title: "Real-time Collaboration", desc: "Plan together, edit in real-time, and stay in sync with your group.", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  { icon: CloudSun, title: "Weather & Bookings", desc: "Check weather, find the best time, and book experiences seamlessly.", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", role: "Backpacker · 12 countries", avatar: "https://i.pravatar.cc/40?img=47", text: "TripSync made our Bali trip with 8 friends actually enjoyable. No more WhatsApp chaos about who owes what. The AI itinerary was scarily good.", rating: 5 },
  { name: "Marcus Chen", role: "Digital nomad", avatar: "https://i.pravatar.cc/40?img=12", text: "Generated a 10-day Japan itinerary in seconds. It knew the best areas, top ramen spots, and transit tips. Saved me 3 hours of research.", rating: 5 },
  { name: "Ananya Patel", role: "Travel photographer", avatar: "https://i.pravatar.cc/40?img=32", text: "The expense splitting alone is worth it. Our Ladakh bike trip group had zero money arguments for the first time in 5 years.", rating: 5 },
];

const PRICING = [
  { name: "Free", price: "$0", period: "forever", desc: "Perfect for casual travelers", features: ["3 active trips", "10 members per trip", "Basic expense splitting", "2 AI itineraries/month", "Group voting"], cta: "Get Started Free", href: "/auth/login", highlighted: false },
  { name: "Pro", price: "$9", period: "/month", desc: "For serious travel planners", features: ["Unlimited trips", "Unlimited members", "Advanced analytics", "Unlimited AI itineraries", "PDF export & sharing", "Priority support"], cta: "Start Pro Trial", href: "/auth/login", highlighted: true },
  { name: "Team", price: "$29", period: "/month", desc: "For agencies & large groups", features: ["Everything in Pro", "Team workspace", "White-label branding", "API access", "Dedicated support"], cta: "Contact Sales", href: "/auth/login", highlighted: false },
];

const AVATAR_URLS = ["https://i.pravatar.cc/40?img=47","https://i.pravatar.cc/40?img=12","https://i.pravatar.cc/40?img=32","https://i.pravatar.cc/40?img=56"];
const LOGOS = ["Product Hunt","Travelperk","G2","Capterra"];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#0a0914", fontFamily:"'Inter',system-ui,sans-serif", color:"white" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        a{text-decoration:none;color:inherit;}
        ::selection{background:rgba(124,58,237,0.3);}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.4);border-radius:99px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .nav-link:hover{color:white!important;}
        .cta-btn:hover{opacity:.88;transform:translateY(-1px);box-shadow:0 12px 32px rgba(124,58,237,0.5)!important;}
        .cta-btn:active{transform:none;}
        .outline-btn:hover{background:rgba(255,255,255,0.1)!important;border-color:rgba(255,255,255,0.3)!important;transform:translateY(-1px);}
        .sign-in-btn:hover{border-color:rgba(255,255,255,0.35)!important;color:white!important;}
        .feature-card:hover{border-color:rgba(167,139,250,0.3)!important;transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.45)!important;}
        .testimonial-card:hover{border-color:rgba(255,255,255,0.12)!important;transform:translateY(-2px);}
        .pricing-card:hover{transform:translateY(-4px);}
        .learn-more:hover{color:white!important;gap:10px!important;}
        .footer-link:hover{color:rgba(255,255,255,0.7)!important;}
        @media(max-width:768px){
          .nav-links-desktop{display:none!important;}
          .mobile-toggle{display:flex!important;}
          .hero-btns{flex-direction:column!important;align-items:stretch!important;}
          .hero-btns button{width:100%!important;justify-content:center!important;}
          .features-grid{grid-template-columns:1fr!important;}
          .testimonials-grid{grid-template-columns:1fr!important;}
          .pricing-grid{grid-template-columns:1fr!important;}
          .footer-grid{flex-direction:column!important;text-align:center!important;gap:12px!important;}
          .proof-grid{flex-direction:column!important;align-items:flex-start!important;gap:16px!important;}
          .logos-row{flex-wrap:wrap!important;gap:16px!important;}
          .cta-banner{flex-direction:column!important;align-items:flex-start!important;}
          .hero-h1{font-size:clamp(34px,9vw,56px)!important;}
        }
        @media(min-width:769px){
          .mobile-toggle{display:none!important;}
          .features-grid{grid-template-columns:repeat(3,1fr)!important;}
          .testimonials-grid{grid-template-columns:repeat(3,1fr)!important;}
          .pricing-grid{grid-template-columns:repeat(3,1fr)!important;}
        }
        @media(max-width:1024px){
          .features-grid{grid-template-columns:repeat(2,1fr)!important;}
          .pricing-grid{grid-template-columns:repeat(2,1fr)!important;}
        }
        input::placeholder{color:rgba(255,255,255,0.25);}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        height:64, display:"flex", alignItems:"center",
        padding:"0 24px",
        background: scrolled ? "rgba(10,9,20,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition:"all 0.3s ease",
      }}>
        <div style={{ maxWidth:1280, width:"100%", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:9 }}>
            <TripSyncStar size={22} />
            <span style={{ fontSize:18, fontWeight:700, letterSpacing:"-0.01em" }}>TripSync</span>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links-desktop" style={{ display:"flex", alignItems:"center", gap:28 }}>
            {[["Features","#features"],["How It Works","#features"],["Pricing","#pricing"],["Testimonials","#testimonials"],["Blog","#"]].map(([label,href]) => (
              <a key={label} href={href} className="nav-link" style={{ fontSize:14, fontWeight:500, color:"rgba(255,255,255,0.55)", transition:"color 0.15s" }}>{label}</a>
            ))}
          </div>

          {/* Right buttons */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Link href="/auth/login">
              <button className="sign-in-btn" style={{
                height:38, padding:"0 18px", background:"transparent",
                border:"1px solid rgba(255,255,255,0.15)", borderRadius:10,
                fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.8)",
                cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
              }}>Sign In</button>
            </Link>
            <Link href="/auth/login">
              <button className="cta-btn" style={{
                height:38, padding:"0 18px",
                background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
                border:"none", borderRadius:10,
                fontSize:14, fontWeight:700, color:"white",
                cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s ease",
                boxShadow:"0 4px 14px rgba(124,58,237,0.4)",
              }}>Get Started Free</button>
            </Link>
            <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} style={{
              display:"none", background:"none", border:"none",
              cursor:"pointer", color:"white", padding:4,
            }}>
              {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            position:"absolute", top:64, left:0, right:0,
            background:"rgba(10,9,20,0.98)", backdropFilter:"blur(20px)",
            borderBottom:"1px solid rgba(255,255,255,0.08)",
            padding:"16px 24px 24px",
          }}>
            {[["Features","#features"],["Pricing","#pricing"],["Testimonials","#testimonials"]].map(([label,href]) => (
              <a key={label} href={href} onClick={()=>setMobileOpen(false)} style={{
                display:"block", padding:"13px 0", fontSize:16, fontWeight:500,
                color:"rgba(255,255,255,0.7)", borderBottom:"1px solid rgba(255,255,255,0.06)",
              }}>{label}</a>
            ))}
            <div style={{ display:"flex", gap:10, marginTop:18 }}>
              <Link href="/auth/login" style={{ flex:1 }}>
                <button style={{ width:"100%", height:44, border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, background:"transparent", color:"white", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Sign In</button>
              </Link>
              <Link href="/auth/login" style={{ flex:1 }}>
                <button className="cta-btn" style={{ width:"100%", height:44, background:"linear-gradient(135deg,#7c3aed,#6d28d9)", border:"none", borderRadius:10, color:"white", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}>Get Started Free</button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"flex-end", paddingTop:64, overflow:"hidden" }}>
        {/* Cinematic travel background */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1800&q=90&auto=format&fit=crop')",
          backgroundSize:"cover", backgroundPosition:"center 40%",
        }}/>
        {/* Layered overlays */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(10,9,20,0.6) 0%, rgba(10,9,20,0.28) 40%, rgba(10,9,20,0.62) 75%, rgba(10,9,20,1) 100%)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg, rgba(76,29,149,0.28) 0%, transparent 55%)" }}/>

        {/* Content */}
        <div style={{ position:"relative", zIndex:2, maxWidth:1280, margin:"0 auto", padding:"0 24px 90px", width:"100%" }}>
          {/* Badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"6px 14px", borderRadius:99, marginBottom:22,
            background:"rgba(124,58,237,0.18)", border:"1px solid rgba(167,139,250,0.3)",
            animation:"fadeUp 0.6s ease both",
          }}>
            <Sparkles size={13} color="#a78bfa"/>
            <span style={{ fontSize:12, fontWeight:600, color:"#c4b5fd", letterSpacing:"0.04em" }}>AI-Powered Trip Planning</span>
          </div>

          {/* H1 */}
          <h1 className="hero-h1" style={{
            fontSize:"clamp(38px,5.8vw,78px)", fontWeight:900,
            letterSpacing:"-0.04em", lineHeight:1.08,
            maxWidth:640, marginBottom:18,
            animation:"fadeUp 0.6s ease 0.1s both",
          }}>
            Plan unforgettable<br/>trips{" "}
            <span style={{
              background:"linear-gradient(90deg,#c084fc 0%,#a855f7 60%,#9333ea 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            }}>together</span>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize:18, color:"rgba(255,255,255,0.65)",
            lineHeight:1.65, maxWidth:420, marginBottom:34,
            animation:"fadeUp 0.6s ease 0.2s both",
          }}>
            AI itineraries, group expenses, voting,<br/>
            live collaboration. Everything your<br/>
            travel group needs.
          </p>

          {/* Buttons */}
          <div className="hero-btns" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, animation:"fadeUp 0.6s ease 0.3s both" }}>
            <Link href="/auth/login">
              <button className="cta-btn" style={{
                height:52, padding:"0 28px",
                background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
                border:"none", borderRadius:12,
                display:"flex", alignItems:"center", gap:8,
                fontSize:16, fontWeight:700, color:"white",
                cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s ease",
                boxShadow:"0 8px 24px rgba(124,58,237,0.45)",
              }}>
                Start Planning Free <ArrowRight size={18}/>
              </button>
            </Link>
            <button className="outline-btn" style={{
              height:52, padding:"0 24px",
              background:"rgba(255,255,255,0.09)",
              border:"1px solid rgba(255,255,255,0.2)",
              borderRadius:12,
              display:"flex", alignItems:"center", gap:8,
              fontSize:16, fontWeight:600, color:"white",
              cursor:"pointer", fontFamily:"inherit",
              backdropFilter:"blur(8px)", transition:"all 0.2s ease",
            }}>
              <Play size={15} fill="white"/> Watch Demo
            </button>
          </div>

          {/* Trust */}
          <div style={{ display:"flex", alignItems:"center", gap:16, animation:"fadeUp 0.6s ease 0.4s both" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <Shield size={13} color="#a78bfa"/>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>No credit card required</span>
            </div>
            <span style={{ color:"rgba(255,255,255,0.2)", fontSize:16 }}>•</span>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <Check size={13} color="#34d399"/>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>Free forever plan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <section style={{ background:"#0e0c1e", borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"20px 24px" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div className="proof-grid" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:24 }}>
            {/* Avatars + stars */}
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ display:"flex" }}>
                {AVATAR_URLS.map((url,i) => (
                  <img key={i} src={url} alt="" width={34} height={34} style={{ borderRadius:"50%", border:"2px solid #0e0c1e", marginLeft:i>0?-10:0, objectFit:"cover" }}/>
                ))}
                <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(124,58,237,0.2)", border:"2px solid #0e0c1e", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#a78bfa", fontWeight:700, marginLeft:-10 }}>+</div>
              </div>
              <div>
                <div style={{ display:"flex", gap:2, marginBottom:3 }}>
                  {[...Array(5)].map((_,i) => <Star key={i} size={13} fill="#facc15" color="#facc15"/>)}
                </div>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>
                  Trusted by <strong style={{ color:"white" }}>10,000+</strong> travelers
                </p>
              </div>
            </div>
            {/* Logos */}
            <div className="logos-row" style={{ display:"flex", alignItems:"center", gap:32 }}>
              {LOGOS.map(logo => (
                <div key={logo} style={{ display:"flex", alignItems:"center", gap:6, opacity:0.4 }}>
                  <div style={{ width:18, height:18, borderRadius:"50%", background:"rgba(255,255,255,0.25)" }}/>
                  <span style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.8)" }}>{logo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:"96px 24px", background:"#0a0914" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px", borderRadius:99, marginBottom:14, background:"rgba(124,58,237,0.1)", border:"1px solid rgba(167,139,250,0.18)" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#a78bfa" }}/>
              <span style={{ fontSize:12, fontWeight:600, color:"#c4b5fd", letterSpacing:"0.05em" }}>Everything you need</span>
            </div>
            <h2 style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:12 }}>
              Everything your travel group needs
            </h2>
            <p style={{ fontSize:16, color:"rgba(255,255,255,0.4)", maxWidth:500, margin:"0 auto", lineHeight:1.6 }}>
              From AI itineraries to expense splitting, TripSync handles the logistics.
            </p>
          </div>

          <div className="features-grid" style={{ display:"grid", gap:16 }}>
            {FEATURES.map((f,i) => (
              <div key={f.title} className="feature-card" style={{
                background:"#0e0c1e", border:"1px solid rgba(255,255,255,0.07)",
                borderRadius:20, padding:"28px 24px",
                transition:"all 0.25s ease",
                boxShadow:"0 4px 16px rgba(0,0,0,0.3)",
              }}>
                <div style={{ width:52, height:52, borderRadius:14, marginBottom:18, background:f.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <f.icon size={22} color={f.color}/>
                </div>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:10, letterSpacing:"-0.01em" }}>{f.title}</h3>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", lineHeight:1.6, marginBottom:16 }}>{f.desc}</p>
                <a href="#" className="learn-more" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13, fontWeight:600, color:"#a78bfa", transition:"all 0.15s" }}>
                  Learn more <ChevronRight size={14}/>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MINI CTA BANNER ── */}
      <section style={{ padding:"0 24px 80px", background:"#0a0914" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div className="cta-banner" style={{
            background:"linear-gradient(135deg,rgba(124,58,237,0.14),rgba(109,40,217,0.07))",
            border:"1px solid rgba(167,139,250,0.14)", borderRadius:20,
            padding:"28px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:20,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ width:54, height:54, borderRadius:16, background:"rgba(124,58,237,0.18)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Briefcase size={24} color="#a78bfa"/>
              </div>
              <div>
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>Ready to plan your next adventure?</h3>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)" }}>Join thousands of groups who plan better, travel smarter.</p>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
              <Link href="/auth/login">
                <button className="cta-btn" style={{
                  height:48, padding:"0 24px",
                  background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
                  border:"none", borderRadius:12,
                  display:"flex", alignItems:"center", gap:8,
                  fontSize:15, fontWeight:700, color:"white",
                  cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s ease",
                  boxShadow:"0 6px 20px rgba(124,58,237,0.4)", whiteSpace:"nowrap",
                }}>
                  Start Planning Free <ArrowRight size={16}/>
                </button>
              </Link>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.28)" }}>No credit card required • Free forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding:"80px 24px", background:"#0e0c1e", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px", borderRadius:99, marginBottom:14, background:"rgba(124,58,237,0.1)", border:"1px solid rgba(167,139,250,0.18)" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#a78bfa" }}/>
              <span style={{ fontSize:12, fontWeight:600, color:"#c4b5fd", letterSpacing:"0.05em" }}>Testimonials</span>
            </div>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,40px)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:8 }}>Travelers love TripSync</h2>
            <div style={{ display:"flex", justifyContent:"center", gap:3, marginBottom:5 }}>
              {[...Array(5)].map((_,i) => <Star key={i} size={15} fill="#facc15" color="#facc15"/>)}
            </div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)" }}>4.9/5 from 1,200+ travelers</p>
          </div>

          <div className="testimonials-grid" style={{ display:"grid", gap:16 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testimonial-card" style={{
                background:"#0a0914", border:"1px solid rgba(255,255,255,0.07)",
                borderRadius:18, padding:24, transition:"all 0.25s ease",
              }}>
                <div style={{ display:"flex", gap:2, marginBottom:14 }}>
                  {[...Array(t.rating)].map((_,i) => <Star key={i} size={12} fill="#facc15" color="#facc15"/>)}
                </div>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.58)", lineHeight:1.7, marginBottom:18 }}>"{t.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <img src={t.avatar} alt={t.name} width={36} height={36} style={{ borderRadius:"50%", border:"2px solid rgba(124,58,237,0.3)", objectFit:"cover" }}/>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700 }}>{t.name}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.33)" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding:"80px 24px", background:"#0a0914" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px", borderRadius:99, marginBottom:14, background:"rgba(124,58,237,0.1)", border:"1px solid rgba(167,139,250,0.18)" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#a78bfa" }}/>
              <span style={{ fontSize:12, fontWeight:600, color:"#c4b5fd", letterSpacing:"0.05em" }}>Pricing</span>
            </div>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,40px)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:8 }}>Simple, transparent pricing</h2>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.38)" }}>Start free. Upgrade when you need more.</p>
          </div>

          <div className="pricing-grid" style={{ display:"grid", gap:16 }}>
            {PRICING.map(plan => (
              <div key={plan.name} className="pricing-card" style={{
                background: plan.highlighted ? "linear-gradient(145deg,rgba(124,58,237,0.14),rgba(109,40,217,0.07))" : "#0e0c1e",
                border: plan.highlighted ? "1px solid rgba(167,139,250,0.28)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius:20, padding:28, position:"relative",
                transition:"transform 0.25s ease",
                boxShadow: plan.highlighted ? "0 0 40px rgba(124,58,237,0.14)" : "none",
              }}>
                {plan.highlighted && (
                  <div style={{
                    position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)",
                    background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
                    fontSize:11, fontWeight:700, color:"white",
                    padding:"4px 14px", borderRadius:99,
                    boxShadow:"0 4px 12px rgba(124,58,237,0.4)", whiteSpace:"nowrap",
                  }}>Most Popular</div>
                )}
                <p style={{ fontSize:15, fontWeight:700, color:"rgba(255,255,255,0.75)", marginBottom:4 }}>{plan.name}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginBottom:18 }}>{plan.desc}</p>
                <div style={{ display:"flex", alignItems:"flex-end", gap:4, marginBottom:22 }}>
                  <span style={{ fontSize:44, fontWeight:900, letterSpacing:"-0.03em" }}>{plan.price}</span>
                  <span style={{ fontSize:14, color:"rgba(255,255,255,0.32)", marginBottom:7 }}>{plan.period}</span>
                </div>
                <Link href={plan.href}>
                  <button className="cta-btn" style={{
                    width:"100%", height:46, borderRadius:12,
                    fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                    marginBottom:22, transition:"all 0.2s ease",
                    background: plan.highlighted ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "rgba(255,255,255,0.06)",
                    border: plan.highlighted ? "none" : "1px solid rgba(255,255,255,0.1)",
                    color:"white",
                    boxShadow: plan.highlighted ? "0 6px 20px rgba(124,58,237,0.35)" : "none",
                  }}>{plan.cta}</button>
                </Link>
                <ul style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:"rgba(255,255,255,0.52)", listStyle:"none" }}>
                      <Check size={14} color="#34d399" style={{ flexShrink:0 }}/> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{
        padding:"80px 24px", textAlign:"center",
        background:"linear-gradient(135deg,#1a0836 0%,#0a0914 50%,#110626 100%)",
        borderTop:"1px solid rgba(167,139,250,0.08)",
      }}>
        <div style={{ maxWidth:580, margin:"0 auto" }}>
          <div style={{ width:64, height:64, borderRadius:18, margin:"0 auto 24px", background:"rgba(124,58,237,0.18)", border:"1px solid rgba(167,139,250,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Sparkles size={28} color="#a78bfa"/>
          </div>
          <h2 style={{ fontSize:"clamp(24px,4vw,42px)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:14 }}>
            Your next great trip starts here
          </h2>
          <p style={{ fontSize:16, color:"rgba(255,255,255,0.42)", lineHeight:1.65, marginBottom:32 }}>
            Join thousands of travelers using TripSync to plan smarter and travel better together.
          </p>
          <Link href="/auth/login">
            <button className="cta-btn" style={{
              height:54, padding:"0 36px",
              background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
              border:"none", borderRadius:14,
              display:"inline-flex", alignItems:"center", gap:8,
              fontSize:16, fontWeight:700, color:"white",
              cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s ease",
              boxShadow:"0 8px 28px rgba(124,58,237,0.45)",
            }}>
              Get Started Free <ArrowRight size={18}/>
            </button>
          </Link>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.22)", marginTop:14 }}>No credit card · 2 minute setup</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)", background:"#070612", padding:"32px 24px" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div className="footer-grid" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <TripSyncStar size={18}/><span style={{ fontSize:15, fontWeight:700, letterSpacing:"-0.01em" }}>TripSync</span>
            </div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.22)" }}>© {new Date().getFullYear()} TripSync. Built with ❤️ for travelers.</p>
            <div style={{ display:"flex", gap:20 }}>
              {["Privacy","Terms","Contact"].map(item => (
                <a key={item} href="#" className="footer-link" style={{ fontSize:13, color:"rgba(255,255,255,0.28)", transition:"color 0.15s" }}>{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
