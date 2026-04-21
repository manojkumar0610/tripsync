import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plane, Sparkles, Users, DollarSign, Map, Vote,
  CloudSun, Shield, ArrowRight, Check, Star
} from "lucide-react";

const FEATURES = [
  { icon: Sparkles, title: "AI Itinerary Generator", desc: "GPT-4 powered day-by-day plans tailored to your budget, style, and interests. Complete with food spots, timings, and local tips.", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
  { icon: DollarSign, title: "Smart Expense Splitting", desc: "Track every expense. Split equally or custom amounts. Know exactly who owes whom with one-click settlement.", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { icon: Users, title: "Real-time Collaboration", desc: "Invite friends via link or code. Edit together, comment, and coordinate — like Notion for travel planning.", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { icon: Vote, title: "Group Voting", desc: "Can't decide on hotels or activities? Create a vote and let the group decide democratically with live results.", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { icon: CloudSun, title: "Live Weather", desc: "Real-time weather forecasts for your destination so you can pack right and plan outdoor activities smartly.", color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950/30" },
  { icon: Map, title: "Trip Dashboard", desc: "Beautiful visual dashboard for all your trips — upcoming, active, and past. Never lose track of plans again.", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", role: "Backpacker, 12 countries", avatar: "PS", text: "TripSync made our Bali trip with 8 friends actually enjoyable. No more WhatsApp chaos about who owes what. The AI itinerary was scarily good.", rating: 5 },
  { name: "Marcus Chen", role: "Digital nomad", avatar: "MC", text: "Generated a 10-day Japan itinerary in seconds. It knew exactly which areas to stay in, the best ramen spots, and transit tips. Saved me 3 hours.", rating: 5 },
  { name: "Ananya Patel", role: "Travel photographer", avatar: "AP", text: "The expense splitting alone is worth it. Our Ladakh bike trip group had zero arguments about money for the first time ever. Game changer.", rating: 5 },
];

const PRICING = [
  { name: "Free", price: "$0", period: "forever", desc: "Perfect for casual travelers", features: ["3 active trips", "10 members per trip", "Basic expense splitting", "2 AI itineraries/month", "Group voting"], cta: "Get Started Free", href: "/auth/login", highlighted: false },
  { name: "Pro", price: "$9", period: "per month", desc: "For serious travel planners", features: ["Unlimited trips", "Unlimited members", "Advanced expense analytics", "Unlimited AI itineraries", "PDF export & sharing", "Priority support", "Custom trip covers"], cta: "Start Pro Trial", href: "/auth/login", highlighted: true },
  { name: "Team", price: "$29", period: "per month", desc: "For agencies & large groups", features: ["Everything in Pro", "Team workspace", "White-label branding", "API access", "Dedicated support"], cta: "Contact Sales", href: "/auth/login", highlighted: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-md">
              <Plane className="text-white rotate-45" size={18} />
            </div>
            <span className="font-syne text-xl font-bold">TripSync</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link href="/auth/login"><Button variant="gradient" size="sm">Get Started Free</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-gradient-to-b from-blue-100/60 to-violet-100/40 blur-3xl dark:from-blue-900/20 dark:to-violet-900/10" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="info" className="mb-6 px-4 py-1.5 text-sm gap-1.5 border-blue-200 dark:border-blue-800">
            <Sparkles size={13} /> Powered by GPT-4
          </Badge>
          <h1 className="font-syne text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
            Plan trips together.{" "}
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-blue-700 bg-clip-text text-transparent">
              Actually enjoy them.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            TripSync combines AI itinerary generation, group expense splitting, and real-time collaboration — everything your travel group needs in one beautiful app.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/login">
              <Button variant="gradient" size="xl" className="gap-2 shadow-2xl shadow-blue-500/30 px-10">
                Start Planning Free <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="xl" className="gap-2">See How It Works</Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-400">No credit card required · Free forever plan</p>

          {/* Mock UI preview */}
          <div className="mt-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" /><div className="h-3 w-3 rounded-full bg-amber-400" /><div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 text-center">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1 text-xs text-slate-500 dark:text-slate-400">
                  <Shield size={10} /> app.tripsync.io/dashboard
                </div>
              </div>
            </div>
            <div className="p-6 flex gap-4 min-h-[240px]">
              <div className="w-44 shrink-0 space-y-1.5">
                <div className="h-8 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center px-3 gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-400" /><div className="h-2 w-16 rounded bg-white/30 dark:bg-slate-900/30" />
                </div>
                {["My Trips", "Create Trip", "Settings"].map((item) => (
                  <div key={item} className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center px-3 gap-2">
                    <div className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-600" /><div className="h-2 w-14 rounded bg-slate-200 dark:bg-slate-600" />
                  </div>
                ))}
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[{ v: "5", c: "bg-blue-50 dark:bg-blue-950/30" }, { v: "2", c: "bg-violet-50 dark:bg-violet-950/30" }, { v: "$1.2k", c: "bg-emerald-50 dark:bg-emerald-950/30" }, { v: "$340", c: "bg-amber-50 dark:bg-amber-950/30" }].map((s, i) => (
                    <div key={i} className={`rounded-xl ${s.c} p-3`}>
                      <div className="h-2 w-10 rounded bg-slate-200 dark:bg-slate-600 mb-2" />
                      <div className="font-syne font-bold text-base text-slate-700 dark:text-slate-200">{s.v}</div>
                    </div>
                  ))}
                </div>
                {["🏝️ Bali Summer Trip", "🗼 Paris Anniversary"].map((label, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-lg shrink-0">{label.split(" ")[0]}</div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-32 rounded bg-slate-200 dark:bg-slate-600" />
                      <div className="h-2 w-24 rounded bg-slate-100 dark:bg-slate-700" />
                    </div>
                    <div className="h-5 w-16 rounded-full bg-blue-100 dark:bg-blue-900/40" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="font-syne text-4xl font-bold mb-4">Everything your travel group needs</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">From AI itineraries to expense splitting, TripSync handles the logistics.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${f.bg} mb-4`}>
                  <f.icon size={22} className={f.color} />
                </div>
                <h3 className="font-syne text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="font-syne text-4xl font-bold mb-4">Travelers love TripSync</h2>
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <p className="text-slate-400 text-sm">4.9/5 from 1,200+ travelers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
                <div className="flex gap-1 mb-4">{[...Array(t.rating)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}</div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                  <div><p className="text-sm font-semibold">{t.name}</p><p className="text-xs text-slate-400">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h2 className="font-syne text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-500 dark:text-slate-400">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING.map((plan) => (
              <div key={plan.name} className={`rounded-2xl border p-6 relative ${plan.highlighted ? "border-blue-500 shadow-xl shadow-blue-500/10 bg-gradient-to-b from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30" : "border-slate-200 dark:border-slate-800"}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-violet-600 text-white border-0 shadow-md text-xs px-3">Most Popular</Badge>
                  </div>
                )}
                <h3 className="font-syne font-bold text-lg mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-xs mb-4">{plan.desc}</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="font-syne text-4xl font-bold">{plan.price}</span>
                  <span className="text-slate-400 text-sm mb-1">/{plan.period}</span>
                </div>
                <Link href={plan.href}><Button variant={plan.highlighted ? "gradient" : "outline"} className="w-full mb-6">{plan.cta}</Button></Link>
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                      <Check size={14} className="text-emerald-500 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-700">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-syne text-4xl font-bold text-white mb-4">Your next great trip starts here</h2>
          <p className="text-blue-100/80 text-lg mb-8">Join thousands of travelers using TripSync to plan smarter and travel better.</p>
          <Link href="/auth/login">
            <Button size="xl" className="bg-white text-blue-700 hover:bg-white/90 font-semibold gap-2 shadow-2xl">
              Get Started Free <ArrowRight size={18} />
            </Button>
          </Link>
          <p className="mt-3 text-blue-200/60 text-sm">No credit card · 2 minute setup</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
              <Plane className="text-white rotate-45" size={14} />
            </div>
            <span className="font-syne font-bold">TripSync</span>
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} TripSync. Built with ❤️ for travelers.</p>
          <div className="flex gap-4 text-sm text-slate-400">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
