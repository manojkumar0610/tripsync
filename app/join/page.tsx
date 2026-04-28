"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plane, Users, MapPin, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { formatDate, getTripTypeEmoji } from "@/lib/utils";

function JoinTripContent() {
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
    if (codeFromUrl) lookupTrip(codeFromUrl);
  }, [codeFromUrl]);

  const lookupTrip = async (inviteCode: string) => {
    if (!inviteCode.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("trips")
      .select("*, trip_members(count)")
      .eq("invite_code", inviteCode.toUpperCase().trim())
      .single();

    if (error || !data) {
      toast.error("Invalid invite code. Please check and try again.");
      setTrip(null);
    } else {
      setTrip(data);
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!user) {
      router.push(`/auth/login?redirectTo=/join?code=${code}`);
      return;
    }

    setJoining(true);
    try {
      // Check if already a member
      const { data: existing } = await supabase
        .from("trip_members")
        .select("id")
        .eq("trip_id", trip.id)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        toast.info("You're already a member of this trip!");
        router.push(`/trip/${trip.id}`);
        return;
      }

      const { error } = await supabase.from("trip_members").insert({
        trip_id: trip.id,
        user_id: user.id,
        role: "member",
      });

      if (error) throw error;

      toast.success("🎉 You've joined the trip!");
      router.push(`/trip/${trip.id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to join trip");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-2xl mb-4">
            <Plane className="text-white rotate-45" size={24} />
          </div>
          <h1 className="font-syne text-3xl font-bold text-white">Join a Trip</h1>
          <p className="text-blue-200/70 mt-1 text-sm">Enter your invite code below</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl space-y-6">
          {/* Code input */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter 6-letter code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="h-14 text-center text-2xl font-mono font-bold tracking-[0.3em] bg-white/10 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-400 uppercase"
                maxLength={6}
              />
              <Button
                onClick={() => lookupTrip(code)}
                disabled={loading || code.length < 6}
                className="h-14 w-14 bg-blue-600 hover:bg-blue-700 shrink-0"
                size="icon"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              </Button>
            </div>
          </div>

          {/* Trip preview */}
          {trip && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                  {getTripTypeEmoji(trip.trip_type)}
                </div>
                <div>
                  <p className="font-syne font-bold text-white">{trip.title}</p>
                  <p className="text-sm text-blue-200/70 flex items-center gap-1">
                    <MapPin size={12} /> {trip.destination}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-white/5 p-2.5">
                  <p className="text-blue-200/50 text-xs mb-0.5">Dates</p>
                  <p className="text-white font-medium text-xs">
                    {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
                  </p>
                </div>
                <div className="rounded-lg bg-white/5 p-2.5">
                  <p className="text-blue-200/50 text-xs mb-0.5">Members</p>
                  <p className="text-white font-medium flex items-center gap-1">
                    <Users size={12} />
                    {trip.trip_members?.[0]?.count ?? 1} people
                  </p>
                </div>
              </div>

              <Button
                onClick={handleJoin}
                disabled={joining}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-violet-600 hover:opacity-90 text-white font-medium gap-2 border-0"
              >
                {joining ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {user ? "Join Trip 🎉" : "Sign In to Join"}
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinTripContent />
    </Suspense>
  );
}
