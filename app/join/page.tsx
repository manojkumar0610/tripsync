"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plane, MapPin, Users, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate, getTripTypeEmoji } from "@/lib/utils";

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const codeFromUrl = searchParams.get("code") ?? "";
  const [code, setCode] = useState(codeFromUrl);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    if (codeFromUrl) lookup(codeFromUrl);
  }, [codeFromUrl]);

  const lookup = async (c: string) => {
    if (c.length < 6) return;
    setLoading(true);
    const { data } = await supabase.from("trips").select("*, trip_members(count)").eq("invite_code", c.toUpperCase().trim()).maybeSingle();
    if (data) setTrip(data); else toast.error("Invalid invite code");
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!user) { router.push(`/auth/login?redirectTo=/join?code=${code}`); return; }
    setJoining(true);
    try {
      const { data: existing } = await supabase.from("trip_members").select("id").eq("trip_id", trip.id).eq("user_id", user.id).maybeSingle();
      if (existing) { toast.info("Already a member!"); router.push(`/trip/${trip.id}`); return; }
      const { error } = await supabase.from("trip_members").insert({ trip_id: trip.id, user_id: user.id, role: "member" });
      if (error) throw error;
      toast.success("🎉 Joined the trip!");
      router.push(`/trip/${trip.id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to join");
    } finally { setJoining(false); }
  };

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/25">
            <Plane className="w-5 h-5 text-white rotate-45" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Join a Trip</h1>
          <p className="text-white/35 text-sm">Enter your 6-letter invite code</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-5">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="flex-1 h-14 bg-white/[0.04] border border-white/[0.08] rounded-xl text-center text-2xl font-bold tracking-[0.3em] text-white placeholder:text-white/15 outline-none focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all uppercase"
            />
            <button
              onClick={() => lookup(code)}
              disabled={loading || code.length < 6}
              className="w-14 h-14 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          </div>

          {trip && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="bg-gradient-to-br from-blue-600/20 to-violet-600/20 p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-2xl shrink-0">
                  {getTripTypeEmoji(trip.trip_type)}
                </div>
                <div>
                  <p className="font-semibold text-white">{trip.title}</p>
                  <p className="text-xs text-white/50 flex items-center gap-1"><MapPin className="w-3 h-3" />{trip.destination}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-px bg-white/[0.04] p-px">
                <div className="bg-[#0d0d14] px-4 py-3">
                  <p className="text-[10px] text-white/30 mb-0.5">Dates</p>
                  <p className="text-xs font-medium text-white/70">{formatDate(trip.start_date)}</p>
                </div>
                <div className="bg-[#0d0d14] px-4 py-3">
                  <p className="text-[10px] text-white/30 mb-0.5">Members</p>
                  <p className="text-xs font-medium text-white/70 flex items-center gap-1"><Users className="w-3 h-3" />{trip.trip_members?.[0]?.count ?? 1}</p>
                </div>
              </div>
              <div className="p-4">
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="btn-glow w-full h-11 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{user ? "Join Trip 🎉" : "Sign In to Join"} <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#080810] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}><JoinContent /></Suspense>;
}
