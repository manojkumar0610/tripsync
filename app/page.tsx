import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Plane, Sparkles, Users, DollarSign, Map, Vote,
  CloudSun, ArrowRight, Check, Star, Shield, Zap
} from "lucide-react";

const FEATURES = [
  { icon: Sparkles, title: "AI Itinerary Generator", desc: "GPT-4 powered day-by-day plans tailored to your budget, style, and interests — complete with food spots, timings, and local tips.", color: "text-violet-400", glow: "shadow-violet-500/20", bg: "from-violet-600/10 to-violet-600/5", border: "border-violet-500/10" },
  { icon: DollarSign, title: "Smart Expense Splitting", desc: "Track every expense. Split equally or custom. See exactly who owes whom with one-click settlement.", color: "text-emerald-400", glow: "shadow-emerald-500/20", bg: "from-emerald-600/10 to-emerald-600/5", border: "border-emerald-500/10" },
  { icon: Users, title: "Real-time Collaboration", desc: "Invite friends via link or 6-letter code. Plan together like Notion — everyone on the same page.", color: "text-blue-400", glow: "shadow-blue-500/20", bg: "from-blue-600/10 to-blue-600/5", border: "border-blue-500/10" },
  { icon: Vote, title: "Group Voting", desc: "Can't decide on hotels or activities? Create a vote and get the group's answer with live results.", color: "text-amber-400", glow: "shadow-amber-500/20", bg: "from-amber-600/10 to-amber-600/5", border: "border-amber-500/10" },
  { icon: CloudSun, title: "Live Weather", desc: "Real-time forecasts for your destination so you always know what to pack and plan for.", color: "text-sky-400", glow: "shadow-sky-500/20", bg: "from-sky-600/10 to-sky-600/5", border: "border-sky-500/10" },
  { icon: Map, title: "Trip Dashboard", desc: "Beautiful visual dashboard for all your trips — active, upcoming, and past in one place.", color: "text-rose-400", glow: "shadow-rose-500/20", bg: "from-rose-600/10 to-rose-600/5", border: "border-rose-500/10" },
];

const TESTIMONIALS = [
  { name: "Priya S.", role: "Backpacker · 12 countries", avatar: "PS", text: "TripSync made our 8-person Bali trip seamless. No more WhatsApp chaos about expenses. The AI itinerary was incredibly accurate.", rating: 5, color: "from-blue-500 to-violet-600" },
  { name: "Marcus C.", role: "Digital nomad", avatar: "MC", text: "Generated a 10-day Japan itinerary in seconds. It knew the best areas, top ramen spots, and transit tips. Saved me 3 hours of research.", rating: 5, color: "from-emerald-500 to-teal-600" },
  { name: "Ananya P.", role: "Travel photographer", avatar: "AP", text: "The expense splitting alone is worth everything. Our Ladakh bike trip had zero money arguments for the first time in 5 years.", rating: 5, color: "from-amber-500 to-orange-600" },
];

