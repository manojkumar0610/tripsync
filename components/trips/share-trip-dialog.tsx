"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Share2, Sparkles, Copy, Check, Loader2, ExternalLink, Link2
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, getTripTypeEmoji, formatCurrency } from "@/lib/utils";

interface ShareTripDialogProps {
  trip: any;
  members: any[];
  expenses: any[];
  open: boolean;
  onClose: () => void;
}

export function ShareTripDialog({
  trip, members, expenses, open, onClose,
}: ShareTripDialogProps) {
  const [summary, setSummary] = useState<{ summary: string; hashtags: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalSpent = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join?code=${trip.invite_code}`;

  const generateSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trip_id: trip.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSummary(data);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const text = summary
      ? `${summary.summary} ${summary.hashtags.join(" ")} via @TripSync`
      : `Planning an amazing trip to ${trip.destination} with TripSync! ✈️ #TripSync`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 size={18} className="text-blue-600" /> Share Trip
          </DialogTitle>
        </DialogHeader>

        {/* Trip Card Preview */}
        <div className="rounded-2xl overflow-hidden border">
          <div className="bg-gradient-to-br from-blue-600 to-violet-700 p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{getTripTypeEmoji(trip.trip_type)}</span>
              <div>
                <h3 className="font-syne font-bold text-lg">{trip.title}</h3>
                <p className="text-white/80 text-sm">{trip.destination}</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs text-white/70 mt-2">
              <span>📅 {formatDate(trip.start_date)}</span>
              <span>👥 {members.length} members</span>
              {totalSpent > 0 && <span>💰 {formatCurrency(totalSpent)}</span>}
            </div>
          </div>

          {/* AI Summary */}
          <div className="p-4 bg-muted/30">
            {summary ? (
              <div className="space-y-2">
                <p className="text-sm leading-relaxed">{summary.summary}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {summary.hashtags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Generate an AI-powered trip summary to share
                </p>
                <Button
                  size="sm"
                  variant="gradient"
                  className="gap-2"
                  onClick={generateSummary}
                  disabled={loading}
                >
                  {loading
                    ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
                    : <><Sparkles size={13} /> Generate Summary</>}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Share Actions */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Share Options</p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={copyInviteLink}
            >
              {copied
                ? <><Check size={14} className="text-emerald-600" /> Copied!</>
                : <><Link2 size={14} /> Copy Invite Link</>}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-sky-600 border-sky-200 hover:bg-sky-50 dark:border-sky-900/30 dark:hover:bg-sky-950/30"
              onClick={shareToTwitter}
            >
              <ExternalLink size={14} /> Share on X
            </Button>
          </div>

          <div className="rounded-xl border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground mb-1">Join Code</p>
            <p className="font-syne text-2xl font-bold tracking-[0.2em] text-blue-600">
              {trip.invite_code}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
