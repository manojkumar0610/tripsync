# TripSync ✈️

> AI-powered group travel planning. Plan trips together, split expenses, generate itineraries, and collaborate in real time.

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-green?logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)](https://openai.com)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Itinerary** | GPT-4o-mini day-by-day plans with food, timings, costs |
| 💰 **Expense Splitting** | Equal/custom splits, balance summary, one-click settle |
| 👥 **Group Collaboration** | Invite via 6-letter code or shareable link |
| 🗳️ **Group Voting** | Vote on hotels, dates, activities with live results |
| 🌤️ **Live Weather** | Real-time forecast widget for your destination |
| 📄 **PDF Export** | Download polished trip summary as PDF |
| 🔗 **Share & Invite** | AI-generated shareable trip summaries |
| 🎁 **Referral System** | Invite friends, earn Pro rewards |
| 🌙 **Dark / Light Mode** | System-aware theme toggle |
| 📱 **Mobile-first** | Responsive + bottom nav bar on mobile |

---

## 🛠 Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v3 + custom design tokens |
| Components | ShadCN UI (Radix primitives) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (Google OAuth + Email OTP) |
| Realtime | Supabase Realtime subscriptions |
| AI | OpenAI GPT-4o-mini |
| Weather | OpenWeatherMap API |
| State | Zustand (persisted) + TanStack React Query |
| PDF | jsPDF |
| Toasts | Sonner |
| Fonts | Syne + DM Sans (Google Fonts) |
| Deployment | Vercel |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourname/tripsync.git
cd tripsync
npm install
```

### 2. Environment Variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```env
# ─── Supabase ───────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://gzdhunxdrnpumvojsbed.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZGh1bnhkcm5wdW12b2pzYmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NjMxOTUsImV4cCI6MjA5MjMzOTE5NX0.6EwUgcbo8ynEaG3CvzFYfNYuQI4ty_auuTatGUdLGyg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZGh1bnhkcm5wdW12b2pzYmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2MzE5NSwiZXhwIjoyMDkyMzM5MTk1fQ.JdY2VDHOu0IYrtY5bxf3TUn7-NUTa3uv1vXhD5f9bek

# ─── OpenAI ─────────────────────────────────────────────────────────────────
OPENAI_API_KEY=sk-proj-...

# ─── OpenWeatherMap (free tier at openweathermap.org) ───────────────────────
NEXT_PUBLIC_OPENWEATHER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ─── App URL ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** The app works without `OPENAI_API_KEY` and `OPENWEATHER_API_KEY` — it falls back to demo data automatically.

### 3. Database Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `lib/database.sql`
3. In **Authentication → Providers**:
   - Enable **Google** (add Client ID + Secret from [Google Cloud Console](https://console.cloud.google.com))
   - Enable **Email** (OTP / magic link — enabled by default)
4. In **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/api/auth/callback`

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
tripsync/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── layout.tsx                      # Root layout (fonts, providers)
│   ├── not-found.tsx                   # Global 404
│   ├── global-error.tsx                # Global error boundary
│   ├── auth/login/page.tsx             # Google + Email OTP auth
│   ├── join/page.tsx                   # Join trip via invite code
│   ├── dashboard/
│   │   ├── layout.tsx                  # Sidebar + mobile nav + onboarding
│   │   ├── page.tsx                    # Dashboard home (stats + trips)
│   │   ├── trips/page.tsx              # All trips list
│   │   ├── create/page.tsx             # Create trip form
│   │   ├── settings/page.tsx           # Profile + theme + notifications
│   │   ├── upgrade/page.tsx            # Pro upgrade page
│   │   └── referral/page.tsx           # Referral programme
│   ├── trip/[id]/
│   │   ├── page.tsx                    # Trip detail (server, fetches data)
│   │   └── not-found.tsx               # Trip-specific 404
│   └── api/
│       ├── ai/itinerary/route.ts       # GPT-4o-mini itinerary generation
│       ├── ai/summary/route.ts         # AI shareable trip summary
│       ├── weather/route.ts            # OpenWeatherMap proxy
│       └── auth/callback/route.ts      # Supabase OAuth callback
│
├── components/
│   ├── ui/                             # Radix-based primitives
│   │   ├── button.tsx                  # + gradient/ocean variants
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx                   # + success/warning/info variants
│   │   ├── avatar.tsx
│   │   ├── progress.tsx                # Gradient progress bar
│   │   ├── skeleton.tsx
│   │   ├── empty-state.tsx             # Reusable empty state
│   │   └── loading-skeletons.tsx       # Domain-specific skeletons
│   │
│   ├── layout/
│   │   ├── sidebar.tsx                 # Desktop sidebar nav
│   │   ├── dashboard-header.tsx        # Sticky top bar
│   │   ├── mobile-bottom-nav.tsx       # Mobile bottom tabs
│   │   ├── theme-provider.tsx          # next-themes wrapper
│   │   ├── react-query-provider.tsx    # TanStack Query wrapper
│   │   ├── onboarding-dialog.tsx       # First-time user tour
│   │   └── referral-client.tsx         # Referral UI
│   │
│   ├── trips/
│   │   ├── trip-detail-client.tsx      # Tabbed trip page shell
│   │   ├── trip-overview-tab.tsx       # Stats, budget, invite, share
│   │   ├── trip-members-tab.tsx        # Member list + invite panel
│   │   ├── trip-settings-tab.tsx       # Edit / delete trip
│   │   ├── weather-widget.tsx          # Compact + full weather display
│   │   ├── export-pdf-button.tsx       # PDF download button
│   │   └── share-trip-dialog.tsx       # AI summary + share modal
│   │
│   ├── expenses/
│   │   ├── expenses-tab.tsx            # List view + category summary
│   │   ├── add-expense-dialog.tsx      # Add expense with split logic
│   │   └── balance-summary.tsx         # Who owes whom + settle up
│   │
│   ├── itinerary/
│   │   └── itinerary-tab.tsx           # AI generator form + day display
│   │
│   └── votes/
│       └── votes-tab.tsx               # Create + vote + close polls
│
├── lib/
│   ├── utils.ts                        # formatCurrency, dates, helpers
│   ├── actions.ts                      # Next.js Server Actions
│   ├── store.ts                        # Zustand persisted store
│   ├── pdf-export.ts                   # jsPDF trip summary generator
│   ├── database.sql                    # Full Supabase schema + RLS
│   └── supabase/
│       ├── client.ts                   # Browser Supabase client
│       └── server.ts                   # Server Supabase client
│
├── hooks/
│   └── use-trip.ts                     # Realtime trip data + notifications
│
├── types/
│   └── index.ts                        # All TypeScript interfaces
│
├── middleware.ts                       # Auth route protection
├── tailwind.config.ts
├── next.config.ts
├── vercel.json
└── .env.local.example
```

---

## 🗄 Database Schema

```sql
users            -- Extended profiles (linked to auth.users)
trips            -- Trip records with invite codes
trip_members     -- Many-to-many (users ↔ trips) with roles
expenses         -- Per-trip expense records
expense_splits   -- Per-person split amounts + settlement
votes            -- Group polls with JSONB options
vote_responses   -- Individual vote responses
itineraries      -- AI-generated itinerary content (JSONB)
notifications    -- In-app notification feed
```

All tables use **Row Level Security** — only trip members can read/write trip data.

**Auto-triggers:**
- `on_auth_user_created` → creates user profile automatically
- `on_trip_created` → adds creator as `owner` member automatically

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
# 1. Push to GitHub
git push origin feature/tripsync-app

# 2. Import at vercel.com/new
# 3. Add all environment variables in Vercel dashboard
# 4. Update Supabase redirect URLs:
#    Authentication → URL Configuration → add your production domain
```

### Environment Variables on Vercel

Set these in **Settings → Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_OPENWEATHER_API_KEY`
- `NEXT_PUBLIC_APP_URL` → your production URL

---

## 🔑 Third-Party Setup Guides

### Google OAuth
1. [console.cloud.google.com](https://console.cloud.google.com) → New project
2. APIs & Services → Credentials → Create OAuth Client ID → Web Application
3. Authorised redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Copy Client ID + Secret → Supabase Dashboard → Auth → Providers → Google

### OpenWeatherMap (free)
1. Sign up at [openweathermap.org](https://openweathermap.org)
2. API Keys tab → copy your key
3. Add to `.env.local` as `NEXT_PUBLIC_OPENWEATHER_API_KEY`

### OpenAI
1. [platform.openai.com](https://platform.openai.com) → API Keys → Create new
2. Add to `.env.local` as `OPENAI_API_KEY`
3. Recommended model: `gpt-4o-mini` (fast + cheap, set in `app/api/ai/itinerary/route.ts`)

---

## 📜 License

MIT © TripSync