const PRICING = [
  {
    name: "Free", price: "$0", period: "forever", desc: "For casual travelers",
    features: ["3 active trips", "10 members per trip", "Basic expense splitting", "2 AI itineraries/month", "Group voting"],
    cta: "Get Started Free", href: "/auth/login", highlight: false,
  },
  {
    name: "Pro", price: "$9", period: "/month", desc: "For serious travelers",
    features: ["Unlimited trips & members", "Unlimited AI itineraries", "PDF export & sharing", "Advanced analytics", "Priority support", "Custom trip covers"],
    cta: "Start Free Trial", href: "/auth/login", highlight: true,
  },
  {
    name: "Team", price: "$29", period: "/month", desc: "For agencies & groups",
    features: ["Everything in Pro", "Team workspace", "White-label", "API access", "Dedicated support"],
    cta: "Contact Sales", href: "/auth/login", highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080810]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080810]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Plane className="w-4 h-4 text-white rotate-45" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">TripSync</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/40">
            {["#features", "#testimonials", "#pricing"].map((href, i) => (
              <a key={href} href={href} className="hover:text-white/80 transition-colors">
                {["Features", "Reviews", "Pricing"][i]}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <button className="text-sm font-medium text-white/50 hover:text-white/80 transition-colors px-3 py-2">
                Sign In
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="btn-glow flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold text-white">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-32">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-b from-blue-600/10 to-violet-600/5 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-2xl" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-violet-500/5 blur-2xl" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by GPT-4
            <span className="w-1 h-1 rounded-full bg-blue-400/50" />
            <span className="text-blue-300/60">Now in Beta</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-bold text-white leading-[1.06] tracking-tight mb-6">
            Plan trips together.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-blue-500">
              Actually enjoy them.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI itineraries, group expense splitting, real-time collaboration, and group voting — everything your travel group needs in one beautiful app.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link href="/auth/login">
              <button className="btn-glow flex items-center gap-2 h-12 px-8 rounded-xl text-base font-semibold text-white">
                Start Planning Free <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <a href="#features">
              <button className="flex items-center gap-2 h-12 px-6 rounded-xl border border-white/10 text-white/60 text-base font-medium hover:border-white/20 hover:text-white/80 transition-all">
                See Features
              </button>
            </a>
          </div>

          <p className="text-sm text-white/20">No credit card required · Free forever plan</p>

          {/* App mockup */}
          <div className="mt-16 relative mx-auto max-w-3xl">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d14] shadow-2xl shadow-black/50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0a0a11]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-md px-3 py-1 text-xs text-white/25">
                    <Shield className="w-3 h-3" /> app.tripsync.io/dashboard
                  </div>
                </div>
              </div>
              <div className="flex gap-0 min-h-[220px]">
                {/* Sidebar mock */}
                <div className="w-44 border-r border-white/[0.04] bg-[#0a0a11] p-3 space-y-1.5 shrink-0">
                  <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-blue-500/10">
                    <div className="w-3.5 h-3.5 rounded bg-blue-400/60" />
                    <div className="h-2 w-16 rounded bg-blue-400/30" />
                  </div>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-2">
                      <div className="w-3.5 h-3.5 rounded bg-white/10" />
                      <div className="h-2 rounded bg-white/[0.06]" style={{ width: `${40 + i * 12}px` }} />
                    </div>
                  ))}
                </div>
                {/* Main mock */}
                <div className="flex-1 p-5 space-y-4">
                  <div className="grid grid-cols-4 gap-2.5">
                    {[
                      { v: "5", c: "text-blue-400", bg: "bg-blue-500/8" },
                      { v: "2", c: "text-violet-400", bg: "bg-violet-500/8" },
                      { v: "$1.2k", c: "text-emerald-400", bg: "bg-emerald-500/8" },
                      { v: "$340", c: "text-rose-400", bg: "bg-rose-500/8" },
                    ].map((s, i) => (
                      <div key={i} className={`rounded-xl ${s.bg} border border-white/[0.04] p-3`}>
                        <div className="h-1.5 w-10 rounded bg-white/[0.06] mb-2" />
                        <span className={`text-sm font-bold ${s.c}`}>{s.v}</span>
                      </div>
                    ))}
                  </div>
                  {["🏝️ Bali Summer Trip", "🗼 Paris Anniversary"].map((label, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600/40 to-violet-600/40 flex items-center justify-center text-base shrink-0">
                        {label.split(" ")[0]}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 w-32 rounded bg-white/15" />
                        <div className="h-2 w-24 rounded bg-white/[0.06]" />
                      </div>
                      <div className="h-5 w-12 rounded-full bg-blue-500/20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Glow under mockup */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-blue-600/15 blur-2xl rounded-full" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/40 text-xs font-medium mb-4">
              Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Everything your travel group needs
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              From AI itineraries to expense splitting, TripSync handles the hard parts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`rounded-2xl bg-gradient-to-br ${f.bg} border ${f.border} p-6 group hover:-translate-y-1 transition-all duration-300`}
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.bg} border ${f.border} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/40 text-xs font-medium mb-4">
              Reviews
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
              Travelers love TripSync
            </h2>
            <div className="flex items-center justify-center gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-white/25 text-sm">4.9/5 · 1,200+ travelers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-white/50 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/80">{t.name}</p>
                    <p className="text-xs text-white/30">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/40 text-xs font-medium mb-4">
              Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-white/35">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRICING.map(plan => (
              <div key={plan.name} className={`rounded-2xl border p-6 relative ${
                plan.highlight
                  ? "border-blue-500/30 bg-gradient-to-b from-blue-600/8 to-violet-600/5 shadow-xl shadow-blue-500/10"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-white/70 mb-1">{plan.name}</p>
                  <p className="text-xs text-white/30 mb-4">{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/30 text-sm mb-1">{plan.period}</span>
                  </div>
                </div>
                <Link href={plan.href}>
                  <button className={cn("w-full h-10 rounded-xl text-sm font-semibold mb-6 transition-all", plan.highlight ? "btn-glow text-white" : "border border-white/10 text-white/60 hover:border-white/20 hover:text-white/80")}>
                    {plan.cta}
                  </button>
                </Link>
                <ul className="space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/40">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/25">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Your next great trip starts here
          </h2>
          <p className="text-white/40 text-lg mb-8">
            Join thousands of travelers using TripSync to plan smarter and travel better.
          </p>
          <Link href="/auth/login">
            <button className="btn-glow inline-flex items-center gap-2 h-12 px-10 rounded-xl text-base font-semibold text-white">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <p className="mt-4 text-white/20 text-sm">No credit card · 2 minute setup</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Plane className="w-3.5 h-3.5 text-white rotate-45" />
            </div>
            <span className="text-sm font-bold text-white/60">TripSync</span>
          </div>
          <p className="text-xs text-white/20">© {new Date().getFullYear()} TripSync. Built for travelers.</p>
          <div className="flex gap-5 text-xs text-white/25">
            <a href="#" className="hover:text-white/50 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/50 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/50 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
