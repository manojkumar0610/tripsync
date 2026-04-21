"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, Vote, CheckCircle2, X, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface VotesTabProps {
  trip: any;
  votes: any[];
  currentUser: any;
}

export function VotesTab({ trip, votes, currentUser }: VotesTabProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);
  const supabase = createClient();

  const [form, setForm] = useState({
    title: "",
    description: "",
    options: ["", ""],
  });
  const [creating, setCreating] = useState(false);

  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, ""] }));
  const removeOption = (i: number) =>
    setForm((f) => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));
  const updateOption = (i: number, val: string) =>
    setForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? val : o)) }));

  const handleCreateVote = async () => {
    const validOptions = form.options.filter((o) => o.trim());
    if (!form.title || validOptions.length < 2) {
      toast.error("Title and at least 2 options required");
      return;
    }
    setCreating(true);
    try {
      const options = validOptions.map((label, i) => ({
        id: `opt_${i}_${Date.now()}`,
        label,
      }));
      const { error } = await supabase.from("votes").insert({
        trip_id: trip.id,
        title: form.title,
        description: form.description || null,
        options,
        created_by: currentUser.id,
        status: "open",
      });
      if (error) throw error;
      toast.success("Vote created!");
      setShowCreate(false);
      setForm({ title: "", description: "", options: ["", ""] });
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create vote");
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (voteId: string, optionId: string) => {
    setVoting(voteId);
    try {
      // Upsert vote response
      const { error } = await supabase.from("vote_responses").upsert(
        { vote_id: voteId, user_id: currentUser.id, option_id: optionId },
        { onConflict: "vote_id,user_id" }
      );
      if (error) throw error;
      toast.success("Vote recorded!");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to vote");
    } finally {
      setVoting(null);
    }
  };

  const closeVote = async (voteId: string) => {
    const { error } = await supabase
      .from("votes")
      .update({ status: "closed" })
      .eq("id", voteId);
    if (error) toast.error("Failed to close vote");
    else { toast.success("Vote closed"); window.location.reload(); }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button variant="gradient" size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
          <PlusCircle size={16} /> Create Vote
        </Button>
      </div>

      {votes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="rounded-full bg-muted p-4">
              <Vote size={28} className="text-muted-foreground" />
            </div>
            <p className="font-semibold">No votes yet</p>
            <p className="text-sm text-muted-foreground">
              Create a vote to get the group's opinion on dates, hotels, or activities
            </p>
            <Button variant="gradient" size="sm" onClick={() => setShowCreate(true)}>
              Create First Vote
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {votes.map((vote: any) => {
            const userResponse = vote.responses?.find(
              (r: any) => r.user_id === currentUser?.id
            );
            const totalVotes = vote.responses?.length ?? 0;
            const isOwner = vote.created_by === currentUser?.id;

            return (
              <Card key={vote.id} className={cn(
                "transition-all",
                vote.status === "closed" && "opacity-75"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{vote.title}</CardTitle>
                      {vote.description && (
                        <p className="text-sm text-muted-foreground mt-1">{vote.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={vote.status === "open" ? "success" : "secondary"} className="capitalize">
                        {vote.status}
                      </Badge>
                      {isOwner && vote.status === "open" && (
                        <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => closeVote(vote.id)}>
                          Close
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalVotes} vote{totalVotes !== 1 ? "s" : ""} · {formatRelativeTime(vote.created_at)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {vote.options?.map((option: any) => {
                    const optVotes = vote.responses?.filter(
                      (r: any) => r.option_id === option.id
                    ).length ?? 0;
                    const pct = totalVotes > 0 ? (optVotes / totalVotes) * 100 : 0;
                    const isSelected = userResponse?.option_id === option.id;
                    const isLeading = optVotes === Math.max(
                      ...(vote.options ?? []).map((o: any) =>
                        vote.responses?.filter((r: any) => r.option_id === o.id).length ?? 0
                      )
                    ) && optVotes > 0;

                    return (
                      <button
                        key={option.id}
                        onClick={() =>
                          vote.status === "open" && handleVote(vote.id, option.id)
                        }
                        disabled={vote.status !== "open" || voting === vote.id}
                        className={cn(
                          "w-full text-left rounded-xl border p-3 transition-all",
                          vote.status === "open" && "hover:border-blue-300 cursor-pointer",
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                            : "border-border",
                          vote.status === "closed" && "cursor-default"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                            )}
                            <span className="text-sm font-medium">{option.label}</span>
                            {isLeading && totalVotes > 0 && (
                              <Badge variant="success" className="text-[10px] h-4">Leading</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            {optVotes} · {pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {/* Voters avatars */}
                        {vote.responses?.filter((r: any) => r.option_id === option.id).length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5">
                            {vote.responses
                              .filter((r: any) => r.option_id === option.id)
                              .slice(0, 5)
                              .map((r: any) => (
                                <Avatar key={r.id} className="h-5 w-5 border border-background">
                                  <AvatarImage src={r.user?.avatar_url ?? ""} />
                                  <AvatarFallback className="text-[8px]">
                                    {getInitials(r.user?.full_name ?? r.user?.email ?? "?")}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Vote Dialog */}
      <Dialog open={showCreate} onOpenChange={(o) => !o && setShowCreate(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Vote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Question *</Label>
              <Input
                placeholder="e.g. Which hotel should we book?"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Add more context..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="resize-none min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Options *</Label>
              {form.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                  />
                  {form.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeOption(i)}
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 w-full"
                onClick={addOption}
                disabled={form.options.length >= 6}
              >
                <Plus size={14} /> Add Option
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleCreateVote} disabled={creating} className="gap-2">
              {creating && <Loader2 size={14} className="animate-spin" />}
              Create Vote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
